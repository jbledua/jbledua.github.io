import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import NavBar from '../components/NavBar.jsx';
import Footer from '../components/Footer.jsx';

export default function AppShell() {
  return (
    <>
      <CssBaseline />
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Suspense fallback={<Box p={4}>Loading…</Box>}>
          <Outlet />
        </Suspense>
      </Container>
      <Footer />
    </>
  );
}
