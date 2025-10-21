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
import MuiResume from './resumeStyles/MuiResume.jsx';
import PlainResume from './resumeStyles/PlainResume.jsx';
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

  // Determine active resume style; support either an object with { ui } or a raw string.
  const styleRaw = state?.style;
  const styleUi = (styleRaw && typeof styleRaw === 'object' && Object.prototype.hasOwnProperty.call(styleRaw, 'ui'))
    ? styleRaw.ui
    : styleRaw;
  const resumeStyleKey = String(styleUi || 'default').trim().toLowerCase();

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
          case 'plain':
          case 'plain-text':
          case 'plaintext':
          case 'text':
          case 'txt':
            return (
              <PlainResume
                loading={loading}
                state={state}
                session={session}
                PROFILE_IMG={PROFILE_IMG}
                NAME={NAME}
                summaryFormat={summaryFormat}
                printRef={printRef}
                error={error}
                experiencesToShow={experiencesToShow}
                projectsToShow={projectsToShow}
                skillsToShow={skillsToShow}
                educationToShow={educationToShow}
                certificatesToShow={certificatesToShow}
                normalizeLabel={normalizeLabel}
                theme={theme}
              />
            );
          case 'mui':
          case 'default':
          default:
            return (
              <MuiResume
                loading={loading}
                state={state}
                session={session}
                PROFILE_IMG={PROFILE_IMG}
                NAME={NAME}
                summaryFormat={summaryFormat}
                printRef={printRef}
                error={error}
                experiencesToShow={experiencesToShow}
                projectsToShow={projectsToShow}
                skillsToShow={skillsToShow}
                educationToShow={educationToShow}
                certificatesToShow={certificatesToShow}
                interactiveCardSx={interactiveCardSx}
                isSkillEnabled={isSkillEnabled}
                skillLabelToScheme={skillLabelToScheme}
                highlightedSkill={highlightedSkill}
                normalizeLabel={normalizeLabel}
                triggerHighlight={triggerHighlight}
                bounceKeyframes={bounceKeyframes}
                QrWithLogo={QrWithLogo}
                toSlug={toSlug}
                theme={theme}
                getGroupScheme={getGroupScheme}
              />
            );
        }
      })()}
      
    </Section>
  );
}
