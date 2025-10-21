import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Section from '../components/Section.jsx';

const NAME = 'Josiah Ledua';
const PROFILE_IMG = '/images/profile.jpg';

export default function AboutPage() {
  return (
    <>
      {/* Header / Identity */}
      <Section sx={{ pt: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
          <Avatar
            alt={NAME}
            src={PROFILE_IMG}
            sx={{ width: 128, height: 128, border: '2px solid', borderColor: 'divider' }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Hi, I’m {NAME}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Founder of <strong>Backslash Designs</strong> and an IT/engineering generalist who turns messy
              requirements into dependable systems. I focus on practical outcomes for small businesses and
              non‑profits: clear identity & access, resilient infrastructure, and tools that teams actually enjoy using.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              My guiding line is <em>“Pursue Excellence, Not Perfection.”</em> Excellence means shipping thoughtful,
              maintainable work, communicating clearly, documenting as I go, and improving it steadily over time.
            </Typography>
          </Box>
        </Stack>
      </Section>

      <Divider sx={{ my: 2 }} />

      {/* What I bring (value) */}
      <Section sx={{ pt: 0 }}>
        <Typography variant="h5" gutterBottom>
          The value I bring
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Systems that stay out of your way
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Reliability first:</strong> simple, secure-by-default architectures that are easy to operate.<br />
                • <strong>Calm automation:</strong> reduce busywork with tooling that’s explainable and reversible.<br />
                • <strong>Clear documentation:</strong> playbooks, SOPs, and onboarding that help teams move faster.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                How I work
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Start small, ship early, iterate with feedback.<br />
                • Communicate trade‑offs plainly; no black boxes.<br />
                • Design for hand‑off: your team should own it comfortably.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Section>

      <Section sx={{ pt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Background
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          I’ve spent years building and supporting IT for small organizations and non‑profits—owning identity,
          security, collaboration, and A/V while also delivering full‑stack web and cloud projects. That breadth means
          I can connect the dots across infrastructure, developer experience, and day‑to‑day operations.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Today, through Backslash Designs, I help teams align their tooling with how they actually work—whether that’s
          streamlining Microsoft 365 and device management, deploying containerized services, or creating lightweight
          web apps that make internal processes humane.
        </Typography>
      </Section>

      <Section sx={{ pt: 0 }}>
        <Typography variant="h6" gutterBottom>
          Principles I won’t compromise on
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          {[
            'Clarity over cleverness',
            'Security by default',
            'Documentation is a feature',
            'Small steps, continuous improvement',
            'Operate > impress',
          ].map((label) => (
            <Chip key={label} label={label} variant="outlined" />
          ))}
        </Stack>
      </Section>

      <Section sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Who I help
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Non‑profits and small teams modernizing safely.<br />
                • Founders who need dependable basics before scale.<br />
                • Creators who want to automate the boring parts.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Current focus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Microsoft 365/Entra foundations (identity, device mgmt).<br />
                • Containerized services with sane defaults and backups.<br />
                • DX improvements: CI/CD, templates, and runbooks.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Section>

      <Section sx={{ pt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Outside of work
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          I like building clear learning resources, tinkering with audio/video systems, and reading sci‑fi & fantasy.
          Most experiments end up as guides or templates others can reuse.
        </Typography>
      </Section>

      <Divider sx={{ my: 2 }} />

      {/* Light CTA that respects separate pages for resume/projects/blog */}
      <Section sx={{ pt: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Typography variant="body1" color="text.secondary">
            If you value calm, reliable systems and clear documentation, we’ll work well together.
          </Typography>
          <Button variant="contained" href="/contact">Get in touch</Button>
        </Stack>
      </Section>
    </>
  );
}