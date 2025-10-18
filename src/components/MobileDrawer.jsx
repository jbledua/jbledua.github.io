import Drawer from '@mui/material/Drawer';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../app/routes.jsx';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Divider from '@mui/material/Divider';

export default function MobileDrawer({ open, onClose, session, onLogout }) {
    const items = routes
        .filter((r) => r.path && r.path !== '*' && r.hidden !== true)
        .map((r) => {
            const label = r.path === '/'
                ? 'Home'
                : r.path.replace(/^\//, '').split('/')[0].replace(/-/g, ' ');
            const pretty = label.charAt(0).toUpperCase() + label.slice(1);
            const variant = r.path === '/contact' ? 'contained' : 'text';
            return { to: r.path, label: pretty, variant };
        });
    const [accountOpen, setAccountOpen] = useState(false);

    return (
        <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
            sx: (theme) => ({
            width: '100vw',
            maxWidth: '100vw',
            height: '100%',
            bgcolor: theme.palette.background.default,
            }),
        }}
        >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
            jbledua.dev
            </Typography>
            <IconButton onClick={onClose} aria-label="Close menu">
            <CloseIcon />
            </IconButton>
        </Box>
                <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.map((item) => (
                        <Button
                            key={item.to}
                            component={RouterLink}
                            to={item.to}
                            color={item.variant === 'text' ? 'inherit' : 'primary'}
                            variant={item.variant}
                            onClick={onClose}
                            fullWidth
                        >
                            {item.label}
                        </Button>
                    ))}
                    {session && (
                        <>
                            <Divider sx={{ my: 1 }} />
                            <Button
                                onClick={() => setAccountOpen((v) => !v)}
                                endIcon={accountOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                color="inherit"
                                variant="outlined"
                                fullWidth
                            >
                                Account
                            </Button>
                            <Collapse in={accountOpen}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                    <Button disabled variant="text" color="inherit" fullWidth>
                                        {session?.user?.email || 'Signed in'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => { onLogout?.(); }}
                                        fullWidth
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            </Collapse>
                        </>
                    )}
                </Box>
        </Drawer>
    );
}
