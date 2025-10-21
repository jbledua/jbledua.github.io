-- Seed_Experience.sql
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

-- Seed Backslash Designs logos and link to job
with existing_photos as (
  select id, file_path from public.photos where file_path in (
    'photos/logos/BSD-Logo-Dark.png',
    'photos/logos/BSD-Logo-Light.png'
  )
), ins_dark as (
  insert into public.photos (title, file_path, alt, width, height)
  select 'Backslash Designs Logo (Dark)', 'photos/logos/BSD-Logo-Dark.png', 'Backslash Designs logo - dark', null, null
  where not exists (select 1 from existing_photos where file_path='photos/logos/BSD-Logo-Dark.png')
  returning id
), ins_light as (
  insert into public.photos (title, file_path, alt, width, height)
  select 'Backslash Designs Logo (Light)', 'photos/logos/BSD-Logo-Light.png', 'Backslash Designs logo - light', null, null
  where not exists (select 1 from existing_photos where file_path='photos/logos/BSD-Logo-Light.png')
  returning id
), ph as (
  select id, file_path from existing_photos
  union all select id, 'photos/logos/BSD-Logo-Dark.png' from ins_dark
  union all select id, 'photos/logos/BSD-Logo-Light.png' from ins_light
), job as (
  select id from public.jobs where company='Backslash Designs' and role='Owner' order by start_date desc nulls last limit 1
), dark as (
  select id from ph where file_path='photos/logos/BSD-Logo-Dark.png' limit 1
), light as (
  select id from ph where file_path='photos/logos/BSD-Logo-Light.png' limit 1
)
update public.jobs j
set job_icon_dark_id = coalesce(j.job_icon_dark_id, (select id from dark)),
    job_icon_light_id = coalesce(j.job_icon_light_id, (select id from light))
from job
where j.id = job.id;

-- Seed NorthWind Family Ministries logos and link to job
with existing_photos as (
  select id, file_path from public.photos where file_path in (
    'photos/logos/NFM-Logo-Dark.png',
    'photos/logos/NFM-Logo-Light.png'
  )
), ins_dark as (
  insert into public.photos (title, file_path, alt, width, height)
  select 'NorthWind Family Ministries Logo (Dark)', 'photos/logos/NFM-Logo-Dark.png', 'NorthWind Family Ministries logo - dark', null, null
  where not exists (select 1 from existing_photos where file_path='photos/logos/NFM-Logo-Dark.png')
  returning id
), ins_light as (
  insert into public.photos (title, file_path, alt, width, height)
  select 'NorthWind Family Ministries Logo (Light)', 'photos/logos/NFM-Logo-Light.png', 'NorthWind Family Ministries logo - light', null, null
  where not exists (select 1 from existing_photos where file_path='photos/logos/NFM-Logo-Light.png')
  returning id
), ph as (
  select id, file_path from existing_photos
  union all select id, 'photos/logos/NFM-Logo-Dark.png' from ins_dark
  union all select id, 'photos/logos/NFM-Logo-Light.png' from ins_light
), job as (
  select id from public.jobs where company='NorthWind Family Ministries' and role='Information Technology Lead' order by start_date desc nulls last limit 1
), dark as (
  select id from ph where file_path='photos/logos/NFM-Logo-Dark.png' limit 1
), light as (
  select id from ph where file_path='photos/logos/NFM-Logo-Light.png' limit 1
)
update public.jobs j
set job_icon_dark_id = coalesce(j.job_icon_dark_id, (select id from dark)),
    job_icon_light_id = coalesce(j.job_icon_light_id, (select id from light))
from job
where j.id = job.id;

-- Seed JIG Technologies Inc logos and link to job
with existing_photos as (
  select id, file_path from public.photos where file_path in (
    'photos/logos/JIG-Logo-Dark.png',
    'photos/logos/JIG-Logo-Light.png'
  )
), ins_dark as (
  insert into public.photos (title, file_path, alt, width, height)
  select 'JIG Technologies Inc Logo (Dark)', 'photos/logos/JIG-Logo-Dark.png', 'JIG Technologies Inc logo - dark', null, null
  where not exists (select 1 from existing_photos where file_path='photos/logos/JIG-Logo-Dark.png')
  returning id
), ins_light as (
  insert into public.photos (title, file_path, alt, width, height)
  select 'JIG Technologies Inc Logo (Light)', 'photos/logos/JIG-Logo-Light.png', 'JIG Technologies Inc logo - light', null, null
  where not exists (select 1 from existing_photos where file_path='photos/logos/JIG-Logo-Light.png')
  returning id
), ph as (
  select id, file_path from existing_photos
  union all select id, 'photos/logos/JIG-Logo-Dark.png' from ins_dark
  union all select id, 'photos/logos/JIG-Logo-Light.png' from ins_light
), job as (
  select id from public.jobs where company='JIG Technologies Inc' and role='Remote Support Technician (Level 1)' order by start_date desc nulls last limit 1
), dark as (
  select id from ph where file_path='photos/logos/JIG-Logo-Dark.png' limit 1
), light as (
  select id from ph where file_path='photos/logos/JIG-Logo-Light.png' limit 1
)
update public.jobs j
set job_icon_dark_id = coalesce(j.job_icon_dark_id, (select id from dark)),
    job_icon_light_id = coalesce(j.job_icon_light_id, (select id from light))
