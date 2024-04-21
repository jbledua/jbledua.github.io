// ConstructionPage.js
import React from 'react';
import logo from '../../logo.svg';


import Stack from '@mui/material/Stack';

import IconButton from '@mui/material/IconButton';


import MailIcon from '@mui/icons-material/Mail';
import { LinkedIn,GitHub } from '@mui/icons-material';


function ConstructionPage() {
  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>Coming soon...</p>
      <Stack direction="row" spacing={1}>
        <IconButton aria-label="linkedin" color="primary" component="a" href="https://www.linkedin.com/in/jbledua/" target="_blank" rel="noopener noreferrer">
          <LinkedIn />
        </IconButton>
        <IconButton aria-label="github" color="primary" component="a" href="https://github.com/jbledua" target="_blank" rel="noopener noreferrer">
          <GitHub />
        </IconButton>
        <IconButton aria-label="mail" color="primary" component="a" href="mailto:josiah@ledua.ca" target="_blank" rel="noopener noreferrer">
          <MailIcon />
        </IconButton>
      </Stack>
    </header>
  );
}

export default ConstructionPage;
