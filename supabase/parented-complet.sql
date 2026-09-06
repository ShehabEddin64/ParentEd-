-- ParentEd — script complet pour un projet Supabase neuf.
-- Généré par scripts/bundle-sql.mjs le 2026-09-06. Ne pas modifier à la main : éditer les migrations puis relancer `npm run sql:bundle`.
-- À exécuter UNE seule fois dans SQL Editor. Pour une base déjà migrée, appliquer uniquement la nouvelle migration.
begin;

-- ===== Migration 202609060001_parented.sql =====
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

-- ===== Migration 202609060002_parented_v2.sql =====
-- ParentEd V2: tutoring, groups, favorites, children, portfolio, event proposals/recurrence, lesson notes and questions.
-- Roles: tutor accounts are nominated by an operator, like admins.
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('parent','admin','tutor'));
-- Courses: optional original video link and reusable template; personal notes; questions to the team.
alter table public.lessons add column video_url text check (video_url is null or video_url ~ '^https://');
alter table public.lessons add column template text not null default '';
create table public.lesson_notes (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references public.profiles on delete cascade, lesson_id uuid not null references public.lessons on delete cascade, body text not null check(length(body) between 1 and 5000), updated_at timestamptz not null default now(), unique(user_id, lesson_id));
create table public.lesson_questions (id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, author text not null, body text not null check(length(body) between 1 and 2000), answer text, answered_at timestamptz, created_at timestamptz not null default now());
create trigger question_author before insert on public.lesson_questions for each row execute function public.set_author();
-- Resources: favorites.
create table public.favorites (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references public.profiles on delete cascade, resource_id uuid not null references public.resources on delete cascade, unique(user_id, resource_id));
-- Community: regional or thematic groups.
create table public.groups (id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 120), description text not null default '', kind text not null default 'theme' check (kind in ('region','theme')), created_at timestamptz not null default now());
create table public.group_members (id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, unique(group_id, user_id));
alter table public.posts add column group_id uuid references public.groups on delete set null;
-- Events: filters, featured announcements, recurrence, member proposals, map link.
alter table public.events add column region text not null default '';
alter table public.events add column price text not null default 'Gratuit';
alter table public.events add column featured boolean not null default false;
alter table public.events add column recurrence text not null default 'none' check (recurrence in ('none','weekly','biweekly','monthly'));
alter table public.events add column recurrence_until date;
alter table public.events add column map_url text check (map_url is null or map_url ~ '^https://');
alter table public.events add column created_by uuid default auth.uid() references public.profiles on delete set null;
-- Tutoring: profiles, availability, bookings, pedagogical reports. Tutors invoice families directly; no payment here.
create table public.tutors (id uuid primary key default gen_random_uuid(), profile_id uuid unique references public.profiles on delete set null, display_name text not null check(length(display_name) between 1 and 80), subjects text[] not null default '{}', qualifications text not null default '', bio text not null default '', rate_hint text not null default '', region text not null default '', mode text not null default 'les deux' check (mode in ('en ligne','en personne','les deux')), published boolean not null default false);
create function public.is_tutor_of(tid uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.tutors where id = tid and profile_id = (select auth.uid())) $$;
revoke all on function public.is_tutor_of(uuid) from public;
grant execute on function public.is_tutor_of(uuid) to authenticated;
create table public.tutor_availability (id uuid primary key default gen_random_uuid(), tutor_id uuid not null references public.tutors on delete cascade, weekday integer not null check (weekday between 1 and 7), start_time text not null check (start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'), end_time text not null check (end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'));
create table public.bookings (id uuid primary key default gen_random_uuid(), tutor_id uuid not null references public.tutors on delete cascade, family_id uuid not null default public.current_family() references public.families on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, child text not null check(length(child) between 1 and 80), subject text not null check(length(subject) between 1 and 80), date date not null, time text not null check (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'), weekly boolean not null default false, status text not null default 'demandée' check (status in ('demandée','confirmée','annulée','terminée')), note text not null default '' check(length(note) <= 2000), created_at timestamptz not null default now());
create table public.tutor_reports (id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings on delete cascade, tutor_id uuid not null references public.tutors on delete cascade, body text not null check(length(body) between 1 and 5000), created_at timestamptz not null default now());
-- Family organisation: children, weekly plan, books/resources, portfolio notes and document context.
create table public.children (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, name text not null check(length(name) between 1 and 80), birth_year integer check (birth_year is null or birth_year between 1990 and 2100), notes text not null default '');
create table public.week_plans (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, week_start date not null, intentions text not null default '' check(length(intentions) <= 5000), unique(family_id, week_start));
create table public.library_items (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, title text not null check(length(title) between 1 and 200), kind text not null default 'livre' check (kind in ('livre','lien','autre')), author text not null default '', url text check (url is null or url ~ '^https://'), child text not null default '', notes text not null default '', created_at timestamptz not null default now());
create table public.notes (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, child text not null default '', date date not null default current_date, title text not null check(length(title) between 1 and 200), body text not null check(length(body) between 1 and 5000), created_at timestamptz not null default now());
alter table public.documents add column child text not null default '';
alter table public.documents add column note text not null default '';
create index lesson_notes_user_idx on public.lesson_notes(user_id);
create index lesson_questions_lesson_idx on public.lesson_questions(lesson_id);
create index favorites_user_idx on public.favorites(user_id);
create index group_members_user_idx on public.group_members(user_id);
create index posts_group_idx on public.posts(group_id);
create index bookings_family_idx on public.bookings(family_id, date);
create index bookings_tutor_idx on public.bookings(tutor_id, date);
create index children_family_idx on public.children(family_id);
create index library_family_idx on public.library_items(family_id);
create index notes_family_idx on public.notes(family_id, date);
create index tutor_reports_booking_idx on public.tutor_reports(booking_id);
grant select,insert,update,delete on public.lesson_notes,public.lesson_questions,public.favorites,public.groups,public.group_members,public.tutors,public.tutor_availability,public.bookings,public.tutor_reports,public.children,public.week_plans,public.library_items,public.notes to authenticated;
alter table public.lesson_notes enable row level security;
alter table public.lesson_questions enable row level security;
alter table public.favorites enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.tutors enable row level security;
alter table public.tutor_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.tutor_reports enable row level security;
alter table public.children enable row level security;
alter table public.week_plans enable row level security;
alter table public.library_items enable row level security;
alter table public.notes enable row level security;
-- Lessons: notes are personal; questions are shared with all members and answered by the team.
create policy own_lesson_notes on public.lesson_notes for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.lessons where id=lesson_id));
create policy read_questions on public.lesson_questions for select to authenticated using(true);
create policy ask_questions on public.lesson_questions for insert to authenticated with check(user_id=auth.uid() and answer is null and exists(select 1 from public.lessons where id=lesson_id));
create policy answer_questions on public.lesson_questions for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy delete_questions on public.lesson_questions for delete to authenticated using(user_id=auth.uid() or public.is_admin());
create policy own_favorites on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
-- Groups: created by the team; membership is personal.
create policy read_groups on public.groups for select to authenticated using(true);
create policy admin_groups on public.groups for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy read_members on public.group_members for select to authenticated using(true);
create policy own_membership on public.group_members for insert to authenticated with check(user_id=auth.uid());
create policy leave_group on public.group_members for delete to authenticated using(user_id=auth.uid() or public.is_admin());
-- Events: members may propose a draft; only the team publishes. Drafts are visible to their author.
drop policy read_events on public.events;
drop policy admin_events on public.events;
create policy read_events on public.events for select to authenticated using(published or public.is_admin() or created_by=auth.uid());
create policy propose_events on public.events for insert to authenticated with check(public.is_admin() or (created_by=auth.uid() and published=false and featured=false));
create policy update_events on public.events for update to authenticated using(public.is_admin() or (created_by=auth.uid() and published=false)) with check(public.is_admin() or (created_by=auth.uid() and published=false and featured=false));
create policy delete_events on public.events for delete to authenticated using(public.is_admin() or (created_by=auth.uid() and published=false));
-- Tutoring: published profiles are visible; tutors edit their own profile; the team manages the directory.
create policy read_tutors on public.tutors for select to authenticated using(published or public.is_admin() or profile_id=auth.uid());
create policy admin_tutors on public.tutors for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy tutor_self on public.tutors for update to authenticated using(profile_id=auth.uid()) with check(profile_id=auth.uid());
create policy read_availability on public.tutor_availability for select to authenticated using(exists(select 1 from public.tutors t where t.id=tutor_id and (t.published or public.is_admin() or t.profile_id=auth.uid())));
create policy manage_availability on public.tutor_availability for all to authenticated using(public.is_admin() or public.is_tutor_of(tutor_id)) with check(public.is_admin() or public.is_tutor_of(tutor_id));
-- Bookings: the family, the tutor and the coordination team. Families never see other families' bookings.
create policy read_bookings on public.bookings for select to authenticated using(family_id=public.current_family() or public.is_admin() or public.is_tutor_of(tutor_id));
create policy request_booking on public.bookings for insert to authenticated with check(family_id=public.current_family() and user_id=auth.uid() and status='demandée' and exists(select 1 from public.tutors where id=tutor_id and published));
create policy update_booking on public.bookings for update to authenticated using(family_id=public.current_family() or public.is_admin() or public.is_tutor_of(tutor_id)) with check((family_id=public.current_family() and user_id=auth.uid() and status in ('demandée','annulée')) or public.is_admin() or public.is_tutor_of(tutor_id));
create policy delete_booking on public.bookings for delete to authenticated using(public.is_admin() or (family_id=public.current_family() and status='demandée'));
create policy read_reports_tutoring on public.tutor_reports for select to authenticated using(exists(select 1 from public.bookings b where b.id=booking_id and (b.family_id=public.current_family() or public.is_admin() or public.is_tutor_of(b.tutor_id))));
create policy write_reports_tutoring on public.tutor_reports for all to authenticated using(public.is_admin() or public.is_tutor_of(tutor_id)) with check((public.is_admin() or public.is_tutor_of(tutor_id)) and exists(select 1 from public.bookings b where b.id=booking_id and b.tutor_id=tutor_id));
-- Family data stays inside the family; the team has no access.
create policy family_children on public.children for all to authenticated using(family_id=public.current_family()) with check(family_id=public.current_family());
create policy family_week_plans on public.week_plans for all to authenticated using(family_id=public.current_family()) with check(family_id=public.current_family());
create policy family_library on public.library_items for all to authenticated using(family_id=public.current_family()) with check(family_id=public.current_family());
create policy family_notes on public.notes for all to authenticated using(family_id=public.current_family()) with check(family_id=public.current_family());

