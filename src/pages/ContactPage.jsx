import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import { GitHub, LinkedIn, Facebook, Twitter, Instagram } from '@mui/icons-material';
import { useState } from 'react';
import Section from '../components/Section.jsx';

// TODO: Update these with your actual details.
const NAME = 'Josiah Ledua';
const PROFILE_IMG = '/images/profile.jpg'; // Place your photo at public/images/profile.jpg
// Configure a spam-safe form endpoint (e.g., Formspree/Getform). For Vite, prefer .env: VITE_CONTACT_FORM_ENDPOINT
const FORM_ENDPOINT = import.meta.env.VITE_CONTACT_FORM_ENDPOINT || 'https://formspree.io/f/yourFormId';
// Social links (replace placeholders with your real handles/URLs)
const SOCIAL = {
  github: 'https://github.com/jbledua',
  linkedin: 'https://www.linkedin.com/in/jbledua/',
  facebook: 'https://www.facebook.com/jbledua',
  x: 'https://x.com/jbledua',
  discord: 'https://discordapp.com/users/683827691019173996',
  instagram: 'https://www.instagram.com/your-handle',
};
// Discord icon temporarily disabled until a server invite link is available.
// When ready, place assets under public/images (e.g., Discord-Symbol-Black.svg, Discord-Symbol-White.svg)
// and re-enable the block in the social section below.

export default function Contact() {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const requesterName = form.get('requesterName')?.toString().trim();
    const requesterEmail = form.get('requesterEmail')?.toString().trim();
    const message = form.get('message')?.toString().trim();
    // Basic honeypot field to catch bots
    const company = form.get('company')?.toString().trim();
    const requested = [
      form.get('wantPhone') ? 'Phone number' : null,
      form.get('wantResume') ? 'Resume' : null,
      form.get('wantReferences') ? 'References' : null,
      form.get('wantProjectInfo') ? 'Project info' : null,
    ].filter(Boolean);

    if (!FORM_ENDPOINT || FORM_ENDPOINT.includes('yourFormId')) {
      setStatus('error');
      setErrorMsg('Form endpoint not configured. Please set VITE_CONTACT_FORM_ENDPOINT in a .env file.');
      return;
    }

    if (company) {
      // Likely bot submission; pretend success to avoid clues
      setStatus('success');
      event.currentTarget.reset();
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const payload = {
      requesterName,
      requesterEmail,
      requested,
      message,
      source: 'site-contact',
    };

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Submission failed');
        setStatus('success');
        event.currentTarget.reset();
      })
      .catch((err) => {
        console.error(err);
        setStatus('error');
        setErrorMsg('Something went wrong sending your request. Please try again later or reach out via LinkedIn.');
      });
  };

  return (
    <Section>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
        <Avatar
          alt={NAME}
          src={PROFILE_IMG}
          sx={{ width: 128, height: 128, border: '2px solid', borderColor: 'divider' }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" gutterBottom>{NAME}</Typography>
          <Typography variant="body1" paragraph>
            Fill out the form below or reach out on social media.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Tooltip title="GitHub">
              <IconButton component={Link} href={SOCIAL.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <GitHub />
              </IconButton>
            </Tooltip>
            <Tooltip title="LinkedIn">
              <IconButton component={Link} href={SOCIAL.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Facebook">
              <IconButton component={Link} href={SOCIAL.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook />
              </IconButton>
            </Tooltip>
            <Tooltip title="X (Twitter)">
              <IconButton component={Link} href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="X">
                <Twitter />
              </IconButton>
            </Tooltip>
            {/*
            TODO: Enable Discord icon once a server invite link is available.
            <Tooltip title="Discord">
              <IconButton component={Link} href={SOCIAL.discord} target="_blank" rel="noreferrer" aria-label="Discord">
                <Box component="img" src={isDark ? DISCORD_ICON_DARK : DISCORD_ICON_LIGHT} alt="Discord" sx={{ width: 24, height: 24 }} />
              </IconButton>
            </Tooltip>
            */}
            <Tooltip title="Instagram">
              <IconButton component={Link} href={SOCIAL.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram />
              </IconButton>
            </Tooltip>
            {/* Intentionally no public email icon to prevent scraping */}
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h6" gutterBottom>
          Request more information
        </Typography>

        <Stack spacing={2} sx={{ maxWidth: 680 }}>
          {/* Honeypot field for bots */}
          <TextField name="company" label="Company" sx={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField name="requesterName" label="Your name" fullWidth autoComplete="name" />
            <TextField name="requesterEmail" label="Your email" type="email" required fullWidth autoComplete="email" />
          </Stack>

          <FormGroup>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              Please send me:
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <FormControlLabel control={<Checkbox name="wantPhone" />} label="Phone number" />
              <FormControlLabel control={<Checkbox name="wantResume" />} label="Resume" />
              <FormControlLabel control={<Checkbox name="wantReferences" />} label="References" />
              <FormControlLabel control={<Checkbox name="wantProjectInfo" />} label="Project info" />
            </Stack>
          </FormGroup>

          <TextField name="message" label="Message" multiline minRows={4} fullWidth placeholder="Add any context, timelines, or specifics here." />

          {status === 'success' && (
            <Alert severity="success">Thanks! Your request was sent. I'll get back to you soon.</Alert>
          )}
          {status === 'error' && (
            <Alert severity="error">{errorMsg}</Alert>
          )}

          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending…' : 'Send request'}
            </Button>
            <Button type="reset" variant="text">Reset</Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            This form submits securely to a backend endpoint (no email addresses exposed on the page).
          </Typography>
        </Stack>
      </Box>
    </Section>
  );
}
