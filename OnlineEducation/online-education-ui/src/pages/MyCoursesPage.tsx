import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseDto } from '../models/course.models';
import { getMyCourses } from '../services/learningService';
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
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getMyCourses();
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
              key={course.id}
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {course.title}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  component={Link}
                  to={`/my-courses/${course.id}`}
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
                  Continue
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