import { Box, Button, Card, CardContent, Grid, Typography, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminAttemptsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('completed');

  useEffect(() => {
    api.get('/admin/attempts').then((res) => setAttempts(res.data)).catch(console.error);
  }, []);

  const handleReview = async () => {
    if (!selected) return;
    await api.patch(`/admin/attempts/${selected._id}/review`, { score: Number(score), status });
    const res = await api.get('/admin/attempts');
    setAttempts(res.data);
    setSelected(null);
    setScore('');
    setStatus('completed');
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>Assessment Attempts</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          {attempts.map((a) => (
            <Card key={a._id} sx={{ mb: 2 }} onClick={() => setSelected(a)}>
              <CardContent>
                <Typography><strong>Student:</strong> {a.studentId?.name} ({a.studentId?.email})</Typography>
                <Typography><strong>Course:</strong> {a.courseId?.title}</Typography>
                <Typography><strong>Level:</strong> {a.level}</Typography>
                <Typography><strong>Status:</strong> {a.status}</Typography>
                <Typography><strong>Score:</strong> {a.score}%</Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Review</Typography>
          {selected ? (
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography><strong>Selected:</strong> {selected.studentId?.name} - {selected.courseId?.title} (L{selected.level})</Typography>
                <TextField fullWidth label="Score (%)" value={score} onChange={(e) => setScore(e.target.value)} sx={{ my: 2 }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                    <MenuItem value="completed">completed</MenuItem>
                    <MenuItem value="failed">failed</MenuItem>
                    <MenuItem value="pending">pending</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handleReview}>Save Review</Button>
              </CardContent>
            </Card>
          ) : (
            <Typography>Select an attempt to review</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAttemptsPage;
