import { seed, ids } from "./seed";
import {
  tableNames,
  readOnlyTables,
  validateFile,
  slotsFor,
  type Data,
  type Table,
  type Tables,
  type Profile,
  type NotificationKind,
} from "../domain";
import type { AuthEvent, Gateway } from "./gateway";
const key = "parented-demo-v3";
const sessionKey = "parented-demo-session";
type Row = Tables[Table];
const accounts: Record<string, string> = {
  "amelie@demo.parented.test": ids.parent,
  "sami@demo.parented.test": ids.other,
  "admin@demo.parented.test": ids.admin,
  "nadia@demo.parented.test": ids.tutor,
};
/** Single-field uniqueness per person, mirroring the SQL unique constraints. */
const personalUnique: Partial<Record<Table, string>> = {
  progress: "lesson_id",
  registrations: "event_id",
  reports: "post_id",
  favorites: "resource_id",
  group_members: "group_id",
  lesson_notes: "lesson_id",
  post_likes: "post_id",
  tutor_reviews: "booking_id",
};
const profileFields = [
  "display_name",
  "city",
  "lat",
  "lng",
  "bio",
  "children_ages",
  "interests",
  "show_on_map",
];
const notAvailable = () =>
  Promise.reject(
    new Error(
      "Cette action nécessite un compte réel : elle n’est pas disponible en démonstration.",
    ),
  );
