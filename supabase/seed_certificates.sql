-- Certificates seed

-- Remove previous example rows if they exist
delete from public.preset_certificates
where certificate_id in (
  select id from public.certificates
  where name in ('Google IT Support Professional Certificate','AWS Cloud Practitioner (practice)')
);

delete from public.certificates
where name in ('Google IT Support Professional Certificate','AWS Cloud Practitioner (practice)');

insert into public.certificates (id, name, issuer, issue_date, expiration_date, credential_id, credential_url, description, tags)
values
  (gen_random_uuid(), 'Aerial Work Platforms - Scissor & Boom Lift', 'FSN Safety Training', '2021-07-01', null, null, null, null, array[]::text[]),
  (gen_random_uuid(), 'Working at Heights', 'Workers Health & Safety Centre', '2021-07-01', '2024-07-01', null, null, null, array[]::text[]),
  (gen_random_uuid(), 'Forklift Operator - Sit Down Counter Balance', 'Equipment World Inc.', '2019-04-01', '2021-04-01', null, null, null, array[]::text[]),
  (gen_random_uuid(), 'Cisco Industrial Networking Specialist', 'Cisco', '2016-01-01', '2018-01-01', null, null, null, array[]::text[]);
