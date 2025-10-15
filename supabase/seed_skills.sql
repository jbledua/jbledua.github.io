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
  (gen_random_uuid(), 'GitHub Actions')
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
  select 'Frameworks', 'React', 0 union all
  select 'Frameworks', 'Node.js', 1 union all
  select 'Frameworks', 'MUI', 2 union all
  select 'Tools', 'Git/GitHub', 0 union all
  select 'Tools', 'Docker', 1 union all
  select 'Tools', 'GitHub Actions', 2
)
insert into public.skill_group_skills (skill_group_id, skill_id, position)
select g.id, s.id, map.pos
from map
join g on g.name = map.group_name
join s on s.name = map.skill_name
on conflict (skill_group_id, skill_id) do nothing;
