import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
  Chip,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { CourseBuilder, ModuleBuilder } from '../services/courseBuilder';
import { CourseLevel, LessonType, QuestionType, GradingStrategyType } from '../models/enums';
import { createCourse, createModule, createLesson, createTest, createQuestion } from '../services/creatorService';
import { LessonCreateDto, OptionCreateDto, QuestionCreateDto, TestCreateDto } from '../models/creator.models';
const steps = ['Course Details', 'Add Modules', 'Add Lessons', 'Add Tests (Optional)', 'Review & Create'];
interface ModuleData {
  title: string;
  builder: ModuleBuilder;
}
interface LessonData {
  moduleIndex: number;
  title: string;
  type: LessonType;
  content: string;
}
interface OptionData {
  text: string;
  isCorrect: boolean;
}
interface QuestionData {
  text: string;
  type: QuestionType;
  options: OptionData[];
}
interface TestData {
  moduleIndex: number;
  title: string;
  strategyType: GradingStrategyType;
  questions: QuestionData[];
}
const CourseBuilderPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [courseBuilder] = useState(() => new CourseBuilder());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<CourseLevel>(CourseLevel.Beginner);
  const [categoryId, setCategoryId] = useState(1);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [currentModuleTitle, setCurrentModuleTitle] = useState('');
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>(LessonType.Video);
  const [lessonContent, setLessonContent] = useState('');
  const [tests, setTests] = useState<TestData[]>([]);
  const [currentTestModuleIndex, setCurrentTestModuleIndex] = useState(0);
  const [testTitle, setTestTitle] = useState('');
  const [strategyType, setStrategyType] = useState<GradingStrategyType>(GradingStrategyType.Auto);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.SingleChoice);
  const [questionOptions, setQuestionOptions] = useState<OptionData[]>([]);
  const [optionText, setOptionText] = useState('');
  const [optionIsCorrect, setOptionIsCorrect] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleNext = () => {
    setError('');
    if (activeStep === 0) {
      if (!title.trim()) {
        setError('Course title is required');
        return;
      }
      if (!description.trim()) {
        setError('Course description is required');
        return;
      }
      courseBuilder.withTitle(title).withDescription(description).withLevel(level).withCategory(categoryId);
    }
    if (activeStep === 1) {
      if (modules.length === 0) {
        setError('Add at least one module to continue');
        return;
      }
    }
    if (activeStep === 2) {
      const hasLessons = lessons.length > 0;
      if (!hasLessons) {
        setError('Add at least one lesson to continue');
        return;
      }
      const modulesWithoutLessons = modules.filter(
        (_, idx) => !lessons.some((l) => l.moduleIndex === idx)
      );
      if (modulesWithoutLessons.length > 0) {
        setError(`All modules must have at least one lesson. Missing lessons in: ${modulesWithoutLessons.map((m) => m.title).join(', ')}`);
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  const addModule = () => {
    if (!currentModuleTitle.trim()) {
      setError('Module title is required');
      return;
    }
    const moduleBuilder = courseBuilder.addModule(currentModuleTitle);
    setModules([...modules, { title: currentModuleTitle, builder: moduleBuilder }]);
    setCurrentModuleTitle('');
    setError('');
  };
  const removeModule = (index: number) => {
    const newModules = modules.filter((_, i) => i !== index);
    setModules(newModules);
    setLessons(lessons.filter((l) => l.moduleIndex !== index));
  };
  const addLesson = () => {
    if (!lessonTitle.trim()) {
      setError('Lesson title is required');
      return;
    }
    if (!lessonContent.trim()) {
      setError(`${lessonType === LessonType.Video ? 'Video URL' : 'Text content'} is required`);
      return;
    }
    const moduleBuilder = modules[currentModuleIndex].builder;
    const lessonOrder = lessons.filter((l) => l.moduleIndex === currentModuleIndex).length + 1;
    moduleBuilder.withLesson(lessonTitle, lessonOrder, lessonType, lessonContent);
    setLessons([
      ...lessons,
      {
        moduleIndex: currentModuleIndex,
        title: lessonTitle,
        type: lessonType,
        content: lessonContent,
      },
    ]);
    setLessonTitle('');
    setLessonContent('');
    setError('');
  };
  const removeLesson = (index: number) => {
    const lesson = lessons[index];
    setLessons(lessons.filter((_, i) => i !== index));
  };
  const getModuleTest = (moduleIndex: number) => tests.find((t) => t.moduleIndex === moduleIndex);
  const handleTestModuleChange = (newIndex: number) => {
    setCurrentTestModuleIndex(newIndex);
    const existing = getModuleTest(newIndex);
    setTestTitle(existing?.title || '');
    setStrategyType(existing?.strategyType || GradingStrategyType.Auto);
    setQuestionText('');
    setQuestionType(QuestionType.SingleChoice);
    setQuestionOptions([]);
    setOptionText('');
    setOptionIsCorrect(false);
  };
  const saveTestMeta = () => {
    if (!modules[currentTestModuleIndex]) {
      setError('Select a module to attach a test.');
      return;
    }
    if (!testTitle.trim()) {
      setError('Test title is required');
      return;
    }
    const existing = getModuleTest(currentTestModuleIndex);
    if (existing) {
      const updated = tests.map((t) =>
        t.moduleIndex === currentTestModuleIndex ? { ...t, title: testTitle.trim(), strategyType } : t
      );
      setTests(updated);
    } else {
      setTests([
        ...tests,
        {
          moduleIndex: currentTestModuleIndex,
          title: testTitle.trim(),
          strategyType,
          questions: [],
        },
      ]);
    }
    setError('');
  };
  const addOption = () => {
    if (!optionText.trim()) {
      setError('Option text is required');
      return;
    }
    setQuestionOptions([...questionOptions, { text: optionText.trim(), isCorrect: optionIsCorrect }]);
    setOptionText('');
    setOptionIsCorrect(false);
    setError('');
  };
  const removeOption = (index: number) => {
    setQuestionOptions(questionOptions.filter((_, i) => i !== index));
  };
  const addQuestion = () => {
    if (!testTitle.trim()) {
      setError('Save the test title before adding questions');
      return;
    }
    if (!questionText.trim()) {
      setError('Question text is required');
      return;
    }
    if (questionType !== QuestionType.Text) {
      if (questionOptions.length < 2) {
        setError('Add at least two options for choice questions');
        return;
      }
      if (!questionOptions.some((o) => o.isCorrect)) {
        setError('Mark at least one option as correct');
        return;
      }
    }
    const existing = getModuleTest(currentTestModuleIndex);
    const baseTest =
      existing || {
        moduleIndex: currentTestModuleIndex,
        title: testTitle.trim(),
        strategyType,
        questions: [],
      };
    const newQuestion: QuestionData = {
      text: questionText.trim(),
      type: questionType,
      options: questionType === QuestionType.Text ? [] : questionOptions,
    };
    const updatedTests = existing
      ? tests.map((t) =>
          t.moduleIndex === currentTestModuleIndex
            ? { ...t, title: testTitle.trim(), strategyType, questions: [...t.questions, newQuestion] }
            : t
        )
      : [...tests, { ...baseTest, questions: [newQuestion] }];
    setTests(updatedTests);
    setQuestionText('');
    setQuestionType(QuestionType.SingleChoice);
    setQuestionOptions([]);
    setOptionText('');
    setOptionIsCorrect(false);
    setError('');
  };
  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const testWithoutQuestions = tests.find((t) => t.questions.length === 0);
      if (testWithoutQuestions) {
        setError('Кожен тест повинен містити хоча б одне запитання.');
        setLoading(false);
        return;
      }
      const courseData = courseBuilder.getCourse();
      const createdCourse = await createCourse(courseData);
      for (let i = 0; i < modules.length; i++) {
        const { module } = modules[i].builder.build();
        const createdModule = await createModule(createdCourse.id, module);
        const moduleLessons = lessons.filter((l) => l.moduleIndex === i);
        for (let j = 0; j < moduleLessons.length; j++) {
          const lesson = moduleLessons[j];
          const lessonDto: LessonCreateDto = {
            title: lesson.title,
            order: j + 1,
            type: lesson.type,
            videoUrl: lesson.type === LessonType.Video ? lesson.content : undefined,
            textContent: lesson.type === LessonType.Text ? lesson.content : undefined,
          };
          await createLesson(createdModule.data.id, lessonDto);
        }
        const moduleTest = tests.find((t) => t.moduleIndex === i);
        if (moduleTest) {
          const testDto: TestCreateDto = {
            title: moduleTest.title,
            strategyType: moduleTest.strategyType,
          };
          const createdTest = await createTest(createdModule.data.id, testDto);
          for (let q = 0; q < moduleTest.questions.length; q++) {
            const question = moduleTest.questions[q];
            const questionDto: QuestionCreateDto = {
              text: question.text,
              type: question.type,
              order: q + 1,
              options:
                question.type === QuestionType.Text
                  ? []
                  : question.options.map<OptionCreateDto>((opt) => ({
                      text: opt.text,
                      isCorrect: opt.isCorrect,
                    })),
            };
            await createQuestion(createdTest.data.id, questionDto);
          }
        }
      }
      navigate('/instructor/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Course Information
            </Typography>
            <TextField
              fullWidth
              label="Course Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Level</InputLabel>
              <Select value={level} label="Level" onChange={(e) => setLevel(e.target.value as CourseLevel)}>
                <MenuItem value={CourseLevel.Beginner}>Beginner</MenuItem>
                <MenuItem value={CourseLevel.Intermediate}>Intermediate</MenuItem>
                <MenuItem value={CourseLevel.Advanced}>Advanced</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Category ID"
              type="number"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              margin="normal"
              required
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Course Modules
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Organize your course into modules. Each module will contain lessons.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                fullWidth
                label="Module Title"
                value={currentModuleTitle}
                onChange={(e) => setCurrentModuleTitle(e.target.value)}
                placeholder="e.g., Introduction, Core Concepts, Advanced Topics"
              />
              <Button variant="contained" onClick={addModule} startIcon={<AddIcon />}>
                Add
              </Button>
            </Box>
            {modules.map((module, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Module {index + 1}: {module.title}
                    </Typography>
                    <IconButton onClick={() => removeModule(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
            {modules.length === 0 && (
              <Alert severity="info">No modules added yet. Add your first module above.</Alert>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Lessons
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add lessons to each module. Lessons can be videos or text-based content.
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Module</InputLabel>
              <Select
                value={currentModuleIndex}
                label="Select Module"
                onChange={(e) => setCurrentModuleIndex(Number(e.target.value))}
              >
                {modules.map((module, index) => (
                  <MenuItem key={index} value={index}>
                    Module {index + 1}: {module.title} (
                    {lessons.filter((l) => l.moduleIndex === index).length} lessons)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider sx={{ my: 3 }} />
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Lesson Type</FormLabel>
              <RadioGroup
                row
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value as LessonType)}
              >
                <FormControlLabel
                  value={LessonType.Video}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VideoIcon /> Video
                    </Box>
                  }
                />
                <FormControlLabel
                  value={LessonType.Text}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArticleIcon /> Text
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            <TextField
              fullWidth
              label="Lesson Title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              margin="normal"
            />
            {lessonType === LessonType.Video ? (
              <TextField
                fullWidth
                label="Video URL"
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                margin="normal"
                placeholder="https://youtube.com/watch?v=..."
              />
            ) : (
              <TextField
                fullWidth
                label="Lesson Content"
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                margin="normal"
                multiline
                rows={6}
                placeholder="Enter your lesson content here..."
              />
            )}
            <Button
              variant="contained"
              onClick={addLesson}
              startIcon={<AddIcon />}
              sx={{ mt: 2, mb: 3 }}
            >
              Add Lesson
            </Button>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
              Added Lessons:
            </Typography>
            {modules.map((module, moduleIdx) => {
              const moduleLessons = lessons.filter((l) => l.moduleIndex === moduleIdx);
              if (moduleLessons.length === 0) return null;
              return (
                <Box key={moduleIdx} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                    {module.title}
                  </Typography>
                  {moduleLessons.map((lesson, lessonIdx) => {
                    const globalIndex = lessons.indexOf(lesson);
                    return (
                      <Card key={globalIndex} sx={{ mb: 1 }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {lesson.type === LessonType.Video ? <VideoIcon color="primary" /> : <ArticleIcon color="primary" />}
                              <Typography>{lesson.title}</Typography>
                              <Chip
                                size="small"
                                label={lesson.type === LessonType.Video ? 'Video' : 'Text'}
                                color={lesson.type === LessonType.Video ? 'primary' : 'secondary'}
                              />
                            </Box>
                            <IconButton size="small" onClick={() => removeLesson(globalIndex)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              );
            })}
            {lessons.length === 0 && (
              <Alert severity="info">No lessons added yet. Add your first lesson above.</Alert>
            )}
          </Box>
        );
      case 3:
        const currentTest = getModuleTest(currentTestModuleIndex);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Tests (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Attach an optional test to a module. Courses without tests are allowed.
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Module</InputLabel>
              <Select
                value={currentTestModuleIndex}
                label="Select Module"
                onChange={(e) => handleTestModuleChange(Number(e.target.value))}
              >
                {modules.map((module, index) => (
                  <MenuItem key={index} value={index}>
                    Module {index + 1}: {module.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Test Title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              margin="normal"
              placeholder="e.g., Module Quiz"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Grading Strategy</InputLabel>
              <Select
                value={strategyType}
                label="Grading Strategy"
                onChange={(e) => setStrategyType(e.target.value as GradingStrategyType)}
              >
                <MenuItem value={GradingStrategyType.Auto}>Auto</MenuItem>
                <MenuItem value={GradingStrategyType.Manual}>Manual</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={saveTestMeta} sx={{ mt: 1, mb: 3 }}>
              {currentTest ? 'Update Test' : 'Save Test'}
            </Button>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Add Question
            </Typography>
            <TextField
              fullWidth
              label="Question Text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Question Type</InputLabel>
              <Select
                value={questionType}
                label="Question Type"
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              >
                <MenuItem value={QuestionType.SingleChoice}>Single Choice</MenuItem>
                <MenuItem value={QuestionType.MultipleChoice}>Multiple Choice</MenuItem>
                <MenuItem value={QuestionType.Text}>Text Answer</MenuItem>
              </Select>
            </FormControl>
            {questionType !== QuestionType.Text && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Add options and mark the correct ones.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Option text"
                    value={optionText}
                    onChange={(e) => setOptionText(e.target.value)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={optionIsCorrect}
                        onChange={(e) => setOptionIsCorrect(e.target.checked)}
                      />
                    }
                    label="Correct"
                  />
                  <Button variant="contained" onClick={addOption} startIcon={<AddIcon />}>
                    Add Option
                  </Button>
                </Box>
                {questionOptions.map((opt, idx) => (
                  <Chip
                    key={idx}
                    label={`${opt.text}${opt.isCorrect ? ' (correct)' : ''}`}
                    onDelete={() => removeOption(idx)}
                    color={opt.isCorrect ? 'success' : 'default'}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
            <Button variant="contained" onClick={addQuestion} startIcon={<AddIcon />}>
              Add Question
            </Button>
            {currentTest && currentTest.questions.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Questions for this module</Typography>
                {currentTest.questions.map((q, idx) => (
                  <Card key={idx} sx={{ my: 1 }}>
                    <CardContent>
                      <Typography variant="body1">{idx + 1}. {q.text}</Typography>
                      <Chip label={q.type} size="small" sx={{ mt: 1, mr: 1 }} />
                      {q.options.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {q.options.map((opt, optIdx) => (
                            <Chip
                              key={optIdx}
                              label={opt.text}
                              color={opt.isCorrect ? 'success' : 'default'}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Course
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your course structure before creating it.
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="primary">
                Course Details
              </Typography>
              <Typography variant="body1">
                <strong>Title:</strong> {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label={CourseLevel[level]} size="small" sx={{ mr: 1 }} />
                <Chip label={`${modules.length} Modules`} size="small" sx={{ mr: 1 }} />
                <Chip label={`${lessons.length} Lessons`} size="small" />
              </Box>
            </Paper>
            {modules.map((module, moduleIdx) => {
              const moduleLessons = lessons.filter((l) => l.moduleIndex === moduleIdx);
              const moduleTest = tests.find((t) => t.moduleIndex === moduleIdx);
              return (
                <Paper key={moduleIdx} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    Module {moduleIdx + 1}: {module.title}
                  </Typography>
                  <Box sx={{ ml: 2, mt: 1 }}>
                    {moduleLessons.map((lesson, lessonIdx) => (
                      <Box key={lessonIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {lesson.type === LessonType.Video ? <VideoIcon fontSize="small" /> : <ArticleIcon fontSize="small" />}
                        <Typography variant="body2">
                          {lessonIdx + 1}. {lesson.title}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  {moduleTest && (
                    <Box sx={{ ml: 2, mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Test: {moduleTest.title} ({moduleTest.strategyType})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {moduleTest.questions.length} questions attached
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        );
      default:
        return null;
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Course
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Build your course step-by-step using our guided wizard
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 3 }}>
        {renderStepContent()}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};
export default CourseBuilderPage;