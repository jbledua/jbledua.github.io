import { lazy } from 'react';

// Lazy-loaded pages
const Home = lazy(() => import('../pages/Home.jsx'));
const Projects = lazy(() => import('../pages/Projects.jsx'));
const Contact = lazy(() => import('../pages/Contact.jsx'));

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/projects', element: <Projects /> },
  { path: '/contact', element: <Contact /> },
  { path: '*', element: <div style={{ padding: 24 }}><h2>404 - Not Found</h2></div> },
];
