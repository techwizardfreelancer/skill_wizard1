import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import api from '../../services/api';

const CodeReviewPage = () => {
  const [formData, setFormData] = useState({ subject: '', message: '', code: '', courseId: '', testId: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    try {
      await api.post('/student/code-reviews', formData);
      setStatus('Code review request submitted successfully.');
      setFormData({ subject: '', message: '', code: '', courseId: '', testId: '' });
    } catch (error) {
      setStatus('Failed to submit request.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Request Code Review
      </Typography>
      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} margin="normal" multiline rows={4} required />
          <TextField fullWidth label="Upload Code or Paste" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} margin="normal" multiline rows={6} required />
          <TextField fullWidth label="Course ID" value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Test ID" value={formData.testId} onChange={(e) => setFormData({ ...formData, testId: e.target.value })} margin="normal" required />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Submit
          </Button>
          {status && (
            <Typography variant="body2" color="success.main" mt={2}>
              {status}
            </Typography>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default CodeReviewPage;
