-- ParentEd: private families, parent-only self provisioning, separate content administration.
create table public.families (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now());
create table public.profiles (id uuid primary key references auth.users on delete cascade, family_id uuid not null references public.families, display_name text not null check (length(display_name) between 1 and 80), role text not null default 'parent' check (role in ('parent','admin')));
create function public.current_family() returns uuid language sql stable security definer set search_path = '' as $$ select family_id from public.profiles where id = (select auth.uid()) $$;
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$ select coalesce((select role = 'admin' from public.profiles where id = (select auth.uid())), false) $$;
revoke all on function public.current_family(), public.is_admin() from public;
grant execute on function public.current_family(), public.is_admin() to authenticated;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare fid uuid;
begin
 insert into public.families default values returning id into fid;
 insert into public.profiles(id, family_id, display_name, role) values (new.id, fid, left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Parent'),80), 'parent');
 return new;
end; $$;
revoke all on function public.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create table public.courses (id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 160), description text not null, category text not null, position integer not null default 0, published boolean not null default false);
create table public.lessons (id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses on delete cascade, title text not null check(length(title) between 1 and 160), body text not null check(length(body)>0), exercise text not null, minutes integer not null check(minutes between 1 and 180), position integer not null default 0);
create table public.progress (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references public.profiles on delete cascade, lesson_id uuid not null references public.lessons on delete cascade, completed_at timestamptz not null default now(), unique(user_id, lesson_id));
create table public.tasks (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, title text not null check(length(title) between 1 and 200), child text not null check(length(child) between 1 and 80), date date not null, time text not null check(time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'), done boolean not null default false);
create table public.posts (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references public.profiles on delete cascade, author text not null, title text not null check(length(title) between 1 and 160), body text not null check(length(body) between 1 and 5000), category text not null, created_at timestamptz not null default now());
create table public.replies (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, author text not null, body text not null check(length(body) between 1 and 5000), created_at timestamptz not null default now());
create table public.events (id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 160), description text not null, date date not null, time text not null check(time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'), location text not null, organizer text not null, age text not null, published boolean not null default false);
create table public.registrations (id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, unique(event_id,user_id));
create table public.resources (id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 160), description text not null, category text not null, url text not null check(url ~ '^https://'), source text not null, checked_at date not null);
create table public.documents (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, title text not null check(length(title) between 1 and 200), path text not null unique, created_at timestamptz not null default now(), check (split_part(path,'/',1) = family_id::text));
create table public.reports (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, reason text not null check(length(reason) between 1 and 1000), created_at timestamptz not null default now(), unique(post_id,user_id));
create index profiles_family_idx on public.profiles(family_id);
create index lessons_course_idx on public.lessons(course_id);
create index tasks_family_date_idx on public.tasks(family_id,date);
create index documents_family_idx on public.documents(family_id);
create index replies_post_idx on public.replies(post_id);
create index registrations_user_idx on public.registrations(user_id);
-- Always derive community author identity from the authenticated profile.
create function public.set_author() returns trigger language plpgsql security definer set search_path = '' as $$ begin
 if auth.uid() is not null then
   new.user_id := auth.uid();
   select display_name into new.author from public.profiles where id = auth.uid();
 end if;
 return new;
end; $$;
revoke all on function public.set_author() from public;
create trigger post_author before insert on public.posts for each row execute function public.set_author();
create trigger reply_author before insert on public.replies for each row execute function public.set_author();
-- Explicit privileges: profiles are immutable through the client, especially role/family_id.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles,public.families to authenticated;
grant select,insert,update,delete on public.courses,public.lessons,public.progress,public.tasks,public.posts,public.replies,public.events,public.registrations,public.resources,public.documents,public.reports to authenticated;
alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.progress enable row level security;
alter table public.tasks enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.resources enable row level security;
alter table public.documents enable row level security;
alter table public.reports enable row level security;
create policy own_profile on public.profiles for select to authenticated using (id = auth.uid());
create policy own_family on public.families for select to authenticated using (id = public.current_family());
create policy read_courses on public.courses for select to authenticated using (published or public.is_admin());
create policy admin_courses on public.courses for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy read_lessons on public.lessons for select to authenticated using(exists(select 1 from public.courses where id=course_id and (published or public.is_admin())));
create policy admin_lessons on public.lessons for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy own_progress on public.progress for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.lessons where id=lesson_id));
create policy family_tasks on public.tasks for all to authenticated using(family_id=public.current_family()) with check(family_id=public.current_family());
create policy family_documents on public.documents for all to authenticated using(family_id=public.current_family()) with check(family_id=public.current_family());
create policy read_posts on public.posts for select to authenticated using(true);
create policy create_posts on public.posts for insert to authenticated with check(user_id=auth.uid());
create policy delete_posts on public.posts for delete to authenticated using(user_id=auth.uid() or public.is_admin());
create policy read_replies on public.replies for select to authenticated using(true);
create policy create_replies on public.replies for insert to authenticated with check(user_id=auth.uid());
create policy delete_replies on public.replies for delete to authenticated using(user_id=auth.uid() or public.is_admin());
create policy read_events on public.events for select to authenticated using(published or public.is_admin());
create policy admin_events on public.events for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy own_registrations on public.registrations for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.events where id=event_id and published));
create policy read_resources on public.resources for select to authenticated using(true);
create policy admin_resources on public.resources for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy read_reports on public.reports for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy create_reports on public.reports for insert to authenticated with check(user_id=auth.uid());
create policy delete_reports on public.reports for delete to authenticated using(public.is_admin());
-- Storage: no public URLs. MIME and size are enforced by the storage service as well as the UI.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('family-documents','family-documents',false,5242880,array['application/pdf','image/png','image/jpeg']) on conflict(id) do nothing;
create policy family_file_read on storage.objects for select to authenticated using(bucket_id='family-documents' and (storage.foldername(name))[1]=public.current_family()::text);
create policy family_file_insert on storage.objects for insert to authenticated with check(bucket_id='family-documents' and (storage.foldername(name))[1]=public.current_family()::text);
create policy family_file_delete on storage.objects for delete to authenticated using(bucket_id='family-documents' and (storage.foldername(name))[1]=public.current_family()::text);
