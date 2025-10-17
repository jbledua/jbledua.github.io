// Minimal Supabase browser client setup
// Uses Vite env vars: import.meta.env.VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// Docs: https://supabase.com/docs/reference/javascript/initializing
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Surface a clear error early in development
  // Avoid throwing in production builds to not crash static site, but log helpful message
  // eslint-disable-next-line no-console
  console.warn('[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Configure your .env');
}

export const supabase = createClient(
  SUPABASE_URL ?? 'https://example.supabase.co',
  SUPABASE_ANON_KEY ?? 'public-anon-key-placeholder'
);

// Build a public URL for a given storage file path if using public buckets.
// Accepts values like 'public/media/logo.png'. Returns absolute URL or the input if malformed.
export function getPublicStorageUrl(filePath) {
  try {
    if (!filePath || typeof filePath !== 'string') return null;
    const base = SUPABASE_URL ?? '';
    if (!base) return filePath;
    // Supabase public URL pattern: {url}/storage/v1/object/public/{filePath}
    const trimmed = filePath.replace(/^\/+/, '');
    return `${base.replace(/\/$/, '')}/storage/v1/object/public/${trimmed}`;
  } catch {
    return filePath;
  }
}
