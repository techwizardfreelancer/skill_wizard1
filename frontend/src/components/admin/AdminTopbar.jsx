import { AppBar, Box, Avatar, IconButton, Toolbar, Typography, Menu, MenuItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const AdminTopbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangePassword = () => {
    navigate('/admin/change-password');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3, py: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Admin portal
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            Welcome back, {user?.name || 'Admin'}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton color="inherit" sx={{ bgcolor: 'grey.100' }}>
            <NotificationsIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'primary.main', cursor: 'pointer' }} onClick={handleMenuOpen}>
            {user?.name?.[0] || 'A'}
          </Avatar>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminTopbar;
