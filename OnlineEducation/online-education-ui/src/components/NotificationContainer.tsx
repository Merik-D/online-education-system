import React from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Stack,
} from '@mui/material';
import { useNotifications } from '../context/NotificationContext';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 400,
      }}
    >
      <Stack spacing={2}>
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            autoHideDuration={6000}
            onClose={() => removeNotification(notification.id)}
            open={true}
          >
            <Alert
              onClose={() => removeNotification(notification.id)}
              severity={
                notification.type === 'success'
                  ? 'success'
                  : notification.type === 'error'
                  ? 'error'
                  : notification.type === 'warning'
                  ? 'warning'
                  : 'info'
              }
              variant="filled"
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </Box>
  );
};
