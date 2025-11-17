import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../services/creatorService';
import { CourseCreateDto } from '../models/creator.models';
import { CourseLevel } from '../models/enums';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

const CourseCreatePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<CourseLevel>(CourseLevel.Beginner);
  const [categoryId, setCategoryId] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const dto: CourseCreateDto = {
        title,
        description,
        level,
        categoryId
    };

    try {
      const newCourse = await createCourse(dto);
      navigate(`/instructor/course/${newCourse.id}/edit`);
    } catch (err) {
      setError('Помилка cтворення курсу.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 8 }}>
        <Typography component="h1" variant="h5">
          Створити Новий Курс
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        
        <TextField
          margin="normal" required fullWidth label="Назва Курсу"
          value={title} onChange={(e) => setTitle(e.target.value)}
        />
        
        <TextField
          margin="normal" fullWidth label="Опис" multiline rows={4}
          value={description} onChange={(e) => setDescription(e.target.value)}
        />
        
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Рівень</InputLabel>
          <Select
            value={level}
            label="Рівень"
            onChange={(e) => setLevel(e.target.value as CourseLevel)}
          >
            <MenuItem value={CourseLevel.Beginner}>Beginner</MenuItem>
            <MenuItem value={CourseLevel.Intermediate}>Intermediate</MenuItem>
            <MenuItem value={CourseLevel.Advanced}>Advanced</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          margin="normal" required fullWidth label="ID Категорії (Заглушка)" type="number"
          value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}
        />

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Створити
        </Button>
      </Box>
    </Container>
  );
};

export default CourseCreatePage;