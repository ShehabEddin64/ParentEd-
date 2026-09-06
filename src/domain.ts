export type Profile = {
  id: string;
  family_id: string;
  display_name: string;
  role: "parent" | "admin";
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
};
export type Progress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
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
};
export type Reply = {
  id: string;
  post_id: string;
  user_id: string;
  author: string;
  body: string;
  created_at: string;
};
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
export type Document = {
  id: string;
  family_id: string;
  title: string;
  path: string;
  created_at: string;
};
export type Report = {
  id: string;
  post_id: string;
  user_id: string;
  reason: string;
  created_at: string;
};
export type Tables = {
  profiles: Profile;
  courses: Course;
  lessons: Lesson;
  progress: Progress;
  tasks: Task;
  posts: Post;
  replies: Reply;
  events: Event;
  registrations: Registration;
  resources: Resource;
  documents: Document;
  reports: Report;
};
export type Table = keyof Tables;
export type Data = { [K in Table]: Tables[K][] };
export const tableNames: Table[] = [
  "profiles",
  "courses",
  "lessons",
  "progress",
  "tasks",
  "posts",
  "replies",
  "events",
  "registrations",
  "resources",
  "documents",
  "reports",
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
