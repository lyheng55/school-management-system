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

export const createAppTheme = (language = 'en') => {
  const isKhmer = language === 'km';
  
  return createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
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
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontFamily: isKhmer ? khmerFontStack : englishFontStack,
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
    },
  });
};

