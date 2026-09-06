import { useState, type FormEvent } from "react";
import { Plus, Pencil, ShieldCheck } from "lucide-react";
import type { Props } from "../App";
import type { Course, Lesson, Event, Resource } from "../domain";
import { localDate, required, safeUrl } from "../domain";
import { PageTitle, Empty } from "./ui";
type Kind = "courses" | "lessons" | "events" | "resources";
type Editable = Course | Lesson | Event | Resource;
export function Admin({ data, api, run, busy }: Props) {
  const [tab, setTab] = useState<Kind | "reports">("courses");
  const [edit, setEdit] = useState<Partial<Editable> | null>(null);
  const [deletePost, setDeletePost] = useState("");
  const labels = {
    courses: "Cours",
    lessons: "Leçons",
    events: "Événements",
    resources: "Ressources",
    reports: "Signalements",
  };
  const fields: Record<Kind, string[]> = {
    courses: ["title", "description", "category", "position", "published"],
    lessons: ["course_id", "title", "body", "exercise", "minutes", "position"],
    events: [
      "title",
      "description",
      "date",
      "time",
      "location",
      "organizer",
      "age",
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
  };
  const fieldLabels: Record<string, string> = {
    title: "Titre",
    description: "Description",
    category: "Catégorie",
    position: "Ordre",
    published: "Publié",
    course_id: "Cours associé",
    body: "Texte de la leçon",
    exercise: "Exercice proposé",
    minutes: "Durée en minutes",
    date: "Date",
    time: "Heure",
    location: "Lieu",
    organizer: "Organisateur",
    age: "Public / âges",
    url: "Lien officiel (HTTPS)",
    source: "Source",
    checked_at: "Date du relevé de la source",
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tab === "reports") return;
    const f = new FormData(e.currentTarget);
    const get = (n: string) =>
      required(String(f.get(n) || ""), n === "title" ? 160 : 10000);
    const id = edit?.id || crypto.randomUUID();
    const ok = await run(async () => {
      if (tab === "courses")
        await api.save(tab, {
          id,
          title: get("title"),
          description: get("description"),
          category: get("category"),
          position: Number(f.get("position")),
          published: f.has("published"),
        });
      if (tab === "lessons")
        await api.save(tab, {
          id,
          course_id: get("course_id"),
          title: get("title"),
          body: get("body"),
          exercise: get("exercise"),
          minutes: Number(f.get("minutes")),
          position: Number(f.get("position")),
        });
      if (tab === "events")
        await api.save(tab, {
          id,
          title: get("title"),
          description: get("description"),
          date: get("date"),
          time: get("time"),
          location: get("location"),
          organizer: get("organizer"),
          age: get("age"),
          published: f.has("published"),
        });
      if (tab === "resources") {
        const url = get("url");
        if (!safeUrl(url)) throw new Error("Le lien doit utiliser HTTPS.");
        await api.save(tab, {
          id,
          title: get("title"),
          description: get("description"),
          category: get("category"),
          url,
          source: get("source"),
          checked_at: get("checked_at"),
        });
      }
    }, "Contenu enregistré.");
    if (ok) setEdit(null);
  };
  return (
    <>
      <PageTitle
        eyebrow="ADMINISTRATION DES CONTENUS"
        title="Faire vivre ParentEd."
        description="Préparez les cours, les ressources et les rencontres. Modérez les échanges."
        action={
          tab !== "reports" && (
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
          L’administration des contenus ne donne pas accès aux documents ni aux
          plannings des autres familles.
        </p>
      </div>
      <div className="tabs">
        {Object.entries(labels).map(([k, v]) => (
          <button
            key={k}
            className={tab === k ? "active" : ""}
            onClick={() => {
              setTab(k as typeof tab);
              setEdit(null);
            }}
          >
            {v}
            {k === "reports" && ` (${data.reports.length})`}
          </button>
        ))}
      </div>
      {edit && tab !== "reports" && (
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
          {fields[tab].map((name) => {
            const value = (edit as Record<string, unknown>)[name];
            return (
              <label
                className={
                  ["body", "description", "exercise"].includes(name)
                    ? "span-2"
                    : ""
                }
                key={name}
              >
                {fieldLabels[name]}
                {name === "published" ? (
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={Boolean(value)}
                  />
                ) : name === "course_id" ? (
                  <select
                    name={name}
                    defaultValue={String(value || data.courses[0]?.id || "")}
                    required
                  >
                    {data.courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                ) : ["body", "description", "exercise"].includes(name) ? (
                  <textarea
                    name={name}
                    defaultValue={String(value || "")}
                    required
                  />
                ) : (
                  <input
                    name={name}
                    type={
                      ["date", "checked_at"].includes(name)
                        ? "date"
                        : name === "time"
                          ? "time"
                          : ["minutes", "position"].includes(name)
                            ? "number"
                            : name === "url"
                              ? "url"
                              : "text"
                    }
                    min={name === "minutes" ? 1 : 0}
                    max={name === "minutes" ? 180 : undefined}
                    maxLength={name === "title" ? 160 : undefined}
                    defaultValue={String(
                      value ??
                        (name === "position"
                          ? 1
                          : name === "minutes"
                            ? 5
                            : ["date", "checked_at"].includes(name)
                              ? localDate()
                              : name === "time"
                                ? "10:00"
                                : ""),
                    )}
                    required
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
      {tab === "reports" ? (
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
      ) : (
        <div className="admin-list">
          {data[tab].map((row) => (
            <article key={row.id}>
              <div>
                <strong>{row.title}</strong>
                <small>
                  {"published" in row
                    ? row.published
                      ? "Publié"
                      : "Brouillon"
                    : "course_id" in row
                      ? data.courses.find((c) => c.id === row.course_id)?.title
                      : "Ressource officielle"}
                </small>
              </div>
              <button className="button secondary" onClick={() => setEdit(row)}>
                <Pencil size={16} />
                Modifier
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
