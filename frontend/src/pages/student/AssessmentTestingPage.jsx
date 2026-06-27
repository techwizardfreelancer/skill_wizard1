import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CheckCircle,
  WarningAmber,
  Fullscreen,
  ContentPaste,
  NetworkCheck,
} from '@mui/icons-material';
import { Editor } from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { runCodeSubmission, submitCodeAnswer, getCurrentSubmission } from '../../services/codeService';
import { useSocketEvent } from '../../hooks/useSocket';
import SubmissionStatusBanner from '../../components/student/SubmissionStatusBanner';
import { useHotkeys } from 'react-hotkeys-hook';

const AssessmentTestingPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const supportedLanguages = ['c', 'cpp', 'java', 'python', 'javascript'];
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [violations, setViolations] = useState(0);
  const [eliminated, setEliminated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeToStart, setTimeToStart] = useState(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [showInstructionPage, setShowInstructionPage] = useState(false);
  const [fullscreenPermission, setFullscreenPermission] = useState(false);
  const [clipboardPermission, setClipboardPermission] = useState(false);
  const [browserCompatible, setBrowserCompatible] = useState(true);
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [acceptedInstructions, setAcceptedInstructions] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState('loading');
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [assessmentBanner, setAssessmentBanner] = useState('');
  const [resumePending, setResumePending] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [lastExecution, setLastExecution] = useState(null);
  const [submissionVerdict, setSubmissionVerdict] = useState('');
  const [visibleTestCases, setVisibleTestCases] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localSaveMessage, setLocalSaveMessage] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [shortcutInfoOpen, setShortcutInfoOpen] = useState(false);
  const timerIntervalRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);
  const editorRef = useRef(null);
  const loadedAssessmentStateRef = useRef(null);

  const violationStorageKey = `assessmentViolationState:${assessmentId}`;
  const assessmentStateKey = `studentAssessmentState:${assessmentId}`;
  const localAssessmentStateKey = `studentAssessmentStateLocal:${assessmentId}`;

  const loadViolationState = () => {
    try {
      const stored = sessionStorage.getItem(violationStorageKey);
      if (!stored) return { violations: 0, eliminated: false };
      return JSON.parse(stored);
    } catch {
      return { violations: 0, eliminated: false };
    }
  };

  const saveViolationState = (state) => {
    try {
      sessionStorage.setItem(violationStorageKey, JSON.stringify(state));
    } catch (err) {
      console.warn('Unable to save violation state', err);
    }
  };

  const loadAssessmentState = () => {
    try {
      const stored = sessionStorage.getItem(assessmentStateKey) || localStorage.getItem(localAssessmentStateKey);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const saveAssessmentState = (state) => {
    try {
      const serialized = JSON.stringify(state);
      sessionStorage.setItem(assessmentStateKey, serialized);
      localStorage.setItem(localAssessmentStateKey, serialized);
    } catch (err) {
      console.warn('Unable to save assessment state', err);
    }
  };

  const checkBrowserCompatibility = () => {
    const isCompatible = Boolean(
      window.fetch &&
      window.Promise &&
      window.localStorage &&
      window.indexedDB &&
      'clipboard' in navigator,
    );
    setBrowserCompatible(isCompatible);
  };

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

  const updatePermissionState = () => {
    setPermissionsReady(
      browserCompatible &&
      clipboardPermission &&
      isOnline &&
      fullscreenPermission,
    );
  };

  const getMaxViolations = () => assessment?.maxViolations || 3;

  const addViolation = (type) => {
    setViolations((prev) => {
      const currentCount = prev + 1;
      const nextState = {
        violations: currentCount,
        eliminated: currentCount >= getMaxViolations(),
      };
      saveViolationState(nextState);
      if (nextState.eliminated) {
        setEliminated(true);
        setWarningMessage('Assessment Eliminated');
        setError('Assessment Eliminated');
      } else {
        const warningText = `Warning: ${type} ${currentCount}/${getMaxViolations()}`;
        setWarningMessage(warningText);
      }
      return currentCount;
    });
  };

  const isStartAllowed = () => {
    if (!assessment) return false;
    const now = new Date();
    const startTime = new Date(assessment.startDate);
    const endTime = new Date(assessment.endDate);
    return now >= startTime && now <= endTime;
  };

  useEffect(() => {
    const savedState = loadViolationState();
    setViolations(savedState.violations);
    setEliminated(savedState.eliminated);
    if (savedState.eliminated) {
      setWarningMessage('Assessment Eliminated');
      setError('Assessment Eliminated');
    }
  }, [assessmentId]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWarningMessage('Internet connection restored. Local state resynced.');
      setConnectionMessage('Internet connection restored. Resyncing local state.');
      setConnectionOpen(true);
      const savedState = loadAssessmentState();
      if (savedState) {
        saveAssessmentState(savedState);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWarningMessage('Offline mode: your work is being saved locally.');
      setConnectionMessage('Offline mode enabled. Work is saved locally.');
      setConnectionOpen(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleTabSwitch = () => {
      if (eliminated || assessmentStatus !== 'live') return;
      if (assessment?.allowTabSwitch) return;
      addViolation('TabSwitch');
      reportViolation('TabSwitch', 'User switched browser tab or window');
    };

    const handleWindowBlur = () => {
      if (eliminated || assessmentStatus !== 'live') return;
      if (assessment?.allowTabSwitch) return;
      addViolation('WindowBlur');
      reportViolation('WindowBlur', 'Window lost focus during assessment');
    };

    const handleVisibilityChange = () => {
      if (eliminated || assessmentStatus !== 'live') return;
      if (assessment?.allowTabSwitch) return;
      if (document.hidden) {
        addViolation('VisibilityChange');
        reportViolation('VisibilityChange', 'Browser tab became hidden');
      }
    };

    const handleCopyPaste = (event) => {
      if (eliminated || assessmentStatus !== 'live') return;
      if (assessment?.allowCopyPaste) return;
      event.preventDefault();
      const type = event.type === 'paste' ? 'PasteAttempt' : 'CopyAttempt';
      addViolation(type);
      reportViolation(type, `User attempted to ${event.type} content`);
    };

    const handleFullscreenChange = () => {
      const fullscreenActive = Boolean(document.fullscreenElement);
      setIsFullscreen(fullscreenActive);
      if (eliminated || assessmentStatus !== 'live') return;
      if (assessment?.requireFullscreen && !fullscreenActive) {
        addViolation('FullscreenExit');
        reportViolation('FullscreenExit', 'Fullscreen mode exited during assessment');
      }
    };

    const handleBeforeUnload = (event) => {
      if (eliminated || assessmentStatus !== 'live') return;
      addViolation('RefreshAttempt');
      reportViolation('RefreshAttempt', 'User attempted to refresh or navigate away during assessment');
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('copy', handleCopyPaste);
    window.addEventListener('paste', handleCopyPaste);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('copy', handleCopyPaste);
      window.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [eliminated, assessment, assessmentStatus]);

  const reportViolation = async (type, description) => {
    if (!assessmentId) return;
    try {
      await api.post(`/assessments/${assessmentId}/violation`, { type, description });
    } catch (err) {
      console.warn('Violation report failed', err);
    }
  };

  useEffect(() => {
    if (!warningMessage || eliminated) return;
    const timer = setTimeout(() => {
      setWarningMessage('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [warningMessage, eliminated]);

  useEffect(() => {
    if (!editorRef.current || !loadedAssessmentStateRef.current) return;
    const cursorPosition = loadedAssessmentStateRef.current.cursorPosition;
    if (cursorPosition) {
      editorRef.current.setPosition(cursorPosition);
      editorRef.current.revealPositionInCenter(cursorPosition);
    }
  }, [questionsLoaded]);

  // Fetch assessment and questions
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const assessRes = await api.get(`/student/assessments/${assessmentId}`, { withCredentials: true });
        setAssessment(assessRes.data);

        const now = new Date();
        const startTime = new Date(assessRes.data.startDate);
        const endTime = new Date(assessRes.data.endDate);

        let currentSubmission = null;
        let submissionCompleted = false;

        try {
          currentSubmission = await getCurrentSubmission(assessmentId);
          setSubmissionId(currentSubmission._id);
          setSubmissionStatus(currentSubmission.status || '');

          if (currentSubmission.status === 'Eliminated') {
            setEliminated(true);
            setWarningMessage('Assessment Eliminated');
            setError('Assessment eliminated due to cheating violations');
          }

          if (currentSubmission.status === 'Submitted') {
            submissionCompleted = true;
            setAssessmentCompleted(true);
          } else if (currentSubmission.status === 'InProgress') {
            setAssessmentBanner('You have an in-progress attempt. Resume it to continue where you left off.');
            setResumePending(true);
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.warn('Unable to fetch current submission', err);
          }
        }

        if (submissionCompleted) {
          setAssessmentStatus('finished');
          return;
        }

        if (now < startTime) {
          setAssessmentStatus('waiting');
          setTimeToStart(Math.max(0, Math.floor((startTime - now) / 1000)));
          setTimeLeft(Math.max(0, Math.floor((endTime - startTime) / 1000)));
        } else if (now >= startTime && now <= endTime) {
          setAssessmentStatus('live');
          setAssessmentStarted(true);
          setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
          if (!currentSubmission) {
            setShowInstructionPage(true);
          }
        } else {
          setAssessmentStatus('ended');
        }

        if (assessRes.data.programmingLanguages && assessRes.data.programmingLanguages.length > 0) {
          setLanguage(assessRes.data.programmingLanguages[0]);
        }

        const savedState = loadAssessmentState();
        if (savedState && savedState.answers) {
          loadedAssessmentStateRef.current = savedState;
          setAnswers(savedState.answers);
          setCurrentQuestionIdx(savedState.currentQuestionIdx || 0);
          setCode(savedState.code || '');
          setLanguage(savedState.language || assessRes.data.programmingLanguages?.[0] || language);
          setTimeLeft(savedState.timeLeft ?? Math.max(0, Math.floor((endTime - now) / 1000)));
        }

        const savedViolationState = loadViolationState();
        setViolations(savedViolationState.violations);
        setEliminated(savedViolationState.eliminated);
        if (savedViolationState.eliminated) {
          setWarningMessage('Assessment Eliminated');
          setError('Assessment Eliminated');
        }
      } catch (err) {
        setError('Failed to load assessment');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  const currentQuestion = questions[currentQuestionIdx];

  const handleQuestionSelect = (index) => {
    if (questions.length === 0 || index === currentQuestionIdx) return;

    if (currentQuestion?._id) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: code,
      }));
    }

    const nextQuestion = questions[index];
    setCurrentQuestionIdx(index);
    setCode(answers[nextQuestion?._id] || '');
  };

  useEffect(() => {
    if (assessmentStatus !== 'live') return;
    if (!currentQuestion) return;

    const savedCode = answers[currentQuestion._id];
    if (savedCode !== undefined && savedCode !== code) {
      setCode(savedCode);
    }
  }, [assessmentStatus, currentQuestionIdx, currentQuestion, answers, code]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    if (assessmentStatus !== 'live') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerIntervalRef.current);
          handleFinish();
          return 0;
        }
        const next = prev - 1;
        saveAssessmentState({
          answers,
          currentQuestionIdx,
          code,
          language,
          timeLeft: next,
          cursorPosition: editorRef.current?.getPosition() || null,
          currentQuestionId: currentQuestion?._id,
        });
        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timeLeft, assessmentStatus, answers, currentQuestionIdx, code, language, currentQuestion]);

  useEffect(() => {
    if (assessmentStatus !== 'live') return;
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      saveAssessmentState({
        answers,
        currentQuestionIdx,
        code,
        language,
        timeLeft,
        cursorPosition: editorRef.current?.getPosition() || null,
        currentQuestionId: currentQuestion?._id,
      });
      setLocalSaveMessage('Autosaved locally');
      setTimeout(() => setLocalSaveMessage(''), 2000);
    }, 10000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [assessmentStatus, answers, currentQuestionIdx, code, language, timeLeft, currentQuestion]);

  useEffect(() => {
    if (assessmentStatus !== 'waiting' || timeToStart === null) return;

    const interval = setInterval(() => {
      setTimeToStart((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeToStart(0);
          setAssessmentStatus('live');
          const now = new Date();
          const endTime = new Date(assessment?.endDate);
          setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
          startAssessmentAttempt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [assessmentStatus, timeToStart, assessment]);

  const requestEnterFullscreen = async () => {
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn('Fullscreen request failed', err);
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setVisibleTestCases(currentQuestion?.testCases?.filter((testCase) => !testCase.isHidden) || []);
  }, [currentQuestion]);

  const loadSelectedQuestions = async () => {
    try {
      const questionsRes = await api.get(`/assessments/${assessmentId}/questions`, { withCredentials: true });
      const loadedQuestions = questionsRes.data.questions || [];
      setQuestions(loadedQuestions);
      setVisibleTestCases(loadedQuestions[0]?.testCases?.filter((testCase) => !testCase.isHidden) || []);
      setQuestionsLoaded(true);
    } catch (err) {
      console.error('Failed to load selected questions', err);
      setError('Unable to load assessment questions');
    }
  };

  const startAssessmentAttempt = async () => {
    try {
      const response = await api.post('/assessments/start', { assessmentId }, { withCredentials: true });
      const selectedQuestions = response.data.selectedQuestions || [];
      if (selectedQuestions.length) {
        setQuestions(selectedQuestions);
        setVisibleTestCases(selectedQuestions[0]?.testCases?.filter((testCase) => !testCase.isHidden) || []);
      } else {
        await loadSelectedQuestions();
      }
      setQuestionsLoaded(true);
      return response;
    } catch (err) {
      console.error('Assessment start failed', err);
      if (err.response?.status === 400 || err.response?.status === 403) {
        setError(err.response?.data?.message || 'Unable to start assessment');
        await loadSelectedQuestions();
      } else {
        setError('Unable to start assessment');
      }
      return null;
    }
  };

  useEffect(() => {
    checkBrowserCompatibility();
    checkClipboardPermission();
  }, []);

  useEffect(() => {
    updatePermissionState();
  }, [browserCompatible, clipboardPermission, isOnline, fullscreenPermission]);

  const handleResumeAssessment = async () => {
    if (!assessment || !resumePending) return;
    setResumeLoading(true);
    try {
      const result = await startAssessmentAttempt();
      if (result) {
        setResumePending(false);
        setWarningMessage('Assessment resumed. Good luck!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resume assessment');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleInstructionsAccept = () => {
    setAcceptedInstructions(true);
  };

  const handleEnableFullscreen = async () => {
    await requestFullscreenPermission();
  };

  const handleStartAssessment = async () => {
    if (!assessment || assessmentStatus !== 'live') return;
    if (!acceptedInstructions) {
      setError('Please accept the instructions before starting.');
      return;
    }
    if (!permissionsReady) {
      setError('Please grant all required permissions before starting the assessment.');
      return;
    }

    const result = await startAssessmentAttempt();
    if (result) {
      setShowInstructionPage(false);
      setAssessmentStarted(true);
      const now = new Date();
      const endTime = new Date(assessment.endDate);
      setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
      setWarningMessage('Assessment started. Timer is running.');
    }
  };

  const handleRunCode = async () => {
    if (eliminated) {
      setError('Assessment Eliminated. You can no longer run code.');
      return;
    }

    if (!code.trim()) {
      setOutput('Please write some code first.');
      return;
    }

    setRunning(true);
    setSubmissionVerdict('');
    try {
      const data = await runCodeSubmission({
        code,
        language,
        assessmentId,
        questionId: currentQuestion?._id,
      });

      setOutput(data.output || 'Code executed successfully');
      setLastExecution({
        compilationSuccess: data.compilationSuccess,
        compilationOutput: data.compilationOutput,
        passedCount: data.passedCount,
        failedCount: data.failedCount,
        totalTests: data.totalTests,
        executionTimeMs: data.executionTimeMs,
        memoryUsage: data.memoryUsage,
        testResults: data.testResults || [],
      });
      setSubmissionVerdict(data.compilationSuccess ? 'Sample Run Completed' : 'Compilation Error');
      showToast('Sample run completed');
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.message || err.message}`);
      setLastExecution(null);
      showToast('Run failed. Check output for details.');
    } finally {
      setRunning(false);
    }
  };

  const handleCompileCode = async () => {
    if (eliminated) {
      setError('Assessment Eliminated. You can no longer compile code.');
      return;
    }

    if (!code.trim()) {
      setOutput('Please write some code first.');
      return;
    }

    setRunning(true);
    setSubmissionVerdict('');
    try {
      const data = await runCodeSubmission({
        code,
        language,
        assessmentId,
        questionId: currentQuestion?._id,
        compileOnly: true,
      });

      setOutput(data.output || 'Compilation successful');
      setLastExecution({
        compilationSuccess: data.compilationSuccess,
        compilationOutput: data.compilationOutput,
        passedCount: data.passedCount,
        failedCount: data.failedCount,
        totalTests: data.totalTests,
        executionTimeMs: data.executionTimeMs,
        memoryUsage: data.memoryUsage,
        testResults: data.testResults || [],
      });
      setSubmissionVerdict(data.compilationSuccess ? 'Compiled Successfully' : 'Compilation Error');
      showToast(data.compilationSuccess ? 'Compilation successful' : 'Compilation error');
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.message || err.message}`);
      setLastExecution(null);
      showToast('Compilation failed. Check output for details.');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (eliminated) {
      setError('Assessment Eliminated. You can no longer submit answers.');
      return;
    }

    if (!code.trim()) {
      setError('Please write some code before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitCodeAnswer({
        assessmentId,
        questionId: currentQuestion?._id,
        code,
        language,
      });

      const nextAnswers = {
        ...answers,
        [currentQuestion?._id]: code,
      };
      setAnswers(nextAnswers);
      saveAssessmentState({
        answers: nextAnswers,
        currentQuestionIdx,
        code,
        language,
        timeLeft,
      });

      setSubmissionId(response?.submissionId || null);
      setSubmissionStatus(response?.status || 'pending');
      setSubmissionMessage(response?.message || 'Submission queued for evaluation.');
      setSubmissionVerdict(response?.status || 'Submitted');

      setLastExecution({
        compilationSuccess: response.compilationSuccess,
        compilationOutput: response.compilationOutput,
        passedCount: response.passedCount,
        failedCount: response.failedCount,
        totalTests: response.totalTests,
        executionTimeMs: response.executionTimeMs,
        memoryUsage: response.memoryUsage,
        testResults: response.testResults || [],
      });

      setError('');
      showToast('Answer submitted successfully');
      if (currentQuestionIdx < questions.length - 1) {
        const nextIndex = currentQuestionIdx + 1;
        setCurrentQuestionIdx(nextIndex);
        const nextQuestion = questions[nextIndex];
        setCode(nextAnswers[nextQuestion?._id] || '');
        setOutput('');
      } else {
        setFinishDialogOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
      showToast('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useHotkeys(
    'ctrl+enter, cmd+enter',
    (event) => {
      event.preventDefault();
      handleRunCode();
    },
    [code, language, running, eliminated],
  );

  useHotkeys(
    'ctrl+shift+c, cmd+shift+c',
    (event) => {
      event.preventDefault();
      handleCompileCode();
    },
    [code, language, running, eliminated],
  );

  useHotkeys(
    'ctrl+shift+s, cmd+shift+s',
    (event) => {
      event.preventDefault();
      handleSubmitAnswer();
    },
    [code, language, submitting, eliminated],
  );

  useHotkeys(
    'ctrl+/',
    (event) => {
      event.preventDefault();
      setShortcutInfoOpen(true);
    },
    [],
  );

  const handleFinish = async () => {
    try {
      await api.post(
        `/assessments/${assessmentId}/finish`,
        {},
        { withCredentials: true }
      );
      sessionStorage.removeItem(assessmentStateKey);
      sessionStorage.removeItem(violationStorageKey);
      localStorage.removeItem(localAssessmentStateKey);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      console.error('Error finishing assessment:', err);
      sessionStorage.removeItem(assessmentStateKey);
      sessionStorage.removeItem(violationStorageKey);
      navigate('/student/dashboard', { replace: true });
    }
  };

  useSocketEvent('submission-started', (payload) => {
    if (!submissionId || payload?.submissionId !== submissionId) return;
    setSubmissionStatus('running');
    setSubmissionMessage('Your code submission is being evaluated.');
  });

  useSocketEvent('submission-completed', (payload) => {
    if (!submissionId || payload?.submissionId !== submissionId) return;
    setSubmissionStatus(payload.status || 'completed');
    setSubmissionMessage(
      payload.status === 'completed'
        ? 'Submission evaluation completed.'
        : `Submission failed: ${payload.error || 'Unknown error'}`,
    );
  });

  useEffect(() => {
    if (!assessment || assessmentStatus !== 'live') return;
    saveAssessmentState({
      answers,
      currentQuestionIdx,
      code,
      language,
      timeLeft,
      cursorPosition: editorRef.current?.getPosition() || null,
      currentQuestionId: currentQuestion?._id,
    });
  }, [answers, currentQuestionIdx, code, language, timeLeft, assessment, assessmentStatus, currentQuestion]);

  useEffect(() => {
    if (assessmentStatus !== 'live') return;
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      saveAssessmentState({
        answers,
        currentQuestionIdx,
        code,
        language,
        timeLeft,
        cursorPosition: editorRef.current?.getPosition() || null,
        currentQuestionId: currentQuestion?._id,
      });
      setLocalSaveMessage('Autosaved locally');
      setTimeout(() => setLocalSaveMessage(''), 2000);
    }, 10000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [assessmentStatus, answers, currentQuestionIdx, code, language, timeLeft, currentQuestion]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Assessment not found</Alert>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (assessmentStatus === 'live' && showInstructionPage) {
    return (
      <Container sx={{ py: 6, maxWidth: 900 }}>
        <Paper sx={{ p: 4, mb: 4 }} elevation={3}>
          <Typography variant="h4" fontWeight={700} mb={2}>
            {assessment?.name}
          </Typography>
          <Typography variant="body1" mb={3}>
            Please read the instructions and verify the required permissions before starting your assessment.
          </Typography>

          <Box mb={3}>
            <Typography variant="h6" mb={1} fontWeight={600}>
              Instructions
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {assessment?.instructions || 'Complete the assessment within the allotted time. Do not switch tabs or refresh the page once the assessment begins. Your code will be evaluated against visible and hidden test cases.'}
            </Typography>
          </Box>

          <Paper sx={{ p: 3, mb: 3, bgcolor: '#FAFAFA' }} variant="outlined">
            <Typography variant="h6" fontWeight={600} mb={2}>
              Required Permissions
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {fullscreenPermission ? <CheckCircle color="success" /> : <WarningAmber color="warning" />}
                <Typography>Fullscreen Enabled</Typography>
                {!fullscreenPermission && (
                  <Button size="small" variant="outlined" onClick={handleEnableFullscreen}>
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

          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Please check each permission and then confirm that you have read and agree to the instructions.
            </Typography>
            <Button
              variant={acceptedInstructions ? 'contained' : 'outlined'}
              color={acceptedInstructions ? 'success' : 'primary'}
              onClick={handleInstructionsAccept}
            >
              {acceptedInstructions ? 'Instructions Accepted' : 'Accept Instructions'}
            </Button>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="primary"
              disabled={!acceptedInstructions || !permissionsReady}
              onClick={handleStartAssessment}
            >
              Start Assessment
            </Button>
            <Button variant="outlined" onClick={() => navigate('/student/assessments')}>
              Back to Assessments
            </Button>
          </Stack>
          {!permissionsReady && (
            <Typography variant="body2" color="error" mt={2}>
              You must enable all permissions and remain online to begin.
            </Typography>
          )}
        </Paper>
      </Container>
    );
  }

  if (assessmentStatus === 'live' && !questionsLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (assessmentStatus === 'live' && questions.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Your selected assessment questions are still loading or could not be assigned.</Alert>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  if (assessmentStatus === 'waiting') {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 720, mx: 'auto' }} elevation={3}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Assessment starts soon
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {assessment.name}
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: 'monospace', mb: 2 }}>
            {formatTime(timeToStart || 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            This assessment will become available at {new Date(assessment.startDate).toLocaleString()}.
          </Typography>
          <Button variant="contained" onClick={handleStartAssessment} sx={{ mr: 2 }}>
            Start Assessment Now
          </Button>
          <Button variant="outlined" onClick={() => navigate('/student/assessments')}>
            Back to Assessments
          </Button>
        </Paper>
      </Container>
    );
  }

  if (assessmentStatus === 'finished') {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 720, mx: 'auto' }} elevation={3}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Assessment already submitted
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your assessment attempt has already been completed. You can return to the dashboard to review your history.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Submission status: {submissionStatus || 'Completed'}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/student/assessments')}>
            Back to Assessments
          </Button>
        </Paper>
      </Container>
    );
  }

  if (assessmentStatus === 'ended') {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 720, mx: 'auto' }} elevation={3}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Assessment window closed
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The scheduled end time for this assessment has passed.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Ended at {new Date(assessment.endDate).toLocaleString()}.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/student/assessments')}>
            Back to Assessments
          </Button>
        </Paper>
      </Container>
    );
  }

  const hiddenTestCases = currentQuestion?.testCases?.filter((testCase) => testCase.isHidden) || [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F4F6', py: 2 }}>
      <Paper sx={{ mb: 2, p: 3, bgcolor: '#111827', color: '#F9FAFB' }} elevation={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 52,
                height: 52,
                bgcolor: '#ffffff',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700 }}>
                SW
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {assessment.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Candidate: {user?.name || 'Candidate'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={4} alignItems="center" sx={{ width: '100%', justifyContent: 'flex-end' }}>
            <Box textAlign="center">
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Remaining Time
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: timeLeft && timeLeft < 300 ? '#F87171' : '#34D399',
                  fontFamily: 'monospace',
                }}
              >
                {formatTime(timeLeft || 0)}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Violation Counter
              </Typography>
              <Chip
                label={`${violations}/${assessment.maxViolations || 3}`}
                color={violations >= (assessment.maxViolations || 3) ? 'error' : 'default'}
                size="small"
              />
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip
              label={isOnline ? 'Online' : 'Offline - local save active'}
              size="small"
              color={isOnline ? 'success' : 'warning'}
            />
            {localSaveMessage && (
              <Typography variant="body2" sx={{ mt: 1, color: '#FBBF24' }}>
                {localSaveMessage}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Container maxWidth="xl">
        {assessmentBanner && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {assessmentBanner}
          </Alert>
        )}
        {resumePending && assessmentStatus === 'live' && !questionsLoaded ? (
          <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }} elevation={3}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
              Resume your assessment
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              A previous attempt is still in progress. Click below to continue from where you left off.
            </Typography>
            <Button
              variant="contained"
              size="large"
              disabled={resumeLoading}
              onClick={handleResumeAssessment}
            >
              {resumeLoading ? 'Resuming...' : 'Resume Assessment'}
            </Button>
          </Paper>
        ) : null}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <Paper sx={{ flex: 0.45, p: 3, overflowY: 'auto', minHeight: '72vh' }} elevation={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Question List
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {questions.length} Questions
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Chip
                label={isOnline ? 'Online' : 'Offline - local save active'}
                size="small"
                color={isOnline ? 'success' : 'warning'}
              />
              {localSaveMessage && (
                <Typography variant="body2" sx={{ color: '#FBBF24' }}>
                  {localSaveMessage}
                </Typography>
              )}
            </Stack>

            <Stack spacing={1} sx={{ mb: 4 }}>
              {questions.map((q, idx) => (
                <Button
                  key={idx}
                  fullWidth
                  variant={idx === currentQuestionIdx ? 'contained' : 'outlined'}
                  onClick={() => handleQuestionSelect(idx)}
                  sx={{
                    justifyContent: 'space-between',
                    textTransform: 'none',
                    py: 1.5,
                    minHeight: 64,
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: idx === currentQuestionIdx ? 700 : 500, color: '#111827' }}>
                      Question {idx + 1}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {q.title || 'Untitled question'}
                    </Typography>
                  </Box>
                  <Chip
                    label={q.difficulty || 'N/A'}
                    size="small"
                    variant="outlined"
                    color={
                      q.difficulty === 'Easy'
                        ? 'success'
                        : q.difficulty === 'Medium'
                          ? 'warning'
                          : 'error'
                    }
                  />
                </Button>
              ))}
            </Stack>

            {currentQuestion && (
              <>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  {currentQuestion.title}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
                  <Chip label={`Difficulty: ${currentQuestion.difficulty || 'Unknown'}`} size="small" />
                  <Chip label={`${currentQuestion.marks ?? '0'} Marks`} size="small" />
                </Stack>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.7 }}>
                    {currentQuestion.description || 'No description available.'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Input Format
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563' }}>
                    {currentQuestion.inputFormat || 'Standard input'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Output Format
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563' }}>
                    {currentQuestion.outputFormat || 'Standard output'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Constraints
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563', fontFamily: 'monospace' }}>
                    {currentQuestion.constraints || 'None'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Visible Testcases
                  </Typography>
                  {visibleTestCases.length ? (
                    visibleTestCases.map((testCase, idx) => (
                      <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          Input: {testCase.input}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                          Output: {testCase.output}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      No visible testcases.
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Hidden Testcases
                  </Typography>
                  {hiddenTestCases.length ? (
                    hiddenTestCases.map((testCase, idx) => (
                      <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: '#F3F4F6', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          Hidden testcase {idx + 1}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      No hidden testcases.
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Paper>

          <Stack sx={{ flex: 0.55, display: 'flex', gap: 2 }}>
            <Paper sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', bgcolor: '#111827' }} elevation={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#F9FAFB' }}>
                  Editor
                </Typography>
                <FormControl sx={{ minWidth: 180, bgcolor: '#0F172A', borderRadius: 1 }}>
                  <InputLabel sx={{ color: '#D1D5DB' }}>Language</InputLabel>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    label="Language"
                    size="small"
                    sx={{
                      color: '#F9FAFB',
                      '.MuiSvgIcon-root': { color: '#F9FAFB' },
                    }}
                  >
                                  {supportedLanguages.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Box sx={{ flex: 1, borderRadius: 2, overflow: 'hidden', minHeight: 420, mb: 2 }}>
                <Editor
                  height="100%"
                  defaultLanguage={language}
                  language={language}
                  value={code}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    insertSpaces: true,
                    folding: true,
                    lineNumbers: 'on',
                    fontFamily: 'Consolas, Monaco, Courier New, monospace',
                    autoIndent: 'full',
                    formatOnType: true,
                    formatOnPaste: true,
                  }}
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleCompileCode}
                  disabled={running || eliminated}
                  sx={{ flex: 1, bgcolor: '#6366F1' }}
                >
                  {running ? 'Compiling...' : 'Compile Code'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRunCode}
                  disabled={running || eliminated}
                  sx={{ flex: 1, bgcolor: '#3B82F6' }}
                >
                  {running ? 'Running...' : 'Run Sample Testcases'}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || eliminated}
                  sx={{ flex: 1, bgcolor: '#10B981' }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Stack>

              <Paper sx={{ p: 2, bgcolor: '#0F172A', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#D1D5DB', mb: 1 }}>
                  Compiler Results
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                  Compile, run sample testcases, or submit your code to see feedback.
                </Typography>

                {submissionVerdict && (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: '#111827', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#D1D5DB', mb: 1 }}>
                      Verdict
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#F8FAFC' }}>
                      {submissionVerdict}
                    </Typography>
                  </Paper>
                )}

                {lastExecution?.compilationOutput && (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: '#111827', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#D1D5DB', mb: 1 }}>
                      Compilation Output
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#F8FAFC' }}>
                      {lastExecution.compilationOutput}
                    </Typography>
                  </Paper>
                )}

                {lastExecution?.testResults?.length ? (
                  <Stack spacing={1}>
                    {lastExecution.testResults.map((result, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          bgcolor: result.passed ? '#134E4A' : '#7F1D1D',
                          color: '#F8FAFC',
                          borderRadius: 2,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Testcase {index + 1}
                          </Typography>
                          <Typography variant="body2">
                            {result.passed ? '✔ Passed' : '✖ Failed'}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                          Input: {result.input}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          Expected: {result.expectedOutput}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          Output: {result.output}
                        </Typography>
                        {result.error && (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1, color: '#FECACA' }}>
                            Error: {result.error}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Run code to see test case results here.
                  </Typography>
                )}
              </Paper>

              <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
                <Paper sx={{ flex: 1, p: 2, bgcolor: '#0F172A', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Execution Time
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#F8FAFC' }}>
                    {lastExecution?.executionTimeMs != null ? `${lastExecution.executionTimeMs} ms` : '—'}
                  </Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, bgcolor: '#0F172A', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Memory Used
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#F8FAFC' }}>
                    {lastExecution?.memoryUsage || '—'}
                  </Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, bgcolor: '#0F172A', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    Compilation Errors
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#F8FAFC' }}>
                    {lastExecution?.compilationSuccess === false ? 'Yes' : 'No'}
                  </Typography>
                </Paper>
              </Stack>
            </Paper>
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="error"
            size="large"
            sx={{ px: 6, py: 1.8 }}
            onClick={() => setFinishDialogOpen(true)}
          >
            Finish Assessment
          </Button>
        </Box>
      </Container>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ position: 'fixed', bottom: 16, right: 16, maxWidth: 400 }}>
          {error}
        </Alert>
      )}

      {/* Finish Dialog */}
      <Dialog open={finishDialogOpen} onClose={() => setFinishDialogOpen(false)}>
        <DialogTitle>Finish Assessment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to finish the assessment? You won't be able to come back to answer remaining questions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinishDialogOpen(false)}>Continue</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setFinishDialogOpen(false);
              handleFinish();
            }}
          >
            Finish Now
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={connectionOpen}
        autoHideDuration={4000}
        onClose={() => setConnectionOpen(false)}
        message={connectionMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
      <Dialog open={shortcutInfoOpen} onClose={() => setShortcutInfoOpen(false)}>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ minWidth: 320 }}>
            <Typography variant="body2">Ctrl/Cmd + Enter: Run Sample Testcases</Typography>
            <Typography variant="body2">Ctrl/Cmd + Shift + C: Compile Code</Typography>
            <Typography variant="body2">Ctrl/Cmd + Shift + S: Submit Answer</Typography>
            <Typography variant="body2">Ctrl + /: Open this shortcuts dialog</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShortcutInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssessmentTestingPage;
