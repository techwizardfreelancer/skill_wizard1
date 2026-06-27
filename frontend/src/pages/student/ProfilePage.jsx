import { Box, Avatar, Button, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/student/profile').then((response) => setProfile(response.data)).catch(console.error);
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Profile
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ p: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Avatar
                src={profile?.student?.profileImage || undefined}
                sx={{ width: 96, height: 96, bgcolor: 'primary.main' }}
              >
                {!profile?.student?.profileImage && (profile?.student?.name?.[0] || 'S')}
              </Avatar>
              <Typography variant="h6">{profile?.student?.name}</Typography>
              <Typography color="text.secondary">{profile?.student?.email}</Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/student/change-password')}>
                Change Password
              </Button>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ p: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography>{profile?.student?.department}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Year
                  </Typography>
                  <Typography>{profile?.student?.year}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Section
                  </Typography>
                  <Typography>{profile?.student?.section}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed Courses
                  </Typography>
                  <Typography>{profile?.completedCourses}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Overall Progress
                  </Typography>
                  <LinearProgress variant="determinate" value={profile?.progress || 0} sx={{ height: 12, borderRadius: 6 }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
