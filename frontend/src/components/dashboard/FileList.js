import React, { useState, useEffect, useContext } from 'react';
import { AlertContext } from '../../context/alert/alertContext';
import api from '../../utils/api';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

const FileList = () => {
  const [tab, setTab] = useState(0);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setAlert } = useContext(AlertContext);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      // Fetch shared files
      const sharedResponse = await api.get('/files/shared');
      // Fetch received files
      const receivedResponse = await api.get('/files/received');

      setSharedFiles(sharedResponse.data);
      setReceivedFiles(receivedResponse.data);
    } catch (error) {
      setAlert(error.response?.data?.message || 'Error fetching files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const decryptionKey = prompt('Please enter the decryption key:');
      if (!decryptionKey) return;

      const response = await api.post(`/files/download/${fileId}`, { decryptionKey }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers['content-disposition']?.split('filename=')[1] || 'downloaded-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setAlert('File downloaded successfully', 'success');
    } catch (error) {
      setAlert(error.response?.data?.message || 'Error downloading file', 'error');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await api.delete(`/files/${fileId}`);
      setSharedFiles(sharedFiles.filter(file => file._id !== fileId));
      setAlert('File deleted successfully', 'success');
    } catch (error) {
      setAlert(error.response?.data?.message || 'Error deleting file', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Shared Files" />
          <Tab label="Received Files" />
        </Tabs>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>{tab === 0 ? 'Shared With' : 'Shared By'}</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(tab === 0 ? sharedFiles : receivedFiles).map((file) => (
              <TableRow key={file._id}>
                <TableCell>{file.originalName}</TableCell>
                <TableCell>
                  {tab === 0 ? file.receiver?.email : file.sender?.email}
                </TableCell>
                <TableCell>
                  {new Date(file.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  {tab === 0 ? (
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(file._id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  ) : (
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(file._id)}
                      color="primary"
                    >
                      Download
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(tab === 0 ? sharedFiles : receivedFiles).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No files found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default FileList; 