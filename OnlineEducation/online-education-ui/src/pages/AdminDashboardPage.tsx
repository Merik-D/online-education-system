import React, { useEffect, useState } from 'react';
import { Typography, Container, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import { getUserStats, getAllUsers, toggleUserBlock } from '../services/adminService';
import { UserDto, UserStatsDto } from '../models/admin.models';
const AdminDashboardPage = () => {
  const [stats, setStats] = useState<UserStatsDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      setLoading(true);
      const statsData = await getUserStats();
      const usersData = await getAllUsers();
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleToggleBlock = async (userId: number) => {
    await toggleUserBlock(userId);
    fetchData();
  };
  if (loading) return <CircularProgress />;
  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Панель Адміністратора
      </Typography>
      <Typography variant="h5">Статистика:</Typography>
      {stats && (
        <ul>
          <li>Студентів: {stats.totalStudents}</li>
          <li>Викладачів: {stats.totalInstructors}</li>
          <li>Адмінів: {stats.totalAdmins}</li>
        </ul>
      )}
      <Typography variant="h5" sx={{mt: 4}}>Керування Користувачами:</Typography>
      <Paper sx={{mt: 2}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ім'я</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ролі</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.roles.join(', ')}</TableCell>
                <TableCell>{user.isLockedOut ? 'Заблокований' : 'Активний'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color={user.isLockedOut ? 'success' : 'error'}
                    onClick={() => handleToggleBlock(user.id)}
                  >
                    {user.isLockedOut ? 'Розблокувати' : 'Блокувати'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};
export default AdminDashboardPage;