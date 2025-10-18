-- Seed_Projects.sql
-- Projects seed (new schema uses description_id + project_skills bridge)

-- Seed projects from ProjectsPage.jsx links (idempotent by title)
with to_insert(title, github_url) as (
  values
    ('Project-Compose-Pantry', 'https://github.com/jbledua/Project-Compose-Pantry'),
    ('Project-Compose-Workflow', 'https://github.com/jbledua/Project-Compose-Workflow'),
    ('Project-Compose-Bifrost', 'https://github.com/jbledua/Project-Compose-Bifrost'),
    ('Project-Horizon', 'https://github.com/jbledua/Project-Horizon'),
    ('Ciphertext', 'https://github.com/jbledua/Ciphertext'),
    ('Project-Guidance', 'https://github.com/jbledua/Project-Guidance')
)
insert into public.projects (id, title, github_url)
select gen_random_uuid(), t.title, t.github_url
from to_insert t
where not exists (select 1 from public.projects p where p.title = t.title);

-- Add descriptions via descriptions table and link with description_id
with existing as (
  select p.description_id as id from public.projects p where p.title = 'Project-Compose-Pantry' and p.description_id is not null
), ins as (
  insert into public.descriptions (id, paragraphs, bullets)
  select gen_random_uuid(), array['Docker Compose File for Mealie with Tailscale Backup Connection'], '{}'
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
update public.projects set description_id = d.id
from d
where title = 'Project-Compose-Pantry' and description_id is null;

with existing as (
  select p.description_id as id from public.projects p where p.title = 'Project-Compose-Workflow' and p.description_id is not null
), ins as (
  insert into public.descriptions (id, paragraphs, bullets)
  select gen_random_uuid(), array['Docker Compose File for n8n with Tailscale Backup Connection'], '{}'
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
update public.projects set description_id = d.id
from d
where title = 'Project-Compose-Workflow' and description_id is null;

with existing as (
  select p.description_id as id from public.projects p where p.title = 'Project-Compose-Bifrost' and p.description_id is not null
), ins as (
  insert into public.descriptions (id, paragraphs, bullets)
  select gen_random_uuid(), array['Docker Compose File for RustDesk Web Server and RustDesk Relay Server'], '{}'
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
update public.projects set description_id = d.id
from d
where title = 'Project-Compose-Bifrost' and description_id is null;

with existing as (
  select p.description_id as id from public.projects p where p.title = 'Project-Horizon' and p.description_id is not null
), ins as (
  insert into public.descriptions (id, paragraphs, bullets)
  select 
    gen_random_uuid(),
    array['Multiplayer jet combat over infinite, procedurally generated terrain using Unity GameObjects, ECS, and DOTS. Host locally, on AWS, or join multiplayer matches.'],
    '{}'
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
update public.projects set description_id = d.id
from d
where title = 'Project-Horizon' and description_id is null;

with existing as (
  select p.description_id as id from public.projects p where p.title = 'Ciphertext' and p.description_id is not null
), ins as (
  insert into public.descriptions (id, paragraphs, bullets)
  select 
    gen_random_uuid(),
    array['The anonymous and private online messaging service that uses end-to-end encryption and self-destructing messages to keep your conversations secure.'],
    '{}'
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
update public.projects set description_id = d.id
from d
where title = 'Ciphertext' and description_id is null;

with existing as (
  select p.description_id as id from public.projects p where p.title = 'Project-Guidance' and p.description_id is not null
), ins as (
  insert into public.descriptions (id, paragraphs, bullets)
  select 
    gen_random_uuid(),
    array['AI-Powered Tech Support Chatbot with an Angular frontend and OpenAI backend'],
    '{}'
  where not exists (select 1 from existing)
  returning id
), d as (
  select id from existing
  union all
  select id from ins
)
update public.projects set description_id = d.id
from d
where title = 'Project-Guidance' and description_id is null;

-- Skills are seeded and grouped in Seed_Skills.sql. This file only maps them to projects.

-- Map project skills with explicit positions (idempotent)
-- Project-Compose-Workflow
with p as (
  select id from public.projects where title = 'Project-Compose-Workflow'
), skill_names(name, position) as (
  values ('Docker',0), ('n8n',1), ('tailscale',2), ('RESTful API',3)
)
insert into public.project_skills (project_id, skill_id, position)
select p.id, s.id, skill_names.position
from p, skill_names
join public.skills s on s.name = skill_names.name
on conflict (project_id, skill_id) do nothing;

-- Project-Compose-Bifrost
with p as (
  select id from public.projects where title = 'Project-Compose-Bifrost'
), skill_names(name, position) as (
  values ('Docker',0), ('rustdesk',1), ('rmm',2), ('AWS EC2',3)
)
insert into public.project_skills (project_id, skill_id, position)
select p.id, s.id, skill_names.position
from p, skill_names
join public.skills s on s.name = skill_names.name
on conflict (project_id, skill_id) do nothing;

-- Project-Horizon
with p as (
  select id from public.projects where title = 'Project-Horizon'
), skill_names(name, position) as (
  values ('Unity',0), ('C#',1), ('ECS',2), ('DOTS',3), ('multiplayer',4), ('AWS',5)
)
insert into public.project_skills (project_id, skill_id, position)
select p.id, s.id, skill_names.position
from p, skill_names
join public.skills s on s.name = skill_names.name
on conflict (project_id, skill_id) do nothing;

-- Ciphertext
with p as (
  select id from public.projects where title = 'Ciphertext'
), skill_names(name, position) as (
  values ('React',0), ('end-to-end encryption',1), ('firebase',2), ('messaging',3)
)
insert into public.project_skills (project_id, skill_id, position)
select p.id, s.id, skill_names.position
from p, skill_names
join public.skills s on s.name = skill_names.name
on conflict (project_id, skill_id) do nothing;

-- Project-Guidance
with p as (
  select id from public.projects where title = 'Project-Guidance'
), skill_names(name, position) as (
  values ('ai',0), ('chatbot',1), ('Angular',2), ('openai',3)
)
insert into public.project_skills (project_id, skill_id, position)
select p.id, s.id, skill_names.position
from p, skill_names
join public.skills s on s.name = skill_names.name
on conflict (project_id, skill_id) do nothing;

-- Set Project-Horizon icons (light/dark)
-- Upsert photos for provided storage paths, then link them to the project.
with dark_photo as (
  insert into public.photos (id, title, file_path, alt)
  values (
    gen_random_uuid(),
    'Project-Horizon Logo (Dark)',
    'photos/projects/Horizon-Logo-Dark.png',
    'Project-Horizon logo (dark)'
  )
  on conflict (file_path) do update set title = excluded.title, alt = excluded.alt
  returning id
), light_photo as (
  insert into public.photos (id, title, file_path, alt)
  values (
    gen_random_uuid(),
    'Project-Horizon Logo (Light)',
    'photos/projects/Horizon-Logo-Light.png',
    'Project-Horizon logo (light)'
  )
  on conflict (file_path) do update set title = excluded.title, alt = excluded.alt
  returning id
), proj as (
  select id from public.projects where title = 'Project-Horizon'
)
update public.projects p
set
  project_icon_dark_id = coalesce(p.project_icon_dark_id, (select id from dark_photo)),
  project_icon_light_id = coalesce(p.project_icon_light_id, (select id from light_photo))
from proj
where p.id = proj.id;
