create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default 'Student',
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'faculty')),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  unit text not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  completed_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.site_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  path text not null default '/',
  visited_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.announcements enable row level security;
alter table public.feedback enable row level security;
alter table public.site_visits enable row level security;

create or replace function public.is_faculty()
returns boolean language sql security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty') $$;

create policy "Users can read own profile" on public.profiles for select using (id = auth.uid());
create policy "Faculty can read all profiles" on public.profiles for select using (public.is_faculty());
create policy "Users can update own activity" on public.profiles for update using (id = auth.uid());
create policy "Users can insert own attempts" on public.quiz_attempts for insert with check (user_id = auth.uid());
create policy "Users can read own attempts" on public.quiz_attempts for select using (user_id = auth.uid());
create policy "Faculty can read all attempts" on public.quiz_attempts for select using (public.is_faculty());
create policy "Authenticated users can read announcements" on public.announcements for select using (auth.uid() is not null);
create policy "Faculty can create announcements" on public.announcements for insert with check (public.is_faculty() and author_id = auth.uid());
create policy "Users can send feedback" on public.feedback for insert with check (user_id = auth.uid());
create policy "Faculty can read feedback" on public.feedback for select using (public.is_faculty());
create policy "Users can record visits" on public.site_visits for insert with check (user_id = auth.uid());
create policy "Faculty can read visits" on public.site_visits for select using (public.is_faculty());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', 'Student'), new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
