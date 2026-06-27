import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Container sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box textAlign="center">
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={3}>
        Page not found.
      </Typography>
      <Button component={Link} to="/login" variant="contained">
        Go to Login
      </Button>
    </Box>
  </Container>
);

export default NotFoundPage;
