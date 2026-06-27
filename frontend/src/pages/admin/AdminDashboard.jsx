import { Box, Grid, Typography, Stack, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';

const statCards = [
  { label: 'Total Students', key: 'studentCount', icon: <PeopleIcon />, color: '#2563eb' },
  { label: 'Total Courses', key: 'courseCount', icon: <MenuBookIcon />, color: '#7c3aed' },
  { label: 'Programming Questions', key: 'programmingQuestionCount', icon: <CodeIcon />, color: '#0f766e' },
  { label: 'Completed Tests', key: 'completedTestCount', icon: <CheckCircleIcon />, color: '#14b8a6' },
];

const AdminDashboard = () => {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api
      .get('/admin/summary')
      .then((response) => setSummary(response.data))
      .catch((err) => {
        console.error('Failed to load admin summary', err);
      });
  }, []);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A premium workspace for managing questions, assessments, students, and performance trends.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.key}>
            <StatCard
              label={card.label}
              value={summary[card.key] ?? '--'}
              icon={card.icon}
              trend={card.trend}
              color={card.color}
            />
          </Grid>
        ))}

        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, minHeight: 320 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Weekly activity
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  Engagement overview
                </Typography>
              </Box>
              <Box sx={{ px: 2, py: 1, bgcolor: '#eef2ff', borderRadius: 2 }}>
                <Typography variant="caption" color="primary.main">
                  Live
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ width: '100%', height: 220, borderRadius: 4, bgcolor: '#f8fafc', display: 'grid', placeItems: 'center', color: '#64748b' }}>
              Chart placeholder
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, minHeight: 320 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Recent activities
            </Typography>
            <Stack spacing={2}>
              {[
                'New student enrolled in Advanced React',
                'Question bank updated with 12 new problems',
                'Assessment “June Cohort” published',
                'Performance report generated for student cohort',
              ].map((item) => (
                <Paper key={item} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="body2">{item}</Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Business snapshot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This dashboard keeps the same backend logic and API endpoints while upgrading presentation, spacing, and responsive layouts.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