-- ===== Migration 202609060003_parented_v3.sql =====
-- ParentEd V3: real community — member profiles, directory, map, private messages, notifications, likes, pinned posts, tutor reviews.
-- Member profile: public, coarse fields only. Role and family_id remain immutable from the client (column-level grant).
alter table public.profiles add column city text not null default '' check (length(city) <= 80);
alter table public.profiles add column lat double precision check (lat is null or lat between -90 and 90);
alter table public.profiles add column lng double precision check (lng is null or lng between -180 and 180);
alter table public.profiles add column bio text not null default '' check (length(bio) <= 600);
alter table public.profiles add column children_ages text not null default '' check (length(children_ages) <= 80);
alter table public.profiles add column interests text[] not null default '{}';
alter table public.profiles add column show_on_map boolean not null default false;
alter table public.profiles add column created_at timestamptz not null default now();
grant update (display_name, city, lat, lng, bio, children_ages, interests, show_on_map) on public.profiles to authenticated;
create policy update_own_profile on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- Directory view: everyone sees public member fields; family_id is never exposed. security_invoker is off on purpose.
create view public.members as select id, display_name, role, city, lat, lng, bio, children_ages, interests, show_on_map, created_at from public.profiles;
grant select on public.members to authenticated;
-- Events on the map and participant counts.
alter table public.events add column lat double precision check (lat is null or lat between -90 and 90);
alter table public.events add column lng double precision check (lng is null or lng between -180 and 180);
create view public.event_counts as select event_id as id, event_id, count(*)::integer as count from public.registrations group by event_id;
grant select on public.event_counts to authenticated;
-- Discussions: likes, pinned posts, editing.
create table public.post_likes (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, unique(post_id, user_id));
alter table public.posts add column pinned boolean not null default false;
alter table public.posts add column updated_at timestamptz;
create policy update_posts on public.posts for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check ((user_id = auth.uid() and pinned = (select p.pinned from public.posts p where p.id = id)) or public.is_admin());
-- Private messages between two members.
create table public.messages (id uuid primary key default gen_random_uuid(), sender_id uuid not null default auth.uid() references public.profiles on delete cascade, recipient_id uuid not null references public.profiles on delete cascade, body text not null check (length(body) between 1 and 3000), created_at timestamptz not null default now(), read_at timestamptz, check (sender_id <> recipient_id));
-- In-app notifications written by triggers only.
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade, kind text not null, title text not null, body text not null default '', link text not null default '', created_at timestamptz not null default now(), read_at timestamptz);
-- Tutor reviews after a completed session.
create table public.tutor_reviews (id uuid primary key default gen_random_uuid(), tutor_id uuid not null references public.tutors on delete cascade, booking_id uuid not null unique references public.bookings on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, author text not null default '', rating integer not null check (rating between 1 and 5), body text not null default '' check (length(body) <= 2000), created_at timestamptz not null default now());
create trigger review_author before insert on public.tutor_reviews for each row execute function public.set_author();
create index post_likes_post_idx on public.post_likes(post_id);
create index messages_recipient_idx on public.messages(recipient_id, created_at);
create index messages_sender_idx on public.messages(sender_id, created_at);
create index notifications_user_idx on public.notifications(user_id, read_at);
create index tutor_reviews_tutor_idx on public.tutor_reviews(tutor_id);
grant select,insert,update,delete on public.post_likes, public.messages, public.notifications, public.tutor_reviews to authenticated;
alter table public.post_likes enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.tutor_reviews enable row level security;
create policy read_likes on public.post_likes for select to authenticated using (true);
create policy own_likes on public.post_likes for insert to authenticated with check (user_id = auth.uid());
create policy unlike on public.post_likes for delete to authenticated using (user_id = auth.uid());
create policy read_messages on public.messages for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy send_messages on public.messages for insert to authenticated with check (sender_id = auth.uid() and recipient_id <> auth.uid());
create policy read_receipt on public.messages for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create policy delete_messages on public.messages for delete to authenticated using (sender_id = auth.uid());
create policy own_notifications on public.notifications for select to authenticated using (user_id = auth.uid());
create policy mark_notifications on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy clear_notifications on public.notifications for delete to authenticated using (user_id = auth.uid());
create policy read_reviews on public.tutor_reviews for select to authenticated using (true);
create policy write_review on public.tutor_reviews for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.bookings b where b.id = booking_id and b.tutor_id = tutor_id and b.user_id = auth.uid() and b.status = 'terminée'));
create policy delete_review on public.tutor_reviews for delete to authenticated using (user_id = auth.uid() or public.is_admin());
-- Notification triggers. security definer: they write rows the acting user may not read.
create function public.notify(uid uuid, kind text, title text, body text, link text) returns void language sql security definer set search_path = '' as $$ insert into public.notifications(user_id, kind, title, body, link) select uid, kind, title, left(body, 200), link where uid is not null and uid <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid) $$;
revoke all on function public.notify(uuid, text, text, text, text) from public;
create function public.on_reply() returns trigger language plpgsql security definer set search_path = '' as $$ declare p record; begin
 select user_id, title into p from public.posts where id = new.post_id;
 perform public.notify(p.user_id, 'reply', new.author || ' a répondu à « ' || p.title || ' »', new.body, '#communaute/' || new.post_id);
 return new; end; $$;
