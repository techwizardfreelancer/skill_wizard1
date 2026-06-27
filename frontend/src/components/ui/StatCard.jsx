import { Card, CardContent, Typography, Stack, Box } from '@mui/material';

const StatCard = ({ label, value, icon, trend, color = 'primary.main' }) => {
  return (
    <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 4, overflow: 'hidden' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {value ?? '--'}
            </Typography>
          </Box>
          {icon && (
            <Box sx={{ color, bgcolor: 'rgba(59, 130, 246, 0.12)', borderRadius: 3, p: 1.5, display: 'inline-flex' }}>
              {icon}
            </Box>
          )}
        </Stack>
        {trend && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {trend}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
