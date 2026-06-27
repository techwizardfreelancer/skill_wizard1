import { Box, Button, Card, CardContent, Typography, Grid, CardMedia, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const [courseInfoMap, setCourseInfoMap] = useState({});
  const [courseProgressMap, setCourseProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      try {
        const response = await api.get('/student/assessments');
        setAssessments(response.data || []);
      } catch (err) {
        console.error('Failed to load assessments', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  useEffect(() => {
    const slots = {};
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith('bookedSlot:')) {
        const courseId = key.replace('bookedSlot:', '').trim();
        if (courseId) {
          slots[courseId] = window.localStorage.getItem(key);
        }
      }
    });
    setBookedSlots(slots);
  }, []);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      const courseIds = Object.keys(bookedSlots);
      if (!courseIds.length) return;
      const infoMap = {};
      const progressMap = {};
      await Promise.all(courseIds.map(async (courseId) => {
        try {
          const [courseResponse, progressResponse] = await Promise.all([
            api.get(`/student/courses/${courseId}`),
            api.get(`/student/courses/${courseId}/progress`),
          ]);
          infoMap[courseId] = courseResponse.data;
          progressMap[courseId] = progressResponse.data;
        } catch (err) {
          console.warn('Failed to load course info or progress for', courseId, err);
        }
      }));
      setCourseInfoMap(infoMap);
      setCourseProgressMap(progressMap);
    };
    fetchCourseInfo();
  }, [bookedSlots]);

  const normalizeCourseId = (course) => {
    if (!course && course !== 0) return null;
    if (typeof course === 'object') {
      return String(course._id || course.id || course.courseId || course).trim();
    }
    return String(course).trim();
  };

  const getCourseId = (assessment) => {
    if (!assessment) return null;
    return normalizeCourseId(assessment.course || assessment.courseId);
  };

  const looksLikeObjectId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);

  const getCourseTitle = (assessment, courseId) => {
    if (courseInfoMap[courseId]?.title) {
      return courseInfoMap[courseId].title;
    }
    if (!assessment) return 'Booked Course';
    if (assessment.course && typeof assessment.course === 'object') {
      return assessment.course.title || assessment.course.name || 'Booked Course';
    }

    const fallback = assessment.courseTitle || assessment.name || assessment.course || assessment.courseId;
    if (!fallback || looksLikeObjectId(fallback)) {
      return 'Booked Course';
    }

    return String(fallback);
  };

  const getCourseLabel = (assessment) => {
    if (!assessment) return 'Booked Course';
    const title = getCourseTitle(assessment);
    const level = assessment.registrationLevel || assessment.currentLevel;
    return level ? `${title} - Level ${level}` : title;
  };

  const courseAssessmentsMap = assessments.reduce((map, assessment) => {
    const courseId = getCourseId(assessment);
    if (!courseId) return map;
    if (!map[courseId]) map[courseId] = [];
    map[courseId].push(assessment);
    return map;
  }, {});

  const bookedCourseIds = Object.keys(bookedSlots);
  const bookedCourses = bookedCourseIds.map((courseId) => ({
    courseId,
    bookedSlot: bookedSlots[courseId],
    assessments: courseAssessmentsMap[courseId] || [],
  }));

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          {user ? `${user.name}'s Booked Slot Assessments` : 'Booked Slot Assessments'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Only booked slot courses are shown here. Choose an active assessment and click Start.
        </Typography>
      </Box>

      {loading ? (
        <Typography>Loading booked assessments...</Typography>
      ) : bookedCourses.length === 0 ? (
        <Card elevation={4} sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={1}>
              No booked slot courses found.
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Book a slot for a course first, then return to this page to start the assessment.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/student/courses')}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bookedCourses.map(({ courseId, bookedSlot, assessments: courseAssessments }) => {
            const firstAssessment = courseAssessments[0];
            const courseLabel = firstAssessment ? getCourseLabel(firstAssessment, courseId) : courseInfoMap[courseId]?.title || 'Booked Course';
            const activeAssessmentId = firstAssessment?._id;
            const canStart = Boolean(activeAssessmentId && firstAssessment.canAttempt && firstAssessment.userSubmission?.status !== 'Submitted');
            const buttonLabel = firstAssessment
              ? firstAssessment.userSubmission?.status === 'Submitted'
                ? 'Completed'
                : firstAssessment.userSubmission?.status === 'InProgress'
                ? 'Resume Assessment'
                : 'Start Assessment'
              : 'No Assessment Available';

            return (
              <Grid item xs={12} md={6} key={courseId}>
                <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <CardMedia
                    component="div"
                    sx={{ height: 160, bgcolor: '#eef4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 3 }}
                  >
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        Booked Course
                      </Typography>
                      <Typography variant="h5" fontWeight={700} textAlign="center">
                        {courseLabel}
                      </Typography>
                    </Stack>
                  </CardMedia>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Booked Slot: {bookedSlot}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Level: {courseProgressMap[courseId]?.currentLevel ?? 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Assessment count: {courseAssessments.length}
                      </Typography>
                    </Stack>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ mt: 3 }}
                      onClick={() => navigate(`/student/assessments/${activeAssessmentId}/start`)}
                      disabled={!activeAssessmentId || !canStart}
                    >
                      {buttonLabel}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default AssessmentPage;
