-- Seed jobs (real experience)
insert into public.jobs (id, title, role, company, location, start_date, end_date, description, bullets)
values
  -- Owner · Backslash Designs
  (gen_random_uuid(), 'Owner', 'Owner', 'Backslash Designs', 'Thunder Bay, Ontario, Canada', '2024-07-01', null, 'Permanent Part-time · Hybrid', array[]::text[]),

  -- Information Technology Lead · NorthWind Family Ministries
  (gen_random_uuid(), 'Information Technology Lead', 'Information Technology Lead', 'NorthWind Family Ministries', 'Thunder Bay, Ontario, Canada', '2022-09-01', null, 'Permanent Full-time · On-site', array[]::text[]),

  -- Freelance Information Technology Consultant · Freelance
  (gen_random_uuid(), 'Freelance Information Technology Consultant', 'Information Technology Consultant', 'Freelance', 'Thunder Bay, Ontario, Canada', '2022-09-01', '2024-07-01', 'Freelance', array[
    'Provided comprehensive IT consulting services for clients in non-profit, social services, and media sectors.',
    'Addressed end-user and account management tasks in Microsoft M365 for non-profit clients, resolving issues and optimizing performance.',
    'Assisted media clients with live broadcast systems across network infrastructure, video switch software, and audio mixers.',
    'Collaborated with clients to identify needs and deliver customized solutions, ensuring smooth operations and minimal downtime.',
    'Continuously updated technical knowledge to provide effective and current IT solutions.'
  ]),

  -- Level 1 - Remote Support Technician · JIG Technologies Inc
  (gen_random_uuid(), 'Level 1 - Remote Support Technician', 'Remote Support Technician (Level 1)', 'JIG Technologies Inc', 'Toronto, Ontario, Canada', '2020-12-01', '2021-05-01', 'Permanent Full-time', array[
    'Efficiently resolved desktop-related tickets, including troubleshooting servers, connecting displays, addressing email service interruptions, and performing proactive maintenance.',
    'Assisted customers with creation and deletion of employee accounts and computer hardware setup for onboarding and offboarding.',
    'Delivered professional, responsive customer service remotely via phone and email, contributing to customer satisfaction.',
    'Managed 4–5 support tickets simultaneously, meeting a 15-minute response time and 1-day resolution SLA.',
    'Collaborated with team members and supervisors to escalate complex issues for timely resolution.',
    'Continuously updated technical knowledge to provide current IT solutions and follow best practices.',
    'Maintained accurate records of tickets, resolutions, and communications to ensure data integrity.'
  ]),

  -- Summer Intern - Dunlap Institute for Astronomy & Astrophysics · University of Toronto
  (gen_random_uuid(), 'Summer Intern - Dunlap Institute for Astronomy & Astrophysics', 'Summer Intern', 'University of Toronto', 'Canada', '2020-05-01', '2020-08-01', 'Internship', array[
    'Worked on design and testing of a web and mobile app for communicating with a balloon-borne telescope to enhance remote observation capabilities.',
    'Initiated development of a back-end for Linux servers handling auth and messaging service integrations (deployment not completed within internship).',
    'Collaborated with researchers and faculty to incorporate feedback and requirements into development.',
    'Applied web and mobile tech skills to lay foundations for user-friendly, accessible interfaces and optimal UX.',
    'Troubleshot issues during development and testing to improve reliability and functionality.',
    'Maintained documentation of development process, architecture, and user guidelines.',
    'Engaged in regular updates with stakeholders, sharing progress and addressing challenges.'
  ]),

  -- Research Assistant · Lakehead University
  (gen_random_uuid(), 'Research Assistant', 'Research Assistant', 'Lakehead University', 'Canada', '2019-12-01', '2020-02-01', 'Part-time', array[
    'Engaged in research projects focusing on machine learning applications and web development.',
    'Helped design and develop user-friendly, accessible websites for academic and research purposes.',
    'Participated in meetings, providing updates, addressing challenges, and suggesting directions.',
    'Enhanced technical skills in ML and web development via self-learning and training sessions.',
    'Maintained documentation of findings, methodologies, and project progress.'
  ]),

  -- Tent Crew Member/Lead · Equipment World Inc.
  (gen_random_uuid(), 'Tent Crew Member/Lead', 'Tent Crew Member/Lead', 'Equipment World Inc.', 'Thunder Bay', '2018-06-01', '2019-09-01', 'Full-time', array[
    'Led and collaborated with a crew for delivery, setup, and takedown of event tents and equipment.',
    'Conducted maintenance and inspections of tents and equipment to ensure safety and presentation.',
    'Liaised with clients, providing excellent customer service and ensuring satisfaction.',
    'Assisted with inventory organization and management for timely availability.',
    'Worked to meet deadlines, budgets, and standards for successful event execution.',
    'Maintained a clean and safe work environment following company safety procedures.',
    'Participated in training to enhance skills and stay current with best practices.'
  ]),

  -- Salesperson · Best Buy
  (gen_random_uuid(), 'Salesperson', 'Salesperson', 'Best Buy', 'Thunder Bay', '2016-02-01', '2018-06-01', 'Permanent Full-time', array[
    'Assisted clients in the Connected Solutions Department (smart home, A/V, networking) with exceptional service.',
    'Provided expert advice using product knowledge to guide well-informed purchasing decisions.',
    'Led sales consultations, demonstrating features and benefits to maximize satisfaction and sales.',
    'Stayed informed on emerging technologies through regular training and product updates.',
    'Collaborated with team members to meet departmental sales targets.',
    'Managed inventory control, stocking, displays, and supported loss prevention.',
    'Supported store operations including cashiering, merchandising, and maintaining a welcoming environment.'
  ]),

  -- Electrical Draftsman · Nordmin Engineering Ltd.
  (gen_random_uuid(), 'Electrical Draftsman', 'Electrical Draftsman', 'Nordmin Engineering Ltd.', 'Thunder Bay, Ontario, Canada', '2015-02-01', '2016-02-01', 'Permanent Full-time', array[
    'Designed and documented control systems for industrial clients in pulp and paper and mining sectors.',
    'Used AutoCAD and other tools to create accurate, detailed documentation for control systems.',
    'Managed procurement of supplies and prepared quotes for project bids.',
    'Conducted on-site audits to verify progress and ensure on-scope, on-budget, on-time completion.',
    'Collaborated with engineers, PMs, and field personnel for coordinated project activities.',
    'Updated knowledge in electrical drafting and control systems through training and self-learning.',
    'Adhered to guidelines, safety procedures, and industry best practices.'
  ]),

  -- Tent Crew Member · A To Z Rentals
  (gen_random_uuid(), 'Tent Crew Member', 'Tent Crew Member', 'A To Z Rentals', 'Thunder Bay, Ontario', '2014-06-01', '2015-12-01', null, array[
    'Delivered, set up, and took down event tents and equipment for various events.',
    'Performed routine maintenance and inspections to ensure functionality and safety.',
    'Provided customer service by addressing client concerns and inquiries.',
    'Assisted with inventory organization and proper storage of equipment.',
    'Collaborated to meet deadlines, budgets, and company standards for successful events.',
    'Maintained a clean, secure work environment following safety procedures.',
    'Engaged in ongoing training to improve skills and learn new equipment.'
  ]),

  -- System Integrator · AutomationNow
  (gen_random_uuid(), 'System Integrator', 'System Integrator', 'AutomationNow', null, '2012-11-01', '2013-08-01', null, array[
    'Collaborated with a team to pull and terminate cables, integrating with PLCs and HMIs in industrial settings.',
    'Updated temperature and lighting systems for remote stations, adding occupant detection for energy savings.',
    'Digitized old documentation at water treatment and mining sites for improved data accessibility.',
    'Resolved integration issues to improve efficiency and reliability of automated systems.',
    'Maintained clear communication with team members and supervisors to enable efficient task completion.',
    'Followed safety procedures to ensure a secure work environment.',
    'Enhanced skills in system integration and automation through on-the-job learning.'
  ]),

  -- Electrical Technician · Interior Electrical Automation Inc.
  (gen_random_uuid(), 'Electrical Technician', 'Electrical Technician', 'Interior Electrical Automation Inc.', 'Vanderhoof, British Columbia', '2012-06-01', '2012-08-01', 'Contract Full-time', array[
    'Maintained automated block sorting processes for a forestry client to ensure optimal performance.',
    'Pulled/terminated cables and installed transformers and MCCs in industrial environments.',
    'Partnered with electricians to install, test, and troubleshoot residential electrical systems per code.',
    'Identified and resolved issues in residential and industrial electrical systems.',
    'Communicated clearly with team members and supervisors for efficient task completion.',
    'Followed safety procedures to minimize risk of accidents and damages.',
    'Enhanced technical knowledge of electrical systems through on-the-job learning.'
  ]);

