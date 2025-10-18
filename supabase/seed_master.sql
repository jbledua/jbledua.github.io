-- Run this with psql in the supabase/ directory so relative paths resolve.
-- Example (Windows PowerShell): psql $env:DATABASE_URL -f .\seed_master.sql
-- Example (bash): psql "$DATABASE_URL" -f ./seed_master.sql

-- Schema first
\i 'Create_Schema.sql'

-- Policies next
\i 'Create_Policies.sql'

-- Seed data (order matters)
\i 'Seed_Skills.sql'
\i 'Seed_Accounts.sql'
\i 'Seed_Experience.sql'
\i 'Seed_Education.sql'
\i 'Seed_Certificates.sql'
\i 'Seed_Projects.sql'
\i 'Seed_Posts.sql'
\i 'Seed_Resumes.sql'
