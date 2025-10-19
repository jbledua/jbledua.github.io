-- Create_Schema.sql
-- One-stop schema for public content (locations, skills, groups, descriptions, accounts, photos,
-- jobs, projects, posts, resumes, UI visibility) and helpers. Auth tables live in Supabase's
-- auth schema and are not created here. This file is idempotent where possible.

-- ---------- Extensions ----------
create extension if not exists pgcrypto;       -- gen_random_uuid()
create extension if not exists pg_trgm;        -- fuzzy search helpers

-- ---------- Helpers ----------
-- updated_at trigger
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'job_type') then
    create type job_type as enum ('full_time','part_time','contract','internship','casual','temporary','volunteer','other');
  end if;
  if not exists (select 1 from pg_type where typname = 'post_type') then
    create type post_type as enum ('blog','email','linkedin','kb','page','other');
  end if;
  -- Generic UI enums for visibility controls across entities (projects/jobs/education)
  if not exists (select 1 from pg_type where typname = 'ui_entity_kind') then
    create type ui_entity_kind as enum ('project','job','education');
  end if;
  if not exists (select 1 from pg_type where typname = 'ui_target_kind') then
    -- icon: CardHeader avatar or similar
    -- media: CardMedia (e.g., QR code/cover image)
    -- skill: specific skill visibility within an entity
    create type ui_target_kind as enum ('icon','media','skill');
  end if;
end $$;

-- ---------- Core lookups ----------
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  region text,      -- province/state
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_locations_updated_at before update on public.locations
for each row execute function set_updated_at();

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text generated always as (lower(regexp_replace(name,'[^a-zA-Z0-9]+','-','g'))) stored,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_skills_updated_at before update on public.skills
for each row execute function set_updated_at();

create table if not exists public.skill_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_skill_groups_updated_at before update on public.skill_groups
for each row execute function set_updated_at();

