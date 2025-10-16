-- Accounts authorization via RLS and allowlist
-- This script is idempotent: safe to run multiple times.

-- 1) Ensure requires_auth column exists on public.accounts (in case not applied elsewhere)
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'accounts'
      and column_name  = 'requires_auth'
  ) then
    alter table public.accounts
      add column requires_auth boolean not null default false;
  end if;
end $$;

-- 2) Allowlist table of authorized users (by user_id or email)
create table if not exists public.authorized_users (
  user_id uuid unique,
  email   text unique
);

-- 3) Enable row level security on accounts
alter table public.accounts enable row level security;

-- 4) Policies
-- Use drop-if-exists for idempotency to avoid DO/EXECUTE issues in some runners
drop policy if exists "accounts_public_read" on public.accounts;
create policy "accounts_public_read"
on public.accounts
for select
to public
using (coalesce(requires_auth, false) = false);

drop policy if exists "accounts_private_read_authorized" on public.accounts;
create policy "accounts_private_read_authorized"
on public.accounts
for select
to authenticated
using (
  coalesce(requires_auth, false) = true
  and (
    exists (select 1 from public.authorized_users au where au.user_id = auth.uid())
    or exists (select 1 from public.authorized_users au where au.email = (auth.jwt() ->> 'email'))
  )
);

-- Optional helper: seed your own UID/email into the allowlist (uncomment & replace values)
-- insert into public.authorized_users (user_id) values ('00000000-0000-0000-0000-000000000000')
--   on conflict (user_id) do nothing;
-- insert into public.authorized_users (email) values ('you@example.com')
--   on conflict (email) do nothing;
