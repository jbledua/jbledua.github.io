import { useEffect, useRef, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import { useColorMode } from '../theme/ColorModeProvider.jsx';
import ProjectCard from './ProjectCard.jsx';
import { listProjects } from '../services/projectsService.js';
import { getPublicStorageUrl } from '../services/supabaseClient.js';
import Grid from '@mui/material/Grid';

// Lightweight carousel that auto-scrolls horizontally. Pauses on hover/focus.
export default function ProjectCarousel({ speed = 18, visible = 3 }) {
  const { mode } = useColorMode();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const rows = await listProjects({ limit: 50 });
        if (!cancelled) setProjects(rows || []);
      } catch (e) {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  // Convert raw project objects into ProjectCard-friendly objects (same shape used in ProjectsPage)
  const items = useMemo(() => (projects || []).map((p) => {
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
    const fallbackImageUrl = null;
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
  }), [projects]);

  // Auto-scroll implementation
  useEffect(() => {
    const el = containerRef.current;
    if (!el || items.length === 0) return;

    // We'll use the duplicated content; wrap when we pass half of scrollWidth
    const getWrapPoint = () => (el.scrollWidth ? el.scrollWidth / 2 : 0);

    let lastTime = performance.now();

    const step = (now) => {
      if (pausedRef.current) {
        lastTime = now;
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      const dt = now - lastTime;
      lastTime = now;
      const dx = (speed * dt) / 1000;

      const wrapPoint = getWrapPoint();
      if (!wrapPoint) {
        // Not ready yet (layout may still be settling); try again next frame
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      let next = el.scrollLeft + dx;
      if (next >= wrapPoint) {
        // Subtract wrapPoint to keep position within the first copy
        next -= wrapPoint;
      }
      el.scrollLeft = next;
      rafRef.current = requestAnimationFrame(step);
    };

    // Disable smooth scrolling so immediate pixel updates are visible
    const prevScrollBehavior = el.style.scrollBehavior;
    el.style.scrollBehavior = 'auto';

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      el.style.scrollBehavior = prevScrollBehavior || '';
    };
  }, [items, speed]);

  // Pause on hover/focus
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const onEnter = () => { pausedRef.current = true; };
    const onLeave = () => { pausedRef.current = false; };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('focusin', onEnter);
    el.addEventListener('focusout', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('focusin', onEnter);
      el.removeEventListener('focusout', onLeave);
    };
  }, []);

  // Duplicate items to create an infinite feel if there are enough
  const displayItems = items.length > 0 ? [...items, ...items] : [];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <Box
        ref={containerRef}
        tabIndex={0}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          py: 1,
          px: 1,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
        aria-label="Featured projects carousel"
      >
        {loading && displayItems.length === 0 ? (
          Array.from({ length: visible }).map((_, i) => (
            <Box key={`skeleton-${i}`} sx={{ minWidth: 320, flex: '0 0 auto' }}>
              <Box sx={{ height: 220, bgcolor: 'background.paper', borderRadius: 1 }} />
            </Box>
          ))
        ) : (
          displayItems.map((p, i) => (
            <Box key={`${p.id || p.slug}-${i}`} sx={{ minWidth: 320, flex: '0 0 auto' }}>
              {/* Render ProjectCard by composing the card UI inline to avoid circular imports. */}
              <Grid item>
                <Box sx={{ height: '100%' }}>
                  {/* Reuse the card markup by delegating to the ProjectsPage's ProjectCard component if exported; otherwise simple placeholder */}
                  {/* Attempt to render ProjectCard component from ProjectsPage.jsx; if it's not a default export of an individual component, fallback to a simple box. */}
                  {typeof ProjectCard === 'function' ? <ProjectCard data={p} mode={mode} /> : (
                    <Box sx={{ bgcolor: 'background.paper', height: 220, borderRadius: 1 }} />
                  )}
                </Box>
              </Grid>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
