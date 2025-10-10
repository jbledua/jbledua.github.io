import { useEffect, useMemo, useRef, useState } from 'react';
import Section from '../components/Section.jsx';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Paper from '@mui/material/Paper';
import { Download, Tune } from '@mui/icons-material';
import { listPresets, getPreset } from '../services/presetsService.js';

// Temporary hard-coded resume data. Later, fetch from Supabase.
const PROFILE_IMG = '/images/profile.jpg';
const NAME = 'Josiah Ledua';

const BASE_DATA = {
  options: {
    includePhoto: true,
  },
  summaryVariants: [
    [
      'Full‑stack engineer focused on shipping pragmatic, user-centric solutions.',
      'Experienced across frontend (React), backend (Node), and cloud tooling.',
      'Comfortable leading projects end‑to‑end and collaborating with cross‑functional teams.',
    ],
    [
      'Frontend‑leaning engineer specializing in interfaces, performance, and DX.',
      'Deep experience with React, component systems, and design tokens.',
      'Bias toward maintainable code, accessibility, and measurable outcomes.',
    ],
  ],
  experiences: [
    {
      id: 'role-1',
      label: 'Role 1',
      enabled: false,
      variants: [
        {
          title: 'Senior Software Engineer · Acme Co',
          period: '2022 — Present',
          bullets: [
            'Led migration from CRA to Vite, cutting build times by 70% and improving DX.',
            'Designed typed API layer and query caching that reduced redundant requests by 60%.',
            'Mentored 3 engineers; introduced lightweight RFC process and preview deployments.',
          ],
        },
        {
          title: 'Senior Frontend Engineer · Acme Co',
          period: '2022 — Present',
          bullets: [
            'Built component library and tokens; enabled rapid theming across 4 products.',
            'Implemented critical rendering path optimizations; improved LCP by ~35%.',
            'Partnered with design to roll out a11y checklist and CI linting rules.',
          ],
        },
      ],
      selectedVariant: 0,
    },
    {
      id: 'role-2',
      label: 'Role 2',
      enabled: true,
      variants: [
        {
          title: 'Software Engineer · Startup XYZ',
          period: '2020 — 2022',
          bullets: [
            'Delivered features across Node/Express and React; 0 to 1 marketplace launch.',
            'Introduced telemetry and product analytics; informed roadmap prioritization.',
            'Containerized services and added preview environments via GitHub Actions.',
          ],
        },
        {
          title: 'Backend Engineer · Startup XYZ',
          period: '2020 — 2022',
          bullets: [
            'Designed Postgres schema and migration process; reduced query latency 40%.',
            'Implemented rate‑limited public API with robust observability.',
            'Automated backups and DR drills; improved recovery RTO to < 10 minutes.',
          ],
        },
      ],
      selectedVariant: 0,
    },
    {
      id: 'role-3',
      label: 'Role 3',
      enabled: false,
      variants: [
        {
          title: 'Intern · Helpful Org',
          period: '2019 — 2020',
          bullets: [
            'Prototyped internal tools, saving support team 10+ hours/month.',
            'Wrote scripts that automated data cleanup and export workflows.',
          ],
        },
        {
          title: 'Intern · Helpful Org (Product‑focused)',
          period: '2019 — 2020',
          bullets: [
            'Conducted user interviews and created wireframes for admin UX revamp.',
            'Presented insights leading to a simplified onboarding experience.',
          ],
        },
      ],
      selectedVariant: 0,
    },
  ],
  skills: {
    Languages: [
      { id: 'ts', label: 'TypeScript', enabled: true },
      { id: 'py', label: 'Python', enabled: true },
      { id: 'sql', label: 'SQL', enabled: true },
    ],
    Frameworks: [
      { id: 'react', label: 'React', enabled: true },
      { id: 'node', label: 'Node.js', enabled: true },
      { id: 'mui', label: 'MUI', enabled: true },
    ],
    Tools: [
      { id: 'git', label: 'Git/GitHub', enabled: true },
      { id: 'docker', label: 'Docker', enabled: false },
      { id: 'actions', label: 'GitHub Actions', enabled: false },
    ],
  },
};

