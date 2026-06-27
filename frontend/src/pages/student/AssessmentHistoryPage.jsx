import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Stack, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AssessmentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyRes, perfRes] = await Promise.all([
          api.get('/student/assessments/history'),
          api.get('/student/assessments/performance'),
        ]);
        setHistory(historyRes.data || []);
        setPerformance(perfRes.data || null);
      } catch (error) {
        console.error('Failed to fetch assessment history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Assessment History
      </Typography>

      {performance && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Attempts', value: performance.totalAttempts },
            { label: 'Passed', value: performance.passedCount },
            { label: 'Failed', value: performance.failedCount },
            { label: 'Pending Review', value: performance.pendingCount },
            { label: 'Average Score', value: `${performance.averageScore}%` },
            { label: 'Best Score', value: `${performance.bestScore}%` },
            { label: 'Pass Rate', value: `${performance.passRate}%` },
          ].map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.label}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {metric.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {metric.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {loading && <Typography>Loading your assessment history...</Typography>}

      {!loading && history.length === 0 && (
        <Card>
          <CardContent>
            <Typography>No assessment attempts have been recorded yet.</Typography>
          </CardContent>
        </Card>
      )}

      {history.map((item) => (
        <Card key={item._id} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="start" spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {item.assessmentName || 'Untitled Assessment'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Submitted: {formatDate(item.submittedAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {item.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Result: {item.result}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: {item.marksObtained}/{item.totalMarks} ({item.score ?? 0}%)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time Taken: {item.timeTaken ? `${item.timeTaken}s` : '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Passed / Failed Tests: {item.passedTestCases ?? 0} / {item.failedTestCases ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Violations: {item.violations ?? 0}
                </Typography>
              </Box>

              <Stack spacing={1} alignItems="flex-end">
                <Chip
                  label={`${item.score ?? 0}%`}
                  color={item.result === 'Pass' ? 'success' : item.result === 'Fail' ? 'error' : 'warning'}
                  size="small"
                />
                <Button
                  component={Link}
                  to={`/student/assessments/${item.assessmentId}`}
                  size="small"
                  variant="outlined"
                >
                  View Assessment
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AssessmentHistoryPage;
