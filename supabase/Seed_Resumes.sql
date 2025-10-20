-- Seed_Resumes.sql
-- Seed a minimal resume using new schema: resumes + resume_* links

-- Create a profile photo placeholder
insert into public.photos (id, title, file_path, alt)
values (gen_random_uuid(), 'Profile', 'public/media/profile.jpg', 'Profile photo')
on conflict do nothing;

-- Accounts are seeded in Seed_Accounts.sql

-- Create a summary description
with s as (
    insert into public.descriptions (id, paragraphs, bullets)
    values (
        gen_random_uuid(),
        array[
            'Versatile IT leader delivering secure, scalable systems for MSPs, non-profits, and small enterprises. I streamline operations with clear processes, automation, and solid documentation.',
            'Hands-on across identity, M365/Entra, Intune, Docker, and CI/CD—turning real needs into reliable, maintainable solutions.'
        ],
        array[
            'Identity & M365: Entra ID, Exchange, SharePoint/Teams, Intune',
            'Security & resilience: Defender/EDR, backup, RTO/RPO, least privilege',
            'DevOps: Docker, Tailscale, GitHub Actions, IaC basics',
            'Full-stack: React/MUI, Supabase, REST APIs',
            'Automation: Power Automate, n8n, HTML email flows',
            'A/V: NDI/SDI, vMix, Blackmagic, live production'
        ]
    ) returning id
)
insert into public.resumes (id, title, profile_photo_id, style, summary_description_id)
-- Store a simple style marker we can use later in the UI
select gen_random_uuid(), 'IT Support', (select id from public.photos order by created_at asc limit 1), '{"ui":"MUI"}'::jsonb, s.id from s;

-- Link accounts, skills, jobs, and projects if available
with r as (
    select id from public.resumes order by created_at desc limit 1
)
insert into public.resume_accounts (resume_id, account_id, label, position)
select r.id, a.id, null, row_number() over(order by a.name) - 1
from r cross join public.accounts a
on conflict do nothing;

-- Explicit ordering for IT Support resume: Phone, Email, Website, LinkedIn, GitHub
with r as (
    select id from public.resumes where title = 'IT Support' order by created_at desc limit 1
), desired(name, pos) as (
    values
        ('Phone', 0),
        ('Email', 1),
        ('Website', 2),
        ('LinkedIn', 3),
        ('GitHub', 4)
)
insert into public.resume_accounts (resume_id, account_id, label, position)
select r.id, a.id, null, d.pos
from r
join desired d on true
join public.accounts a on lower(a.name) = lower(d.name)
on conflict (resume_id, account_id)
do update set position = excluded.position;

with r as (
    select id from public.resumes order by created_at desc limit 1
), s as (
    select id, row_number() over(order by name) - 1 as pos from public.skills limit 8
)
insert into public.resume_skills (resume_id, skill_id, position)
select r.id, s.id, s.pos from r, s
on conflict do nothing;

with r as (
    select id from public.resumes order by created_at desc limit 1
), j as (
    select id, row_number() over(order by start_date desc) - 1 as pos from public.jobs limit 6
)
insert into public.resume_jobs (resume_id, job_id, position)
select r.id, j.id, j.pos from r, j
on conflict do nothing;

with r as (
    select id from public.resumes order by created_at desc limit 1
), p as (
    select id, row_number() over(order by title) - 1 as pos from public.projects limit 6
)
insert into public.resume_projects (resume_id, project_id, position)
select r.id, p.id, p.pos from r, p
on conflict do nothing;

-- Set default visibility for resume accounts: hide those requiring auth
-- with r as (
--     select id from public.resumes order by created_at desc limit 1
-- )
-- insert into public.resume_account_visibility (resume_id, account_id, visible)
-- select r.id, a.id, not a.requires_auth
-- from r cross join public.accounts a
-- on conflict (resume_id, account_id) do nothing;

