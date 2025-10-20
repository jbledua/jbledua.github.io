import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
import { GitHub, LinkedIn, Facebook, Twitter, Instagram, Link as LinkIcon, Email, Phone } from '@mui/icons-material';
import { Language as Website } from '@mui/icons-material';
import { listPublicAccounts } from '../services/resumesService.js';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../app/routes.jsx';

function AccountIcons() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const accs = await listPublicAccounts();
        if (mounted) setAccounts(accs.slice(0, 8)); // limit to a reasonable number
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load public accounts for footer:', e?.message || e);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (!accounts || accounts.length === 0) return null;

  return (
    <Stack spacing={1}>
      {accounts.map((a) => {
        const icon = a.icon || '';
        const isUrl = /^https?:\/\//i.test(icon) || /\/storage\//i.test(icon);
        // Build a trimmed display URL (remove protocol and leading www.)
        const displayUrl = (a.url || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '');
        const initials = (a.name || '').split(' ').map((s) => s.charAt(0)).join('').slice(0, 2).toUpperCase();
        // Render a single anchor per row: avatar on the left, URL/text on the right
        return (
          <Tooltip key={a.id} title={a.name || ''}>
            <Link
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: 240 }}
              aria-label={a.name || 'account'}
            >
              {isUrl ? (
                <Avatar src={icon} alt={a.name || ''} sx={{ width: 32, height: 32 }} />
              ) : (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover', color: 'text.primary' }}>
                  {icon ? getIcon(a.name, icon) : initials}
                </Avatar>
              )}
              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{displayUrl}</Box>
            </Link>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

// Try to dynamically load an MUI icon component by name (e.g. 'GitHub').
const ICON_MAP = {
  github: <GitHub fontSize="small" />,
  linkedin: <LinkedIn fontSize="small" />,
  x: <Twitter fontSize="small" />,
  twitter: <Twitter fontSize="small" />,
  facebook: <Facebook fontSize="small" />,
  instagram: <Instagram fontSize="small" />,
  website: <Website fontSize="small" />,
  email: <Email fontSize="small" />,
  phone: <Phone fontSize="small" />,
};

const getIcon = (name, iconStr) => {
  const keyIcon = String(iconStr || '').toLowerCase();
  const keyName = String(name || '').toLowerCase();
  if (ICON_MAP[keyIcon]) return ICON_MAP[keyIcon];
  if (ICON_MAP[keyName]) return ICON_MAP[keyName];

  // Fallback to substring checks for wider matching
  const key = `${keyIcon} ${keyName}`;
  if (key.includes('git')) return <GitHub fontSize="small" />;
  if (key.includes('linkedin')) return <LinkedIn fontSize="small" />;
  if (key.includes('twitter') || key.includes(' x') || key === 'x') return <Twitter fontSize="small" />;
  if (key.includes('facebook')) return <Facebook fontSize="small" />;
  if (key.includes('instagram')) return <Instagram fontSize="small" />;
  if (key.includes('website')) return <Website fontSize="small" />;
  if (key.includes('email')) return <Email fontSize="small" />;
  if (key.includes('phone')) return <Phone fontSize="small" />;
  return <LinkIcon fontSize="small" />;
};

export default function Footer() {
  // Build sitemap links from the routes list, excluding hidden and wildcard routes
  const sitemap = (routes || [])
    .filter((r) => r && r.path && r.path !== '*' && !r.hidden)
    .map((r) => {
      const path = r.path;
      const label = path === '/'
        ? 'Home'
        : path.replace(/^\/+/, '').split('/')[0].split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      return { path, label };
    });

  // Placeholder arrays for Sectors and Services. These can be replaced with real data later.
  const sectors = [];
  const services = [];

  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', color: 'text.secondary' }} elevation={1}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
          {/* Brand / Logo column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>


              {/* Avatar/logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar alt="Josiah Ledua" src="/images/profile.jpg" sx={{ width: 200, height: 200, border: '2px solid', borderColor: 'divider' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Josiah Ledua</Typography>
                   {/* Public account icons */}
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <AccountIcons />
                  </Box>
                </Box>
              </Box>

            </Box>
          </Grid>

          {/* Site Map column */}
          <Grid item xs={6} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Site Map</Typography>
            <Stack component="nav" spacing={0.5} aria-label="Site map links">
              {sitemap.map((item) => (
                <Link
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  underline="hover"
                  variant="body2"
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Divider />

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2">© {new Date().getFullYear()} Josiah Ledua. All rights reserved.</Typography>
          <Box sx={{ flex: 1 }} />
          <Link component={RouterLink} to="/privacy" color="inherit" underline="hover" variant="body2">Privacy Policy</Link>
        </Box>
      </Container>
    </Box>
  );
}
