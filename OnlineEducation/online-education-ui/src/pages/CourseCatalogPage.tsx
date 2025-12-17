import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseDto } from '../models/course.models';
import { getCourses } from '../services/courseService';
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

const CourseCatalogPage = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        setError('Failed to load courses');
        console.error('Error fetching courses:', err);
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
            mb: 2,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          Explore Our Courses
        </Typography>
        <Typography color="textSecondary" sx={{ fontSize: '1.1rem' }}>
          Choose from {courses.length} professional courses
        </Typography>
      </Box>

      {courses.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6" color="textSecondary">
            No courses available yet.
          </Typography>
        </Box>
      ) : (
        <Box
          className="course-grid"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
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
                cursor: 'pointer',
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
                  fontSize: '2rem',
                  overflow: 'hidden',
                }}
              >
                {course.title.charAt(0).toUpperCase()}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {course.title}
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {course.description?.substring(0, 80)}...
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    backgroundColor: '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  {course.level}
                </Typography>
              </CardContent>
              <CardActions sx={{ pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  component={Link}
                  to={`/courses/${course.id}`}
                  sx={{
                    backgroundColor: '#a435f0',
                    color: 'white',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#942fb8',
                    },
                  }}
                >
                  View Course
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default CourseCatalogPage;