create function public.on_message() returns trigger language plpgsql security definer set search_path = '' as $$ declare n text; begin
 select display_name into n from public.profiles where id = new.sender_id;
 perform public.notify(new.recipient_id, 'message', 'Nouveau message de ' || n, new.body, '#communaute/messages/' || new.sender_id);
 return new; end; $$;
create function public.on_booking() returns trigger language plpgsql security definer set search_path = '' as $$ declare t record; begin
 select display_name, profile_id into t from public.tutors where id = new.tutor_id;
 if tg_op = 'INSERT' then
   perform public.notify(t.profile_id, 'booking', 'Nouvelle demande de séance · ' || new.subject, new.child || ' · ' || to_char(new.date, 'DD/MM') || ' ' || new.time, '#tutorat');
 elsif new.status <> old.status then
   perform public.notify(new.user_id, 'booking', 'Séance ' || new.status || ' · ' || new.subject || ' avec ' || t.display_name, to_char(new.date, 'DD/MM') || ' ' || new.time, '#tutorat');
   perform public.notify(t.profile_id, 'booking', 'Séance ' || new.status || ' · ' || new.subject, new.child || ' · ' || to_char(new.date, 'DD/MM'), '#tutorat');
 end if; return new; end; $$;
create function public.on_report_written() returns trigger language plpgsql security definer set search_path = '' as $$ declare b record; begin
 select user_id, subject into b from public.bookings where id = new.booking_id;
 perform public.notify(b.user_id, 'report', 'Compte rendu reçu · ' || b.subject, new.body, '#tutorat');
 return new; end; $$;
create function public.on_answer() returns trigger language plpgsql security definer set search_path = '' as $$ declare l record; begin
 if new.answer is not null and (old.answer is null or old.answer <> new.answer) then
   select course_id, title into l from public.lessons where id = new.lesson_id;
   perform public.notify(new.user_id, 'answer', 'L’équipe a répondu à votre question', l.title, '#cours/' || l.course_id);
 end if; return new; end; $$;
create function public.on_event_published() returns trigger language plpgsql security definer set search_path = '' as $$ begin
 if new.published and not old.published then
   perform public.notify(new.created_by, 'event', 'Votre rencontre est publiée', new.title, '#evenements');
 end if; return new; end; $$;
create function public.on_like() returns trigger language plpgsql security definer set search_path = '' as $$ declare p record; n text; begin
 select user_id, title into p from public.posts where id = new.post_id;
 select display_name into n from public.profiles where id = new.user_id;
 perform public.notify(p.user_id, 'like', n || ' aime « ' || p.title || ' »', '', '#communaute/' || new.post_id);
 return new; end; $$;
revoke all on function public.on_reply(), public.on_message(), public.on_booking(), public.on_report_written(), public.on_answer(), public.on_event_published(), public.on_like() from public;
create trigger notify_reply after insert on public.replies for each row execute function public.on_reply();
create trigger notify_message after insert on public.messages for each row execute function public.on_message();
create trigger notify_booking after insert or update on public.bookings for each row execute function public.on_booking();
create trigger notify_report after insert on public.tutor_reports for each row execute function public.on_report_written();
create trigger notify_answer after update on public.lesson_questions for each row execute function public.on_answer();
create trigger notify_event after update on public.events for each row execute function public.on_event_published();
create trigger notify_like after insert on public.post_likes for each row execute function public.on_like();

