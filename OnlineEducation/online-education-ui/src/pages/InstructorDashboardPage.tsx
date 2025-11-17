import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseDto } from '../models/course.models';
import { getMyCreatedCourses } from '../services/creatorService';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
} from '@mui/material';

const InstructorDashboardPage = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getMyCreatedCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching my courses:', error);
      }
    };
    fetchCourses();
  }, []);

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Мої Створені Курси
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/instructor/course/new">
          + Створити Курс
        </Button>
      </Box>
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Box
            key={course.id}
            sx={{ width: '100%', xs: 1, sm: 1/2, md: 1/3, padding: (theme) => theme.spacing(2) }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5">{course.title}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={`/instructor/course/${course.id}/edit`}
                >
                  Керувати
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Grid>
    </Container>
  );
};

export default InstructorDashboardPage;