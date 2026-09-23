-- ChronoStudy V11 - study session logs

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type text not null default 'manual' check (session_type in ('manual', 'pomodoro', 'flashcards')),
  subject text not null default 'Études' check (char_length(subject) <= 120),
  topic text check (topic is null or char_length(topic) <= 200),
  task_id text,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 1440),
  started_at timestamptz not null default now(),
  ended_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (ended_at >= started_at)
);

create index if not exists study_sessions_user_started_idx on public.study_sessions(user_id, started_at desc);

alter table public.study_sessions enable row level security;

create policy "study_sessions_owner_all"
  on public.study_sessions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
