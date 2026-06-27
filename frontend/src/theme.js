import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5b21b6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2563eb',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#dc2626',
    },
    info: {
      main: '#0284c7',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 22px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)',
          minHeight: '100vh',
          color: '#111827',
        },
      },
    },
  },
});

export default theme;
