import { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  // Menu items based on user role
  const getMenuItems = () => {
    if (user?.role === 'parent') {
      return [
        { text: t('parentDashboard.title'), key: 'parent-dashboard', icon: <DashboardIcon />, path: '/parent/dashboard' },
        { text: t('parentGrades.title'), key: 'parent-grades', icon: <GradeIcon />, path: '/parent/grades' },
        { text: t('parentAttendance.title'), key: 'parent-attendance', icon: <AssignmentIcon />, path: '/parent/attendance' },
        { text: t('parentFees.title'), key: 'parent-fees', icon: <AttachMoneyIcon />, path: '/parent/fees' },
        { text: t('parentTimetable.title'), key: 'parent-timetable', icon: <ScheduleIcon />, path: '/parent/timetable' },
        { text: t('nav.messages'), key: 'messages', icon: <MailIcon />, path: '/messages' },
        { text: t('nav.announcements'), key: 'announcements', icon: <AnnouncementIcon />, path: '/announcements' },
        { text: t('nav.events'), key: 'events', icon: <EventIcon />, path: '/events' },
      ];
    }
    // Admin/Teacher/Staff menu
    return [
      { text: t('nav.dashboard'), key: 'dashboard', icon: <DashboardIcon />, path: '/' },
      { text: t('nav.students'), key: 'students', icon: <PeopleIcon />, path: '/students' },
      { text: t('nav.teachers'), key: 'teachers', icon: <SchoolIcon />, path: '/teachers' },
      { text: t('nav.parents'), key: 'parents', icon: <FamilyRestroomIcon />, path: '/parents' },
      { text: t('nav.classes'), key: 'classes', icon: <ClassIcon />, path: '/classes' },
      { text: t('nav.subjects'), key: 'subjects', icon: <BookIcon />, path: '/subjects' },
      { text: t('nav.timetables'), key: 'timetables', icon: <ScheduleIcon />, path: '/timetables' },
      { text: t('nav.attendance'), key: 'attendance', icon: <AssignmentIcon />, path: '/attendance' },
      { text: t('nav.exams'), key: 'exams', icon: <QuizIcon />, path: '/exams' },
      { text: t('nav.grades'), key: 'grades', icon: <GradeIcon />, path: '/grades' },
      { text: t('nav.behaviors'), key: 'behaviors', icon: <PsychologyIcon />, path: '/behaviors' },
      { text: t('nav.achievements'), key: 'achievements', icon: <EmojiEventsIcon />, path: '/achievements' },
      { text: t('nav.fees'), key: 'fees', icon: <AttachMoneyIcon />, path: '/fees' },
      { text: t('nav.payments'), key: 'payments', icon: <PaymentIcon />, path: '/payments' },
      { text: t('nav.messages'), key: 'messages', icon: <MailIcon />, path: '/messages' },
      { text: t('nav.announcements'), key: 'announcements', icon: <AnnouncementIcon />, path: '/announcements' },
      { text: t('nav.events'), key: 'events', icon: <EventIcon />, path: '/events' },
      { text: t('nav.books'), key: 'books', icon: <LibraryBooksIcon />, path: '/books' },
      { text: t('nav.borrows'), key: 'borrows', icon: <LibraryBooksIcon />, path: '/borrows' },
      { text: t('nav.routes'), key: 'routes', icon: <RouteIcon />, path: '/routes' },
      { text: t('nav.vehicles'), key: 'vehicles', icon: <DirectionsBusIcon />, path: '/vehicles' },
      { text: t('nav.drivers'), key: 'drivers', icon: <PersonIcon />, path: '/drivers' },
      { text: t('nav.assets'), key: 'assets', icon: <InventoryIcon />, path: '/assets' },
      { text: t('nav.maintenances'), key: 'maintenances', icon: <BuildIcon />, path: '/maintenances' },
      { text: t('nav.reports'), key: 'reports', icon: <AssessmentIcon />, path: '/reports' },
    ];
  };

  const menuItems = getMenuItems();

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
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <Select
              value={i18n.language || 'en'}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
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
    </Box>
  );
};

export default Layout;

