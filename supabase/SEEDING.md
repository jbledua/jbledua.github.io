# Database Seeding

These SQL files were split by domain to make edits safer and clearer. Run them in this order:

1. seed_experience.sql
   - Creates jobs and all job_variants (including role-specific variants)
2. seed_education.sql
   - Inserts education rows
3. seed_certificates.sql
   - Inserts certificates (also removes two example rows if they exist)
4. seed_skills.sql
   - Inserts skill_groups and skills
5. seed_projects.sql
   - Inserts projects
6. seed_presets_links.sql
   - Creates presets and links: preset_jobs, preset_education, preset_certificates, preset_skills, preset_projects
7. seed_summaries.sql
   - Inserts summary variants per preset with both formats: points (bulleted) and sentence (paragraph)

Notes
- The old combined file (seed_presets.sql) is now a placeholder pointing here to avoid double-seeding.
- These scripts are idempotent-ish but not fully; re-running may create duplicates where no unique constraints exist. Consider adding natural unique constraints or converting to upserts if you need strict idempotency.
- Ensure the uuid extension and gen_random_uuid() are available in your Postgres (Supabase enables this by default).

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

Note: The Supabase web SQL editor does not support `\i` include directives. If you prefer running inside the web editor, paste and execute each file in the documented order.