import { useState, type FormEvent } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Download,
  LockKeyhole,
  Upload,
  FileText,
  CalendarDays,
} from "lucide-react";
import {
  localDate,
  required,
  shiftDate,
  weekDates,
  type Task,
} from "../domain";
import type { Props } from "../App";
import { downloadBlob, Empty, PageTitle } from "./ui";
export function Family({ data, profile, api, run, busy }: Props) {
  const [anchor, setAnchor] = useState(
    api.mode === "demo" ? "2026-09-08" : localDate(),
  );
  const [editing, setEditing] = useState<Partial<Task> | null>(null);
  const [view, setView] = useState("semaine");
  const [deleteId, setDeleteId] = useState("");
  const days = weekDates(anchor);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = await run(async () => {
      await api.save("tasks", {
        id: editing?.id || crypto.randomUUID(),
        family_id: profile.family_id,
        title: required(String(f.get("title")), 200),
        child: required(String(f.get("child")), 80),
        date: String(f.get("date")),
        time: String(f.get("time")),
        done: editing?.done || false,
      });
    }, "Activité enregistrée dans votre semaine.");
    if (ok) {
      setAnchor(String(f.get("date")));
      setEditing(null);
    }
  };
  const upload = async (file: File) => {
    await run(async () => {
      const path = await api.upload(file, profile.family_id);
      try {
        await api.save("documents", {
          id: crypto.randomUUID(),
          family_id: profile.family_id,
          title: file.name,
          path,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        await api.deleteFile(path);
        throw e;
      }
    }, "Document ajouté à votre dossier privé.");
  };
  return (
    <>
      <PageTitle
        eyebrow="VOTRE QUOTIDIEN, À VOTRE FAÇON"
        title="De la place pour apprendre."
        description="Des repères souples pour la semaine et un espace privé pour vos découvertes."
        action={
          <button
            className="button primary"
            onClick={() => {
              setView("semaine");
              setEditing({
                date: anchor,
                time: "09:00",
                child: "Toute la famille",
              });
            }}
          >
            <Plus size={18} />
            Ajouter une activité
          </button>
        }
      />
      <div className="tabs">
        <button
          className={view === "semaine" ? "active" : ""}
          onClick={() => setView("semaine")}
        >
          <CalendarDays size={17} />
          Ma semaine
        </button>
        <button
          className={view === "documents" ? "active" : ""}
          onClick={() => setView("documents")}
        >
          <LockKeyhole size={17} />
          Dossier privé
        </button>
      </div>
      {view === "semaine" ? (
        <>
          {editing && (
            <section className="editor">
              <div className="section-heading">
                <h2>
                  {editing.id ? "Modifier l’activité" : "Une nouvelle activité"}
                </h2>
                <button
                  className="text-button"
                  onClick={() => setEditing(null)}
                >
                  Annuler
                </button>
              </div>
              <form
                key={editing.id || editing.date}
                onSubmit={submit}
                className="form-grid"
              >
                <label className="span-2">
                  Activité
                  <input
                    name="title"
                    defaultValue={editing.title}
                    placeholder="Une lecture, une sortie, une découverte…"
                    required
                    maxLength={200}
                  />
                </label>
                <label>
                  Pour qui ?
                  <input
                    name="child"
                    defaultValue={editing.child}
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    name="date"
                    defaultValue={editing.date}
                    required
                  />
                </label>
                <label>
                  Heure
                  <input
                    type="time"
                    name="time"
                    defaultValue={editing.time}
                    required
                  />
                </label>
                <div className="form-actions">
                  <button className="button primary" disabled={busy}>
                    Enregistrer l’activité
                  </button>
                </div>
              </form>
            </section>
          )}
          <div className="calendar-toolbar">
            <div>
              <h2>
                {new Date(days[0] + "T12:00:00").toLocaleDateString("fr-CA", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <span className="muted small">
                Semaine du{" "}
                {new Date(days[0] + "T12:00:00").toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
            <div className="calendar-controls">
              <button
                className="icon-button"
                aria-label="Semaine précédente"
                onClick={() => setAnchor(shiftDate(anchor, -7))}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  setAnchor(api.mode === "demo" ? "2026-09-08" : localDate())
                }
              >
                {api.mode === "demo" ? "Semaine démo" : "Aujourd’hui"}
              </button>
              <button
                className="icon-button"
                aria-label="Semaine suivante"
                onClick={() => setAnchor(shiftDate(anchor, 7))}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="week-grid">
            {days.map((day) => (
              <section
                className={`day-column ${day === localDate() ? "today" : ""}`}
                key={day}
              >
                <header>
                  <span>
                    {new Date(day + "T12:00:00").toLocaleDateString("fr-CA", {
                      weekday: "short",
                    })}
                  </span>
                  <strong>{Number(day.slice(-2))}</strong>
                </header>
                <div className="day-activities">
                  {data.tasks
                    .filter((t) => t.date === day)
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((t) => (
                      <article
                        className={`activity ${t.done ? "done" : ""}`}
                        key={t.id}
                      >
                        <div>
                          <span>{t.time}</span>
                          <button
                            disabled={busy}
                            className="task-check"
                            aria-label={`${t.done ? "Remettre à faire" : "Terminer"} : ${t.title}`}
                            onClick={() =>
                              run(
                                () =>
                                  api.save("tasks", { ...t, done: !t.done }),
                                t.done
                                  ? "Activité remise à faire."
                                  : "Activité terminée.",
                              )
                            }
                          >
                            <Check size={14} />
                          </button>
                        </div>
                        <button
                          className="activity-title"
                          onClick={() => setEditing(t)}
                        >
                          {t.title}
                        </button>
                        <small>{t.child}</small>
                        {deleteId === t.id ? (
                          <div className="delete-confirm">
                            <button
                              disabled={busy}
                              onClick={async () => {
                                if (
                                  await run(
                                    () => api.remove("tasks", t.id),
                                    "Activité supprimée.",
                                  )
                                )
                                  setDeleteId("");
                              }}
                            >
                              Confirmer
                            </button>
                            <button onClick={() => setDeleteId("")}>
                              Garder
                            </button>
                          </div>
                        ) : (
                          <button
                            className="activity-delete"
                            aria-label={`Supprimer : ${t.title}`}
                            onClick={() => setDeleteId(t.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </article>
                    ))}
                  <button
                    className="add-day"
                    aria-label={`Ajouter une activité le ${day}`}
                    onClick={() =>
                      setEditing({
                        date: day,
                        time: "09:00",
                        child: "Toute la famille",
                      })
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </section>
            ))}
          </div>
          <div className="gentle-note">
            <LeafNote />
            Un planning est un point de départ. Vous pouvez déplacer ou alléger
            une activité à tout moment.
          </div>
        </>
      ) : (
        <>
          <div className="privacy-banner">
            <LockKeyhole size={24} />
            <div>
              <h2>Les découvertes de votre famille</h2>
              <p>
                Ces fichiers ne sont visibles que par les membres de votre
                famille. Ils ne sont jamais publiés dans la communauté.
              </p>
            </div>
          </div>
          <label className={`upload-zone ${busy ? "disabled" : ""}`}>
            <Upload size={25} />
            <strong>Ajouter une trace d’apprentissage</strong>
            <span>
              PDF, PNG ou JPEG ·{" "}
              {api.mode === "demo" ? "1 Mo en démonstration" : "5 Mo"} maximum
            </span>
            <input
              aria-label="Ajouter un document privé"
              type="file"
              disabled={busy}
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = "";
              }}
            />
          </label>
          {!data.documents.length ? (
            <Empty>
              Votre dossier est prêt. Ajoutez votre première trace
              d’apprentissage.
            </Empty>
          ) : (
            <div className="document-list">
              {data.documents.map((d) => (
                <article key={d.id}>
                  <FileText size={25} />
                  <div>
                    <strong>{d.title}</strong>
                    <small>
                      Ajouté le{" "}
                      {new Date(d.created_at).toLocaleDateString("fr-CA")}
                    </small>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Télécharger ${d.title}`}
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        downloadBlob(await api.download(d.path), d.title);
                      }, "Téléchargement préparé.")
                    }
                  >
                    <Download size={18} />
                  </button>
                  {deleteId === d.id ? (
                    <div className="delete-confirm">
                      <button
                        disabled={busy}
                        onClick={async () => {
                          if (
                            await run(async () => {
                              await api.deleteFile(d.path);
                              await api.remove("documents", d.id);
                            }, "Document supprimé.")
                          )
                            setDeleteId("");
                        }}
                      >
                        Supprimer définitivement
                      </button>
                      <button onClick={() => setDeleteId("")}>Garder</button>
                    </div>
                  ) : (
                    <button
                      className="icon-button"
                      aria-label={`Supprimer ${d.title}`}
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
          <button
            className="button secondary"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const fresh = await api.load();
                downloadBlob(
                  new Blob(
                    [
                      JSON.stringify(
                        {
                          version: 1,
                          exported_at: new Date().toISOString(),
                          tasks: fresh.tasks,
                          progress: fresh.progress,
                          documents: fresh.documents,
                        },
                        null,
                        2,
                      ),
                    ],
                    { type: "application/json" },
                  ),
                  "parented-export-familial.json",
                );
              }, "Export préparé. Téléchargez les fichiers séparément.")
            }
          >
            <Download size={17} />
            Exporter mon organisation et ma progression
          </button>
          <p className="small muted">
            L’export contient les données et la liste des fichiers. Téléchargez
            chaque fichier pour en conserver une copie.
          </p>
        </>
      )}
    </>
  );
}
function LeafNote() {
  return <span aria-hidden="true">✳</span>;
}
