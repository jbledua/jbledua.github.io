import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Section from '../components/Section.jsx';

export default function Contact() {
  return (
    <Section>
      <Typography variant="h4" gutterBottom>Contact</Typography>
      <Typography variant="body1" paragraph>
        The best way to reach me is via email at{' '}
        <Link href="mailto:you@example.com">you@example.com</Link>.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        I’m also on GitHub as <Link href="https://github.com/jbledua" target="_blank" rel="noreferrer">@jbledua</Link>.
      </Typography>
    </Section>
  );
}
