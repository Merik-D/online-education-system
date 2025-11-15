import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            OnlineEducation
          </Link>
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/courses">
            Каталог
          </Button>
          {auth ? (
            <>
              <Button color="inherit" component={Link} to="/my-courses">
                Мої Курси
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Вийти
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Логін
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Реєстрація
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;