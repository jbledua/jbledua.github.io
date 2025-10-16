import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

// Lightweight QR renderer using the 'qrcode' package and Canvas overlay for a center logo
// Props:
// - value: string (QR content / URL)
// - size: number (canvas size in px)
// - logoSrc: string (image path/url to draw at center)
// - logoSizeRatio: number (0..1, portion of size occupied by logo, default 0.25)
export default function QrWithLogo({ value, size = 96, logoSrc, logoSizeRatio = 0.25, withLogo = true, sx }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    async function render() {
      if (!value || !canvasRef.current) return;
      const QRCode = (await import('qrcode')).default;
      const canvas = canvasRef.current;
      try {
        await QRCode.toCanvas(canvas, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        if (isCancelled) return;

  if (withLogo && logoSrc) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          // Allow same-origin logo files; adjust if using external logos
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            if (isCancelled) return;
            const logoSize = Math.max(16, Math.min(size * logoSizeRatio, size * 0.38));
            const x = (size - logoSize) / 2;
            const y = (size - logoSize) / 2;
            // Draw a white rounded background to preserve QR contrast
            const pad = Math.max(3, Math.round(logoSize * 0.08));
            const rx = x - pad;
            const ry = y - pad;
            const rw = logoSize + pad * 2;
            const rh = logoSize + pad * 2;
            const radius = Math.min(10, Math.round(logoSize * 0.15));

            ctx.save();
            drawRoundedRect(ctx, rx, ry, rw, rh, radius);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            // Optional subtle border
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            // Draw logo centered
            ctx.drawImage(img, x, y, logoSize, logoSize);
          };
          img.src = logoSrc;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to render QR code:', e);
      }
    }
    render();
    return () => { isCancelled = true; };
  }, [value, size, logoSrc, logoSizeRatio, withLogo]);

  return (
    <Box sx={{ width: size, height: size, ...sx }}>
      <canvas ref={canvasRef} width={size} height={size} aria-label="QR code" />
    </Box>
  );
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
