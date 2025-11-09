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
  Grid, // Ми все ще використовуємо <Grid container>
  Box,  // <-- АЛЕ <Box> для "item"
} from '@mui/material';

const CourseCatalogPage = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Каталог Курсів
      </Typography>
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Box
            key={course.id}
            sx={{
              width: '100%', // База
              xs: 1, // для xs (mobile) - 1 колонка
              sm: 1/2, // для sm (tablet) - 2 колонки
              md: 1/3, // для md (desktop) - 3 колонки
              padding: (theme) => theme.spacing(2), // Емуляція 'spacing'
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5">{course.title}</Typography>
                <Typography color="textSecondary">{course.level}</Typography>
                <Typography>{course.description}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={`/courses/${course.id}`}
                >
                  Детальніше
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Grid>
    </Container>
  );
};

export default CourseCatalogPage;