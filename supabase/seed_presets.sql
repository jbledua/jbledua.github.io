-- Seed jobs (real experience)
insert into public.jobs (id, title, role, company, location, start_date, end_date, description, employment_type, bullets)
values
  -- Owner · Backslash Designs
  (gen_random_uuid(), 'Owner', 'Owner', 'Backslash Designs', 'Thunder Bay, Ontario, Canada', '2024-07-01', null, 'Owner of a boutique tech studio delivering managed IT, DevOps, and full‑stack projects for SMBs and non-profits.', 'Part-time', array[
    'Standardized device provisioning and compliance with Intune/Autopilot; documented DR with Synology backups.',
    'Containerized services behind Tailscale; built CI/CD with GitHub Actions for static sites and infrastructure repos.',
    'Designed Supabase schemas and secure APIs; built React/MUI front ends for marketing and internal tools.',
    'Automated email onboarding and nurture flows with Power Automate and n8n; produced responsive HTML templates.'
  ]),

  -- Information Technology Lead · NorthWind Family Ministries
  (gen_random_uuid(), 'Information Technology Lead', 'Information Technology Lead', 'NorthWind Family Ministries', 'Thunder Bay, Ontario, Canada', '2022-09-01', null, 'Owned reliability, security, and collaboration tooling across a Microsoft 365/Entra ID environment.', 'Full-time', array[
    'Administered Entra ID, Exchange Online, SharePoint/Teams, and Intune (Windows/iOS) with baseline and Conditional Access policies.',
    'Hardened endpoints with Defender/EDR; deployed phishing protections and privileged access reviews.',
    'Implemented data retention, backup, and recovery playbooks with documented RTO/RPO.',
    'Consolidated Teams/SharePoint information architecture to reduce sprawl and improve permissions hygiene.',
    'Provided SLA-driven support and clear communications; authored SOPs and reusable runbooks.'
  ]),

  -- Freelance Information Technology Consultant · Freelance
  (gen_random_uuid(), 'Freelance Information Technology Consultant', 'Information Technology Consultant', 'Freelance', 'Thunder Bay, Ontario, Canada', '2022-09-01', '2024-07-01', 'Freelance', 'Freelance', array[
    'Provided comprehensive IT consulting services for clients in non-profit, social services, and media sectors.',
    'Addressed end-user and account management tasks in Microsoft M365 for non-profit clients, resolving issues and optimizing performance.',
    'Assisted media clients with live broadcast systems across network infrastructure, video switch software, and audio mixers.',
    'Collaborated with clients to identify needs and deliver customized solutions, ensuring smooth operations and minimal downtime.',
    'Continuously updated technical knowledge to provide effective and current IT solutions.'
  ]),

  -- Level 1 - Remote Support Technician · JIG Technologies Inc
  (gen_random_uuid(), 'Level 1 - Remote Support Technician', 'Remote Support Technician (Level 1)', 'JIG Technologies Inc', 'Toronto, Ontario, Canada', '2020-12-01', '2021-05-01', 'Permanent Full-time', 'Full-time', array[
    'Efficiently resolved desktop-related tickets, including troubleshooting servers, connecting displays, addressing email service interruptions, and performing proactive maintenance.',
    'Assisted customers with creation and deletion of employee accounts and computer hardware setup for onboarding and offboarding.',
    'Delivered professional, responsive customer service remotely via phone and email, contributing to customer satisfaction.',
    'Managed 4–5 support tickets simultaneously, meeting a 15-minute response time and 1-day resolution SLA.',
    'Collaborated with team members and supervisors to escalate complex issues for timely resolution.',
    'Continuously updated technical knowledge to provide current IT solutions and follow best practices.',
    'Maintained accurate records of tickets, resolutions, and communications to ensure data integrity.'
  ]),

  -- Summer Intern - Dunlap Institute for Astronomy & Astrophysics · University of Toronto
  (gen_random_uuid(), 'Summer Intern - Dunlap Institute for Astronomy & Astrophysics', 'Summer Intern', 'University of Toronto', 'Canada', '2020-05-01', '2020-08-01', 'Internship', 'Internship', array[
    'Worked on design and testing of a web and mobile app for communicating with a balloon-borne telescope to enhance remote observation capabilities.',
    'Initiated development of a back-end for Linux servers handling auth and messaging service integrations (deployment not completed within internship).',
    'Collaborated with researchers and faculty to incorporate feedback and requirements into development.',
    'Applied web and mobile tech skills to lay foundations for user-friendly, accessible interfaces and optimal UX.',
    'Troubleshot issues during development and testing to improve reliability and functionality.',
    'Maintained documentation of development process, architecture, and user guidelines.',
    'Engaged in regular updates with stakeholders, sharing progress and addressing challenges.'
  ]),

  -- Research Assistant · Lakehead University
  (gen_random_uuid(), 'Research Assistant', 'Research Assistant', 'Lakehead University', 'Canada', '2019-12-01', '2020-02-01', 'Part-time', 'Part-time', array[
    'Engaged in research projects focusing on machine learning applications and web development.',
    'Helped design and develop user-friendly, accessible websites for academic and research purposes.',
    'Participated in meetings, providing updates, addressing challenges, and suggesting directions.',
    'Enhanced technical skills in ML and web development via self-learning and training sessions.',
    'Maintained documentation of findings, methodologies, and project progress.'
  ]),

  -- Tent Crew Member/Lead · Equipment World Inc.
  (gen_random_uuid(), 'Tent Crew Member/Lead', 'Tent Crew Member/Lead', 'Equipment World Inc.', 'Thunder Bay', '2018-06-01', '2019-09-01', 'Full-time', 'Full-time', array[
    'Led and collaborated with a crew for delivery, setup, and takedown of event tents and equipment.',
    'Conducted maintenance and inspections of tents and equipment to ensure safety and presentation.',
    'Liaised with clients, providing excellent customer service and ensuring satisfaction.',
    'Assisted with inventory organization and management for timely availability.',
    'Worked to meet deadlines, budgets, and standards for successful event execution.',
    'Maintained a clean and safe work environment following company safety procedures.',
    'Participated in training to enhance skills and stay current with best practices.'
  ]),

  -- Salesperson · Best Buy
  (gen_random_uuid(), 'Salesperson', 'Salesperson', 'Best Buy', 'Thunder Bay', '2016-02-01', '2018-06-01', 'Permanent Full-time', 'Full-time', array[
    'Assisted clients in the Connected Solutions Department (smart home, A/V, networking) with exceptional service.',
    'Provided expert advice using product knowledge to guide well-informed purchasing decisions.',
    'Led sales consultations, demonstrating features and benefits to maximize satisfaction and sales.',
    'Stayed informed on emerging technologies through regular training and product updates.',
    'Collaborated with team members to meet departmental sales targets.',
    'Managed inventory control, stocking, displays, and supported loss prevention.',
    'Supported store operations including cashiering, merchandising, and maintaining a welcoming environment.'
  ]),

  -- Electrical Draftsman · Nordmin Engineering Ltd.
  (gen_random_uuid(), 'Electrical Draftsman', 'Electrical Draftsman', 'Nordmin Engineering Ltd.', 'Thunder Bay, Ontario, Canada', '2015-02-01', '2016-02-01', 'Permanent Full-time', 'Full-time', array[
    'Designed and documented control systems for industrial clients in pulp and paper and mining sectors.',
    'Used AutoCAD and other tools to create accurate, detailed documentation for control systems.',
    'Managed procurement of supplies and prepared quotes for project bids.',
    'Conducted on-site audits to verify progress and ensure on-scope, on-budget, on-time completion.',
    'Collaborated with engineers, PMs, and field personnel for coordinated project activities.',
    'Updated knowledge in electrical drafting and control systems through training and self-learning.',
    'Adhered to guidelines, safety procedures, and industry best practices.'
  ]),

  -- Tent Crew Member · A To Z Rentals
  (gen_random_uuid(), 'Tent Crew Member', 'Tent Crew Member', 'A To Z Rentals', 'Thunder Bay, Ontario', '2014-06-01', '2015-12-01', null, 'Part-time', array[
    'Delivered, set up, and took down event tents and equipment for various events.',
    'Performed routine maintenance and inspections to ensure functionality and safety.',
    'Provided customer service by addressing client concerns and inquiries.',
    'Assisted with inventory organization and proper storage of equipment.',
    'Collaborated to meet deadlines, budgets, and company standards for successful events.',
    'Maintained a clean, secure work environment following safety procedures.',
    'Engaged in ongoing training to improve skills and learn new equipment.'
  ]),

  -- System Integrator · AutomationNow
  (gen_random_uuid(), 'System Integrator', 'System Integrator', 'AutomationNow', 'Thunder Bay, Ontario', '2012-11-01', '2013-08-01', null, 'Contract', array[
    'Collaborated with a team to pull and terminate cables, integrating with PLCs and HMIs in industrial settings.',
    'Updated temperature and lighting systems for remote stations, adding occupant detection for energy savings.',
    'Digitized old documentation at water treatment and mining sites for improved data accessibility.',
    'Resolved integration issues to improve efficiency and reliability of automated systems.',
    'Maintained clear communication with team members and supervisors to enable efficient task completion.',
    'Followed safety procedures to ensure a secure work environment.',
    'Enhanced skills in system integration and automation through on-the-job learning.'
  ]),

  -- Electrical Technician · Interior Electrical Automation Inc.
  (gen_random_uuid(), 'Electrical Technician', 'Electrical Technician', 'Interior Electrical Automation Inc.', 'Vanderhoof, British Columbia', '2012-06-01', '2012-08-01', 'Contract Full-time', 'Contract', array[
    'Maintained automated block sorting processes for a forestry client to ensure optimal performance.',
    'Pulled/terminated cables and installed transformers and MCCs in industrial environments.',
    'Partnered with electricians to install, test, and troubleshoot residential electrical systems per code.',
    'Identified and resolved issues in residential and industrial electrical systems.',
    'Communicated clearly with team members and supervisors for efficient task completion.',
    'Followed safety procedures to minimize risk of accidents and damages.',
    'Enhanced technical knowledge of electrical systems through on-the-job learning.'
  ]);

