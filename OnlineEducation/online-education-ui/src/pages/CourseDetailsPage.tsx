import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CourseDto } from '../models/course.models';
import { getCourseById } from '../services/courseService';
import { enrollInCourse } from '../services/learningService';
import { getMyCourses } from '../services/learningService';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
} from '@mui/material';

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { auth, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isStudent = auth?.roles.includes('Student') ?? false;

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        setSuccess('');

        const courseData = await getCourseById(Number(id));
        setCourse(courseData);

        if (isLoggedIn()) {
          const myCoursesData = await getMyCourses();
          const enrolled = myCoursesData.some(
            (myCourse) => myCourse.id === Number(id)
          );
          setIsEnrolled(enrolled);
        }

      } catch (err) {
        setError('Error fetching course details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id, isLoggedIn]);

  const handleEnroll = async () => {
    if (!id) return;
    setError('');
    setSuccess('');
    try {
      await enrollInCourse(Number(id));
      setSuccess('Ви успішно записалися на курс! Переходимо...');
      setIsEnrolled(true);
      setTimeout(() => {
        navigate('/my-courses');
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Помилка при записі на курс.');
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error && !success) return <Alert severity="error">{error}</Alert>;
  if (!course) return <Typography>Курс не знайдено.</Typography>;

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        {course.title}
      </Typography>
      <Typography variant="h5" color="textSecondary">
        Рівень: {course.level}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {course.description}
      </Typography>

      {isLoggedIn() && isStudent && (
        <Box sx={{ mt: 4 }}>
          {isEnrolled ? (
            <Button
              variant="contained"
              color="success"
              size="large"
              component={Link}
              to={`/player/${course.id}`}
            >
              Перейти до навчання
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleEnroll}
            >
              Записатися на курс
            </Button>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Box>
      )}
    </Container>
  );
};

export default CourseDetailsPage;