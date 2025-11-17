import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestDetailsDto, TestSubmissionDto, AnswerSubmissionDto } from '../models/learning.models';
import { submitTest, getTestDetails } from '../services/learningService';
import { QuestionType } from '../models/enums';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  TextField, 
  Alert, 
  CircularProgress,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup
} from '@mui/material';

type AnswersState = {
  [questionId: number]: {
    answerText: string;
    selectedOptionIds: number[];
  }
};

const TestPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<TestDetailsDto | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getTestDetails(Number(id));
        setTest(data);
        
        // Ініціалізуємо стан для відповідей
        const initialAnswers: AnswersState = {};
        data.questions.forEach(q => {
          initialAnswers[q.id] = { answerText: '', selectedOptionIds: [] };
        });
        setAnswers(initialAnswers);

      } catch (err: any) {
        if (err.response && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Помилка завантаження тесту.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // 2. Обробники для різних типів питань
  const handleTextChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answerText: value, selectedOptionIds: [] }
    }));
  };

  const handleSingleChoiceChange = (questionId: number, optionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answerText: '', selectedOptionIds: [optionId] }
    }));
  };

  const handleMultiChoiceChange = (questionId: number, optionId: number) => {
    const currentSelection = answers[questionId]?.selectedOptionIds || [];
    const newSelection = currentSelection.includes(optionId)
      ? currentSelection.filter(id => id !== optionId) // uncheck
      : [...currentSelection, optionId]; // check
      
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answerText: '', selectedOptionIds: newSelection }
    }));
  };

  // 3. Відправка тесту
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');

    // Конвертуємо наш стан у DTO
    const submissionDto: TestSubmissionDto = {
      answers: Object.keys(answers).map(key => ({
        questionId: Number(key),
        answerText: answers[Number(key)].answerText,
        selectedOptionIds: answers[Number(key)].selectedOptionIds
      }))
    };

    try {
      const data = await submitTest(Number(id), submissionDto);
      setResult(data);
    } catch (err: any) {
       if (err.response && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Помилка при відправці тесту.');
        }
    }
  };

  // --- Рендер результату (якщо здав) ---
  if (result) {
    return (
      <Container>
        <Typography variant="h4">Тест Надіслано!</Typography>
        
        {result.status === 2 && ( // PendingReview
          <Alert severity="info" sx={{mt: 2}}>
            Ваш тест відправлено на перевірку викладачу.
          </Alert>
        )}
        
        {result.status === 1 && ( // Graded
          <Alert severity={result.score! > 50 ? 'success' : 'error'} sx={{mt: 2}}>
            Ваш результат: {result.score}%
          </Alert>
        )}
      </Container>
    );
  }

  if (loading) return <CircularProgress />;
  
  // Якщо тест вже зданий (помилка з API)
  if (error && error.includes("already submitted")) {
     return <Alert severity="warning">Ви вже здавали цей тест.</Alert>;
  }
  
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!test) return <Typography>Тест не знайдено.</Typography>;

  // --- Рендер самого тесту ---
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Тест: {test.title}</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        
        {test.questions.map((q) => (
          <Paper key={q.id} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>{q.order}. {q.text}</Typography>
            
            {/* 4. Динамічний рендер питань */}
            {q.type === QuestionType.Text && (
              <TextField
                label="Ваша відповідь"
                fullWidth
                value={answers[q.id]?.answerText || ''}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
              />
            )}
            
            {q.type === QuestionType.TrueFalse && (
              <RadioGroup
                value={answers[q.id]?.answerText || ''}
                onChange={(e) => handleTextChange(q.id, e.target.value)}
              >
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
              </RadioGroup>
            )}
            
            {q.type === QuestionType.SingleChoice && (
              <RadioGroup
                value={answers[q.id]?.selectedOptionIds[0] || ''}
                onChange={(e) => handleSingleChoiceChange(q.id, Number(e.target.value))}
              >
                {q.options.map((opt) => (
                  <FormControlLabel key={opt.id} value={opt.id} control={<Radio />} label={opt.text} />
                ))}
              </RadioGroup>
            )}

            {q.type === QuestionType.MultipleChoice && (
              <FormGroup>
                {q.options.map((opt) => (
                  <FormControlLabel 
                    key={opt.id} 
                    control={
                      <Checkbox 
                        checked={answers[q.id]?.selectedOptionIds.includes(opt.id) || false}
                        onChange={() => handleMultiChoiceChange(q.id, opt.id)}
                      />
                    } 
                    label={opt.text} 
                  />
                ))}
              </FormGroup>
            )}
            
          </Paper>
        ))}

        <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>
          Відправити
        </Button>
      </Box>
    </Container>
  );
};

export default TestPage;