-- ChronoStudy V11 - flashcards, SRS and analytics

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  card_key text not null,
  question text not null check (char_length(question) between 1 and 5000),
  answer text not null check (char_length(answer) between 1 and 10000),
  card_type text not null default 'classic' check (card_type in ('classic', 'qcm', 'cloze', 'true_false', 'code', 'ordering', 'matching')),
  options jsonb not null default '[]'::jsonb,
  explanation text,
  tags jsonb not null default '[]'::jsonb,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, deck_id, card_key)
);

create table if not exists public.analytics_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  focused_minutes integer not null default 0 check (focused_minutes >= 0),
  sessions_completed integer not null default 0 check (sessions_completed >= 0),
  cards_reviewed integer not null default 0 check (cards_reviewed >= 0),
  cards_mastered integer not null default 0 check (cards_mastered >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table if not exists public.dashboard_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  layout jsonb not null default '[]'::jsonb,
  widgets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists flashcards_deck_position_idx on public.flashcards(user_id, deck_id, position);
create index if not exists analytics_daily_user_day_idx on public.analytics_daily(user_id, day desc);

alter table public.flashcards enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.dashboard_preferences enable row level security;

create policy "flashcards_owner_all" on public.flashcards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "analytics_owner_all" on public.analytics_daily for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dashboard_preferences_owner_all" on public.dashboard_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists flashcards_set_updated_at on public.flashcards;
create trigger flashcards_set_updated_at before update on public.flashcards for each row execute function public.set_updated_at();
drop trigger if exists dashboard_preferences_set_updated_at on public.dashboard_preferences;
create trigger dashboard_preferences_set_updated_at before update on public.dashboard_preferences for each row execute function public.set_updated_at();
