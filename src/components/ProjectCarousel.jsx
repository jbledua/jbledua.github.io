import { useEffect, useRef, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import { useColorMode } from '../theme/ColorModeProvider.jsx';
import ProjectCard from './ProjectCard.jsx';
import { listProjects } from '../services/projectsService.js';
import { getPublicStorageUrl } from '../services/supabaseClient.js';
import Grid from '@mui/material/Grid';

// Lightweight carousel that auto-scrolls horizontally. Pauses on hover/focus.
export default function ProjectCarousel({ speed = 40, visible = 3, cardWidth = 320 }) {
  const { mode } = useColorMode();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const [dupCount, setDupCount] = useState(2);
  const fracRef = useRef(0); // accumulate fractional dx to avoid rounding to 0

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

    // When content is duplicated dupCount times, wrap after one base copy width
    const getWrapPoint = () => (el.scrollWidth && dupCount > 0 ? el.scrollWidth / dupCount : 0);

  let lastTime = performance.now();
  fracRef.current = 0;

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

      // Accumulate fractional movement and apply only whole pixels to avoid rounding to zero
      fracRef.current += dx;
      const intDx = Math.floor(fracRef.current);
      if (intDx === 0) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      fracRef.current -= intDx;

      let next = el.scrollLeft + intDx;
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
  }, [items, speed, dupCount]);

  // Pause on user interaction (pointer press) and focus; don't pause on mere hover
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const onPointerDown = () => { pausedRef.current = true; };
    const onPointerUp = () => { pausedRef.current = false; };
    const onPointerCancel = () => { pausedRef.current = false; };
    const onFocusIn = () => { pausedRef.current = true; };
    const onFocusOut = () => { pausedRef.current = false; };

    el.addEventListener('pointerdown', onPointerDown, { passive: true });
    el.addEventListener('pointerup', onPointerUp, { passive: true });
    el.addEventListener('pointercancel', onPointerCancel, { passive: true });
    el.addEventListener('pointerleave', onPointerUp, { passive: true });
    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerCancel);
      el.removeEventListener('pointerleave', onPointerUp);
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // Compute duplication count to ensure overflow even on wide screens
  useEffect(() => {
    const el = containerRef.current;
    if (!el || items.length === 0) return;

    const computeDup = () => {
      // Base width approximated as scrollWidth / dupCount
      const containerW = el.clientWidth;
      const totalW = el.scrollWidth;
      const currentDup = Math.max(dupCount, 1);
      const baseW = totalW > 0 ? totalW / currentDup : 0;
      if (containerW === 0 || baseW === 0) return; // wait for layout
      // We want at least 2x container width for smooth wrapping
      const needed = Math.max(2, Math.ceil((containerW * 2) / baseW));
      const capped = Math.min(needed, 12); // avoid excessive DOM nodes
      if (capped !== dupCount) setDupCount(capped);
    };

    // Compute after a tick to let layout settle
    const id = requestAnimationFrame(computeDup);

    // Recompute on resize
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => computeDup());
      ro.observe(el);
    } else {
      window.addEventListener('resize', computeDup);
    }
    return () => {
      cancelAnimationFrame(id);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', computeDup);
    };
  }, [items, dupCount]);

  // Duplicate items dupCount times to create an infinite feel
  const displayItems = useMemo(() => {
    if (items.length === 0) return [];
    const arr = [];
    for (let i = 0; i < dupCount; i += 1) arr.push(...items);
    return arr;
  }, [items, dupCount]);

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
          willChange: 'scroll-position',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
        aria-label="Featured projects carousel"
      >
        {loading && displayItems.length === 0 ? (
          Array.from({ length: visible }).map((_, i) => (
            <Box key={`skeleton-${i}`} sx={{ minWidth: cardWidth, width: cardWidth, flex: '0 0 auto' }}>
              <Box sx={{ height: 220, bgcolor: 'background.paper', borderRadius: 1 }} />
            </Box>
          ))
        ) : (
          displayItems.map((p, i) => (
            <Box key={`${p.id || p.slug}-${i}`} sx={{ minWidth: cardWidth, width: cardWidth, flex: '0 0 auto' }}>
              {/* Render ProjectCard by composing the card UI inline to avoid circular imports. */}
              <Grid item>
                <Box sx={{ height: '100%' }}>
                  
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
