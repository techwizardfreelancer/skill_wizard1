import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  WarningAmber,
  Fullscreen,
  ContentPaste,
  NetworkCheck,
} from '@mui/icons-material';
import api from '../../services/api';
import { getCurrentSubmission } from '../../services/codeService';

const AssessmentStartPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptedInstructions, setAcceptedInstructions] = useState(false);
  const [fullscreenPermission, setFullscreenPermission] = useState(false);
  const [clipboardPermission, setClipboardPermission] = useState(false);
  const [browserCompatible, setBrowserCompatible] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState('loading');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await api.get(`/student/assessments/${assessmentId}`, { withCredentials: true });
        setAssessment(response.data);

        const now = new Date();
        const startDate = response.data.startDate ? new Date(response.data.startDate) : null;
        const endDate = response.data.endDate ? new Date(response.data.endDate) : null;
        if (startDate && now < startDate) {
          setAssessmentStatus('not_started');
        } else if (endDate && now > endDate) {
          setAssessmentStatus('ended');
        } else {
          setAssessmentStatus('active');
        }

        try {
          const submission = await getCurrentSubmission(assessmentId);
          if (submission?.status === 'InProgress' || submission?.status === 'Submitted') {
            navigate(`/student/assessments/${assessmentId}/test`, { replace: true });
            return;
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.warn('Failed to check current submission', err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load assessment', err);
        setError(err.response?.data?.message || 'Unable to load assessment details');
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, navigate]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setBrowserCompatible(
      Boolean(
        window.fetch &&
        window.Promise &&
        window.localStorage &&
        window.indexedDB &&
        'clipboard' in navigator,
      ),
    );
  }, []);

  useEffect(() => {
    const checkClipboardPermission = async () => {
      if (!navigator.clipboard) {
        setClipboardPermission(false);
        return;
      }

      if (navigator.permissions) {
        try {
          const status = await navigator.permissions.query({ name: 'clipboard-read' });
          setClipboardPermission(status.state === 'granted' || status.state === 'prompt');
        } catch {
          setClipboardPermission(true);
        }
      } else {
        setClipboardPermission(true);
      }
    };

    checkClipboardPermission();
  }, []);

  useEffect(() => {
    setPermissionsReady(browserCompatible && clipboardPermission && fullscreenPermission && isOnline);
  }, [browserCompatible, clipboardPermission, fullscreenPermission, isOnline]);

  const requestFullscreenPermission = async () => {
    if (!document.documentElement.requestFullscreen) {
      setFullscreenPermission(false);
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
      setFullscreenPermission(Boolean(document.fullscreenElement));
    } catch (err) {
      console.warn('Fullscreen request failed', err);
      setFullscreenPermission(false);
    }
  };

  const handleStartAssessment = async () => {
    if (!assessment) return;
    if (assessmentStatus !== 'active') {
      setError('This assessment is not available to start at this time.');
      return;
    }
    if (!acceptedInstructions) {
      setError('Please accept the instructions before starting.');
      return;
    }
    if (!permissionsReady) {
      setError('Please grant all required permissions and stay online before starting.');
      return;
    }

    setStarting(true);
    try {
      await api.post('/assessments/start', { assessmentId }, { withCredentials: true });
      navigate(`/student/assessments/${assessmentId}/test`, { replace: true });
    } catch (err) {
      console.error('Failed to start assessment', err);
      setError(err.response?.data?.message || 'Unable to start assessment');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student/assessments')}>
          Back to Assessments
        </Button>
      </Container>
    );
  }

  const startTime = assessment?.startDate ? new Date(assessment.startDate).toLocaleString() : 'N/A';
  const endTime = assessment?.endDate ? new Date(assessment.endDate).toLocaleString() : 'N/A';

  return (
    <Container sx={{ py: 6, maxWidth: 900 }}>
      <Paper sx={{ p: 4, mb: 4 }} elevation={3}>
        <Typography variant="h4" fontWeight={700} mb={2}>
          {assessment.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Course: {assessment.course?.title || 'N/A'}
        </Typography>
        <Typography variant="body2" mb={1}>
          Start Time: {startTime}
        </Typography>
        <Typography variant="body2" mb={1}>
          End Time: {endTime}
        </Typography>
        <Typography variant="body2" mb={3}>
          Duration: {assessment.duration} minutes
        </Typography>

        <Typography variant="h6" fontWeight={600} mb={1}>
          Instructions
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
          {assessment.instructions || 'Read the rules carefully. Do not refresh, navigate away, or switch tabs once the assessment starts. Your work will be evaluated automatically.'}
        </Typography>
        {assessmentStatus !== 'active' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {assessmentStatus === 'not_started'
              ? 'This assessment has not started yet. You can only begin after the scheduled start time.'
              : 'This assessment has already ended and can no longer be started.'}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3, bgcolor: '#F8FAFC' }} variant="outlined">
          <Typography variant="h6" fontWeight={600} mb={2}>
            Required Permissions
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {fullscreenPermission ? <CheckCircle color="success" /> : <WarningAmber color="warning" />}
              <Typography>Fullscreen Enabled</Typography>
              {!fullscreenPermission && (
                <Button size="small" variant="outlined" onClick={requestFullscreenPermission}>
                  Enable Fullscreen
                </Button>
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              {browserCompatible ? <CheckCircle color="success" /> : <WarningAmber color="warning" />}
              <Typography>Browser Compatible</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              {clipboardPermission ? <CheckCircle color="success" /> : <WarningAmber color="warning" />}
              <Typography>Clipboard Access</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              {isOnline ? <CheckCircle color="success" /> : <WarningAmber color="warning" />}
              <Typography>Network Connected</Typography>
            </Stack>
          </Stack>
        </Paper>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Button
            variant={acceptedInstructions ? 'contained' : 'outlined'}
            color={acceptedInstructions ? 'success' : 'primary'}
            onClick={() => setAcceptedInstructions(true)}
          >
            {acceptedInstructions ? 'Instructions Accepted' : 'Accept Instructions'}
          </Button>
          <Button
            variant="contained"
            disabled={assessmentStatus !== 'active' || !acceptedInstructions || !permissionsReady || starting}
            onClick={handleStartAssessment}
          >
            {starting ? 'Starting...' : 'Start Assessment'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/student/assessments')}>
            Back to Assessments
          </Button>
        </Stack>
        {!permissionsReady && (
          <Typography variant="body2" color="error" mt={2}>
            All permissions must be enabled and you must be online before beginning the assessment.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AssessmentStartPage;
