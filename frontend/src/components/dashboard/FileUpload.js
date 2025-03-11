import React, { useState, useContext } from 'react';
import { AlertContext } from '../../context/alert/alertContext';
import { uploadFile } from '../../utils/api';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Input,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const { setAlert } = useContext(AlertContext);

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setAlert('File size should be less than 10MB', 'error');
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setAlert('Please select a file', 'error');
      return;
    }

    if (!recipientEmail) {
      setAlert('Please enter recipient email', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiverEmail', recipientEmail);

      const response = await uploadFile(formData);

      if (response && response.data) {
        setAlert('File uploaded and shared successfully', 'success');
        setFile(null);
        setRecipientEmail('');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setAlert(error.message || 'Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Share a File
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Recipient Email"
          name="email"
          autoComplete="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          disabled={uploading}
        />
        <Box sx={{ mt: 2, mb: 2 }}>
          <Input
            type="file"
            onChange={onFileChange}
            sx={{ display: 'none' }}
            id="file-input"
            disabled={uploading}
          />
          <label htmlFor="file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
              fullWidth
            >
              {file ? file.name : 'Choose File'}
            </Button>
          </label>
        </Box>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={!file || !recipientEmail || uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Upload & Share'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default FileUpload; 