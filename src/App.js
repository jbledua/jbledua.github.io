import React, { useState } from 'react';
import './App.css';
import logo from './logo.svg';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import DrawerComponent from './DrawerComponent';  // Import the new DrawerComponent

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Josiah Ledua
          </Typography>
        </Toolbar>
      </AppBar>
      <DrawerComponent open={drawerOpen} toggleDrawer={toggleDrawer} />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Coming soon...
        </p>
        <a
          className="App-link"
          href="https://www.linkedin.com/in/jbledua/"
          target="_blank"
          rel="noopener noreferrer"
        >
          linkedin.com/in/jbledua
        </a>
      </header>
    </div>
  );
}

export default App;
