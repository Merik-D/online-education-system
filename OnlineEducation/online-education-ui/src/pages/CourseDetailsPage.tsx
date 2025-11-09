import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CourseDto } from '../models/course.models';
import { getCourseById } from '../services/courseService';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';

const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getCourseById(Number(id));
        setCourse(data);
      } catch (err) {
        setError('Error fetching course details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
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
    </Container>
  );
};

export default CourseDetailsPage;