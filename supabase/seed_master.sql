-- Run this with psql in the supabase/ directory so relative paths resolve.
-- Example: psql "$env:DATABASE_URL" -f .\seed_master.sql

-- Core lookups and content
\i 'seed_skills.sql'
\i 'seed_accounts.sql'
\i 'seed_experience.sql'
\i 'seed_education.sql'
\i 'seed_certificates.sql'
\i 'seed_projects.sql'
\i 'seed_posts.sql'
\i 'seed_resumes.sql'
