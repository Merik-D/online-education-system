import React, { useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, Tabs, Tab, CircularProgress, Alert, Card, CardContent, CardActions, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { ApiResponse, CourseRecommendationListDto, RecommendedCourseDto } from '../models/recommendation.models';
import { getMyRecommendations, getTrending, getSimilar, markRecommendationViewed, trackInteraction } from '../services/recommendationService';
import { Link } from 'react-router-dom';
const RecommendationsPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<ApiResponse<CourseRecommendationListDto> | null>(null);
  const tabs = useMemo(() => [
    { label: 'For You', fetcher: getMyRecommendations, requiresAuth: true },
    { label: 'Trending', fetcher: getTrending, requiresAuth: false },
    { label: 'Similar', fetcher: getSimilar, requiresAuth: true },
  ], []);
  const load = async (index: number) => {
    const { fetcher, requiresAuth } = tabs[index];
    if (requiresAuth && !isLoggedIn()) {
      setData(null);
      setError('Please log in to see personalized recommendations.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetcher();
      setData(res);
    } catch (e: any) {
      console.error('Error loading recommendations:', e);
      const message = e.response?.data?.message || e.message || 'Failed to load recommendations';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(tab);
  }, [tab]);
  const handleViewed = async (rec: RecommendedCourseDto) => {
    try {
      await markRecommendationViewed(rec.recommendationId);
    } catch (e) {
      console.warn('Failed to mark viewed', e);
    }
  };
  const handleViewCourse = async (rec: RecommendedCourseDto) => {
    try {
      await trackInteraction(rec.id, 'view');
      await handleViewed(rec);
    } catch {}
  };
  const list = data?.data?.recommendations ?? [];
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Recommendations</Typography>
        <Typography color="textSecondary">Personalized suggestions and popular picks</Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {tabs.map((t, i) => (
          <Tab key={i} label={t.label} />
        ))}
      </Tabs>
      {loading && (
        <Box className="loading-container"><CircularProgress /></Box>
      )}
      {!loading && error && (
        <Alert severity="info">{error}</Alert>
      )}
      {!loading && !error && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
        }}>
          {list.map((rec) => (
            <Card key={rec.recommendationId} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '2rem', height: 120
              }}>
                {rec.title.charAt(0).toUpperCase()}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{rec.title}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{rec.description?.substring(0, 80)}...</Typography>
                <Typography variant="caption" sx={{ display: 'inline-block', mt: 1, background: '#f0f0f0', px: 1, borderRadius: 1 }}>{rec.level}</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  {rec.recommendationReason}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to={`/courses/${rec.id}`}
                  onClick={() => handleViewCourse(rec)}
                  sx={{ backgroundColor: '#a435f0', '&:hover': { backgroundColor: '#942fb8' } }}
                >
                  View Course
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};
export default RecommendationsPage;