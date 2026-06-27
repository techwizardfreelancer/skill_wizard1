import { Box, Card, CardContent, Typography, Button, RadioGroup, FormControlLabel, Radio, TextField, Alert, Chip, Stack, Divider, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import api from '../../services/api';

const AssessmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.get(`/student/assessments/${id}`);
        setAssessment(res.data);
        const initialAnswers = {};
        (res.data.questions || []).forEach((question) => {
          initialAnswers[question._id] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    try {
      setStatus('Submitting...');
      const payload = {
        answers: assessment.questions.map((question) => ({
          questionId: question._id,
          answer: answers[question._id] ?? '',
        })),
      };
      const res = await api.post(`/student/assessments/${id}/submit`, payload);
      setResult(res.data);
      setStatus('');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleBack = () => {
    navigate('/student/assessments');
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  if (!assessment && !result) return <Typography>Loading assessment...</Typography>;

  const isLive = assessment?.status === 'live';
  const questionCount = assessment?.questions?.length || 0;

  if (result) {
    return (
      <Box>
        <Card sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h5" mb={2}>
              Assessment Result
            </Typography>
            <Alert severity={result.passed ? 'success' : result.pendingReview ? 'warning' : 'error'} sx={{ mb: 2 }}>
              {result.pendingReview
                ? 'Your submission is pending review.'
                : result.passed
                ? '✅ Passed!'
                : '❌ Failed'}
            </Alert>
            <Typography variant="h6" mb={1}>
              Score: {result.percentage}% ({result.marksObtained}/{result.totalMarks})
            </Typography>
            <Typography variant="body2" mb={1}>
              Status: <strong>{result.status}</strong>
            </Typography>
            <Typography variant="body2" mb={1}>
              Time Taken: {result.timeTaken ? `${result.timeTaken}s` : '-'}
            </Typography>
            <Typography variant="body2" mb={1}>
              Passed Test Cases: {result.passedTestCases ?? 0}
            </Typography>
            <Typography variant="body2" mb={1}>
              Failed Test Cases: {result.failedTestCases ?? 0}
            </Typography>
            <Typography variant="body2" mb={2}>
              Violations: {result.violations ?? 0}
            </Typography>
            {result.passed && <Typography color="success.main">Great job! You passed the assessment.</Typography>}
            {result.pendingReview && <Typography color="text.secondary">A reviewer will evaluate your code and written answers shortly.</Typography>}
            {!result.passed && !result.pendingReview && (
              <Typography color="error">
                You can retry this assessment once it is live again.
              </Typography>
            )}
            <Button variant="contained" sx={{ mt: 3 }} onClick={handleBack}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} spacing={2}>
        <Box>
          <Typography variant="h4">{assessment?.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {assessment?.description}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={8}>
          {assessment?.instructions && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Assessment Rules
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {assessment.instructions}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Assessment Details
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">Duration: {assessment?.duration} minutes</Typography>
                <Typography variant="body2">Questions: {questionCount}</Typography>
                <Typography variant="body2">Total Marks: {assessment?.totalMarks}</Typography>
                <Typography variant="body2">Passing Score: {assessment?.passingMarks}%</Typography>
                <Typography variant="body2">Starts: {formatDate(assessment?.startDate)}</Typography>
                <Typography variant="body2">Ends: {formatDate(assessment?.endDate)}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!isLive && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This assessment is not currently live. It may be upcoming or already completed.
        </Alert>
      )}

      {(assessment?.questions || []).map((question, index) => {
        const questionAnswer = answers[question._id] ?? '';
        return (
          <Card key={question._id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {index + 1}. {question.prompt || question.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Marks: {question.marks}
              </Typography>

              {question.type === 'MCQ' && (
                <RadioGroup value={questionAnswer} onChange={(e) => handleAnswerChange(question._id, e.target.value)}>
                  {question.options.map((option, idx) => (
                    <FormControlLabel key={idx} value={option} control={<Radio />} label={option} />
                  ))}
                </RadioGroup>
              )}

              {question.type === 'Programming' && (
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                  <Editor
                    height="300px"
                    defaultLanguage={question.programmingLanguages?.[0]?.toLowerCase() || 'javascript'}
                    value={questionAnswer}
                    onChange={(value) => handleAnswerChange(question._id, value || '')}
                    options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
                  />
                </Box>
              )}

              {(question.type === 'Written' || question.type === 'output') && (
                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  value={questionAnswer}
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                />
              )}
            </CardContent>
          </Card>
        );
      })}

      {status && <Typography color="error" mb={2}>{status}</Typography>}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={!isLive}>
          Submit Assessment
        </Button>
        <Button variant="outlined" onClick={handleBack}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AssessmentDetailPage;
