import { createTheme } from '@mui/material/styles';

export default function themeFactory(mode = 'light') {
  return createTheme({
    cssVariables: true,
    colorSchemes: {
      light: {
        palette: {
          mode: 'light',
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' },
          background: { default: '#fafafa', paper: '#fff' },
        },
      },
      dark: {
        palette: {
          mode: 'dark',
          primary: { main: '#90caf9' },
          secondary: { main: '#ce93d8' },
          background: { default: '#0b0b0f', paper: '#121212' },
        },
      },
    },
    palette: { mode },
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
