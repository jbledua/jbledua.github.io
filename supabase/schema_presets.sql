-- Schema for resume presets linked to jobs.

-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists "pgcrypto";

create table if not exists public.jobs ( 
    id uuid primary key default gen_random_uuid(), 
  title text not null, 
    company text not null, 
    location text, 
    start_date date not null, 
    end_date date,
    description text,
    employment_type text, -- e.g., 'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
    bullets text[], 
    created_at timestamptz not null default now()
);

-- Add a distinct role field for clarity between job role and description
alter table public.jobs add column if not exists role text;
-- Backfill role from title if empty
update public.jobs set role = coalesce(role, title) where role is null;

-- Basic backfill for employment_type using description keywords if not already set
update public.jobs
set employment_type = coalesce(employment_type,
  case
    when description ilike '%part-time%' then 'Part-time'
    when description ilike '%full-time%' then 'Full-time'
    when description ilike '%contract%' then 'Contract'
    when description ilike '%intern%' then 'Internship'
    when description ilike '%freelance%' then 'Freelance'
    else null
  end
)
where employment_type is null;

-- presets: top-level preset definitions
create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  include_photo boolean not null default true,
  summary_variant int2 not null default 0,
  created_at timestamptz not null default now()
);

-- job_variants: per-job text variants (title and bullets)
-- You can store alternative phrasing for the same job
create table if not exists public.job_variants (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  variant_index int2 not null default 0,
  title text not null,
  summary text, -- optional brief description for this variant
  bullets text[] not null default '{}',
  unique(job_id, variant_index)
);

-- preset_jobs: which jobs appear in a preset and which variant to use
create table if not exists public.preset_jobs (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  enabled boolean not null default true,
  selected_variant int2 not null default 0,
  position int2 not null default 0, -- optional ordering in UI
  unique(preset_id, job_id)
);

-- Optional: skills tables if you want to store selectable skills too
create table if not exists public.skill_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position int2 not null default 0
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.skill_groups(id) on delete cascade,
  label text not null,
  position int2 not null default 0
);

create table if not exists public.preset_skills (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  enabled boolean not null default true,
  unique(preset_id, skill_id)
);

-- projects: portfolio projects to display on site and include in resume presets
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  short_description text,
  description text,
  github_url text,
  homepage_url text,
  image_url text,
  logo_light_url text,
  logo_dark_url text,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

-- preset_projects: link selected projects to a preset (ordering + enabled)
create table if not exists public.preset_projects (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  enabled boolean not null default true,
  position int2 not null default 0,
  unique(preset_id, project_id)
);

-- education: academic history
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  school text not null,
  degree text,
  field_of_study text,
  location text,
  start_date date,
  end_date date,
  description text,
  bullets text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- preset_education: link selected education entries to a preset
create table if not exists public.preset_education (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  education_id uuid not null references public.education(id) on delete cascade,
  enabled boolean not null default true,
  position int2 not null default 0,
  unique(preset_id, education_id)
);

-- certificates: professional certs
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text,
  issue_date date,
  expiration_date date,
  credential_id text,
  credential_url text,
  description text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- preset_certificates: link certs to a preset
create table if not exists public.preset_certificates (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  certificate_id uuid not null references public.certificates(id) on delete cascade,
  enabled boolean not null default true,
  position int2 not null default 0,
  unique(preset_id, certificate_id)
);

-- RLS
alter table public.presets enable row level security;
alter table public.job_variants enable row level security;
alter table public.preset_jobs enable row level security;
alter table public.skill_groups enable row level security;
alter table public.skills enable row level security;
alter table public.preset_skills enable row level security;
alter table public.projects enable row level security;
alter table public.preset_projects enable row level security;
alter table public.education enable row level security;
alter table public.preset_education enable row level security;
alter table public.certificates enable row level security;
alter table public.preset_certificates enable row level security;

-- Public read policy (if desired for static site)
drop policy if exists "presets_public_read" on public.presets;
create policy "presets_public_read" on public.presets for select using (true);

drop policy if exists "job_variants_public_read" on public.job_variants;
create policy "job_variants_public_read" on public.job_variants for select using (true);

drop policy if exists "preset_jobs_public_read" on public.preset_jobs;
create policy "preset_jobs_public_read" on public.preset_jobs for select using (true);

drop policy if exists "skill_groups_public_read" on public.skill_groups;
create policy "skill_groups_public_read" on public.skill_groups for select using (true);

drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read" on public.skills for select using (true);

drop policy if exists "preset_skills_public_read" on public.preset_skills;
create policy "preset_skills_public_read" on public.preset_skills for select using (true);

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects for select using (true);

drop policy if exists "preset_projects_public_read" on public.preset_projects;
create policy "preset_projects_public_read" on public.preset_projects for select using (true);

drop policy if exists "education_public_read" on public.education;
create policy "education_public_read" on public.education for select using (true);

drop policy if exists "preset_education_public_read" on public.preset_education;
create policy "preset_education_public_read" on public.preset_education for select using (true);

drop policy if exists "certificates_public_read" on public.certificates;
create policy "certificates_public_read" on public.certificates for select using (true);

drop policy if exists "preset_certificates_public_read" on public.preset_certificates;
create policy "preset_certificates_public_read" on public.preset_certificates for select using (true);
