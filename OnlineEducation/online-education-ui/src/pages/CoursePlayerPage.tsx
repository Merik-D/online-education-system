import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MyCourseDetailsDto } from '../models/learning.models';
import { getCourseDetails } from '../services/learningService';
import { Container, Typography, CircularProgress, Alert, Box, List, ListItem, ListItemText, ListItemButton } from '@mui/material'; // <-- 2. ListItemButton
import { LessonType } from '../models/enums';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import DescriptionIcon from '@mui/icons-material/Description';

const CoursePlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<MyCourseDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getCourseDetails(Number(id));
        setCourse(data);
      } catch (err) {
        setError('Error fetching course details.');
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
      <Typography variant="h5">Прогрес: {course.progress.toFixed(0)}%</Typography>
      
      <Box sx={{ mt: 4 }}>
        {course.modules.map((module) => (
          <Box key={module.id} sx={{ mb: 3 }}>
            <Typography variant="h5">{module.title}</Typography>
            <List>
              {module.lessons.map((lesson) => (
                <ListItemButton 
                  key={lesson.id} 
                  component={Link} 
                  to={`/lesson/${lesson.id}`}
                >
                  {lesson.type === LessonType.Video ? <OndemandVideoIcon sx={{mr: 2}} /> : <DescriptionIcon sx={{mr: 2}} />}
                  <ListItemText 
                    primary={lesson.title} 
                    secondary={lesson.type === LessonType.Video ? 'Відео Урок' : 'Текстовий Урок'} 
                  />
                </ListItemButton>
              ))}
              <ListItemButton component={Link} to={`/test/1`}>
                 <FitnessCenterIcon sx={{mr: 2}} />
                 <ListItemText primary="Пройти Тест" sx={{color: 'blue'}} />
              </ListItemButton>
            </List>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default CoursePlayerPage;