from job
where j.id = job.id;

-- Description block for Backslash Designs · Owner
with job as (
  select id from public.jobs where company='Backslash Designs' and role='Owner' order by start_date desc nulls last limit 1
), existing as (
  select id from public.descriptions
  where paragraphs[1] = 'Owner of an independent tech studio delivering managed IT, DevOps, and full‑stack projects for SMBs and non-profits.'
), ins as (
  insert into public.descriptions (paragraphs, bullets)
  select array['Owner of an independent tech studio delivering managed IT, DevOps, and full‑stack projects for SMBs and non-profits.']::text[],
        array[
          'Standardized device provisioning and compliance with Intune/Autopilot; documented DR with Synology backups.',
          'Containerized services behind Tailscale; built CI/CD with GitHub Actions for static sites and infrastructure repos.',
          'Designed Supabase schemas and secure APIs; built React/MUI front ends for marketing and internal tools.',
          'Automated email onboarding and nurture flows with Power Automate and n8n; produced responsive HTML templates.'
        ]::text[]
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
insert into public.job_descriptions (job_id, description_id, position)
select job.id, d.id, 0
from job, d
on conflict do nothing;

-- Description block for JIG Technologies Inc · Remote Support Technician (Level 1)
with job as (
  select id from public.jobs where company='JIG Technologies Inc' and role='Remote Support Technician (Level 1)' order by start_date desc nulls last limit 1
), existing as (
  select id from public.descriptions
  where paragraphs[1] = 'Level 1 remote support for SMB clients: triaged desktop/server issues, handled account lifecycle and hardware setup, and delivered responsive support against strict SLAs.'
), ins as (
  insert into public.descriptions (paragraphs, bullets)
  select array['Level 1 remote support for SMB clients: triaged desktop/server issues, handled account lifecycle and hardware setup, and delivered responsive support against strict SLAs.']::text[],
        array[
          'Resolved desktop-related tickets and routine server issues; connected displays, restored email service, and performed proactive maintenance.',
          'Provisioned and deprovisioned user accounts; configured endpoints to streamline onboarding and offboarding.',
          'Provided professional remote support via phone and email; handled 4–5 concurrent tickets while meeting a 15‑min response and 1‑day resolution SLA.',
          'Escalated complex cases with teammates and supervisors to ensure timely resolution and minimal downtime.',
          'Maintained accurate ticket notes, resolutions, and client communications for auditability and trend analysis.',
          'Continually improved product and platform knowledge to deliver current, effective solutions.'
        ]::text[]
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
insert into public.job_descriptions (job_id, description_id, position)
select job.id, d.id, 0
from job, d
on conflict do nothing;

-- Description block for University of Toronto · Summer Intern
with job as (
  select id from public.jobs where company='University of Toronto' and role='Summer Intern' order by start_date desc nulls last limit 1
), existing_old as (
  select id from public.descriptions
  where paragraphs[1] = 'Built a C++/Qt backend on a Kubuntu server communicating with a balloon server via a proprietary protocol, with a React front end consuming a RESTful API.'
), existing_new as (
  select id from public.descriptions
  where paragraphs[1] = 'Worked on a C++/Qt backend on a Kubuntu server that communicated with a balloon server via a proprietary protocol, with a React front end consuming a RESTful API.'
), upd as (
  update public.descriptions
  set paragraphs = array['Worked on a C++/Qt backend on a Kubuntu server that communicated with a balloon server via a proprietary protocol, with a React front end consuming a RESTful API.']::text[],
      bullets = array[
        'Contributed to backend services in C++ using Qt on Kubuntu; integrated with a proprietary protocol maintained by the team.',
        'Helped design RESTful API endpoints for the front end; documented request/response shapes for integration.',
        'Developed React components to visualize device/balloon state and trigger backend actions.',
        'Worked in a Linux server environment: basic service supervision, logging, and troubleshooting.'
      ]::text[]
  where id in (select id from existing_old)
  returning id
), ins as (
  insert into public.descriptions (paragraphs, bullets)
  select array['Worked on a C++/Qt backend on a Kubuntu server that communicated with a balloon server via a proprietary protocol, with a React front end consuming a RESTful API.']::text[],
        array[
          'Contributed to backend services in C++ using Qt on Kubuntu; integrated with a proprietary protocol maintained by the team.',
          'Helped design RESTful API endpoints for the front end; documented request/response shapes for integration.',
          'Developed React components to visualize device/balloon state and trigger backend actions.',
          'Worked in a Linux server environment: basic service supervision, logging, and troubleshooting.'
        ]::text[]
  where not exists (select 1 from existing_new)
        and not exists (select 1 from existing_old)
  returning id
), d as (
  select id from existing_new
  union all
  select id from upd
  union all
  select id from ins
)
insert into public.job_descriptions (job_id, description_id, position)
select job.id, d.id, 0
from job, d
on conflict do nothing;

-- Description block for Lakehead University · Research Assistant
with job as (
  select id from public.jobs where company='Lakehead University' and role='Research Assistant' order by start_date desc nulls last limit 1
), existing as (
  select id from public.descriptions
  where paragraphs[1] = 'Research support while studying: built React-based UI for a faculty website and explored early ideas in computer vision for security cameras.'
), ins as (
  insert into public.descriptions (paragraphs, bullets)
  select array['Research support while studying: built React-based UI for a faculty website and explored early ideas in computer vision for security cameras.']::text[],
        array[
          'Implemented responsive React components and basic MUI theming for a faculty site prototype.',
          'Collaborated with a professor to translate wireframes into accessible, mobile-friendly layouts.',
          'Explored feasibility of computer-vision approaches for security cameras; gathered references and drafted proposal notes.',
          'Used Git/GitHub for version control and issue tracking; documented setup and contribution steps.',
          'Leveraged JavaScript/TypeScript and Python for UI prototypes and exploratory scripts.'
        ]::text[]
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
insert into public.job_descriptions (job_id, description_id, position)
select job.id, d.id, 0
from job, d
on conflict do nothing;

-- Description block for NorthWind Family Ministries · Information Technology Lead
with job as (
  select id from public.jobs where company='NorthWind Family Ministries' and role='Information Technology Lead' order by start_date desc nulls last limit 1
), existing as (
  select id from public.descriptions
  where paragraphs[1] = 'Owned reliability, security, and collaboration tooling across a Microsoft 365/Entra ID environment.'
), ins as (
  insert into public.descriptions (paragraphs, bullets)
  select array['Owned reliability, security, and collaboration tooling across a Microsoft 365/Entra ID environment.']::text[],
        array[
          'Administered Entra ID, Exchange Online, SharePoint/Teams, and Intune (Windows/iOS) with baseline and Conditional Access policies.',
          'Hardened endpoints with Defender/EDR; deployed phishing protections and privileged access reviews.',
          'Implemented data retention, backup, and recovery playbooks with documented RTO/RPO.',
          'Consolidated Teams/SharePoint information architecture to reduce sprawl and improve permissions hygiene.',
          'Provided SLA-driven support and clear communications; authored SOPs and reusable runbooks.'
        ]::text[]
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
insert into public.job_descriptions (job_id, description_id, position)
select job.id, d.id, 0
from job, d
on conflict do nothing;

-- Description block for Freelance · Information Technology Consultant
with job as (
  select id from public.jobs where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1
), existing as (
  select id from public.descriptions
  where paragraphs[1] = 'Freelance IT consulting across Microsoft 365 and live broadcast workflows for non-profits, social services, and media clients; precursor to founding Backslash Designs.'
), ins as (
  insert into public.descriptions (paragraphs, bullets)
  select array['Freelance IT consulting across Microsoft 365 and live broadcast workflows for non-profits, social services, and media clients; precursor to founding Backslash Designs.']::text[],
        array[
          'Supported Microsoft 365 tenants for non-profits: user onboarding/offboarding, identity and email hygiene, and day-to-day help desk triage.',
          'Designed and maintained live production stacks for media clients (NDI/SDI routing, Blackmagic switchers, vMix, ProPresenter, PTZ control, audio integration).',
          'Implemented pragmatic network and device setups to reduce downtime and improve reliability during live events.',
          'Partnered with stakeholders to scope needs and deliver right-sized solutions with clear handover docs and SOPs.',
          'Standardized tools and practices that later evolved into Backslash Designs'' managed IT and A/V offerings.'
        ]::text[]
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
insert into public.job_descriptions (job_id, description_id, position)
select job.id, d.id, 0
from job, d
on conflict do nothing;

-- Map a few job skills (using existing skills)
-- Ensure required skills exist for these mappings
insert into public.skills (id, name)
select gen_random_uuid(), v.name
from (values ('Node.js'), ('GitHub Actions')) as v(name)
where not exists (select 1 from public.skills s where s.name = v.name);

with s as (select id, name from public.skills), j as (select id, company, role, start_date from public.jobs)
insert into public.job_skills (job_id, skill_id)
select (select id from j where company='Backslash Designs' and role='Owner' order by start_date desc nulls last limit 1), (select id from s where name='React' limit 1)
union all
select (select id from j where company='Backslash Designs' and role='Owner' order by start_date desc nulls last limit 1), (select id from s where name='Node.js' limit 1)
union all
select (select id from j where company='NorthWind Family Ministries' and role='Information Technology Lead' order by start_date desc nulls last limit 1), (select id from s where name='GitHub Actions' limit 1)
union all
-- Freelance · Information Technology Consultant — Pro A/V skills
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='vMix' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='ProPresenter' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='Blackmagic Design' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='NDI' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='SDI' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='PTZ' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='HDBaseT' limit 1)
union all
-- Freelance · Information Technology Consultant — IT support skills
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='Microsoft' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='Microsoft Entra ID' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='Intune' limit 1)
union all
select (select id from j where company='Freelance' and role='Information Technology Consultant' order by start_date desc nulls last limit 1), (select id from s where name='Google Workspace' limit 1)
union all
-- JIG Technologies Inc — IT support and RMM
select (select id from j where company='JIG Technologies Inc' and role='Remote Support Technician (Level 1)' order by start_date desc nulls last limit 1), (select id from s where name='Kasaya' limit 1)
union all
select (select id from j where company='JIG Technologies Inc' and role='Remote Support Technician (Level 1)' order by start_date desc nulls last limit 1), (select id from s where name='Dato RMM' limit 1)
union all
select (select id from j where company='JIG Technologies Inc' and role='Remote Support Technician (Level 1)' order by start_date desc nulls last limit 1), (select id from s where name='Microsoft Entra ID' limit 1)
union all
select (select id from j where company='JIG Technologies Inc' and role='Remote Support Technician (Level 1)' order by start_date desc nulls last limit 1), (select id from s where name='Google Workspace' limit 1)
union all
select (select id from j where company='JIG Technologies Inc' and role='Remote Support Technician (Level 1)' order by start_date desc nulls last limit 1), (select id from s where name='Microsoft 365' limit 1)
union all
-- Lakehead University · Research Assistant — UI and early CV research
select (select id from j where company='Lakehead University' and role='Research Assistant' order by start_date desc nulls last limit 1), (select id from s where name='React' limit 1)
union all
select (select id from j where company='Lakehead University' and role='Research Assistant' order by start_date desc nulls last limit 1), (select id from s where name='MUI' limit 1)
union all
select (select id from j where company='Lakehead University' and role='Research Assistant' order by start_date desc nulls last limit 1), (select id from s where name='JavaScript' limit 1)
union all
select (select id from j where company='Lakehead University' and role='Research Assistant' order by start_date desc nulls last limit 1), (select id from s where name='TypeScript' limit 1)
union all
select (select id from j where company='Lakehead University' and role='Research Assistant' order by start_date desc nulls last limit 1), (select id from s where name='Python' limit 1)
union all
select (select id from j where company='Lakehead University' and role='Research Assistant' order by start_date desc nulls last limit 1), (select id from s where name='AI' limit 1)
union all
-- University of Toronto · Summer Intern — C++/Qt backend on Kubuntu + React REST front end
select (select id from j where company='University of Toronto' and role='Summer Intern' order by start_date desc nulls last limit 1), (select id from s where name='C++' limit 1)
union all
select (select id from j where company='University of Toronto' and role='Summer Intern' order by start_date desc nulls last limit 1), (select id from s where name='Qt' limit 1)
union all
select (select id from j where company='University of Toronto' and role='Summer Intern' order by start_date desc nulls last limit 1), (select id from s where name='Kubuntu' limit 1)
union all
select (select id from j where company='University of Toronto' and role='Summer Intern' order by start_date desc nulls last limit 1), (select id from s where name='React' limit 1)
union all
select (select id from j where company='University of Toronto' and role='Summer Intern' order by start_date desc nulls last limit 1), (select id from s where name='RESTful API' limit 1)
on conflict do nothing;

-- Cleanup: remove outdated UofT skill mappings no longer representative
with job as (
  select id from public.jobs where company='University of Toronto' and role='Summer Intern' order by start_date desc nulls last limit 1
), old_skills as (
  select id from public.skills where name in ('Python','SQL','Git/GitHub')
)
delete from public.job_skills js
using job, old_skills
where js.job_id = job.id and js.skill_id = old_skills.id;

