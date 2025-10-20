import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link as RouterLink } from 'react-router-dom';

// Hero with two-line typing, then height shrinks from 100vh to 50vh
export default function Hero({ reasonText }) {
    const first = 'Pursue Excellence,';
    const second = 'Not Perfection';

    const [text, setText] = useState('');
    const [phase, setPhase] = useState(0); // 0 typing first, 1 pause, 2 typing second, 3 done
    const [height, setHeight] = useState('100vh');
    // GitHub repo stats
    const [commitCount, setCommitCount] = useState(null);
    const [openIssues, setOpenIssues] = useState(null);

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

    // Fetch GitHub commit and issue counts (unauthenticated; subject to rate limits)
    useEffect(() => {
        let cancelled = false;
        async function fetchRepoStats() {
            try {
                // Get commits count via Link header trick
                const commitsResp = await fetch(
                    'https://api.github.com/repos/jbledua/jbledua.github.io/commits?per_page=1'
                );
                let commitsTotal = 0;
                if (commitsResp.ok) {
                    const link = commitsResp.headers.get('Link');
                    if (link) {
                        const parts = link.split(',').map((s) => s.trim());
                        const last = parts.find((p) => p.includes('rel="last"'));
                        if (last) {
                            const m = last.match(/<([^>]+)>/);
                            if (m && m[1]) {
                                try {
                                    const url = new URL(m[1]);
                                    const page = url.searchParams.get('page');
                                    if (page) commitsTotal = parseInt(page, 10) || 0;
                                } catch (_) {
                                    // ignore URL parse errors
                                }
                            }
                        } else {
                            // No rel=last => only one page; read body length (0 or 1)
                            const arr = await commitsResp.json();
                            commitsTotal = Array.isArray(arr) ? arr.length : 0;
                        }
                    } else {
                        // No Link header (few commits); read body length
                        const arr = await commitsResp.json();
                        commitsTotal = Array.isArray(arr) ? arr.length : 0;
                    }
                }

                // Get open issues count from repo metadata (includes PRs)
                let issuesTotal = null;
                const repoResp = await fetch('https://api.github.com/repos/jbledua/jbledua.github.io');
                if (repoResp.ok) {
                    const repoJson = await repoResp.json();
                    if (typeof repoJson.open_issues_count === 'number') {
                        issuesTotal = repoJson.open_issues_count;
                    }
                }

                if (!cancelled) {
                    setCommitCount(commitsTotal || 0);
                    setOpenIssues(issuesTotal);
                }
            } catch (e) {
                if (!cancelled) {
                    setCommitCount(null);
                    setOpenIssues(null);
                }
            }
        }
        fetchRepoStats();
        return () => {
            cancelled = true;
        };
    }, []);

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
    // Tooltip message for the inline info icon (dynamic based on fetched stats)
    const repoMessage = (() => {
        const commitsText =
            typeof commitCount === 'number'
                ? `${commitCount.toLocaleString()} commit${commitCount === 1 ? '' : 's'}`
                : 'many commits';
        const issuesText =
            typeof openIssues === 'number'
                ? ` and ${openIssues} open issue${openIssues === 1 ? '' : 's'}`
                : '';
        return `The GitHub repo for this site has ${commitsText}${issuesText}, with more still to come! — Click for more info.`;
    })();

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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Box component="span" sx={{ display: 'inline' }}>
                        {reasonText || defaultReason}
                        <Tooltip title={repoMessage} arrow>
                            <IconButton
                                size="small"
                                component={RouterLink}
                                to="/projects#jbledua-github-io"
                                aria-label="Go to projects"
                                sx={{ ml: 0.5 }}
                            >
                                <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Typography>
            </Box>
        </Box>
    );
}
