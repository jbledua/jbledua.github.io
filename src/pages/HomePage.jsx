import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/system';
import Section from '../components/Section.jsx';
import Hero from '../components/Hero.jsx';
import { Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProjectCarousel from '../components/ProjectCarousel.jsx';
import { useColorMode } from '../theme/ColorModeProvider.jsx';

// Smooth vertical scroll for resume preview
const scrollResume = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-35%); }
`;

export default function Home() {
  const { mode } = useColorMode();
  const resumeImgSrc = mode === 'dark' ? '/images/resume-demo-dark.png' : '/images/resume-demo-light.png';
  return (
    <>
      <Hero />
      <Divider sx={{ my: 4 }} />
      <Section>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
          <Avatar
            alt="Josiah Ledua"
            src="/images/profile.jpg"
            sx={{ width: 128, height: 128, border: '2px solid', borderColor: 'divider' }}
          />

          {/* Abount Section */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Hi, I'm Josiah Ledua
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Founder of Backslash Designs and a recent Computer Science graduate. I’ve spent years helping small businesses and non-profits make technology simple, secure, and scalable, with hands-on experience in Microsoft 365, cloud services, and cybersecurity. My focus is on solving real problems with practical solutions, always learning, iterating, and sharing along the way.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button component={RouterLink} to="/about" variant="outlined">
                About Me
              </Button>
              <Button component={RouterLink} to="/contact" variant="contained">
                Contact
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Section>

      {/* Projects Section - Elevated Paper with caroseling Project cards */}

      <Divider sx={{ my: 4 }} />
      <Section>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 0 }}>
            Featured Projects
          </Typography>
          <Button component={RouterLink} to="/projects" variant="contained">
            View Projects
          </Button>
        </Box>
        {/** Carousel of Project cards goes here */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Check out some of my featured projects below!
          </Typography>
          <Box sx={{ mt: 2 }}>
            <ProjectCarousel variant="compact" cardWidth={360} speed={36} visible={3} />
          </Box>
        </Box>
      </Section>

      {/* Resume Section */}
      <Divider sx={{ my: 4 }} />
      <Section>
  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
          {/* Details on the left (no card; use page background) */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Resume
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Explore a clean, professional resume showcasing my experience across IT leadership, cloud, security, and full‑stack development.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              I maintain multiple tailored versions (leadership, cloud/devops, security, and developer). If you need a specific focus, I can customize a version to highlight the skills and impact most relevant to your role or project.
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Button component={RouterLink} to="/resume" variant="contained">
                View Resume
              </Button>
            </Box>
          </Box>

          {/* Cropped & smoothly scrolling preview on the right */}
          <Box
            sx={{
              width: { xs: '100%', sm: 480, md: 560 },
              maxWidth: '100%',
              // Bound the preview height so the section ends near the button.
              // This keeps the right demo cropped and prevents excessive whitespace on the left.
              height: { xs: 220, sm: 280, md: 340 },
              overflow: 'hidden',
              borderRadius: 1,
              position: 'relative',
              // Gradient overlay to fade edges instead of elevated paper
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: (theme) => `
                  linear-gradient(
                    to bottom,
                    ${theme.palette.background.default} 0px,
                    ${theme.palette.background.default} 24px,
                    transparent 96px,
                    transparent calc(100% - 96px),
                    ${theme.palette.background.default} calc(100% - 24px),
                    ${theme.palette.background.default} 100%
                  ),
                  linear-gradient(
                    to right,
                    ${theme.palette.background.default} 0px,
                    ${theme.palette.background.default} 16px,
                    transparent 56px,
                    transparent calc(100% - 56px),
                    ${theme.palette.background.default} calc(100% - 16px),
                    ${theme.palette.background.default} 100%
                  )
                `,
              },
            }}
          >
            <Box
              component="img"
              src={resumeImgSrc}
              alt="Resume preview thumbnail"
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                willChange: 'transform',
                animation: `${scrollResume} 24s linear infinite alternate`,
              }}
            />
          </Box> 
        </Stack>
      </Section>
      <Divider sx={{ my: 4 }} />
      <Section>
          {/* Blog section - Coming Soon */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Blog
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Stay tuned for insightful articles and tutorials on web development, cloud computing, and more.
            </Typography>
          </Box>
      </Section>
      <Divider sx={{ my: 4 }} />
      <Section>
        {/* Contact Section */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Contact
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Button component={RouterLink} to="/contact" variant="contained">
              Get in Touch
            </Button>
          </Box>
        </Box>
      </Section>

    </>
  );
}
