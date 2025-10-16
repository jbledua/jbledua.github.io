-- Seed common social/contact accounts
-- Idempotent: inserts only when an account with the same name doesn't already exist

with rows(name, icon, link) as (
  values
    ('GitHub',   'github',   'https://github.com/jbledua'),
    ('LinkedIn', 'linkedin', 'https://www.linkedin.com/in/jbledua/'),
    ('X',        'x',        'https://x.com/jbledua'),
    ('Facebook', 'facebook', 'https://www.facebook.com/jbledua'),
    ('Instagram','instagram','https://www.instagram.com/jbledua/'),
    ('Website',  'website',     'https://josiah.ledua.ca')
)
insert into public.accounts (id, name, icon, link)
select gen_random_uuid(), r.name, r.icon, r.link
from rows r
where not exists (
  select 1 from public.accounts a
  where lower(a.name) = lower(r.name)
);
