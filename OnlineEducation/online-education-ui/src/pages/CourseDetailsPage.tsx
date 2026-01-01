import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CourseDto } from '../models/course.models';
import { MyCourseDetailsDto } from '../models/learning.models';
import { getCourseById } from '../services/courseService';
import { enrollInCourse } from '../services/learningService';
import { getMyCourses, getCourseDetails } from '../services/learningService';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Divider,
  TextField,
  Rating,
} from '@mui/material';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import DescriptionIcon from '@mui/icons-material/Description';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LessonType } from '../models/enums';
import { ratingsService } from '../services/ratingsService';
import { RatingDto } from '../models/rating.models';
import { trackInteraction } from '../services/recommendationService';
const CourseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { auth, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [courseDetails, setCourseDetails] = useState<MyCourseDetailsDto | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isStudent = auth?.roles.includes('Student') ?? false;
  const [ratings, setRatings] = useState<RatingDto[]>([]);
  const [myRating, setMyRating] = useState<RatingDto | null>(null);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        const courseData = await getCourseById(Number(id));
        setCourse(courseData);
        try {
          const detailsData = await getCourseDetails(Number(id));
          setCourseDetails(detailsData);
        } catch (err) {
          console.log('Course details not available');
        }
        if (isLoggedIn()) {
          const myCoursesData = await getMyCourses();
          const enrolled = myCoursesData.some(
            (myCourse) => myCourse.id === Number(id)
          );
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        setError('Error fetching course details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id, isLoggedIn]);
  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        await trackInteraction(Number(id), 'view');
      } catch (e) {
        console.warn('track view failed', e);
      }
      try {
        const list = await ratingsService.getCourseRatings(Number(id));
        setRatings(list);
        if (isLoggedIn() && auth?.fullName) {
          const mine = list.find(r => r.studentName === auth.fullName) || null;
          setMyRating(mine);
        }
      } catch (e) {
        console.warn('load ratings failed', e);
      }
    };
    run();
  }, [id, isLoggedIn]);
  const handleSubmitRating = async () => {
    if (!id || !newRating) return;
    try {
      const created = await ratingsService.submitRating({ courseId: Number(id), rating: newRating, comment: newComment });
      setMyRating(created);
      setRatings((prev) => [created, ...prev]);
      setNewRating(null);
      setNewComment('');
      setSuccess('Rating submitted successfully!');
      try { await trackInteraction(Number(id), 'rate'); } catch {}
    } catch (e: any) {
      console.error('submit rating failed', e);
      setError(e.response?.data?.message || 'Failed to submit rating. Please try again.');
    }
  };
  const handleDeleteRating = async () => {
    if (!myRating) return;
    try {
      await ratingsService.deleteMyRating(myRating.id);
      setRatings((prev) => prev.filter(r => r.id !== myRating.id));
      setMyRating(null);
    } catch (e) {
      console.error('delete rating failed', e);
    }
  };
  const handleEnroll = async () => {
    if (!id) return;
    setError('');
    setSuccess('');
    try {
      await enrollInCourse(Number(id));
      setSuccess('Successfully enrolled! Redirecting to your course...');
      setIsEnrolled(true);
      try { await trackInteraction(Number(id), 'enroll'); } catch {}
      setTimeout(() => {
        navigate('/my-courses');
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error enrolling in course.');
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
  if (error && !success) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (!course) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          Course not found.
        </Typography>
      </Container>
    );
  }
  return (
    <Box>
      {}
      <Box
        sx={{
          backgroundColor: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          color: 'white',
          py: 6,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Chip
            label={course.level}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.8rem', md: '2.8rem' },
            }}
          >
            {course.title}
          </Typography>
        </Container>
      </Box>
      {}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: { xs: 'block', md: 'grid' }, gridTemplateColumns: '1fr 320px', gap: 4 }}>
          {}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              About this course
            </Typography>
            <Typography paragraph>{course.description}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
              Course Details
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="textSecondary">Level</Typography>
                <Typography fontWeight={500}>{course.level}</Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 4 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Ratings
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating value={ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0} precision={0.1} readOnly />
                <Typography variant="body2" color="textSecondary">{ratings.length} ratings</Typography>
              </Box>
              {isLoggedIn() && isStudent && !myRating && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Rating value={newRating} onChange={(_, v) => setNewRating(v)} />
                  <TextField label="Comment (optional)" value={newComment} onChange={(e) => setNewComment(e.target.value)} multiline minRows={2} />
                  <Button variant="contained" onClick={handleSubmitRating} disabled={!newRating} sx={{ alignSelf: 'flex-start', backgroundColor: '#a435f0', '&:hover': { backgroundColor: '#942fb8' } }}>Submit Rating</Button>
                </Box>
              )}
              {myRating && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">Your rating</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={myRating.rating} readOnly />
                    <Button size="small" color="error" onClick={handleDeleteRating}>Delete</Button>
                  </Box>
                  {myRating.comment && <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{myRating.comment}</Typography>}
                </Box>
              )}
              {ratings.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {ratings.map((r) => (
                    <Box key={r.id} sx={{ border: '1px solid #eee', borderRadius: 1, p: 2 }}>
                      <Rating value={r.rating} readOnly size="small" />
                      {r.comment && <Typography variant="body2" sx={{ mt: 1 }}>{r.comment}</Typography>}
                      <Typography variant="caption" color="textSecondary">{new Date(r.createdAt).toLocaleString()}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            {}
            {courseDetails && courseDetails.modules.length > 0 && (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
                  Course Content
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {courseDetails.modules.length} modules • {courseDetails.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {courseDetails.modules.map((module, moduleIndex) => (
                    <Accordion
                      key={module.id}
                      defaultExpanded={moduleIndex === 0}
                      sx={{
                        backgroundColor: '#f5f5f5',
                        '&:before': { display: 'none' },
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 500 }}>
                          {module.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 'auto',
                            color: '#999',
                          }}
                        >
                          {module.lessons.length} lessons
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <List sx={{ p: 0, width: '100%' }}>
                          {module.lessons.map((lesson) => (
                            <ListItem
                              key={lesson.id}
                              sx={{
                                py: 1,
                                px: 2,
                                borderTop: '1px solid #e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                              }}
                            >
                              {lesson.type === LessonType.Video ? (
                                <OndemandVideoIcon
                                  sx={{ fontSize: '1rem', color: '#a435f0' }}
                                />
                              ) : (
                                <DescriptionIcon
                                  sx={{ fontSize: '1rem', color: '#a435f0' }}
                                />
                              )}
                              <Typography variant="body2">
                                {lesson.title}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </>
            )}
          </Box>
          {}
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              p: 3,
              height: 'fit-content',
              position: 'sticky',
              top: 20,
            }}
          >
            <Box
              sx={{
                backgroundColor: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                height: 180,
                borderRadius: '8px',
                mb: 3,
              }}
            />
            {isLoggedIn() && isStudent && (
              <>
                {isEnrolled ? (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    component={Link}
                    to={`/player/${course.id}`}
                    sx={{
                      backgroundColor: '#1f1f1f',
                      mb: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#333',
                      },
                    }}
                  >
                    Go to Course
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleEnroll}
                    sx={{
                      backgroundColor: '#a435f0',
                      mb: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#942fb8',
                      },
                    }}
                  >
                    Enroll Now
                  </Button>
                )}
              </>
            )}
            {!isLoggedIn() && (
              <Button
                fullWidth
                variant="contained"
                size="large"
                component={Link}
                to="/login"
                sx={{
                  backgroundColor: '#a435f0',
                  mb: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#942fb8',
                  },
                }}
              >
                Sign in to Enroll
              </Button>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
export default CourseDetailsPage;