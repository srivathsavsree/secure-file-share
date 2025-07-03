import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, { email });
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" gutterBottom>Forgot Password</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>
        <form onSubmit={onSubmit}>
          <TextField
            fullWidth
            required
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !email}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </form>
        {message && <Typography color="success.main" sx={{ mt: 2 }}>{message}</Typography>}
        {error && <Typography color="error.main" sx={{ mt: 2 }}>{error}</Typography>}
      </Paper>
    </Box>
  );
};

export default ForgotPassword; 