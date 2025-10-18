-- Create_Policies.sql
-- Centralize RLS enablement and policies across public tables. Idempotent where possible.
-- Supabase auth schema is not modified here; this config references auth.uid() and JWT email.

-- ---------- Accounts RLS ----------
-- Ensure requires_auth column exists (legacy safety)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'accounts'
      and column_name  = 'requires_auth'
  ) then
    alter table public.accounts
      add column requires_auth boolean not null default false;
  end if;
end $$;

-- Allowlist table (created in Create_Schema; keep here for safety)
create table if not exists public.authorized_users (
  user_id uuid unique,
  email   text unique
);

-- Enable RLS on accounts
alter table public.accounts enable row level security;

-- Policies
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

-- Optional: Service role bypass (uncomment if desired)
-- drop policy if exists "accounts_service_all" on public.accounts;
-- create policy "accounts_service_all" on public.accounts for all to service_role using (true) with check (true);