const PRESET_V1 = (data) => ({
  ...data,
  options: { includePhoto: true },
  experiences: data.experiences.map((e, i) => ({
    ...e,
    enabled: i < 2, // first two
    selectedVariant: 0,
  })),
  skills: {
    ...data.skills,
    Tools: data.skills.Tools.map((t) => ({ ...t, enabled: t.id !== 'docker' ? true : false })),
  },
});

const PRESET_V2 = (data) => ({
  ...data,
  options: { includePhoto: false },
  experiences: data.experiences.map((e) => ({
    ...e,
    enabled: e.id !== 'role-3',
    selectedVariant: 1,
  })),
  skills: {
    ...data.skills,
    Tools: data.skills.Tools.map((t) => ({ ...t, enabled: t.id !== 'actions' ? false : true })),
  },
});

export default function ResumeBuilderPage() {
  const [state, setState] = useState(() => PRESET_V1(structuredClone(BASE_DATA)));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [summaryVariant, setSummaryVariant] = useState(0);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const experiencesToShow = useMemo(() => state.experiences.filter((e) => e.enabled), [state.experiences]);
  const educationToShow = useMemo(() => (state.education || []).filter((e) => e.enabled), [state.education]);
  const certificatesToShow = useMemo(() => (state.certificates || []).filter((c) => c.enabled), [state.certificates]);

  const skillsToShow = useMemo(() => {
    const res = [];
    Object.entries(state.skills).forEach(([group, items]) => {
      const enabled = items.filter((i) => i.enabled);
      if (enabled.length) res.push({ group, items: enabled });
    });
    return res;
  }, [state.skills]);

  const applyPreset = (preset) => {
    const fresh = preset(structuredClone(BASE_DATA));
    setState(fresh);
    setSummaryVariant(preset === PRESET_V1 ? 0 : 1);
  };

  // Load presets from Supabase on mount; fallback to local presets if none/failed
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await listPresets();
        if (cancelled) return;
        setPresets(list || []);
        if (list && list.length) {
          const ui = await getPreset(list[0].id);
          if (cancelled) return;
          // Map the fetched preset to the component state shape
          setState({
            options: { includePhoto: !!ui.options?.includePhoto },
            experiences: ui.experiences || [],
            skills: ui.skills || {},
            education: ui.education || [],
            certificates: ui.certificates || [],
          });
          setSummaryVariant(Number(ui.summaryVariant ?? 0));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load presets from Supabase, using local presets instead:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const applyPresetFromDb = async (presetId) => {
    try {
      setLoading(true);
      const ui = await getPreset(presetId);
      setState({
        options: { includePhoto: !!ui.options?.includePhoto },
        experiences: ui.experiences || [],
        skills: ui.skills || {},
        education: ui.education || [],
        certificates: ui.certificates || [],
      });
      setSummaryVariant(Number(ui.summaryVariant ?? 0));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to apply preset from Supabase:', e);
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

  return (
    <Section>
      {/* Print styles to only print the preview card */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-print-area, #resume-print-area * { visibility: visible; }
          #resume-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>

      {/* Top controls */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
          {presets && presets.length > 0 ? (
            presets.map((p) => (
              <Button key={p.id} variant="contained" disabled={loading} onClick={() => applyPresetFromDb(p.id)}>
                {p.name}
              </Button>
            ))
          ) : (
            <>
              <Button variant="contained" onClick={() => applyPreset(PRESET_V1)}>Version 1</Button>
              <Button variant="contained" onClick={() => applyPreset(PRESET_V2)}>Version 2</Button>
            </>
          )}
          <Button variant="outlined" onClick={() => setDrawerOpen(true)} startIcon={<Tune />}>Custom</Button>
        </Stack>
        <Tooltip title="Download PDF">
          <IconButton color="primary" onClick={handleDownload} aria-label="Download resume">
            <Download />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Canvas grid look like the mock (optional subtle bg) */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, position: 'relative', overflow: 'hidden' }}>
        <Box id="resume-print-area" ref={printRef} sx={{ maxWidth: 920, mx: 'auto' }}>
          {/* Header: photo + summary */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            {state.options.includePhoto ? (
              <Avatar src={PROFILE_IMG} alt={NAME} sx={{ width: 120, height: 120, border: '2px solid', borderColor: 'divider' }} />
            ) : (
              <Box sx={{ width: 120, height: 120 }} />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>{NAME}</Typography>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {BASE_DATA.summaryVariants[summaryVariant].map((s, i) => (
                  <li key={i}><Typography variant="body1">{s}</Typography></li>
                ))}
              </ul>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Experience */}
          <Typography variant="h6" gutterBottom>Experience</Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
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
                </Box>
              );
            })}
          </Stack>

          {/* Skills */}
          <Typography variant="h6" gutterBottom>Skills</Typography>
          <Stack spacing={2}>
            {skillsToShow.map(({ group, items }) => (
              <Box key={group}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{group}</Typography>
                <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: '1.2rem' }}>
                  {items.map((i) => (
                    <li key={i.id}><Typography variant="body2">{i.label}</Typography></li>
                  ))}
                </ul>
              </Box>
            ))}
          </Stack>

          {/* Education */}
          {educationToShow.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>Education</Typography>
              <Stack spacing={2}>
                {educationToShow.map((e) => (
                  <Box key={e.id}>
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
                ))}
              </Stack>
            </>
          )}

          {/* Certificates */}
          {certificatesToShow.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>Certificates</Typography>
              <Stack spacing={2}>
                {certificatesToShow.map((c) => (
                  <Box key={c.id}>
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
                ))}
              </Stack>
            </>
          )}
        </Box>
      </Paper>

      {/* Customization Drawer */}
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: false,
        }}
        >
      
        <Box sx={{ width: 320, p: 2 }}>
          <Typography variant="h6" gutterBottom>Options</Typography>

          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel control={<Checkbox checked={state.options.includePhoto} onChange={toggleIncludePhoto} />} label="Include photo" />
          </FormGroup>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" gutterBottom>Summary</Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="summary-var">Variant</InputLabel>
            <Select labelId="summary-var" label="Variant" value={summaryVariant} onChange={(e) => setSummaryVariant(Number(e.target.value))}>
              {BASE_DATA.summaryVariants.map((_, i) => (
                <MenuItem key={i} value={i}>Variant {i + 1}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" gutterBottom>Experience</Typography>
          <Stack spacing={2}>
            {state.experiences.map((e) => (
              <Box key={e.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                <FormControlLabel control={<Checkbox checked={e.enabled} onChange={() => toggleRoleEnabled(e.id)} />} label={e.label} />
                <FormControl fullWidth size="small">
                  <InputLabel id={`${e.id}-var`}>Variant</InputLabel>
                  <Select labelId={`${e.id}-var`} label="Variant" value={e.selectedVariant} onChange={(ev) => updateRoleVariant(e.id, Number(ev.target.value))}>
                    {e.variants.map((_, idx) => (
                      <MenuItem key={idx} value={idx}>Version {idx + 1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Education</Typography>
          <Stack spacing={2}>
            {(state.education || []).map((e) => (
              <Box key={e.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                <FormControlLabel control={<Checkbox checked={e.enabled} onChange={() => toggleEducationEnabled(e.id)} />} label={e.label} />
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Certificates</Typography>
          <Stack spacing={2}>
            {(state.certificates || []).map((c) => (
              <Box key={c.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                <FormControlLabel control={<Checkbox checked={c.enabled} onChange={() => toggleCertificateEnabled(c.id)} />} label={c.label} />
              </Box>
            ))}
          </Stack>
          <Typography variant="subtitle1" gutterBottom>Skills</Typography>
          <Stack spacing={1}>
            {Object.entries(state.skills).map(([group, items]) => (
              <Box key={group}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{group}</Typography>
                <FormGroup>
                  {items.map((i) => (
                    <FormControlLabel key={i.id} control={<Checkbox checked={i.enabled} onChange={() => toggleSkill(group, i.id)} />} label={i.label} />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Stack>
        </Box>
      </Drawer>
    </Section>
  );
}
