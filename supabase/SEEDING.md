# Database setup and seeding (consolidated)

This folder ships a single schema file and a single policies file, followed by individual `Seed_[Data].sql` files.

Tables include: locations, skills (+ groups), descriptions, accounts (with `requires_auth`), photos, jobs, projects, education, certificates, posts (+ tags), resumes, and generic UI visibility. Auth tables are managed by Supabase and not created here.

## Order to run files

1) Create_Schema.sql
   - Creates extensions, helper functions, enums, all public tables, indexes, triggers, views.
2) Create_Policies.sql
   - Enables RLS and sets policies (currently for `public.accounts` with an allowlist).

Then run seed files in this order:

3) Seed_Skills.sql
   - Inserts skills by name and groups, and maps them via `skill_group_skills` with positions.
4) Seed_Accounts.sql
   - Inserts social/contact accounts. Private ones are flagged with `requires_auth = true`.
5) Seed_Experience.sql
   - Inserts locations and jobs; adds description blocks and links them via `job_descriptions`; maps a few `job_skills`.
6) Seed_Education.sql
   - Inserts education rows linked to a default location.
7) Seed_Certificates.sql
   - Inserts certificates (with optional `expiry_date`).
8) Seed_Projects.sql
   - Inserts portfolio projects and maps skills; also upserts project icon photos.
9) Seed_Posts.sql (optional)
   - Adds a sample post and ensures tag types exist.
10) Seed_Resumes.sql (run last)
   - Creates a default resume with a profile photo, contact accounts, and links jobs/skills/projects.

Notes
- Scripts are idempotent-ish (use `on conflict do nothing` where reasonable) but are not intended as migration history.
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

Linux/macOS note: The master script also works from bash:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
psql "$DATABASE_URL" -f ./supabase/seed_master.sql
```

Supabase SQL editor: It does not support `\i` include directives. Paste and execute each file in the order above.