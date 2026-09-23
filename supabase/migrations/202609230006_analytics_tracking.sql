-- ChronoStudy V11 - analytics tracking from persisted study sessions
-- Keeps analytics_daily synchronized whenever a study session is written.

create or replace function public.record_study_session_analytics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.analytics_daily (user_id, day, focused_minutes, sessions_completed)
  values (new.user_id, new.started_at::date, new.duration_minutes, 1)
  on conflict (user_id, day) do update set
    focused_minutes = analytics_daily.focused_minutes + excluded.focused_minutes,
    sessions_completed = analytics_daily.sessions_completed + excluded.sessions_completed,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists study_sessions_record_analytics on public.study_sessions;
create trigger study_sessions_record_analytics
after insert on public.study_sessions
for each row execute function public.record_study_session_analytics();

-- Backfill sessions already stored before this trigger was installed.
insert into public.analytics_daily (user_id, day, focused_minutes, sessions_completed)
select user_id, started_at::date, sum(duration_minutes), count(*)::integer
from public.study_sessions
where started_at::date <= current_date
group by user_id, started_at::date
on conflict (user_id, day) do update set
  focused_minutes = greatest(analytics_daily.focused_minutes, excluded.focused_minutes),
  sessions_completed = greatest(analytics_daily.sessions_completed, excluded.sessions_completed),
  updated_at = now();
