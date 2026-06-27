import { Alert, Box } from '@mui/material';

const SubmissionStatusBanner = ({ status, message }) => {
  if (!message) return null;

  const severity =
    status === 'completed'
      ? 'success'
      : status === 'failed'
      ? 'error'
      : 'info';

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity={severity}>{message}</Alert>
    </Box>
  );
};

export default SubmissionStatusBanner;
