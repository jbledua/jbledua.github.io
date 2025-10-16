-- Seed common social/contact accounts
-- Idempotent: inserts only when an account with the same name doesn't already exist

with rows(name, icon, link, requires_auth) as (
  values
    ('GitHub',   'github',   'https://github.com/jbledua', false),
    ('LinkedIn', 'linkedin', 'https://www.linkedin.com/in/jbledua/', false),
    ('X',        'x',        'https://x.com/jbledua', false),
    ('Facebook', 'facebook', 'https://www.facebook.com/jbledua', false),
    ('Instagram','instagram','https://www.instagram.com/jbledua/', false),
    ('Website',  'website',  'https://josiah.ledua.ca', false),
    -- Sensitive entries: enabled but hidden unless authenticated
    ('Email',    'email',    'mailto:hello@email.ca', true),
    ('Phone',    'phone',    'tel:+1-555-123-4567', true)
)
insert into public.accounts (id, name, icon, link, requires_auth)
select gen_random_uuid(), r.name, r.icon, r.link, r.requires_auth
from rows r
where not exists (
  select 1 from public.accounts a
  where lower(a.name) = lower(r.name)
);
