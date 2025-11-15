import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LessonDto } from '../models/learning.models';
import { getLessonById } from '../services/learningService';
import { Container, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { LessonType } from '../models/enums';

// --- 1. Імпортуємо нову бібліотеку ---
import YouTube from 'react-youtube';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      try {
        setLoading(true);
        const data = await getLessonById(Number(lessonId));
        setLesson(data);
      } catch (err) {
        setError('Error fetching lesson details.');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // --- 2. Функція для безпечного витягування ID ---
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return match[2];
    } else {
      console.error("Could not parse YouTube URL:", url);
      return null;
    }
  };
  
  let youtubeId: string | null = null;
  if (lesson && lesson.type === LessonType.Video && lesson.videoUrl) {
    youtubeId = getYouTubeId(lesson.videoUrl);
  }

  const playerOptions = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!lesson) return <Typography>Урок не знайдено.</Typography>;

  return (
    <Container maxWidth="md">
      <Typography variant="h3" gutterBottom>
        {lesson.title}
      </Typography>

      <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
        
        {lesson.type === LessonType.Video && youtubeId && (
          <YouTube
            videoId={youtubeId}
            opts={playerOptions}
            style={{ width: '100%', maxWidth: '640px', margin: 'auto' }}
          />
        )}

        {lesson.type === LessonType.Text && (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {lesson.textContent}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default LessonPage;