-- Create job variants (generic alternative phrasing)
insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 0,
  (coalesce(j.role, j.title) || ' · ' || j.company),
  j.description,
  coalesce(j.bullets, '{}')
from public.jobs j;

insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 1,
  (j.company || ' — ' || coalesce(j.role, j.title)),
  j.description,
  coalesce(j.bullets, '{}')
from public.jobs j;

-- =========================================
-- ROLE VARIANT INDEXES
-- 10 = IT Systems Administrator
-- 11 = DevOps Engineer
-- 12 = Full-Stack Developer
-- 13 = Game Systems Engineer
-- 14 = Digital Marketing Technologist
-- =========================================

-- -------------- IT SYSTEMS ADMINISTRATOR (10)
insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 10,
  'IT Systems Administrator · NorthWind Family Ministries',
  'Owned day-to-day reliability and security of a Microsoft-first environment across users, devices, data, and identity.',
  array[
    'Administered Microsoft 365/Entra ID, Exchange Online, SharePoint/Teams, Intune (Windows/iOS) with baseline policies and CA.',
    'Hardened endpoints with Defender + EDR; implemented phishing protections (Inky) and access reviews for privileged roles.',
    'Designed backup/retention and recovery workflows for Microsoft cloud data; documented RTO/RPO and playbooks.',
    'Consolidated Teams/SharePoint information architecture; reduced sprawl and improved findability and permissions hygiene.',
    'Delivered SLA-driven support, ticket triage, and clear comms to non-technical staff; wrote reusable SOPs and runbooks.'
  ]
