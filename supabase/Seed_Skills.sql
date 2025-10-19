-- Seed_Skills.sql
-- Skills seed (groups and skills via bridge table)

-- Seed basic groups
insert into public.skill_groups (id, name)
values
    (gen_random_uuid(), 'Languages'),
    (gen_random_uuid(), 'Frameworks'),
    (gen_random_uuid(), 'Tools'),
    (gen_random_uuid(), 'Platforms'),
    (gen_random_uuid(), 'Databases'),
    (gen_random_uuid(), 'Deployment'),
    (gen_random_uuid(), 'IT Support'),
    (gen_random_uuid(), 'Pro A/V')
on conflict (name) do nothing;

-- Seed skills by name
insert into public.skills (id, name)
values
    (gen_random_uuid(), 'C'),
    (gen_random_uuid(), 'TypeScript'),
    (gen_random_uuid(), 'Python'),
    (gen_random_uuid(), 'SQL'),
    (gen_random_uuid(), 'React'),
    (gen_random_uuid(), 'Node.js'),
    (gen_random_uuid(), 'MUI'),
    (gen_random_uuid(), 'Git/GitHub'),
    (gen_random_uuid(), 'Docker'),
    (gen_random_uuid(), 'Docker Compose'),
    (gen_random_uuid(), 'GitHub Actions'),
    (gen_random_uuid(), 'Angular'),
    (gen_random_uuid(), 'Unity'),
    (gen_random_uuid(), 'C#'),
    (gen_random_uuid(), 'C++'),
    (gen_random_uuid(), 'ECS'),
    (gen_random_uuid(), 'DOTS'),
    (gen_random_uuid(), 'n8n'),
    (gen_random_uuid(), 'Qt'),
    (gen_random_uuid(), 'Tailscale'),
    (gen_random_uuid(), 'RustDesk'),
    (gen_random_uuid(), 'RMM'),
    (gen_random_uuid(), 'AWS'),
    (gen_random_uuid(), 'AWS EC2'),
    (gen_random_uuid(), 'Firebase'),
    (gen_random_uuid(), 'OpenAI'),
    (gen_random_uuid(), 'end-to-end encryption'),
    (gen_random_uuid(), 'messaging'),
    (gen_random_uuid(), 'RESTful API'),
    (gen_random_uuid(), 'multiplayer'),
    (gen_random_uuid(), 'AI'),
    (gen_random_uuid(), 'chatbot'),
    (gen_random_uuid(), 'JavaScript'),
    (gen_random_uuid(), 'Supabase'),
    (gen_random_uuid(), 'Shlink'),
    -- New additions
    (gen_random_uuid(), 'Vite'),
    (gen_random_uuid(), 'PostgreSQL'),
    (gen_random_uuid(), 'GitHub Pages'),
    (gen_random_uuid(), 'Traefik'),
    (gen_random_uuid(), 'Nginx'),
    (gen_random_uuid(), 'ESLint'),
    (gen_random_uuid(), 'NoSQL'),
    (gen_random_uuid(), 'MySQL'),
    (gen_random_uuid(), 'Google Cloud'),
    (gen_random_uuid(), 'Microsoft'),
    (gen_random_uuid(), 'Azure'),
    (gen_random_uuid(), 'Microsoft Entra ID'),
    (gen_random_uuid(), 'Intune'),
    (gen_random_uuid(), 'On-prem & Hybrid AD'),
    (gen_random_uuid(), 'Defender EDM'),
    (gen_random_uuid(), 'Kasaya'),
    (gen_random_uuid(), 'Dato RMM'),
    (gen_random_uuid(), 'Microsoft 365'),
    (gen_random_uuid(), 'Google Workspace'),
    (gen_random_uuid(), 'Kubuntu')
    ,(gen_random_uuid(), 'NDI')
    ,(gen_random_uuid(), 'SDI')
    ,(gen_random_uuid(), 'HDBaseT')
    ,(gen_random_uuid(), 'Blackmagic Design')
    ,(gen_random_uuid(), 'BirdDog')
    ,(gen_random_uuid(), 'PTZ')
    ,(gen_random_uuid(), 'ProPresenter')
    ,(gen_random_uuid(), 'vMix')
