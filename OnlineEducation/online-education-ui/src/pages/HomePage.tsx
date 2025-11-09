import React from 'react';
import { Typography, Container } from '@mui/material';

const HomePage = () => {
  return (
    <Container>
      <Typography variant="h2" component="h1" gutterBottom>
        Вітаємо на нашій Освітній Платформі!
      </Typography>
      <Typography variant="h5">
        Оберіть курс з нашого каталогу та почніть навчання.
      </Typography>
    </Container>
  );
};

export default HomePage;