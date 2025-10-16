-- Seed a minimal resume using new schema: resumes + resume_* links

-- Create a profile photo placeholder
insert into public.photos (id, title, file_path, alt)
values (gen_random_uuid(), 'Profile', 'public/media/profile.jpg', 'Profile photo')
on conflict do nothing;

-- Accounts are seeded in seed_accounts.sql

-- Create a summary description
with s as (
    insert into public.descriptions (id, paragraphs, bullets)
    values (
        gen_random_uuid(),
        array['Technologist spanning systems, software, and cloud. Pragmatic, security-minded, and outcome-focused.'],
        array['Automation-first', 'Clear comms', 'Customer impact']
    ) returning id
)
insert into public.resumes (id, title, profile_photo_id, style, summary_description_id)
select gen_random_uuid(), 'Default', (select id from public.photos order by created_at asc limit 1), '{}'::jsonb, s.id from s;

-- Link accounts, skills, jobs, and projects if available
with r as (
    select id from public.resumes order by created_at desc limit 1
)
insert into public.resume_accounts (resume_id, account_id, label, position)
select r.id, a.id, null, row_number() over(order by a.name) - 1
from r cross join public.accounts a
on conflict do nothing;

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
