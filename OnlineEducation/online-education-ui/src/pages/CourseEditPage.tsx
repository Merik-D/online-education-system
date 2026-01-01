import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { CourseCreateDto, LessonCreateDto, ModuleCreateDto, OptionCreateDto, QuestionCreateDto, TestCreateDto } from '../models/creator.models';
import { CourseLevel, GradingStrategyType, LessonType, QuestionType } from '../models/enums';
import { MyCourseDetailsDto, ModuleDto } from '../models/learning.models';
import { getCourseById } from '../services/courseService';
import {
  getCourseStructure,
  updateCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  createTest,
  updateTest,
  deleteTest,
  createQuestion,
} from '../services/creatorService';
type LessonDraft = {
  title: string;
  type: LessonType;
  content: string;
  order: number;
};
type TestDraft = {
  title: string;
  strategyType: GradingStrategyType;
};
type QuestionDraft = {
  text: string;
  type: QuestionType;
  options: OptionCreateDto[];
  optionText: string;
  optionIsCorrect: boolean;
};
const CourseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<CourseLevel>(CourseLevel.Beginner);
  const [categoryId, setCategoryId] = useState(1);
  const [structure, setStructure] = useState<MyCourseDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [moduleDraftTitle, setModuleDraftTitle] = useState('');
  const [lessonDrafts, setLessonDrafts] = useState<Record<number, LessonDraft>>({});
  const [testDrafts, setTestDrafts] = useState<Record<number, TestDraft>>({});
  const [questionDrafts, setQuestionDrafts] = useState<Record<number, QuestionDraft>>({});
  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const course = await getCourseById(Number(id));
      setTitle(course.title);
      setDescription(course.description || '');
      setLevel((course.level as CourseLevel) || CourseLevel.Beginner);
      setCategoryId(course.categoryId || 1);
      const courseStructure: MyCourseDetailsDto = await getCourseStructure(Number(id));
      setStructure(courseStructure);
      const newTestDrafts: Record<number, TestDraft> = {};
      const newQuestionDrafts: Record<number, QuestionDraft> = {};
      courseStructure.modules.forEach((m) => {
        newTestDrafts[m.id] = {
          title: m.test?.title || '',
          strategyType: GradingStrategyType.Auto,
        };
        newQuestionDrafts[m.id] = {
          text: '',
          type: QuestionType.SingleChoice,
          options: [],
          optionText: '',
          optionIsCorrect: false,
        };
      });
      setTestDrafts(newTestDrafts);
      setQuestionDrafts(newQuestionDrafts);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося завантажити курс.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [id]);
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    setSaving(true);
    const dto: CourseCreateDto = { title, description, level, categoryId };
    try {
      await updateCourse(Number(id), dto);
      setInfo('Курс оновлено');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Помилка оновлення курсу.');
    } finally {
      setSaving(false);
    }
  };
  const handleCreateModule = async () => {
    if (!structure || !id) return;
    if (!moduleDraftTitle.trim()) {
      setError('Вкажіть назву модуля');
      return;
    }
    try {
      const dto: ModuleCreateDto = {
        title: moduleDraftTitle.trim(),
        order: structure.modules.length + 1,
      };
      await createModule(Number(id), dto);
      setModuleDraftTitle('');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося створити модуль.');
    }
  };
  const handleUpdateModule = async (module: ModuleDto, titleValue: string, orderValue: number) => {
    try {
      const dto: ModuleCreateDto = { title: titleValue, order: orderValue };
      await updateModule(module.id, dto);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося оновити модуль.');
    }
  };
  const handleDeleteModule = async (moduleId: number) => {
    try {
      await deleteModule(moduleId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося видалити модуль.');
    }
  };
  const updateLessonDraft = (moduleId: number, patch: Partial<LessonDraft>) => {
    setLessonDrafts((prev) => ({
      ...prev,
      [moduleId]: {
        title: prev[moduleId]?.title || '',
        type: prev[moduleId]?.type || LessonType.Video,
        content: prev[moduleId]?.content || '',
        order: prev[moduleId]?.order || 1,
        ...patch,
      },
    }));
  };
  const handleCreateLesson = async (moduleId: number) => {
    const draft = lessonDrafts[moduleId];
    if (!draft || !draft.title.trim() || !draft.content.trim()) {
      setError('Додайте назву та контент уроку');
      return;
    }
    try {
      const lessonDto: LessonCreateDto = {
        title: draft.title.trim(),
        order: draft.order,
        type: draft.type,
        videoUrl: draft.type === LessonType.Video ? draft.content : undefined,
        textContent: draft.type === LessonType.Text ? draft.content : undefined,
      };
      await createLesson(moduleId, lessonDto);
      updateLessonDraft(moduleId, { title: '', content: '', order: 1 });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося створити урок.');
    }
  };
  const handleUpdateLesson = async (lesson: any, moduleId: number, updated: { title: string; order: number; content: string }) => {
    try {
      const dto: LessonCreateDto = {
        title: updated.title,
        order: updated.order,
        type: lesson.type,
        videoUrl: lesson.type === LessonType.Video ? updated.content : undefined,
        textContent: lesson.type === LessonType.Text ? updated.content : undefined,
      };
      await updateLesson(lesson.id, dto);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося оновити урок.');
    }
  };
  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await deleteLesson(lessonId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося видалити урок.');
    }
  };
  const updateTestDraft = (moduleId: number, patch: Partial<TestDraft>) => {
    setTestDrafts((prev) => ({
      ...prev,
      [moduleId]: {
        title: prev[moduleId]?.title || '',
        strategyType: prev[moduleId]?.strategyType || GradingStrategyType.Auto,
        ...patch,
      },
    }));
  };
  const updateQuestionDraft = (moduleId: number, patch: Partial<QuestionDraft>) => {
    setQuestionDrafts((prev) => ({
      ...prev,
      [moduleId]: {
        text: prev[moduleId]?.text || '',
        type: prev[moduleId]?.type || QuestionType.SingleChoice,
        options: prev[moduleId]?.options || [],
        optionText: prev[moduleId]?.optionText || '',
        optionIsCorrect: prev[moduleId]?.optionIsCorrect || false,
        ...patch,
      },
    }));
  };
  const handleCreateOrUpdateTest = async (moduleId: number, existingTestId?: number) => {
    const draft = testDrafts[moduleId];
    if (!draft || !draft.title.trim()) {
      setError('Назва тесту обовязкова');
      return;
    }
    const dto: TestCreateDto = {
      title: draft.title.trim(),
      strategyType: draft.strategyType,
    };
    try {
      if (existingTestId) {
        await updateTest(existingTestId, dto);
      } else {
        await createTest(moduleId, dto);
      }
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося зберегти тест.');
    }
  };
  const handleDeleteTest = async (testId: number) => {
    try {
      await deleteTest(testId);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося видалити тест.');
    }
  };
  const handleAddOption = (moduleId: number) => {
    const draft = questionDrafts[moduleId];
    if (!draft?.optionText.trim()) {
      setError('Додайте текст варіанту');
      return;
    }
    const updatedOptions = [...(draft.options || []), { text: draft.optionText.trim(), isCorrect: draft.optionIsCorrect }];
    updateQuestionDraft(moduleId, { options: updatedOptions, optionText: '', optionIsCorrect: false });
    setError('');
  };
  const handleAddQuestion = async (moduleId: number, testId: number) => {
    const draft = questionDrafts[moduleId];
    if (!draft || !draft.text.trim()) {
      setError('Додайте текст запитання');
      return;
    }
    if (draft.type !== QuestionType.Text) {
      if ((draft.options || []).length < 2) {
        setError('Додайте мінімум два варіанти');
        return;
      }
      if (!(draft.options || []).some((o) => o.isCorrect)) {
        setError('Позначте правильний варіант');
        return;
      }
    }
    const questionDto: QuestionCreateDto = {
      text: draft.text.trim(),
      type: draft.type,
      order: 1,
      options: draft.type === QuestionType.Text ? [] : draft.options,
    };
    try {
      await createQuestion(testId, questionDto);
      updateQuestionDraft(moduleId, { text: '', options: [], optionText: '', optionIsCorrect: false });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося додати запитання.');
    }
  };
  if (loading || !structure) {
    return (
      <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Редагувати Курс
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {info && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {info}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSaveCourse} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Назва Курсу" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Рівень</InputLabel>
              <Select value={level} label="Рівень" onChange={(e) => setLevel(e.target.value as CourseLevel)}>
                <MenuItem value={CourseLevel.Beginner}>Beginner</MenuItem>
                <MenuItem value={CourseLevel.Intermediate}>Intermediate</MenuItem>
                <MenuItem value={CourseLevel.Advanced}>Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Опис"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ID Категорії (Заглушка)"
              type="number"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Збереження...' : 'Зберегти метадані'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <TextField
          label="Новий модуль"
          value={moduleDraftTitle}
          onChange={(e) => setModuleDraftTitle(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleCreateModule}>Додати модуль</Button>
      </Box>
      <Grid container spacing={3}>
        {structure.modules.map((module) => (
          <Grid item xs={12} key={module.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <TextField
                    label="Назва модуля"
                    defaultValue={module.title}
                    onBlur={(e) => handleUpdateModule(module, e.target.value, module.order)}
                    fullWidth
                  />
                  <TextField
                    label="Порядок"
                    type="number"
                    defaultValue={module.order}
                    onBlur={(e) => handleUpdateModule(module, module.title, Number(e.target.value))}
                    sx={{ width: 160 }}
                  />
                  <Button color="error" onClick={() => handleDeleteModule(module.id)}>Видалити модуль</Button>
                </Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Уроки</Typography>
                {module.lessons.map((lesson) => (
                  <Card key={lesson.id} variant="outlined" sx={{ mb: 1 }}>
                    <CardContent>
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Назва уроку"
                            defaultValue={lesson.title}
                            onBlur={(e) => handleUpdateLesson(lesson, module.id, { title: e.target.value, order: lesson.order, content: lesson.type === LessonType.Video ? lesson.videoUrl || '' : lesson.textContent || '' })}
                          />
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Порядок"
                            defaultValue={lesson.order}
                            onBlur={(e) => handleUpdateLesson(lesson, module.id, { title: lesson.title, order: Number(e.target.value), content: lesson.type === LessonType.Video ? lesson.videoUrl || '' : lesson.textContent || '' })}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label={lesson.type === LessonType.Video ? 'Video URL' : 'Текст'}
                            defaultValue={lesson.type === LessonType.Video ? lesson.videoUrl || '' : lesson.textContent || ''}
                            onBlur={(e) => handleUpdateLesson(lesson, module.id, { title: lesson.title, order: lesson.order, content: e.target.value })}
                            multiline={lesson.type === LessonType.Text}
                            minRows={lesson.type === LessonType.Text ? 2 : 1}
                          />
                        </Grid>
                        <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Button color="error" onClick={() => handleDeleteLesson(lesson.id)}>Видалити</Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                <Box sx={{ mt: 1, mb: 2, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Додати урок</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Назва"
                        value={lessonDrafts[module.id]?.title || ''}
                        onChange={(e) => updateLessonDraft(module.id, { title: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Порядок"
                        value={lessonDrafts[module.id]?.order || 1}
                        onChange={(e) => updateLessonDraft(module.id, { order: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Тип</InputLabel>
                        <Select
                          value={lessonDrafts[module.id]?.type || LessonType.Video}
                          label="Тип"
                          onChange={(e) => updateLessonDraft(module.id, { type: e.target.value as LessonType })}
                        >
                          <MenuItem value={LessonType.Video}>Video</MenuItem>
                          <MenuItem value={LessonType.Text}>Text</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label={lessonDrafts[module.id]?.type === LessonType.Text ? 'Текст' : 'Video URL'}
                        value={lessonDrafts[module.id]?.content || ''}
                        onChange={(e) => updateLessonDraft(module.id, { content: e.target.value })}
                        multiline={lessonDrafts[module.id]?.type === LessonType.Text}
                        minRows={lessonDrafts[module.id]?.type === LessonType.Text ? 2 : 1}
                      />
                    </Grid>
                  </Grid>
                  <Button sx={{ mt: 1 }} variant="contained" onClick={() => handleCreateLesson(module.id)}>
                    Додати урок
                  </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Тест</Typography>
                {module.test ? (
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Назва тесту"
                          value={testDrafts[module.id]?.title || ''}
                          onChange={(e) => updateTestDraft(module.id, { title: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Стратегія</InputLabel>
                          <Select
                            value={testDrafts[module.id]?.strategyType || GradingStrategyType.Auto}
                            label="Стратегія"
                            onChange={(e) => updateTestDraft(module.id, { strategyType: e.target.value as GradingStrategyType })}
                          >
                            <MenuItem value={GradingStrategyType.Auto}>Auto</MenuItem>
                            <MenuItem value={GradingStrategyType.Manual}>Manual</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button variant="contained" onClick={() => handleCreateOrUpdateTest(module.id, module.test?.id)}>Зберегти тест</Button>
                        <Button color="error" onClick={() => module.test && handleDeleteTest(module.test.id)}>Видалити тест</Button>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>Додати запитання</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={5}>
                          <TextField
                            fullWidth
                            label="Текст запитання"
                            value={questionDrafts[module.id]?.text || ''}
                            onChange={(e) => updateQuestionDraft(module.id, { text: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel>Тип</InputLabel>
                            <Select
                              value={questionDrafts[module.id]?.type || QuestionType.SingleChoice}
                              label="Тип"
                              onChange={(e) => updateQuestionDraft(module.id, { type: e.target.value as QuestionType })}
                            >
                              <MenuItem value={QuestionType.SingleChoice}>Single Choice</MenuItem>
                              <MenuItem value={QuestionType.MultipleChoice}>Multiple Choice</MenuItem>
                              <MenuItem value={QuestionType.Text}>Text</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        {questionDrafts[module.id]?.type !== QuestionType.Text && (
                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <TextField
                                fullWidth
                                label="Варіант"
                                value={questionDrafts[module.id]?.optionText || ''}
                                onChange={(e) => updateQuestionDraft(module.id, { optionText: e.target.value })}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={questionDrafts[module.id]?.optionIsCorrect || false}
                                    onChange={(e) => updateQuestionDraft(module.id, { optionIsCorrect: e.target.checked })}
                                  />
                                }
                                label="Вірний"
                              />
                              <Button variant="outlined" onClick={() => handleAddOption(module.id)}>+</Button>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                      {questionDrafts[module.id]?.options?.length ? (
                        <Box sx={{ mt: 1 }}>
                          {questionDrafts[module.id].options.map((opt, idx) => (
                            <Chip key={idx} label={`${opt.text}${opt.isCorrect ? ' ✔' : ''}`} color={opt.isCorrect ? 'success' : 'default'} sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      ) : null}
                      <Button sx={{ mt: 1 }} variant="contained" onClick={() => module.test && handleAddQuestion(module.id, module.test.id)}>
                        Додати запитання
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Назва тесту"
                          value={testDrafts[module.id]?.title || ''}
                          onChange={(e) => updateTestDraft(module.id, { title: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Стратегія</InputLabel>
                          <Select
                            value={testDrafts[module.id]?.strategyType || GradingStrategyType.Auto}
                            label="Стратегія"
                            onChange={(e) => updateTestDraft(module.id, { strategyType: e.target.value as GradingStrategyType })}
                          >
                            <MenuItem value={GradingStrategyType.Auto}>Auto</MenuItem>
                            <MenuItem value={GradingStrategyType.Manual}>Manual</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button variant="contained" onClick={() => handleCreateOrUpdateTest(module.id)}>
                          Створити тест
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
export default CourseEditPage;