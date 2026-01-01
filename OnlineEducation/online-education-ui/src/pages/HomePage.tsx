import React from 'react';
import { Typography, Container, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const HomePage = () => {
  const { auth } = useAuth();
  return (
    <Box>
      {}
      <Box
        sx={{
          backgroundColor: '#1f1f1f',
          color: 'white',
          py: { xs: 6, md: 10 },
          px: 2,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3.5rem' },
              mb: 2,
              letterSpacing: '-1px',
            }}
          >
            Learning Platform
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              fontSize: '1.25rem',
              fontWeight: 400,
              color: '#ccc',
            }}
          >
            {auth ? `Welcome back, ${auth.fullName}!` : 'Start Learning Today'}
          </Typography>
          <Typography
            sx={{
              mb: 4,
              fontSize: '1rem',
              color: '#aaa',
              maxWidth: '500px',
              mx: 'auto',
            }}
          >
            Choose from thousands of courses and learn from industry experts at your own pace.
          </Typography>
          <Button
            component={Link}
            to="/courses"
            variant="contained"
            sx={{
              backgroundColor: '#a435f0',
              color: 'white',
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#942fb8',
              },
            }}
          >
            Explore Courses
          </Button>
        </Container>
      </Box>
    </Box>
  );
};
export default HomePage;