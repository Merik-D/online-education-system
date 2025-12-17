import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LessonDto, MyCourseDetailsDto } from '../models/learning.models';
import { getLessonById, getCourseDetails, completeLesson } from '../services/learningService';
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

const LessonPage = () => {
  const { lessonId, courseId } = useParams<{ lessonId: string; courseId: string }>();
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [courseDetails, setCourseDetails] = useState<MyCourseDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      try {
        setLoading(true);
        const data = await getLessonById(Number(lessonId));
        setLesson(data);
        
        // Fetch course details if courseId is available
        if (courseId) {
          try {
            const details = await getCourseDetails(Number(courseId));
            setCourseDetails(details);
          } catch (err) {
            console.warn('Could not fetch course details:', err);
          }
        }
      } catch (err) {
        setError('Error fetching lesson details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, courseId]);

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

  if (loading) {
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
      {/* Header */}
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

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Player Area - Left Side */}
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
          {loading ? (
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

        {/* Sidebar - Right Side */}
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
            {/* Sidebar Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
            </Box>

            {/* Course Modules List */}
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
                            component={Link}
                            to={courseId ? `/my-courses/${courseId}/lesson/${l.id}` : `/lesson/${l.id}`}
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
                              {l.type === LessonType.Video ? (
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
                </Accordion>
              ))}
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