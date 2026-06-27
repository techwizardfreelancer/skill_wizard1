import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Button, Stack, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const colors = ['#4dabf5', '#00c853', '#ff8c00', '#f50057'];

const AssessmentPerformancePage = () => {
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        const [perfRes, historyRes] = await Promise.all([
          api.get('/student/assessments/performance'),
          api.get('/student/assessments/history'),
        ]);
        setPerformance(perfRes.data);
        setHistory(historyRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to load assessment performance data', error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  const performanceData = performance
    ? [
        { name: 'Passed', value: performance.passedCount || 0 },
        { name: 'Failed', value: performance.failedCount || 0 },
        { name: 'Pending', value: performance.pendingCount || 0 },
      ]
    : [];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Assessment Performance
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <Paper elevation={2} sx={{ flex: 1, p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Summary Metrics
          </Typography>
          {loading ? (
            <Typography>Loading performance metrics...</Typography>
          ) : performance ? (
            <Grid container spacing={2}>
              {[
                { label: 'Total Attempts', value: performance.totalAttempts },
                { label: 'Passed', value: performance.passedCount },
                { label: 'Failed', value: performance.failedCount },
                { label: 'Pending Review', value: performance.pendingCount },
                { label: 'Average Score', value: `${performance.averageScore}%` },
                { label: 'Best Score', value: `${performance.bestScore}%` },
                { label: 'Pass Rate', value: `${performance.passRate}%` },
              ].map((metric) => (
                <Grid item xs={12} sm={6} key={metric.label}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">
                      {metric.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {metric.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No performance data available yet.</Typography>
          )}
        </Paper>

        <Paper elevation={2} sx={{ width: { xs: '100%', md: 360 }, p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Result Distribution
          </Typography>
          {loading ? (
            <Typography>Loading chart...</Typography>
          ) : performance ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={performanceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Typography>No results to visualize.</Typography>
          )}
        </Paper>
      </Stack>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Recent Attempts
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              Latest results from your last 5 attempts
            </Typography>
          </Box>
          <Button component={Link} to="/student/assessments/history" variant="outlined" size="small">
            View Full History
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {loading ? (
            <Grid item xs={12}>
              <Typography>Loading recent attempts...</Typography>
            </Grid>
          ) : history.length > 0 ? (
            history.map((item) => (
              <Grid item xs={12} md={6} key={item._id}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.assessmentName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.status} • {item.result} • {new Date(item.submittedAt).toLocaleString()}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {item.score ?? 0}%
                  </Typography>
                </Paper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography>No recent attempts found yet.</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box>
        <Typography variant="body2" color="text.secondary">
          Your performance dashboard summarizes attempt counts, pass/fail trends, and recent results so you can track progress over time.
        </Typography>
      </Box>
    </Box>
  );
};

export default AssessmentPerformancePage;
