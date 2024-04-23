// ConstructionPage.js
import React from 'react';
import './HomePage.css';
import CssBaseline from '@mui/material/CssBaseline';
import profile from '../../img/JosiahLedua-Profile.jpg';
import Paper from '@mui/material/Paper';
import { Grid } from '@mui/material'; // Updated import for the Grid component

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import MailIcon from '@mui/icons-material/Mail';
import { LinkedIn,GitHub } from '@mui/icons-material';

import { Parallax } from 'react-parallax';

function HomePage() {
  return (
    <div>
      <CssBaseline />
      <Paper elevation={3} className="container" style={{background: "lightblue"}}>{/* About Me Section*/}
        <Grid container spacing={3} justifyContent="center" alignItems="top">
          {/* Profile Image Grid; use xs for full width on small screens and md for partial width on larger screens */}
          <Grid item xs={12} md={4}>
            <img src={profile} alt="profile" className="profile"/>
          </Grid>
          {/* About Me Grid */}
          <Grid item xs={12} md={4}>
            <div className="about-me">
              <h1>Josiah Ledua</h1>
              <p>Hello! I'm Josiah Ledua from Thunder Bay, a passionate technologist driven by the philosophy to "Pursue Excellence, Not Perfection." This motto has guided me through my career and life, reminding me that striving for excellence means continuously improving and learning, rather than fearing failure or imperfection. My goal in every project and role is to deliver high-quality work and innovative solutions, knowing that taking risks and making mistakes is part of the journey to success. I am committed to making a positive impact through my work, blending integrity, curiosity, and a dedication to effective communication.</p>
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
            </div>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} className="container" style={{height: '500px'}}> {/* Experience Section */}
        <h1>Experience</h1>
        <p>Coming soon...</p>
      </Paper>
      <Paper elevation={3} className="container"style={{height: '500px'}}> {/* Projects Section */}
        <h1>Projects</h1>
        <p>Coming soon...</p>
      </Paper>

      
    </div>
  );
}

export default HomePage;