from public.jobs j
where j.title = 'Information Technology Lead' and j.company = 'NorthWind Family Ministries'
limit 1;

insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 10,
  'IT Systems Administrator (Owner) · Backslash Designs',
  'Provided managed IT for SMB/non-profit clients with a focus on reliability, security, and cost-effective tooling.',
  array[
    'Standardized device provisioning and compliance using Intune templates and Autopilot; minimized hands-on setup.',
    'Implemented Synology-based storage/backup and camera systems; documented DR procedures and offsite replication.',
    'Built self-service guides and onboarding email automation with Power Automate to reduce ticket volume.',
    'Introduced ticket SLAs and root-cause notes to convert ad-hoc fixes into process improvements.'
  ]
from public.jobs j
where j.title = 'Owner' and j.company = 'Backslash Designs'
limit 1;

insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 10,
  'IT Systems Administrator (Consultant) · Freelance',
  'Delivered hands-on admin and advisory services to organizations modernizing into Microsoft cloud.',
  array[
    'Migrated users and files to M365; configured identity, MFA, Conditional Access, and secure sharing patterns.',
    'Implemented email security (DKIM/DMARC), guest access policies, and least-privilege file permissions.',
    'Trained staff on secure collaboration in OneDrive/Teams; reduced “shadow IT” and orphaned links.'
  ]
from public.jobs j
where j.title = 'Freelance Information Technology Consultant' and j.company = 'Freelance'
limit 1;

