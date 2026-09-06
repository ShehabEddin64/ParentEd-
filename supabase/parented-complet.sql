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
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by) values ('70000000-0000-4000-8000-000000000001','Une matinée au jardin botanique','Observer les couleurs de l’automne et remplir un petit carnet nature ensemble. Rencontre fictive et gratuite pour la démonstration. Chaque enfant reste sous la supervision de son parent. Annulation possible depuis cette page.','2026-09-15','10:00','Montréal · Entrée du jardin','Camille — ParentEd (fictif)','6–12 ans',true,'Montréal','Gratuit',true,'none',null,'https://www.openstreetmap.org/?mlat=45.5590&mlon=-73.5630#map=16/45.5590/-73.5630',null) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by) values ('70000000-0000-4000-8000-000000000002','Café des parents : nos routines','Un temps d’échange pour partager ce qui fonctionne, poser ses questions et repartir avec une idée. Rencontre fictive et gratuite. Les parents restent responsables de leurs enfants. Désinscription libre.','2026-09-18','13:30','Montréal · Bibliothèque de quartier','Sami — membre (fictif)','Parents et enfants',true,'Montréal','Gratuit',false,'none',null,null,null) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by) values ('70000000-0000-4000-8000-000000000003','Le parc du mardi','Rencontre récurrente au parc pour jouer, discuter et se retrouver chaque semaine. Rencontre fictive. Chaque famille apporte sa collation; les parents restent présents et responsables.','2026-09-08','14:30','Montréal · Parc Laurier, près des jeux d’eau','Camille — ParentEd (fictif)','Tous les âges',true,'Montréal','Gratuit',false,'weekly','2026-11-24','https://www.openstreetmap.org/?mlat=45.5310&mlon=-73.5880#map=16/45.5310/-73.5880',null) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by) values ('70000000-0000-4000-8000-000000000004','Samedi découverte : le marché et ses saisons','Une sortie du week-end pour observer les produits d’ici, calculer un petit budget et discuter avec les producteurs. Rencontre fictive. Les achats restent à la charge de chaque famille.','2026-09-19','09:30','Laval · Marché public','Camille — ParentEd (fictif)','5–14 ans',true,'Laval et Rive-Nord','Entrée libre',false,'none',null,null,null) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published) values ('90000000-0000-4000-8000-000000000001',null,'Nadia',array['Mathématiques','Sciences']::text[],'Baccalauréat en enseignement au secondaire (fictif) · 6 ans d’expérience en soutien individuel · Références vérifiées par l’équipe (fictif)','J’aime partir de ce que l’enfant comprend déjà pour construire la suite, avec des manipulations concrètes. Séances individuelles, en ligne ou à la bibliothèque.','Environ 55 $ / heure, facturé directement par la tutrice','Montréal','les deux',true) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published) values ('90000000-0000-4000-8000-000000000002',null,'Karim',array['Français','Anglais']::text[],'Maîtrise en didactique des langues (fictif) · Ateliers de lecture pour 6–12 ans · Références vérifiées par l’équipe (fictif)','Lecture, écriture et plaisir des mots. Je propose des séances courtes et régulières plutôt que de longs blocs.','45 à 60 $ / heure selon la formule, facturé directement','Laval et Rive-Nord','en ligne',true) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published) values ('90000000-0000-4000-8000-000000000003',null,'Profil en préparation',array['Musique']::text[],'Vérification des références en cours (fictif)','','','Montréal','en personne',false) on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001',2,'13:00','16:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000001',4,'09:00','12:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000002',3,'14:00','17:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000004','90000000-0000-4000-8000-000000000002',6,'09:00','12:00') on conflict(id) do nothing;
commit;
