import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import AppShell from './app/App.jsx'
import { routes } from './app/routes.jsx'
import { ColorModeProvider } from './theme/ColorModeProvider.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: routes,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeProvider>
      <RouterProvider router={router} />
    </ColorModeProvider>
  </StrictMode>,
)
