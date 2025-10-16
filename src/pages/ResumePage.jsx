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
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';
import { Download, Tune } from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import { listResumes, getResume } from '../services/resumesService.js';
import { listProjects } from '../services/projectsService.js';
import { useDrawer } from '../components/DrawerContext.jsx';
import QrWithLogo from '../components/QrWithLogo.jsx';
import ResumeBuilderDrawerContent from '../components/ResumeDrawer.jsx';

// Static identity assets (can be moved to DB later if desired)
const PROFILE_IMG = '/images/profile.jpg';
const NAME = 'Josiah Ledua';

export default function ResumePage() {
  // UI state sourced from DB; start empty and show graceful messages
  const [state, setState] = useState({
    options: { includePhoto: true },
    summaryLines: [], // bullet form
    summaryParagraphs: [], // paragraph form
    experiences: [],
    skills: {},
    education: [],
    certificates: [],
    projects: [],
  });
  const [summaryVariant, setSummaryVariant] = useState(0);
  const [summaryVariants, setSummaryVariants] = useState([]); // [{ bulletLines:[], pointLines:[], paragraphs:[] }, ...]
  const [summaryFormat, setSummaryFormat] = useState('bullet'); // 'bullet' | 'paragraph'
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const printRef = useRef(null);
  const { open, openDrawer, closeDrawer, toggleDrawer, setContent } = useDrawer();
  const theme = useTheme();
  const toSlug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

  // No local fallback presets. We only use data from the database.

  // Load resumes and projects from Supabase on mount; show empty/error states on failure or no data
  useEffect(() => {
    let cancelled = false;
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
          const preferredFormat = hasBullets ? 'bullet' : (hasParagraphs ? 'paragraph' : 'bullet');
          const initialLines = preferredFormat === 'bullet' ? (variants[initialVariantIdx]?.bulletLines || []) : [];
          const initialParagraphs = preferredFormat === 'paragraph' ? (variants[initialVariantIdx]?.paragraphs || []) : [];

          setState({
            options: { includePhoto: !!ui.options?.includePhoto },
            summaryLines: initialLines,
            summaryParagraphs: initialParagraphs,
            experiences: ui.experiences || [],
            skills: ui.skills || {},
            education: ui.education || [],
            certificates: ui.certificates || [],
            projects: (projList || []).map((p) => ({
              id: p.id,
              label: p.title,
              enabled: true,
              showIcon: true,
              showMedia: true,
              url: p.github_url,
              description: (p.descriptions?.paragraphs?.[0] || ''),
              paragraphs: p.descriptions?.paragraphs || [],
              // Convert tags to toggleable objects
              tags: (p.project_skills || [])
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((ps) => ps?.skills?.name)
                .filter(Boolean)
                .map((name) => ({ id: toSlug(name), label: name, enabled: true })),
            })),
          });
          setSummaryVariant(initialVariantIdx);
          setSummaryVariants(variants);
          setSummaryFormat(preferredFormat);
        } else {
          // No resumes in DB; keep empty state
          setState((s) => ({
            ...s,
            experiences: [],
            skills: {},
            education: [],
            certificates: [],
            projects: (projList || []).map((p) => ({
              id: p.id,
              label: p.title,
              enabled: true,
              showIcon: true,
              showMedia: true,
              url: p.github_url,
              description: (p.descriptions?.paragraphs?.[0] || ''),
              paragraphs: p.descriptions?.paragraphs || [],
              tags: (p.project_skills || [])
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((ps) => ps?.skills?.name)
                .filter(Boolean)
                .map((name) => ({ id: toSlug(name), label: name, enabled: true })),
            })),
          }));
        }
      } catch (e) {
        setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const applyResumeFromDb = async (resumeId) => {
    try {
      setLoading(true);
      const ui = await getResume(resumeId);
      const variants = ui.summaryVariants || [];
      const initialVariantIdx = Number(ui.summaryVariant ?? 0);
      const hasBullets = (variants[initialVariantIdx]?.bulletLines || []).length > 0;
      const hasParagraphs = (variants[initialVariantIdx]?.paragraphs || []).length > 0;
      const preferredFormat = hasBullets ? 'bullet' : (hasParagraphs ? 'paragraph' : 'bullet');
      const initialLines = preferredFormat === 'bullet' ? (variants[initialVariantIdx]?.bulletLines || []) : [];
      const initialParagraphs = preferredFormat === 'paragraph' ? (variants[initialVariantIdx]?.paragraphs || []) : [];
      setState((prev) => ({
        options: { includePhoto: !!ui.options?.includePhoto },
        summaryLines: initialLines,
        summaryParagraphs: initialParagraphs,
        experiences: ui.experiences || [],
        skills: ui.skills || {},
        education: ui.education || [],
        certificates: ui.certificates || [],
        projects: prev.projects || [],
      }));
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
  const toggleProjectSkill = (projectId, tagId) => {
    setState((s) => ({
      ...s,
      projects: (s.projects || []).map((p) => {
        if (p.id !== projectId) return p;
        const tags = (p.tags || []).map((t) => {
          // Normalize string tags on-the-fly if any
          if (typeof t === 'string') {
            const normalized = { id: toSlug(t), label: t, enabled: true };
            return normalized.id === tagId ? { ...normalized, enabled: !normalized.enabled } : normalized;
          }
          return t.id === tagId ? { ...t, enabled: !t.enabled } : t;
        });
        return { ...p, tags };
      }),
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
          summaryLines: (summaryFormat === 'bullet' ? (summaryVariants[idx]?.bulletLines || []) : s.summaryLines),
          summaryParagraphs: (summaryFormat === 'paragraph' ? (summaryVariants[idx]?.paragraphs || []) : s.summaryParagraphs),
        }));
      }}
      onChangeSummaryFormat={(fmt) => {
        setSummaryFormat(fmt);
        setState((s) => ({
          ...s,
          summaryLines: (fmt === 'bullet' ? (summaryVariants[summaryVariant]?.bulletLines || []) : []),
          summaryParagraphs: (fmt === 'paragraph' ? (summaryVariants[summaryVariant]?.paragraphs || []) : []),
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
      toggleProjectSkill={toggleProjectSkill}
      toggleSkill={toggleSkill}
    />
  ), [state, summaryVariant, summaryFormat, summaryVariants]);

  // Keep global drawer content in sync with local state whenever it changes
  useEffect(() => {
    setContent(drawerContent);
    return () => setContent(null);
  }, [drawerContent, setContent]);

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
      <Paper id="resume-paper" variant="outlined" sx={{ p: { xs: 2, sm: 3 }, position: 'relative', overflow: 'hidden' }}>
        <Box id="resume-print-area" ref={printRef} sx={{ maxWidth: 920, mx: 'auto' }}>
          {/* Header: photo + summary */}
          <Box className="resume-section">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              {state.options.includePhoto ? (
                <Avatar src={PROFILE_IMG} alt={NAME} sx={{ width: 120, height: 120, border: '2px solid', borderColor: 'divider' }} />
              ) : (
                <Box sx={{ width: 120, height: 120 }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom>{NAME}</Typography>
                {summaryFormat === 'paragraph' ? (
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
          <Box className="resume-section">
            <Typography variant="h6" gutterBottom>Experience</Typography>
            {experiencesToShow.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No experience to display.
              </Typography>
            ) : (
              <Stack id="exp-list" spacing={2} sx={{ mb: 3 }}>
                {experiencesToShow.map((e) => {
                const v = e.variants[e.selectedVariant] || e.variants[0];
                const meta = [v.period, v.employmentType].filter(Boolean).join(' · ');
                return (
                  <Box key={e.id}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{v.title}</Typography>
                    {meta && (
                      <Typography variant="caption" color="text.secondary">{meta}</Typography>
                    )}
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
                        {v.skills.map((s) => {
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
                );
                })}
              </Stack>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Projects */}
          <Box className="resume-section">
            <Typography variant="h6" gutterBottom>Projects</Typography>
            {projectsToShow.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No projects to display.</Typography>
            ) : (
              <Grid container spacing={2}>
                {projectsToShow.map((p) => (
                  <Grid key={p.id} size={{ xs: 12, sm: 4 }}>
                    

                    <Card
                      variant="outlined"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        borderColor: 'divider',
                        transition: (theme) => theme.transitions.create(
                          ['box-shadow', 'transform', 'border-color'],
                          { duration: theme.transitions.duration.shorter }
                        ),
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-2px)',
                          borderColor: 'primary.main',
                          borderWidth: 2,
                        },
                      }}
                    >
                      <CardHeader
                        avatar={p.showIcon !== false ? (
                          p.url ? (
                            <Avatar
                              src={theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png'}
                              alt="GitHub logo"
                              sx={{ bgcolor: 'transparent' }}
                            />
                          ) : (
                            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                              {p.label ? p.label.charAt(0).toUpperCase() : '?'}
                            </Avatar>
                          )
                        ) : undefined}
                        title={p.label}
                        titleTypographyProps={{ variant: 'subtitle1' }}

                        subheader={p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                            {p.url.replace(/^https?:\/\//, '').replace(/github\.com\//, '')}
                          </a>
                        )}
                        subheaderTypographyProps={{ variant: 'caption' }}
                      />
                      {p.showMedia !== false && (
                        <CardMedia
                          sx={{ height: 120, bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}
                        >
                          {p.url ? (
                            <QrWithLogo
                              value={p.url}
                              size={150}
                              logoSrc={theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png'}
                              logoSizeRatio={0.13}
                              withLogo={false}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png'}
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
                              .filter((t) => (typeof t === 'string') ? true : t.enabled)
                              .map((t) => (typeof t === 'string' ? t : t.label))
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
            {skillsToShow.length === 0 ? (
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
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          )}

          {/* Certificates */}
          {certificatesToShow.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box className="resume-section">
                <Typography variant="h6" gutterBottom>Certificates</Typography>
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
              </Box>
            </>
          )}
        </Box>
      </Paper>
      
    </Section>
  );
}
