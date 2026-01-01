import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import NotificationsMenu from './NotificationsMenu';
const Navbar = () => {
  const { auth, logout, isAdmin, isInstructor, isStudent } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleLogout = () => {
    logout();
    navigate('/');
    setAnchorEl(null);
  };
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#1f1f1f',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e0e0e0'
      }}
    >
      <Toolbar sx={{ py: 1.5 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '-0.5px'
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            Udemy
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/courses"
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Каталог
          </Button>
          {auth ? (
            <>
              {isAdmin() && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin/dashboard"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Admin
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin/reports"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Звіти
                  </Button>
                </>
              )}
              {isInstructor() && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/instructor/dashboard"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Teaching
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/instructor/grade-submissions"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Grading
                  </Button>
                </>
              )}
              {isStudent() && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/my-courses"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    My Learning
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/certificates"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Certificates
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/recommendations"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Recommendations
                  </Button>
                </>
              )}
              {isStudent() && <NotificationsMenu />}
              <Avatar
                onClick={handleMenuClick}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: '#a435f0',
                  ml: 2,
                  width: 36,
                  height: 36,
                  fontSize: '0.9rem'
                }}
              >
                {auth.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled sx={{ fontSize: '0.9rem', color: '#666' }}>
                  {auth.fullName}
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ fontSize: '0.9rem' }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderColor: 'white',
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Sign up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default Navbar;