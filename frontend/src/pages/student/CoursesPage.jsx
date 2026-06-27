import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/student/courses/available').then((response) => setCourses(response.data)).catch(console.error);
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Courses Available
      </Typography>
      <Grid container spacing={3}>
        {courses.map((course) => {
          const totalLevels = course.totalLevels || 1;
          const levelChips = Array.from({ length: totalLevels }, (_, index) => (
            <Chip key={index} label={`L${index + 1}`} size="small" color="default" variant="outlined" />
          ));

          return (
            <Grid item xs={12} md={6} lg={4} key={course._id}>
              <Card elevation={4} sx={{ borderRadius: 3, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
                        <CardActionArea
                          onClick={() => navigate(`/student/courses/${course._id}`)}
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', flexGrow: 1 }}
                        >
                  {course.image ? (
                    <CardMedia
                      component="img"
                      height="180"
                      image={course.image}
                      alt={course.title || 'Course image'}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <CardMedia
                      component="div"
                      sx={{
                        height: 180,
                        bgcolor: '#f5f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        No image available
                      </Typography>
                    </CardMedia>
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
                      <Chip label={course.category || 'General'} size="small" color="primary" />
                      <Chip label={course.difficulty || 'Beginner'} size="small" color="success" />
                    </Stack>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2} noWrap>
                      {course.description}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Levels: {totalLevels}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Progress: {course.progress || 0}%
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={course.progress || 0} sx={{ height: 10, borderRadius: 5, mb: 2 }} />
                    <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
                      {(course.levels || []).map((l) => (
                        <Chip key={l.level} label={`L${l.level}`} size="small" color={l.unlocked ? 'primary' : 'default'} variant={l.unlocked ? 'filled' : 'outlined'} />
                      ))}
                    </Stack>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'space-between' }}>
                  <Button size="small" variant="contained" onClick={() => navigate(`/student/courses/${course._id}`)}>
                    View Details
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => navigate(`/student/courses/${course._id}`)}>
                    Preview
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default CoursesPage;
