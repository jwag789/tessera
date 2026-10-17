-- Folio's database. Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- Each record is stored whole as JSON, keyed by the signed-in user. Row-level security means a user can
-- only read and write their own rows, whatever the app does: the public "anon" key alone can't read anything.

create table if not exists public.resumes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.applications (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.resumes enable row level security;
alter table public.applications enable row level security;

drop policy if exists "Users manage their own resumes" on public.resumes;
create policy "Users manage their own resumes" on public.resumes
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own applications" on public.applications;
create policy "Users manage their own applications" on public.applications
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
