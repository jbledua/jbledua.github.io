-- Projects seed

-- Seed projects from ProjectsPage.jsx links
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
select gen_random_uuid(), title, github_url from to_insert
on conflict do nothing;
