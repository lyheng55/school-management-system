import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Layout from './Layout';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If allowedRoles is specified, check if user has required role
  if (allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect based on user role
      const getDefaultRoute = () => {
        switch (user.role) {
          case 'parent':
            return '/';
          case 'student':
            return '/';
          case 'teacher':
            return '/';
          case 'admin':
            return '/';
          default:
            return '/';
        }
      };

      return (
        <Layout>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
            gap={2}
          >
            <Typography variant="h5" color="error">
              {t('common.accessDenied')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('common.insufficientPermissions')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(getDefaultRoute())}
            >
              {t('common.goToDashboard')}
            </Button>
          </Box>
        </Layout>
      );
    }
  }

  return children;
};

export default ProtectedRoute;

