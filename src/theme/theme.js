import { createTheme } from '@mui/material/styles';

export default function themeFactory(mode = 'light') {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#90caf9' : '#1976d2' },
      secondary: { main: isDark ? '#ce93d8' : '#9c27b0' },
      background: isDark
        ? { default: '#0b0b0f', paper: '#121212' }
        : { default: '#ffffff', paper: '#ffffff' },
    },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiContainer: {
        defaultProps: { maxWidth: 'lg' },
      },
    },
  });
}
