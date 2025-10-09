import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../theme/ColorModeProvider.jsx';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import MobileDrawer from './MobileDrawer.jsx';

export default function NavBar() {
    const { mode, toggleColorMode } = useColorMode();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const handleOpen = () => setDrawerOpen(true);
    const handleClose = () => setDrawerOpen(false);

    return (
        <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link component={RouterLink} to="/" underline="none" color="inherit">
                Josiah Ledua
            </Link>
            </Typography>
            {/* Desktop nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            <Button component={RouterLink} to="/about" color="inherit" variant="text">
                About
            </Button>
            <Button component={RouterLink} to="/projects" color="inherit" variant="text">
                Projects
            </Button>
            <Button component={RouterLink} to="/resume" color="inherit" variant="text">
                Resume
            </Button>
            <Button component={RouterLink} to="/contact" variant="contained">
                Contact
            </Button>
            <IconButton onClick={toggleColorMode} color="inherit" aria-label="Toggle theme">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            </Box>
            {/* Mobile nav toggle */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <IconButton onClick={toggleColorMode} color="inherit" aria-label="Toggle theme">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <IconButton
                onClick={drawerOpen ? handleClose : handleOpen}
                color="inherit"
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            >
                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            </Box>
        </Toolbar>
                <MobileDrawer open={drawerOpen} onClose={handleClose} />
        </AppBar>
    );
}
