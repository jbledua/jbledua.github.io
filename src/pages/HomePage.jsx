import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Section from '../components/Section.jsx';
import Hero from '../components/Hero.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <Section>
        <Typography variant="h3" component="h1" gutterBottom>
          Hi, I'm JB
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Engineer. Builder. Curious mind. This is my personal site where I share projects and ways to reach me.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" href="/projects">View Projects</Button>
          <Button variant="outlined" href="/contact">Contact</Button>
        </Stack>
      </Section>
    </>
  );
}
