import { Box, Button, Card, CardContent, Grid, Tab, Tabs, Typography, TextField, Stack, Paper, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const tabItems = [
  { value: 'questions', label: 'Questions' },
  { value: 'assessments', label: 'Assessments' },
  { value: 'results', label: 'Results' },
  { value: 'settings', label: 'Settings' },
];

const defaultSettings = {
  defaultPassingMarks: 40,
  defaultDuration: 60,
  allowCopyPaste: false,
  requireFullscreen: false,
  maxViolations: 3,
};

const AdminAssessmentsPage = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questionCount, setQuestionCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [assessments, setAssessments] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [questionRes, assessmentRes] = await Promise.all([
          api.get('/questions', { params: { page: 1, limit: 1 } }),
          api.get('/assessments', { params: { page: 1, limit: 1 } }),
        ]);
        setQuestionCount(questionRes.data.total || 0);
        setAssessmentCount(assessmentRes.data.total || 0);
      } catch (err) {
        console.error(err);
      }
    };

    const loadSettings = () => {
      const persisted = localStorage.getItem('adminAssessmentSettings');
      if (persisted) {
        setSettings(JSON.parse(persisted));
      }
    };

    loadCounts();
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'results') {
      api.get('/assessments', { params: { page: 1, limit: 10 } })
        .then((res) => setAssessments(res.data.assessments || []))
        .catch(console.error);
    }
  }, [activeTab]);

  const handleTabChange = (event, value) => {
    setActiveTab(value);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('adminAssessmentSettings', JSON.stringify(settings));
    setMessage('Assessment settings saved locally.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Assessment Management Panel
      </Typography>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {tabItems.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      {activeTab === 'questions' && (
        <Box>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" mb={1}>
                  Question Bank
                </Typography>
                <Typography color="text.secondary" mb={2}>
                  Manage the full library of assessment questions used across coding tests, MCQs, and written evaluations.
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {questionCount}
                </Typography>
                <Typography color="text.secondary">Total questions</Typography>
                <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/admin/questions')}>
                  Go to Questions
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" mb={1}>
                  Create Question
                </Typography>
                <Typography color="text.secondary" mb={2}>
                  Add new questions with test cases, difficulty, marks, and programming setup.
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/admin/questions/create')}>
                  Add Question
                </Button>
              </Paper>
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary">
            Use the Questions tab to add, edit, and remove questions that will be assigned to assessments.
          </Typography>
        </Box>
      )}

      {activeTab === 'assessments' && (
        <Box>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" mb={1}>
                  Assessments Overview
                </Typography>
                <Typography color="text.secondary" mb={2}>
                  Create and manage assessment windows, question assignments, and publish schedules.
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {assessmentCount}
                </Typography>
                <Typography color="text.secondary">Total assessments</Typography>
                <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/admin/assessments/manage')}>
                  Manage Assessments
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" mb={1}>
                  Create Assessment
                </Typography>
                <Typography color="text.secondary" mb={2}>
                  Start a new assessment with custom duration, passing marks, and assigned students.
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/admin/create-assessment')}>
                  Create Assessment
                </Button>
              </Paper>
            </Grid>
          </Grid>
          <Typography variant="body2" color="text.secondary">
            This tab contains the assessment creation and management workflow for the admin panel.
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/admin/assessments/manage')}>
            Open Assessment List
          </Button>
        </Box>
      )}

      {activeTab === 'results' && (
        <Box>
          <Typography variant="h6" mb={2}>
            Assessment Results Overview
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Select an assessment to view student submissions, grading, and analytics.
          </Typography>
          <Grid container spacing={2}>
            {assessments.map((assessment) => (
              <Grid item xs={12} md={6} key={assessment._id}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {assessment.name}
                    </Typography>
                    <Typography color="text.secondary">
                      {assessment.status} • {assessment.totalQuestions} questions
                    </Typography>
                    <Typography color="text.secondary">
                      Runs from {new Date(assessment.startDate).toLocaleDateString()} to {new Date(assessment.endDate).toLocaleDateString()}
                    </Typography>
                    <Button variant="contained" onClick={() => navigate(`/admin/assessment/${assessment._id}/results`)}>
                      View Results
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
            {assessments.length === 0 && (
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography>No assessments found yet.</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {activeTab === 'settings' && (
        <Box>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>
              Assessment Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Default Passing Marks (%)"
                  type="number"
                  value={settings.defaultPassingMarks}
                  onChange={(e) => setSettings({ ...settings, defaultPassingMarks: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Default Duration (min)"
                  type="number"
                  value={settings.defaultDuration}
                  onChange={(e) => setSettings({ ...settings, defaultDuration: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Max Violations"
                  type="number"
                  value={settings.maxViolations}
                  onChange={(e) => setSettings({ ...settings, maxViolations: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Copy / Paste</InputLabel>
                  <Select
                    value={settings.allowCopyPaste ? 'enabled' : 'disabled'}
                    label="Copy / Paste"
                    onChange={(e) => setSettings({ ...settings, allowCopyPaste: e.target.value === 'enabled' })}
                  >
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Require Fullscreen</InputLabel>
                  <Select
                    value={settings.requireFullscreen ? 'enabled' : 'disabled'}
                    label="Require Fullscreen"
                    onChange={(e) => setSettings({ ...settings, requireFullscreen: e.target.value === 'enabled' })}
                  >
                    <MenuItem value="enabled">Enabled</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="contained" onClick={handleSaveSettings}>Save Settings</Button>
              <Button variant="outlined" onClick={() => setSettings(defaultSettings)}>Reset Defaults</Button>
            </Stack>
            {message && (
              <Typography color="success.main" sx={{ mt: 2 }}>
                {message}
              </Typography>
            )}
          </Paper>
          <Typography variant="body2" color="text.secondary">
            These assessment settings are stored locally in the browser for now. Use them as default values for creating new assessments.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdminAssessmentsPage;