export class DemoGateway implements Gateway {
  mode = "demo" as const;
  constructor(private storage: Storage = localStorage) {}
  private read(): Data {
    const raw = this.storage.getItem(key);
    if (!raw) return structuredClone(seed);
    try {
      const data = JSON.parse(raw);
      if (!tableNames.every((t) => Array.isArray(data[t]))) throw Error();
      return data;
    } catch {
      throw new Error(
        "La sauvegarde de démonstration est illisible. Effacez les données de ce site pour la réinitialiser.",
      );
    }
  }
  private write(data: Data) {
    try {
      this.storage.setItem(key, JSON.stringify(data));
    } catch {
      throw new Error(
        "Le stockage de ce navigateur est plein ou indisponible. Rien n’a été enregistré.",
      );
    }
  }
  async session() {
    return (
      this.read().profiles.find(
        (p) => p.id === this.storage.getItem(sessionKey),
      ) ?? null
    );
  }
  async login(email: string) {
    const p = this.read().profiles.find((p) => p.id === accounts[email]);
    if (!p) throw new Error("Choisissez un des profils fictifs proposés.");
    this.storage.setItem(sessionKey, p.id);
    return p;
  }
  signup = notAvailable;
  resetPassword = notAvailable;
  updatePassword = notAvailable;
  onAuthEvent(_listener: (event: AuthEvent) => void) {
    return () => {};
  }
  async sendBookingEmail() {
    return false;
  }
  async logout() {
    this.storage.removeItem(sessionKey);
  }
  private async profile() {
    const p = await this.session();
    if (!p) throw new Error("Reconnectez-vous pour continuer.");
    return p;
  }
  private tutorOf(data: Data, tutorId: string, p: Profile) {
    return data.tutors.some((t) => t.id === tutorId && t.profile_id === p.id);
  }
  private visible(t: Table, row: Row, p: Profile, data: Data): boolean {
    const admin = p.role === "admin";
    switch (t) {
      case "profiles":
        return row.id === p.id;
      case "bookings": {
        const b = row as Tables["bookings"];
        return (
          b.family_id === p.family_id ||
          admin ||
          this.tutorOf(data, b.tutor_id, p)
        );
      }
      case "tutor_reports": {
        const r = row as Tables["tutor_reports"];
        const b = data.bookings.find((b) => b.id === r.booking_id);
        return Boolean(b && this.visible("bookings", b, p, data));
      }
      case "tutors": {
        const tu = row as Tables["tutors"];
        return tu.published || admin || tu.profile_id === p.id;
      }
      case "tutor_availability": {
        const a = row as Tables["tutor_availability"];
        const tu = data.tutors.find((x) => x.id === a.tutor_id);
        return Boolean(tu && this.visible("tutors", tu, p, data));
      }
      case "events": {
        const e = row as Tables["events"];
        return e.published || admin || e.created_by === p.id;
      }
      case "exams":
        return (row as Tables["exams"]).published || admin;
      case "exam_questions": {
        const q = row as Tables["exam_questions"];
        return data.exams.some(
          (e) => e.id === q.exam_id && (e.published || admin),
        );
      }
      case "lessons": {
        const l = row as Tables["lessons"];
        return data.courses.some(
          (c) => c.id === l.course_id && (c.published || admin),
        );
      }
      case "reports":
        return (row as Tables["reports"]).user_id === p.id || admin;
      case "messages": {
        const m = row as Tables["messages"];
        return m.sender_id === p.id || m.recipient_id === p.id;
      }
      case "progress":
      case "registrations":
      case "favorites":
      case "lesson_notes":
      case "notifications":
        return (row as { user_id: string }).user_id === p.id;
      default:
        if ("family_id" in row) return row.family_id === p.family_id;
        if ("published" in row) return row.published || admin;
        return true;
    }
  }
  async load() {
    const p = await this.profile();
    const data = this.read();
    const out = Object.fromEntries(
      tableNames.map((t) => [
        t,
        data[t].filter((row) => this.visible(t, row, p, data)),
      ]),
    ) as Data;
    // Views: public directory without family_id, and participant counts.
    out.members = data.profiles.map(({ family_id: _f, ...m }) => m);
    const counts = new Map<string, number>();
    for (const r of data.registrations)
      counts.set(r.event_id, (counts.get(r.event_id) ?? 0) + 1);
    out.event_counts = [...counts].map(([event_id, count]) => ({
      id: event_id,
      event_id,
      count,
    }));
    return out;
  }
  private permitted(
    t: Table,
    row: Row,
    p: Profile,
    operation: "save" | "delete",
    data: Data,
    previous?: Row,
  ): boolean {
    const admin = p.role === "admin";
    if (readOnlyTables.includes(t)) return false;
    switch (t) {
      case "profiles":
        return false;
      case "courses":
      case "lessons":
      case "resources":
      case "groups":
      case "exams":
      case "exam_questions":
        return admin;
      case "events": {
        const e = row as Tables["events"];
        return admin || (e.created_by === p.id && !e.published && !e.featured);
      }
      case "tutors": {
        const tu = row as Tables["tutors"];
        return admin || (operation === "save" && tu.profile_id === p.id);
      }
      case "tutor_availability":
        return (
          admin ||
          this.tutorOf(data, (row as Tables["tutor_availability"]).tutor_id, p)
        );
      case "bookings": {
        const b = row as Tables["bookings"];
        if (admin || this.tutorOf(data, b.tutor_id, p)) return true;
        if (b.family_id !== p.family_id || b.user_id !== p.id) return false;
        if (operation === "delete") return b.status === "demandée";
        if (!previous)
          return (
            ["demandée", "confirmée"].includes(b.status) &&
            data.tutors.some((t) => t.id === b.tutor_id && t.published)
          );
        return ["demandée", "annulée"].includes(b.status);
      }
      case "tutor_reports":
        return (
          admin ||
          this.tutorOf(data, (row as Tables["tutor_reports"]).tutor_id, p)
        );
      case "tutor_reviews": {
        const r = row as Tables["tutor_reviews"];
        if (operation === "delete") return r.user_id === p.id || admin;
        if (previous) return false;
        return (
          r.user_id === p.id &&
          data.bookings.some(
            (b) =>
              b.id === r.booking_id &&
              b.tutor_id === r.tutor_id &&
              b.user_id === p.id &&
              b.status === "terminée",
          )
        );
      }
      case "lesson_questions": {
        const q = row as Tables["lesson_questions"];
        if (operation === "delete") return q.user_id === p.id || admin;
        if (previous) return admin;
        return q.user_id === p.id && q.answer === null;
      }
      case "posts": {
        const post = row as Tables["posts"];
        if (operation === "delete") return post.user_id === p.id || admin;
        if (admin) return true;
        if (post.user_id !== p.id) return false;
        return (
          !previous || (previous as Tables["posts"]).pinned === post.pinned
        );
      }
      case "messages": {
        const m = row as Tables["messages"];
        if (operation === "delete") return m.sender_id === p.id;
        if (previous) return m.recipient_id === p.id;
        return m.sender_id === p.id && m.recipient_id !== p.id;
      }
      case "notifications":
        return (
          Boolean(previous) && (row as Tables["notifications"]).user_id === p.id
        );
      case "group_members":
      case "post_likes":
        return (
          (row as { user_id: string }).user_id === p.id ||
          (operation === "delete" && admin && t === "group_members")
        );
      case "replies":
      case "reports":
        return (
          (row as { user_id: string }).user_id === p.id ||
          (operation === "delete" && admin)
        );
      default:
        if ("family_id" in row) return row.family_id === p.family_id;
        if ("user_id" in row) return row.user_id === p.id;
        return false;
    }
  }
  /** Mirrors the SQL trigger check_booking_slot. */
  private checkSlot(data: Data, b: Tables["bookings"]) {
    if (!["demandée", "confirmée"].includes(b.status)) return;
    const tutor = data.tutors.find((t) => t.id === b.tutor_id);
    if (!tutor) throw new Error("Tuteur introuvable.");
    const others = data.bookings.filter((x) => x.id !== b.id);
    const slot = slotsFor(
      tutor,
      data.tutor_availability,
      others,
      b.date,
      1,
    ).find((s) => s.date === b.date && s.time === b.time);
    if (!slot)
      throw new Error(
        "Ce créneau ne fait pas partie des disponibilités annoncées.",
      );
    if (slot.taken)
      throw new Error(
        "Ce créneau vient d’être réservé. Choisissez-en un autre.",
      );
  }
  /** Mirrors the SQL notification triggers. Never notifies the acting person. */
  private notify(
    data: Data,
    actor: Profile,
    uid: string | null | undefined,
    kind: NotificationKind,
    title: string,
    body: string,
    link: string,
  ) {
    if (!uid || uid === actor.id) return;
    data.notifications.push({
      id: crypto.randomUUID(),
      user_id: uid,
      kind,
      title,
      body: body.slice(0, 200),
      link,
      created_at: new Date().toISOString(),
      read_at: null,
    });
  }
  private triggers<K extends Table>(
    data: Data,
    p: Profile,
    t: K,
    row: Tables[K],
    old?: Tables[K],
  ) {
    const name = (id: string | null) =>
      data.profiles.find((x) => x.id === id)?.display_name ?? "Un membre";
    if (t === "replies" && !old) {
      const r = row as Tables["replies"];
      const post = data.posts.find((x) => x.id === r.post_id);
      if (post)
        this.notify(
          data,
          p,
          post.user_id,
          "reply",
          `${r.author} a répondu à « ${post.title} »`,
          r.body,
          "#communaute/" + post.id,
        );
    }
    if (t === "post_likes" && !old) {
      const l = row as Tables["post_likes"];
      const post = data.posts.find((x) => x.id === l.post_id);
      if (post)
        this.notify(
          data,
          p,
          post.user_id,
          "like",
          `${name(l.user_id)} aime « ${post.title} »`,
          "",
          "#communaute/" + post.id,
        );
    }
    if (t === "messages" && !old) {
      const m = row as Tables["messages"];
      this.notify(
        data,
        p,
        m.recipient_id,
        "message",
        `Nouveau message de ${name(m.sender_id)}`,
        m.body,
        "#communaute/messages/" + m.sender_id,
      );
    }
    if (t === "bookings") {
      const b = row as Tables["bookings"];
      const tutor = data.tutors.find((x) => x.id === b.tutor_id);
      if (!old)
        this.notify(
          data,
          p,
          tutor?.profile_id,
          "booking",
          `Nouvelle demande de séance · ${b.subject}`,
          `${b.child} · ${b.date} ${b.time}`,
          "#tutorat",
        );
      else if ((old as Tables["bookings"]).status !== b.status) {
        this.notify(
          data,
          p,
          b.user_id,
          "booking",
          `Séance ${b.status} · ${b.subject} avec ${tutor?.display_name ?? "votre tuteur"}`,
          `${b.date} ${b.time}`,
          "#tutorat",
        );
        this.notify(
          data,
          p,
          tutor?.profile_id,
          "booking",
          `Séance ${b.status} · ${b.subject}`,
          `${b.child} · ${b.date}`,
          "#tutorat",
        );
      }
    }
    if (t === "tutor_reports" && !old) {
      const r = row as Tables["tutor_reports"];
      const b = data.bookings.find((x) => x.id === r.booking_id);
      if (b)
        this.notify(
          data,
          p,
          b.user_id,
          "report",
          `Compte rendu reçu · ${b.subject}`,
          r.body,
          "#tutorat",
        );
    }
    if (t === "lesson_questions" && old) {
      const q = row as Tables["lesson_questions"];
      const lesson = data.lessons.find((l) => l.id === q.lesson_id);
      if (
        q.answer &&
        q.answer !== (old as Tables["lesson_questions"]).answer &&
        lesson
      )
        this.notify(
          data,
          p,
          q.user_id,
          "answer",
          "L’équipe a répondu à votre question",
          lesson.title,
          "#cours/" + lesson.course_id,
        );
    }
    if (t === "events" && old) {
      const e = row as Tables["events"];
      if (e.published && !(old as Tables["events"]).published)
        this.notify(
          data,
          p,
          e.created_by,
          "event",
          "Votre rencontre est publiée",
          e.title,
          "#evenements",
        );
    }
  }
  async save<K extends Table>(t: K, row: Tables[K]) {
    const p = await this.profile();
    const data = this.read();
    const old = data[t].find((r) => r.id === row.id);
    if (
      !this.permitted(t, row, p, "save", data, old) ||
      (old && !this.permitted(t, old, p, "save", data, old))
    )
      throw new Error("Accès refusé.");
    if (t === "bookings") this.checkSlot(data, row as Tables["bookings"]);
    const field = personalUnique[t];
    if (field) {
      const r = row as unknown as Record<string, string>;
      if (
        data[t].some((x) => {
          const a = x as unknown as Record<string, string>;
          return (
            a.id !== r.id && a.user_id === r.user_id && a[field] === r[field]
          );
        })
      )
        return;
    }
    if (t === "week_plans") {
      const w = row as Tables["week_plans"];
      const clash = data.week_plans.find(
        (x) =>
          x.id !== w.id &&
          x.family_id === w.family_id &&
          x.week_start === w.week_start,
      );
      if (clash) data.week_plans = data.week_plans.filter((x) => x !== clash);
    }
    const rows = data[t] as Tables[K][];
    const i = rows.findIndex((r) => r.id === row.id);
    if (i < 0) rows.push(row);
    else rows[i] = row;
    this.triggers(data, p, t, row, old as Tables[K] | undefined);
    this.write(data);
  }
  async patch<K extends Table>(t: K, id: string, changes: Partial<Tables[K]>) {
    const p = await this.profile();
    const data = this.read();
    const rows = data[t] as Tables[K][];
    const i = rows.findIndex((r) => r.id === id);
    if (i < 0) throw new Error("Élément introuvable.");
    const merged = { ...rows[i], ...changes, id };
    if (t === "profiles") {
      if (
        id !== p.id ||
        Object.keys(changes).some((k) => !profileFields.includes(k))
      )
        throw new Error("Accès refusé.");
    } else if (!this.permitted(t, merged, p, "save", data, rows[i]))
      throw new Error("Accès refusé.");
    const old = rows[i];
    rows[i] = merged;
    this.triggers(data, p, t, merged, old);
    this.write(data);
  }
  async remove(t: Table, id: string) {
    const p = await this.profile();
    const d = this.read();
    const row = d[t].find((r) => r.id === id);
    if (!row || !this.permitted(t, row, p, "delete", d, row))
      throw new Error("Accès refusé.");
    (d[t] as Row[]) = d[t].filter((r) => r.id !== id);
    this.cascade(d, t, id);
    this.write(d);
  }
  /** Mirrors the SQL foreign keys (on delete cascade / set null). */
  private cascade(d: Data, t: Table, id: string) {
    const drop = <K extends Table>(table: K, field: keyof Tables[K]) => {
      const gone = d[table].filter((r) => r[field] === id);
      (d[table] as Row[]) = d[table].filter((r) => r[field] !== id);
      for (const g of gone) this.cascade(d, table, g.id);
    };
    if (t === "posts") {
      drop("replies", "post_id");
      drop("reports", "post_id");
      drop("post_likes", "post_id");
    }
    if (t === "courses") drop("lessons", "course_id");
    if (t === "lessons") {
      drop("progress", "lesson_id");
      drop("lesson_notes", "lesson_id");
      drop("lesson_questions", "lesson_id");
    }
    if (t === "events") drop("registrations", "event_id");
    if (t === "resources") drop("favorites", "resource_id");
    if (t === "groups") {
      drop("group_members", "group_id");
      for (const post of d.posts)
        if (post.group_id === id) post.group_id = null;
    }
    if (t === "tutors") {
      drop("tutor_availability", "tutor_id");
      drop("bookings", "tutor_id");
      drop("tutor_reviews", "tutor_id");
    }
    if (t === "bookings") {
      drop("tutor_reports", "booking_id");
      drop("tutor_reviews", "booking_id");
    }
    if (t === "exams") {
      drop("exam_questions", "exam_id");
      drop("exam_attempts", "exam_id");
    }
    if (t === "curricula") drop("curriculum_items", "curriculum_id");
  }
  async upload(file: File, family: string) {
    validateFile(file);
    const p = await this.profile();
    if (p.family_id !== family) throw new Error("Accès refusé.");
    if (file.size > 1024 * 1024)
      throw new Error(
        "En démonstration, choisissez un fichier de 1 Mo maximum.",
      );
    const path = family + "/" + crypto.randomUUID();
    const content = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("Lecture du fichier impossible."));
      r.readAsDataURL(file);
    });
    try {
      this.storage.setItem("parented-file:" + path, content);
    } catch {
      throw new Error("Espace local insuffisant pour ce fichier.");
    }
    return path;
  }
  async download(path: string) {
    const p = await this.profile();
    if (!path.startsWith(p.family_id + "/")) throw new Error("Accès refusé.");
    const v = this.storage.getItem("parented-file:" + path);
    if (!v) throw new Error("Fichier introuvable.");
    const [header, encoded] = v.split(",");
    if (!encoded || !header.includes(";base64"))
      throw new Error("Fichier local illisible.");
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    return new Blob([bytes], { type: header.slice(5).split(";")[0] });
  }
  async deleteFile(path: string) {
    const p = await this.profile();
    if (!path.startsWith(p.family_id + "/")) throw new Error("Accès refusé.");
    this.storage.removeItem("parented-file:" + path);
  }
}
