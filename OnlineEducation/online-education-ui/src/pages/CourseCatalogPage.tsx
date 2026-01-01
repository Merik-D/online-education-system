import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseDto } from '../models/course.models';
import { getCourses, searchCourses } from '../services/courseService';
import { getCategories } from '../services/categoryService';
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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Pagination,
  Grid,
  Paper,
  Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
interface Category {
  id: number;
  name: string;
  description?: string;
}
const CourseCatalogPage = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const result = await searchCourses({
          searchTerm: searchTerm || undefined,
          categoryId: selectedCategory || undefined,
          level: selectedLevel !== '' ? Number(selectedLevel) : undefined,
          sortBy,
          isDescending: sortBy === 'newest' || sortBy === 'rating',
          pageNumber: currentPage,
          pageSize,
        });
        setCourses(result.courses);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError('Failed to load courses');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedCategory, selectedLevel, sortBy, currentPage]);
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSortBy('newest');
    setCurrentPage(1);
  };
  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0: return 'Beginner';
      case 1: return 'Intermediate';
      case 2: return 'Advanced';
      default: return 'Unknown';
    }
  };
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          📚 Каталог курсів
        </Typography>
        <Typography color="textSecondary">
          Знайдіть ідеальний курс для ваших цілей
        </Typography>
      </Box>
      {}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2, alignItems: 'center' }}>
          {}
          <TextField
            fullWidth
            placeholder="Пошук курсів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {}
          <FormControl fullWidth>
            <InputLabel>Категорія</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as number | '')}
              label="Категорія"
            >
              <MenuItem value="">Всі категорії</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {}
          <FormControl fullWidth>
            <InputLabel>Рівень</InputLabel>
            <Select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as number | '')}
              label="Рівень"
            >
              <MenuItem value="">Всі рівні</MenuItem>
              <MenuItem value={0}>Beginner</MenuItem>
              <MenuItem value={1}>Intermediate</MenuItem>
              <MenuItem value={2}>Advanced</MenuItem>
            </Select>
          </FormControl>
          {}
          <FormControl fullWidth>
            <InputLabel>Сортування</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Сортування"
            >
              <MenuItem value="newest">Найновіші</MenuItem>
              <MenuItem value="rating">За рейтингом</MenuItem>
              <MenuItem value="title">За назвою</MenuItem>
              <MenuItem value="enrollments">Популярні</MenuItem>
            </Select>
          </FormControl>
          {}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClearFilters}
            startIcon={<FilterListIcon />}
          >
            Скинути
          </Button>
        </Box>
        {}
        {(searchTerm || selectedCategory || selectedLevel !== '') && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchTerm && (
              <Chip
                label={`Пошук: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                size="small"
              />
            )}
            {selectedCategory && (
              <Chip
                label={`Категорія: ${categories.find(c => c.id === selectedCategory)?.name}`}
                onDelete={() => setSelectedCategory('')}
                size="small"
              />
            )}
            {selectedLevel !== '' && (
              <Chip
                label={`Рівень: ${getLevelLabel(Number(selectedLevel))}`}
                onDelete={() => setSelectedLevel('')}
                size="small"
              />
            )}
          </Box>
        )}
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            😔 Курси не знайдено
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }}>
            Спробуйте змінити фільтри пошуку
          </Typography>
        </Paper>
      ) : (
        <>
          {}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
              mb: 4,
            }}
          >
            {courses.map((course) => (
              <Card
                key={course.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {}
                <Box
                  sx={{
                    height: 140,
                    background: `linear-gradient(135deg, ${
                      ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'][
                        course.id % 5
                      ]
                    } 0%, ${
                      ['#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#38f9d7'][
                        course.id % 5
                      ]
                    } 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem',
                    fontWeight: 700,
                  }}
                >
                  {course.title.charAt(0).toUpperCase()}
                </Box>
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  {}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '3.6em',
                    }}
                  >
                    {course.title}
                  </Typography>
                  {}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {course.instructorName || 'Instructor'}
                    </Typography>
                  </Box>
                  {}
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '2.8em',
                    }}
                  >
                    {course.description || 'Опис курсу...'}
                  </Typography>
                  {}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={course.averageRating || 0} readOnly size="small" precision={0.5} />
                      <Typography variant="body2" color="textSecondary">
                        ({course.averageRating?.toFixed(1) || 'N/A'})
                      </Typography>
                    </Box>
                    <Chip
                      label={getLevelLabel(parseInt(course.level))}
                      size="small"
                      color={
                        parseInt(course.level) === 0 ? 'success' : parseInt(course.level) === 1 ? 'primary' : 'warning'
                      }
                    />
                  </Box>
                  {}
                  {course.categoryName && (
                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: '#f0f0f0',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block',
                      }}
                    >
                      {course.categoryName}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    to={`/courses/${course.id}`}
                    sx={{
                      backgroundColor: '#a435f0',
                      '&:hover': { backgroundColor: '#8710d8' },
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Переглянути курс
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
          {}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};
export default CourseCatalogPage;