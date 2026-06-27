import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Select,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Badge,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../services/api';
import { useSocketEvent } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import SubmissionStatusBanner from '../../components/student/SubmissionStatusBanner';

const CodingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [violations, setViolations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitDialog, setSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const timerIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Fetch assessment
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/student/assessments/${id}`);
        setAssessment(res.data);

        // Initialize time remaining
        const startTime = new Date(res.data.startDate).getTime();
        const endTime = new Date(res.data.endDate).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);

        // Initialize answers
        const initialAnswers = {};
        (res.data.questions || []).forEach((question) => {
          initialAnswers[question._id] = '';
        });
        setAnswers(initialAnswers);

        // Set initial language from first question
        if (res.data.questions?.[0]?.programmingLanguages?.length > 0) {
          setSelectedLanguage(res.data.questions[0].programmingLanguages[0].toLowerCase());
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assessment');
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timeRemaining]);

  // Violation tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((prev) => prev + 1);
      }
    };

    const handleBlur = () => {
      setViolations((prev) => prev + 1);
    };

    const handleCopy = (e) => {
      if (assessment?.maxViolations > 0) {
        e.preventDefault();
        setViolations((prev) => prev + 1);
      }
    };

    const handlePaste = (e) => {
      if (assessment?.maxViolations > 0) {
        e.preventDefault();
        setViolations((prev) => prev + 1);
      }
    };

    if (assessment?.allowCopyPaste === false) {
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [assessment]);

  // Check for max violations
  useEffect(() => {
    if (assessment?.maxViolations && violations >= assessment.maxViolations) {
      handleAutoSubmit();
    }
  }, [violations, assessment]);

  const currentQuestion = assessment?.questions?.[currentQuestionIndex];

  const handleCodeChange = (value) => {
    setCode(value || '');
    setAnswers((prev) => ({ ...prev, [currentQuestion._id]: value || '' }));
    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestion._id));
    lastActivityRef.current = Date.now();
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    if (!currentQuestion || currentQuestion.type !== 'Programming') return;

    setIsRunning(true);
    setConsoleOutput('Executing code...\n');

    try {
      const res = await api.post('/student/assessments/run-code', {
        code,
        language: selectedLanguage,
        testCases: currentQuestion.testCases || [],
      });

      if (res.data.success) {
        setConsoleOutput(res.data.output);
        setTestResults(res.data.testResults);
      } else {
        setConsoleOutput(`Error: ${res.data.error}`);
      }
    } catch (err) {
      setConsoleOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextQuestion = assessment.questions[currentQuestionIndex + 1];
      setCode(answers[nextQuestion._id] || '');
      setConsoleOutput('');
      setTestResults(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevQuestion = assessment.questions[currentQuestionIndex - 1];
      setCode(answers[prevQuestion._id] || '');
      setConsoleOutput('');
      setTestResults(null);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    const selectedQuestion = assessment.questions[index];
    setCode(answers[selectedQuestion._id] || '');
    setConsoleOutput('');
    setTestResults(null);
  };

  const handleAutoSubmit = async () => {
    await submitAssessment();
  };

  useSocketEvent('submission-started', (payload) => {
    if (!submissionId || payload?.submissionId !== submissionId) return;
    setSubmissionStatus('running');
    setSubmissionMessage('Your submission is being evaluated.');
  });

  useSocketEvent('submission-completed', (payload) => {
    if (!submissionId || payload?.submissionId !== submissionId) return;
    setSubmissionStatus(payload.status || 'completed');
    setSubmissionMessage(payload.status === 'completed' ? 'Submission completed.' : `Submission failed: ${payload.error || 'Unknown error'}`);
  });

  const submitAssessment = async () => {
    if (!assessment) return;

    setIsSubmitting(true);
    try {
      const payload = {
        answers: assessment.questions.map((question) => ({
          questionId: question._id,
          answer: answers[question._id] ?? '',
          language: selectedLanguage,
        })),
        violations,
        submittedAt: new Date().toISOString(),
      };

      const res = await api.post(`/student/assessments/${id}/submit`, payload);

      setSubmissionId(res.data?.submissionId || null);
      setSubmissionStatus('pending');
      setSubmissionMessage('Submission queued and awaiting execution.');
      setSubmitDialog(false);
      navigate(`/student/assessments/${id}/result`, { state: { result: res.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!assessment || !currentQuestion) {
    return <Alert severity="error">Assessment or question not found</Alert>;
  }

  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const timeWarning = timeRemaining && timeRemaining < 300; // 5 minutes warning

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 3 }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          sticky: 'top',
          top: 0,
          zIndex: 10,
          p: 2,
          bgcolor: '#fff',
          borderBottom: '2px solid #e0e0e0',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {assessment.name}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <WarningIcon
                  sx={{
                    color: timeWarning ? '#ff6b6b' : '#666',
                    fontSize: 20,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: timeWarning ? '#ff6b6b' : '#333',
                  }}
                >
                  {formatTime(timeRemaining || 0)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title={`Violations: ${violations}/${assessment.maxViolations || 'N/A'}`}>
                <Badge badgeContent={violations} color="error">
                  <WarningIcon color={violations > 0 ? 'error' : 'disabled'} />
                </Badge>
              </Tooltip>
              <Chip
                icon={answeredQuestions.size > 0 ? <CheckCircleIcon /> : <ErrorIcon />}
                label={`${answeredQuestions.size}/${assessment.questions.length}`}
                color={answeredQuestions.size === assessment.questions.length ? 'success' : 'default'}
              />
            </Grid>
          </Grid>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 2, bgcolor: '#e0e0e0' }}
          />
          <SubmissionStatusBanner status={submissionStatus} message={submissionMessage} />
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
          {/* Left Panel - Question */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, textTransform: 'uppercase', color: '#666' }}>
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {currentQuestion.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Marks:</strong> {currentQuestion.marks}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {currentQuestion.description}
                </Typography>
              </Box>

              {/* Constraints */}
              {currentQuestion.constraints && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Constraints
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#666' }}>
                    {currentQuestion.constraints}
                  </Typography>
                </Box>
              )}

              {/* Examples */}
              {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Examples
                  </Typography>
                  <Stack spacing={1}>
                    {currentQuestion.testCases.slice(0, 2).map((test, idx) => (
                      <Card key={idx} sx={{ bgcolor: '#f9f9f9' }}>
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                            Example {idx + 1}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'pre-wrap', fontFamily: 'monospace', mt: 0.5 }}>
                            Input: {test.input}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            Output: {test.expectedOutput}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Question List Sidebar */}
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Questions
              </Typography>
              <List sx={{ maxHeight: '200px', overflow: 'auto' }}>
                {assessment.questions.map((q, idx) => (
                  <ListItemButton
                    key={q._id}
                    selected={idx === currentQuestionIndex}
                    onClick={() => handleQuestionSelect(idx)}
                    sx={{
                      bgcolor: answeredQuestions.has(q._id) ? '#e8f5e9' : 'transparent',
                      '&.Mui-selected': {
                        bgcolor: '#e3f2fd',
                      },
                    }}
                  >
                    <ListItemText
                      primary={`Q${idx + 1}`}
                      secondary={answeredQuestions.has(q._id) ? 'Answered' : 'Unanswered'}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    {answeredQuestions.has(q._id) && (
                      <CheckCircleIcon sx={{ ml: 1, color: '#4caf50', fontSize: 18 }} />
                    )}
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Right Panel - Editor & Console */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              {/* Code Editor */}
              <Grid item xs={12} md={12} sx={{ maxHeight: '60%' }}>
                <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                  {/* Editor Toolbar */}
                  <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        disabled={!currentQuestion?.programmingLanguages?.length}
                      >
                        {(currentQuestion?.programmingLanguages || ['javascript']).map((lang) => (
                          <MenuItem key={lang} value={lang.toLowerCase()}>
                            {lang}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleRunCode}
                      disabled={isRunning}
                      sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                    >
                      {isRunning ? 'Running...' : 'Run'}
                    </Button>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={() => setSubmitDialog(true)}
                      disabled={isSubmitting}
                      sx={{ bgcolor: '#2196f3' }}
                    >
                      Submit
                    </Button>
                  </Box>

                  {/* Monaco Editor */}
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Editor
                      height="100%"
                      language={selectedLanguage}
                      value={code}
                      onChange={handleCodeChange}
                      theme="light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Console Output */}
              <Grid item xs={12} md={12} sx={{ maxHeight: '40%' }}>
                <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Output & Test Results
                    </Typography>
                    {testResults && (
                      <Chip
                        icon={testResults.passed ? <CheckCircleIcon /> : <ErrorIcon />}
                        label={`${testResults.passed ? 'All' : 'Some'} tests passed`}
                        color={testResults.passed ? 'success' : 'error'}
                        size="small"
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      lineHeight: '1.5',
                      bgcolor: '#1e1e1e',
                      color: '#d4d4d4',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {consoleOutput || 'Output will appear here...'}
                  </Box>

                  {testResults && (
                    <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                        Test Cases: {testResults.passed} / {testResults.total}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(testResults.passed / testResults.total) * 100}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === assessment.questions.length - 1}
            >
              Next
            </Button>
          </Box>

          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() => setSubmitDialog(true)}
            sx={{ px: 4 }}
          >
            Finish Assessment
          </Button>
        </Box>
      </Container>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)}>
        <DialogTitle>Submit Assessment?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            You have answered {answeredQuestions.size} out of {assessment.questions.length} questions.
          </Typography>
          <Typography color="error">
            Are you sure you want to submit? You cannot change your answers after submission.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialog(false)}>Cancel</Button>
          <Button
            onClick={submitAssessment}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CodingPage;
