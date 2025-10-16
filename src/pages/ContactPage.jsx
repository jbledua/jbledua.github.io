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
import ReCAPTCHA from 'react-google-recaptcha';
import { useRef } from 'react';
import { SOCIAL } from '../utils/social.js';
// Note: Contact page currently uses SOCIAL constants. It can be switched to DB-driven accounts when a resume context is chosen.

// TODO: Update these with your actual details.
const NAME = 'Josiah Ledua';
const PROFILE_IMG = '/images/profile.jpg'; // Place your photo at public/images/profile.jpg
// n8n webhook endpoint and optional shared secret.
// Configure in your .env: VITE_N8N_WEBHOOK_URL and optionally VITE_N8N_WEBHOOK_SECRET
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const N8N_WEBHOOK_SECRET = import.meta.env.VITE_N8N_WEBHOOK_SECRET;
const ASSUME_SUCCESS_ON_OPAQUE = import.meta.env.VITE_ASSUME_SUCCESS_ON_OPAQUE === 'true';
// reCAPTCHA site key. Configure in your .env: VITE_RECAPTCHA_SITE_KEY
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// Detect Vite dev server to bypass reCAPTCHA locally (it doesn't work on localhost with strict keys)
const IS_DEV = import.meta.env.DEV;
// Social links centralized in src/utils/social.js
// Discord icon temporarily disabled until a server invite link is available.
// When ready, place assets under public/images (e.g., Discord-Symbol-Black.svg, Discord-Symbol-White.svg)
// and re-enable the block in the social section below.

export default function Contact() {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const recaptchaRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Capture the form element before any async work (React may pool & nullify the event)
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
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

    if (!N8N_WEBHOOK_URL) {
      setStatus('error');
      setErrorMsg('Contact form is not configured. Please set VITE_N8N_WEBHOOK_URL in a .env file.');
      return;
    }

    if (company) {
      // Likely bot submission; pretend success to avoid clues
      setStatus('success');
      if (formEl && typeof formEl.reset === 'function') formEl.reset();
      return;
    }

    // In production, require a valid reCAPTCHA token when enabled
    if (!IS_DEV && RECAPTCHA_SITE_KEY) {
      if (!captchaToken) {
        setStatus('error');
        setErrorMsg('Please complete the reCAPTCHA challenge before submitting.');
        return;
      }
    }

    setStatus('submitting');
    setErrorMsg('');

    const payload = {
      requesterName,
      requesterEmail,
      requested,
      message,
      source: 'site-contact',
      captchaToken: !IS_DEV && RECAPTCHA_SITE_KEY ? captchaToken : undefined,
      metadata: {
        url: window?.location?.href,
        userAgent: navigator?.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    const headers = { 'Content-Type': 'application/json' };
    if (N8N_WEBHOOK_SECRET) {
      headers['X-Webhook-Secret'] = N8N_WEBHOOK_SECRET;
    }

    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
      .then((res) => {
        // Treat 2xx as success. Optionally, consider opaque responses as success when enabled.
        if (res.ok) {
          setStatus('success');
          if (formEl && typeof formEl.reset === 'function') formEl.reset();
          // reset captcha after successful submission
          if (recaptchaRef.current) {
            try { recaptchaRef.current.reset(); } catch (e) {
              // Best-effort reset; ignore if widget not mounted
              if (import.meta.env.DEV) console.debug('reCAPTCHA reset failed:', e);
            }
          }
          setCaptchaToken('');
          return;
        }
        if (ASSUME_SUCCESS_ON_OPAQUE && (res.type === 'opaque' || res.status === 0)) {
          // Likely CORS-restricted response; request was still sent to the server.
          setStatus('success');
          if (formEl && typeof formEl.reset === 'function') formEl.reset();
          if (recaptchaRef.current) {
            try { recaptchaRef.current.reset(); } catch (e) {
              if (import.meta.env.DEV) console.debug('reCAPTCHA reset failed (opaque):', e);
            }
          }
          setCaptchaToken('');
          return;
        }
        throw new Error(`Submission failed (status: ${res.status})`);
      })
      .catch((err) => {
        console.error(err);
        // If enabled, treat common CORS/network errors as success because the request likely reached the server.
        if (ASSUME_SUCCESS_ON_OPAQUE && (err?.name === 'TypeError' || /Failed to fetch/i.test(err?.message || ''))) {
          setStatus('success');
          if (formEl && typeof formEl.reset === 'function') formEl.reset();
          if (recaptchaRef.current) {
            try { recaptchaRef.current.reset(); } catch (e) {
              if (import.meta.env.DEV) console.debug('reCAPTCHA reset failed (error path):', e);
            }
          }
          setCaptchaToken('');
          return;
        }
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

          {/* reCAPTCHA rendered only when we have a site key and not in local dev */}
          {!IS_DEV && RECAPTCHA_SITE_KEY && (
            <Box>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token || '')}
                onExpired={() => setCaptchaToken('')}
              />
            </Box>
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