-- -------------- DEVOPS (11)
insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 11,
  'DevOps Engineer (Owner) · Backslash Designs',
  'Containerized services and automated delivery across on-prem (Synology/Proxmox) and AWS.',
  array[
    'Deployed Dockerized stacks behind Tailscale overlay; standardized compose templates and .env patterns.',
    'Built CI/CD with GitHub Actions for static sites and infra repos; enforced branch protections and code reviews.',
    'Provisioned AWS EC2 and S3 for hosted services; scripted maintenance, backups, and zero-downtime migrations.',
    'Instrumented uptime checks and logs; documented SRE runbooks for rollback and incident response.'
  ]
from public.jobs j
where j.title = 'Owner' and j.company = 'Backslash Designs'
limit 1;

insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 11,
  'DevOps Engineer · NorthWind Family Ministries',
  'Brought DevOps practices to internal IT and media systems for reproducibility and scale.',
  array[
    'Introduced Git-based configuration and versioned change logs for network and server maintainability.',
    'Containerized internal tools; applied least-privilege networking and secrets management best practices.',
    'Automated backups, health checks, and routine tasks to cut manual toil and reduce risk.'
  ]
from public.jobs j
where j.title = 'Information Technology Lead' and j.company = 'NorthWind Family Ministries'
limit 1;

-- -------------- FULL-STACK (12)
insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 12,
  'Full-Stack Developer (React/Node) · Backslash Designs',
  'Built marketing and internal apps with React + MUI front ends and Node/Supabase back ends.',
  array[
    'Developed GitHub Pages React site with content sourced from Markdown/JSON; added theme and accessibility.',
    'Designed Supabase schemas (posts, tags, presets) and RLS for public read/private write.',
    'Integrated OAuth/Entra ID where relevant; implemented clean API boundaries and input validation.',
    'Created email templates and webhooks for onboarding flows with Power Automate and n8n.'
  ]
from public.jobs j
where j.title = 'Owner' and j.company = 'Backslash Designs'
limit 1;

insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 12,
  'Full-Stack Developer (Intern) · University of Toronto — Dunlap Institute',
  'Prototyped web/mobile tools for a balloon-borne telescope program.',
  array[
    'Implemented UI flows for remote command/telemetry; collaborated with researchers on requirements.',
    'Stood up a Linux back end for auth/messaging integrations; documented architecture and testing.'
  ]
from public.jobs j
where j.title = 'Summer Intern - Dunlap Institute for Astronomy & Astrophysics'
  and j.company = 'University of Toronto'
limit 1;

insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 12,
  'Full-Stack Developer (Research Assistant) · Lakehead University',
  'Supported ML/web research projects and built accessible academic websites.',
  array[
    'Delivered small web apps and content sites; emphasized readability and performance.',
    'Maintained research documentation and iterative prototypes with stakeholder feedback.'
  ]
from public.jobs j
where j.title = 'Research Assistant' and j.company = 'Lakehead University'
limit 1;

-- -------------- GAME SYSTEMS (13)
insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 13,
  'Game Systems Engineer (Unity DOTS/ECS) · Backslash Designs',
  'Prototyped server-authoritative multiplayer systems and world generation.',
  array[
    'Explored Unity DOTS/ECS with prediction/rollback; focused on secure, server-authoritative netcode.',
    'Generated terrain via Perlin noise; evaluated sub-chunking and data-oriented storage for scale.',
    'Sketched AWS back ends (EC2/Lambda/S3) for dynamic world state and session orchestration.'
  ]
from public.jobs j
where j.title = 'Owner' and j.company = 'Backslash Designs'
limit 1;

-- -------------- DIGITAL MARKETING TECHNOLOGIST (14)
insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 14,
  'Digital Marketing Technologist · Backslash Designs',
  'Built the content + automation pipeline connecting blog, email, and community.',
  array[
    'Automated newsletters and nurture flows with Mautic and n8n webhooks; templated content with YAML/Markdown.',
    'Implemented SEO basics, link tracking, and UTM hygiene; produced responsive HTML email templates.',
    'Integrated Discord and web forms; centralized assets in GitHub for reproducibility and reviews.'
  ]
from public.jobs j
where j.title = 'Owner' and j.company = 'Backslash Designs'
limit 1;

insert into public.job_variants (id, job_id, variant_index, title, summary, bullets)
select gen_random_uuid(), j.id, 14,
  'Digital Marketing Technologist (Consultant) · Freelance',
  'Enabled low-cost, high-integration marketing ops for small teams.',
  array[
    'Connected websites to email/CRM via APIs and webhooks; reduced manual list management.',
    'Created analytics dashboards and content schedules; trained staff on publishing workflows.'
  ]
from public.jobs j
where j.title = 'Freelance Information Technology Consultant' and j.company = 'Freelance'
limit 1;

