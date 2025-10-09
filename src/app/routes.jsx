import { lazy } from 'react';

// Lazy-loaded pages
const Home = lazy(() => import('../pages/HomePage.jsx'));
const Projects = lazy(() => import('../pages/ProjectsPage.jsx'));
const Contact = lazy(() => import('../pages/ContactPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/projects', element: <Projects /> },
  { path: '/contact', element: <Contact /> },
  { path: '*', element: <NotFoundPage /> },
];
