import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '@mui/material/styles';
import NavBar from '../components/NavBar.jsx';
import Footer from '../components/Footer.jsx';

export default function AppShell() {
  const theme = useTheme();
  return (
    <>
      <CssBaseline />
      <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100%' }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Suspense fallback={<Box p={4}>Loading…</Box>}>
            <Outlet />
          </Suspense>
        </Container>
        <Footer />
      </Box>
    </>
  );
}
