import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Hero with two-line typing, then height shrinks from 100vh to 50vh
export default function Hero({ reasonText }) {
    const first = 'Pursue Excellence,';
    const second = 'Not Perfection';

    const [text, setText] = useState('');
    const [phase, setPhase] = useState(0); // 0 typing first, 1 pause, 2 typing second, 3 done
    const [height, setHeight] = useState('100vh');

    useEffect(() => {
        const typeSpeed = 80; // ms per character
        const pauseMs = 900; // pause after first part
        let timer;

        if (phase === 0) {
            if (text.length < first.length) {
                timer = setTimeout(() => {
                    setText(first.slice(0, text.length + 1));
                }, typeSpeed);
            } else {
                setPhase(1);
            }
        } else if (phase === 1) {
            timer = setTimeout(() => setPhase(2), pauseMs);
        } else if (phase === 2) {
            const typedSecond = Math.max(0, text.length - first.length);
            if (typedSecond < second.length) {
                timer = setTimeout(() => {
                    setText(first + second.slice(0, typedSecond + 1));
                }, typeSpeed);
            } else {
                setPhase(3);
            }
        } else if (phase === 3) {
            timer = setTimeout(() => setHeight('50vh'), 300);
        }

        return () => clearTimeout(timer);
    }, [phase, text, first, second]);

    // Derive visible text for each line
    const firstDisplay = text.slice(0, Math.min(text.length, first.length));
    const secondDisplay = text.length > first.length ? text.slice(first.length) : '';

    const Caret = ({ color = 'text.primary' }) => (
        <Box
            component="span"
            sx={{
                display: 'inline-block',
                width: '1px',
                height: '1em',
                bgcolor: color,
                ml: 0.5,
                verticalAlign: '-0.15em',
                animation: phase === 3 ? 'blink 1s step-start infinite' : 'blink 600ms step-start infinite',
                '@keyframes blink': { '50%': { opacity: 0 } },
            }}
        />
    );

    const defaultReason =
        'Excellence comes from consistent, deliberate practice. I build and share to learn in public, iterate quickly, and deliver real value—not to chase perfection.';

    const showReason = phase === 3;

    return (
        <Box
            component="section"
            sx={{
                height,
                transition: 'height 600ms ease',
                display: 'grid',
                placeItems: 'center',
                px: 2,
                textAlign: 'center',
            }}
        >
            <Box sx={{ maxWidth: 1000 }}>
                <Typography
                    component="h1"
                    sx={{
                        fontWeight: 800,
                        letterSpacing: 0.2,
                        fontSize: { xs: '2.2rem', sm: '3rem', md: '4rem' },
                        lineHeight: 1.15,
                        color: 'text.primary',
                    }}
                >
                    {firstDisplay}
                    {phase === 0 && <Caret color="text.primary" />}
                </Typography>

                <Typography
                    component="h1"
                    sx={{
                        fontWeight: 800,
                        letterSpacing: 0.2,
                        fontSize: { xs: '2.2rem', sm: '3rem', md: '4rem' },
                        lineHeight: 1.15,
                        mt: { xs: 0.5, sm: 1 },
                        color: 'primary.main',
                    }}
                >
                    {secondDisplay}
                    {(phase === 2 || phase === 3) && <Caret color="primary.main" />}
                </Typography>

                <Typography
                    variant="body1"
                    component="p"
                    color="text.secondary"
                    sx={{
                        mt: { xs: 2, sm: 2.5 },
                        maxWidth: 800,
                        mx: 'auto',
                        opacity: showReason ? 1 : 0,
                        transform: showReason ? 'translateY(0)' : 'translateY(8px)',
                        transition: 'opacity 500ms ease 150ms, transform 500ms ease 150ms',
                    }}
                >
                    {reasonText || defaultReason}
                </Typography>
            </Box>
        </Box>
    );
}
