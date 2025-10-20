-- Seed_Education.sql

-- Ensure a default location exists
insert into public.locations (id, country, region, city)
values (gen_random_uuid(), 'Canada', 'Ontario', 'Thunder Bay')
on conflict do nothing;

-- Pick any one location id for seeding (simplification)
with loc as (
  select id from public.locations order by created_at asc limit 1
)
insert into public.education (id, school, degree, major, location_id, start_date, end_date)
select gen_random_uuid(), 'Lakehead University', 'Honours Bachelor of Science - HBSc', 'Computer Science', loc.id, date '2018-01-01', date '2025-12-31' from loc
union all
select gen_random_uuid(), 'Confederation College', 'Electronics Technologist Diploma', 'Electrical and Electronics Engineering', loc.id, date '2009-01-01', date '2014-12-31' from loc
union all
select gen_random_uuid(), 'WISDOM Home Schooling', 'High School', 'High School/Secondary Diploma', loc.id, date '2009-01-01', date '2009-12-31' from loc;

-- Map related skills to education entries (ordered), idempotent
with edu as (
  select id, school
  from public.education
  where school in ('Lakehead University','Confederation College')
), s as (
  select id, name from public.skills
), map as (
  -- Lakehead University (Computer Science)
  select 'Lakehead University'::text as school, 'TypeScript'::text as skill, 0 as pos union all
  select 'Lakehead University', 'JavaScript', 1 union all
  select 'Lakehead University', 'Python', 2 union all
  select 'Lakehead University', 'SQL', 3 union all
  select 'Lakehead University', 'React', 4 union all
  select 'Lakehead University', 'Node.js', 5 union all
  select 'Lakehead University', 'Vite', 6 union all
  select 'Lakehead University', 'PostgreSQL', 7 union all
  select 'Lakehead University', 'Supabase', 8 union all
  select 'Lakehead University', 'Git/GitHub', 9 union all
  select 'Lakehead University', 'C', 10 union all
  select 'Lakehead University', 'C++', 11
  -- Confederation College (Electronics)
  union all select 'Confederation College', 'C', 0 union all
  select 'Confederation College', 'C++', 1 union all
  select 'Confederation College', 'JavaScript', 2 union all
  select 'Confederation College', 'Git/GitHub', 4
)
insert into public.education_skills (education_id, skill_id, position)
select e.id, s.id, map.pos
from map
join edu e on e.school = map.school
join s on s.name = map.skill
on conflict (education_id, skill_id) do nothing;