create table if not exists public.skill_group_skills (
  skill_group_id uuid references public.skill_groups(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  position int not null default 0,
  primary key (skill_group_id, skill_id)
);

-- Rich text “Description” blocks (paragraphs + bullets)
create table if not exists public.descriptions (
  id uuid primary key default gen_random_uuid(),
  paragraphs text[] default '{}',
  bullets text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_descriptions_updated_at before update on public.descriptions
for each row execute function set_updated_at();

-- Accounts (links/socials)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- e.g., GitHub, LinkedIn, Website
  icon text,                          -- icon name or url
  link text not null,
  requires_auth boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_accounts_updated_at before update on public.accounts
for each row execute function set_updated_at();

-- Safety: add requires_auth if table existed previously without it
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='accounts'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='accounts' and column_name='requires_auth'
  ) then
    alter table public.accounts add column requires_auth boolean not null default false;
  end if;
end $$;

-- Allowlist for accessing private accounts (referenced by policies)
create table if not exists public.authorized_users (
  user_id uuid unique,
  email   text unique
);

-- Photos (reference Supabase storage path)
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  file_path text not null,            -- e.g. 'public/media/xyz.jpg'
  taken_at timestamptz,
  alt text,
  width int,
  height int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists photos_file_path_idx on public.photos(file_path);
create trigger trg_photos_updated_at before update on public.photos
for each row execute function set_updated_at();

-- ---------- Jobs / Education / Certificates ----------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  type job_type not null default 'full_time',
  location_id uuid references public.locations(id),
  start_date date not null,
  end_date date,
  is_current boolean generated always as (end_date is null) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists jobs_company_idx on public.jobs using gin (company gin_trgm_ops);
create index if not exists jobs_dates_idx on public.jobs(start_date, end_date);
create trigger trg_jobs_updated_at before update on public.jobs
for each row execute function set_updated_at();

-- Add new light/dark logo columns for jobs (safe for existing DBs)
alter table if exists public.jobs
  add column if not exists job_icon_light_id uuid references public.photos(id) on delete set null,
  add column if not exists job_icon_dark_id uuid references public.photos(id) on delete set null;

-- Array of Description blocks for each Job (ordered)
create table if not exists public.job_descriptions (
  job_id uuid references public.jobs(id) on delete cascade,
  description_id uuid references public.descriptions(id) on delete restrict,
  position int not null default 0,
  primary key (job_id, description_id)
);

-- Related Skills/Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text generated always as (lower(regexp_replace(title,'[^a-zA-Z0-9]+','-','g'))) stored,
  description_id uuid references public.descriptions(id) on delete set null,
  github_url text,
  website_url text,
  cover_photo_id uuid references public.photos(id) on delete set null,
  -- DEPRECATED: legacy single icon reference
  project_icon_id uuid references public.photos(id) on delete set null,
  -- New: separate light/dark icon variants
  project_icon_light_id uuid references public.photos(id) on delete set null,
  project_icon_dark_id uuid references public.photos(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_title_idx on public.projects using gin (title gin_trgm_ops);
create trigger trg_projects_updated_at before update on public.projects
for each row execute function set_updated_at();

-- Backfill for existing databases where the table already exists
alter table if exists public.projects
  add column if not exists project_icon_id uuid references public.photos(id) on delete set null;

-- Add new light/dark icon columns for projects (safe for existing DBs)
alter table if exists public.projects
  add column if not exists project_icon_light_id uuid references public.photos(id) on delete set null,
  add column if not exists project_icon_dark_id uuid references public.photos(id) on delete set null;

-- Backfill: if legacy project_icon_id is set and new columns are null, copy it to both
update public.projects
set project_icon_light_id = coalesce(project_icon_light_id, project_icon_id)
where project_icon_id is not null and project_icon_light_id is null;

update public.projects
set project_icon_dark_id = coalesce(project_icon_dark_id, project_icon_id)
where project_icon_id is not null and project_icon_dark_id is null;

create table if not exists public.project_skills (
  project_id uuid references public.projects(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  position int not null default 0,
  primary key (project_id, skill_id)
);

create table if not exists public.job_skills (
  job_id uuid references public.jobs(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  primary key (job_id, skill_id)
);

create table if not exists public.job_projects (
  job_id uuid references public.jobs(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  position int not null default 0,
  primary key (job_id, project_id)
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  school text not null,
  degree text not null,              -- Masters, Bachelors, Diploma, etc.
  major text,
  location_id uuid references public.locations(id),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists education_school_idx on public.education using gin (school gin_trgm_ops);
create trigger trg_education_updated_at before update on public.education
for each row execute function set_updated_at();

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  issue_date date not null,
  expiry_date date,
  credential_id text,
  credential_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_certificates_updated_at before update on public.certificates
for each row execute function set_updated_at();

-- ---------- Flexible Tags for Posts ----------
-- Tag types: values/vendors/technologies/clients (extensible)
create table if not exists public.tag_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique  -- e.g., 'value','vendor','technology','client'
);

insert into public.tag_types (name)
  values ('value'), ('vendor'), ('technology'), ('client')
on conflict do nothing;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  tag_type_id uuid not null references public.tag_types(id) on delete cascade,
  name text not null,
  slug text generated always as (lower(regexp_replace(name,'[^a-zA-Z0-9]+','-','g'))) stored,
  unique (tag_type_id, name)
);

-- ---------- Posts (Blog/Email/LinkedIn/etc.) ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  cover_photo_id uuid references public.photos(id) on delete set null,
  summary_description_id uuid references public.descriptions(id) on delete set null,
  type post_type not null default 'blog',
  author text not null default 'Josiah Ledua',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null check (status in ('draft','scheduled','published')) default 'draft',
  posted boolean not null default false,
  posted_at timestamptz,
  emailed boolean not null default false,
  emailed_at timestamptz,
  content_md text not null default ''
);
create index if not exists posts_title_idx on public.posts using gin (title gin_trgm_ops);
create index if not exists posts_content_trgm_idx on public.posts using gin (content_md gin_trgm_ops);
create trigger trg_posts_updated_at before update on public.posts
for each row execute function set_updated_at();

-- Post relations
create table if not exists public.post_skills (
  post_id uuid references public.posts(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  primary key (post_id, skill_id)
);

create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ---------- Resumes ----------
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  profile_photo_id uuid references public.photos(id) on delete set null,
  style jsonb default '{}'::jsonb,                 -- future theming options
  summary_description_id uuid references public.descriptions(id) on delete set null,
  visibility_profile_id uuid,                      -- optional: default UI visibility profile
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_resumes_updated_at before update on public.resumes
for each row execute function set_updated_at();

-- Resume contact info (ordered list of Accounts)
create table if not exists public.resume_accounts (
  resume_id uuid references public.resumes(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  label text,                         -- optional display label override
  position int not null default 0,
  primary key (resume_id, account_id)
);

-- Resume Skills (ordered)
create table if not exists public.resume_skills (
  resume_id uuid references public.resumes(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  position int not null default 0,
  primary key (resume_id, skill_id)
);

-- Resume Experience = array of Jobs (ordered)
create table if not exists public.resume_jobs (
  resume_id uuid references public.resumes(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  position int not null default 0,
  primary key (resume_id, job_id)
);

-- Resume Projects (ordered)
create table if not exists public.resume_projects (
  resume_id uuid references public.resumes(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  position int not null default 0,
  primary key (resume_id, project_id)
);

-- ---------- Generic UI visibility settings ----------
-- Stores visibility toggles for UI elements in a generic way that can apply to Projects now
-- and Jobs/Education in the future. Intended to be optional: if no rows exist, defaults apply.
create table if not exists public.ui_visibility (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references public.resumes(id) on delete cascade,
  entity_kind ui_entity_kind not null,
  entity_id uuid not null,
  target_kind ui_target_kind not null,
  target_id uuid,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- If target_kind='skill' and target_id is provided, it should exist in skills
  constraint ui_visibility_target_skill_fk
    foreign key (target_id) references public.skills(id) on delete cascade deferrable initially deferred
);
create trigger trg_ui_visibility_updated_at before update on public.ui_visibility
for each row execute function set_updated_at();

-- Unique composite to prevent duplicates for the same scope and element.
-- Use a fixed NULL-uuid for uniqueness across nullable fields.
create unique index if not exists ui_visibility_unique_idx
on public.ui_visibility (
  coalesce(resume_id, '00000000-0000-0000-0000-000000000000'::uuid),
  entity_kind,
  entity_id,
  target_kind,
  coalesce(target_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Helpful index for fetching all visibilities for an entity in a resume context
create index if not exists ui_visibility_entity_scope_idx
on public.ui_visibility (resume_id, entity_kind, entity_id);

-- ---------- Default UI Visibility Profiles (optional) ----------
-- Profiles define a set of default visibility items that can be applied when loading a resume.
-- Users can then tweak the UI locally (not persisted) and a reload re-applies the profile.
create table if not exists public.ui_visibility_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ui_visibility_profiles_updated_at before update on public.ui_visibility_profiles
for each row execute function set_updated_at();

create table if not exists public.ui_visibility_profile_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.ui_visibility_profiles(id) on delete cascade,
  entity_kind ui_entity_kind not null,
  entity_id uuid not null,
  target_kind ui_target_kind not null,
  target_id uuid,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ui_visibility_profile_items_target_skill_fk
    foreign key (target_id) references public.skills(id) on delete cascade deferrable initially deferred
);
create trigger trg_ui_visibility_profile_items_updated_at before update on public.ui_visibility_profile_items
for each row execute function set_updated_at();

-- Prevent duplicate items in a profile for the same element
create unique index if not exists ui_visibility_profile_items_unique_idx
on public.ui_visibility_profile_items (
  profile_id,
  entity_kind,
  entity_id,
  target_kind,
  coalesce(target_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Helpful lookup index
create index if not exists ui_visibility_profile_items_scope_idx
on public.ui_visibility_profile_items (profile_id, entity_kind, entity_id);

-- Link resumes.visibility_profile_id to profiles (optional)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'resumes_visibility_profile_fk') then
    alter table public.resumes
      add constraint resumes_visibility_profile_fk
      foreign key (visibility_profile_id)
      references public.ui_visibility_profiles(id)
      on delete set null;
  end if;
end $$;
create index if not exists resumes_visibility_profile_idx on public.resumes(visibility_profile_id);

-- ---------- Convenience views (optional) ----------
-- Posts with publish flags and dates in one row
create or replace view public.v_posts_published as
select
  p.*,
  (p.status = 'published' and p.posted is true) as is_public
from public.posts p;

-- Note: RLS enablement and policies are intentionally left out of this file.
-- See Create_Policies.sql to enable row level security and define access policies.
