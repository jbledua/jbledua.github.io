import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import { signInWithMagicLink, onAuthStateChange, getCurrentSession } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let unsub = () => {};
        // If already logged in, redirect to home
        getCurrentSession()
        .then((session) => {
            if (session) navigate('/', { replace: true });
        })
        .catch(() => {})
        .finally(() => {
            // Keep listening for auth changes and redirect on login
            unsub = onAuthStateChange((session) => {
            if (session) navigate('/', { replace: true });
            });
        });
        return () => unsub?.();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
        await signInWithMagicLink(email.trim());
        setMessage('Magic link sent! Check your email to log in.');
        } catch (err) {
        setError(err?.message || 'Failed to send magic link');
        } finally {
        setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
            Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
            Use your admin email to receive a sign-in link.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoFocus
            />
            <Button type="submit" variant="contained" disabled={loading || !email}>
                {loading ? 'Sending…' : 'Send magic link'}
            </Button>
            </Box>
        </Paper>
        </Container>
    );
}
