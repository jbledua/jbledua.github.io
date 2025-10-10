-- Presets seed and cross-entity linking
-- Run AFTER: seed_experience.sql, seed_education.sql, seed_certificates.sql, seed_skills.sql, seed_projects.sql

-- Create presets (idempotent-ish: won’t prevent duplicates if run many times).
insert into public.presets (id, name, include_photo, summary_variant)
values
  (gen_random_uuid(), 'IT Systems Administrator', true, 0),
  (gen_random_uuid(), 'DevOps', true, 0),
  (gen_random_uuid(), 'Full-Stack Developer', false, 1),
  (gen_random_uuid(), 'Game Systems', false, 1),
  (gen_random_uuid(), 'Digital Marketing Technologist', false, 1);

-- Link jobs to each preset with a selected variant and position
-- IT Systems Administrator
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 10, x.pos
from public.presets p
join public.jobs j on (j.title, j.company) in (('Information Technology Lead','NorthWind Family Ministries'),
                                               ('Owner','Backslash Designs'),
                                               ('Freelance Information Technology Consultant','Freelance'))
join (values
  ('Information Technology Lead','NorthWind Family Ministries', 0),
  ('Owner','Backslash Designs', 1),
  ('Freelance Information Technology Consultant','Freelance', 2)
) as x(t,c,pos) on x.t = j.title and x.c = j.company
where p.name = 'IT Systems Administrator';

-- DevOps
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 11, x.pos
from public.presets p
join public.jobs j on (j.title, j.company) in (('Owner','Backslash Designs'),
                                               ('Information Technology Lead','NorthWind Family Ministries'))
join (values
  ('Owner','Backslash Designs', 0),
  ('Information Technology Lead','NorthWind Family Ministries', 1)
) as x(t,c,pos) on x.t = j.title and x.c = j.company
where p.name = 'DevOps';

-- Full-Stack Developer
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 12, x.pos
from public.presets p
join public.jobs j on (j.title, j.company) in (('Owner','Backslash Designs'),
                                               ('Summer Intern - Dunlap Institute for Astronomy & Astrophysics','University of Toronto'),
                                               ('Research Assistant','Lakehead University'))
join (values
  ('Owner','Backslash Designs', 0),
  ('Summer Intern - Dunlap Institute for Astronomy & Astrophysics','University of Toronto', 1),
  ('Research Assistant','Lakehead University', 2)
) as x(t,c,pos) on x.t = j.title and x.c = j.company
where p.name = 'Full-Stack Developer';

-- Game Systems
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 13, 0
from public.presets p
join public.jobs j on j.title = 'Owner' and j.company = 'Backslash Designs'
where p.name = 'Game Systems';

-- Digital Marketing Technologist
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 14, x.pos
from public.presets p
join public.jobs j on (j.title, j.company) in (('Owner','Backslash Designs'),
                                               ('Freelance Information Technology Consultant','Freelance'))
join (values
  ('Owner','Backslash Designs', 0),
  ('Freelance Information Technology Consultant','Freelance', 1)
) as x(t,c,pos) on x.t = j.title and x.c = j.company
where p.name = 'Digital Marketing Technologist';

-- Link education to presets with simple ordering
with ranked_edu as (
  select id as education_id, row_number() over (order by start_date desc) - 1 as pos
  from public.education
)
insert into public.preset_education (id, preset_id, education_id, enabled, position)
select gen_random_uuid(), p.id, e.education_id,
  true as enabled,
  e.pos
from public.presets p cross join ranked_edu e;

-- Link certificates to presets with simple ordering
with ranked_cert as (
  select id as certificate_id, row_number() over (order by name asc) - 1 as pos
  from public.certificates
)
insert into public.preset_certificates (id, preset_id, certificate_id, enabled, position)
select gen_random_uuid(), p.id, c.certificate_id,
  true as enabled,
  c.pos
from public.presets p cross join ranked_cert c;

-- Link all skills to all presets (enabled)
insert into public.preset_skills (id, preset_id, skill_id, enabled)
select gen_random_uuid(), p.id, s.id, true
from public.presets p
join public.skills s on true;

-- Link projects into each preset with positions (all enabled)
with p as (
  select id, name from public.presets
), proj as (
  select id, name, row_number() over (order by name asc) - 1 as pos from public.projects
)
insert into public.preset_projects (id, preset_id, project_id, enabled, position)
select gen_random_uuid(), p.id, proj.id,
  true as enabled,
  proj.pos
from p cross join proj;
