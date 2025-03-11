import React, { useContext } from 'react';
import { AlertContext } from '../../context/alert/alertContext';
import { Alert, Stack } from '@mui/material';

const Alerts = () => {
  const { alerts } = useContext(AlertContext);

  return (
    <Stack spacing={2} sx={{ width: '100%', mb: 2 }}>
      {alerts.length > 0 && 
        alerts.map(alert => (
          <Alert key={alert.id} severity={alert.type}>
            {alert.msg}
          </Alert>
        ))
      }
    </Stack>
  );
};

export default Alerts;