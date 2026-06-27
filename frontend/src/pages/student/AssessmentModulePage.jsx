import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';

const moduleConfig = {
  'question-bank': {
    title: 'Question Bank',
    description: 'Browse practice questions and sample problems from our assessment bank.',
    action: { label: 'Go to Question Bank', to: '/student/assessments' },
  },
  'assessment-management': {
    title: 'Assessment Management',
    description: 'View assigned assessments, manage your attempts, and see available tasks.',
    action: { label: 'View Assessments', to: '/student/assessments' },
  },
  'coding-test': {
    title: 'Coding Test',
    description: 'Attempt programming challenges using the built-in editor and submit your code.',
    action: { label: 'Start a Coding Test', to: '/student/assessments' },
  },
  compiler: {
    title: 'Compiler',
    description: 'Run and validate code using the platform compiler environment.',
    action: { label: 'Open Compiler', to: '/student/assessments' },
  },
  evaluation: {
    title: 'Evaluation',
    description: 'Review grades, manual feedback, and evaluation details for your submissions.',
    action: { label: 'View Evaluation', to: '/student/assessments/history' },
  },
  results: {
    title: 'Results',
    description: 'Track performance trends, scores, and progress across all assessments.',
    action: { label: 'View Results', to: '/student/assessments/history' },
  },
  'violation-monitoring': {
    title: 'Violation Monitoring',
    description: 'See any academic integrity flags or monitoring status for your assessment attempts.',
    action: { label: 'View Monitoring', to: '/student/assessments/history' },
  },
};

const AssessmentModulePage = () => {
  const { module } = useParams();
  const navigate = useNavigate();
  const moduleData = useMemo(() => moduleConfig[module], [module]);

  if (!moduleData) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} mb={2}>
          Module not found
        </Typography>
        <Typography color="text.secondary" mb={3}>
          The selected assessment module does not exist yet.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/student/assessments')}>
          Back to Assessments
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {moduleData.title}
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {moduleData.description}
        </Typography>
        <Button variant="contained" onClick={() => navigate(moduleData.action.to)}>
          {moduleData.action.label}
        </Button>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Some modules are connected to existing assessment workflows. We will enhance these sections with deeper support and dedicated tools soon.
      </Typography>
    </Box>
  );
};

export default AssessmentModulePage;
