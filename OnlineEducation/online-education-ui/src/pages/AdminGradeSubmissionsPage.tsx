import React, { useEffect, useState } from 'react';
import { gradeSubmission, getPendingSubmissions } from '../services/instructorService';
import { PendingSubmissionDto } from '../models/admin.models';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
const AdminGradeSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<PendingSubmissionDto[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<{[key: number]: string}>({});
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError('Не вдалося завантажити роботи');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSubmissions();
  }, []);
  const handleScoreChange = (submissionId: number, score: string) => {
    setScores(prev => ({...prev, [submissionId]: score}));
  };
  const handleGrade = async (submissionId: number) => {
    try {
      const score = parseFloat(scores[submissionId]);
      if (isNaN(score) || score < 0 || score > 100) {
        setError('Оцінка має бути від 0 до 100');
        return;
      }
      await gradeSubmission(submissionId, { score });
      setError('');
      fetchSubmissions();
      setScores(prev => ({...prev, [submissionId]: ''}));
    } catch (err) {
      setError('Помилка при оцінюванні');
    }
  };
  if (loading) return <CircularProgress />;
  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Роботи на Перевірку
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {submissions.length === 0 && <Typography>Немає робіт для перевірки.</Typography>}
      {submissions.map((sub) => (
        <Card key={sub.submissionId} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h5">{sub.testTitle}</Typography>
            <Typography color="textSecondary">Студент: {sub.studentName} (ID: {sub.submissionId})</Typography>
            <Typography sx={{ mt: 2 }}>Відповіді:</Typography>
            {sub.answers.map((ans) => (
              <Box key={ans.questionId} sx={{ pl: 2, borderLeft: '3px solid #ccc', mb: 1 }}>
                <Typography variant="body1"><strong>{ans.questionText}</strong></Typography>
                <Typography variant="body2" color="primary">
                  {ans.answerText || ans.selectedOptions.map(o => o.optionText).join(', ')}
                </Typography>
              </Box>
            ))}
            <Box sx={{mt: 2, display: 'flex', alignItems: 'center'}}>
              <TextField
                label="Оцінка (0-100)"
                type="number"
                size="small"
                value={scores[sub.submissionId] || ''}
                onChange={(e) => handleScoreChange(sub.submissionId, e.target.value)}
              />
              <Button
                variant="contained"
                sx={{ ml: 2 }}
                onClick={() => handleGrade(sub.submissionId)}
              >
                Оцінити
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};
export default AdminGradeSubmissionsPage;