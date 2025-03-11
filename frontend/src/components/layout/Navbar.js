import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AuthContext } from '../../context/auth/authContext';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = authContext;

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body1" sx={{ mr: 2 }}>
        Welcome, {user && user.name}
      </Typography>
      <Button
        color="inherit"
        component={RouterLink}
        to="/dashboard"
        startIcon={<CloudUploadIcon />}
      >
        Dashboard
      </Button>
      <Button color="inherit" onClick={onLogout}>
        Logout
      </Button>
    </Box>
  );

  const guestLinks = (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button color="inherit" component={RouterLink} to="/register">
        Register
      </Button>
      <Button color="inherit" component={RouterLink} to="/login">
        Login
      </Button>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            Secure File Share
          </Typography>
          <Button color="inherit" component={RouterLink} to="/about" sx={{ mr: 2 }}>
            About
          </Button>
          {isAuthenticated ? authLinks : guestLinks}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;