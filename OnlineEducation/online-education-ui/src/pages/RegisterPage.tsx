import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select, // <-- 1. ІМПОРТ
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student'); // <-- 2. НОВИЙ СТАН
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // 3. Передаємо 'role' в сервіс
      await register({ fullName, email, password, role });
      navigate('/login');
    } catch (err: any) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Помилка реєстрації.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Реєстрація
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        
        <TextField
          margin="normal"
          required
          fullWidth
          label="Повне ім'я"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* --- 4. ДОДАНО ВИБІР РОЛІ --- */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Я...</InputLabel>
          <Select
            value={role}
            label="Я..."
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value={"Student"}>Студент</MenuItem>
            <MenuItem value={"Instructor"}>Викладач</MenuItem>
          </Select>
        </FormControl>
        {/* --- КІНЕЦЬ БЛОКУ --- */}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Зареєструватися
        </Button>
      </Box>
    </Container>
  );
};

export default RegisterPage;