import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../utils/api';

const FileDownload = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFileInfo();
  }, [fileId]);

  const fetchFileInfo = async () => {
    try {
      const response = await api.get(`/files/info/${fileId}`);
      setFile(response.data);
    } catch (error) {
      setError('File not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!decryptionKey.trim()) {
      setError('Please enter the decryption key');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      const response = await api.post(`/files/download/${fileId}`, {
        decryptionKey
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('File downloaded successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error downloading file. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!file) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">File not found or access denied</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Secure File Download
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="textSecondary">
              <strong>File:</strong> {file.originalName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>From:</strong> {file.sender?.name || 'Unknown'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleDownload}>
            <TextField
              fullWidth
              label="Decryption Key"
              variant="outlined"
              value={decryptionKey}
              onChange={(e) => setDecryptionKey(e.target.value)}
              placeholder="Enter the decryption key from your email"
              disabled={downloading}
              sx={{ mb: 3 }}
              helperText="You received this key in your email notification"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={downloading || !decryptionKey.trim()}
              startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
              size="large"
            >
              {downloading ? 'Downloading...' : 'Download File'}
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              ⚠️ This file will be deleted after {file.maxAttempts - file.downloadAttempts} more failed attempts
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              📅 File expires: {new Date(file.expiresAt).toLocaleString()}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default FileDownload;
