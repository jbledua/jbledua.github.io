
-- Seed data for certificates table
insert into public.certificates (id, name, issuer, issue_date, expiry_date, credential_id, credential_url)
values
  (gen_random_uuid(), 'Aerial Work Platforms - Scissor & Boom Lift', 'FSN Safety Training', '2021-07-01', null, null, null),
  (gen_random_uuid(), 'Working at Heights', 'Workers Health & Safety Centre', '2021-07-01', '2024-07-01', null, null),
  (gen_random_uuid(), 'Forklift Operator - Sit Down Counter Balance', 'Equipment World Inc.', '2019-04-01', '2021-04-01', null, null),
  (gen_random_uuid(), 'Cisco Industrial Networking Specialist', 'Cisco', '2016-01-01', '2018-01-01', null, null);
