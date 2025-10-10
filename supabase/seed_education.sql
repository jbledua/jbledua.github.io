-- Education seed
insert into public.education (id, school, degree, field_of_study, location, start_date, end_date, description, bullets)
values
  (gen_random_uuid(), 'Lakehead University', 'Bachelor of Science - BS', 'Computer Science', null, '2018-01-01', '2025-12-31', 'Undergraduate studies', array[]::text[]),
  (gen_random_uuid(), 'Confederation College', 'Electronics Technologist Diploma', 'Electrical and Electronics Engineering', null, '2009-01-01', '2014-12-31', 'Diploma program', array[]::text[]),
  (gen_random_uuid(), 'WISDOM Home Schooling', 'High School', 'High School/Secondary Diploma', null, '2009-01-01', '2009-12-31', 'High school diploma', array[]::text[]);
