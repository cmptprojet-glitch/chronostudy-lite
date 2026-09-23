-- ChronoStudy V11 - Phase 1 foundation
-- Apply with Supabase migrations after connecting a project.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'Étudiant',
  university text not null default '',
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_study_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'internal' check (source in ('internal', 'pronote', 'ocr', 'google_calendar', 'classroom')),
  title text not null,
  subject text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text,
  description text,
  cards jsonb not null default '[]'::jsonb,
  source text not null default 'manual' check (source in ('manual', 'ai', 'document', 'cloud')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.srs_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  card_key text not null,
  interval_days integer not null default 0 check (interval_days >= 0),
  ease_factor numeric(4,2) not null default 2.50 check (ease_factor >= 1.30),
  repetitions integer not null default 0 check (repetitions >= 0),
  due_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, deck_id, card_key)
);

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  planned_seconds integer not null check (planned_seconds > 0),
  focused_seconds integer not null default 0 check (focused_seconds >= 0),
  status text not null default 'running' check (status in ('running', 'completed', 'abandoned')),
  subject text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chapter_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  chapter_id text not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null default 0 check (file_size >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.user_integrations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cloud_provider text check (cloud_provider in ('google_drive', 'onedrive', 'dropbox', 'icloud')),
  cloud_account_ref text,
  openai_vault_secret_ref text,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists schedules_user_starts_idx on public.schedules(user_id, starts_at);
create index if not exists decks_user_updated_idx on public.flashcard_decks(user_id, updated_at desc);
create index if not exists srs_user_due_idx on public.srs_progress(user_id, due_at);
create index if not exists pomodoro_user_started_idx on public.pomodoro_sessions(user_id, started_at desc);
create index if not exists attachments_user_chapter_idx on public.chapter_attachments(user_id, subject_id, chapter_id);

alter table public.user_profiles enable row level security;
alter table public.user_study_data enable row level security;
alter table public.schedules enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.srs_progress enable row level security;
alter table public.pomodoro_sessions enable row level security;
alter table public.chapter_attachments enable row level security;
alter table public.user_integrations enable row level security;

create policy "profiles_owner_all" on public.user_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "study_data_owner_all" on public.user_study_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "schedules_owner_all" on public.schedules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "decks_owner_all" on public.flashcard_decks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "srs_owner_all" on public.srs_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pomodoro_owner_all" on public.pomodoro_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attachments_owner_all" on public.chapter_attachments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "integrations_owner_all" on public.user_integrations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at before update on public.user_profiles for each row execute function public.set_updated_at();
drop trigger if exists study_data_set_updated_at on public.user_study_data;
create trigger study_data_set_updated_at before update on public.user_study_data for each row execute function public.set_updated_at();
drop trigger if exists schedules_set_updated_at on public.schedules;
create trigger schedules_set_updated_at before update on public.schedules for each row execute function public.set_updated_at();
drop trigger if exists decks_set_updated_at on public.flashcard_decks;
create trigger decks_set_updated_at before update on public.flashcard_decks for each row execute function public.set_updated_at();
drop trigger if exists srs_set_updated_at on public.srs_progress;
create trigger srs_set_updated_at before update on public.srs_progress for each row execute function public.set_updated_at();
drop trigger if exists integrations_set_updated_at on public.user_integrations;
create trigger integrations_set_updated_at before update on public.user_integrations for each row execute function public.set_updated_at();
