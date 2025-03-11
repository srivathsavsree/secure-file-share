import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../../context/auth/authContext';
import FileUpload from './FileUpload';
import FileList from './FileList';
import { Box, Typography, Container, Grid } from '@mui/material';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const { user, loadUser } = authContext;

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome {user && user.name}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FileUpload />
          </Grid>
          <Grid item xs={12}>
            <FileList />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
