# Database Seeding (new schema)

The database schema has been upgraded to a more flexible content model with locations, skills (+ groups), descriptions, jobs, projects, posts, and resumes.

Run the seed files in this order:

1) seed_skills.sql
   - Inserts skills by name and groups, and maps them via `skill_group_skills` with positions.
2) seed_experience.sql
   - Inserts locations and jobs; adds description blocks and links them via `job_descriptions`; maps a few `job_skills`.
3) seed_education.sql
   - Inserts education rows linked to a default location.
4) seed_certificates.sql
   - Inserts certificates (uses new `expiry_date` column).
5) seed_projects.sql
   - Inserts portfolio projects (title + GitHub URL).
6) seed_posts.sql (optional)
   - Adds a sample post and ensures tag types exist.
7) seed_resumes.sql
   - Creates a default resume with a profile photo, contact accounts, and links jobs/skills/projects.

Notes
- The previous preset-based seeds (`seed_presets_links.sql`, `seed_summaries.sql`) are deprecated and no longer referenced by `seed_master.sql`.
- Scripts are idempotent-ish but not fully; they use basic `on conflict do nothing` where reasonable.
- Ensure extensions are enabled: `pgcrypto` and `pg_trgm` are created in the schema file.

## One-command seeding

Option A — psql master script
- Requires psql installed and DATABASE_URL in your environment
- From the `supabase/` directory:

```powershell
# Set your connection string, e.g. from Supabase project settings
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"

# Run the master script (uses psql \i includes)
psql $env:DATABASE_URL -f .\seed_master.sql
```

Option B — PowerShell helper
- From repo root or the `supabase/` directory:

```powershell
# Using env var
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
./supabase/seed.ps1

# Or pass explicitly
./supabase/seed.ps1 -DatabaseUrl "postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
```

Note: The Supabase web SQL editor does not support `\i` include directives. If you prefer running inside the web editor, paste and execute each file in the documented order above.