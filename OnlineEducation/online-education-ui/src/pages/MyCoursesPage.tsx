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
  Grid,
  Box,
} from '@mui/material';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getMyCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching my courses:', error);
      }
    };
    fetchCourses();
  }, []);

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Мої Курси
      </Typography>
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Box
            key={course.id}
            sx={{
              width: '100%',
              xs: 1,
              sm: 1/2,
              md: 1/3,
              padding: (theme) => theme.spacing(2), 
            }}
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
                  to={`/player/${course.id}`}
                >
                  Продовжити
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Grid>
    </Container>
  );
};

export default MyCoursesPage;