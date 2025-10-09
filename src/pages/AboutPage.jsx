import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Section from '../components/Section.jsx';

const NAME = 'Josiah Ledua';
const PROFILE_IMG = '/images/profile.jpg';

export default function AboutPage() {
  return (
    <>
      <Section sx={{ pt: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
          <Avatar
            alt={NAME}
            src={PROFILE_IMG}
            sx={{ width: 128, height: 128, border: '2px solid', borderColor: 'divider' }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              About me
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              I’m a Computer Science graduate and the founder of Backslash Designs. I love building practical
              solutions that make technology feel simple and trustworthy—especially for small teams and
              non‑profits. My experience spans full‑stack web, Microsoft 365, cloud services, and cybersecurity.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              I value clarity, security by default, and steady iteration. When I’m not shipping features,
              I’m usually refining developer workflows, documenting what I learn, or experimenting with
              automation to reduce busywork.
            </Typography>
          </Box>
        </Stack>
      </Section>

      <Divider sx={{ my: 2 }} />

      <Section sx={{ pt: 0 }}>
        <Typography variant="h5" gutterBottom>
          What I work with
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          {[
            'JavaScript', 'TypeScript', 'React', 'Vite', 'Node.js',
            'HTML/CSS', 'MUI', 'REST', 'GitHub', 'CI/CD',
            'Microsoft 365', 'Azure AD', 'Security', 'Automation'
          ].map((label) => (
            <Chip key={label} label={label} variant="outlined" />
          ))}
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent focus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Building small, focused tools that remove friction for creators and small orgs.<br />
                • Improving reliability and security without adding complexity.<br />
                • Sharing practical guides and templates others can reuse.
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Beyond code
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Mentoring and collaborating across disciplines.<br />
                • Streamlining operations for small teams.<br />
                • Exploring ways to make learning and documentation more accessible.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Section>
    </>
  );
}