-- Explicitly hide Facebook, Instagram, and X for the 'IT Support' resume
with r as (
    select id from public.resumes where title = 'IT Support' order by created_at desc limit 1
), a as (
    select id from public.accounts where lower(name) in ('facebook','instagram','x')
)
insert into public.resume_account_visibility (resume_id, account_id, visible)
select r.id, a.id, false from r, a
on conflict (resume_id, account_id) do update set visible = excluded.visible;

-- -------------------------------
-- Add a comprehensive "All" resume
-- Includes ALL accounts, skills, jobs, and projects
-- -------------------------------

-- Create the "All" resume if it doesn't already exist
with d as (
    -- Reuse an existing description (oldest) to keep seeds simple
    select id from public.descriptions order by created_at asc limit 1
), p as (
    -- Reuse the earliest profile photo if available
    select id from public.photos order by created_at asc limit 1
)
insert into public.resumes (id, title, profile_photo_id, style, summary_description_id)
select gen_random_uuid(), 'All', p.id, '{"ui":"MUI"}'::jsonb, d.id
from d, p
where not exists (
    select 1 from public.resumes where title = 'All'
);

-- Link ALL accounts to the "All" resume, ordered by name
with r as (
    select id from public.resumes where title = 'All' order by created_at desc limit 1
)
insert into public.resume_accounts (resume_id, account_id, label, position)
select r.id, a.id, null, row_number() over(order by a.name) - 1
from r cross join public.accounts a
on conflict (resume_id, account_id)
do update set position = excluded.position;

-- Link ALL skills to the "All" resume, ordered by name
with r as (
    select id from public.resumes where title = 'All' order by created_at desc limit 1
), s as (
    select id, row_number() over(order by name) - 1 as pos from public.skills
)
insert into public.resume_skills (resume_id, skill_id, position)
select r.id, s.id, s.pos from r, s
on conflict (resume_id, skill_id)
do update set position = excluded.position;

-- Link ALL jobs to the "All" resume, ordered by most recent start_date (nulls last)
with r as (
    select id from public.resumes where title = 'All' order by created_at desc limit 1
), j as (
    select id, row_number() over(order by start_date desc nulls last, end_date desc nulls last, id) - 1 as pos
    from public.jobs
)
insert into public.resume_jobs (resume_id, job_id, position)
select r.id, j.id, j.pos from r, j
on conflict (resume_id, job_id)
do update set position = excluded.position;

-- Link ALL projects to the "All" resume, ordered by title
with r as (
    select id from public.resumes where title = 'All' order by created_at desc limit 1
), p as (
    select id, row_number() over(order by title, id) - 1 as pos from public.projects
)
insert into public.resume_projects (resume_id, project_id, position)
select r.id, p.id, p.pos from r, p
on conflict (resume_id, project_id)
do update set position = excluded.position;

-- Ensure ALL accounts are visible on the "All" resume
with r as (
    select id from public.resumes where title = 'All' order by created_at desc limit 1
), a as (
    select id from public.accounts
)
insert into public.resume_account_visibility (resume_id, account_id, visible)
select r.id, a.id, true from r, a
on conflict (resume_id, account_id)
do update set visible = excluded.visible;

-- Explicit ordering for All resume: Phone, Email, Website, LinkedIn, GitHub, Facebook, Instagram, X
with r as (
    select id from public.resumes where title = 'All' order by created_at desc limit 1
), desired(name, pos) as (
    values
        ('Phone', 0),
        ('Email', 1),
        ('Website', 2),
        ('LinkedIn', 3),
        ('GitHub', 4),
        ('Facebook', 5),
        ('Instagram', 6),
        ('X', 7)
)
insert into public.resume_accounts (resume_id, account_id, label, position)
select r.id, a.id, null, d.pos
from r
join desired d on true
join public.accounts a on lower(a.name) = lower(d.name)
on conflict (resume_id, account_id)
do update set position = excluded.position;
