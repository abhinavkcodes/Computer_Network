-- Run this once if schema.sql was already run previously.
alter table public.profiles add column if not exists registration_number text;
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  unit text not null check (unit in ('1', '2')),
  question text not null,
  options jsonb not null,
  answer integer not null check (answer >= 0 and answer < 4),
  explanation text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  path text not null default '/',
  visited_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on public.profiles to authenticated, service_role;
grant select, insert on public.quiz_attempts to authenticated, service_role;
grant select, insert on public.announcements to authenticated, service_role;
grant select, insert on public.feedback to authenticated, service_role;
grant select, insert on public.site_visits to authenticated, service_role;
grant select, insert, update, delete on public.quiz_questions to authenticated, service_role;

alter table public.site_visits enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.feedback enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "Users can record visits" on public.site_visits;
drop policy if exists "Faculty can read visits" on public.site_visits;
drop policy if exists "Users can send feedback" on public.feedback;
drop policy if exists "Faculty can read feedback" on public.feedback;
drop policy if exists "Authenticated users can read announcements" on public.announcements;
drop policy if exists "Faculty can create announcements" on public.announcements;
create policy "Users can record visits" on public.site_visits for insert with check (user_id = auth.uid());
create policy "Faculty can read visits" on public.site_visits for select using (public.is_faculty());
create policy "Users can send feedback" on public.feedback for insert with check (user_id = auth.uid());
create policy "Faculty can read feedback" on public.feedback for select using (public.is_faculty());
create policy "Authenticated users can read announcements" on public.announcements for select using (auth.uid() is not null);
create policy "Faculty can create announcements" on public.announcements for insert with check (public.is_faculty() and author_id = auth.uid());
drop policy if exists "Authenticated users can read enabled quiz questions" on public.quiz_questions;
drop policy if exists "Faculty can manage quiz questions" on public.quiz_questions;
create policy "Authenticated users can read enabled quiz questions" on public.quiz_questions for select using (auth.uid() is not null and enabled = true);
create policy "Faculty can manage quiz questions" on public.quiz_questions for all using (public.is_faculty()) with check (public.is_faculty());
