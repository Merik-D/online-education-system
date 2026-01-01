import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LessonDto, MyCourseDetailsDto } from '../models/learning.models';
import { getLessonById, getCourseDetails, completeLesson } from '../services/learningService';
import { generateCertificateForCourse } from '../services/certificateService';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import { LessonType } from '../models/enums';
import YouTube from 'react-youtube';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ArticleIcon from '@mui/icons-material/Article';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
const LessonPage = () => {
  const { lessonId, courseId } = useParams<{ lessonId: string; courseId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [courseDetails, setCourseDetails] = useState<MyCourseDetailsDto | null>(null);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [certificateMessage, setCertificateMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const courseDetailsLoadedRef = useRef(false);
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId || courseDetailsLoadedRef.current) return;
      try {
        const details = await getCourseDetails(Number(courseId));
        setCourseDetails(details);
        courseDetailsLoadedRef.current = true;
      } catch (err) {
        console.warn('Could not fetch course details:', err);
      }
    };
    fetchCourseDetails();
  }, [courseId]);
  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      try {
        setLessonLoading(true);
        setError('');
        const data = await getLessonById(Number(lessonId));
        setLesson(data);
      } catch (err) {
        setError('Error fetching lesson details.');
        console.error(err);
      } finally {
        setLessonLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);
  const handleLessonClick = useCallback((newLessonId: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const path = courseId ? `/my-courses/${courseId}/lesson/${newLessonId}` : `/lesson/${newLessonId}`;
    navigate(path, { replace: false });
  }, [courseId, navigate]);
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    } else {
      console.error('Could not parse YouTube URL:', url);
      return null;
    }
  };
  const handleCompleteLesson = async () => {
    if (!lessonId) return;
    try {
      setCompletionLoading(true);
      await completeLesson(Number(lessonId));
      setShowSuccessMessage(true);
      if (courseId) {
        try {
          const updatedDetails = await getCourseDetails(Number(courseId));
          setCourseDetails(updatedDetails);
        } catch {}
      }
      try {
        if (courseId) {
          const { trackInteraction } = await import('../services/recommendationService');
          await trackInteraction(Number(courseId), 'complete');
        }
      } catch {}
    } catch (err) {
      console.error('Error completing lesson:', err);
      setError('Failed to mark lesson as complete. Please try again.');
    } finally {
      setCompletionLoading(false);
    }
  };
  let youtubeId: string | null = null;
  if (lesson && lesson.type === LessonType.Video && lesson.videoUrl) {
    youtubeId = getYouTubeId(lesson.videoUrl);
  }
  if (lessonLoading && !lesson) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }
  if (!lesson) {
    return (
      <Box sx={{ backgroundColor: '#f7f7f7', minHeight: '100vh', py: 4 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
          <Typography variant="h6" color="textSecondary">
            Lesson not found.
          </Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ backgroundColor: '#1f1f1f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {}
      <Box
        sx={{
          backgroundColor: '#1f1f1f',
          borderBottom: '1px solid #333',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button
          component={Link}
          to="/my-courses"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          Back to Course
        </Button>
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 700,
            flex: 1,
            ml: 3,
            fontSize: { xs: '0.9rem', md: '1rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {lesson.title}
        </Typography>
        {courseDetails && (
          <IconButton
            onClick={() => setShowSidebar(!showSidebar)}
            sx={{
              color: '#fff',
              ml: 2,
              display: { xs: 'flex', md: 'none' },
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            {showSidebar ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </Box>
      {}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {}
        <Box
          sx={{
            flex: 1,
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            minHeight: 0,
            position: 'relative',
            width: '100%',
          }}
        >
          {lessonLoading ? (
            <CircularProgress sx={{ color: '#a435f0' }} />
          ) : lesson.type === LessonType.Video && youtubeId ? (
            <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <YouTube
                  videoId={youtubeId}
                  opts={{
                    height: '100%',
                    width: '100%',
                    playerVars: {
                      autoplay: 0,
                      controls: 1,
                    },
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Box>
              <Box sx={{ backgroundColor: '#1a1a1a', p: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleCompleteLesson}
                  disabled={completionLoading}
                >
                  {completionLoading ? 'Completing...' : 'Mark as Complete'}
                </Button>
              </Box>
            </Box>
          ) : lesson.type === LessonType.Text ? (
            <Box
              sx={{
                backgroundColor: '#2a2a2a',
                p: { xs: 2, sm: 3, md: 4 },
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%', pb: 4 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                    color: '#fff',
                    lineHeight: 1.3,
                  }}
                >
                  {lesson.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.9,
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                    color: '#e0e0e0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    letterSpacing: '0.2px',
                    mb: 4,
                  }}
                >
                  {lesson.textContent}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleCompleteLesson}
                  disabled={completionLoading}
                  sx={{ mt: 2 }}
                >
                  {completionLoading ? 'Completing...' : 'Mark as Complete'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="h6" sx={{ color: '#fff', textAlign: 'center' }}>
              📄 Content not available
            </Typography>
          )}
        </Box>
        {}
        {courseDetails && (
          <Box
            sx={{
              width: { xs: '100%', md: '350px' },
              backgroundColor: '#f7f7f7',
              borderLeft: { xs: 'none', md: '1px solid #e0e0e0' },
              display: showSidebar ? 'flex' : 'none',
              flexDirection: 'column',
              position: { xs: 'absolute', md: 'relative' },
              top: { xs: 0, md: 'auto' },
              right: { xs: 0, md: 'auto' },
              height: { xs: '100%', md: 'auto' },
              zIndex: 10,
              boxShadow: { xs: '-4px 0 12px rgba(0,0,0,0.15)', md: 'none' },
            }}
          >
            {}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                Course content
                <IconButton
                  size="small"
                  onClick={() => setShowSidebar(false)}
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Typography>
              {courseDetails && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="textSecondary">
                      {courseDetails.completedLessonsCount} / {courseDetails.totalLessonsCount} lessons
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: courseDetails.progress === 100 ? '#10b981' : '#a435f0' }}>
                      {Math.round(courseDetails.progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={courseDetails.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: courseDetails.progress === 100 ? '#10b981' : '#a435f0',
                        borderRadius: 3,
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
            {}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {courseDetails.modules.map((module) => (
                <Accordion
                  key={module.id}
                  defaultExpanded
                  sx={{
                    boxShadow: 'none',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: '#fff',
                      '&.Mui-expanded': { minHeight: '48px' },
                      p: 1.5,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {module.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <List sx={{ width: '100%', p: 0 }}>
                      {module.lessons.map((l) => {
                        const isCurrentLesson = l.id === lesson.id;
                        return (
                          <ListItemButton
                            key={l.id}
                            onClick={(e) => handleLessonClick(l.id, e)}
                            selected={isCurrentLesson}
                            sx={{
                              pl: 4,
                              backgroundColor: isCurrentLesson ? 'rgba(164, 53, 240, 0.1)' : 'transparent',
                              borderLeft: isCurrentLesson ? '4px solid #a435f0' : 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.04)',
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: '32px',
                                color: isCurrentLesson ? '#a435f0' : '#999',
                              }}
                            >
                              {l.isCompleted ? (
                                <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                              ) : l.type === LessonType.Video ? (
                                <PlayCircleIcon fontSize="small" />
                              ) : (
                                <ArticleIcon fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: isCurrentLesson ? 600 : 500,
                                    color: isCurrentLesson ? '#a435f0' : '#333',
                                    fontSize: '0.85rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {l.title}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </AccordionDetails>
                  {}
                  {module.test && module.completedLessonsCount === module.totalLessonsCount && (
                    <Box sx={{ p: 2, backgroundColor: '#f0e6ff', borderTop: '1px solid #e0e0e0' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          backgroundColor: '#a435f0',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#8e2dd6',
                          },
                        }}
                        component={Link}
                        to={`/test/${module.test.id}`}
                      >
                        📝 {module.test.title}
                      </Button>
                    </Box>
                  )}
                </Accordion>
              ))}
              {}
              {courseDetails && courseDetails.progress === 100 && (
                <Box sx={{ p: 2, mt: 2, backgroundColor: '#fff5e6', borderRadius: 1, border: '2px solid #ffa500' }}>
                  {certificateMessage && (
                    <Alert
                      severity={certificateMessage.includes('success') || certificateMessage.includes('generated') ? 'success' : 'warning'}
                      sx={{ mb: 2, fontSize: '0.85rem' }}
                      onClose={() => setCertificateMessage('')}
                    >
                      {certificateMessage}
                    </Alert>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EmojiEventsIcon />}
                    onClick={async () => {
                      setGeneratingCertificate(true);
                      setCertificateMessage('');
                      try {
                        const response = await generateCertificateForCourse(courseDetails.courseId);
                        setCertificateMessage(response.message);
                        setTimeout(() => {
                          navigate('/certificates');
                        }, 2000);
                      } catch (err: any) {
                        if (err.response && err.response.data.error) {
                          setCertificateMessage(err.response.data.error);
                        } else {
                          setCertificateMessage('Unable to generate certificate. Please ensure all tests are passed with 70% or higher.');
                        }
                      } finally {
                        setGeneratingCertificate(false);
                      }
                    }}
                    disabled={generatingCertificate}
                    sx={{
                      background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      py: 1.5,
                      boxShadow: '0 3px 5px 2px rgba(255, 165, 0, .3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FFA500 30%, #FFD700 90%)',
                        boxShadow: '0 4px 8px 3px rgba(255, 165, 0, .4)',
                      },
                      '&:disabled': {
                        background: '#ccc',
                        color: '#666',
                      },
                    }}
                  >
                    {generatingCertificate ? '🏆 Generating...' : '🏆 Generate Certificate'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    Available when all lessons complete and all tests passed
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={() => setShowSuccessMessage(false)}
        message="Lesson marked as complete! 🎉"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};
export default LessonPage;