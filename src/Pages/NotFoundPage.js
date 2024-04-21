// NotFoundPage.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';

import Button from '@mui/material/Button';


function NotFoundPage() {
  const location = useLocation(); // This hook gives us access to the location object

  return (
    <div className="App-header">
        <CssBaseline />
        <h1>404 - Not Found</h1>
        <p>The requested URL {location.pathname} could not be found.</p>
        <Button
            component={Link}
            to="/" // specify the path where the button should navigate to
            variant="contained"
            >
            Go Home
        </Button>

    </div>
  );
}

export default NotFoundPage;
