export type Role = "parent" | "admin" | "tutor";
export type Profile = {
  id: string;
  family_id: string;
  display_name: string;
  role: Role;
  city: string;
  lat: number | null;
  lng: number | null;
  bio: string;
  children_ages: string;
  interests: string[];
  show_on_map: boolean;
  created_at: string;
};
/** Public directory row (view): never carries family_id. */
export type Member = Omit<Profile, "family_id">;
export type EventCount = { id: string; event_id: string; count: number };
export type PostLike = { id: string; post_id: string; user_id: string };
export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};
export type NotificationKind =
  "reply" | "message" | "booking" | "report" | "answer" | "event" | "like";
export type Notification = {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link: string;
  created_at: string;
  read_at: string | null;
};
export type TutorReview = {
  id: string;
  tutor_id: string;
  booking_id: string;
  user_id: string;
  author: string;
  rating: number;
  body: string;
  created_at: string;
};
export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  position: number;
  published: boolean;
};
export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  body: string;
  exercise: string;
  minutes: number;
  position: number;
  video_url: string | null;
  template: string;
};
export type Progress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
};
export type LessonNote = {
  id: string;
  user_id: string;
  lesson_id: string;
  body: string;
  updated_at: string;
};
export type LessonQuestion = {
  id: string;
  lesson_id: string;
  user_id: string;
  author: string;
  body: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
};
export type Task = {
  id: string;
  family_id: string;
  title: string;
  child: string;
  date: string;
  time: string;
  done: boolean;
  source: string;
};
export type Post = {
  id: string;
  user_id: string;
  author: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  group_id: string | null;
  pinned: boolean;
  updated_at: string | null;
};
export type Reply = {
  id: string;
  post_id: string;
  user_id: string;
  author: string;
  body: string;
  created_at: string;
};
export type Group = {
  id: string;
  name: string;
  description: string;
  kind: "region" | "theme";
  created_at: string;
};
export type GroupMember = { id: string; group_id: string; user_id: string };
export type Recurrence = "none" | "weekly" | "biweekly" | "monthly";
export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  age: string;
  published: boolean;
  region: string;
  price: string;
  featured: boolean;
  recurrence: Recurrence;
  recurrence_until: string | null;
  map_url: string | null;
  created_by: string | null;
  lat: number | null;
  lng: number | null;
};
export type Registration = { id: string; event_id: string; user_id: string };
export type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  source: string;
  checked_at: string;
};
export type Favorite = { id: string; user_id: string; resource_id: string };
export type Document = {
  id: string;
  family_id: string;
  title: string;
  path: string;
  created_at: string;
  child: string;
  note: string;
};
export type Report = {
  id: string;
  post_id: string;
  user_id: string;
  reason: string;
  created_at: string;
};
export type Tutor = {
  id: string;
  profile_id: string | null;
  display_name: string;
  subjects: string[];
  qualifications: string;
  bio: string;
  rate_hint: string;
  region: string;
  mode: "en ligne" | "en personne" | "les deux";
  published: boolean;
  kind: "tuteur" | "conseiller" | "coach";
  slot_minutes: 30 | 45 | 60 | 90;
  meeting_url: string | null;
  contact_email: string | null;
};
export const tutorKindLabels = {
  tuteur: "Tuteur",
  conseiller: "Conseiller",
  coach: "Coach parental",
} as const;
export type Exam = {
  id: string;
  title: string;
  subject: string;
  level: string;
  description: string;
  minutes: number;
  published: boolean;
  position: number;
};
export type ExamQuestion = {
  id: string;
  exam_id: string;
  position: number;
  prompt: string;
  options: string[];
  answer_index: number;
  explanation: string;
};
export type ExamAttempt = {
  id: string;
  family_id: string;
  user_id: string;
  exam_id: string;
  child: string;
  score: number;
  total: number;
  answers: number[];
  created_at: string;
};
export type Curriculum = {
  id: string;
  family_id: string;
  child: string;
  title: string;
  school_year: string;
  created_at: string;
};
export type CurriculumItem = {
  id: string;
  curriculum_id: string;
  family_id: string;
  subject: string;
  title: string;
  planned_date: string | null;
  done: boolean;
  position: number;
};
export type Grade = {
  id: string;
  family_id: string;
  child: string;
  subject: string;
  title: string;
  score: number;
  max: number;
  date: string;
  source: "manuel" | "examen";
  created_at: string;
  weight: number;
};
export type TutorAvailability = {
  id: string;
  tutor_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};
