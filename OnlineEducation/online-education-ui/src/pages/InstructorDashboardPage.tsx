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
  Box,
  Divider,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Build as BuildIcon } from '@mui/icons-material';
import { getInstructorStatistics, InstructorStatisticsDto } from '../services/instructorService';
import { getInstructorFinancialReport } from '../services/reportsService';
import { useAuth } from '../context/AuthContext';
const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <Card>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);
const InstructorDashboardPage = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [stats, setStats] = useState<InstructorStatisticsDto | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalEnrollments, setTotalEnrollments] = useState<number>(0);
  const { auth } = useAuth();
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [coursesData, statsData] = await Promise.all([
          getMyCreatedCourses(),
          getInstructorStatistics(),
        ]);
        setCourses(coursesData);
        setStats(statsData);
        if (auth?.id) {
          const report = await getInstructorFinancialReport(auth.id);
          setTotalRevenue(Number(report.totalRevenue));
          setTotalEnrollments(report.totalEnrollments);
        }
      } catch (error) {
        console.error('Error loading instructor dashboard:', error);
      }
    };
    fetchAll();
  }, [auth?.id]);
  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Панель Інструктора
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/instructor/course/builder"
          startIcon={<BuildIcon />}
        >
          Конструктор курсу
        </Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard label="Курсів" value={stats?.totalCourses ?? '—'} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Студентів" value={stats?.totalStudents ?? '—'} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard label="Сер. рейтинг" value={stats ? stats.averageCourseRating.toFixed(2) : '—'} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard label="Дохід (всього)" value={`${totalRevenue.toFixed(2)}`} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard label="Записів (всього)" value={totalEnrollments} />
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom>
        Мої Створені Курси
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Grid key={course.id} item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{course.title}</Typography>
                </Stack>
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
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
export default InstructorDashboardPage;