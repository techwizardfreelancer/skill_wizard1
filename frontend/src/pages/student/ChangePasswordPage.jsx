import { Box, Button, Card, CardContent, TextField, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password cannot be the same as current password');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setStatus('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate('/student/profile');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Change Password
      </Typography>

      <Box maxWidth={500}>
        <Card elevation={2}>
          <CardContent>
            <Box component="form" onSubmit={handleChangePassword} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && <Alert severity="error">{error}</Alert>}
              {status && <Alert severity="success">{status}</Alert>}

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter your current password and your new password below. Your new password must be at least 8 characters long.
              </Typography>

              <TextField
                label="Current Password"
                type="password"
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                required
              />

              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                helperText="Minimum 8 characters"
              />

              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />

              <Box display="flex" gap={2} mt={2}>
                <Button type="submit" variant="contained" fullWidth disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/student/profile')} disabled={loading}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ChangePasswordPage;
