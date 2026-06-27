import { Box, Button, Card, CardContent, CardMedia, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MyCoursesPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesResponse, enrollmentsResponse] = await Promise.all([
          api.get('/student/courses/available'),
          api.get('/student/courses/enrolled'),
        ]);

        const availableCourses = coursesResponse.data;
        const enrollments = enrollmentsResponse.data;

        const mappedCourses = enrollments
          .map((enrollment) => {
            const course = availableCourses.find(
              (item) => item._id === enrollment.courseId?._id || item._id === enrollment.courseId,
            );
            if (!course) {
              return null;
            }
            return { course, enrollment };
          })
          .filter(Boolean);

        setEnrolledCourses(mappedCourses);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Typography>Loading my courses...</Typography>;
  }

  if (!enrolledCourses.length) {
    return <Typography color="text.secondary">You are not enrolled in any courses yet.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        My Courses
      </Typography>
      <Grid container spacing={3}>
        {enrolledCourses.map(({ course, enrollment }) => {
          const totalLevels = course.totalLevels || course.levels || 1;
          const currentLevel = enrollment.currentLevel || 0;
          const progress = enrollment.progress || 0;
          const nextLevel = currentLevel > 0 && progress === 100 && currentLevel < totalLevels ? currentLevel + 1 : currentLevel || 1;
          const actionLabel = progress === 100 && currentLevel < totalLevels ? `Register Level ${nextLevel}` : `Continue Level ${nextLevel}`;
          const progressLabel = `${progress}% complete`;
          const imageUrl = course.image || 'https://via.placeholder.com/640x360?text=Course+Preview';

          return (
            <Grid item xs={12} md={6} key={course._id}>
              <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardMedia component="img" height="240" image={imageUrl} alt={course.title} sx={{ objectFit: 'cover' }} />

                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack spacing={1}>
                      <Typography variant="h5" fontWeight={700}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.description}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`Level ${currentLevel || 1}`} size="small" color="primary" />
                      <Chip label={progressLabel} size="small" />
                      <Chip label={`${totalLevels} Levels`} size="small" />
                    </Stack>

                    <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />

                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {actionLabel}
                      </Typography>
                      <Button variant="contained" onClick={() => navigate(`/student/courses/${course._id}`)}>
                        View
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MyCoursesPage;