export type BookingStatus = "demandée" | "confirmée" | "annulée" | "terminée";
export type Booking = {
  id: string;
  tutor_id: string;
  family_id: string;
  user_id: string;
  child: string;
  subject: string;
  date: string;
  time: string;
  weekly: boolean;
  status: BookingStatus;
  note: string;
  created_at: string;
};
export type TutorReport = {
  id: string;
  booking_id: string;
  tutor_id: string;
  body: string;
  created_at: string;
};
export type Child = {
  id: string;
  family_id: string;
  name: string;
  birth_year: number | null;
  notes: string;
};
export type WeekPlan = {
  id: string;
  family_id: string;
  week_start: string;
  intentions: string;
};
export type LibraryItem = {
  id: string;
  family_id: string;
  title: string;
  kind: "livre" | "lien" | "autre";
  author: string;
  url: string | null;
  child: string;
  notes: string;
  created_at: string;
};
export type Note = {
  id: string;
  family_id: string;
  child: string;
  date: string;
  title: string;
  body: string;
  created_at: string;
};
export type AssistantUsage = {
  id: string;
  user_id: string;
  day: string;
  questions: number;
  input_tokens: number;
  output_tokens: number;
};
export type Tables = {
  profiles: Profile;
  courses: Course;
  lessons: Lesson;
  progress: Progress;
  lesson_notes: LessonNote;
  lesson_questions: LessonQuestion;
  tasks: Task;
  posts: Post;
  replies: Reply;
  groups: Group;
  group_members: GroupMember;
  events: Event;
  registrations: Registration;
  resources: Resource;
  favorites: Favorite;
  documents: Document;
  reports: Report;
  tutors: Tutor;
  tutor_availability: TutorAvailability;
  bookings: Booking;
  tutor_reports: TutorReport;
  children: Child;
  week_plans: WeekPlan;
  library_items: LibraryItem;
  notes: Note;
  members: Member;
  event_counts: EventCount;
  post_likes: PostLike;
  messages: Message;
  notifications: Notification;
  tutor_reviews: TutorReview;
  exams: Exam;
  exam_questions: ExamQuestion;
  exam_attempts: ExamAttempt;
  curricula: Curriculum;
  curriculum_items: CurriculumItem;
  grades: Grade;
  assistant_usage: AssistantUsage;
};
export type Table = keyof Tables;
export type Data = { [K in Table]: Tables[K][] };
export const tableNames: Table[] = [
  "profiles",
  "courses",
  "lessons",
  "progress",
  "lesson_notes",
  "lesson_questions",
  "tasks",
  "posts",
  "replies",
  "groups",
  "group_members",
  "events",
  "registrations",
  "resources",
  "favorites",
  "documents",
  "reports",
  "tutors",
  "tutor_availability",
  "bookings",
  "tutor_reports",
  "children",
  "week_plans",
  "library_items",
  "notes",
  "members",
  "event_counts",
  "post_likes",
  "messages",
  "notifications",
  "tutor_reviews",
  "exams",
  "exam_questions",
  "exam_attempts",
  "curricula",
  "curriculum_items",
  "grades",
  "assistant_usage",
];
/** Views: loaded, never written. */
export const readOnlyTables: Table[] = [
  "members",
  "event_counts",
  "assistant_usage",
];
/** Tables whose rows belong to a family or a person; never shared. */
export const privateTables: Table[] = [
  "tasks",
  "documents",
  "children",
  "week_plans",
  "library_items",
  "notes",
];
export function completion(lessons: Lesson[], progress: Progress[]) {
  return lessons.length
    ? Math.round(
        (lessons.filter((l) => progress.some((p) => p.lesson_id === l.id))
          .length /
          lessons.length) *
          100,
      )
    : 0;
}
export function required(value: string, max = 5000) {
  const clean = value.trim();
  if (!clean || clean.length > max)
    throw new Error(`Saisissez un texte de 1 à ${max} caractères.`);
  return clean;
}
export function optional(value: string, max = 5000) {
  const clean = value.trim();
  if (clean.length > max)
    throw new Error(`Ce texte dépasse ${max} caractères.`);
  return clean;
}
export function weekDates(anchor: string) {
  const d = new Date(anchor + "T12:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return localDate(x);
  });
}
export function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function shiftDate(date: string, days: number) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return localDate(d);
}
export function shiftMonth(date: string, months: number) {
  const d = new Date(date + "T12:00:00");
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return localDate(d);
}
/** ISO weekday: 1 = lundi … 7 = dimanche. */
export function weekday(date: string) {
  const d = new Date(date + "T12:00:00").getDay();
  return d === 0 ? 7 : d;
}
export const weekdayNames = [
  "",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
export function isWeekend(date: string) {
  return weekday(date) >= 6;
}
export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  },
) {
  return new Date(date + "T12:00:00").toLocaleDateString("fr-CA", options);
}
export type Occurrence = { event: Event; date: string; key: string };
/**
 * Expands recurring events into dated occurrences between two dates (inclusive).
 * A non-recurring event yields its own date only. Capped to avoid runaway series.
 */
