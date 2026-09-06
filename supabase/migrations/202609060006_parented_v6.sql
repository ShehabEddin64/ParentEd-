-- ParentEd V6: assistant quotas and usage log, so the AI cost stays bounded and visible.
create table public.assistant_usage (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade, day date not null default current_date, questions integer not null default 0, input_tokens integer not null default 0, output_tokens integer not null default 0, unique(user_id, day));
grant select on public.assistant_usage to authenticated;
alter table public.assistant_usage enable row level security;
create policy read_assistant_usage on public.assistant_usage for select to authenticated using (user_id = auth.uid() or public.is_admin());
-- Reserves one question for the caller: refused when the personal daily limit or the global daily limit is reached.
create function public.assistant_allow(p_limit integer, p_global integer) returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); used integer; total integer;
begin
  if uid is null then return jsonb_build_object('allowed', false, 'reason', 'auth'); end if;
  insert into public.assistant_usage(user_id, day) values (uid, current_date) on conflict (user_id, day) do nothing;
  select questions into used from public.assistant_usage where user_id = uid and day = current_date for update;
  select coalesce(sum(questions), 0) into total from public.assistant_usage where day = current_date;
  if used >= p_limit then return jsonb_build_object('allowed', false, 'reason', 'user', 'used', used, 'limit', p_limit); end if;
  if total >= p_global then return jsonb_build_object('allowed', false, 'reason', 'global', 'used', used, 'limit', p_limit); end if;
  update public.assistant_usage set questions = questions + 1 where user_id = uid and day = current_date;
  return jsonb_build_object('allowed', true, 'used', used + 1, 'limit', p_limit);
end; $$;
create function public.assistant_record(p_input integer, p_output integer) returns void language sql security definer set search_path = '' as $$
  update public.assistant_usage set input_tokens = input_tokens + greatest(p_input, 0), output_tokens = output_tokens + greatest(p_output, 0) where user_id = auth.uid() and day = current_date
$$;
revoke all on function public.assistant_allow(integer, integer), public.assistant_record(integer, integer) from public;
grant execute on function public.assistant_allow(integer, integer), public.assistant_record(integer, integer) to authenticated;