-- Create job variants (generic alternative phrasing)
insert into public.job_variants (id, job_id, variant_index, title, bullets)
select gen_random_uuid(), j.id, 0,
  (coalesce(j.role, j.title) || ' · ' || j.company),
  coalesce(j.bullets, '{}')
from public.jobs j;

insert into public.job_variants (id, job_id, variant_index, title, bullets)
select gen_random_uuid(), j.id, 1,
  (j.company || ' — ' || coalesce(j.role, j.title)),
  coalesce(j.bullets, '{}')
from public.jobs j;

-- Seed example education
insert into public.education (id, school, degree, field_of_study, location, start_date, end_date, description, bullets)
values
  (gen_random_uuid(), 'Lakehead University', 'BSc (incomplete)', 'Computer Science', 'Thunder Bay, Ontario, Canada', '2019-09-01', '2020-08-01', 'Undergraduate studies', array[]::text[]),
  (gen_random_uuid(), 'Confederation College', 'Ontario College Diploma (incomplete)', 'Electronics Engineering Technology', 'Thunder Bay, Ontario, Canada', '2011-09-01', '2012-04-01', 'Diploma program', array[]::text[]);

-- Link education to presets with simple ordering
with ranked_edu as (
  select id as education_id, row_number() over (order by start_date desc) - 1 as pos
  from public.education
)
insert into public.preset_education (id, preset_id, education_id, enabled, position)
select gen_random_uuid(), p.id, e.education_id,
  true as enabled,
  e.pos
