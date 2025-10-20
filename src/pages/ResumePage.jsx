import { useEffect, useMemo, useRef, useState } from 'react';
import Section from '../components/Section.jsx';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
// Drawer moved to AppShell via global provider
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';
import { Download, Tune } from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import { listResumes, getResume } from '../services/resumesService.js';
import { onAuthStateChange, signInWithMagicLink, getCurrentSession } from '../services/authService.js';
import { listProjects } from '../services/projectsService.js';
import { getPublicStorageUrl } from '../services/supabaseClient.js';
import { useDrawer } from '../components/DrawerContext.jsx';
import QrWithLogo from '../components/QrWithLogo.jsx';
import ResumeBuilderDrawerContent from '../components/ResumeDrawer.jsx';
import Link from '@mui/material/Link';
import { GitHub, LinkedIn, Facebook, Twitter, Instagram, Link as LinkIcon, Email, Phone } from '@mui/icons-material';

import {Language as Website} from '@mui/icons-material';
// Static identity assets (can be moved to DB later if desired)
const PROFILE_IMG = '/images/profile.jpg';
const NAME = 'Josiah Ledua';

export default function ResumePage() {
  // UI state sourced from DB; start empty and show graceful messages
  const [state, setState] = useState({
    options: { includePhoto: true },
    // Resume style payload from DB (e.g., { ui: 'MUI' })
    style: {},
    summaryLines: [], // bullet form
    summaryParagraphs: [], // paragraph form
    experiences: [],
    skills: {},
    education: [],
    certificates: [],
    projects: [],
    accounts: [],
  });
  const [summaryVariant, setSummaryVariant] = useState(0);
  const [summaryVariants, setSummaryVariants] = useState([]); // [{ bulletLines:[], pointLines:[], paragraphs:[] }, ...]
  const [summaryFormat, setSummaryFormat] = useState('bullet'); // 'bullet' | 'paragraph'
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const printRef = useRef(null);
  const { open, openDrawer, closeDrawer, toggleDrawer, setContent } = useDrawer();
  const theme = useTheme();
  const toSlug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Shared interactive Card styles (hover/transition/border). Use overrides per-card for layout needs.
  const interactiveCardSx = (overrides = {}) => (theme) => ({
    borderColor: 'divider',
    transition: theme.transitions.create(
      ['box-shadow', 'transform', 'border-color'],
      { duration: theme.transitions.duration.shorter }
    ),
    '&:hover': {
      boxShadow: 6,
      transform: 'translateY(-2px)',
      borderColor: 'primary.main',
      borderWidth: 2,
    },
    ...overrides,
  });

  // Map each skill group to a stable color scheme from the theme palette
  const paletteSchemes = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
  const hashString = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return Math.abs(h);
  };
  const getGroupScheme = (groupName) => paletteSchemes[hashString(groupName) % paletteSchemes.length];

  // Bounce animation for highlighted chips
  const bounceKeyframes = useMemo(() => keyframes`
    0% { transform: translateY(0); box-shadow: none; }
    25% { transform: translateY(-3px) scale(1.02); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
    50% { transform: translateY(0); }
    75% { transform: translateY(-2px) scale(1.01); }
    100% { transform: translateY(0); box-shadow: none; }
  `, []);

  // Global chip highlight state (by normalized label)
  const [highlightedSkill, setHighlightedSkill] = useState(null);
  const highlightTimeoutRef = useRef(null);
  const normalizeLabel = (s) => String(s || '').toLowerCase();
  const triggerHighlight = (label) => {
    const key = normalizeLabel(label);
    // reset first to restart animation if same label clicked
    setHighlightedSkill(null);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    // slight delay so the animation toggles off -> on
    setTimeout(() => setHighlightedSkill(key), 0);
    highlightTimeoutRef.current = setTimeout(() => setHighlightedSkill(null), 1200);
  };

  // Build a map of skill label -> palette scheme based on its group
  const skillLabelToScheme = useMemo(() => {
    const map = new Map();
    Object.entries(state.skills || {}).forEach(([group, items]) => {
      const scheme = getGroupScheme(group);
      (items || []).forEach((i) => {
        if (!i || !i.label) return;
        map.set(i.label, scheme);
        map.set(String(i.label).toLowerCase(), scheme);
      });
    });
    return map;
  }, [state.skills]);

  const experiencesToShow = useMemo(() => state.experiences.filter((e) => e.enabled), [state.experiences]);
  const educationToShow = useMemo(() => (state.education || []).filter((e) => e.enabled), [state.education]);
  const certificatesToShow = useMemo(() => (state.certificates || []).filter((c) => c.enabled), [state.certificates]);
  const projectsToShow = useMemo(() => (state.projects || []).filter((p) => p.enabled), [state.projects]);

  const skillsToShow = useMemo(() => {
    const res = [];
    Object.entries(state.skills).forEach(([group, items]) => {
      const enabled = items.filter((i) => i.enabled);
      if (enabled.length) res.push({ group, items: enabled });
    });
    return res;
  }, [state.skills]);

  // Helper: check if a skill label is globally enabled in the Skills section
  const isSkillEnabled = useMemo(() => {
    const enabledLabels = new Set();
    Object.values(state.skills || {}).forEach((items) => {
      (items || []).forEach((i) => {
        if (i?.enabled) enabledLabels.add(String(i.label));
      });
    });
    return (label) => enabledLabels.has(String(label));
  }, [state.skills]);

  // No local fallback presets. We only use data from the database.

  // Load resumes and projects from Supabase on mount; show empty/error states on failure or no data
  useEffect(() => {
    let cancelled = false;
    // Initialize auth state
    (async () => {
      try {
        const s = await getCurrentSession();
        if (!cancelled) setSession(s);
      } catch {
        /* ignore */
      }
    })();
    const unsub = onAuthStateChange((s) => { if (!cancelled) setSession(s); });
    (async () => {
      setLoading(true);
      try {
        const [list, projList] = await Promise.all([
          listResumes(),
          listProjects().catch(() => []),
        ]);
        if (cancelled) return;
        setResumes(list || []);
        if (list && list.length) {
          const ui = await getResume(list[0].id);
          if (cancelled) return;
          // Map the fetched preset to the component state shape
          // Derive initial summary lines based on variant and default format
          const variants = ui.summaryVariants || [];
          const initialVariantIdx = Number(ui.summaryVariant ?? 0);
          const hasBullets = (variants[initialVariantIdx]?.bulletLines || []).length > 0;
          const hasParagraphs = (variants[initialVariantIdx]?.paragraphs || []).length > 0;
          const preferredFormat = (hasBullets && hasParagraphs)
            ? 'both'
            : (hasBullets ? 'bullet' : (hasParagraphs ? 'paragraph' : 'bullet'));
          const initialLines = (preferredFormat === 'bullet' || preferredFormat === 'both')
            ? (variants[initialVariantIdx]?.bulletLines || [])
            : [];
          const initialParagraphs = (preferredFormat === 'paragraph' || preferredFormat === 'both')
            ? (variants[initialVariantIdx]?.paragraphs || [])
            : [];

          // Build initial projects list
          const projects = (projList || []).map((p) => ({
            id: p.id,
            label: p.title,
            enabled: true,
            showIcon: true,
            showMedia: true,
            url: p.github_url,
            iconLight: p?.project_icon_light?.file_path ? getPublicStorageUrl(p.project_icon_light.file_path) : null,
            iconDark: p?.project_icon_dark?.file_path ? getPublicStorageUrl(p.project_icon_dark.file_path) : null,
            description: (p.descriptions?.paragraphs?.[0] || ''),
            paragraphs: p.descriptions?.paragraphs || [],
            // Store normalized tag objects (no per-project enabled; global toggle controls visibility)
            tags: (p.project_skills || [])
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((ps) => ps?.skills?.name)
              .filter(Boolean)
              .map((name) => ({ id: toSlug(name), label: name })),
          }));

          // Ensure all skills referenced by experiences and projects start enabled globally
          const referencedLabels = new Set();
          (ui.experiences || []).forEach((e) => {
            const v = (e?.variants || [])[e?.selectedVariant || 0] || e?.variants?.[0];
            (v?.skills || []).forEach((s) => referencedLabels.add(String(s)));
          });
          projects.forEach((p) => (p.tags || []).forEach((t) => referencedLabels.add(String(t.label))));
          const skills = Object.fromEntries(Object.entries(ui.skills || {}).map(([group, items]) => {
            const updated = (items || []).map((i) => ({
              ...i,
              enabled: i.enabled || referencedLabels.has(String(i.label)),
            }));
            return [group, updated];
          }));

          setState({
            options: { includePhoto: !!ui.options?.includePhoto },
            style: ui?.style || {},
            summaryLines: initialLines,
            summaryParagraphs: initialParagraphs,
            experiences: ui.experiences || [],
            skills,
            education: ui.education || [],
            certificates: ui.certificates || [],
            accounts: ui.accounts || [],
            projects,
          });
          setSummaryVariant(initialVariantIdx);
          setSummaryVariants(variants);
          setSummaryFormat(preferredFormat);
        } else {
          // No resumes in DB; keep empty state
          setState((s) => ({
            ...s,
            style: {},
            experiences: [],
            skills: {},
            education: [],
            certificates: [],
            accounts: [],
            projects: (projList || []).map((p) => ({
              id: p.id,
              label: p.title,
              enabled: true,
              showIcon: true,
              showMedia: true,
              url: p.github_url,
              iconLight: p?.project_icon_light?.file_path ? getPublicStorageUrl(p.project_icon_light.file_path) : null,
              iconDark: p?.project_icon_dark?.file_path ? getPublicStorageUrl(p.project_icon_dark.file_path) : null,
              description: (p.descriptions?.paragraphs?.[0] || ''),
              paragraphs: p.descriptions?.paragraphs || [],
              tags: (p.project_skills || [])
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((ps) => ps?.skills?.name)
                .filter(Boolean)
                .map((name) => ({ id: toSlug(name), label: name })),
            })),
          }));
        }
      } catch (e) {
        setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; unsub?.(); };
  }, []);

  const applyResumeFromDb = async (resumeId) => {
    try {
      setLoading(true);
      const ui = await getResume(resumeId);
      const variants = ui.summaryVariants || [];
      const initialVariantIdx = Number(ui.summaryVariant ?? 0);
      const hasBullets = (variants[initialVariantIdx]?.bulletLines || []).length > 0;
      const hasParagraphs = (variants[initialVariantIdx]?.paragraphs || []).length > 0;
      const preferredFormat = (hasBullets && hasParagraphs)
        ? 'both'
        : (hasBullets ? 'bullet' : (hasParagraphs ? 'paragraph' : 'bullet'));
      const initialLines = (preferredFormat === 'bullet' || preferredFormat === 'both')
        ? (variants[initialVariantIdx]?.bulletLines || [])
        : [];
      const initialParagraphs = (preferredFormat === 'paragraph' || preferredFormat === 'both')
        ? (variants[initialVariantIdx]?.paragraphs || [])
        : [];
      setState((prev) => {
        // Compute referenced labels from new experiences and existing projects
        const referencedLabels = new Set();
        (ui.experiences || []).forEach((e) => {
          const v = (e?.variants || [])[e?.selectedVariant || 0] || e?.variants?.[0];
          (v?.skills || []).forEach((s) => referencedLabels.add(String(s)));
        });
        (prev.projects || []).forEach((p) => (p.tags || []).forEach((t) => referencedLabels.add(String(typeof t === 'string' ? t : t.label))));
        const skills = Object.fromEntries(Object.entries(ui.skills || {}).map(([group, items]) => {
          const updated = (items || []).map((i) => ({
            ...i,
            enabled: i.enabled || referencedLabels.has(String(i.label)),
          }));
          return [group, updated];
        }));

        return ({
          options: { includePhoto: !!ui.options?.includePhoto },
          style: ui?.style || {},
          summaryLines: initialLines,
          summaryParagraphs: initialParagraphs,
          experiences: ui.experiences || [],
          skills,
          education: ui.education || [],
          certificates: ui.certificates || [],
          accounts: ui.accounts || [],
          projects: prev.projects || [],
        });
      });
      setSummaryVariant(initialVariantIdx);
      setSummaryVariants(variants);
      setSummaryFormat(preferredFormat);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to apply resume from Supabase:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Use print to save as PDF. Only the preview area is visible during print.
    window.print();
  };

  // Drawer helpers
  const toggleRoleEnabled = (id) => {
    setState((s) => ({
      ...s,
      experiences: s.experiences.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e)),
    }));
  };
  const toggleEducationEnabled = (id) => {
    setState((s) => ({
      ...s,
      education: (s.education || []).map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e)),
    }));
  };
  const toggleCertificateEnabled = (id) => {
    setState((s) => ({
      ...s,
      certificates: (s.certificates || []).map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    }));
  };
  const toggleProjectEnabled = (id) => {
    setState((s) => ({
      ...s,
      projects: (s.projects || []).map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
    }));
  };
  const toggleProjectShowIcon = (id) => {
    setState((s) => ({
      ...s,
      projects: (s.projects || []).map((p) => (p.id === id ? { ...p, showIcon: !p.showIcon } : p)),
    }));
  };
  const toggleProjectShowMedia = (id) => {
    setState((s) => ({
      ...s,
      projects: (s.projects || []).map((p) => (p.id === id ? { ...p, showMedia: !p.showMedia } : p)),
    }));
  };
  const updateRoleVariant = (id, variantIdx) => {
    setState((s) => ({
      ...s,
      experiences: s.experiences.map((e) => (e.id === id ? { ...e, selectedVariant: variantIdx } : e)),
    }));
  };
  const toggleSkill = (group, id) => {
    setState((s) => ({
      ...s,
      skills: {
        ...s.skills,
        [group]: s.skills[group].map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)),
      },
    }));
  };
  const toggleIncludePhoto = () => setState((s) => ({ ...s, options: { ...s.options, includePhoto: !s.options.includePhoto } }));

  const drawerContent = useMemo(() => (
    <ResumeBuilderDrawerContent
      state={state}
      summaryVariant={summaryVariant}
      summaryFormat={summaryFormat}
      summaryVariants={summaryVariants}
      onChangeSummaryVariant={(idx) => {
        setSummaryVariant(idx);
        setState((s) => ({
          ...s,
          summaryLines: (
            summaryFormat === 'bullet' || summaryFormat === 'both'
              ? (summaryVariants[idx]?.bulletLines || [])
              : s.summaryLines
          ),
          summaryParagraphs: (
            summaryFormat === 'paragraph' || summaryFormat === 'both'
              ? (summaryVariants[idx]?.paragraphs || [])
              : s.summaryParagraphs
          ),
        }));
      }}
      onChangeSummaryFormat={(fmt) => {
        setSummaryFormat(fmt);
        setState((s) => ({
          ...s,
          summaryLines: (
            fmt === 'bullet' || fmt === 'both'
              ? (summaryVariants[summaryVariant]?.bulletLines || [])
              : []
          ),
          summaryParagraphs: (
            fmt === 'paragraph' || fmt === 'both'
              ? (summaryVariants[summaryVariant]?.paragraphs || [])
              : []
          ),
        }));
      }}
      toggleIncludePhoto={toggleIncludePhoto}
      toggleRoleEnabled={toggleRoleEnabled}
      updateRoleVariant={updateRoleVariant}
      toggleEducationEnabled={toggleEducationEnabled}
      toggleCertificateEnabled={toggleCertificateEnabled}
      toggleProjectEnabled={toggleProjectEnabled}
      toggleProjectShowIcon={toggleProjectShowIcon}
      toggleProjectShowMedia={toggleProjectShowMedia}
      toggleSkill={toggleSkill}
    />
  ), [state, summaryVariant, summaryFormat, summaryVariants]);

  // Keep global drawer content in sync with local state whenever it changes
  useEffect(() => {
    setContent(drawerContent);
    return () => setContent(null);
  }, [drawerContent, setContent]);

  // Determine active resume style; default if missing/unknown
  const resumeStyleKey = String(state?.style?.ui || 'default').toLowerCase();

  return (
    <Section>
      {/* Print styles to only print the preview card */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          /* Ensure the Paper wrapper doesn't clip the resume during print */
          #resume-paper { position: static !important; overflow: visible !important; box-shadow: none !important; border: none !important; padding: 0 !important; }
          /* Only show the resume print area */
          #resume-print-area, #resume-print-area * { visibility: visible; }
          /* Keep natural flow so content isn't clipped by positioned ancestors */
          #resume-print-area { position: static !important; left: 0 !important; top: 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
          /* Allow Experience list to flow across pages instead of being treated as one flex box */
          #exp-list { display: block !important; }
          #exp-list > * { page-break-inside: avoid; break-inside: avoid-page; margin-bottom: 16px; }
          /* Do not split top-level resume sections across pages */
          #resume-print-area .resume-section { page-break-inside: avoid; break-inside: avoid-page; }
          #resume-print-area .resume-section > * { page-break-inside: avoid; break-inside: avoid-page; }
          /* Grid items should stay intact */
          #resume-print-area .MuiGrid-item { page-break-inside: avoid; break-inside: avoid-page; }
          /* Hide interactive card actions (buttons/links) when printing */
          #resume-print-area .MuiCardActions-root { display: none !important; }
          /* Optional: reduce outer page margins for better fit */
          @page { margin: 12mm; }
        }
      `}</style>

      {/* Top controls */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Customize resume">
            <Button
              variant="outlined"
              onClick={() => toggleDrawer(drawerContent)}
              startIcon={<Tune />}
            />
          </Tooltip>
          
          {resumes && resumes.length > 0 ? (
            resumes.map((r) => (
              <Button key={r.id} variant="contained" disabled={loading} onClick={() => applyResumeFromDb(r.id)}>
                {r.title}
              </Button>
            ))
          ) : null}
          {!loading && resumes.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
              No resumes found.
            </Typography>
          )}
        </Stack>
        <Tooltip title="Download PDF">
          <IconButton color="primary" onClick={handleDownload} aria-label="Download resume">
            <Download />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Canvas grid look like the mock (optional subtle bg) */}


      {(() => {
        // Switch on style to render different layouts; fallback to default (current MUI layout)
        switch (resumeStyleKey) {
          case 'mui':
          case 'default':
          default:
            return (
      <Paper id="resume-paper" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, position: 'relative', overflow: 'hidden' }}>
        <Box id="resume-print-area" ref={printRef} sx={{ maxWidth: 920, mx: 'auto' }}>
          {/* Header: photo + summary */}
          <Box className="resume-section">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'stretch' }, gap: 1, minWidth: { sm: 240 } }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                    <Skeleton variant="circular" width={200} height={200} />
                  </Box>
                ) : (
                  state.options.includePhoto ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                      <Avatar src={PROFILE_IMG} alt={NAME} sx={{ width: 200, height: 200, border: '2px solid', borderColor: 'divider' }} />
                    </Box>
                  ) : (
                    <Box sx={{ height: 16 }} />
                  )
                )}
                {/* Contact section as a Card */}
                <Typography variant="h6" gutterBottom>Contact</Typography>
                  
                <Card variant="outlined" sx={{ width: '100%', mt: 1 }}>
                  <CardContent sx={{ pt: 2 }}> 
                    {(() => {
                      if (loading) {
                        return (
                          <Stack spacing={1}>
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Stack key={i} direction="row" spacing={1} alignItems="center">
                                <Skeleton variant="circular" width={28} height={28} />
                                <Skeleton variant="text" sx={{ flex: 1 }} />
                              </Stack>
                            ))}
                          </Stack>
                        );
                      }
                      const isAuthed = !!session;
                      const formatUrlDisplay = (url) => {
                        try {
                          const u = new URL(url);
                          const host = u.hostname.replace(/^www\./, '');
                          const path = u.pathname.replace(/\/+$/, '');
                          return `${host}${path}` || host;
                        } catch {
                          return String(url)
                            .replace(/^https?:\/\//, '')
                            .replace(/^www\./, '')
                            .replace(/\/+$/, '');
                        }
                      };
                      const formatContactText = (name, url, requiresAuth) => {
                        if (url) {
                          if (/^mailto:/i.test(url)) {
                            const email = url.replace(/^mailto:/i, '');
                            return isAuthed ? email : 'Email available on request';
                          }
                          if (/^tel:/i.test(url)) {
                            const phone = url.replace(/^tel:/i, '');
                            return isAuthed ? phone : 'Phone available on request';
                          }
                          return formatUrlDisplay(url);
                        }
                        if (requiresAuth) {
                          const key = String(name || '').toLowerCase();
                          if (key.includes('email')) return 'Email available on request';
                          if (key.includes('phone')) return 'Phone available on request';
                          return 'Full contact available on request';
                        }
                        return '';
                      };
                      const getIcon = (name, iconStr) => {
                        const key = String(iconStr || name || '').toLowerCase();
                        if (key.includes('git')) return <GitHub fontSize="small" />;
                        if (key.includes('linkedin')) return <LinkedIn fontSize="small" />;
                        if (key.includes('twitter') || key === 'x') return <Twitter fontSize="small" />;
                        if (key.includes('facebook')) return <Facebook fontSize="small" />;
                        if (key.includes('instagram')) return <Instagram fontSize="small" />;
                        if (key.includes('website')) return <Website fontSize="small" />;
                        if (key.includes('email')) return <Email fontSize="small" />;
                        if (key.includes('phone')) return <Phone fontSize="small" />;
                        return <LinkIcon fontSize="small" />;
                      };
                      const getTooltip = (name, url) => {
                        const n = String(name || '').trim();
                        if (n) return n.charAt(0).toUpperCase() + n.slice(1);
                        try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'Profile'; }
                      };
                      const getAriaLabel = (name, url) => {
                        const t = getTooltip(name, url);
                        return `Open ${t}`;
                      };
                      const items = (state.accounts || [])
                        .filter((a) => a && (a.url || a.requiresAuth))
                        .map((a) => ({
                          key: a.id,
                          url: a.url,
                          icon: getIcon(a.name, a.icon),
                          text: formatContactText(a.name, a.url, !!a.requiresAuth),
                          tooltip: getTooltip(a.label || a.name, a.url),
                          ariaLabel: getAriaLabel(a.label || a.name, a.url),
                          requiresAuth: !!a.requiresAuth,
                        }));
                      return (
                        <Stack spacing={1}>
                          {items.map((it) => (
                            <Stack key={it.key} direction="row" spacing={1} alignItems="center">
                              <Tooltip title={it.requiresAuth && !isAuthed ? 'Full contact available on request' : it.tooltip}>
                                <IconButton
                                  component={it.requiresAuth && !isAuthed ? 'button' : (it.url ? Link : 'button')}
                                  href={it.requiresAuth && !isAuthed ? undefined : (it.url || undefined)}
                                  target={it.requiresAuth && !isAuthed ? undefined : (it.url ? "_blank" : undefined)}
                                  rel={it.requiresAuth && !isAuthed ? undefined : (it.url ? "noreferrer" : undefined)}
                                  aria-label={it.ariaLabel}
                                  size="small"
                                >
                                  {it.icon}
                                </IconButton>
                              </Tooltip>
                              {it.requiresAuth && !isAuthed ? (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  {it.text}
                                </Typography>
                              ) : !it.url ? (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  {it.text}
                                </Typography>
                              ) : (
                                <Link href={it.url} target="_blank" rel="noreferrer" underline="hover" color="inherit" variant="body2">
                                  {it.text}
                                </Link>
                              )}
                            </Stack>
                          ))}
                        </Stack>
                      );
                    })()}
                  </CardContent>
                  {!session && (
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        component={RouterLink}
                        to="/contact?topic=request-full-contact"
                      >
                        Request full contact
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom>
                  {loading ? <Skeleton width={240} /> : NAME}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="h6" gutterBottom>Summary</Typography>
                {loading ? (
                  <Stack spacing={1}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </Stack>
                ) : summaryFormat === 'both' ? (
                  (() => {
                    const hasP = Array.isArray(state.summaryParagraphs) && state.summaryParagraphs.length > 0;
                    const hasB = Array.isArray(state.summaryLines) && state.summaryLines.length > 0;
                    if (!hasP && !hasB) {
                      return (<Typography variant="body2" color="text.secondary">No summary provided.</Typography>);
                    }
                    return (
                      <Stack spacing={1}>
                        {hasP && (
                          <Stack spacing={1}>
                            {state.summaryParagraphs.map((p, i) => (
                              <Typography key={i} variant="body1">{p}</Typography>
                            ))}
                          </Stack>
                        )}
                        {hasB && (
                          <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                            {state.summaryLines.map((s, i) => (
                              <li key={i}><Typography variant="body1">{s}</Typography></li>
                            ))}
                          </ul>
                        )}
                      </Stack>
                    );
                  })()
                ) : summaryFormat === 'paragraph' ? (
                  (state.summaryParagraphs && state.summaryParagraphs.length > 0 ? (
                    <Stack spacing={1}>
                      {state.summaryParagraphs.map((p, i) => (
                        <Typography key={i} variant="body1">{p}</Typography>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No summary provided.</Typography>
                  ))
                ) : (
                  state.summaryLines && state.summaryLines.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                      {state.summaryLines.map((s, i) => (
                        <li key={i}><Typography variant="body1">{s}</Typography></li>
                      ))}
                    </ul>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No summary provided.</Typography>
                  )
                )}
              </Box>
            </Stack>
          </Box>

          {!loading && error && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning">Failed to load data from Supabase. Showing empty state.</Alert>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Experience */}
          <Box>
            <Typography variant="h6" gutterBottom>Experience</Typography>
            {loading ? (
              <Stack id="exp-list" spacing={2} sx={{ mb: 3 }}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Skeleton variant="rounded" width={42} height={42} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="20%" />
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 1 }}>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="80%" />
                    </Box>
                  </Card>
                ))}
              </Stack>
            ) : experiencesToShow.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No experience to display.
              </Typography>
            ) : (
              <Stack id="exp-list" spacing={2} sx={{ mb: 3 }}>
                {experiencesToShow.map((e) => {
                  const v = e.variants[e.selectedVariant] || e.variants[0];
                  const meta = [v.period, v.location].filter(Boolean).join(' · ');

                  // Job icon selection: prefer theme-matching variant, then alternate. If none in DB, no avatar.
                  const hasJobIcon = Boolean(e.iconLight || e.iconDark);
                  const jobIconPrimary = (theme?.palette?.mode === 'dark'
                    ? (e.iconDark || e.iconLight)
                    : (e.iconLight || e.iconDark)) || null;
                  const jobIconAlternate = (theme?.palette?.mode === 'dark'
                    ? (e.iconLight || e.iconDark)
                    : (e.iconDark || e.iconLight)) || null;


                  return (
                    <Card key={e.id} variant="outlined" sx={interactiveCardSx()}>
                      <CardHeader
                        avatar={hasJobIcon ? (
                          <Avatar
                            src={jobIconPrimary || undefined}
                            alt={`${v.title} icon`}
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'background.default',
                              border: '1px solid',
                              borderColor: 'divider',
                              p: 0.25,
                            }}
                            variant="rounded"
                            slotProps={{
                              img: {
                                style: { objectFit: 'contain', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.35))' },
                                onError: (ev) => {
                                  try {
                                    const img = ev?.currentTarget;
                                    if (!img) return;
                                    const step = Number(img.dataset.fallbackStep || 0);
                                    const options = [jobIconAlternate];
                                    const next = options[step] || null;
                                    img.dataset.fallbackStep = String(step + 1);
                                    if (next && img.src !== next) {
                                      img.src = next;
                                    }
                                  } catch {}
                                },
                              },
                            }}
                          >
                            {String(v.title || '?').split('·')[0]?.trim()?.charAt(0)?.toUpperCase() || '?'}
                          </Avatar>
                        ) : undefined}
                        title={v.title}
                        subheader={meta}
                        slotProps={{
                          title: { variant: 'subtitle1', sx: { fontWeight: 600 } },
                          subheader: { variant: 'caption', sx: { color: 'text.secondary' } },
                        }}
                      />
                      {(v.summary || (v.bullets?.length > 0) || (Array.isArray(v.skills) && v.skills.length > 0)) && (
                        <CardContent>
                          {v.summary && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>{v.summary}</Typography>
                          )}
                          {v.bullets?.length > 0 && (
                            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: '1.2rem' }}>
                              {v.bullets.map((b, i) => (
                                <li key={i}><Typography variant="body2">{b}</Typography></li>
                              ))}
                            </ul>
                          )}
                          {Array.isArray(v.skills) && v.skills.length > 0 && (
                            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {v.skills.filter((s) => isSkillEnabled(s)).map((s) => {
                                const scheme = skillLabelToScheme.get(s) || skillLabelToScheme.get(String(s).toLowerCase());
                                const isHighlighted = normalizeLabel(s) === highlightedSkill;
                                return (
                                  <Chip
                                    key={s}
                                    label={s}
                                    size="small"
                                    variant={isHighlighted ? 'filled' : 'outlined'}
                                    color={scheme || 'default'}
                                    onClick={() => triggerHighlight(s)}
                                    sx={isHighlighted ? { animation: `${bounceKeyframes} 650ms ease` } : undefined}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Projects */}
          <Box>
            <Typography variant="h6" gutterBottom>Projects</Typography>
            {loading ? (
              <Grid container spacing={2}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 4 }}>
                    <Card variant="outlined" sx={{ p: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                        </Box>
                      </Stack>
                      <Skeleton variant="rounded" height={120} sx={{ mx: 1 }} />
                      <Box sx={{ p: 1 }}>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="70%" />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : projectsToShow.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No projects to display.</Typography>
            ) : (
              <Grid container spacing={2}>
                {projectsToShow.map((p) => (
                  <Grid key={p.id} size={{ xs: 12, sm: 4 }}>
                    

                    <Card
                      variant="outlined"
                      sx={interactiveCardSx({
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        p: 1,
                      })}
                    >
                      <CardHeader
                        avatar={p.showIcon !== false ? (
                          p.url || p.iconLight || p.iconDark ? (
                            <Avatar
                              src={(theme?.palette?.mode === 'dark' ? (p.iconDark || p.iconLight) : (p.iconLight || p.iconDark))
                                || (theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png')}
                              alt={`${p.label} icon`}
                              sx={{ bgcolor: 'transparent' }}
                            />
                          ) : (
                            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                              {p.label ? p.label.charAt(0).toUpperCase() : '?'}
                            </Avatar>
                          )
                        ) : undefined}
                        title={p.label}
                        slotProps={{
                          title: { variant: 'subtitle2' },
                          subheader: { variant: 'caption', sx: { fontSize: '0.7rem' } },
                        }}

                        subheader={p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                            {p.url.replace(/^https?:\/\//, '').replace(/github\.com\//, '')}
                          </a>
                        )}
                      />
                      {p.showMedia !== false && (
                        <CardMedia
                          sx={{ height: 120, bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}
                        >
                          {p.url ? (
                            <QrWithLogo
                              value={p.url}
                              size={150}
                              logoSrc={(theme?.palette?.mode === 'dark' ? (p.iconDark || p.iconLight) : (p.iconLight || p.iconDark))
                                || (theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png')}
                              logoSizeRatio={0.13}
                              withLogo={false}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={(theme?.palette?.mode === 'dark' ? (p.iconDark || p.iconLight) : (p.iconLight || p.iconDark))
                                || (theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png')}
                              alt={`${p.label} logo`}
                              loading="lazy"
                              sx={{ maxHeight: 40, maxWidth: '50%', objectFit: 'contain' }}
                            />
                          )}
                        </CardMedia>
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>                    
                        {p.description || (p.paragraphs && p.paragraphs.length) ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: (p.tags && p.tags.length) ? 1 : 0 }}>
                            {p.description || p.paragraphs[0]}
                          </Typography>
                        ) : null}
                        {(p.tags && p.tags.length > 0) && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(p.tags || [])
                              .map((t) => (typeof t === 'string' ? t : t.label))
                              .filter((t) => isSkillEnabled(t))
                              .map((t) => {
                                const scheme = skillLabelToScheme.get(t) || skillLabelToScheme.get(String(t).toLowerCase());
                                const isHighlighted = normalizeLabel(t) === highlightedSkill;
                                return (
                                  <Chip
                                    key={t}
                                    label={t}
                                    size="small"
                                    variant={isHighlighted ? 'filled' : 'outlined'}
                                    color={scheme || 'default'}
                                    onClick={() => triggerHighlight(t)}
                                    sx={isHighlighted ? { animation: `${bounceKeyframes} 650ms ease` } : undefined}
                                  />
                                );
                              })}
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          component={RouterLink}
                          to={`/projects#${toSlug(p.label)}`}
                        >
                          Learn More
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Skills */}
          <Box className="resume-section">
            <Typography variant="h6" gutterBottom>Skills</Typography>
            {loading ? (
              <Grid container spacing={2}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Skeleton variant="text" width="40%" />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <Skeleton key={j} variant="rounded" width={64} height={28} />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : skillsToShow.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No skills to display.</Typography>
            ) : (
              <Grid container spacing={2}>
                {skillsToShow.map(({ group, items }) => (
                  <Grid key={group} size={{ xs: 12, sm: 6, md: 4 }}>
                    {(() => {
                      const scheme = getGroupScheme(group);
                      const schemeColor = theme.palette?.[scheme]?.main || theme.palette.divider;
                      return (
                    <Box
                      component="fieldset"
                      sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: schemeColor,
                        borderRadius: 1,
                        '& legend': {
                          color: schemeColor,
                          fontWeight: 600,
                          px: 0.75,
                          ml: 1,
                          fontSize: '0.9rem',
                        },
                      }}
                    >
                      <Typography component="legend" variant="subtitle2">{group}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {items.map((i) => {
                          const isHighlighted = normalizeLabel(i.label) === highlightedSkill;
                          return (
                            <Chip
                              key={i.id}
                              label={i.label}
                              size="small"
                              variant={isHighlighted ? 'filled' : 'outlined'}
                              color={scheme}
                              onClick={() => triggerHighlight(i.label)}
                              sx={isHighlighted ? { animation: `${bounceKeyframes} 650ms ease` } : undefined}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                      );
                    })()}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Education */}
          {educationToShow.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box className="resume-section">
                <Typography variant="h6" gutterBottom>Education</Typography>
                {loading ? (
                  <Grid container spacing={2}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Grid key={i} size={{ xs: 12, sm: 6 }}>
                        <Box>
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                          <Skeleton variant="text" width="90%" />
                          <Skeleton variant="text" width="75%" />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    {educationToShow.map((e) => (
                      <Grid key={e.id} size={{ xs: 12, sm: 6 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{e.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {[e.degree, e.field].filter(Boolean).join(', ')}{(e.degree || e.field) && (e.period ? ' · ' : '')}{e.period}
                          </Typography>
                          {e.summary && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>{e.summary}</Typography>
                          )}
                          {e.bullets?.length > 0 && (
                            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: '1.2rem' }}>
                              {e.bullets.map((b, i) => (
                                <li key={i}><Typography variant="body2">{b}</Typography></li>
                              ))}
                            </ul>
                          )}
                          {Array.isArray(e.skills) && e.skills.length > 0 && (
                            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {e.skills.filter((s) => isSkillEnabled(s)).map((s) => {
                                const scheme = skillLabelToScheme.get(s) || skillLabelToScheme.get(String(s).toLowerCase());
                                const isHighlighted = normalizeLabel(s) === highlightedSkill;
                                return (
                                  <Chip
                                    key={s}
                                    label={s}
                                    size="small"
                                    variant={isHighlighted ? 'filled' : 'outlined'}
                                    color={scheme || 'default'}
                                    onClick={() => triggerHighlight(s)}
                                    sx={isHighlighted ? { animation: `${bounceKeyframes} 650ms ease` } : undefined}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </>
          )}

          {/* Certificates */}
          {certificatesToShow.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box className="resume-section">
                <Typography variant="h6" gutterBottom>Certificates</Typography>
                  {loading ? (
                    <Grid container spacing={2}>
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="30%" />
                            <Skeleton variant="text" width="50%" />
                            <Skeleton variant="text" width="80%" />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Grid container spacing={2}>
                      {certificatesToShow.map((c) => (
                        <Grid key={c.id} size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{c.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {[c.issuer, c.period].filter(Boolean).join(' · ')}
                            </Typography>
                            {c.credentialUrl && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                <a href={c.credentialUrl} target="_blank" rel="noreferrer">View Credential</a>
                              </Typography>
                            )}
                            {c.summary && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>{c.summary}</Typography>
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
              </Box>
            </>
          )}
        </Box>
      </Paper>
            );
        }
      })()}
      
    </Section>
  );
}
