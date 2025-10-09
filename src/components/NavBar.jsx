import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../theme/ColorModeProvider.jsx';

export default function NavBar() {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link component={RouterLink} to="/" underline="none" color="inherit">
            jbledua.dev
          </Link>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Link component={RouterLink} to="/projects" color="inherit" underline="hover">
            Projects
          </Link>
          <Link component={RouterLink} to="/contact" color="inherit" underline="hover">
            Contact
          </Link>
          <IconButton onClick={toggleColorMode} color="inherit" aria-label="Toggle theme">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
