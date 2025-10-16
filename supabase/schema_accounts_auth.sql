-- Add requires_auth flag to accounts to gate sensitive links (e.g., email, phone)
-- Safe to run multiple times: adds column only if it doesn't exist.

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
