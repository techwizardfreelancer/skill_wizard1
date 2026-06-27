import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Paper, Button, Stack } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [profile, setProfile] = useState(null);
  const [bookedSlotCount, setBookedSlotCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, cRes, pRes] = await Promise.all([
          api.get('/student/assessments', { params: { status: 'upcoming' } }),
          api.get('/student/assessments/history'),
          api.get('/auth/me'),
        ]);
        setUpcoming(uRes.data || []);
        setCompleted(cRes.data || []);
        setProfile(pRes.data.user || null);
      } catch (err) {
        console.error(err);
      }
    };

    const loadBookedSlots = () => {
      let count = 0;
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('bookedSlot:')) count += 1;
      });
      setBookedSlotCount(count);
    };

    load();
    loadBookedSlots();
  }, []);

  const stats = [
    {
      label: 'Upcoming Tests',
      value: upcoming.length,
      icon: <EventNoteIcon />, 
      color: '#2563eb',
      trend: `${upcoming.length} active assignment${upcoming.length === 1 ? '' : 's'}`,
    },
    {
      label: 'Booked Slots',
      value: bookedSlotCount,
      icon: <PeopleIcon />,
      color: '#7c3aed',
      trend: `${bookedSlotCount} booked`,
    },
    {
      label: 'Completed Assessments',
      value: completed.length,
      icon: <BarChartIcon />,
      color: '#14b8a6',
      trend: `${completed.length} results available`,
    },
    {
      label: 'Profile Status',
      value: profile?.name || 'Not set',
      icon: <PersonIcon />,
      color: '#0f766e',
      trend: profile ? profile.email : 'Complete your profile',
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} mb={1}>
            Student Dashboard
          </Typography>
          <Typography color="text.secondary" variant="body1">
            A streamlined view of your upcoming assessments, learning progress, and profile activity.
          </Typography>
        </Box>

        <Button variant="contained" size="large" onClick={() => navigate('/student/assessments')}>
          View Assessments
        </Button>
      </Stack>

      <Grid container spacing={3} mb={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.label}>
            <StatCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Upcoming assessments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quickly access tests that are scheduled and ready to start.
                </Typography>
              </Box>
              <Button variant="text" size="small" onClick={() => navigate('/student/assessments')}>
                See all
              </Button>
            </Stack>

            {upcoming.length === 0 ? (
              <Typography color="text.secondary">
                No upcoming assessments yet. Browse available courses and schedule a new assessment.
              </Typography>
            ) : (
              upcoming.slice(0, 3).map((item) => (
                <Paper key={item.id || item.title} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography fontWeight={700}>{item.title || item.name || 'Upcoming assessment'}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {item.startTime
                          ? new Date(item.startTime).toLocaleString()
                          : item.date
                          ? new Date(item.date).toLocaleString()
                          : 'Schedule pending'}
                      </Typography>
                    </Box>
                    <Button variant="outlined" size="small" onClick={() => navigate('/student/assessments')}>
                      Open
                    </Button>
                  </Stack>
                </Paper>
              ))
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Progress summary
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Keep your momentum with review steps, course exploration, and personalized profile actions.
            </Typography>
            <Stack spacing={2}>
              <Button variant="outlined" fullWidth onClick={() => navigate('/student/assessments/performance')}>
                View Performance
              </Button>
              <Button variant="outlined" fullWidth onClick={() => navigate('/student/courses')}>
                Explore Courses
              </Button>
              <Button variant="contained" fullWidth onClick={() => navigate('/student/profile')}>
                Update Profile
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
