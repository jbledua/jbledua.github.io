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
import ProjectCard from '../components/ProjectCard.jsx';
import { listProjects } from '../services/projectsService.js';
import { getPublicStorageUrl } from '../services/supabaseClient.js';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import { Link as RouterLink } from 'react-router-dom';

// Default images to use when no repo logo/banner is found (served locally from public/)
// Place your official logo files at:
//   public/images/github-mark-light.png
//   public/images/github-mark-dark.png
const DEFAULT_GITHUB_IMAGE_LIGHT = '/images/github-mark.png';
const DEFAULT_GITHUB_IMAGE_DARK = '/images/github-mark-white.png';

// ProjectCard is now provided by ../components/ProjectCard.jsx

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Optional: if you want to filter by a preset, wire it here (e.g., from route params/search)
  const presetId = null;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const rows = await listProjects({ limit: 50, presetId });
        if (!cancelled) setProjects(rows || []);
      } catch (e) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('Failed to load projects from Supabase:', e);
        }
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [presetId]);

  const projectCards = useMemo(() => {
    return (projects || []).map((p) => {
      const title = p?.title || p?.slug || 'Untitled Project';
      const paragraphs = p?.descriptions?.paragraphs || [];
      const bullets = p?.descriptions?.bullets || [];
      const description = (paragraphs && paragraphs.find((t) => !!t)) || (bullets && bullets.join(' • ')) || '';
      const lightImageUrl = getPublicStorageUrl(p?.project_icon_light?.file_path) || null;
      const darkImageUrl = getPublicStorageUrl(p?.project_icon_dark?.file_path) || null;
      const imageAlt = p?.project_icon_light?.alt || p?.project_icon_dark?.alt || undefined;
      const slug = p?.slug ? String(p.slug) : (p?.title ? String(p.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
      const websitePreferred = !!p?.website_url;
      const linkUrl = p?.website_url || p?.github_url || null;
      const fallbackImageUrl = null; // keeping null; card will fallback to theme default
      const tags = (p?.project_skills || [])
        .slice()
        .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
        .map((ps) => ps?.skills?.name)
        .filter(Boolean);
      return {
        id: p?.id,
        slug,
        title,
        description,
        lightImageUrl,
        darkImageUrl,
        imageAlt,
        linkUrl,
        websitePreferred,
        fallbackImageUrl,
        tags,
      };
    });
  }, [projects]);

  // Auto-scroll to hash on initial load and after data loads; apply temporary highlight
  useEffect(() => {
    const apply = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (!hash) return;
      const id = hash.replace(/^#/, '');
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      // Scroll into view with a slight offset for any fixed headers (AppBar)
      try {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      } catch {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Focus and temporary highlight
      el.classList.add('hash-highlight');
      if (typeof el.focus === 'function') {
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
      // Remove highlight after timeout
      window.setTimeout(() => el.classList.remove('hash-highlight'), 1500);
    };

    // Apply after render to ensure nodes exist
    const t = window.setTimeout(apply, 50);
    return () => window.clearTimeout(t);
  }, [projectCards.length]);

  return (
    <Section sx={{ pt: 0 }}>
      {/* Hash highlight styles */}
      <style>{`
        .hash-highlight {
          box-shadow: 0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}, 0 8px 20px ${alpha(theme.palette.primary.main, 0.18)} !important;
          border-color: ${theme.palette.primary.main} !important;
          border-width: 2px !important;
          outline: none !important;
          animation: cardPulse 500ms ease-out;
        }
        @keyframes cardPulse {
          0% { transform: translateY(-2px) scale(0.995); }
          50% { transform: translateY(-2px) scale(1.01); }
          100% { transform: translateY(-2px) scale(1.0); }
        }
      `}</style>
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
        {(loading && !projectCards.length ? Array.from({ length: 6 }) : projectCards).map((p, idx) => (
          <Grid key={p?.id || idx} size={{ xs: 12, sm: 6, md: 4 }}>
            {p ? (
              <ProjectCard data={p} />
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
