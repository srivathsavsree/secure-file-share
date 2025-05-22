import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ background: '#f7f9fb', minHeight: '100vh', pb: 8 }}>
      {/* About Section */}
      <Box sx={{ textAlign: 'center', mt: 6, mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
           Secure File Share
        </Typography>
        <Typography variant="h5" sx={{ color: '#374151', mb: 5, maxWidth: 800, mx: 'auto' }}>
          Secure File Share provides end-to-end encrypted file sharing to ensure your data remains private and secure.
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
              <LockIcon sx={{ fontSize: 50, color: '#2563eb', mb: 2, bgcolor: '#e8f0fe', borderRadius: '50%', p: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                End-to-End Encryption
              </Typography>
              <Typography sx={{ color: '#374151', mt: 1 }}>
                Your files are encrypted before transmission and only decrypted by the recipient
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 50, color: '#2563eb', mb: 2, bgcolor: '#e8f0fe', borderRadius: '50%', p: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Self-Destructing Files
              </Typography>
              <Typography sx={{ color: '#374151', mt: 1 }}>
                Files automatically delete after being downloaded or reaching expiration
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 50, color: '#2563eb', mb: 2, bgcolor: '#e8f0fe', borderRadius: '50%', p: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Secure Sharing
              </Typography>
              <Typography sx={{ color: '#374151', mt: 1 }}>
                Generate secure links to share your files with anyone safely
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 8, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          How It Works
        </Typography>
        <Typography sx={{ color: '#222', mb: 2 }}>
          Secure File Share uses advanced encryption algorithms to protect your files during transit and storage. When you upload a file to share, we:
        </Typography>
        <Box component="ol" sx={{ color: '#222', pl: 4, mb: 4 }}>
          <li>Encrypt your file with a unique encryption key</li>
          <li>Send a secure link to your recipient via email</li>
          <li>Separately send the decryption key to ensure maximum security</li>
          <li>Allow the recipient to download and decrypt the file</li>
          <li>Automatically delete the file after download or expiration</li>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 6, mb: 2 }}>
          Our Commitment to Privacy
        </Typography>
        <Typography sx={{ color: '#222' }}>
          We designed Secure File Share with privacy as the top priority. We do not have access to your encryption keys, meaning even we cannot access your files. Your data remains private and secure at all times.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;