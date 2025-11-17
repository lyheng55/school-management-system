import { createTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// Khmer font stack
const khmerFontStack = [
  'Noto Sans Khmer',
  'Khmer Sangam MN',
  'Khmer OS',
  'Leelawadee UI',
  'Leelawadee',
  'Khmer',
  'Moul',
  'sans-serif',
].join(',');

// English font stack
const englishFontStack = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

export const createAppTheme = (language = 'en', mode = 'light') => {
  const isKhmer = language === 'km';
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#90caf9' : '#1976d2',
        light: isDark ? '#e3f2fd' : '#42a5f5',
        dark: isDark ? '#42a5f5' : '#1565c0',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      secondary: {
        main: isDark ? '#f48fb1' : '#dc004e',
        light: isDark ? '#fce4ec' : '#ff5983',
        dark: isDark ? '#c2185b' : '#9a0036',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      error: {
        main: isDark ? '#f44336' : '#d32f2f',
        light: isDark ? '#e57373' : '#ef5350',
        dark: isDark ? '#d32f2f' : '#c62828',
      },
      warning: {
        main: isDark ? '#ffa726' : '#ed6c02',
        light: isDark ? '#ffb74d' : '#ff9800',
        dark: isDark ? '#f57c00' : '#e65100',
      },
      info: {
        main: isDark ? '#29b6f6' : '#0288d1',
        light: isDark ? '#4fc3f7' : '#03a9f4',
        dark: isDark ? '#0288d1' : '#01579b',
      },
      success: {
        main: isDark ? '#66bb6a' : '#2e7d32',
        light: isDark ? '#81c784' : '#4caf50',
        dark: isDark ? '#388e3c' : '#1b5e20',
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      action: {
        active: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.54)',
        hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
    typography: {
      fontFamily: isKhmer ? khmerFontStack : englishFontStack,
      h1: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        fontWeight: isKhmer ? 600 : 400,
        lineHeight: isKhmer ? 1.5 : 1.2,
      },
      h2: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        fontWeight: isKhmer ? 600 : 400,
        lineHeight: isKhmer ? 1.5 : 1.2,
      },
      h3: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        fontWeight: isKhmer ? 600 : 400,
        lineHeight: isKhmer ? 1.5 : 1.2,
      },
      h4: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        fontWeight: isKhmer ? 600 : 400,
        lineHeight: isKhmer ? 1.5 : 1.2,
      },
      h5: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        fontWeight: isKhmer ? 600 : 400,
        lineHeight: isKhmer ? 1.5 : 1.2,
      },
      h6: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        fontWeight: isKhmer ? 600 : 400,
        lineHeight: isKhmer ? 1.5 : 1.2,
      },
      body1: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        lineHeight: isKhmer ? 1.8 : 1.5,
        letterSpacing: isKhmer ? '0.01em' : '0.00938em',
      },
      body2: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        lineHeight: isKhmer ? 1.8 : 1.5,
        letterSpacing: isKhmer ? '0.01em' : '0.01071em',
      },
      button: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        fontWeight: isKhmer ? 500 : 500,
        letterSpacing: isKhmer ? '0.02em' : '0.02857em',
      },
      caption: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        lineHeight: isKhmer ? 1.6 : 1.66,
      },
      overline: {
        fontFamily: isKhmer ? khmerFontStack : englishFontStack,
        lineHeight: isKhmer ? 1.6 : 2.66,
      },
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
            textTransform: 'none',
            fontWeight: isKhmer ? 500 : 500,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
            ...(isDark && {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#90caf9',
              },
            }),
          },
          input: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
            ...(isDark && {
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(144, 202, 249, 0.16)',
                '&:hover': {
                  backgroundColor: 'rgba(144, 202, 249, 0.24)',
                },
              },
            }),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
            ...(isDark && {
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            }),
          },
          head: {
            ...(isDark && {
              color: 'rgba(255, 255, 255, 0.87)',
              fontWeight: 600,
            }),
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
          },
          secondary: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            ...(isDark && {
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
            }),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            ...(isDark && {
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
            }),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            ...(isDark && {
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
            }),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            ...(isDark && {
              backgroundColor: '#1e1e1e',
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
            }),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...(isDark && {
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
            }),
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            ...(isDark && {
              borderColor: 'rgba(255, 255, 255, 0.12)',
            }),
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            ...(isDark && {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#90caf9',
              },
            }),
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            ...(isDark && {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: '#90caf9',
              },
            }),
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            ...(isDark && {
              backgroundColor: 'rgba(18, 18, 18, 0.9)',
            }),
          },
        },
      },
    },
  });
};

