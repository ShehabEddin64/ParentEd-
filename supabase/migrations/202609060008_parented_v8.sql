-- ParentEd V8: public landing page leads (call requests and founding-family list). Anonymous insert only, throttled; the team reads.
create table public.leads (id uuid primary key default gen_random_uuid(), kind text not null check (kind in ('appel','liste')), name text not null default '' check (length(name) <= 120), email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 200), message text not null default '' check (length(message) <= 2000), preferred text not null default '' check (length(preferred) <= 120), handled boolean not null default false, created_at timestamptz not null default now());
create index leads_created_idx on public.leads(created_at desc);
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
alter table public.leads enable row level security;
create policy insert_leads on public.leads for insert to anon, authenticated with check (true);
create policy admin_leads_read on public.leads for select to authenticated using (public.is_admin());
create policy admin_leads_update on public.leads for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_leads_delete on public.leads for delete to authenticated using (public.is_admin());
-- Throttle: at most 3 requests per e-mail per day and 300 per day overall, so a bot cannot fill the table.
create function public.check_lead() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.email := lower(trim(new.email));
  if (select count(*) from public.leads where email = new.email and created_at > now() - interval '1 day') >= 3 then
    raise exception 'Vous avez déjà envoyé une demande aujourd’hui : nous vous répondrons rapidement.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.leads where created_at > now() - interval '1 day') >= 300 then
    raise exception 'Trop de demandes pour aujourd’hui. Réessayez demain ou écrivez-nous par courriel.' using errcode = 'P0001';
  end if;
  return new;
end; $$;
revoke all on function public.check_lead() from public;
create trigger lead_throttle before insert on public.leads for each row execute function public.check_lead();
