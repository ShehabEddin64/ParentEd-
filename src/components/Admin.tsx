import { useState, type FormEvent } from "react";
import { Plus, Pencil, ShieldCheck, Megaphone, Trash2 } from "lucide-react";
import type { Props } from "../App";
import type {
  Course,
  Lesson,
  Event,
  Resource,
  Group,
  Tutor,
  TutorAvailability,
  Recurrence,
  Exam,
  ExamQuestion,
} from "../domain";
import {
  bookingStatusLabels,
  formatDate,
  localDate,
  optional,
  recurrenceLabels,
  required,
  safeUrl,
  weekdayNames,
} from "../domain";
import { PageTitle, Empty } from "./ui";
type Kind =
  | "courses"
  | "lessons"
  | "events"
  | "resources"
  | "groups"
  | "tutors"
  | "tutor_availability"
  | "exams"
  | "exam_questions";
type Tab = Kind | "questions" | "bookings" | "reports";
type Editable =
  | Course
  | Lesson
  | Event
  | Resource
  | Group
  | Tutor
  | TutorAvailability
  | Exam
  | ExamQuestion;
const labels: Record<Tab, string> = {
  courses: "Cours",
  lessons: "Leçons",
  events: "Rencontres",
  resources: "Ressources",
  groups: "Groupes",
  tutors: "Tuteurs",
  tutor_availability: "Disponibilités",
  exams: "Examens",
  exam_questions: "Questions d’examen",
  questions: "Questions",
  bookings: "Séances",
  reports: "Signalements",
};
const fields: Record<Kind, string[]> = {
  courses: ["title", "description", "category", "position", "published"],
  lessons: [
    "course_id",
    "title",
    "body",
    "exercise",
    "template",
    "video_url",
    "minutes",
    "position",
  ],
  events: [
    "title",
    "description",
    "date",
    "time",
    "location",
    "region",
    "organizer",
    "age",
    "price",
    "recurrence",
    "recurrence_until",
    "map_url",
    "lat",
    "lng",
    "featured",
    "published",
  ],
  resources: [
    "title",
    "description",
    "category",
    "url",
    "source",
    "checked_at",
  ],
  groups: ["name", "description", "kind"],
  tutors: [
    "display_name",
    "kind",
    "slot_minutes",
    "meeting_url",
    "contact_email",
    "subjects",
    "qualifications",
    "bio",
    "rate_hint",
    "region",
    "mode",
    "profile_id",
    "published",
  ],
  tutor_availability: ["tutor_id", "weekday", "start_time", "end_time"],
  exams: [
    "title",
    "subject",
    "level",
    "description",
    "minutes",
    "position",
    "published",
  ],
  exam_questions: [
    "exam_id",
    "position",
    "prompt",
    "options",
    "answer_index",
    "explanation",
  ],
};
const fieldLabels: Record<string, string> = {
  title: "Titre",
  name: "Nom",
  display_name: "Nom affiché",
  description: "Description",
  category: "Catégorie",
  position: "Ordre",
  published: "Publié",
  featured: "Mis en avant (annonce à la une)",
  course_id: "Cours associé",
  body: "Texte de la leçon",
  exercise: "Exercice proposé",
  template:
    "Modèle réutilisable (première ligne = titre du modèle; facultatif)",
  video_url: "Lien de la vidéo originale (HTTPS, facultatif)",
  minutes: "Durée en minutes",
  date: "Date",
  time: "Heure",
  location: "Lieu",
  region: "Région",
  organizer: "Organisateur",
  age: "Public / âges",
  price: "Prix",
  recurrence: "Récurrence",
  recurrence_until: "Récurrence jusqu’au (facultatif)",
  map_url: "Lien carte (HTTPS, facultatif)",
  lat: "Latitude (facultatif, ex. 45.5019)",
  lng: "Longitude (facultatif, ex. -73.5674)",
  url: "Lien officiel (HTTPS)",
  source: "Source",
  checked_at: "Date du relevé de la source",
  kind: "Type",
  subjects: "Matières (séparées par des virgules)",
  qualifications: "Qualifications et références vérifiées",
  bio: "Présentation",
  rate_hint: "Tarif indicatif (facturé par le tuteur)",
  mode: "Mode",
  profile_id: "Identifiant du compte tuteur (UUID, facultatif)",
  tutor_id: "Intervenant",
  slot_minutes: "Durée d’un créneau",
  meeting_url: "Lien de rencontre en ligne (HTTPS, facultatif)",
  contact_email:
    "Courriel de l’intervenant pour les confirmations (facultatif)",
  subject: "Matière",
  level: "Niveau (ex. Primaire · 4e année)",
  prompt: "Question",
  options: "Choix de réponse (un par ligne, 2 à 6)",
  answer_index: "Numéro de la bonne réponse (1 = première ligne)",
  explanation: "Explication affichée après correction",
  exam_id: "Examen",
  weekday: "Jour",
  start_time: "Début",
  end_time: "Fin",
};
const textareas = [
  "body",
  "description",
  "exercise",
  "template",
  "qualifications",
  "bio",
  "prompt",
  "options",
  "explanation",
];
const optionalFields = [
  "template",
  "video_url",
  "recurrence_until",
  "map_url",
  "profile_id",
  "rate_hint",
  "bio",
  "qualifications",
  "region",
  "description",
  "meeting_url",
  "contact_email",
  "level",
  "explanation",
];
export function Admin({ data, api, run, busy }: Props) {
  const [tab, setTab] = useState<Tab>("courses");
  const [edit, setEdit] = useState<Partial<Editable> | null>(null);
  const [deletePost, setDeletePost] = useState("");
  const [deleteRow, setDeleteRow] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(tab in fields)) return;
    const kind = tab as Kind;
    const f = new FormData(e.currentTarget);
    const text = (n: string, max = 10000) =>
      required(String(f.get(n) || ""), max);
    const opt = (n: string, max = 10000) =>
      optional(String(f.get(n) || ""), max);
    const https = (n: string) => {
      const v = opt(n);
      if (v && !safeUrl(v))
        throw new Error(`« ${fieldLabels[n]} » doit utiliser HTTPS.`);
      return v || null;
    };
    const id = edit?.id || crypto.randomUUID();
    const ok = await run(async () => {
      if (kind === "courses")
        await api.save(kind, {
          id,
          title: text("title", 160),
          description: text("description"),
          category: text("category", 80),
          position: Number(f.get("position")),
          published: f.has("published"),
        });
      if (kind === "lessons")
        await api.save(kind, {
          id,
          course_id: text("course_id"),
          title: text("title", 160),
          body: text("body"),
          exercise: text("exercise"),
          template: opt("template"),
          video_url: https("video_url"),
          minutes: Number(f.get("minutes")),
          position: Number(f.get("position")),
        });
      if (kind === "events")
        await api.save(kind, {
          id,
          title: text("title", 160),
          description: text("description"),
          date: text("date"),
          time: text("time"),
          location: text("location", 200),
          region: opt("region", 120),
          organizer: text("organizer", 160),
          age: text("age", 80),
          price: text("price", 120),
          recurrence: String(f.get("recurrence")) as Recurrence,
          recurrence_until: opt("recurrence_until") || null,
          map_url: https("map_url"),
          lat: opt("lat") ? Number(opt("lat")) : null,
          lng: opt("lng") ? Number(opt("lng")) : null,
          featured: f.has("featured"),
          published: f.has("published"),
          created_by: (edit as Partial<Event> | null)?.created_by ?? null,
        });
      if (kind === "resources") {
        const url = text("url");
        if (!safeUrl(url)) throw new Error("Le lien doit utiliser HTTPS.");
        await api.save(kind, {
          id,
          title: text("title", 160),
          description: text("description"),
          category: text("category", 80),
          url,
          source: text("source", 160),
          checked_at: text("checked_at"),
        });
      }
      if (kind === "groups")
        await api.save(kind, {
          id,
          name: text("name", 120),
          description: opt("description", 1000),
          kind: String(f.get("kind")) as Group["kind"],
          created_at:
            (edit as Partial<Group> | null)?.created_at ??
            new Date().toISOString(),
        });
      if (kind === "tutors") {
        const profile = opt("profile_id", 36);
        if (profile && !/^[0-9a-f-]{36}$/i.test(profile))
          throw new Error("L’identifiant du compte doit être un UUID.");
        await api.save(kind, {
          id,
          profile_id: profile || null,
          display_name: text("display_name", 80),
          subjects: text("subjects", 400)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          qualifications: opt("qualifications", 1000),
          bio: opt("bio", 2000),
          rate_hint: opt("rate_hint", 200),
          region: opt("region", 120),
          mode: String(f.get("mode")) as Tutor["mode"],
          kind: String(f.get("kind")) as Tutor["kind"],
          slot_minutes: Number(f.get("slot_minutes")) as Tutor["slot_minutes"],
          meeting_url: https("meeting_url"),
          contact_email: opt("contact_email", 200) || null,
          published: f.has("published"),
        });
      }
      if (kind === "exams")
        await api.save(kind, {
          id,
          title: text("title", 160),
          subject: text("subject", 80),
          level: opt("level", 80),
          description: opt("description"),
          minutes: Number(f.get("minutes")),
          position: Number(f.get("position")),
          published: f.has("published"),
        });
      if (kind === "exam_questions") {
        const options = text("options")
          .split(/\r?\n/)
          .map((o) => o.trim())
          .filter(Boolean);
        const answer = Number(f.get("answer_index")) - 1;
        if (options.length < 2 || options.length > 6)
          throw new Error("Saisissez de 2 à 6 choix, un par ligne.");
        if (!(answer >= 0 && answer < options.length))
          throw new Error(
            "Le numéro de la bonne réponse doit correspondre à une ligne.",
          );
        await api.save(kind, {
          id,
          exam_id: text("exam_id"),
          position: Number(f.get("position")),
          prompt: text("prompt", 2000),
          options,
          answer_index: answer,
          explanation: opt("explanation", 2000),
        });
      }
      if (kind === "tutor_availability") {
        const start = text("start_time");
        const end = text("end_time");
        if (end <= start)
          throw new Error("L’heure de fin doit suivre l’heure de début.");
        await api.save(kind, {
          id,
          tutor_id: text("tutor_id"),
          weekday: Number(f.get("weekday")),
          start_time: start,
          end_time: end,
        });
      }
    }, "Contenu enregistré.");
    if (ok) setEdit(null);
  };
  const proposals = data.events.filter(
    (e) => !e.published && e.created_by && e.organizer.includes("membre"),
  );
  const pending = data.lesson_questions.filter((q) => !q.answer).length;
  const summary = (row: Editable): string => {
    if ("answer_index" in row)
      return `${data.exams.find((e) => e.id === row.exam_id)?.title ?? "?"} · réponse ${row.answer_index + 1}`;
    if ("published" in row && "subject" in row && "minutes" in row)
      return `${row.subject}${row.level ? " · " + row.level : ""} · ${data.exam_questions.filter((q) => q.exam_id === row.id).length} questions · ${row.published ? "Publié" : "Brouillon"}`;
    if ("published" in row && "subjects" in row)
      return `${row.subjects.join(", ")} · ${row.published ? "Publié" : "Brouillon"}`;
    if ("published" in row && "organizer" in row)
      return `${formatDate(row.date)} · ${row.published ? "Publié" : row.organizer.includes("membre") ? "Proposition à vérifier" : "Brouillon"}${row.featured ? " · À la une" : ""}`;
    if ("published" in row) return row.published ? "Publié" : "Brouillon";
    if ("course_id" in row)
      return data.courses.find((c) => c.id === row.course_id)?.title ?? "";
    if ("kind" in row)
      return row.kind === "region" ? "Groupe régional" : "Groupe thématique";
    if ("weekday" in row)
      return `${data.tutors.find((t) => t.id === row.tutor_id)?.display_name ?? "?"} · ${weekdayNames[row.weekday]} ${row.start_time}–${row.end_time}`;
    return "Ressource officielle";
  };
  const title = (row: Editable) =>
    "title" in row
      ? row.title
      : "name" in row
        ? row.name
        : "display_name" in row
          ? row.display_name
          : "prompt" in row
            ? row.prompt.slice(0, 80)
            : "Créneau";
  const select = (name: string, value: unknown) => {
    const options: Record<string, [string, string][]> = {
      course_id: data.courses.map((c) => [c.id, c.title]),
      tutor_id: data.tutors.map((t) => [t.id, t.display_name]),
      kind: [
        ["theme", "Thématique"],
        ["region", "Régional"],
      ],
      mode: [
        ["les deux", "En ligne ou en personne"],
        ["en ligne", "En ligne"],
        ["en personne", "En personne"],
      ],
      recurrence: (Object.keys(recurrenceLabels) as Recurrence[]).map((r) => [
        r,
        recurrenceLabels[r],
      ]),
      weekday: weekdayNames.slice(1).map((d, i) => [String(i + 1), d]),
      kind_tutor: [
        ["tuteur", "Tuteur"],
        ["conseiller", "Conseiller aux démarches"],
        ["coach", "Coach parental"],
      ],
      slot_minutes: [
        ["60", "60 minutes"],
        ["30", "30 minutes"],
        ["45", "45 minutes"],
        ["90", "90 minutes"],
      ],
      exam_id: data.exams.map((e) => [e.id, e.title]),
    };
    const list =
      options[name === "kind" && tab === "tutors" ? "kind_tutor" : name];
    if (!list) return null;
    return (
      <select
        name={name}
        defaultValue={String(value ?? list[0]?.[0] ?? "")}
        required
      >
        {list.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    );
  };
  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRATION DES CONTENUS"
        title="Faire vivre ParentEd."
        description="Préparez les cours, les ressources, les groupes, les rencontres et l’annuaire des tuteurs. Répondez aux questions et modérez les échanges."
        action={
          tab in fields && (
            <button className="button primary" onClick={() => setEdit({})}>
              <Plus size={18} />
              Ajouter
            </button>
          )
        }
      />
      <div className="privacy-banner">
        <ShieldCheck size={23} />
        <p>
          L’administration des contenus ne donne pas accès aux documents, notes,
          enfants ni plannings des familles. Les rôles admin et tuteur sont
          attribués en base par un opérateur autorisé.
        </p>
      </div>
      <div className="tabs">
        {(Object.keys(labels) as Tab[]).map((k) => (
          <button
            key={k}
            className={tab === k ? "active" : ""}
            onClick={() => {
              setTab(k);
              setEdit(null);
            }}
          >
            {labels[k]}
            {k === "reports" && ` (${data.reports.length})`}
            {k === "questions" && pending > 0 && ` (${pending})`}
            {k === "events" && proposals.length > 0 && ` (${proposals.length})`}
          </button>
        ))}
      </div>
      {edit && tab in fields && (
        <form
          key={edit.id || tab}
          className="editor form-grid"
          onSubmit={submit}
        >
          <div className="section-heading span-2">
            <h2>
              {edit.id ? "Modifier" : "Ajouter"} · {labels[tab]}
            </h2>
            <button
              type="button"
              className="text-button"
              onClick={() => setEdit(null)}
            >
              Annuler
            </button>
          </div>
          {fields[tab as Kind].map((name) => {
            const raw = (edit as Record<string, unknown>)[name];
            const value = Array.isArray(raw) ? raw.join(", ") : raw;
            const dropdown = select(name, value);
            return (
              <label
                className={textareas.includes(name) ? "span-2" : ""}
                key={name}
              >
                {fieldLabels[name]}
                {["published", "featured"].includes(name) ? (
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={Boolean(value)}
                  />
                ) : dropdown ? (
                  dropdown
                ) : textareas.includes(name) ? (
                  <textarea
                    name={name}
                    defaultValue={String(value ?? "")}
                    required={!optionalFields.includes(name)}
                  />
                ) : (
                  <input
                    name={name}
                    type={
                      ["date", "checked_at", "recurrence_until"].includes(name)
                        ? "date"
                        : ["time", "start_time", "end_time"].includes(name)
                          ? "time"
                          : ["minutes", "position"].includes(name)
                            ? "number"
                            : ["url", "video_url", "map_url"].includes(name)
                              ? "url"
                              : "text"
                    }
                    min={
                      name === "minutes"
                        ? 1
                        : ["lat", "lng"].includes(name)
                          ? -180
                          : 0
                    }
                    step={["lat", "lng"].includes(name) ? "any" : undefined}
                    max={name === "minutes" ? 180 : undefined}
                    maxLength={
                      ["title", "display_name", "name"].includes(name)
                        ? 160
                        : undefined
                    }
                    defaultValue={String(
                      value ??
                        (name === "position" || name === "answer_index"
                          ? 1
                          : name === "minutes"
                            ? 5
                            : ["date", "checked_at"].includes(name)
                              ? localDate()
                              : name === "time" || name === "start_time"
                                ? "10:00"
                                : name === "end_time"
                                  ? "12:00"
                                  : name === "price"
                                    ? "Gratuit"
                                    : ""),
                    )}
                    required={!optionalFields.includes(name)}
                  />
                )}
              </label>
            );
          })}
          <button className="button primary" disabled={busy}>
            Enregistrer
          </button>
        </form>
      )}
      {tab === "reports" && (
        <div>
          {!data.reports.length && <Empty>Aucun signalement à traiter.</Empty>}
          {data.reports.map((r) => (
            <article className="editor" key={r.id}>
              <span className="pill">À EXAMINER</span>
              <h2>
                {data.posts.find((p) => p.id === r.post_id)?.title ||
                  "Discussion indisponible"}
              </h2>
              <p>{r.reason}</p>
              <a className="text-link" href={"#communaute/" + r.post_id}>
                Lire la discussion
              </a>
              <div className="discussion-actions">
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => api.remove("reports", r.id),
                      "Signalement classé.",
                    )
                  }
                >
                  Classer le signalement
                </button>
                {deletePost === r.post_id ? (
                  <>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => api.remove("posts", r.post_id),
                          "Discussion supprimée et signalements clos.",
                        )
                      }
                    >
                      Confirmer la suppression
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setDeletePost("")}
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    className="text-button danger"
                    onClick={() => setDeletePost(r.post_id)}
                  >
                    Supprimer la discussion
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {tab === "questions" && (
        <div>
          {!data.lesson_questions.length && (
            <Empty>Aucune question pour le moment.</Empty>
          )}
          {[...data.lesson_questions]
            .sort(
              (a, b) =>
                Number(Boolean(a.answer)) - Number(Boolean(b.answer)) ||
                b.created_at.localeCompare(a.created_at),
            )
            .map((q) => {
              const lesson = data.lessons.find((l) => l.id === q.lesson_id);
              return (
                <form
                  className="editor"
                  key={q.id}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    await run(
                      () =>
                        api.save("lesson_questions", {
                          ...q,
                          answer: required(String(f.get("answer")), 5000),
                          answered_at: new Date().toISOString(),
                        }),
                      "Réponse publiée sous la leçon.",
                    );
                  }}
                >
                  <span className="pill">
                    {q.answer ? "RÉPONDU" : "EN ATTENTE"}
                  </span>
                  <h2>{lesson?.title ?? "Leçon indisponible"}</h2>
                  <p className="small muted">
                    {q.author} ·{" "}
                    {new Date(q.created_at).toLocaleDateString("fr-CA")}
                  </p>
                  <p className="preserve-lines">{q.body}</p>
                  <label>
                    Réponse de l’équipe (visible par tous les membres)
                    <textarea
                      name="answer"
                      defaultValue={q.answer ?? ""}
                      required
                      maxLength={5000}
                    />
                  </label>
                  <div className="discussion-actions">
                    <button className="button primary" disabled={busy}>
                      {q.answer
                        ? "Mettre à jour la réponse"
                        : "Publier la réponse"}
                    </button>
                    <button
                      type="button"
                      className="text-button danger"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => api.remove("lesson_questions", q.id),
                          "Question supprimée.",
                        )
                      }
                    >
                      Supprimer la question
                    </button>
                  </div>
                </form>
              );
            })}
        </div>
      )}
      {tab === "bookings" && (
        <div>
          <p className="small muted">
            Vue de coordination : suivi des demandes et des séances. Les tuteurs
            confirment eux-mêmes; l’équipe peut annuler en cas de besoin.
          </p>
          {!data.bookings.length && <Empty>Aucune séance demandée.</Empty>}
          <div className="admin-list">
            {[...data.bookings]
              .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
              .map((b) => (
                <article key={b.id}>
                  <div>
                    <strong>
                      {b.subject} ·{" "}
                      {data.tutors.find((t) => t.id === b.tutor_id)
                        ?.display_name ?? "?"}
                    </strong>
                    <small>
                      {formatDate(b.date)} · {b.time} ·{" "}
                      {bookingStatusLabels[b.status]}
                      {b.weekly && " · hebdomadaire"}
                      {data.tutor_reports.some((r) => r.booking_id === b.id) &&
                        " · compte rendu transmis"}
                    </small>
                  </div>
                  {["demandée", "confirmée"].includes(b.status) && (
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () =>
                            api.save("bookings", { ...b, status: "annulée" }),
                          "Séance annulée par l’équipe.",
                        )
                      }
                    >
                      Annuler
                    </button>
                  )}
                </article>
              ))}
          </div>
        </div>
      )}
      {tab in fields && (
        <div className="admin-list">
          {tab === "events" && proposals.length > 0 && (
            <p className="small muted">
              <Megaphone size={14} /> {proposals.length} proposition(s) de
              membres à vérifier : ouvrir, relire, puis cocher « Publié ».
            </p>
          )}
          {(data[tab as Kind] as Editable[]).map((row) => (
            <article key={row.id}>
              <div>
                <strong>{title(row)}</strong>
                <small>{summary(row)}</small>
              </div>
              <button className="button secondary" onClick={() => setEdit(row)}>
                <Pencil size={16} />
                Modifier
              </button>
              {deleteRow === row.id ? (
                <div className="delete-confirm">
                  <button
                    disabled={busy}
                    onClick={async () => {
                      if (
                        await run(
                          () => api.remove(tab as Kind, row.id),
                          "Élément supprimé.",
                        )
                      )
                        setDeleteRow("");
                    }}
                  >
                    Supprimer
                  </button>
                  <button onClick={() => setDeleteRow("")}>Garder</button>
                </div>
              ) : (
                <button
                  className="icon-button"
                  aria-label={`Supprimer ${title(row)}`}
                  onClick={() => setDeleteRow(row.id)}
                >
                  <Trash2 size={17} />
                </button>
              )}
            </article>
          ))}
          {!(data[tab as Kind] as Editable[]).length && (
            <Empty>Aucun élément. Utilisez « Ajouter ».</Empty>
          )}
        </div>
      )}
    </>
  );
}
