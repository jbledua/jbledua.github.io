// ConstructionPage.js
import React from 'react';
import './HomePage.css';

import profile from '../../img/JosiahLedua-Profile.jpg';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';


function HomePage() {
  return (
    <header className="App-header">  
        <Grid container spacing={2}>
            <Grid xs={4}>
                <h1>Josiah Ledua</h1>
                <p>Hello! I'm Josiah Ledua from Thunder Bay, a passionate technologist driven by the philosophy to "Pursue Excellence, Not Perfection." This motto has guided me through my career and life, reminding me that striving for excellence means continuously improving and learning, rather than fearing failure or imperfection. My goal in every project and role is to deliver high-quality work and innovative solutions, knowing that taking risks and making mistakes is part of the journey to success. I am committed to making a positive impact through my work, blending integrity, curiosity, and a dedication to effective communication.</p>
            </Grid>
            <Grid xs={8}>
                <img src={profile} alt="profile" className="profile"/>
            </Grid>
        </Grid>
    </header>
  );
}

export default HomePage;
