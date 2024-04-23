// App.js
import React, { useState } from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import DrawerComponent from './DrawerComponent';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ConstructionPage from './Pages/Constuction/ConstructionPage'; // Import the new ConstructionPage component
import NotFoundPage from './Pages/NotFoundPage'; // Import the new NotFoundPage component
import HomePage from './Pages/Home/HomePage'; // Import the new HomePage component

import useScrollTrigger from '@mui/material/useScrollTrigger';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Paper } from '@mui/material';
import { Padding } from '@mui/icons-material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// In Construction flag
const isInConstruction = true; // You can toggle this to enable/disable construction mode

function ElevationScroll(props) {
  const { children, window } = props;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    style: {
      backgroundColor: trigger ? "rgba(25, 118, 210, 1)" : "rgba(255, 255, 255, 0)", // Adjust the rgba for transparency
      transition: 'background-color 0.3s linear', // Smooth transition for background color
    }
  });
}

function App(props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <ThemeProvider theme={darkTheme}>
    <BrowserRouter>
      <CssBaseline />
      <div className="App">
        <ElevationScroll {...props}>
          <AppBar position="fixed" color='primary'>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={() => toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Josiah Ledua
              </Typography>
            </Toolbar>
          </AppBar>
        </ElevationScroll>
        <Toolbar /> {/* Offset toolbar for content below AppBar */}
        <Paper elevation={0} style={{marginTop: '-64px'}}> {/* Paper component to contain the content subracted the offset for toolbar*/}
          <DrawerComponent open={drawerOpen} toggleDrawer={toggleDrawer} />
          <Routes>
            {isInConstruction ? (
              <Route path="*" element={<ConstructionPage />} />
            ) : (
              <>
                <Route path="/construction" element={<ConstructionPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </>
            )}
          </Routes>
        </Paper>
      </div>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
