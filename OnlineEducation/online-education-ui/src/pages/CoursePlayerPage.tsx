import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetails } from '../services/learningService';
import { Box, CircularProgress, Container, Typography, Button, Alert } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
const CoursePlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const redirectToFirstLesson = async () => {
      if (!id) return;
      try {
        const courseDetails = await getCourseDetails(Number(id));
        if (!courseDetails.modules || courseDetails.modules.length === 0) {
          setError('This course does not have any content yet. Please check back later.');
          return;
        }
        const hasLessons = courseDetails.modules.some(m => m.lessons && m.lessons.length > 0);
        if (!hasLessons) {
          setError('This course does not have any lessons yet. The instructor is still preparing the content.');
          return;
        }
        let targetLesson = null;
        for (const module of courseDetails.modules) {
          if (module.lessons && module.lessons.length > 0) {
            const uncompletedLesson = module.lessons.find(l => !l.isCompleted);
            if (uncompletedLesson) {
              targetLesson = uncompletedLesson;
              break;
            }
          }
        }
        if (!targetLesson) {
          for (const module of courseDetails.modules) {
            if (module.lessons && module.lessons.length > 0) {
              targetLesson = module.lessons[0];
              break;
            }
          }
        }
        if (targetLesson) {
          navigate(`/my-courses/${id}/lesson/${targetLesson.id}`);
        } else {
          setError('Unable to find any lessons in this course.');
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. Please try again.');
      }
    };
    redirectToFirstLesson();
  }, [id, navigate]);
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: 80, color: '#a435f0', mb: 3 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Course Not Ready
          </Typography>
          <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/my-courses')}
            sx={{
              backgroundColor: '#a435f0',
              '&:hover': { backgroundColor: '#942fb8' },
              px: 4,
            }}
          >
            Back to My Courses
          </Button>
        </Box>
      </Container>
    );
  }
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