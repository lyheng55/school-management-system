import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Snackbar,
  Alert,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import GradeIcon from '@mui/icons-material/Grade';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import BookIcon from '@mui/icons-material/Book';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LogoutIcon from '@mui/icons-material/Logout';
import MailIcon from '@mui/icons-material/Mail';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import EventIcon from '@mui/icons-material/Event';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import RouteIcon from '@mui/icons-material/Route';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [rateLimitError, setRateLimitError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { mode, toggleTheme } = useTheme();

  // Check for permission errors from sessionStorage
  useEffect(() => {
    const checkPermissionError = () => {
      try {
        const storedError = sessionStorage.getItem('permissionError');
        if (storedError) {
          const error = JSON.parse(storedError);
          // Only show if error is recent (within last 5 minutes)
          if (Date.now() - error.timestamp < 300000) {
            setPermissionError(error.message);
            sessionStorage.removeItem('permissionError');
          } else {
            sessionStorage.removeItem('permissionError');
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    checkPermissionError();
    
    // Listen for storage events (in case error is set from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'permissionError') {
        checkPermissionError();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for rate limit errors (429) from sessionStorage
  useEffect(() => {
    const checkRateLimitError = () => {
      try {
        const storedError = sessionStorage.getItem('rateLimitError');
        if (storedError) {
          const error = JSON.parse(storedError);
          // Only show if error is recent (within last 2 minutes)
          if (Date.now() - error.timestamp < 120000) {
            setRateLimitError(error.message);
            sessionStorage.removeItem('rateLimitError');
          } else {
            sessionStorage.removeItem('rateLimitError');
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    // Check immediately on mount
    checkRateLimitError();
    
    // Listen for storage events (in case error is set from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'rateLimitError') {
        checkRateLimitError();
      }
    };
    
    // Listen for custom events from the same window (triggered by API interceptor)
    const handleCustomEvent = () => {
      checkRateLimitError();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('rateLimitError', handleCustomEvent);
    
    // Also check periodically (every 500ms) to catch errors set in the same window
    const intervalId = setInterval(checkRateLimitError, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rateLimitError', handleCustomEvent);
      clearInterval(intervalId);
    };
  }, []);

  // Menu items based on user role - memoized for performance
  const menuItems = useMemo(() => {
    const userRole = user?.role;
    if (!userRole) return [];

    // Menu items configuration with role-based access
    const allMenuItems = [
      { text: t('nav.dashboard'), key: 'dashboard', icon: <DashboardIcon />, path: '/', roles: ['admin', 'teacher', 'student'] },
      { text: t('parentDashboard.title'), key: 'parent-dashboard', icon: <DashboardIcon />, path: '/parent/dashboard', roles: ['parent'] },
      { text: t('nav.students'), key: 'students', icon: <PeopleIcon />, path: '/students', roles: ['admin', 'teacher'] },
      { text: t('nav.teachers'), key: 'teachers', icon: <SchoolIcon />, path: '/teachers', roles: ['admin'] },
      { text: t('nav.parents'), key: 'parents', icon: <FamilyRestroomIcon />, path: '/parents', roles: ['admin'] },
      { text: t('nav.classes'), key: 'classes', icon: <ClassIcon />, path: '/classes', roles: ['admin', 'teacher'] },
      { text: t('nav.subjects'), key: 'subjects', icon: <BookIcon />, path: '/subjects', roles: ['admin', 'teacher'] },
      { text: t('nav.timetables'), key: 'timetables', icon: <ScheduleIcon />, path: '/timetables', roles: ['admin', 'teacher'] },
      { text: t('parentTimetable.title'), key: 'parent-timetable', icon: <ScheduleIcon />, path: '/parent/timetable', roles: ['parent'] },
      { text: t('nav.attendance'), key: 'attendance', icon: <AssignmentIcon />, path: '/attendance', roles: ['admin', 'teacher'] },
      { text: t('parentAttendance.title'), key: 'parent-attendance', icon: <AssignmentIcon />, path: '/parent/attendance', roles: ['parent'] },
      { text: t('nav.exams'), key: 'exams', icon: <QuizIcon />, path: '/exams', roles: ['admin', 'teacher'] },
      { text: t('nav.grades'), key: 'grades', icon: <GradeIcon />, path: '/grades', roles: ['admin', 'teacher', 'student'] },
      { text: t('parentGrades.title'), key: 'parent-grades', icon: <GradeIcon />, path: '/parent/grades', roles: ['parent'] },
      { text: t('nav.behaviors'), key: 'behaviors', icon: <PsychologyIcon />, path: '/behaviors', roles: ['admin', 'teacher'] },
      { text: t('nav.achievements'), key: 'achievements', icon: <EmojiEventsIcon />, path: '/achievements', roles: ['admin', 'teacher', 'student'] },
      { text: t('nav.fees'), key: 'fees', icon: <AttachMoneyIcon />, path: '/fees', roles: ['admin'] },
      { text: t('parentFees.title'), key: 'parent-fees', icon: <AttachMoneyIcon />, path: '/parent/fees', roles: ['parent'] },
      { text: t('nav.payments'), key: 'payments', icon: <PaymentIcon />, path: '/payments', roles: ['admin'] },
      { text: t('nav.messages'), key: 'messages', icon: <MailIcon />, path: '/messages', roles: ['admin', 'teacher', 'parent', 'student'] },
      { text: t('nav.announcements'), key: 'announcements', icon: <AnnouncementIcon />, path: '/announcements', roles: ['admin', 'teacher', 'parent', 'student'] },
      { text: t('nav.events'), key: 'events', icon: <EventIcon />, path: '/events', roles: ['admin', 'teacher', 'parent', 'student'] },
      { text: t('nav.books'), key: 'books', icon: <LibraryBooksIcon />, path: '/books', roles: ['admin', 'teacher', 'student'] },
      { text: t('nav.borrows'), key: 'borrows', icon: <LibraryBooksIcon />, path: '/borrows', roles: ['admin', 'teacher', 'student'] },
      { text: t('nav.routes'), key: 'routes', icon: <RouteIcon />, path: '/routes', roles: ['admin'] },
      { text: t('nav.vehicles'), key: 'vehicles', icon: <DirectionsBusIcon />, path: '/vehicles', roles: ['admin'] },
      { text: t('nav.drivers'), key: 'drivers', icon: <PersonIcon />, path: '/drivers', roles: ['admin'] },
      { text: t('nav.assets'), key: 'assets', icon: <InventoryIcon />, path: '/assets', roles: ['admin'] },
      { text: t('nav.maintenances'), key: 'maintenances', icon: <BuildIcon />, path: '/maintenances', roles: ['admin'] },
      { text: t('nav.reports'), key: 'reports', icon: <AssessmentIcon />, path: '/reports', roles: ['admin'] },
    ];
    
    // Filter menu items based on user role
    return allMenuItems.filter(item => {
      // If roles array exists, check if user role is included
      if (item.roles && Array.isArray(item.roles)) {
        return item.roles.includes(userRole);
      }
      // If no roles specified, don't show (shouldn't happen with proper config)
      return false;
    });
  }, [user?.role, t]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {t('auth.schoolManagementSystem')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('common.logout')} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text || t('nav.dashboard')}
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            aria-label={mode === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
            sx={{ mr: 2 }}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <Select
              value={i18n.language || 'en'}
              onChange={(e) => {
                const newLang = e.target.value;
                i18n.changeLanguage(newLang);
              }}
              sx={{ color: 'inherit', '& .MuiSelect-icon': { color: 'inherit' } }}
            >
              <MenuItem value="en">{t('language.english')}</MenuItem>
              <MenuItem value="km">{t('language.khmer')}</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.username || user?.email}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
      
      {/* Permission Error Snackbar */}
      <Snackbar
        open={!!permissionError}
        autoHideDuration={6000}
        onClose={() => setPermissionError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setPermissionError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {permissionError || t('common.accessDenied')}
        </Alert>
      </Snackbar>
      
      {/* Rate Limit Error Snackbar (429 Too Many Requests - Login Only) */}
      <Snackbar
        open={!!rateLimitError}
        autoHideDuration={8000}
        onClose={() => setRateLimitError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setRateLimitError(null)}
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {rateLimitError || t('common.tooManyLoginAttempts')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;

