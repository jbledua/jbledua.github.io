import Box from '@mui/material/Box';

export default function Section({ children, sx }) {
  return (
    <Box component="section" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 }, ...sx }}>
      {children}
    </Box>
  );
}
