import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

// Default images to use when no repo logo/banner is found (served locally from public/)
const DEFAULT_GITHUB_IMAGE_LIGHT = '/images/github-mark.png';
const DEFAULT_GITHUB_IMAGE_DARK = '/images/github-mark-white.png';

export default function ProjectCard({ data, mode: forcedMode }) {
  const theme = useTheme();
  const mode = forcedMode || theme?.palette?.mode;
  const { title, description, linkUrl, imageAlt, lightImageUrl, darkImageUrl, fallbackImageUrl, error, tags, slug } = data;
  const toSlug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const chosenImage = (mode === 'dark' ? darkImageUrl : lightImageUrl)
    || fallbackImageUrl
    || (mode === 'dark' ? DEFAULT_GITHUB_IMAGE_DARK : DEFAULT_GITHUB_IMAGE_LIGHT);

  return (
    <Card
      id={slug || toSlug(title)}
      variant="outlined"
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderColor: 'divider',
        transition: theme.transitions.create(
          ['box-shadow', 'transform', 'border-color'],
          { duration: theme.transitions.duration.shorter }
        ),
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
          borderColor: 'primary.main',
          borderWidth: 2,
        },
      })}
    >
      {slug ? (
        <CardActionArea component={RouterLink} to={`#${slug}`} sx={{ textAlign: 'inherit' }}>
          {/* Top centered small logo */}
          <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
            <Box
              component="img"
              src={chosenImage}
              alt={imageAlt || `${title} logo`}
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = (mode === 'dark' ? DEFAULT_GITHUB_IMAGE_DARK : DEFAULT_GITHUB_IMAGE_LIGHT);
                if (img.src !== window.location.origin + fallback && !img.dataset.fallbackApplied) {
                  img.dataset.fallbackApplied = 'true';
                  img.src = fallback;
                }
              }}
              sx={{ maxHeight: 48, maxWidth: '56%', objectFit: 'contain', filter: 'none' }}
            />
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom noWrap title={title}>{title}</Typography>
            <Divider sx={{ mb: 1 }} />
            {error ? (
              <Typography variant="body2" color="error">{String(error)}</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {description || 'No description provided.'}
              </Typography>
            )}
            {Array.isArray(tags) && tags.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map((label, i) => (
                  <Chip key={`${toSlug(label)}-${i}`} label={label} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                ))}
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      ) : (
        <>
          {/* Top centered small logo */}
          <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
            <Box
              component="img"
              src={chosenImage}
              alt={imageAlt || `${title} logo`}
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = (theme?.palette?.mode === 'dark' ? DEFAULT_GITHUB_IMAGE_DARK : DEFAULT_GITHUB_IMAGE_LIGHT);
                if (img.src !== window.location.origin + fallback && !img.dataset.fallbackApplied) {
                  img.dataset.fallbackApplied = 'true';
                  img.src = fallback;
                }
              }}
              sx={{ maxHeight: 48, maxWidth: '56%', objectFit: 'contain', filter: 'none' }}
            />
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom noWrap title={title}>{title}</Typography>
            <Divider sx={{ mb: 1 }} />
            {error ? (
              <Typography variant="body2" color="error">{String(error)}</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {description || 'No description provided.'}
              </Typography>
            )}
            {Array.isArray(tags) && tags.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map((label, i) => (
                  <Chip key={`${toSlug(label)}-${i}`} label={label} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                ))}
              </Box>
            )}
          </CardContent>
        </>
      )}
      <CardActions>
        <Button size="small" color="primary" href={data.linkUrl} target="_blank" rel="noopener noreferrer" disabled={!data.linkUrl}>
          {data.websitePreferred ? 'View Website' : 'View Project'}
        </Button>
      </CardActions>
    </Card>
  );
}
