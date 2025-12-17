import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetails } from '../services/learningService';
import { Box, CircularProgress } from '@mui/material';

const CoursePlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToFirstLesson = async () => {
      if (!id) return;
      try {
        const courseDetails = await getCourseDetails(Number(id));
        // Navigate to the first lesson of the course
        if (courseDetails.modules && courseDetails.modules.length > 0) {
          const firstLesson = courseDetails.modules[0].lessons[0];
          if (firstLesson) {
            navigate(`/my-courses/${id}/lesson/${firstLesson.id}`);
          }
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        // Fallback navigation
        navigate('/my-courses');
      }
    };
    redirectToFirstLesson();
  }, [id, navigate]);

  // Show loading while redirecting
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f7f7f7',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default CoursePlayerPage;