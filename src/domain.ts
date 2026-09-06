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
];
/** Views: loaded, never written. */
export const readOnlyTables: Table[] = ["members", "event_counts"];
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
