import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '@mui/material/styles';
import NavBar from '../components/NavBar.jsx';
import Footer from '../components/Footer.jsx';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DrawerProvider, useDrawer } from '../components/DrawerContext.jsx';

function AppContent() {
  const theme = useTheme();
  const { open, content, closeDrawer } = useDrawer();
  // Offset the Drawer so it starts below the NavBar heights (approx: 56 mobile, 64 desktop)
  const APP_BAR_OFFSET = { xs: 56, sm: 64 };
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const drawerWidth = 320;
  const showDocked = isDesktop && open && Boolean(content);
  return (
    <>
      <CssBaseline />
      <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100%' }}>
        {/* Temporary Drawer on mobile/tablet */}
        {!isDesktop && (
          <Drawer
            anchor="left"
            variant="temporary"
            open={open}
            onClose={closeDrawer}
            ModalProps={{ keepMounted: false }}
            slotProps={{
              backdrop: {
                sx: {
                  top: { xs: `${APP_BAR_OFFSET.xs}px`, sm: `${APP_BAR_OFFSET.sm}px` },
                  height: {
                    xs: `calc(100% - ${APP_BAR_OFFSET.xs}px)`,
                    sm: `calc(100% - ${APP_BAR_OFFSET.sm}px)`,
                  },
                },
              },
              paper: {
                sx: {
                  top: { xs: APP_BAR_OFFSET.xs, sm: APP_BAR_OFFSET.sm },
                  height: {
                    xs: `calc(100% - ${APP_BAR_OFFSET.xs}px)`,
                    sm: `calc(100% - ${APP_BAR_OFFSET.sm}px)`,
                  },
                  width: drawerWidth,
                  boxSizing: 'border-box',
                },
              },
            }}
          >
            {content}
          </Drawer>
        )}

        {/* Persistent Drawer on desktop (only if content exists) */}
        {isDesktop && Boolean(content) && open && (
          <Drawer
            anchor="left"
            variant="permanent"
            slotProps={{
              paper: {
                sx: {
                  top: APP_BAR_OFFSET.sm,
                  height: `calc(100% - ${APP_BAR_OFFSET.sm}px)`,
                  width: drawerWidth,
                  boxSizing: 'border-box',
                },
              },
            }}
          >
            {content}
          </Drawer>
        )}

        <NavBar />
  <Box sx={{ ml: { md: showDocked ? `${drawerWidth}px` : 0 } }}>
          <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Suspense fallback={<Box p={4}>Loading…</Box>}>
              <Outlet />
            </Suspense>
          </Container>
          <Footer />
        </Box>
      </Box>
    </>
  );
}

export default function AppShell() {
  return (
    <DrawerProvider>
      <AppContent />
    </DrawerProvider>
  );
}
