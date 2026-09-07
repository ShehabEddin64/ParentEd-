-- ParentEd : rattrapage des migrations V5 et V7
begin;
-- ParentEd V5: weighted grades and calendar import tracking.
alter table public.grades add column weight numeric not null default 1 check (weight > 0 and weight <= 100);
-- Imported calendar events keep their source identifier so a second import updates instead of duplicating.
alter table public.tasks add column source text not null default '' check (length(source) <= 300);
create index tasks_source_idx on public.tasks(family_id, source) where source <> '';

-- ParentEd V7: assistant anti-abuse — minimum spacing between questions and an operator kill switch stored in the database.
alter table public.assistant_usage add column last_at timestamptz;
create table public.app_settings (key text primary key, id text generated always as (key) stored, value text not null, updated_at timestamptz not null default now());
grant select on public.app_settings to authenticated;
alter table public.app_settings enable row level security;
create policy read_settings on public.app_settings for select to authenticated using (true);
create policy admin_settings on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant insert, update, delete on public.app_settings to authenticated;
insert into public.app_settings(key, value) values ('assistant_enabled', 'true') on conflict (key) do nothing;
create or replace function public.assistant_allow(p_limit integer, p_global integer) returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); used integer; total integer; last timestamptz; enabled text;
begin
  if uid is null then return jsonb_build_object('allowed', false, 'reason', 'auth'); end if;
  select value into enabled from public.app_settings where key = 'assistant_enabled';
  if coalesce(enabled, 'true') <> 'true' then return jsonb_build_object('allowed', false, 'reason', 'disabled'); end if;
  insert into public.assistant_usage(user_id, day) values (uid, current_date) on conflict (user_id, day) do nothing;
  select questions, last_at into used, last from public.assistant_usage where user_id = uid and day = current_date for update;
  if last is not null and last > now() - interval '8 seconds' then return jsonb_build_object('allowed', false, 'reason', 'pace', 'used', used, 'limit', p_limit); end if;
  select coalesce(sum(questions), 0) into total from public.assistant_usage where day = current_date;
  if used >= p_limit then return jsonb_build_object('allowed', false, 'reason', 'user', 'used', used, 'limit', p_limit); end if;
  if total >= p_global then return jsonb_build_object('allowed', false, 'reason', 'global', 'used', used, 'limit', p_limit); end if;
  update public.assistant_usage set questions = questions + 1, last_at = now() where user_id = uid and day = current_date;
  return jsonb_build_object('allowed', true, 'used', used + 1, 'limit', p_limit);
end; $$;
commit;
