import { Box, Button, Card, CardContent, CardMedia, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const CourseLevelPage = () => {
  const { courseId, level } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentLevel = progress?.currentLevel || 0;
  const progressValue = progress?.progress || 0;
  const requestedLevel = Number(level);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          api.get(`/student/courses/${courseId}`),
          api.get(`/student/courses/${courseId}/progress`).catch((err) => {
            if (err.response?.status === 404) return null;
            throw err;
          }),
        ]);

        setCourse(courseRes.data);
        if (progressRes) {
          setProgress(progressRes.data);
          setEnrolled(true);
        }
      } catch (err) {
        setError('Unable to load course level details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const handleRegisterLevel = async () => {
    try {
      const nextLevel = requestedLevel;
      const response = await api.post(`/student/courses/${courseId}/levels/${nextLevel}/register`);
      setProgress(response.data);
      setEnrolled(true);
      navigate(`/student/courses/${courseId}/levels/${nextLevel}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register for this level.');
      console.error(err);
    }
  };

  const selectedLevelDetail = course?.levelDetails?.find((detail) => detail.level === requestedLevel);
  const allLevels = course?.totalLevels || course?.levels || 1;

  const nextLevelAvailable = enrolled && requestedLevel === currentLevel + 1 && progressValue === 100;

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (loading) {
    return <Typography>Loading level study page...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!course) {
    return <Typography color="text.secondary">Course not found.</Typography>;
  }

  if (!selectedLevelDetail) {
    return <Typography color="text.secondary">Level details are not available for this course.</Typography>;
  }

  return (
    <Box>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <CardMedia component="img" image={course.image || ''} alt={course.title || 'Course image'} sx={{ maxHeight: 400, objectFit: 'cover' }} />
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2}>
                <Typography variant="h4" fontWeight={700}>
                  {course.title} — Level {requestedLevel}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {course.description}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  Study this level
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedLevelDetail.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assessment: {selectedLevelDetail.assessmentType || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rewards: {selectedLevelDetail.rewardPoints ?? 0} RP
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prerequisite: {selectedLevelDetail.preRequest || 'None'}
                </Typography>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Topics
                  </Typography>
                  {selectedLevelDetail.topics?.length ? (
                    <Stack component="ul" sx={{ pl: 3, m: 0, color: 'text.secondary' }}>
                      {selectedLevelDetail.topics.map((topic, idx) => (
                        <Typography component="li" key={idx} variant="body2">
                          {topic}
                        </Typography>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No topics provided for this level.
                    </Typography>
                  )}
                </Box>
                {selectedLevelDetail.youtubeLink ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>
                      Video lesson
                    </Typography>
                    {getYoutubeEmbedUrl(selectedLevelDetail.youtubeLink) ? (
                      <Box sx={{ position: 'relative', pt: '56.25%' }}>
                        <iframe
                          title="Level video"
                          width="100%"
                          height="100%"
                          src={getYoutubeEmbedUrl(selectedLevelDetail.youtubeLink)}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="primary" component="a" href={selectedLevelDetail.youtubeLink} target="_blank" rel="noreferrer">
                        Watch video resource
                      </Typography>
                    )}
                  </Box>
                ) : null}
                {selectedLevelDetail.exampleQuestions ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>
                      Example questions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" whiteSpace="pre-line">
                      {selectedLevelDetail.exampleQuestions}
                    </Typography>
                  </Box>
                ) : null}
                <Button
                  variant="contained"
                  onClick={handleRegisterLevel}
                  disabled={!nextLevelAvailable}
                >
                  {nextLevelAvailable ? `Register Level ${requestedLevel}` : 'Complete previous level first'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" mb={2} fontWeight={700}>
              Course overview
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current level: {currentLevel || 'Not enrolled'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total levels: {allLevels}
            </Typography>
            <LinearProgress variant="determinate" value={progressValue} sx={{ height: 12, borderRadius: 6, mt: 2 }} />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Progress: {progressValue}%
            </Typography>
            <Stack spacing={1} mt={2}>
              <Typography variant="subtitle2" fontWeight={700}>Next steps</Typography>
              <Typography variant="body2" color="text.secondary">
                {requestedLevel === currentLevel + 1 && progressValue === 100
                  ? `You are eligible to register for level ${requestedLevel}.`
                  : `Finish current level ${currentLevel || 1} to unlock the next level.`}
              </Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseLevelPage;
