import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

// Local helper to normalize string tags if any appear
const toSlug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function ResumeBuilderDrawerContent({
  state,
  summaryVariant,
  summaryFormat,
  summaryVariants,
  onChangeSummaryVariant,
  onChangeSummaryFormat,
  toggleIncludePhoto,
  toggleRoleEnabled,
  updateRoleVariant,
  toggleEducationEnabled,
  toggleCertificateEnabled,
  toggleProjectEnabled,
  toggleProjectShowIcon,
  toggleProjectShowMedia,
  toggleProjectSkill,
  toggleSkill,
}) {
  return (
    <Box sx={{ width: 320, p: 2 }}>
      <Typography variant="h6" gutterBottom>Options</Typography>

      <FormGroup sx={{ mb: 2 }}>
        <FormControlLabel control={<Switch checked={state.options.includePhoto} onChange={toggleIncludePhoto} />} label="Include photo" />
      </FormGroup>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="summary-variant">Summary Variant</InputLabel>
        <Select
          labelId="summary-variant"
          label="Summary Variant"
          value={summaryVariant}
          onChange={(ev) => onChangeSummaryVariant(Number(ev.target.value))}
        >
          {(summaryVariants || []).map((_, idx) => (
            <MenuItem key={idx} value={idx}>Summary {idx + 1}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="summary-format">Summary Format</InputLabel>
        <Select
          labelId="summary-format"
          label="Summary Format"
          value={summaryFormat}
          onChange={(ev) => onChangeSummaryFormat(ev.target.value)}
        >
          <MenuItem value="bullet">Bulleted</MenuItem>
          <MenuItem value="paragraph">Paragraph</MenuItem>
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
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>Projects</Typography>
      <Stack spacing={2}>
        {(state.projects || []).map((p) => (
          <Box key={p.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
            <FormControlLabel control={<Checkbox checked={p.enabled} onChange={() => toggleProjectEnabled(p.id)} />} label={p.label} />
            <Box sx={{ ml: 3 }}>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={p.showIcon !== false} onChange={() => toggleProjectShowIcon(p.id)} />}
                  label="Show icon"
                />
                <FormControlLabel
                  control={<Checkbox checked={p.showMedia !== false} onChange={() => toggleProjectShowMedia(p.id)} />}
                  label={p.url ? 'Show QR code' : 'Show media'}
                />
              </FormGroup>
            </Box>
            {(p.tags && p.tags.length > 0) && (
              <Box sx={{ ml: 3, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Skills</Typography>
                <FormGroup>
                  {p.tags.map((t) => {
                    const id = typeof t === 'string' ? toSlug(t) : t.id;
                    const label = typeof t === 'string' ? t : t.label;
                    const checked = typeof t === 'string' ? true : !!t.enabled;
                    return (
                      <FormControlLabel
                        key={id}
                        control={<Checkbox checked={checked} onChange={() => toggleProjectSkill(p.id, id)} />}
                        label={label}
                      />
                    );
                  })}
                </FormGroup>
              </Box>
            )}
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
  );
}
