import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext';
import { createAppTheme } from './theme/theme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Parents from './pages/Parents';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Grades from './pages/Grades';
import Behaviors from './pages/Behaviors';
import Achievements from './pages/Achievements';
import Fees from './pages/Fees';
import Payments from './pages/Payments';
import Subjects from './pages/Subjects';
import Timetables from './pages/Timetables';
import StudentDetail from './pages/StudentDetail';
import TeacherDetail from './pages/TeacherDetail';
import ClassDetail from './pages/ClassDetail';
import ExamDetail from './pages/ExamDetail';
import GradeDetail from './pages/GradeDetail';
import FeeDetail from './pages/FeeDetail';
import PaymentDetail from './pages/PaymentDetail';
import Messages from './pages/Messages';
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import Books from './pages/Books';
import Borrows from './pages/Borrows';
import ParentDashboard from './pages/ParentDashboard';
import ParentGrades from './pages/ParentGrades';
import ParentAttendance from './pages/ParentAttendance';
import ParentFees from './pages/ParentFees';
import ParentTimetable from './pages/ParentTimetable';
import RoutesPage from './pages/Routes';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Assets from './pages/Assets';
import Maintenances from './pages/Maintenances';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component to handle theme and language updates
const AppContent = () => {
  const { i18n } = useTranslation();
  const { mode } = useTheme();
  
  // Safely get initial language
  const getInitialLang = () => {
    try {
      return i18n.language || 
             (typeof Storage !== 'undefined' && localStorage ? localStorage.getItem('i18nextLng') : null) || 
             'en';
    } catch (e) {
      return 'en';
    }
  };

  const [theme, setTheme] = useState(() => {
    const lang = getInitialLang();
    return createAppTheme(lang, mode);
  });

  useEffect(() => {
    // Update theme when language or mode changes
    const lang = i18n.language || 'en';
    const newTheme = createAppTheme(lang, mode);
    setTheme(newTheme);

    // Update HTML lang attribute for accessibility and SEO
    try {
      if (document && document.documentElement) {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.lang = lang;
      }
      if (document && document.body) {
        document.body.setAttribute('lang', lang);
        document.body.lang = lang;
      }
    } catch (e) {
      console.warn('Could not update HTML lang attribute:', e);
    }
  }, [i18n.language, mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Redirect parent users to parent dashboard */}
              <Route
                path="/parent"
                element={
                  <ProtectedRoute>
                    <Navigate to="/parent/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students"
                element={
                  <ProtectedRoute>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students/:id"
                element={
                  <ProtectedRoute>
                    <StudentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teachers"
                element={
                  <ProtectedRoute>
                    <Teachers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teachers/:id"
                element={
                  <ProtectedRoute>
                    <TeacherDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parents"
                element={
                  <ProtectedRoute>
                    <Parents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classes"
                element={
                  <ProtectedRoute>
                    <Classes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classes/:id"
                element={
                  <ProtectedRoute>
                    <ClassDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <Attendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams"
                element={
                  <ProtectedRoute>
                    <Exams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams/:id"
                element={
                  <ProtectedRoute>
                    <ExamDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grades"
                element={
                  <ProtectedRoute>
                    <Grades />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grades/:id"
                element={
                  <ProtectedRoute>
                    <GradeDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/behaviors"
                element={
                  <ProtectedRoute>
                    <Behaviors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute>
                    <Achievements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fees"
                element={
                  <ProtectedRoute>
                    <Fees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fees/:id"
                element={
                  <ProtectedRoute>
                    <FeeDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <Payments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments/:id"
                element={
                  <ProtectedRoute>
                    <PaymentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/announcements"
                element={
                  <ProtectedRoute>
                    <Announcements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/books"
                element={
                  <ProtectedRoute>
                    <Books />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/borrows"
                element={
                  <ProtectedRoute>
                    <Borrows />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/dashboard"
                element={
                  <ProtectedRoute>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/grades/:childId?"
                element={
                  <ProtectedRoute>
                    <ParentGrades />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/attendance/:childId?"
                element={
                  <ProtectedRoute>
                    <ParentAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/fees/:childId?"
                element={
                  <ProtectedRoute>
                    <ParentFees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/timetable/:childId?"
                element={
                  <ProtectedRoute>
                    <ParentTimetable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute>
                    <Subjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timetables"
                element={
                  <ProtectedRoute>
                    <Timetables />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/routes"
                element={
                  <ProtectedRoute>
                    <RoutesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute>
                    <Vehicles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/drivers"
                element={
                  <ProtectedRoute>
                    <Drivers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assets"
                element={
                  <ProtectedRoute>
                    <Assets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenances"
                element={
                  <ProtectedRoute>
                    <Maintenances />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AppContent />
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