on conflict (name) do nothing;

-- Map skills into groups with positions
with g as (
    select id, name from public.skill_groups
), s as (
    select id, name from public.skills
), map as (
    -- Languages
    select 'Languages'::text as group_name, 'C'::text as skill_name, 0 as pos union all
    select 'Languages', 'C#', 1 union all
    select 'Languages', 'C++', 2 union all
    select 'Languages', 'Python', 3 union all
    select 'Languages', 'SQL', 4 union all
    select 'Languages', 'TypeScript', 5 union all
    select 'Languages', 'JavaScript', 6 union all
    -- Frameworks
    select 'Frameworks', 'React', 0 union all
    select 'Frameworks', 'Node.js', 1 union all
    select 'Frameworks', 'MUI', 2 union all
    select 'Frameworks', 'Angular', 3 union all
    select 'Frameworks', 'Unity', 4 union all
    select 'Frameworks', 'ECS', 5 union all
    select 'Frameworks', 'DOTS', 6 union all
    select 'Frameworks', 'n8n', 7 union all
    select 'Frameworks', 'Qt', 8 union all
    -- Tools
    select 'Tools', 'Git/GitHub', 0 union all
    select 'Tools', 'Docker', 1 union all
    select 'Tools', 'Docker Compose', 2 union all
    select 'Tools', 'GitHub Actions', 3 union all
    select 'Tools', 'Vite', 4 union all
    select 'Tools', 'ESLint', 5 union all
    select 'Tools', 'Tailscale', 6 union all
    select 'Tools', 'RustDesk', 7 union all
    select 'Tools', 'RMM', 8 union all
    select 'Tools', 'OpenAI', 9 union all
    select 'Tools', 'Shlink', 10 union all
    select 'Tools', 'Traefik', 11 union all
    select 'Tools', 'Nginx', 12 union all
    -- Databases
    select 'Databases', 'PostgreSQL', 0 union all
    select 'Databases', 'MySQL', 1 union all
    select 'Databases', 'NoSQL', 2 union all
    select 'Databases', 'Firebase', 3 union all
    -- Platforms
    select 'Platforms', 'AWS', 0 union all
    select 'Platforms', 'AWS EC2', 1 union all
    select 'Platforms', 'Supabase', 2 union all
    select 'Platforms', 'Google Cloud', 3 union all
    select 'Platforms', 'Azure', 4 union all
    select 'Platforms', 'Microsoft', 5 union all
    select 'Platforms', 'GitHub Pages', 6 union all
    select 'Platforms', 'Google Workspace', 7 union all
    select 'Platforms', 'Kubuntu', 8 union all
    select 'Platforms', 'Microsoft 365', 9 union all
    -- Deployment
    select 'Deployment', 'Traefik', 0 union all
    select 'Deployment', 'Nginx', 1 union all
    select 'Deployment', 'GitHub Pages', 2 union all
    select 'Deployment', 'Docker Compose', 3 union all
    -- IT Support
    select 'IT Support', 'Microsoft Entra ID', 0 union all
    select 'IT Support', 'Intune', 1 union all
    select 'IT Support', 'On-prem & Hybrid AD', 2 union all
    select 'IT Support', 'Defender EDM', 3 union all
    select 'IT Support', 'Kasaya', 4 union all
    select 'IT Support', 'Dato RMM', 5 union all
    select 'IT Support', 'Google Workspace', 6 union all
    select 'IT Support', 'Microsoft 365', 7 union all
    -- Pro A/V
    select 'Pro A/V', 'NDI', 0 union all
    select 'Pro A/V', 'SDI', 1 union all
    select 'Pro A/V', 'HDBaseT', 2 union all
    select 'Pro A/V', 'Blackmagic Design', 3 union all
    select 'Pro A/V', 'BirdDog', 4 union all
    select 'Pro A/V', 'PTZ', 5 union all
    select 'Pro A/V', 'ProPresenter', 6 union all
    select 'Pro A/V', 'vMix', 7
)
insert into public.skill_group_skills (skill_group_id, skill_id, position)
select g.id, s.id, map.pos
from map
join g on g.name = map.group_name
join s on s.name = map.skill_name
on conflict (skill_group_id, skill_id) do nothing;
