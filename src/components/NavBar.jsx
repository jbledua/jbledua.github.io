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
import { useEffect, useState } from 'react';
import MobileDrawer from './MobileDrawer.jsx';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Divider from '@mui/material/Divider';
import { getCurrentSession, onAuthStateChange, signOut } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
    const { mode, toggleColorMode } = useColorMode();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [session, setSession] = useState(null);
    const [accountAnchor, setAccountAnchor] = useState(null);
    const navigate = useNavigate();
    const handleOpen = () => setDrawerOpen(true);
    const handleClose = () => setDrawerOpen(false);
    const handleAccountOpen = (e) => setAccountAnchor(e.currentTarget);
    const handleAccountClose = () => setAccountAnchor(null);

    useEffect(() => {
        let unsub = () => {};
        getCurrentSession().then((s) => setSession(s)).catch(() => {}).finally(() => {
            unsub = onAuthStateChange((s) => setSession(s));
        });
        return () => unsub?.();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            handleAccountClose();
            handleClose();
            navigate('/', { replace: true });
        } catch (e) {
            // noop; could show toast/snackbar in future
        }
    };

    return (
        <AppBar position="sticky" color="default" elevation={3}>
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
            {session && (
                <>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <IconButton
                    color="inherit"
                    aria-label="Account menu"
                    onClick={handleAccountOpen}
                    size="large"
                >
                    <AccountCircle />
                </IconButton>
                <Menu
                    anchorEl={accountAnchor}
                    open={Boolean(accountAnchor)}
                    onClose={handleAccountClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem disabled>
                        {session?.user?.email || 'Account'}
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
                </>
            )}
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
                <MobileDrawer open={drawerOpen} onClose={handleClose} session={session} onLogout={handleLogout} />
        </AppBar>
    );
}
