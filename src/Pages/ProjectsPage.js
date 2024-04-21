// NotFoundPage.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  const location = useLocation(); // This hook gives us access to the location object

  return (
    <div>
      <h1>404 - Not Found</h1>
      <p>The requested URL {location.pathname} could not be found.</p>
      <Link to="/">Go to Home Page</Link> {/* Link to the home page */}
    </div>
  );
}

export default NotFoundPage;
