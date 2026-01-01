import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MyCourseDetailsDto } from '../models/learning.models';
import { getMyCoursesWithProgress } from '../services/learningService';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
const MyCoursesPage = () => {
  const [courses, setCourses] = useState<MyCourseDetailsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getMyCoursesWithProgress();
        setCourses(data);
      } catch (err) {
        setError('Failed to load your courses');
        console.error('Error fetching my courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);
  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          My Learning
        </Typography>
        <Typography color="textSecondary">
          {courses.length} courses enrolled
        </Typography>
      </Box>
      {courses.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            You haven't enrolled in any courses yet
          </Typography>
          <Button
            component={Link}
            to="/courses"
            variant="contained"
            sx={{
              backgroundColor: '#a435f0',
              '&:hover': { backgroundColor: '#942fb8' },
            }}
          >
            Browse Courses
          </Button>
        </Box>
      ) : (
        <Box
          className="course-grid"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {courses.map((course) => (
            <Card
              key={course.courseId}
              className="course-card"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                className="course-card-image"
                sx={{
                  backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '3rem',
                  position: 'relative',
                }}
              >
                {course.title.charAt(0).toUpperCase()}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {course.title}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      {course.completedLessonsCount} of {course.totalLessonsCount} lessons
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: course.progress === 100 ? '#10b981' : '#a435f0' }}>
                      {Math.round(course.progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: course.progress === 100 ? '#10b981' : '#a435f0',
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
                {course.progress === 100 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981' }}>
                    <CheckCircleIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Completed
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  component={Link}
                  to={`/my-courses/${course.courseId}`}
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    backgroundColor: '#a435f0',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#942fb8',
                    },
                  }}
                >
                  {course.progress === 0 ? 'Start Course' : course.progress === 100 ? 'Review' : 'Continue'}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};
export default MyCoursesPage;