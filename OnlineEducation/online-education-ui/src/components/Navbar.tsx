import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import NotificationsMenu from './NotificationsMenu';

const Navbar = () => {
  const { auth, logout, isAdmin, isInstructor, isStudent } = useAuth(); // <-- Отримали нові ролі
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/courses">
            Каталог
          </Button>
          {auth ? (
            <>
              
              {isAdmin() && (
                <Button color="inherit" component={Link} to="/admin/dashboard">
                  Адмін
                </Button>
              )}
              
              {isInstructor() && (
                <>
                  <Button color="inherit" component={Link} to="/instructor/dashboard">
                    Мої Курси (Викл.)
                  </Button>
                  <Button color="inherit" component={Link} to="/instructor/grade-submissions">
                    Перевірка
                  </Button>
                </>
              )}

              {isStudent() && (
                <Button color="inherit" component={Link} to="/my-courses">
                  Мої Курси
                </Button>
              )}

              {isStudent() && <NotificationsMenu />}
              
              <Typography sx={{ mx: 2 }}>
                Вітаю, {auth.fullName}
              </Typography>
              
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