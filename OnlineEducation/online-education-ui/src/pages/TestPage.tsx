import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  FormGroup,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';
type AnswersState = {
  [questionId: number]: {
    answerText: string;
    selectedOptionIds: number[];
  };
};
const TestPage = () => {
  const { id } = useParams<{ id: string }>();
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
        if (data.isCompleted) {
          setResult({
            score: data.score,
            status: 1
          });
        } else {
          const initialAnswers: AnswersState = {};
          data.questions.forEach((q) => {
            initialAnswers[q.id] = { answerText: '', selectedOptionIds: [] };
          });
          setAnswers(initialAnswers);
        }
      } catch (err: any) {
        if (err.response && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Error loading test.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);
  const handleTextChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], answerText: value, selectedOptionIds: [] },
    }));
  };
  const handleSingleChoiceChange = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], answerText: '', selectedOptionIds: [optionId] },
    }));
  };
  const handleMultiChoiceChange = (questionId: number, optionId: number) => {
    const currentSelection = answers[questionId]?.selectedOptionIds || [];
    const newSelection = currentSelection.includes(optionId)
      ? currentSelection.filter((id) => id !== optionId)
      : [...currentSelection, optionId];
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], answerText: '', selectedOptionIds: newSelection },
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    const submissionDto: TestSubmissionDto = {
      answers: Object.keys(answers).map((key) => ({
        questionId: Number(key),
        answerText: answers[Number(key)].answerText,
        selectedOptionIds: answers[Number(key)].selectedOptionIds,
      })),
    };
    try {
      const data = await submitTest(Number(id), submissionDto);
      setResult(data);
    } catch (err: any) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error submitting test.');
      }
    }
  };
  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }
  if (result) {
    const isAutoGraded = result.status === 1;
    const isPendingReview = result.status === 2;
    return (
      <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {isAutoGraded ? (
              <>
                <CheckCircleIcon sx={{ fontSize: '80px', color: '#4caf50', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 2 }}
                >
                  Test Graded!
                </Typography>
                <Alert
                  severity={result.score! > 50 ? 'success' : 'error'}
                  sx={{ mt: 2, mb: 3 }}
                >
                  Your score: <strong>{result.score}%</strong>
                </Alert>
              </>
            ) : isPendingReview ? (
              <>
                <InfoIcon sx={{ fontSize: '80px', color: '#ff9800', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 2 }}
                >
                  Test Submitted!
                </Typography>
                <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
                  Your test has been submitted for review by the instructor.
                </Alert>
              </>
            ) : null}
            <Button
              component={Link}
              to="/my-courses"
              variant="contained"
              sx={{
                backgroundColor: '#a435f0',
                mt: 3,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#942fb8' },
              }}
            >
              Back to My Courses
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }
  if (error && error.includes('already submitted')) {
    return (
      <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="sm">
          <Alert severity="warning">
            You have already submitted this test.
          </Alert>
          <Button
            component={Link}
            to="/my-courses"
            variant="contained"
            sx={{ mt: 3, backgroundColor: '#a435f0' }}
          >
            Back to My Courses
          </Button>
        </Container>
      </Box>
    );
  }
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (!test) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          Test not found.
        </Typography>
      </Container>
    );
  }
  return (
    <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 3,
            color: '#666',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#f0f0f0' },
          }}
        >
          Back to Courses
        </Button>
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            {test.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
            {test.questions.length} questions
          </Typography>
          <Divider sx={{ mb: 4 }} />
          <Box component="form" onSubmit={handleSubmit}>
            {test.questions.map((q, index) => (
              <Paper
                key={q.id}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: '#1f1f1f',
                  }}
                >
                  {index + 1}. {q.text}
                </Typography>
                {q.type === QuestionType.Text && (
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Your answer here..."
                    value={answers[q.id]?.answerText || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                      },
                    }}
                  />
                )}
                {q.type === QuestionType.TrueFalse && (
                  <RadioGroup
                    value={answers[q.id]?.answerText || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="True"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="False"
                    />
                  </RadioGroup>
                )}
                {q.type === QuestionType.SingleChoice && (
                  <RadioGroup
                    value={answers[q.id]?.selectedOptionIds[0] || ''}
                    onChange={(e) =>
                      handleSingleChoiceChange(q.id, Number(e.target.value))
                    }
                  >
                    {q.options.map((opt) => (
                      <FormControlLabel
                        key={opt.id}
                        value={opt.id}
                        control={<Radio />}
                        label={opt.text}
                      />
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
                            checked={
                              answers[q.id]?.selectedOptionIds.includes(
                                opt.id
                              ) || false
                            }
                            onChange={() =>
                              handleMultiChoiceChange(q.id, opt.id)
                            }
                          />
                        }
                        label={opt.text}
                      />
                    ))}
                  </FormGroup>
                )}
              </Paper>
            ))}
            <Divider sx={{ my: 4 }} />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: '#a435f0',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                px: 4,
                '&:hover': {
                  backgroundColor: '#942fb8',
                },
              }}
            >
              Submit Test
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
export default TestPage;