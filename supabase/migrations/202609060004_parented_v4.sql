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
