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
select gen_random_uuid(), 'Lakehead University', 'Bachelor of Science - BS', 'Computer Science', loc.id, date '2018-01-01', date '2025-12-31' from loc
union all
select gen_random_uuid(), 'Confederation College', 'Electronics Technologist Diploma', 'Electrical and Electronics Engineering', loc.id, date '2009-01-01', date '2014-12-31' from loc
union all
select gen_random_uuid(), 'WISDOM Home Schooling', 'High School', 'High School/Secondary Diploma', loc.id, date '2009-01-01', date '2009-12-31' from loc;