from public.presets p cross join ranked_edu e;

-- Seed example certificates
insert into public.certificates (id, name, issuer, issue_date, expiration_date, credential_id, credential_url, description, tags)
values
  (gen_random_uuid(), 'Google IT Support Professional Certificate', 'Coursera', '2020-06-01', null, null, null, 'Foundational IT support concepts', array['IT','Support']),
  (gen_random_uuid(), 'AWS Cloud Practitioner (practice)', 'Self-study', '2024-01-01', null, null, null, 'Self-study track', array['Cloud','AWS']);

-- Link certificates to presets with simple ordering
with ranked_cert as (
  select id as certificate_id, row_number() over (order by name asc) - 1 as pos
  from public.certificates
)
insert into public.preset_certificates (id, preset_id, certificate_id, enabled, position)
select gen_random_uuid(), p.id, c.certificate_id,
  true as enabled,
  c.pos
from public.presets p cross join ranked_cert c;

-- Create two presets mirroring PRESET_V1 and PRESET_V2
insert into public.presets (id, name, include_photo, summary_variant)
values
  (gen_random_uuid(), 'Version 1', true, 0),
  (gen_random_uuid(), 'Version 2', false, 1);

-- Link jobs to presets (example: first two enabled in V1; all except intern in V2)
-- For simplicity, order by start_date desc and assign positions 0..n
with ranked as (
  select id as job_id, row_number() over (order by start_date desc) - 1 as pos
  from public.jobs
)
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, r.job_id,
  case p.name when 'Version 1' then (r.pos < 2) else (r.pos <> 2) end as enabled,
  case p.name when 'Version 1' then 0 else 1 end as selected_variant,
  r.pos
from public.presets p cross join ranked r;

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

-- Enable/disable skills per preset similarly to code presets
insert into public.preset_skills (id, preset_id, skill_id, enabled)
select gen_random_uuid(), p.id, s.id,
  case when p.name = 'Version 1' then (s.label <> 'Docker') else (s.label = 'GitHub Actions') end as enabled
from public.presets p
join public.skills s on true;

-- Seed projects from ProjectsPage.jsx links
with to_insert(name, github_url) as (
  values
    ('Project-Compose-Pantry', 'https://github.com/jbledua/Project-Compose-Pantry'),
    ('Project-Compose-Workflow', 'https://github.com/jbledua/Project-Compose-Workflow'),
    ('Project-Compose-Bifrost', 'https://github.com/jbledua/Project-Compose-Bifrost'),
    ('Project-Horizon', 'https://github.com/jbledua/Project-Horizon'),
    ('Ciphertext', 'https://github.com/jbledua/Ciphertext'),
    ('Project-Guidance', 'https://github.com/jbledua/Project-Guidance')
)
insert into public.projects (id, name, slug, github_url)
select gen_random_uuid(), name, lower(replace(name, ' ', '-')), github_url from to_insert;

-- Link first few projects into each preset with positions
with p as (
  select id, name from public.presets
), proj as (
  select id, name, row_number() over (order by name asc) - 1 as pos from public.projects
)
insert into public.preset_projects (id, preset_id, project_id, enabled, position)
select gen_random_uuid(), p.id, proj.id,
  case when p.name = 'Version 1' then (proj.pos < 3) else (proj.pos < 4) end as enabled,
  proj.pos
from p cross join proj;
