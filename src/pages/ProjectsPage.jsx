import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Section from '../components/Section.jsx';

export default function Projects() {
  const projects = [
    { title: 'Project One', desc: 'A brief description of project one.' },
    { title: 'Project Two', desc: 'A brief description of project two.' },
    { title: 'Project Three', desc: 'A brief description of project three.' },
  ];

  return (
    <Section>
      <Typography variant="h4" gutterBottom>Projects</Typography>
      <Grid container spacing={2}>
        {projects.map((p) => (
          <Grid key={p.title} item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{p.title}</Typography>
                <Typography variant="body2" color="text.secondary">{p.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}
