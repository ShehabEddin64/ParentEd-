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
