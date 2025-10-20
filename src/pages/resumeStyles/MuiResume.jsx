import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { Link as RouterLink } from 'react-router-dom';
import { GitHub, LinkedIn, Facebook, Twitter, Instagram, Link as LinkIcon, Email, Phone } from '@mui/icons-material';
import {Language as Website} from '@mui/icons-material';

// MuiResume is a presentational component extracted from ResumePage.jsx
// It expects the parent to pass data and helper functions as props.
export default function MuiResume(props) {
  const {
    loading,
    state,
    session,
    PROFILE_IMG,
    NAME,
    summaryFormat,
    printRef,
    error,
    experiencesToShow,
    projectsToShow,
    skillsToShow,
    educationToShow,
    certificatesToShow,
    interactiveCardSx,
    isSkillEnabled,
    skillLabelToScheme,
    highlightedSkill,
    normalizeLabel,
    triggerHighlight,
    bounceKeyframes,
    QrWithLogo,
    toSlug,
    getGroupScheme,
  } = props;

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

  const getTooltip = (name, url) => {
    const n = String(name || '').trim();
    if (n) return n.charAt(0).toUpperCase() + n.slice(1);
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'Profile'; }
  };

  const getAriaLabel = (name, url) => {
    const t = getTooltip(name, url);
    return `Open ${t}`;
  };

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
                const jobIconPrimary = (props.theme?.palette?.mode === 'dark'
                  ? (e.iconDark || e.iconLight)
                  : (e.iconLight || e.iconDark)) || null;
                const jobIconAlternate = (props.theme?.palette?.mode === 'dark'
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
                            src={(props.theme?.palette?.mode === 'dark' ? (p.iconDark || p.iconLight) : (p.iconLight || p.iconDark))
                              || (props.theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png')}
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
                            logoSrc={(props.theme?.palette?.mode === 'dark' ? (p.iconDark || p.iconLight) : (p.iconLight || p.iconDark))
                              || (props.theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png')}
                            logoSizeRatio={0.13}
                            withLogo={false}
                          />
                        ) : (
                          <Box
                            component="img"
                            src={(props.theme?.palette?.mode === 'dark' ? (p.iconDark || p.iconLight) : (p.iconLight || p.iconDark))
                              || (props.theme?.palette?.mode === 'dark' ? '/images/github-mark-white.png' : '/images/github-mark.png')}
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
                    const schemeColor = props.theme.palette?.[scheme]?.main || props.theme.palette.divider;
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
