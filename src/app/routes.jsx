import { lazy } from 'react';

// Lazy-loaded pages
const Home = lazy(() => import('../pages/HomePage.jsx'));
const Projects = lazy(() => import('../pages/ProjectsPage.jsx'));
const Contact = lazy(() => import('../pages/ContactPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));
const About = lazy(() => import('../pages/AboutPage.jsx'));
const ResumeBuilder = lazy(() => import('../pages/ResumePage.jsx'));
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/projects', element: <Projects /> },
  { path: '/resume', element: <ResumeBuilder /> },
  { path: '/contact', element: <Contact /> },
  // Admin login (not shown in nav)
  { path: '/login', element: <LoginPage />, hidden: true },
  { path: '*', element: <NotFoundPage /> },
];
