-- Seed_Skills.sql
-- Skills seed (groups and skills via bridge table)

-- Seed basic groups
insert into public.skill_groups (id, name)
values
  (gen_random_uuid(), 'Languages'),
  (gen_random_uuid(), 'Frameworks'),
  (gen_random_uuid(), 'Tools')
on conflict (name) do nothing;

-- Seed skills by name
insert into public.skills (id, name)
values
  (gen_random_uuid(), 'TypeScript'),
  (gen_random_uuid(), 'Python'),
  (gen_random_uuid(), 'SQL'),
  (gen_random_uuid(), 'React'),
  (gen_random_uuid(), 'Node.js'),
  (gen_random_uuid(), 'MUI'),
  (gen_random_uuid(), 'Git/GitHub'),
  (gen_random_uuid(), 'Docker'),
  (gen_random_uuid(), 'GitHub Actions'),
  -- Project-related skills to avoid later duplication
  (gen_random_uuid(), 'Angular'),
  (gen_random_uuid(), 'Unity'),
  (gen_random_uuid(), 'C#'),
  (gen_random_uuid(), 'ECS'),
  (gen_random_uuid(), 'DOTS'),
  (gen_random_uuid(), 'n8n'),
  (gen_random_uuid(), 'tailscale'),
  (gen_random_uuid(), 'rustdesk'),
  (gen_random_uuid(), 'rmm'),
  (gen_random_uuid(), 'AWS'),
  (gen_random_uuid(), 'AWS EC2'),
  (gen_random_uuid(), 'firebase'),
  (gen_random_uuid(), 'openai'),
  (gen_random_uuid(), 'end-to-end encryption'),
  (gen_random_uuid(), 'messaging'),
  (gen_random_uuid(), 'RESTful API'),
  (gen_random_uuid(), 'multiplayer'),
  (gen_random_uuid(), 'ai'),
  (gen_random_uuid(), 'chatbot')
on conflict (name) do nothing;

-- Map skills into groups with positions
with g as (
  select id, name from public.skill_groups
), s as (
  select id, name from public.skills
), map as (
  select 'Languages'::text as group_name, 'TypeScript'::text as skill_name, 0 as pos union all
  select 'Languages', 'Python', 1 union all
  select 'Languages', 'SQL', 2 union all
  select 'Languages', 'C#', 3 union all
  select 'Frameworks', 'React', 0 union all
  select 'Frameworks', 'Node.js', 1 union all
  select 'Frameworks', 'MUI', 2 union all
  select 'Frameworks', 'Angular', 3 union all
  select 'Frameworks', 'Unity', 4 union all
  select 'Frameworks', 'ECS', 5 union all
  select 'Frameworks', 'DOTS', 6 union all
  select 'Frameworks', 'n8n', 7 union all
  select 'Tools', 'Git/GitHub', 0 union all
  select 'Tools', 'Docker', 1 union all
  select 'Tools', 'GitHub Actions', 2 union all
  select 'Tools', 'AWS', 3 union all
  select 'Tools', 'AWS EC2', 4 union all
  select 'Tools', 'tailscale', 5 union all
  select 'Tools', 'rustdesk', 6 union all
  select 'Tools', 'rmm', 7 union all
  select 'Tools', 'firebase', 8 union all
  select 'Tools', 'openai', 9
)
insert into public.skill_group_skills (skill_group_id, skill_id, position)
select g.id, s.id, map.pos
from map
join g on g.name = map.group_name
join s on s.name = map.skill_name
on conflict (skill_group_id, skill_id) do nothing;
