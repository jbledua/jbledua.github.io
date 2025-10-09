import { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import { useTheme, alpha } from '@mui/material/styles';
import Section from '../components/Section.jsx';

// Default images to use when no repo logo/banner is found (served locally from public/)
// Place your official logo files at:
//   public/images/github-mark-light.png
//   public/images/github-mark-dark.png
const DEFAULT_GITHUB_IMAGE_LIGHT = '/images/github-mark.png';
const DEFAULT_GITHUB_IMAGE_DARK = '/images/github-mark-white.png';

// Configure your selection of public GitHub repos here.
// You can pass either a string URL or an object with options:
//   - string: 'https://github.com/<owner>/<repo>'
//   - object: { url: 'https://github.com/<owner>/<repo>', skipLogo: true }
//     set skipLogo to true to avoid any logo discovery requests for that repo.
const REPO_LINKS = [
  // TODO: Replace with your repos
  'https://github.com/jbledua/Project-Compose-Pantry',
  { url: 'https://github.com/jbledua/Project-Compose-Workflow', skipLogo: true },
  { url: 'https://github.com/jbledua/Project-Compose-Bifrost', skipLogo: true },
  'https://github.com/jbledua/Project-Horizon',
  { url: 'https://github.com/jbledua/Ciphertext', skipLogo: true },
  { url: 'https://github.com/jbledua/Project-Guidance', skipLogo: true }
];

function parseRepo(urlString) {
  try {
    const u = new URL(urlString);
    const parts = u.pathname.split('/').filter(Boolean);
    if (u.hostname !== 'github.com' || parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch (e) {
      if (import.meta.env.DEV) console.debug('Failed to parse repo URL:', e);
    return null;
  }
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// fetchText removed (was used for README rendering)

async function tryFetchOk(url) {
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

async function findImageUrl(rawBaseUrl) {
  const candidates = [
    'banner.png', 'banner.jpg', 'banner.jpeg', 'banner.webp', 'banner.svg',
    'images/banner.png', 'images/banner.jpg', 'images/banner.jpeg', 'images/banner.webp', 'images/banner.svg',
    'screenshot.png', 'screenshot.jpg', 'screenshot.jpeg', 'screenshot.webp',
    'cover.png', 'cover.jpg', 'cover.jpeg', 'cover.webp', 'logo.png', 'logo.jpg', 'logo.svg', 'Logo.png', 'Logo.jpg', 'Logo.svg'
  ];
  for (const c of candidates) {
    const url = `${rawBaseUrl}/${c}`;
    // If request succeeds, use it.
    // Some CORS setups may block HEAD, so use GET and rely on .ok
    // This only checks status, the image will be lazy-loaded by <img/>
    // when actually rendered by the browser.
    // eslint-disable-next-line no-await-in-loop
    const ok = await tryFetchOk(url);
    if (ok) return url;
  }
  return null;
}

// Try to find light/dark logo pair (e.g., Logo-Light.png & Logo-Dark.png)
async function findLogoPairUrls(rawBaseUrl) {
  const lightBases = ['Logo-Light', 'logo-light', 'logo_light', 'logoLight'];
  const darkBases = ['Logo-Dark', 'logo-dark', 'logo_dark', 'logoDark'];
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
  let lightUrl = null;
  let darkUrl = null;

  // search for light first
  for (const base of lightBases) {
    for (const ext of exts) {
      // eslint-disable-next-line no-await-in-loop
      const url = `${rawBaseUrl}/${base}.${ext}`;
      // eslint-disable-next-line no-await-in-loop
      if (await tryFetchOk(url)) { lightUrl = url; break; }
      // also check images/ subfolder
      // eslint-disable-next-line no-await-in-loop
      const url2 = `${rawBaseUrl}/images/${base}.${ext}`;
      // eslint-disable-next-line no-await-in-loop
      if (!lightUrl && (await tryFetchOk(url2))) { lightUrl = url2; break; }
    }
    if (lightUrl) break;
  }

  // search for dark
  for (const base of darkBases) {
    for (const ext of exts) {
      // eslint-disable-next-line no-await-in-loop
      const url = `${rawBaseUrl}/${base}.${ext}`;
      // eslint-disable-next-line no-await-in-loop
      if (await tryFetchOk(url)) { darkUrl = url; break; }
      // also check images/ subfolder
      // eslint-disable-next-line no-await-in-loop
      const url2 = `${rawBaseUrl}/images/${base}.${ext}`;
      // eslint-disable-next-line no-await-in-loop
      if (!darkUrl && (await tryFetchOk(url2))) { darkUrl = url2; break; }
    }
    if (darkUrl) break;
  }

  return { lightUrl, darkUrl };
}

async function loadRepoData(repoEntry) {
  const repoUrl = typeof repoEntry === 'string' ? repoEntry : repoEntry?.url;
  const skipLogo = typeof repoEntry === 'object' && !!repoEntry?.skipLogo;
  const parsed = parseRepo(repoUrl);
  if (!parsed) {
    return { repoUrl: String(repoUrl || repoEntry), error: 'Invalid GitHub URL' };
  }
  const { owner, repo } = parsed;
  try {
    // 1) Get repo metadata (for branch, name, description)
    const meta = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
    const branch = meta.default_branch || 'main';
    const repoName = meta.name || repo;
    const repoDescription = meta.description || '';

    // 2) Try to find a light/dark logo pair, otherwise a single image in common locations
    let lightImageUrl = null;
    let darkImageUrl = null;
    let imageUrl = null;
    if (!skipLogo) {
      const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
      const pair = await findLogoPairUrls(rawBase);
      lightImageUrl = pair.lightUrl;
      darkImageUrl = pair.darkUrl;
      imageUrl = lightImageUrl && darkImageUrl ? null : await findImageUrl(rawBase);
    }

    return { repoUrl, owner, repo, branch, repoName, repoDescription, imageUrl, lightImageUrl, darkImageUrl };
  } catch (e) {
    return { repoUrl, owner, repo, error: e?.message || 'Failed to load repo data' };
  }
}

function RepoCard({ data }) {
  const theme = useTheme();
  const { repoUrl, owner, repo, branch, repoName, repoDescription, imageUrl, lightImageUrl, darkImageUrl, error } = data;
  
  // Add Branch to title if not default "main" or "master"
  // (optional, uncomment if desired)
  const title = repoName || (owner && repo ? `${owner}/${repo}` : repoUrl) + (branch && !['main', 'master'].includes(branch) ? ` (${branch})` : '');
  
  // Simpler title without branch
  //const title = repoName || (owner && repo ? `${owner}/${repo}` : repoUrl);
  const chosenImage = (theme?.palette?.mode === 'dark' ? darkImageUrl : lightImageUrl)
    || imageUrl
    || (theme?.palette?.mode === 'dark' ? DEFAULT_GITHUB_IMAGE_DARK : DEFAULT_GITHUB_IMAGE_LIGHT);

  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top centered small logo */}
      <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Box
          component="img"
          src={chosenImage}
          alt={`${title} logo`}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            // swap to local theme default if chosenImage fails
            const fallback = (theme?.palette?.mode === 'dark' ? DEFAULT_GITHUB_IMAGE_DARK : DEFAULT_GITHUB_IMAGE_LIGHT);
            if (img.src !== window.location.origin + fallback && !img.dataset.fallbackApplied) {
              img.dataset.fallbackApplied = 'true';
              img.src = fallback;
            }
          }}
          sx={{ maxHeight: 48, maxWidth: '56%', objectFit: 'contain', filter: 'none' }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap title={title}>{title}</Typography>
        <Divider sx={{ mb: 1 }} />
        {error ? (
          <Typography variant="body2" color="error">{String(error)}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {repoDescription || 'No description provided.'}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" href={repoUrl} target="_blank" rel="noopener noreferrer">
          View on GitHub
        </Button>
      </CardActions>
    </Card>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const repos = useMemo(() => REPO_LINKS.filter(Boolean), []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
  const results = await Promise.all(repos.map((r) => loadRepoData(r)));
        if (!cancelled) setProjects(results);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (repos.length) run();
    return () => { cancelled = true; };
  }, [repos]);

  return (
    <Section sx={{ pt: 0 }}>
      {/* Top header with subtle animated glow using primary.main */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          pt: { xs: 6, sm: 8 },
          pb: { xs: 4, sm: 6 },
          mb: 2,
          '::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            top: -24, // extend above to avoid blur cropping gap under AppBar
            height: { xs: 164, sm: 204 },
            background: `radial-gradient(120% 70% at 50% -10%, ${alpha(theme.palette.primary.main, 0.35)} 0%, ${alpha(theme.palette.primary.main, 0.12)} 35%, transparent 65%)`,
            filter: 'blur(8px)',
            pointerEvents: 'none',
            animation: 'projectsGlow 6s ease-in-out infinite',
          },
          '@keyframes projectsGlow': {
            '0%, 100%': { opacity: 0.65 },
            '50%': { opacity: 0.95 },
          },
        }}
      >
        <Typography variant="h4" gutterBottom>Recent Projects</Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ maxWidth: 900, mx: 'auto', px: 2 }}
        >
          Discover selected projects, tools, and experiments I’ve built. Quick snapshots below with links to dive into the code.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {(loading && !projects.length ? Array.from({ length: 6 }) : projects).map((p, idx) => (
          <Grid key={p?.repoUrl || idx} size={4}>
            {p ? (
              <RepoCard data={p} />
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="rectangular" height={120} sx={{ my: 1 }} />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}
