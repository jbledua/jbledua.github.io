-- Master seed script (psql)
-- Run this with psql in the supabase/ directory so relative paths resolve.
-- Example: psql "$env:DATABASE_URL" -f .\seed_master.sql

\i 'seed_experience.sql'
\i 'seed_education.sql'
\i 'seed_certificates.sql'
\i 'seed_skills.sql'
\i 'seed_projects.sql'
\i 'seed_presets_links.sql'
\i 'seed_summaries.sql'