-- ================================
-- PRESETS (ROLE-BASED)
-- ================================
-- Create presets (idempotent-ish: won’t prevent duplicates if run many times).
insert into public.presets (id, name, include_photo, summary_variant)
values
  (gen_random_uuid(), 'IT Systems Administrator', true, 0),
  (gen_random_uuid(), 'DevOps', true, 0),
  (gen_random_uuid(), 'Full-Stack Developer', false, 1),
  (gen_random_uuid(), 'Game Systems', false, 1),
  (gen_random_uuid(), 'Digital Marketing Technologist', false, 1);

-- Link jobs to each preset with a selected variant and position
-- IT Systems Administrator
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 10, x.pos
from public.presets p
join public.jobs j on (j.title, j.company) in (('Information Technology Lead','NorthWind Family Ministries'),
                                               ('Owner','Backslash Designs'),
                                               ('Freelance Information Technology Consultant','Freelance'))
join (values
  ('Information Technology Lead','NorthWind Family Ministries', 0),
  ('Owner','Backslash Designs', 1),
  ('Freelance Information Technology Consultant','Freelance', 2)
) as x(t,c,pos) on x.t = j.title and x.c = j.company
where p.name = 'IT Systems Administrator';

-- DevOps
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 11, x.pos
from public.presets p
join public.jobs j on (j.title, j.company) in (('Owner','Backslash Designs'),
                                               ('Information Technology Lead','NorthWind Family Ministries'))
join (values
  ('Owner','Backslash Designs', 0),
  ('Information Technology Lead','NorthWind Family Ministries', 1)
) as x(t,c,pos) on x.t = j.title and x.c = j.company
where p.name = 'DevOps';

-- Full-Stack Developer
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 12, x.pos
from public.presets p
join public.jobs j on (j.title, j.company) in (('Owner','Backslash Designs'),
                                               ('Summer Intern - Dunlap Institute for Astronomy & Astrophysics','University of Toronto'),
                                               ('Research Assistant','Lakehead University'))
join (values
  ('Owner','Backslash Designs', 0),
  ('Summer Intern - Dunlap Institute for Astronomy & Astrophysics','University of Toronto', 1),
  ('Research Assistant','Lakehead University', 2)
) as x(t,c,pos) on x.t = j.title and x.c = j.company
where p.name = 'Full-Stack Developer';

-- Game Systems
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 13, 0
from public.presets p
join public.jobs j on j.title = 'Owner' and j.company = 'Backslash Designs'
where p.name = 'Game Systems';

-- Digital Marketing Technologist
insert into public.preset_jobs (id, preset_id, job_id, enabled, selected_variant, position)
select gen_random_uuid(), p.id, j.id, true, 14, x.pos
from public.presets p
join public.jobs j on (j.title, j.company) in (('Owner','Backslash Designs'),
                                               ('Freelance Information Technology Consultant','Freelance'))
join (values
  ('Owner','Backslash Designs', 0),
  ('Freelance Information Technology Consultant','Freelance', 1)
) as x(t,c,pos) on x.t = j.title and x.c = j.company
where p.name = 'Digital Marketing Technologist';

-- Seed education (from LinkedIn)
insert into public.education (id, school, degree, field_of_study, location, start_date, end_date, description, bullets)
values
  (gen_random_uuid(), 'Lakehead University', 'Bachelor of Science - BS', 'Computer Science', null, '2018-01-01', '2025-12-31', 'Undergraduate studies', array[]::text[]),
  (gen_random_uuid(), 'Confederation College', 'Electronics Technologist Diploma', 'Electrical and Electronics Engineering', null, '2009-01-01', '2014-12-31', 'Diploma program', array[]::text[]),
  (gen_random_uuid(), 'WISDOM Home Schooling', 'High School', 'High School/Secondary Diploma', null, '2009-01-01', '2009-12-31', 'High school diploma', array[]::text[]);

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

-- Seed certificates (real data)
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

-- Link all skills to all presets (enabled)
insert into public.preset_skills (id, preset_id, skill_id, enabled)
select gen_random_uuid(), p.id, s.id, true
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

-- Link projects into each preset with positions (all enabled)
with p as (
  select id, name from public.presets
), proj as (
  select id, name, row_number() over (order by name asc) - 1 as pos from public.projects
)
insert into public.preset_projects (id, preset_id, project_id, enabled, position)
select gen_random_uuid(), p.id, proj.id,
  true as enabled,
  proj.pos
from p cross join proj;
