import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import adminReportsService from '../services/adminReportsService';
import {
  PlatformRatingsStatisticsDto,
  MonthlyRevenueDto,
  CoursePopularityDto,
  PlatformRevenueDto,
} from '../models/reports.models';
interface StatCard {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
}
const AdminReportsPage: React.FC = () => {
  const [ratingsStats, setRatingsStats] = useState<PlatformRatingsStatisticsDto | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueDto[]>([]);
  const [platformRevenue, setPlatformRevenue] = useState<PlatformRevenueDto | null>(null);
  const [popularity, setPopularity] = useState<CoursePopularityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchReports();
  }, []);
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ratings, revenue, monthly, courses] = await Promise.all([
        adminReportsService.getInstructorRatings(),
        adminReportsService.getPlatformRevenue(),
        adminReportsService.getMonthlyRevenue(12),
        adminReportsService.getCoursesPopularity(),
      ]);
      setRatingsStats(ratings);
      setPlatformRevenue(revenue);
      setMonthlyRevenue(monthly);
      setPopularity(courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        📊 Адміністративні звіти
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCardComponent
          title="Середній рейтинг"
          value={ratingsStats?.averagePlatformRating?.toFixed(2) || '—'}
          color="#4CAF50"
        />
        <StatCardComponent
          title="Всього викладачів"
          value={ratingsStats?.totalInstructors || '—'}
          color="#2196F3"
        />
        <StatCardComponent
          title="Всього курсів"
          value={ratingsStats?.totalCourses || '—'}
          color="#FF9800"
        />
        <StatCardComponent
          title="Дохід платформи"
          value={`$${platformRevenue?.totalRevenue?.toFixed(2) || '0.00'}`}
          color="#9C27B0"
        />
      </Box>
      {}
      {ratingsStats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              🏆 Найбільш рейтингові викладачі
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Ім'я</TableCell>
                      <TableCell align="right">Рейтинг</TableCell>
                      <TableCell align="right">Відгуки</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ratingsStats.topInstructors.map((instructor) => (
                      <TableRow key={instructor.instructorId}>
                        <TableCell>{instructor.name}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            {instructor.averageRating.toFixed(2)}
                            <Rating value={instructor.averageRating} readOnly size="small" />
                          </Box>
                        </TableCell>
                        <TableCell align="right">{instructor.reviewCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              ⚠️ Викладачі з низькими рейтингами
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                      <TableCell>Ім'я</TableCell>
                      <TableCell align="right">Рейтинг</TableCell>
                      <TableCell align="right">Відгуки</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ratingsStats.lowestRatedInstructors.map((instructor) => (
                      <TableRow key={instructor.instructorId}>
                        <TableCell>{instructor.name}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            {instructor.averageRating.toFixed(2)}
                            <Rating value={instructor.averageRating} readOnly size="small" />
                          </Box>
                        </TableCell>
                        <TableCell align="right">{instructor.reviewCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
        </Box>
      )}
      {}
      {monthlyRevenue.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              💰 Місячний дохід
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2196F3" name="Дохід ($)" />
                <Line type="monotone" dataKey="enrollments" stroke="#4CAF50" name="Реєстрації" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      )}
      {}
      {popularity.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            🎓 Популярні курси
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Назва курсу</TableCell>
                  <TableCell>Викладач</TableCell>
                  <TableCell align="right">Реєстрації</TableCell>
                  <TableCell align="right">Рейтинг</TableCell>
                  <TableCell>Категорія</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {popularity.slice(0, 10).map((course) => (
                  <TableRow key={course.courseId}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.instructorName}</TableCell>
                    <TableCell align="right">{course.enrollmentCount}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {course.averageRating.toFixed(2)}
                        <Rating value={course.averageRating} readOnly size="small" />
                      </Box>
                    </TableCell>
                    <TableCell>{course.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};
const StatCardComponent: React.FC<{
  title: string;
  value: string | number;
  color?: string;
}> = ({ title, value, color = '#2196F3' }) => (
  <Card sx={{ backgroundColor: color, color: 'white', height: '100%' }}>
    <CardContent>
      <Typography color="inherit" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);
export default AdminReportsPage;