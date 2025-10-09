import { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Section from '../components/Section.jsx';

// Default image to use when no banner/screenshot is found in the repo
const DEFAULT_GITHUB_IMAGE = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';

// Configure your selection of public GitHub repos here.
// Tip: add full HTTPS links, e.g. "https://github.com/<owner>/<repo>"
const REPO_LINKS = [
  // TODO: Replace with your repos
  'https://github.com/jbledua/Project-Compose-Mealie',
  'https://github.com/jbledua/Project-Horizon',
  'https://github.com/jbledua/Project-Guidance',
];

function parseRepo(urlString) {
  try {
    const u = new URL(urlString);
    const parts = u.pathname.split('/').filter(Boolean);
    if (u.hostname !== 'github.com' || parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch (e) {
    return null;
  }
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.text();
}

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
    'cover.png', 'cover.jpg', 'cover.jpeg', 'cover.webp', 'logo.png', 'logo.jpg', 'logo.svg'
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
  return DEFAULT_GITHUB_IMAGE;
}

async function loadRepoData(repoUrl) {
  const parsed = parseRepo(repoUrl);
  if (!parsed) {
    return { repoUrl, error: 'Invalid GitHub URL' };
  }
  const { owner, repo } = parsed;
  try {
    // 1) Get repo metadata to discover default branch
    const meta = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
    const branch = meta.default_branch || 'main';
    // 2) Get README download URL via contents API
    let readmeText = '';
    try {
      const readmeMeta = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/readme`);
      if (readmeMeta && readmeMeta.download_url) {
        readmeText = await fetchText(readmeMeta.download_url);
      }
    } catch {
      // Try common fallbacks if /readme endpoint failed
      const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
      try {
        readmeText = await fetchText(`${rawBase}/README.md`);
      } catch {
        try {
          readmeText = await fetchText(`${rawBase}/readme.md`);
        } catch {
          readmeText = '';
        }
      }
    }
    // 3) Try to find an image in common locations
    const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
    const imageUrl = await findImageUrl(rawBase);

    return { repoUrl, owner, repo, branch, readmeText, imageUrl };
  } catch (e) {
    return { repoUrl, owner, repo, error: e?.message || 'Failed to load repo data' };
  }
}

function RepoCard({ data }) {
  const { repoUrl, owner, repo, branch, readmeText, imageUrl, error } = data;
  const title = owner && repo ? `${owner}/${repo}` : repoUrl;
  const rawBase = owner && repo && branch
    ? `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`
    : null;

  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardMedia
        component="img"
        image={imageUrl || DEFAULT_GITHUB_IMAGE}
        alt={`${title} banner`}
        sx={{ height: 160, objectFit: 'cover', bgcolor: 'background.default' }}
        loading="lazy"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap title={title}>{title}</Typography>
        <Divider sx={{ mb: 1 }} />
        {error ? (
          <Typography variant="body2" color="error">{String(error)}</Typography>
        ) : readmeText ? (
          <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              // Unified URL transform for images and links
              urlTransform={(url, key, node) => {
                // Keep anchors intact
                if (typeof url === 'string' && url.startsWith('#')) return url;

                // Absolute URLs: leave as-is but sanitize
                try {
                  // eslint-disable-next-line no-new
                  new URL(url);
                  return defaultUrlTransform(url);
                } catch {
                  // relative URL
                }

                let out = url;
                if (key === 'src' && node?.tagName === 'img' && rawBase) {
                  out = `${rawBase}/${String(url).replace(/^\.\//, '')}`;
                } else if (key === 'href' && owner && repo && branch) {
                  out = `https://github.com/${owner}/${repo}/blob/${branch}/${String(url).replace(/^\.\//, '')}`;
                }
                return defaultUrlTransform(out);
              }}
            >
              {readmeText}
            </ReactMarkdown>
          </Box>
        ) : (
          <>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rectangular" height={160} sx={{ my: 1 }} />
            <Skeleton variant="text" width="60%" />
          </>
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
    <Section>
      <Typography variant="h4" gutterBottom>Projects</Typography>
      <Grid container spacing={2} columns={12}>
        {(loading && !projects.length ? Array.from({ length: 3 }) : projects).map((p, idx) => (
          <Grid key={p?.repoUrl || idx} item xs={4}>
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
