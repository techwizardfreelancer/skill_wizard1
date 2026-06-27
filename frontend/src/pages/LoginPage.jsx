import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);
  const googleScriptRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const collegeDomain = import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || 'college.edu';

  const validateIdentifier = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    }
    return trimmed.length >= 3 && trimmed.length <= 50;
  };
  const validatePassword = (value) => value.length >= 8;

  const handleNavigation = (userData) => {
    login(userData);
    if (userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const formatApiError = (err) => {
    const message = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
    const status = err?.response?.status;
    return status ? `${message} (${status})` : message;
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username or email is required');
      return;
    }
    if (!validateIdentifier(username)) {
      setError('Enter a valid username or email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username: username.trim(), password });
      handleNavigation(response.data.user);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialResponse = async (response) => {
    if (!response?.credential) {
      setError('Unable to verify Google credentials.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.post('/auth/google-login', { idToken: response.credential });
      handleNavigation(result.data.user);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      if (!window.google.accounts.id.initialized) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
          cancel_on_tap_outside: false,
        });
        window.google.accounts.id.initialized = true;
      }

      if (googleButtonRef.current) {
        try {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
          });
        } catch (renderError) {
          console.warn('Google renderButton failed', renderError);
        }
      }

      setGoogleReady(true);
    };

    if (!window.google?.accounts?.id) {
      if (!googleScriptRef.current) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.body.appendChild(script);
        googleScriptRef.current = script;
      }
    } else {
      initializeGoogle();
    }
  }, [googleClientId]);

  const handleGoogleLogin = async () => {
    setError('');
    if (!googleClientId) {
      setError('Google auth is not configured.');
      return;
    }
    if (!window.google?.accounts?.id) {
      setError('Google auth not available. Reload and try again.');
      return;
    }

    try {
      window.google.accounts.id.prompt();
    } catch (err) {
      console.error('Google prompt error', err);
      setError('Unable to open Google sign-in. Please try again.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#eef2ff', py: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="lg">
        <Paper
          elevation={12}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
            borderRadius: 6,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(15, 23, 42, 0.12)',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              bgcolor: 'transparent',
              background: 'linear-gradient(180deg, #0f172a 0%, #2563eb 100%)',
              color: '#fff',
              p: { xs: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 560,
            }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={2}
                mb={5}
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box
                    component="img"
                    src="/logo.jpeg"
                    alt="Tech Wizard Logo"
                    sx={{ width: 72, height: 72, borderRadius: 3, objectFit: 'cover', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
                  />
                  <Typography variant="subtitle2" sx={{ letterSpacing: 2, color: 'rgba(255,255,255,0.88)' }}>
                    TECH WIZARD
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" sx={{ letterSpacing: 4, fontWeight: 700, color: '#fff' }}>
                  FREELANCER
                </Typography>
              </Stack>

              <Typography variant="h2" fontWeight={900} mb={1} sx={{ lineHeight: 1.02, letterSpacing: '-0.04em' }}>
                Secure sign in
              </Typography>
              <Typography variant="h4" fontWeight={800} mb={3} sx={{ letterSpacing: '-0.03em' }}>
                Skill Wizard
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.84)', maxWidth: 420, mb: 5 }}>
                Access your premium student or admin portal with one secure login. Keep your assessments, progress, and workflows organized.
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ opacity: 0.95 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                • Fast access to assessments and performance dashboards
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                • Google sign-in support for college email accounts
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                • Strong authentication for students and admins
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#ffffff' }}>
            <Typography variant="h5" fontWeight={800} mb={1}>
              Welcome back
            </Typography>
            <Typography color="text.secondary" mb={4}>
              Sign in to continue to Skill Wizard.
            </Typography>

            <Box component="form" onSubmit={handlePasswordLogin} sx={{ display: 'grid', gap: 2 }}>
              <Stack spacing={2}>
                <TextField
                  id="username-input"
                  label="Username or Email"
                  placeholder="Freelancer"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  fullWidth
                  disabled={loading}
                  inputProps={{ maxLength: 50 }}
                  autoComplete="username"
                />
                <TextField
                  id="password-input"
                  label="Password"
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  fullWidth
                  disabled={loading}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ maxLength: 50 }}
                />
              </Stack>

              <Button
                type="submit"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 700,
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  textTransform: 'none',
                  boxShadow: '0 18px 30px rgba(37, 99, 235, 0.25)',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                }}
              >
                {loading ? (
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                    Logging in...
                  </Stack>
                ) : (
                  'Login'
                )}
              </Button>
            </Box>

            {error && (
              <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                {error}
              </Typography>
            )}

            <Stack direction="row" spacing={2} my={3} sx={{ alignItems: 'center' }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: '#e5e7eb' }} />
              <Typography color="text.secondary" variant="body2">
                OR
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: '#e5e7eb' }} />
            </Stack>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{
                py: 1.8,
                borderRadius: 3,
                borderColor: '#d1d5db',
                color: '#111827',
                backgroundColor: '#ffffff',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                },
              }}
            >
              Sign in with Google
            </Button>

            <Typography
              color="text.secondary"
              variant="caption"
              sx={{ textAlign: 'center', display: 'block', mt: 3 }}
            >
              Use only your college email for Google sign-in, e.g. studentname@{collegeDomain}
            </Typography>
            <Typography
              color="text.secondary"
              variant="caption"
              sx={{ textAlign: 'center', display: 'block', mt: 1 }}
            >
              Created by TECH-WIZARD(Freelancer)
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
