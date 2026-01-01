import React, { useEffect, useState } from 'react';
import { CertificateDto } from '../models/certificate.models';
import { getMyCertificates } from '../services/certificateService';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GradeIcon from '@mui/icons-material/Grade';
const CertificatesPage = () => {
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await getMyCertificates();
        setCertificates(data);
      } catch (err) {
        setError('Failed to load certificates');
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);
  if (loading) {
    return (
      <Box className="loading-container" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
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
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          My Certificates
        </Typography>
        <Typography color="textSecondary">
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
        </Typography>
      </Box>
      {certificates.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <WorkspacePremiumIcon sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
            No certificates yet
          </Typography>
          <Typography color="textSecondary">
            Complete courses and pass tests to earn certificates
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {certificates.map((cert) => (
            <Box key={cert.id}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                  },
                }}
              >
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <WorkspacePremiumIcon sx={{ fontSize: 80, opacity: 0.9 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                        Certificate of Completion
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        {cert.courseTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon fontSize="small" />
                          <Typography variant="body2">
                            Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {cert.score !== undefined && cert.score !== null && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GradeIcon fontSize="small" />
                            <Typography variant="body2">
                              Score: {Math.round(cert.score)}%
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Chip
                        label={`Certificate #${cert.id}`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};
export default CertificatesPage;