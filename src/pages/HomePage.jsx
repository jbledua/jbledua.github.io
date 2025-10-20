import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Section from '../components/Section.jsx';
import Hero from '../components/Hero.jsx';
import { Divider } from '@mui/material';
import ProjectCarousel from '../components/ProjectCarousel.jsx';

export default function Home() {
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

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Hi, I'm Josiah Ledua
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Founder of Backslash Designs and a recent Computer Science graduate. I’ve spent years helping small businesses and non-profits make technology simple, secure, and scalable, with hands-on experience in Microsoft 365, cloud services, and cybersecurity. My focus is on solving real problems with practical solutions, always learning, iterating, and sharing along the way.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" href="/projects">View Projects</Button>
              <Button variant="outlined" href="/contact">Contact</Button>
            </Stack>
          </Box>
        </Stack>
      </Section>
      {/* Projects Section - Elevated Paper with caroseling Project cards */}

      <Divider sx={{ my: 4 }} />
      <Section>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Projects
        </Typography>
        {/** Carousel of Project cards goes here */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Check out some of my featured projects below!
          </Typography>
          <Box sx={{ mt: 2 }}>
            <ProjectCarousel speed={18} visible={3} />
          </Box>
        </Box>
      </Section>
    </>
  );
}
