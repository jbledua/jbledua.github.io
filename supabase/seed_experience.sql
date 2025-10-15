-- Experience seed for new schema: jobs, job_descriptions, job_skills

-- Seed a few locations
insert into public.locations (id, country, region, city)
values
  (gen_random_uuid(), 'Canada', 'Ontario', 'Thunder Bay'),
  (gen_random_uuid(), 'Canada', 'Ontario', 'Toronto'),
  (gen_random_uuid(), 'Canada', null, null)
on conflict do nothing;

-- Resolve location ids
with l as (
  select
    (select id from public.locations where country='Canada' and region='Ontario' and city='Thunder Bay' order by created_at asc limit 1) as tbay,
    (select id from public.locations where country='Canada' and region='Ontario' and city='Toronto' order by created_at asc limit 1) as tor,
    (select id from public.locations where country='Canada' and region is null and city is null order by created_at asc limit 1) as ca
), jobs_src as (
  select 'Backslash Designs'::text as company, 'Owner'::text as role, 'part_time'::job_type as type,
        (select tbay from l) as loc, date '2024-07-01' as start_d, null::date as end_d union all
  select 'NorthWind Family Ministries', 'Information Technology Lead', 'full_time', (select tbay from l), date '2022-09-01', null union all
  select 'Freelance', 'Information Technology Consultant', 'other', (select tbay from l), date '2022-09-01', date '2024-07-01' union all
  select 'JIG Technologies Inc', 'Remote Support Technician (Level 1)', 'full_time', (select tor from l), date '2020-12-01', date '2021-05-01' union all
  select 'University of Toronto', 'Summer Intern', 'internship', (select ca from l), date '2020-05-01', date '2020-08-01' union all
  select 'Lakehead University', 'Research Assistant', 'part_time', (select ca from l), date '2019-12-01', date '2020-02-01' union all
  select 'Equipment World Inc.', 'Tent Crew Member/Lead', 'full_time', (select tbay from l), date '2018-06-01', date '2019-09-01' union all
  select 'Best Buy', 'Salesperson', 'full_time', (select tbay from l), date '2016-02-01', date '2018-06-01' union all
  select 'Nordmin Engineering Ltd.', 'Electrical Draftsman', 'full_time', (select tbay from l), date '2015-02-01', date '2016-02-01' union all
  select 'A To Z Rentals', 'Tent Crew Member', 'part_time', (select tbay from l), date '2014-06-01', date '2015-12-01' union all
  select 'AutomationNow', 'System Integrator', 'contract', (select tbay from l), date '2012-11-01', date '2013-08-01' union all
  select 'Interior Electrical Automation Inc.', 'Electrical Technician', 'contract', (select tbay from l), date '2012-06-01', date '2012-08-01'
)
insert into public.jobs (id, company, role, type, location_id, start_date, end_date)
select gen_random_uuid(), company, role, type, loc, start_d, end_d from jobs_src;

-- Description blocks for selected jobs (paragraph + bullets)
with j as (
  select id, company, role, start_date from public.jobs
), d as (
  select gen_random_uuid() as id, array['Owner of a boutique tech studio delivering managed IT, DevOps, and full‑stack projects for SMBs and non-profits.']::text[] as paragraphs,
        array[
          'Standardized device provisioning and compliance with Intune/Autopilot; documented DR with Synology backups.',
          'Containerized services behind Tailscale; built CI/CD with GitHub Actions for static sites and infrastructure repos.',
          'Designed Supabase schemas and secure APIs; built React/MUI front ends for marketing and internal tools.',
          'Automated email onboarding and nurture flows with Power Automate and n8n; produced responsive HTML templates.'
        ]::text[] as bullets
  union all
  select gen_random_uuid(), array['Owned reliability, security, and collaboration tooling across a Microsoft 365/Entra ID environment.'],
        array[
          'Administered Entra ID, Exchange Online, SharePoint/Teams, and Intune (Windows/iOS) with baseline and Conditional Access policies.',
          'Hardened endpoints with Defender/EDR; deployed phishing protections and privileged access reviews.',
          'Implemented data retention, backup, and recovery playbooks with documented RTO/RPO.',
          'Consolidated Teams/SharePoint information architecture to reduce sprawl and improve permissions hygiene.',
          'Provided SLA-driven support and clear communications; authored SOPs and reusable runbooks.'
        ]
)
insert into public.descriptions (id, paragraphs, bullets)
select * from d;

-- Link descriptions to jobs (ordered)
with j as (
  select id, company, role, start_date from public.jobs
), d as (
  select id, 0 as position from public.descriptions order by created_at asc limit 2
), pairs as (
  select (select id from j where company='Backslash Designs' and role='Owner' order by start_date desc nulls last limit 1) as job_id,
        (select id from public.descriptions order by created_at asc limit 1) as description_id, 0 as position
  union all
  select (select id from j where company='NorthWind Family Ministries' and role='Information Technology Lead' order by start_date desc nulls last limit 1),
        (select id from public.descriptions order by created_at asc offset 1 limit 1), 0
)
insert into public.job_descriptions (job_id, description_id, position)
select job_id, description_id, position from pairs
on conflict do nothing;

-- Map a few job skills (using existing skills)
with s as (select id, name from public.skills), j as (select id, company, role, start_date from public.jobs)
insert into public.job_skills (job_id, skill_id)
select (select id from j where company='Backslash Designs' and role='Owner' order by start_date desc nulls last limit 1), (select id from s where name='React' limit 1)
union all
select (select id from j where company='Backslash Designs' and role='Owner' order by start_date desc nulls last limit 1), (select id from s where name='Node.js' limit 1)
union all
select (select id from j where company='NorthWind Family Ministries' and role='Information Technology Lead' order by start_date desc nulls last limit 1), (select id from s where name='GitHub Actions' limit 1)
on conflict do nothing;
