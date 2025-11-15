import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TestSubmissionDto } from '../models/learning.models';
import { submitTest } from '../services/learningService';
import { Container, Typography, Button, Box, TextField, Alert } from '@mui/material';

const TestPage = () => {
  const { id } = useParams<{ id: string }>(); // Це ID тесту
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const submission: TestSubmissionDto = {
      answers: [
        {
          questionId: 1,
          answerText: answer,
          selectedOptionIds: [],
        },
      ],
    };

    try {
      const data = await submitTest(Number(id), submission);
      setResult(data);
    } catch (err) {
      setError('Помилка при відправці тесту');
    }
  };

  if (result) {
    return (
      <Container>
        <Typography variant="h4">Тест Завершено!</Typography>
        <Alert severity={result.score > 50 ? 'success' : 'error'}>
          Ваш статус: {result.status === 1 ? 'Оцінено' : 'Очікує перевірки'}
        </Alert>
        {result.score !== null && (
          <Typography variant="h5">Ваш результат: {result.score}%</Typography>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4">Тест (ID: {id})</Typography>
      <Typography variant="h6">Питання: Столиця України?</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Ваша відповідь"
          fullWidth
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Відправити
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Container>
  );
};

export default TestPage;