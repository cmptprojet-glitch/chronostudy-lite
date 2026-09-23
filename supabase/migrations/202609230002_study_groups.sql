-- ChronoStudy V11 - study groups and collaboration

create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 80),
  subject text not null default 'Général' check (char_length(subject) <= 60),
  description text not null default 'Groupe d''études' check (char_length(description) <= 300),
  code text not null unique check (code ~ '^[A-Z0-9]{2,8}-[0-9]{4}$'),
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.study_group_members (
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'member')),
  display_name text not null default 'Étudiant' check (char_length(display_name) between 1 and 80),
  avatar_initials text not null default 'ET' check (char_length(avatar_initials) between 1 and 4),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.study_group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.study_group_shared_decks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  card_count integer not null default 0 check (card_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists study_groups_created_by_idx on public.study_groups(created_by);
create index if not exists study_groups_code_idx on public.study_groups(code);
create index if not exists study_group_members_user_idx on public.study_group_members(user_id);
create index if not exists study_group_messages_group_idx on public.study_group_messages(group_id, created_at desc);
create index if not exists study_group_shared_decks_group_idx on public.study_group_shared_decks(group_id, created_at desc);

alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;
alter table public.study_group_messages enable row level security;
alter table public.study_group_shared_decks enable row level security;

create policy "authenticated_users_can_read_groups"
  on public.study_groups for select
  to authenticated
  using (true);

create policy "users_create_own_groups"
  on public.study_groups for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "owners_update_groups"
  on public.study_groups for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "owners_delete_groups"
  on public.study_groups for delete
  to authenticated
  using (auth.uid() = created_by);

create policy "authenticated_users_can_read_members"
  on public.study_group_members for select
  to authenticated
  using (true);

create policy "users_join_as_themselves"
  on public.study_group_members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users_leave_or_owners_manage_members"
  on public.study_group_members for delete
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.study_groups g
      where g.id = group_id and g.created_by = auth.uid()
    )
  );

create policy "authenticated_users_can_read_messages"
  on public.study_group_messages for select
  to authenticated
  using (true);

create policy "members_can_post_messages"
  on public.study_group_messages for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.study_group_members m
      where m.group_id = study_group_messages.group_id and m.user_id = auth.uid()
    )
  );

create policy "authenticated_users_can_read_shared_decks"
  on public.study_group_shared_decks for select
  to authenticated
  using (true);

create policy "members_can_share_decks"
  on public.study_group_shared_decks for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.study_group_members m
      where m.group_id = study_group_shared_decks.group_id and m.user_id = auth.uid()
    )
  );