export function occurrences(
  events: Event[],
  from: string,
  to: string,
  limit = 400,
): Occurrence[] {
  const out: Occurrence[] = [];
  for (const e of events) {
    let date = e.date;
    const until =
      e.recurrence === "none"
        ? e.date
        : e.recurrence_until && e.recurrence_until < to
          ? e.recurrence_until
          : to;
    let guard = 0;
    while (date <= until && guard++ < limit) {
      if (date >= from) out.push({ event: e, date, key: e.id + "@" + date });
      if (e.recurrence === "none") break;
      date =
        e.recurrence === "weekly"
          ? shiftDate(date, 7)
          : e.recurrence === "biweekly"
            ? shiftDate(date, 14)
            : shiftMonth(date, 1);
    }
  }
  return out.sort((a, b) =>
    (a.date + a.event.time).localeCompare(b.date + b.event.time),
  );
}
export const recurrenceLabels: Record<Recurrence, string> = {
  none: "Une seule fois",
  weekly: "Chaque semaine",
  biweekly: "Toutes les deux semaines",
  monthly: "Chaque mois",
};
/** Builds an iCalendar file so the parent can add a reminder to their own calendar. */
export function icsFor(event: Event, date = event.date) {
  const stamp = (d: string, t: string) =>
    d.replaceAll("-", "") + "T" + t.replace(":", "") + "00";
  const endHour = String((Number(event.time.slice(0, 2)) + 1) % 24).padStart(
    2,
    "0",
  );
  const escape = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/[,;]/g, (m) => "\\" + m);
  const rule =
    event.recurrence === "weekly"
      ? "RRULE:FREQ=WEEKLY"
      : event.recurrence === "biweekly"
        ? "RRULE:FREQ=WEEKLY;INTERVAL=2"
        : event.recurrence === "monthly"
          ? "RRULE:FREQ=MONTHLY"
          : "";
  const until =
    rule && event.recurrence_until
      ? ";UNTIL=" + event.recurrence_until.replaceAll("-", "") + "T235959"
      : "";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ParentEd//FR",
    "BEGIN:VEVENT",
    `UID:${event.id}@parented`,
    `DTSTART;TZID=America/Toronto:${stamp(date, event.time)}`,
    `DTEND;TZID=America/Toronto:${stamp(date, endHour + event.time.slice(2))}`,
    rule ? rule + until : "",
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.location)}`,
    `DESCRIPTION:${escape(event.description + "\nOrganisé par " + event.organizer + ". " + event.price + ".")}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape("Demain : " + event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
export function safeUrl(url: string) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
export const maxFileSize = 5 * 1024 * 1024;
export function validateFile(file: { size: number; type: string }) {
  if (
    file.size > maxFileSize ||
    !["application/pdf", "image/png", "image/jpeg"].includes(file.type)
  )
    throw new Error("Choisissez un PDF, PNG ou JPEG de 5 Mo maximum.");
}
export function validatePassword(password: string) {
  if (password.length < 12)
    throw new Error("Choisissez un mot de passe d’au moins 12 caractères.");
  return password;
}
export const bookingStatusLabels: Record<BookingStatus, string> = {
  demandée: "Demande envoyée",
  confirmée: "Confirmée",
  annulée: "Annulée",
  terminée: "Terminée",
};

/** Coarse locations offered for member profiles: city centres only, never home addresses. */
export const quebecCities: { name: string; lat: number; lng: number }[] = [
  { name: "Montréal", lat: 45.5019, lng: -73.5674 },
  { name: "Laval", lat: 45.6066, lng: -73.7124 },
  { name: "Longueuil", lat: 45.5312, lng: -73.5181 },
  { name: "Brossard", lat: 45.4587, lng: -73.4658 },
  { name: "Terrebonne", lat: 45.7, lng: -73.6472 },
  { name: "Repentigny", lat: 45.7422, lng: -73.4506 },
  { name: "Saint-Jérôme", lat: 45.7806, lng: -74.0036 },
  { name: "Vaudreuil-Dorion", lat: 45.4, lng: -74.0333 },
  { name: "Saint-Jean-sur-Richelieu", lat: 45.3071, lng: -73.2626 },
  { name: "Granby", lat: 45.4001, lng: -72.7326 },
  { name: "Drummondville", lat: 45.8833, lng: -72.4833 },
  { name: "Sherbrooke", lat: 45.4042, lng: -71.8929 },
  { name: "Trois-Rivières", lat: 46.3432, lng: -72.5429 },
  { name: "Québec", lat: 46.8139, lng: -71.208 },
  { name: "Lévis", lat: 46.8033, lng: -71.1779 },
  { name: "Saguenay", lat: 48.4281, lng: -71.0684 },
  { name: "Gatineau", lat: 45.4765, lng: -75.7013 },
  { name: "Rimouski", lat: 48.4489, lng: -68.5236 },
  { name: "Rouyn-Noranda", lat: 48.2359, lng: -79.0244 },
  { name: "Sept-Îles", lat: 50.2001, lng: -66.3821 },
  { name: "Ailleurs au Québec", lat: 46.5, lng: -72.5 },
  { name: "Hors Québec", lat: 45.4215, lng: -75.6972 },
];
export const interestOptions = [
  "Nature et plein air",
  "Sciences",
  "Lecture",
  "Arts et bricolage",
  "Musique",
  "Sport",
  "Cuisine",
  "Langues",
  "Mathématiques",
  "Histoire",
  "Jeux de société",
  "Entraide entre parents",
];
export function averageRating(reviews: { rating: number }[]) {
  return reviews.length
    ? Math.round(
        (reviews.reduce((n, r) => n + r.rating, 0) / reviews.length) * 10,
      ) / 10
    : null;
}
export function timeAgo(iso: string, now = new Date()) {
  const minutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-CA");
}

/** Adds minutes to an HH:MM time. */
export function addMinutes(time: string, minutes: number) {
  const total =
    Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
export type Slot = { date: string; time: string; taken: boolean };
/**
 * Cuts announced availability into concrete slots for the coming days and marks those already booked,
 * including weekly bookings that recur on the same weekday. Mirrors the SQL trigger check_booking_slot.
 */
export function slotsFor(
  tutor: Tutor,
  availability: TutorAvailability[],
  bookings: Booking[],
  from: string,
  days = 14,
): Slot[] {
  const out: Slot[] = [];
  const active = bookings.filter(
    (b) =>
      b.tutor_id === tutor.id && ["demandée", "confirmée"].includes(b.status),
  );
  for (let i = 0; i < days; i++) {
    const date = shiftDate(from, i);
    const wd = weekday(date);
    for (const a of availability.filter(
      (x) => x.tutor_id === tutor.id && x.weekday === wd,
    )) {
      for (
        let t = a.start_time;
        addMinutes(t, tutor.slot_minutes) <= a.end_time && t < a.end_time;
        t = addMinutes(t, tutor.slot_minutes)
      ) {
        const taken = active.some(
          (b) =>
            b.time === t &&
            (b.date === date ||
              (b.weekly && b.date <= date && weekday(b.date) === wd)),
        );
        out.push({ date, time: t, taken });
      }
    }
  }
  return out;
}
/** Parses a pasted curriculum: one item per line, "Matière | Titre" or "Matière ; Titre" or CSV "Matière,Titre[,AAAA-MM-JJ]". */
export function parseCurriculum(text: string) {
  const items: {
    subject: string;
    title: string;
    planned_date: string | null;
  }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line
      .split(/\s*[|;\t,]\s*/)
      .map((p) => p.replace(/^"|"$/g, "").trim());
    if (parts.length === 1) {
      items.push({ subject: "Général", title: parts[0], planned_date: null });
      continue;
    }
    const date =
      parts.slice(2).find((p) => /^\d{4}-\d{2}-\d{2}$/.test(p)) ?? null;
    items.push({
      subject: parts[0].slice(0, 80) || "Général",
      title: parts[1].slice(0, 200),
      planned_date: date,
    });
  }
  return items.filter((i) => i.title);
}
/** Spreads undated items over chosen weekdays from a start date, in order, at most `perDay` items per day. */
export function spreadDates<T extends { planned_date: string | null }>(
  items: T[],
  start: string,
  weekdays: number[],
  perDay = 2,
): T[] {
  let date = start;
  let onDay = 0;
  const next = () => {
    let guard = 0;
    do {
      date = shiftDate(date, 1);
    } while (!weekdays.includes(weekday(date)) && guard++ < 14);
    onDay = 0;
  };
  if (!weekdays.includes(weekday(date))) next();
  return items.map((item) => {
    if (item.planned_date) return item;
    if (onDay >= perDay) next();
    onDay++;
    return { ...item, planned_date: date };
  });
}
export function percent(score: number, max: number) {
  return max ? Math.round((score / max) * 100) : 0;
}
export function gradeStats(grades: Grade[]) {
  const bySubject = new Map<string, Grade[]>();
  for (const g of grades)
    bySubject.set(g.subject, [...(bySubject.get(g.subject) ?? []), g]);
  /** Weighted mean of percentages; a weight of 1 for every grade gives the plain mean. */
  const avg = (rows: Grade[]) => {
    const total = rows.reduce((n, g) => n + (g.weight || 1), 0);
    return rows.length
      ? Math.round(
          rows.reduce(
            (n, g) => n + percent(g.score, g.max) * (g.weight || 1),
            0,
          ) / total,
        )
      : null;
  };
  return {
    overall: avg(grades),
    subjects: [...bySubject]
      .map(([subject, rows]) => ({
        subject,
        average: avg(rows) ?? 0,
        count: rows.length,
        weight: rows.reduce((n, g) => n + (g.weight || 1), 0),
        latest: [...rows].sort((a, b) => a.date.localeCompare(b.date)).at(-1)!,
        series: [...rows]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((g) => ({
            date: g.date,
            value: percent(g.score, g.max),
            title: g.title,
          })),
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject)),
  };
}

export type IcsEvent = {
  uid: string;
  title: string;
  date: string;
  time: string;
  allDay: boolean;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  until: string | null;
};
/** Unfolds iCalendar lines (RFC 5545 folding) and returns decoded property values. */
function icsLines(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n");
}
function icsDate(value: string, params: string) {
  const v = value.trim();
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  if (!m[4] || /VALUE=DATE(?![-])/i.test(params))
    return { date: `${m[1]}-${m[2]}-${m[3]}`, time: "09:00", allDay: true };
  if (m[7] === "Z") {
    // UTC: convert to the reader's local time.
    const d = new Date(
      Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0)),
    );
    return {
      date: localDate(d),
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      allDay: false,
    };
  }
  return {
    date: `${m[1]}-${m[2]}-${m[3]}`,
    time: `${m[4]}:${m[5]}`,
    allDay: false,
  };
}
/** Parses VEVENTs from an .ics export (Google Calendar, Apple, Outlook). Only fields ParentEd uses. */
export function parseIcs(text: string): IcsEvent[] {
  const out: IcsEvent[] = [];
  let current: Partial<IcsEvent> & { inEvent?: boolean } = {};
  for (const line of icsLines(text)) {
    if (line === "BEGIN:VEVENT") {
      current = { inEvent: true, recurrence: "none", until: null };
      continue;
    }
    if (line === "END:VEVENT") {
      if (current.inEvent && current.date && current.title)
        out.push({
          uid: current.uid || `${current.date}-${current.title}`,
          title: current.title,
          date: current.date,
          time: current.time || "09:00",
          allDay: Boolean(current.allDay),
          recurrence: current.recurrence || "none",
          until: current.until ?? null,
        });
      current = {};
      continue;
    }
    if (!current.inEvent) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const head = line.slice(0, idx);
    const value = line.slice(idx + 1);
    const [name, ...params] = head.split(";");
    const p = params.join(";");
    switch (name.toUpperCase()) {
      case "UID":
        current.uid = value.trim().slice(0, 200);
        break;
      case "SUMMARY":
        current.title = value
          .replace(/\\,/g, ",")
          .replace(/\\;/g, ";")
          .replace(/\\n/g, " ")
          .trim()
          .slice(0, 200);
        break;
      case "DTSTART": {
        const d = icsDate(value, p);
        if (d) Object.assign(current, d);
        break;
      }
      case "RRULE": {
        const freq = value
          .match(/FREQ=(DAILY|WEEKLY|MONTHLY)/i)?.[1]
          ?.toLowerCase() as IcsEvent["recurrence"] | undefined;
        if (freq) current.recurrence = freq;
        const until = value.match(/UNTIL=(\d{4})(\d{2})(\d{2})/);
        if (until) current.until = `${until[1]}-${until[2]}-${until[3]}`;
        const count = value.match(/COUNT=(\d+)/);
        if (count && current.date && freq) {
          const n = Math.min(Number(count[1]), 60);
          current.until =
            freq === "daily"
              ? shiftDate(current.date, n - 1)
              : freq === "weekly"
                ? shiftDate(current.date, 7 * (n - 1))
                : shiftMonth(current.date, n - 1);
        }
        break;
      }
    }
  }
  return out;
}
/** Expands parsed events into dated rows between two dates, capped to keep imports reasonable. */
export function expandIcs(
  events: IcsEvent[],
  from: string,
  to: string,
  limit = 400,
) {
  const rows: {
    uid: string;
    title: string;
    date: string;
    time: string;
    allDay: boolean;
  }[] = [];
  for (const e of events) {
    let date = e.date;
    const until =
      e.recurrence === "none" ? e.date : e.until && e.until < to ? e.until : to;
    let guard = 0;
    while (date <= until && guard++ < 400 && rows.length < limit) {
      if (date >= from)
        rows.push({
          uid: e.uid + "@" + date,
          title: e.title,
          date,
          time: e.time,
          allDay: e.allDay,
        });
      if (e.recurrence === "none") break;
      date =
        e.recurrence === "daily"
          ? shiftDate(date, 1)
          : e.recurrence === "weekly"
            ? shiftDate(date, 7)
            : shiftMonth(date, 1);
    }
  }
  return rows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
