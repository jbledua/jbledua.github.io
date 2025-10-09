import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../app/routes.jsx';

export default function MobileDrawer({ open, onClose }) {
    const items = routes
        .filter((r) => r.path && r.path !== '*')
        .map((r) => {
            const label = r.path === '/'
                ? 'Home'
                : r.path.replace(/^\//, '').split('/')[0].replace(/-/g, ' ');
            const pretty = label.charAt(0).toUpperCase() + label.slice(1);
            const variant = r.path === '/contact' ? 'contained' : 'text';
            return { to: r.path, label: pretty, variant };
        });

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
                </Box>
        </Drawer>
    );
}
