-- Skills seed (groups and skills only)

-- Optional: seed basic skills to reflect BASE_DATA
insert into public.skill_groups (id, name, position) values
  (gen_random_uuid(), 'Languages', 0),
  (gen_random_uuid(), 'Frameworks', 1),
  (gen_random_uuid(), 'Tools', 2);

-- Capture group ids
with groups as (
  select id, name from public.skill_groups
)
insert into public.skills (id, group_id, label, position)
select gen_random_uuid(), g.id, label, pos from (
  values
    ('Languages', 'TypeScript', 0),
    ('Languages', 'Python', 1),
    ('Languages', 'SQL', 2),
    ('Frameworks', 'React', 0),
    ('Frameworks', 'Node.js', 1),
    ('Frameworks', 'MUI', 2),
    ('Tools', 'Git/GitHub', 0),
    ('Tools', 'Docker', 1),
    ('Tools', 'GitHub Actions', 2)
) s(group_name, label, pos)
join groups g on g.name = s.group_name;
