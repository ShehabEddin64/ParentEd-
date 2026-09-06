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
