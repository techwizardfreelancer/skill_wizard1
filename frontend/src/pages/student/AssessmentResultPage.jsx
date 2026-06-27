import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Alert, CircularProgress, Grid } from '@mui/material';
import api from '../../services/api';

const AssessmentResultPage = () => {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      if (result) return;

      setLoading(true);
      try {
        const historyRes = await api.get('/student/assessments/history');
        const latest = (historyRes.data || []).
          filter((item) => item.assessmentId === assessmentId)
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

        if (!latest) {
          setError('Result not found. Your submission may still be processing.');
          return;
        }

        setResult(latest);
      } catch (err) {
        console.error(err);
        setError('Unable to load your assessment result.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [assessmentId, result]);

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  const handleBack = () => {
    navigate('/student/assessments');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleBack}>
            Back to Assessments
          </Button>
        </Box>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="warning">No result data available.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleBack}>
            Back to Assessments
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Assessment Result
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Submitted: {formatDate(result.submittedAt)}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Summary
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {result.status}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Result:</strong> {result.result}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Score:</strong> {result.percentage}%
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Marks:</strong> {result.marksObtained}/{result.totalMarks}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Time Taken:</strong> {result.timeTaken ? `${result.timeTaken}s` : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Test Case & Integrity Metrics
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Passed Test Cases:</strong> {result.passedTestCases ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Failed Test Cases:</strong> {result.failedTestCases ?? 0}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Violations:</strong> {result.violations ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Button variant="contained" onClick={handleBack}>
        Back to Assessments
      </Button>
    </Box>
  );
};

export default AssessmentResultPage;