-- ===== Migration 202609060004_parented_v4.sql =====
-- ParentEd V4: real slot booking with advisers/coaches, practice exams, curriculum tracking and grades.
-- Directory covers tutors, advisers and coaches. Slots are concrete: availability ranges are cut into slot_minutes.
alter table public.tutors add column kind text not null default 'tuteur' check (kind in ('tuteur','conseiller','coach'));
alter table public.tutors add column slot_minutes integer not null default 60 check (slot_minutes in (30,45,60,90));
alter table public.tutors add column meeting_url text check (meeting_url is null or meeting_url ~ '^https://');
alter table public.tutors add column contact_email text check (contact_email is null or contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');
-- A booking is confirmed on creation when it lands on a free slot inside the announced availability.
drop policy request_booking on public.bookings;
create policy request_booking on public.bookings for insert to authenticated with check (family_id = public.current_family() and user_id = auth.uid() and status in ('demandée','confirmée') and exists (select 1 from public.tutors where id = tutor_id and published));
create function public.check_booking_slot() returns trigger language plpgsql security definer set search_path = '' as $$
declare wd integer; ok boolean; taken boolean;
begin
  if new.status not in ('demandée','confirmée') then return new; end if;
  wd := extract(isodow from new.date)::integer;
  select exists (select 1 from public.tutor_availability a where a.tutor_id = new.tutor_id and a.weekday = wd and a.start_time <= new.time and a.end_time > new.time) into ok;
  if not ok then raise exception 'Ce créneau ne fait pas partie des disponibilités annoncées.' using errcode = 'P0001'; end if;
  select exists (select 1 from public.bookings b where b.tutor_id = new.tutor_id and b.id <> new.id and b.status in ('demandée','confirmée') and b.time = new.time and (b.date = new.date or (b.weekly and b.date <= new.date and extract(isodow from b.date) = wd) or (new.weekly and new.date <= b.date and extract(isodow from b.date) = wd))) into taken;
  if taken then raise exception 'Ce créneau vient d’être réservé. Choisissez-en un autre.' using errcode = 'P0001'; end if;
  return new;
end; $$;
revoke all on function public.check_booking_slot() from public;
create trigger booking_slot before insert or update of date, time, weekly, status on public.bookings for each row execute function public.check_booking_slot();
-- Practice exams: fictitious training material, never official evaluations.
create table public.exams (id uuid primary key default gen_random_uuid(), title text not null check (length(title) between 1 and 160), subject text not null check (length(subject) between 1 and 80), level text not null default '' check (length(level) <= 80), description text not null default '', minutes integer not null default 20 check (minutes between 5 and 180), published boolean not null default false, position integer not null default 0);
create table public.exam_questions (id uuid primary key default gen_random_uuid(), exam_id uuid not null references public.exams on delete cascade, position integer not null default 0, prompt text not null check (length(prompt) between 1 and 2000), options text[] not null check (array_length(options, 1) between 2 and 6), answer_index integer not null check (answer_index >= 0), explanation text not null default '');
create table public.exam_attempts (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, user_id uuid not null default auth.uid() references public.profiles on delete cascade, exam_id uuid not null references public.exams on delete cascade, child text not null default '' check (length(child) <= 80), score integer not null check (score >= 0), total integer not null check (total > 0), answers integer[] not null default '{}', created_at timestamptz not null default now());
-- Curriculum: a family plan per child, cut into items that land on the calendar.
create table public.curricula (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, child text not null default '' check (length(child) <= 80), title text not null check (length(title) between 1 and 160), school_year text not null default '' check (length(school_year) <= 40), created_at timestamptz not null default now());
create table public.curriculum_items (id uuid primary key default gen_random_uuid(), curriculum_id uuid not null references public.curricula on delete cascade, family_id uuid not null default public.current_family() references public.families on delete cascade, subject text not null check (length(subject) between 1 and 80), title text not null check (length(title) between 1 and 200), planned_date date, done boolean not null default false, position integer not null default 0);
-- Grades: manual entries and exam results, per child and subject.
create table public.grades (id uuid primary key default gen_random_uuid(), family_id uuid not null default public.current_family() references public.families on delete cascade, child text not null check (length(child) between 1 and 80), subject text not null check (length(subject) between 1 and 80), title text not null check (length(title) between 1 and 160), score numeric not null check (score >= 0), max numeric not null check (max > 0), date date not null default current_date, source text not null default 'manuel' check (source in ('manuel','examen')), created_at timestamptz not null default now(), check (score <= max));
create index exam_questions_exam_idx on public.exam_questions(exam_id, position);
create index exam_attempts_family_idx on public.exam_attempts(family_id, created_at);
create index curricula_family_idx on public.curricula(family_id);
create index curriculum_items_family_idx on public.curriculum_items(family_id, planned_date);
create index grades_family_idx on public.grades(family_id, child, date);
grant select,insert,update,delete on public.exams, public.exam_questions, public.exam_attempts, public.curricula, public.curriculum_items, public.grades to authenticated;
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.curricula enable row level security;
alter table public.curriculum_items enable row level security;
alter table public.grades enable row level security;
create policy read_exams on public.exams for select to authenticated using (published or public.is_admin());
create policy admin_exams on public.exams for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy read_exam_questions on public.exam_questions for select to authenticated using (exists (select 1 from public.exams e where e.id = exam_id and (e.published or public.is_admin())));
create policy admin_exam_questions on public.exam_questions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy family_attempts on public.exam_attempts for all to authenticated using (family_id = public.current_family()) with check (family_id = public.current_family() and user_id = auth.uid());
create policy family_curricula on public.curricula for all to authenticated using (family_id = public.current_family()) with check (family_id = public.current_family());
create policy family_curriculum_items on public.curriculum_items for all to authenticated using (family_id = public.current_family()) with check (family_id = public.current_family() and exists (select 1 from public.curricula c where c.id = curriculum_id and c.family_id = public.current_family()));
create policy family_grades on public.grades for all to authenticated using (family_id = public.current_family()) with check (family_id = public.current_family());

-- ===== Migration 202609060005_parented_v5.sql =====
-- ParentEd V5: weighted grades and calendar import tracking.
alter table public.grades add column weight numeric not null default 1 check (weight > 0 and weight <= 100);
-- Imported calendar events keep their source identifier so a second import updates instead of duplicating.
alter table public.tasks add column source text not null default '' check (length(source) <= 300);
create index tasks_source_idx on public.tasks(family_id, source) where source <> '';

-- ===== Migration 202609060006_parented_v6.sql =====
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

-- ===== Contenus de démonstration fictifs (facultatif : supprimer cette section pour une base vide) =====
-- Fictitious learning content for local demonstration. Not production content.
insert into public.courses (id,title,description,category,position,published) values ('30000000-0000-4000-8000-000000000001','Trouver son rythme en famille','Une semaine souple, des repères solides. Posez les bases d’une organisation qui vous ressemble.','Organisation',1,true) on conflict(id) do nothing;
insert into public.courses (id,title,description,category,position,published) values ('30000000-0000-4000-8000-000000000002','Faire ses premiers pas','Clarifiez votre intention et repérez les ressources utiles pour commencer sereinement.','Pour commencer',2,true) on conflict(id) do nothing;
insert into public.courses (id,title,description,category,position,published) values ('30000000-0000-4000-8000-000000000003','Garder une trace des découvertes','Un portfolio simple pour voir le chemin parcouru, sans tout conserver.','Apprentissages',3,true) on conflict(id) do nothing;
insert into public.courses (id,title,description,category,position,published) values ('30000000-0000-4000-8000-000000000004','Préparer ses bilans sans stress','Comprendre à quoi servent les bilans de progression et rassembler ce qui compte, au fil de l’année.','Démarches',4,true) on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Observer avant de planifier',6,1,'Avant de remplir un calendrier, prenez le temps d’observer votre famille. À quel moment votre enfant est-il le plus disponible ? Quelles activités vous donnent de l’énergie ? Les réponses vous aideront à choisir des repères réalistes.

Pendant deux ou trois jours, notez les moments de concentration, les besoins de mouvement et les pauses spontanées. Il ne s’agit pas d’évaluer la performance de votre famille : cherchez simplement ce qui facilite votre quotidien.

Choisissez ensuite deux points d’appui : un moment pour commencer ensemble et un moment pour terminer. Entre les deux, gardez de la place pour les questions, les détours et le repos. Une routine utile vous soutient; elle peut évoluer.','Notez un moment où votre famille se sent disponible. Ajoutez ensuite un premier rendez-vous dans « Ma semaine ».',null,'Journal d’observation — trois jours

Jour 1
- Moment de grande disponibilité :
- Besoin de bouger vers :
- Pause spontanée :

Jour 2
- Moment de grande disponibilité :
- Besoin de bouger vers :
- Pause spontanée :

Jour 3
- Moment de grande disponibilité :
- Besoin de bouger vers :
- Pause spontanée :

Deux points d’appui choisis :
1.
2.') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','Construire une semaine souple',8,2,'Commencez par ce qui est déjà présent : repas, rendez-vous, sorties et temps de repos. Répartissez ensuite quelques intentions d’apprentissage dans les espaces disponibles. Évitez de planifier chaque minute.

Un mardi peut commencer par une lecture partagée, se poursuivre par une promenade d’observation et se terminer par un temps calme. Les durées dépendent de votre famille. Une activité commune peut donner lieu à des défis différents selon les enfants.

Prévoyez un espace libre chaque jour. Si une activité ne fonctionne pas, déplacez-la ou simplifiez-la. Le calendrier sert à rendre vos intentions visibles, pas à créer une obligation de tout accomplir.','Planifiez deux activités et une pause pour mardi. Choisissez « Toute la famille » lorsque l’activité est partagée.',null,'Plan hebdomadaire souple

Intentions de la semaine (2 ou 3 au plus) :
-
-

Repères fixes (repas, rendez-vous, sorties) :
-

Matin — moment pour commencer ensemble :
Après-midi — temps calme ou sortie :
Espace libre chaque jour : oui / à protéger

Ce que je déplace si la journée déborde :') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','Ajuster sans culpabiliser',5,3,'À la fin de la semaine, prenez quelques minutes pour regarder ce qui a aidé votre famille. Demandez à chacun de raconter une découverte et un moment difficile. Écoutez sans chercher tout de suite une solution.

Conservez un repère qui fonctionne et modifiez une seule chose pour la semaine suivante. Ce petit ajustement est plus facile à observer qu’un nouveau planning complet.

Une activité reportée ne signifie pas qu’aucun apprentissage n’a eu lieu. Vos observations et vos échanges permettent de comprendre le chemin parcouru. Pour les démarches officielles, consultez les ressources gouvernementales liées dans la bibliothèque.','Choisissez un repère à conserver la semaine prochaine et racontez pourquoi dans votre note personnelle, sous cette leçon.',null,'') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000002','Clarifier son intention',7,1,'Votre projet commence par une conversation. Qu’aimeriez-vous rendre possible dans votre quotidien ? Quels sont les besoins de votre enfant et les ressources dont vous disposez ?

Écrivez trois intentions concrètes, comme lire ensemble régulièrement ou apprendre à observer la nature. Distinguez vos envies des démarches administratives : les ressources officielles vous permettront de vérifier ces dernières.

Les cours ParentEd sont destinés aux parents et proposent des pistes d’organisation. Ils ne remplacent pas les informations gouvernementales ni un accompagnement professionnel adapté à votre situation.','Écrivez vos trois intentions. Consultez ensuite le portail officiel depuis la bibliothèque.',null,'Nos trois intentions

1. Nous aimerions…
   Parce que…
2. Nous aimerions…
   Parce que…
3. Nous aimerions…
   Parce que…

Ce qui relève des démarches officielles (à vérifier dans les ressources) :
-') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000003','Choisir une trace qui raconte',6,1,'Une trace utile raconte une découverte : une photo d’une construction, quelques phrases dictées ou un dessin accompagné d’une question. Conserver moins de traces, avec un peu de contexte, facilite leur relecture.

Notez la date, l’activité et ce que votre enfant souhaite raconter. Privilégiez ses mots et protégez sa vie privée. Les documents de votre espace familial ne sont pas publiés dans la communauté.

Prenez régulièrement le temps de revoir ces traces ensemble. Cet outil aide à observer les apprentissages; il ne constitue pas automatiquement un dossier répondant aux exigences officielles.','Choisissez un document sans données sensibles et ajoutez-le à votre portfolio privé, avec une courte note de contexte.',null,'Fiche de trace

Date :
Enfant :
Activité :
Ce que l’enfant raconte (ses mots) :
Ce que j’ai observé :
Question qui reste ouverte :') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000006','30000000-0000-4000-8000-000000000004','À quoi sert un bilan de progression',7,1,'Le cadre québécois prévoit des bilans qui décrivent la progression de l’enfant au fil de l’année. Leur but n’est pas de tout prouver : ils rendent lisible le chemin parcouru pour votre enfant, pour vous et pour votre interlocuteur.

Un bilan devient simple lorsqu’il s’appuie sur des traces déjà rassemblées : quelques notes datées, des photos choisies et vos observations. Le portfolio privé de ParentEd vous aide à les regrouper par enfant.

Ce cours explique la logique et propose une méthode de travail. Les exigences exactes, les dates et les formulaires appartiennent aux sources officielles : consultez-les depuis la bibliothèque et gardez la date de votre relevé.','Ouvrez la ressource « Démarche et étapes », puis notez dans votre plan hebdomadaire un moment de dix minutes, cette semaine, pour relire vos traces.',null,'Canevas de relecture avant un bilan

Période couverte :
Enfant :

Ce que nous avons exploré (3 à 5 points) :
-

Traces qui l’illustrent (dates) :
-

Ce que l’enfant dit avoir appris :

Ce que nous ajustons pour la suite :

Rappel : vérifier les attentes exactes et les échéances dans la source officielle.') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000001','L’enseignement à la maison au Québec','Le point de départ officiel pour retrouver les informations du ministère. Nos cours sont un accompagnement indépendant.','Pour commencer','https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison','Gouvernement du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000002','Démarche et étapes','Retrouvez les étapes et les documents à consulter directement auprès de la source officielle : avis, projet d’apprentissage, bilans et suivi.','Démarches','https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/demarche-etapes','Gouvernement du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000003','Services de soutien','Explorez les services publics décrits par le ministère et vérifiez les modalités qui concernent votre situation.','Accompagnement','https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien','Gouvernement du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000004','Guide des exigences (PDF officiel)','Le guide gouvernemental détaillé. Long à lire : nos cours « Faire ses premiers pas » et « Préparer ses bilans » proposent par où commencer.','Démarches','https://cdn-contenu.quebec.ca/cdn-contenu/education/enseignement-maison/Guide-exigences-enseignement-maison.pdf','Gouvernement du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000005','Vie privée : collecte de renseignements personnels','Repères de la Commission d’accès à l’information pour comprendre ce qu’une entreprise peut collecter. Utile pour choisir vos outils et applications.','Vie privée','https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/collecte-renseignements-personnels_entreprises','Commission d’accès à l’information du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.groups (id,name,description,kind,created_at) values ('a0000000-0000-4000-8000-000000000001','Montréal et environs','Familles de l’île de Montréal : rencontres au parc, sorties et entraide de proximité.','region','2026-09-01T12:00:00Z') on conflict(id) do nothing;
insert into public.groups (id,name,description,kind,created_at) values ('a0000000-0000-4000-8000-000000000002','Laval et Rive-Nord','Pour coordonner des activités et s’entraider au nord de la rivière.','region','2026-09-01T12:00:00Z') on conflict(id) do nothing;
insert into public.groups (id,name,description,kind,created_at) values ('a0000000-0000-4000-8000-000000000003','Débuter l’école maison','Vos premières questions, sans jugement : démarches, organisation et confiance.','theme','2026-09-01T12:00:00Z') on conflict(id) do nothing;
insert into public.groups (id,name,description,kind,created_at) values ('a0000000-0000-4000-8000-000000000004','Apprendre dehors','Nature, observation, sorties : partager nos idées d’apprentissage en plein air.','theme','2026-09-01T12:00:00Z') on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000001','Une matinée au jardin botanique','Observer les couleurs de l’automne et remplir un petit carnet nature ensemble. Rencontre fictive et gratuite pour la démonstration. Chaque enfant reste sous la supervision de son parent. Annulation possible depuis cette page.','2026-09-15','10:00','Montréal · Entrée du jardin','Camille — ParentEd (fictif)','6–12 ans',true,'Montréal','Gratuit',true,'none',null,'https://www.openstreetmap.org/?mlat=45.5590&mlon=-73.5630#map=16/45.5590/-73.5630',null,45.559,-73.563) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000003','Le parc du mardi','Rencontre récurrente au parc pour jouer, discuter et se retrouver chaque semaine. Rencontre fictive. Chaque famille apporte sa collation; les parents restent présents et responsables.','2026-09-08','14:30','Montréal · Parc Laurier, près des jeux d’eau','Camille — ParentEd (fictif)','Tous les âges',true,'Montréal','Gratuit',false,'weekly','2026-11-24','https://www.openstreetmap.org/?mlat=45.5310&mlon=-73.5880#map=16/45.5310/-73.5880',null,45.531,-73.588) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000005','Atelier robotique parent-enfant','Construire et programmer un petit robot en équipe parent-enfant, avec le matériel prêté par la bibliothèque. Rencontre fictive. Deux garçons de 9 et 12 ans l’ont proposée avec leur père; tous les enfants curieux sont bienvenus.','2026-09-26','10:00','Montréal · Bibliothèque Marc-Favreau','Youssef — membre (fictif)','8–14 ans',true,'Montréal','Gratuit, matériel prêté',false,'none',null,null,null,45.5265,-73.6142) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000006','Randonnée familiale au mont Saint-Bruno','Une boucle de 5 km à rythme d’enfant, arrêts d’observation et pique-nique au lac. Rencontre fictive. Les parents restent responsables de leurs enfants; prévoir de bonnes chaussures.','2026-10-03','09:30','Saint-Bruno · Accueil du parc national','Camille — ParentEd (fictif)','5 ans et plus',true,'Montérégie','Accès au parc à la charge des familles',false,'none',null,null,null,45.5509,-73.3336) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000008','Journée sciences au Centre des sciences','Visite guidée pensée pour les familles-écoles, en semaine quand c’est calme, puis atelier d’expériences. Rencontre fictive; tarif de groupe négocié par ParentEd.','2026-10-15','10:00','Montréal · Vieux-Port','Camille — ParentEd (fictif)','6–14 ans',true,'Montréal','12 $ par personne, tarif de groupe',true,'none',null,null,null,45.5049,-73.5507) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published,kind,slot_minutes,meeting_url,contact_email) values ('90000000-0000-4000-8000-000000000001',null,'Nadia',array['Mathématiques','Sciences']::text[],'Baccalauréat en enseignement au secondaire (fictif) · 6 ans d’expérience en soutien individuel · Références vérifiées par l’équipe (fictif)','J’aime partir de ce que l’enfant comprend déjà pour construire la suite, avec des manipulations concrètes. Séances individuelles, en ligne ou à la bibliothèque.','Environ 55 $ / heure, facturé directement par la tutrice','Montréal','les deux',true,'tuteur',60,'https://meet.jit.si/parented-nadia-demo',null) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published,kind,slot_minutes,meeting_url,contact_email) values ('90000000-0000-4000-8000-000000000002',null,'Karim',array['Français','Anglais']::text[],'Maîtrise en didactique des langues (fictif) · Ateliers de lecture pour 6–12 ans · Références vérifiées par l’équipe (fictif)','Lecture, écriture et plaisir des mots. Je propose des séances courtes et régulières plutôt que de longs blocs.','45 à 60 $ / heure selon la formule, facturé directement','Laval et Rive-Nord','en ligne',true,'tuteur',45,'https://meet.jit.si/parented-karim-demo',null) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published,kind,slot_minutes,meeting_url,contact_email) values ('90000000-0000-4000-8000-000000000004',null,'Julie',array['Démarches et bilans','Projet d’apprentissage']::text[],'Ancienne conseillère pédagogique (fictif) · accompagne les familles dans l’avis, le projet d’apprentissage et les bilans','Une rencontre de 30 minutes pour relire votre projet d’apprentissage ou préparer un bilan. Je ne remplace pas la source officielle : je vous aide à vous y retrouver.','Inclus dans l’abonnement, 2 rencontres par famille et par année (fictif)','En ligne','en ligne',true,'conseiller',30,'https://meet.jit.si/parented-julie-demo',null) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published,kind,slot_minutes,meeting_url,contact_email) values ('90000000-0000-4000-8000-000000000005',null,'Omar',array['Organisation familiale','Motivation']::text[],'Coach parental certifié (fictif) · 8 ans auprès de familles en école maison','Quand la semaine déborde ou que la motivation baisse, on prend 45 minutes pour retrouver un rythme qui vous ressemble.','60 $ la rencontre, facturé directement','Montréal','les deux',true,'coach',45,null,null) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published,kind,slot_minutes,meeting_url,contact_email) values ('90000000-0000-4000-8000-000000000003',null,'Profil en préparation',array['Musique']::text[],'Vérification des références en cours (fictif)','','','Montréal','en personne',false,'tuteur',60,null,null) on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001',2,'13:00','16:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000001',4,'09:00','12:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000002',3,'14:00','17:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000004','90000000-0000-4000-8000-000000000002',6,'09:00','12:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000005','90000000-0000-4000-8000-000000000004',1,'19:00','21:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000006','90000000-0000-4000-8000-000000000004',3,'12:00','14:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000007','90000000-0000-4000-8000-000000000005',5,'09:00','12:00') on conflict(id) do nothing;
insert into public.exams (id,title,subject,level,description,minutes,published,position) values ('c0000000-0000-4000-8000-000000000001','Fractions et nombres décimaux','Mathématiques','Primaire · 4e année','Examen d’entraînement fictif inspiré du format des épreuves : 6 questions à choix multiples avec explications. Ce n’est pas une évaluation officielle.',15,true,1) on conflict(id) do nothing;
insert into public.exams (id,title,subject,level,description,minutes,published,position) values ('c0000000-0000-4000-8000-000000000002','Compréhension de lecture : le jardin de Léa','Français','Primaire · 4e année','Un court texte suivi de questions de compréhension, d’inférence et de vocabulaire. Entraînement fictif, non officiel.',20,true,2) on conflict(id) do nothing;
insert into public.exams (id,title,subject,level,description,minutes,published,position) values ('c0000000-0000-4000-8000-000000000003','Le cycle de l’eau et les états de la matière','Sciences','Primaire · 3e et 4e années','Questions d’observation et de raisonnement scientifique. Entraînement fictif, non officiel.',15,true,3) on conflict(id) do nothing;
insert into public.exams (id,title,subject,level,description,minutes,published,position) values ('c0000000-0000-4000-8000-000000000004','Grammaire : accords dans le groupe du nom','Français','Primaire · 5e année','Accords du déterminant, de l’adjectif et du nom; pluriels particuliers. Entraînement fictif, non officiel.',15,true,4) on conflict(id) do nothing;
insert into public.exams (id,title,subject,level,description,minutes,published,position) values ('c0000000-0000-4000-8000-000000000005','Multiplication, division et problèmes','Mathématiques','Primaire · 5e et 6e années','Calculs, ordre de grandeur et petits problèmes à étapes. Entraînement fictif, non officiel.',20,true,5) on conflict(id) do nothing;
insert into public.exams (id,title,subject,level,description,minutes,published,position) values ('c0000000-0000-4000-8000-000000000006','Le Québec : territoire et société vers 1905','Univers social','Primaire · 4e année','Repères de géographie et d’histoire du Québec au début du XXe siècle. Entraînement fictif, non officiel.',15,true,6) on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000031','c0000000-0000-4000-8000-000000000004',1,'Quelle phrase est correctement accordée ?',array['Les petit chats dorment.','Les petits chats dorment.','Les petits chat dorment.','Le petits chats dorment.']::text[],1,'Le déterminant, l’adjectif et le nom s’accordent tous au pluriel : les petits chats.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000032','c0000000-0000-4000-8000-000000000004',2,'Quel est le pluriel de « un cheval » ?',array['des chevals','des chevaux','des chevaus','des chevalx']::text[],1,'La plupart des noms en -al font leur pluriel en -aux : chevaux.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000033','c0000000-0000-4000-8000-000000000004',3,'Dans « une belle maison », l’adjectif est…',array['masculin singulier','féminin singulier','féminin pluriel','masculin pluriel']::text[],1,'L’adjectif s’accorde avec « maison », nom féminin singulier.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000034','c0000000-0000-4000-8000-000000000004',4,'Quel groupe du nom est bien accordé ?',array['des histoires drôle','des histoire drôles','des histoires drôles','de histoires drôles']::text[],2,'Déterminant, nom et adjectif au pluriel : des histoires drôles.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000035','c0000000-0000-4000-8000-000000000004',5,'Quel est le pluriel de « un bijou » ?',array['des bijous','des bijoux','des bijoues','des bijaux']::text[],1,'Bijou, caillou, chou, genou, hibou, joujou, pou prennent un x au pluriel.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000041','c0000000-0000-4000-8000-000000000005',1,'Combien font 24 × 6 ?',array['124','144','148','164']::text[],1,'20 × 6 = 120 et 4 × 6 = 24; 120 + 24 = 144.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000042','c0000000-0000-4000-8000-000000000005',2,'Combien font 156 ÷ 12 ?',array['12','13','14','16']::text[],1,'12 × 13 = 156.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000043','c0000000-0000-4000-8000-000000000005',3,'Yanis achète 3 cahiers à 2,50 $ et un crayon à 1,20 $. Combien paie-t-il ?',array['7,50 $','8,70 $','9,20 $','6,70 $']::text[],1,'3 × 2,50 = 7,50; plus 1,20 = 8,70 $.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000044','c0000000-0000-4000-8000-000000000005',4,'Quel nombre est le plus proche de 39 × 21 ?',array['600','800','1 000','1 200']::text[],1,'39 × 21 ≈ 40 × 20 = 800.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000045','c0000000-0000-4000-8000-000000000005',5,'Un autobus transporte 45 élèves. Il faut 4 autobus pour une sortie. Combien d’élèves au total ?',array['160','180','200','185']::text[],1,'45 × 4 = 180.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000046','c0000000-0000-4000-8000-000000000005',6,'Quel est le reste de 50 ÷ 7 ?',array['0','1','7','8']::text[],1,'7 × 7 = 49; il reste 1.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000051','c0000000-0000-4000-8000-000000000006',1,'Vers 1905, quel fleuve traverse le territoire québécois d’ouest en est ?',array['Le Mississippi','Le Saint-Laurent','Le Fraser','La Seine']::text[],1,'Le Saint-Laurent structure le peuplement et le commerce du Québec.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000052','c0000000-0000-4000-8000-000000000006',2,'Quelle activité économique se développe fortement dans les villes vers 1905 ?',array['L’industrie et les usines','La chasse à la baleine','L’exploitation pétrolière','Le tourisme spatial']::text[],0,'L’industrialisation attire les travailleurs vers Montréal et Québec.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000053','c0000000-0000-4000-8000-000000000006',3,'Quel moyen de transport relie les régions du Québec au début du XXe siècle ?',array['L’avion de ligne','Le chemin de fer','L’autoroute','Le métro']::text[],1,'Le train transporte marchandises et voyageurs entre les régions.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000054','c0000000-0000-4000-8000-000000000006',4,'Quelle ressource attire les colons vers le nord (Abitibi, Saguenay) à cette époque ?',array['La forêt et les mines','Les plages','Le sable du désert','Les volcans']::text[],0,'Forêt, pâtes et papiers, puis les mines.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000055','c0000000-0000-4000-8000-000000000006',5,'Quelle est la plus grande ville du Québec vers 1905 ?',array['Trois-Rivières','Sherbrooke','Montréal','Gatineau']::text[],2,'Montréal est déjà la métropole industrielle et commerciale.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001',1,'Quelle fraction représente la moitié d’une pizza coupée en 8 parts égales ?',array['2/8','4/8','8/4','1/8']::text[],1,'La moitié de 8 parts, c’est 4 parts : 4/8, qui vaut aussi 1/2.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000002','c0000000-0000-4000-8000-000000000001',2,'Laquelle de ces fractions est la plus grande ?',array['1/3','1/4','1/2','1/5']::text[],2,'Quand le numérateur est 1, plus le dénominateur est petit, plus la part est grande : 1/2 est la plus grande.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000003','c0000000-0000-4000-8000-000000000001',3,'Combien font 0,5 + 0,25 ?',array['0,30','0,75','0,525','1,25']::text[],1,'0,5 c’est 50 centièmes; 0,25 c’est 25 centièmes; ensemble 75 centièmes : 0,75.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000004','c0000000-0000-4000-8000-000000000001',4,'Dans 3/4, comment s’appelle le nombre 4 ?',array['Le numérateur','Le dénominateur','Le quotient','Le reste']::text[],1,'Le nombre du bas, qui dit en combien de parts on a coupé, est le dénominateur.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000005','c0000000-0000-4000-8000-000000000001',5,'Quelle fraction est équivalente à 2/3 ?',array['4/6','3/2','2/6','6/4']::text[],0,'En multipliant le haut et le bas par 2, 2/3 devient 4/6 : même quantité.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000006','c0000000-0000-4000-8000-000000000001',6,'Un ruban de 1,2 m est coupé en 4 morceaux égaux. Quelle est la longueur d’un morceau ?',array['0,3 m','0,4 m','0,48 m','3 m']::text[],0,'1,2 ÷ 4 = 0,3 : chaque morceau mesure 30 cm.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000011','c0000000-0000-4000-8000-000000000002',1,'Texte : « Léa arrose ses tomates chaque matin avant l’école. Ce matin, elle a oublié, et les feuilles pendent tristement. » Pourquoi les feuilles pendent-elles ?',array['Il a trop plu','Les plants manquent d’eau','C’est l’automne','Léa les a taillées']::text[],1,'Le texte relie l’oubli d’arrosage aux feuilles qui pendent : les plants manquent d’eau.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000012','c0000000-0000-4000-8000-000000000002',2,'Dans « les feuilles pendent tristement », le mot « tristement » sert à…',array['Nommer une personne','Décrire la manière','Indiquer un lieu','Poser une question']::text[],1,'« Tristement » est un adverbe : il décrit la manière dont les feuilles pendent.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000013','c0000000-0000-4000-8000-000000000002',3,'Quel titre résume le mieux ce passage ?',array['Une récolte abondante','Un matin d’oubli','La rentrée de Léa','Le marché du village']::text[],1,'L’idée principale est l’oubli du matin et sa conséquence.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000014','c0000000-0000-4000-8000-000000000002',4,'Quel mot est un synonyme de « pendent » dans ce contexte ?',array['Se dressent','S’affaissent','Fleurissent','Grimpent']::text[],1,'Des feuilles qui pendent s’affaissent, retombent vers le bas.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000015','c0000000-0000-4000-8000-000000000002',5,'Que fera probablement Léa ensuite ?',array['Arroser ses tomates','Acheter des tomates','Déménager','Fermer le jardin']::text[],0,'L’inférence la plus logique : réparer l’oubli en arrosant.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000021','c0000000-0000-4000-8000-000000000003',1,'Quand l’eau d’une flaque disparaît au soleil, on parle de…',array['Fusion','Évaporation','Condensation','Solidification']::text[],1,'L’eau liquide devient vapeur : c’est l’évaporation.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000022','c0000000-0000-4000-8000-000000000003',2,'Les gouttes sur l’extérieur d’un verre froid viennent…',array['Du verre qui fuit','De la vapeur d’eau de l’air qui se condense','De la glace qui fond dans le verre','De la pluie']::text[],1,'La vapeur d’eau de l’air se refroidit au contact du verre et redevient liquide : condensation.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000023','c0000000-0000-4000-8000-000000000003',3,'À quelle température l’eau pure gèle-t-elle ?',array['0 °C','10 °C','100 °C','−100 °C']::text[],0,'L’eau pure se solidifie à 0 °C au niveau de la mer.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000024','c0000000-0000-4000-8000-000000000003',4,'Quel est le bon ordre du cycle de l’eau ?',array['Précipitation → évaporation → condensation','Évaporation → condensation → précipitation','Condensation → évaporation → précipitation','Précipitation → condensation → évaporation']::text[],1,'L’eau s’évapore, la vapeur se condense en nuages, puis retombe en précipitations.') on conflict(id) do nothing;
insert into public.exam_questions (id,exam_id,position,prompt,options,answer_index,explanation) values ('c1000000-0000-4000-8000-000000000025','c0000000-0000-4000-8000-000000000003',5,'Pour vérifier une hypothèse, un scientifique…',array['Demande à un ami','Fait une expérience et observe','Devine la réponse','Change de question']::text[],1,'La démarche scientifique passe par l’expérience et l’observation.') on conflict(id) do nothing;
commit;
