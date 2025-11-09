import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar = () => {
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
          <Button color="inherit" component={Link} to="/login">
            Логін
          </Button>
          <Button color="inherit" component={Link} to="/register">
            Реєстрація
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;