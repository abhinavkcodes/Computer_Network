-- Run this once if schema.sql was already run previously.
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

alter table public.site_visits enable row level security;
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
