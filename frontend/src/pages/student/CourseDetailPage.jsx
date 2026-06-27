import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('09:00-10:00');
  const [bookedSlot, setBookedSlot] = useState('');
  const [slotError, setSlotError] = useState('');

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const courseResponse = await api.get(`/student/courses/${courseId}`);
        setCourse(courseResponse.data);

        try {
          const progressResponse = await api.get(`/student/courses/${courseId}/progress`);
          setProgress(progressResponse.data);
          setEnrolled(true);
        } catch (progressError) {
          if (progressError.response?.status === 404) {
            setEnrolled(false);
          } else {
            console.error(progressError);
          }
        }
      } catch (courseError) {
        setError('Unable to load course details.');
        console.error(courseError);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const slotOptions = [
    '09:00-10:00',
    '10:15-11:15',
    '11:30-12:30',
    '14:00-15:00',
    '15:15-16:15',
  ];

  const handleEnroll = async () => {
    try {
      await api.post('/student/courses/enroll', { courseId });
      const progressResponse = await api.get(`/student/courses/${courseId}/progress`);
      setProgress(progressResponse.data);
      setEnrolled(true);
    } catch (enrollError) {
      setError(enrollError.response?.data?.message || 'Unable to enroll in course.');
      console.error(enrollError);
    }
  };

  useEffect(() => {
    const storedSlot = window.localStorage.getItem(`bookedSlot:${courseId}`);
    if (storedSlot) {
      setBookedSlot(storedSlot);
      setSelectedSlot(storedSlot);
    }
  }, [courseId]);

  const handleOpenSlotDialog = () => {
    setSlotError('');
    setSlotDialogOpen(true);
  };

  const handleCloseSlotDialog = () => {
    setSlotDialogOpen(false);
  };

  const handleConfirmSlot = () => {
    if (!selectedSlot) {
      setSlotError('Please select a time slot to book.');
      return;
    }
    window.localStorage.setItem(`bookedSlot:${courseId}`, selectedSlot);
    setBookedSlot(selectedSlot);
    setSlotDialogOpen(false);
  };

  const [searchParams] = useSearchParams();
  const requestedLevel = Number(searchParams.get('level')) || 0;
  const [activeLevel, setActiveLevel] = useState(1);

  const totalLevels = course?.totalLevels || course?.levels || 1;
  const currentLevel = progress?.currentLevel || 0;
  const progressValue = progress?.progress || 0;
  const hasLevelDetails = Array.isArray(course?.levelDetails) && course.levelDetails.length > 0;

  useEffect(() => {
    if (requestedLevel && requestedLevel <= totalLevels) {
      setActiveLevel(requestedLevel);
    } else if (currentLevel) {
      setActiveLevel(currentLevel);
    } else {
      setActiveLevel(1);
    }
  }, [requestedLevel, totalLevels, currentLevel]);

  if (loading) {
    return <Typography>Loading course details...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!course) {
    return <Typography color="text.secondary">Course not found.</Typography>;
  }

  const nextLevel = currentLevel + 1;
  const canRegisterNextLevel = enrolled && currentLevel > 0 && currentLevel < totalLevels && progressValue === 100;
  const nextLevelMessage = enrolled
    ? currentLevel < totalLevels
      ? progressValue === 100
        ? `Level ${currentLevel} is complete. You may register for level ${nextLevel}.`
        : `Complete level ${currentLevel} to unlock registration for level ${nextLevel}.`
      : 'You have completed the final level of this course.'
    : '';

  const handleContinue = () => {
    if (!enrolled) {
      handleEnroll();
      return;
    }

    if (canRegisterNextLevel) {
      handleRegisterNextLevel();
      return;
    }

    const active = currentLevel || 1;
    setActiveLevel(active);
    navigate(`/student/courses/${courseId}/levels/${active}`);
  };

  const handleRegisterNextLevel = async () => {
    try {
      const response = await api.post(`/student/courses/${courseId}/levels/${nextLevel}/register`);
      setProgress(response.data);
      setActiveLevel(nextLevel);
      navigate(`/student/courses/${courseId}?level=${nextLevel}`);
    } catch (registerError) {
      setError(registerError.response?.data?.message || 'Unable to register for the next level.');
      console.error(registerError);
    }
  };

  const levelItems = Array.from({ length: totalLevels }, (_, index) => index + 1);
  const levelFlow = hasLevelDetails
    ? course.levelDetails
    : levelItems.map((level) => ({ level, title: `Level ${level}`, topics: [], assessmentType: 'N/A', rewardPoints: 0, preRequest: '' }));
  const selectedLevelDetail = course.levelDetails?.find((detail) => detail.level === activeLevel) || levelFlow[0];

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const materialDetails = selectedLevelDetail.exampleQuestions
    ? selectedLevelDetail.exampleQuestions.split('\n').filter(Boolean)
    : ['No material details available.'];

  const formatStatus = (level) => {
    if (level === currentLevel) return { label: 'Ongoing', color: 'primary' };
    if (level < currentLevel) return { label: 'Completed', color: 'success' };
    return { label: 'Upcoming', color: 'default' };
  };

  const videoUrl = getYoutubeEmbedUrl(selectedLevelDetail.youtubeLink) || course.image;
  const courseHeader = `${course.title} ${selectedLevelDetail.level ? `- Level ${selectedLevelDetail.level}` : ''}`;
  const mediaLabel = selectedLevelDetail.youtubeLink ? 'Video lesson' : 'Course image';

  const materialSections = levelFlow.map((detail, index) => ({
    id: detail.level,
    title: detail.title || `Material ${index + 1}`,
    subtitle: `Materials: ${detail.topics?.length || 0}/${detail.topics?.length || 0}`,
    content: detail.topics?.length
      ? detail.topics.map((topic, idx) => ({ label: topic, key: `topic-${detail.level}-${idx}` }))
      : [{ label: detail.exampleQuestions || 'Nothing available yet.' }],
  }));

  return (
    <Box>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            {videoUrl ? (
              selectedLevelDetail.youtubeLink ? (
                <Box sx={{ position: 'relative', pt: '56.25%' }}>
                  <iframe
                    title="Course video"
                    src={videoUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                </Box>
              ) : (
                <Box component="img" src={videoUrl} alt={mediaLabel} sx={{ width: '100%', maxHeight: 480, objectFit: 'cover' }} />
              )
            ) : (
              <Box sx={{ height: 280, bgcolor: '#f5f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No media available</Typography>
              </Box>
            )}

            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2}>
                <Typography variant="h4" fontWeight={700}>
                  {courseHeader}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {course.description}
                </Typography>
                <Button variant="contained" size="large" onClick={handleContinue}>
                  {canRegisterNextLevel ? `Register Level ${nextLevel}` : 'Mark as Complete'}
                </Button>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip label={`Progress: ${progressValue}%`} color="primary" />
                  <Chip label={`Current Level: ${currentLevel || 1}`} color="success" />
                  <Chip label={`Total Levels: ${totalLevels}`} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2} fontWeight={700}>
                Course Details
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {course.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {`Programming ${course.category || ''} Level ${currentLevel || 1}`}
              </Typography>
              {bookedSlot ? (
                <Chip
                  label={`Booked: ${bookedSlot}`}
                  color="success"
                  size="medium"
                  sx={{ mb: 2, fontWeight: 700 }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  No slot booked yet.
                </Typography>
              )}
              <Button variant="contained" fullWidth onClick={handleOpenSlotDialog}>
                Book a Slot
              </Button>
            </Card>

            <Card elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2} fontWeight={700}>
                Course Materials
              </Typography>
              {materialSections.map((section, index) => (
                <Accordion key={section.id} defaultExpanded={index === 0} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack>
                      <Typography fontWeight={700}>{`${index + 1}. ${section.title}`}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {section.subtitle}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    {section.content.map((item) => (
                      <Typography key={item.key || item.label} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        • {item.label}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Card>
          </Stack>
        </Grid>
      </Grid>
      <Dialog open={slotDialogOpen} onClose={handleCloseSlotDialog} fullWidth maxWidth="sm">
        <DialogTitle>Book a Time Slot</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select one of the available booking times for this course level.
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)}>
              {slotOptions.map((slot) => (
                <FormControlLabel key={slot} value={slot} control={<Radio />} label={slot} />
              ))}
            </RadioGroup>
          </FormControl>
          {slotError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {slotError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSlotDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmSlot}>
            Confirm Slot
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailPage;
