import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Box, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'Students', icon: <PeopleIcon />, path: '/admin/students' },
  { label: 'Courses', icon: <MenuBookIcon />, path: '/admin/courses' },
  { label: 'Assessments', icon: <MenuBookIcon />, path: '/admin/assessments' },
  { label: 'Questions', icon: <RateReviewIcon />, path: '/admin/questions/manage' },
  { label: 'Code Reviews', icon: <RateReviewIcon />, path: '/admin/code-reviews' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid #e2e8f0',
        },
      }}
    >
      <Toolbar sx={{ px: 3, py: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={900} color="primary.main">
            Skill Wizard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin workspace
          </Typography>
        </Box>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={active}
                sx={{
                  borderRadius: 3,
                  my: 0.5,
                  color: active ? 'primary.main' : 'text.primary',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(79, 70, 229, 0.12)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 'auto', px: 3, py: 2 }}>
        <Paper elevation={0} sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)', borderRadius: 3, p: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Premium admin toolkit
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            Secure workflow
          </Typography>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
