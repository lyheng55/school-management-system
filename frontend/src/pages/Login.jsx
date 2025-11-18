import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { mode, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  // Safely get initial language
  const getInitialLanguage = () => {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        return localStorage.getItem('i18nextLng') || 'en';
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    return 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return getInitialLanguage();
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Initialize and sync language with i18n
  useEffect(() => {
    if (i18n && i18n.language) {
      const lang = i18n.language;
      setCurrentLanguage(lang);
      try {
        if (typeof Storage !== 'undefined' && localStorage) {
          if (localStorage.getItem('i18nextLng') !== lang) {
            localStorage.setItem('i18nextLng', lang);
          }
        }
      } catch (e) {
        console.warn('Could not save language to localStorage:', e);
      }
    }
  }, [i18n]);

  // Update current language when i18n language changes
  useEffect(() => {
    if (i18n && i18n.language) {
      setCurrentLanguage(i18n.language);
    }
  }, [i18n.language]);

  // Check for rate limit errors (429) from sessionStorage on login page
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
    
    // Listen for custom events from API interceptor
    const handleCustomEvent = () => {
      checkRateLimitError();
    };
    
    window.addEventListener('rateLimitError', handleCustomEvent);
    
    // Also check periodically to catch errors set in the same window
    const intervalId = setInterval(checkRateLimitError, 500);
    
    return () => {
      window.removeEventListener('rateLimitError', handleCustomEvent);
      clearInterval(intervalId);
    };
  }, []);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage).then(() => {
      setCurrentLanguage(newLanguage);
      localStorage.setItem('i18nextLng', newLanguage);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRateLimitError('');
    setLoading(true);

    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      // Check if it's a rate limit error
      if (result.isRateLimitError || result.message?.includes('too many') || result.message?.includes('Too many')) {
        setRateLimitError(result.message || t('common.tooManyLoginAttempts'));
      } else {
        setError(result.message || t('auth.loginFailed'));
      }
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
        position: 'relative',
        padding: 2,
      }}
    >
      {/* Background Pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: mode === 'dark' ? 0.05 : 0.1,
              backgroundImage: mode === 'dark'
                ? 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)'
                : 'radial-gradient(circle at 2px 2px, rgba(33,150,243,0.15) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
      
      {/* Top Right Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 1,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={toggleTheme}
          aria-label={mode === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
          sx={{
            bgcolor: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(33, 150, 243, 0.1)',
            color: mode === 'dark' ? 'white' : '#1976d2',
            '&:hover': {
              bgcolor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.25)' 
                : 'rgba(33, 150, 243, 0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <FormControl 
          size="small" 
          sx={{ 
            minWidth: 120,
            bgcolor: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(255, 255, 255, 0.8)',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              color: mode === 'dark' ? 'white' : '#1976d2',
              '& fieldset': {
                borderColor: mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : 'rgba(33, 150, 243, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.5)' 
                  : 'rgba(33, 150, 243, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : '#1976d2',
              },
            },
            '& .MuiSelect-icon': {
              color: mode === 'dark' ? 'white' : '#1976d2',
            },
          }}
        >
          <Select
            value={currentLanguage}
            onChange={handleLanguageChange}
            startAdornment={
              <InputAdornment position="start">
                <LanguageIcon sx={{ 
                  color: mode === 'dark' ? 'white' : '#1976d2', 
                  mr: 1 
                }} />
              </InputAdornment>
            }
          >
            <MenuItem value="en">{t('language.english')}</MenuItem>
            <MenuItem value="km">{t('language.khmer')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            width: '100%',
            borderRadius: 3,
            background: mode === 'dark'
              ? 'rgba(26, 32, 46, 0.95)'
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            border: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(33, 150, 243, 0.1)',
          }}
        >
          {/* Logo/Icon Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                  : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: mode === 'dark'
                  ? '0 8px 16px rgba(33, 150, 243, 0.4)'
                  : '0 8px 16px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              <SchoolIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Typography
              component="h1"
              variant="h4"
              align="center"
              sx={{
                fontWeight: 700,
                color: mode === 'dark' ? '#e3f2fd' : '#1565c0',
                mb: 1,
              }}
            >
              {t('auth.schoolManagementSystem')}
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ 
                mb: 1,
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
              }}
            >
              {t('auth.login')}
            </Typography>
            <Divider sx={{ 
              width: '60%', 
              mt: 2,
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'divider',
            }} />
          </Box>

          {/* Rate Limit Error Alert (429 Too Many Requests) */}
          {rateLimitError && (
            <Alert 
              severity="warning" 
              sx={{ mb: 2 }}
              onClose={() => setRateLimitError('')}
            >
              {rateLimitError || t('common.tooManyLoginAttempts')}
            </Alert>
          )}
          
          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                id="username"
                label={t('auth.username')}
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'action' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    color: mode === 'dark' ? 'white' : 'inherit',
                    '& fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'inherit',
                    },
                    '&:hover fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                    '&.Mui-focused': {
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'primary.main',
                    },
                  },
                }}
              />

              <TextField
                required
                fullWidth
                name="password"
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'action' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    color: mode === 'dark' ? 'white' : 'inherit',
                    '& fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'inherit',
                    },
                    '&:hover fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                    '&.Mui-focused': {
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'primary.main',
                    },
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  href="#"
                  variant="body2"
                  sx={{
                    textDecoration: 'none',
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 1)' : 'primary.dark',
                    },
                  }}
                >
                  {t('common.forgotPassword')}
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  boxShadow: mode === 'dark'
                    ? '0 4px 12px rgba(33, 150, 243, 0.4)'
                    : '0 4px 12px rgba(25, 118, 210, 0.3)',
                  color: 'white',
                  '&:hover': {
                    background: mode === 'dark'
                      ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                      : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    boxShadow: mode === 'dark'
                      ? '0 6px 16px rgba(33, 150, 243, 0.5)'
                      : '0 6px 16px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: mode === 'dark'
                      ? 'rgba(33, 150, 243, 0.5)'
                      : 'rgba(25, 118, 210, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('auth.login')
                )}
              </Button>
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
              }}
            >
              © {new Date().getFullYear()} {t('auth.schoolManagementSystem')}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;

