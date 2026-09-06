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
  Users,
  BookMarked,
  Pencil,
  NotebookPen,
  Sparkles,
  ListChecks,
  BarChart3,
  Upload as UploadIcon,
  Wand2,
  CalendarPlus,
} from "lucide-react";
import {
  localDate,
  optional,
  required,
  safeUrl,
  shiftDate,
  weekDates,
  formatDate,
  gradeStats,
  parseIcs,
  expandIcs,
  parseCurriculum,
  percent,
  spreadDates,
  type Task,
  type Child,
  type LibraryItem,
  type Note,
  type CurriculumItem,
  type Grade,
} from "../domain";
import type { Props } from "../App";
import { downloadBlob, Empty, External, PageTitle } from "./ui";
const everyone = "Toute la famille";
export function Family(props: Props) {
  const { data, profile, api, run, busy } = props;
  const [anchor, setAnchor] = useState(
    api.mode === "demo" ? "2026-09-08" : localDate(),
  );
  const [editing, setEditing] = useState<Partial<Task> | null>(null);
  const [view, setView] = useState("semaine");
  const [deleteId, setDeleteId] = useState("");
  const [importCal, setImportCal] = useState(false);
  const days = weekDates(anchor);
  const childNames = [everyone, ...data.children.map((c) => c.name)];
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
        source: editing?.source ?? "",
      });
    }, "Activité enregistrée dans votre semaine.");
    if (ok) {
      setAnchor(String(f.get("date")));
      setEditing(null);
    }
  };
  const tabs = [
    ["semaine", "Ma semaine", CalendarDays],
    ["enfants", "Mes enfants", Users],
    ["programme", "Programme", ListChecks],
    ["resultats", "Résultats", BarChart3],
    ["bibliotheque", "Livres et ressources", BookMarked],
    ["portfolio", "Portfolio privé", LockKeyhole],
  ] as const;
  return (
    <>
      <PageTitle
        eyebrow="Votre quotidien, à votre façon"
        title="De la place pour apprendre."
        description="Une semaine souple par enfant, vos livres et ressources, et un portfolio privé pour garder des traces."
        action={
          view === "semaine" && (
            <div className="discussion-actions">
              <button
                className="button secondary"
                onClick={() => setImportCal(!importCal)}
              >
                <CalendarPlus size={18} />
                Importer un calendrier
              </button>
              <button
                className="button primary"
                onClick={() =>
                  setEditing({ date: anchor, time: "09:00", child: everyone })
                }
              >
                <Plus size={18} />
                Ajouter une activité
              </button>
            </div>
          )
        }
      />
      <div className="tabs">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            className={view === id ? "active" : ""}
            onClick={() => setView(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
      {view === "semaine" && (
        <>
          {importCal && (
            <CalendarImport
              {...props}
              childNames={childNames}
              onDone={() => setImportCal(false)}
            />
          )}
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
                    list="children-names"
                    defaultValue={editing.child}
                    required
                    maxLength={80}
                  />
                  <datalist id="children-names">
                    {childNames.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
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
              <h2>{formatDate(days[0], { month: "long", year: "numeric" })}</h2>
              <span className="muted small">
                Semaine du{" "}
                {formatDate(days[0], { day: "numeric", month: "long" })}
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
          <WeekPlan {...props} weekStart={days[0]} />
          <div className="week-grid">
            {days.map((day) => {
              const sessions = data.bookings.filter(
                (b) =>
                  b.status === "confirmée" &&
                  (b.date === day ||
                    (b.weekly &&
                      b.date <= day &&
                      new Date(b.date + "T12:00:00").getDay() ===
                        new Date(day + "T12:00:00").getDay())),
              );
              return (
                <section
                  className={`day-column ${day === localDate() ? "today" : ""}`}
                  key={day}
                >
                  <header>
                    <span>{formatDate(day, { weekday: "short" })}</span>
                    <strong>{Number(day.slice(-2))}</strong>
                  </header>
                  <div className="day-activities">
                    {[
                      ...data.curriculum_items
                        .filter((i) => i.planned_date === day)
                        .map((i) => ({
                          time: "zz",
                          node: (
                            <article
                              className={`activity plan ${i.done ? "done" : ""}`}
                              key={i.id}
                            >
                              <div>
                                <span>{i.subject}</span>
                                <button
                                  disabled={busy}
                                  className="task-check"
                                  aria-label={`${i.done ? "Remettre à faire" : "Terminer"} : ${i.title}`}
                                  onClick={() =>
                                    run(
                                      () =>
                                        api.save("curriculum_items", {
                                          ...i,
                                          done: !i.done,
                                        }),
                                      i.done
                                        ? "Élément remis à faire."
                                        : "Élément du programme terminé.",
                                    )
                                  }
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                              <span className="activity-title">{i.title}</span>
                              <small>
                                {data.curricula.find(
                                  (c) => c.id === i.curriculum_id,
                                )?.child || "Programme"}
                              </small>
                            </article>
                          ),
                        })),
                      ...sessions.map((b) => ({
                        time: b.time,
                        node: (
                          <a
                            href="#tutorat"
                            className="activity session"
                            key={b.id}
                          >
                            <div>
                              <span>{b.time}</span>
                              <Sparkles size={13} />
                            </div>
                            <span className="activity-title">
                              Tutorat · {b.subject}
                            </span>
                            <small>
                              {b.child} ·{" "}
                              {data.tutors.find((t) => t.id === b.tutor_id)
                                ?.display_name ?? "tuteur"}
                            </small>
                          </a>
                        ),
                      })),
                      ...data.tasks
                        .filter((t) => t.date === day)
                        .map((t) => ({
                          time: t.time,
                          node: (
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
                                        api.save("tasks", {
                                          ...t,
                                          done: !t.done,
                                        }),
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
                          ),
                        })),
                    ]
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((x) => x.node)}
                    <button
                      className="add-day"
                      aria-label={`Ajouter une activité le ${day}`}
                      onClick={() =>
                        setEditing({
                          date: day,
                          time: "09:00",
                          child: everyone,
                        })
                      }
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
          <div className="gentle-note">
            <span aria-hidden="true">✳</span>
            Un planning est un point de départ. Vous pouvez déplacer ou alléger
            une activité à tout moment. Les séances de tutorat confirmées
            apparaissent automatiquement.
          </div>
        </>
      )}
      {view === "enfants" && <Children {...props} />}
      {view === "programme" && <Program {...props} childNames={childNames} />}
      {view === "resultats" && <Results {...props} childNames={childNames} />}
      {view === "bibliotheque" && (
        <Library {...props} childNames={childNames} />
      )}
      {view === "portfolio" && <Portfolio {...props} childNames={childNames} />}
    </>
  );
}
function WeekPlan({
  data,
  profile,
  api,
  run,
  busy,
  weekStart,
}: Props & { weekStart: string }) {
  const plan = data.week_plans.find((w) => w.week_start === weekStart);
  const [open, setOpen] = useState(false);
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      await run(
        () =>
          api.save("week_plans", {
            id: plan?.id ?? crypto.randomUUID(),
            family_id: profile.family_id,
            week_start: weekStart,
            intentions: optional(String(f.get("intentions"))),
          }),
        "Intentions de la semaine enregistrées.",
      )
    )
      setOpen(false);
  };
  return (
    <section className="week-plan">
      <div className="week-plan-head">
        <span className="eyebrow">Plan hebdomadaire</span>
        <button className="text-button" onClick={() => setOpen(!open)}>
          <Pencil size={15} />
          {open
            ? "Fermer"
            : plan?.intentions
              ? "Modifier"
              : "Écrire nos intentions"}
        </button>
      </div>
      {open ? (
        <form onSubmit={save} key={weekStart}>
          <label>
            Deux ou trois intentions pour cette semaine
            <textarea
              name="intentions"
              defaultValue={plan?.intentions ?? ""}
              maxLength={5000}
              placeholder="Lire ensemble chaque matin… Sortir observer… Garder un après-midi souple…"
            />
          </label>
          <div className="form-actions">
            <button className="button primary" disabled={busy}>
              Enregistrer
            </button>
          </div>
        </form>
      ) : plan?.intentions ? (
        <ul>
          {plan.intentions
            .split("\n")
            .filter(Boolean)
            .map((line, i) => (
              <li key={i}>{line}</li>
            ))}
        </ul>
      ) : (
        <p className="muted small">
          Aucune intention notée pour cette semaine. Le cours « Construire une
          semaine souple » propose un modèle.
        </p>
      )}
    </section>
  );
}
function Children({ data, profile, api, run, busy }: Props) {
  const [edit, setEdit] = useState<Partial<Child> | null>(null);
  const [deleteId, setDeleteId] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const year = String(f.get("birth_year") || "").trim();
    if (
      await run(
        () =>
          api.save("children", {
            id: edit?.id ?? crypto.randomUUID(),
            family_id: profile.family_id,
            name: required(String(f.get("name")), 80),
            birth_year: year ? Number(year) : null,
            notes: optional(String(f.get("notes")), 2000),
          }),
        "Enfant enregistré.",
      )
    )
      setEdit(null);
  };
  return (
    <>
      <div className="privacy-banner">
        <LockKeyhole size={24} />
        <div>
          <h2>Vos enfants, dans votre espace seulement</h2>
          <p>
            Prénoms et repères restent privés. Ils servent à organiser la
            semaine, la bibliothèque et le portfolio par enfant.
          </p>
        </div>
      </div>
      {edit ? (
        <form
          className="editor form-grid"
          onSubmit={submit}
          key={edit.id || "new"}
        >
          <div className="section-heading span-2">
            <h2>{edit.id ? "Modifier" : "Ajouter un enfant"}</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => setEdit(null)}
            >
              Annuler
            </button>
          </div>
          <label>
            Prénom (ou surnom)
            <input
              name="name"
              defaultValue={edit.name}
              required
              maxLength={80}
            />
          </label>
          <label>
            Année de naissance (facultatif)
            <input
              name="birth_year"
              type="number"
              min={1990}
              max={2100}
              defaultValue={edit.birth_year ?? ""}
            />
          </label>
          <label className="span-2">
            Repères utiles (facultatif)
            <textarea
              name="notes"
              defaultValue={edit.notes}
              maxLength={2000}
              placeholder="Ce qui l’aide, ce qu’il ou elle aime…"
            />
          </label>
          <button className="button primary" disabled={busy}>
            Enregistrer
          </button>
        </form>
      ) : (
        <button className="button primary" onClick={() => setEdit({})}>
          <Plus size={18} />
          Ajouter un enfant
        </button>
      )}
      {!data.children.length && !edit && (
        <Empty>
          Ajoutez un premier enfant pour organiser la semaine par personne.
        </Empty>
      )}
      <div className="child-grid">
        {data.children.map((c) => {
          const count = (n: number, s: string, p = s + "s") =>
            `${n} ${n > 1 ? p : s}`;
          return (
            <article className="child-card" key={c.id}>
              <span className="avatar">{c.name[0]}</span>
              <div>
                <h3>{c.name}</h3>
                {c.birth_year && <small>Né(e) en {c.birth_year}</small>}
                {c.notes && <p>{c.notes}</p>}
                <small className="muted">
                  {count(
                    data.tasks.filter((t) => t.child === c.name).length,
                    "activité",
                  )}{" "}
                  ·{" "}
                  {count(
                    data.notes.filter((n) => n.child === c.name).length +
                      data.documents.filter((d) => d.child === c.name).length,
                    "trace",
                  )}{" "}
                  ·{" "}
                  {count(
                    data.bookings.filter(
                      (b) => b.child === c.name && b.status !== "annulée",
                    ).length,
                    "séance",
                  )}
                </small>
              </div>
              <div className="discussion-actions">
                <button className="text-button" onClick={() => setEdit(c)}>
                  <Pencil size={15} /> Modifier
                </button>
                {deleteId === c.id ? (
                  <>
                    <button
                      className="text-button danger"
                      disabled={busy}
                      onClick={async () => {
                        if (
                          await run(
                            () => api.remove("children", c.id),
                            "Enfant retiré.",
                          )
                        )
                          setDeleteId("");
                      }}
                    >
                      Confirmer
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setDeleteId("")}
                    >
                      Garder
                    </button>
                  </>
                ) : (
                  <button
                    className="text-button"
                    onClick={() => setDeleteId(c.id)}
                  >
                    <Trash2 size={15} /> Retirer
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
function Library({
  data,
  profile,
  api,
  run,
  busy,
  childNames,
}: Props & { childNames: string[] }) {
  const [edit, setEdit] = useState<Partial<LibraryItem> | null>(null);
  const [filter, setFilter] = useState("Tous");
  const [deleteId, setDeleteId] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const url = String(f.get("url") || "").trim();
    if (url && !safeUrl(url)) {
      await run(async () => {
        throw new Error("Le lien doit commencer par https://");
      });
      return;
    }
    if (
      await run(
        () =>
          api.save("library_items", {
            id: edit?.id ?? crypto.randomUUID(),
            family_id: profile.family_id,
            title: required(String(f.get("title")), 200),
            kind: String(f.get("kind")) as LibraryItem["kind"],
            author: optional(String(f.get("author")), 200),
            url: url || null,
            child: optional(String(f.get("child")), 80),
            notes: optional(String(f.get("notes")), 2000),
            created_at: edit?.created_at ?? new Date().toISOString(),
          }),
        "Ressource ajoutée à votre bibliothèque.",
      )
    )
      setEdit(null);
  };
  const rows = data.library_items
    .filter((i) => filter === "Tous" || i.child === filter)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <>
      <div className="filter-bar">
        <div className="tabs">
          {["Tous", ...childNames].map((c) => (
            <button
              key={c}
              className={filter === c ? "active" : ""}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          className="button primary"
          onClick={() =>
            setEdit({
              kind: "livre",
              child: filter === "Tous" ? everyone : filter,
            })
          }
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>
      {edit && (
        <form
          className="editor form-grid"
          onSubmit={submit}
          key={edit.id || "new"}
        >
          <div className="section-heading span-2">
            <h2>{edit.id ? "Modifier" : "Un livre, un lien, une ressource"}</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => setEdit(null)}
            >
              Annuler
            </button>
          </div>
          <label className="span-2">
            Titre
            <input
              name="title"
              defaultValue={edit.title}
              required
              maxLength={200}
            />
          </label>
          <label>
            Type
            <select name="kind" defaultValue={edit.kind ?? "livre"}>
              <option value="livre">Livre</option>
              <option value="lien">Lien</option>
              <option value="autre">Autre (jeu, matériel…)</option>
            </select>
          </label>
          <label>
            Auteur ou source
            <input name="author" defaultValue={edit.author} maxLength={200} />
          </label>
          <label>
            Lien HTTPS (facultatif)
            <input
              name="url"
              type="url"
              defaultValue={edit.url ?? ""}
              placeholder="https://"
            />
          </label>
          <label>
            Pour qui ?
            <input
              name="child"
              list="children-names-lib"
              defaultValue={edit.child}
              maxLength={80}
            />
            <datalist id="children-names-lib">
              {childNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </label>
          <label className="span-2">
            Notes
            <textarea name="notes" defaultValue={edit.notes} maxLength={2000} />
          </label>
          <button className="button primary" disabled={busy}>
            Enregistrer
          </button>
        </form>
      )}
      {!rows.length && <Empty>Aucun livre ou ressource pour ce filtre.</Empty>}
      <div className="document-list">
        {rows.map((i) => (
          <article key={i.id}>
            <BookMarked size={25} />
            <div>
              <strong>{i.title}</strong>
              <small>
                {i.kind === "livre"
                  ? "Livre"
                  : i.kind === "lien"
                    ? "Lien"
                    : "Autre"}
                {i.author && ` · ${i.author}`}
                {i.child && ` · ${i.child}`}
              </small>
              {i.notes && <p className="small">{i.notes}</p>}
              {i.url && safeUrl(i.url) && (
                <External url={i.url}>Ouvrir le lien</External>
              )}
            </div>
            <button
              className="icon-button"
              aria-label={`Modifier ${i.title}`}
              onClick={() => setEdit(i)}
            >
              <Pencil size={17} />
            </button>
            {deleteId === i.id ? (
              <div className="delete-confirm">
                <button
                  disabled={busy}
                  onClick={async () => {
                    if (
                      await run(
                        () => api.remove("library_items", i.id),
                        "Ressource retirée.",
                      )
                    )
                      setDeleteId("");
                  }}
                >
                  Supprimer
                </button>
                <button onClick={() => setDeleteId("")}>Garder</button>
              </div>
            ) : (
              <button
                className="icon-button"
                aria-label={`Supprimer ${i.title}`}
                onClick={() => setDeleteId(i.id)}
              >
                <Trash2 size={17} />
              </button>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
function Portfolio({
  data,
  profile,
  api,
  run,
  busy,
  childNames,
}: Props & { childNames: string[] }) {
  const [filter, setFilter] = useState("Tous");
  const [note, setNote] = useState<Partial<Note> | null>(null);
  const [deleteId, setDeleteId] = useState("");
  const [uploadChild, setUploadChild] = useState(everyone);
  const [uploadNote, setUploadNote] = useState("");
  const upload = async (file: File) => {
    const ok = await run(async () => {
      const path = await api.upload(file, profile.family_id);
      try {
        await api.save("documents", {
          id: crypto.randomUUID(),
          family_id: profile.family_id,
          title: file.name,
          path,
          created_at: new Date().toISOString(),
          child: optional(uploadChild, 80),
          note: optional(uploadNote, 2000),
        });
      } catch (e) {
        await api.deleteFile(path);
        throw e;
      }
    }, "Trace ajoutée à votre portfolio privé.");
    if (ok) setUploadNote("");
  };
  const saveNote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      await run(
        () =>
          api.save("notes", {
            id: note?.id ?? crypto.randomUUID(),
            family_id: profile.family_id,
            child: optional(String(f.get("child")), 80),
            date: String(f.get("date")),
            title: required(String(f.get("title")), 200),
            body: required(String(f.get("body"))),
            created_at: note?.created_at ?? new Date().toISOString(),
          }),
        "Note enregistrée dans le portfolio.",
      )
    )
      setNote(null);
  };
  type Entry =
    | { kind: "note"; date: string; row: Note }
    | { kind: "document"; date: string; row: (typeof data.documents)[number] };
  const entries: Entry[] = [
    ...data.notes.map((n) => ({ kind: "note" as const, date: n.date, row: n })),
    ...data.documents.map((d) => ({
      kind: "document" as const,
      date: d.created_at.slice(0, 10),
      row: d,
    })),
  ]
    .filter((e) => filter === "Tous" || e.row.child === filter)
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div className="privacy-banner">
        <LockKeyhole size={24} />
        <div>
          <h2>Les découvertes de votre famille</h2>
          <p>
            Notes datées et fichiers ne sont visibles que par votre famille et
            ne sont jamais publiés dans la communauté. Ce portfolio aide à
            observer les apprentissages; il ne constitue pas automatiquement un
            dossier officiel.
          </p>
        </div>
      </div>
      <div className="filter-bar">
        <div className="tabs">
          {["Tous", ...childNames].map((c) => (
            <button
              key={c}
              className={filter === c ? "active" : ""}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          className="button primary"
          onClick={() =>
            setNote({
              date: localDate(),
              child: filter === "Tous" ? everyone : filter,
            })
          }
        >
          <NotebookPen size={18} />
          Écrire une note
        </button>
      </div>
      {note && (
        <form
          className="editor form-grid"
          onSubmit={saveNote}
          key={note.id || "new"}
        >
          <div className="section-heading span-2">
            <h2>{note.id ? "Modifier la note" : "Une trace sans fichier"}</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => setNote(null)}
            >
              Annuler
            </button>
          </div>
          <label className="span-2">
            Titre
            <input
              name="title"
              defaultValue={note.title}
              required
              maxLength={200}
              placeholder="Le pont en cartons, la première lettre…"
            />
          </label>
          <label>
            Enfant
            <input
              name="child"
              list="children-names-notes"
              defaultValue={note.child}
              maxLength={80}
            />
            <datalist id="children-names-notes">
              {childNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </label>
          <label>
            Date
            <input name="date" type="date" defaultValue={note.date} required />
          </label>
          <label className="span-2">
            Ce qui s’est passé, dans les mots de l’enfant si possible
            <textarea
              name="body"
              defaultValue={note.body}
              required
              maxLength={5000}
            />
          </label>
          <button className="button primary" disabled={busy}>
            Enregistrer la note
          </button>
        </form>
      )}
      <section className="upload-block">
        <div className="form-grid">
          <label>
            Enfant concerné
            <input
              list="children-names-upload"
              value={uploadChild}
              onChange={(e) => setUploadChild(e.target.value)}
              maxLength={80}
            />
            <datalist id="children-names-upload">
              {childNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </label>
          <label>
            Contexte (facultatif)
            <input
              value={uploadNote}
              onChange={(e) => setUploadNote(e.target.value)}
              maxLength={2000}
              placeholder="Photo du carnet nature, dictée à l’adulte…"
            />
          </label>
        </div>
        <label className={`upload-zone ${busy ? "disabled" : ""}`}>
          <Upload size={25} />
          <strong>Ajouter un fichier au portfolio</strong>
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
      </section>
      {!entries.length ? (
        <Empty>
          Votre portfolio est prêt. Ajoutez une première trace d’apprentissage.
        </Empty>
      ) : (
        <div className="document-list">
          {entries.map((e) =>
            e.kind === "note" ? (
              <article key={e.row.id}>
                <NotebookPen size={25} />
                <div>
                  <strong>{e.row.title}</strong>
                  <small>
                    {formatDate(e.row.date)}
                    {e.row.child && ` · ${e.row.child}`}
                  </small>
                  <p className="small preserve-lines">{e.row.body}</p>
                </div>
                <button
                  className="icon-button"
                  aria-label={`Modifier ${e.row.title}`}
                  onClick={() => setNote(e.row)}
                >
                  <Pencil size={17} />
                </button>
                {deleteId === e.row.id ? (
                  <div className="delete-confirm">
                    <button
                      disabled={busy}
                      onClick={async () => {
                        if (
                          await run(
                            () => api.remove("notes", e.row.id),
                            "Note supprimée.",
                          )
                        )
                          setDeleteId("");
                      }}
                    >
                      Supprimer
                    </button>
                    <button onClick={() => setDeleteId("")}>Garder</button>
                  </div>
                ) : (
                  <button
                    className="icon-button"
                    aria-label={`Supprimer ${e.row.title}`}
                    onClick={() => setDeleteId(e.row.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </article>
            ) : (
              <article key={e.row.id}>
                <FileText size={25} />
                <div>
                  <strong>{e.row.title}</strong>
                  <small>
                    Ajouté le{" "}
                    {new Date(e.row.created_at).toLocaleDateString("fr-CA")}
                    {e.row.child && ` · ${e.row.child}`}
                  </small>
                  {e.row.note && <p className="small">{e.row.note}</p>}
                </div>
                <button
                  className="icon-button"
                  aria-label={`Télécharger ${e.row.title}`}
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      downloadBlob(await api.download(e.row.path), e.row.title);
                    }, "Téléchargement préparé.")
                  }
                >
                  <Download size={18} />
                </button>
                {deleteId === e.row.id ? (
                  <div className="delete-confirm">
                    <button
                      disabled={busy}
                      onClick={async () => {
                        if (
                          await run(async () => {
                            await api.deleteFile(e.row.path);
                            await api.remove("documents", e.row.id);
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
                    aria-label={`Supprimer ${e.row.title}`}
                    onClick={() => setDeleteId(e.row.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </article>
            ),
          )}
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
                      version: 2,
                      exported_at: new Date().toISOString(),
                      children: fresh.children,
                      week_plans: fresh.week_plans,
                      tasks: fresh.tasks,
                      library_items: fresh.library_items,
                      notes: fresh.notes,
                      documents: fresh.documents,
                      progress: fresh.progress,
                      lesson_notes: fresh.lesson_notes,
                      bookings: fresh.bookings,
                      tutor_reports: fresh.tutor_reports,
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
        Exporter mon organisation, mon portfolio et ma progression
      </button>
      <p className="small muted">
        L’export contient les données et la liste des fichiers. Téléchargez
        chaque fichier pour en conserver une copie.
      </p>
    </>
  );
}
function Program({
  data,
  profile,
  api,
  run,
  busy,
  childNames,
}: Props & { childNames: string[] }) {
  const [current, setCurrent] = useState(data.curricula[0]?.id ?? "");
  const [create, setCreate] = useState(false);
  const [importing, setImporting] = useState(false);
  const [text, setText] = useState("");
  const [item, setItem] = useState<Partial<CurriculumItem> | null>(null);
  const [deleteId, setDeleteId] = useState("");
  const curriculum =
    data.curricula.find((c) => c.id === current) ?? data.curricula[0];
  const items = data.curriculum_items
    .filter((i) => i.curriculum_id === curriculum?.id)
    .sort(
      (a, b) =>
        (a.planned_date ?? "9999").localeCompare(b.planned_date ?? "9999") ||
        a.position - b.position,
    );
  const subjects = [...new Set(items.map((i) => i.subject))];
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const createCurriculum = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const id = crypto.randomUUID();
    if (
      await run(
        () =>
          api.save("curricula", {
            id,
            family_id: profile.family_id,
            child: optional(String(f.get("child")), 80),
            title: required(String(f.get("title")), 160),
            school_year: optional(String(f.get("school_year")), 40),
            created_at: new Date().toISOString(),
          }),
        "Programme créé. Ajoutez ou importez ses éléments.",
      )
    ) {
      setCurrent(id);
      setCreate(false);
      setImporting(true);
    }
  };
  const doImport = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!curriculum) return;
    const f = new FormData(e.currentTarget);
    const parsed = parseCurriculum(text);
    if (!parsed.length) {
      await run(async () => {
        throw new Error(
          "Aucune ligne reconnue. Format : Matière | Titre | AAAA-MM-JJ (date facultative).",
        );
      });
      return;
    }
    const days = [1, 2, 3, 4, 5, 6, 7].filter((d) => f.has("d" + d));
    const start = String(f.get("start") || localDate());
    const perDay = Number(f.get("per_day") || 2);
    const dated =
      f.has("spread") && days.length
        ? spreadDates(parsed, shiftDate(start, -1), days, perDay)
        : parsed;
    const base = items.length;
    if (
      await run(
        async () => {
          for (const [i, row] of dated.entries())
            await api.save("curriculum_items", {
              id: crypto.randomUUID(),
              curriculum_id: curriculum.id,
              family_id: profile.family_id,
              subject: row.subject,
              title: row.title,
              planned_date: row.planned_date,
              done: false,
              position: base + i + 1,
            });
        },
        `${dated.length} élément${dated.length > 1 ? "s" : ""} ajouté${dated.length > 1 ? "s" : ""} au programme${f.has("spread") ? " et répartis dans le calendrier" : ""}.`,
      )
    ) {
      setText("");
      setImporting(false);
    }
  };
  const saveItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!curriculum) return;
    const f = new FormData(e.currentTarget);
    if (
      await run(
        () =>
          api.save("curriculum_items", {
            id: item?.id ?? crypto.randomUUID(),
            curriculum_id: curriculum.id,
            family_id: profile.family_id,
            subject: required(String(f.get("subject")), 80),
            title: required(String(f.get("title")), 200),
            planned_date: String(f.get("planned_date") || "") || null,
            done: item?.done ?? false,
            position: item?.position ?? items.length + 1,
          }),
        "Élément enregistré.",
      )
    )
      setItem(null);
  };
  const spreadRemaining = async () => {
    if (!curriculum) return;
    const undated = items.filter((i) => !i.planned_date);
    const dated = spreadDates(
      undated,
      shiftDate(api.mode === "demo" ? "2026-09-14" : localDate(), -1),
      [1, 2, 3, 4, 5],
      2,
    );
    await run(
      async () => {
        for (const row of dated) await api.save("curriculum_items", row);
      },
      `${dated.length} élément${dated.length > 1 ? "s" : ""} placé${dated.length > 1 ? "s" : ""} dans le calendrier (2 par jour, du lundi au vendredi).`,
    );
  };
  return (
    <>
      <div className="privacy-banner">
        <ListChecks size={24} />
        <div>
          <h2>Votre programme, dans votre calendrier</h2>
          <p>
            Collez ou importez la liste des notions à couvrir; ParentEd les
            répartit sur vos jours d’école et suit ce qui est fait. Le programme
            reste privé et ne constitue pas une validation officielle.
          </p>
        </div>
      </div>
      <div className="filter-bar">
        <div className="tabs">
          {data.curricula.map((c) => (
            <button
              key={c.id}
              className={curriculum?.id === c.id ? "active" : ""}
              onClick={() => setCurrent(c.id)}
            >
              {c.title}
            </button>
          ))}
        </div>
        <div className="discussion-actions">
          {curriculum && (
            <button
              className="button secondary"
              onClick={() => setImporting(!importing)}
            >
              <UploadIcon size={16} /> Importer
            </button>
          )}
          <button className="button primary" onClick={() => setCreate(!create)}>
            <Plus size={16} /> Nouveau programme
          </button>
        </div>
      </div>
      {create && (
        <form className="editor form-grid" onSubmit={createCurriculum}>
          <label className="span-2">
            Titre
            <input
              name="title"
              required
              maxLength={160}
              placeholder="Programme de Lina · année 2026-2027"
            />
          </label>
          <label>
            Enfant
            <input name="child" list="children-names-prog" maxLength={80} />
            <datalist id="children-names-prog">
              {childNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </label>
          <label>
            Année scolaire
            <input name="school_year" maxLength={40} placeholder="2026-2027" />
          </label>
          <button className="button primary" disabled={busy}>
            Créer
          </button>
        </form>
      )}
      {importing && curriculum && (
        <form className="editor" onSubmit={doImport}>
          <h2>Importer des éléments dans « {curriculum.title} »</h2>
          <p className="small muted">
            Une ligne par notion : <code>Matière | Titre | 2026-09-15</code> (la
            date est facultative). Un fichier CSV exporté d’un tableur
            fonctionne aussi (colonnes matière, titre, date).
          </p>
          <label className="upload-zone small-zone">
            <UploadIcon size={20} />
            <strong>Choisir un fichier .csv ou .txt</strong>
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setText((await file.text()).slice(0, 50000));
                e.target.value = "";
              }}
            />
          </label>
          <label>
            Ou collez votre liste
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={
                "Mathématiques | Fractions équivalentes\nFrançais | Le texte descriptif | 2026-09-16\nSciences | Le cycle de l’eau"
              }
            />
          </label>
          <p className="small muted">
            {parseCurriculum(text).length} élément(s) reconnu(s).
          </p>
          <div className="form-grid">
            <label className="checkbox-label span-2">
              <input type="checkbox" name="spread" defaultChecked />
              <Wand2 size={16} /> Répartir automatiquement les éléments sans
              date dans le calendrier
            </label>
            <label>
              À partir du
              <input
                type="date"
                name="start"
                defaultValue={api.mode === "demo" ? "2026-09-14" : localDate()}
              />
            </label>
            <label>
              Éléments par jour
              <select name="per_day" defaultValue="2">
                {[1, 2, 3, 4].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <div className="span-2 chips-row">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <label key={d} className="chip">
                  <input
                    type="checkbox"
                    name={"d" + d}
                    defaultChecked={d <= 5}
                  />
                  {["", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][d]}
                </label>
              ))}
            </div>
          </div>
          <div className="discussion-actions">
            <button className="button primary" disabled={busy || !text.trim()}>
              Importer
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setImporting(false)}
            >
              Fermer
            </button>
          </div>
        </form>
      )}
      {!curriculum ? (
        <Empty>
          Créez un premier programme, puis importez ses notions : elles
          apparaîtront dans « Ma semaine ».
        </Empty>
      ) : (
        <>
          <section className="stats-grid">
            <div className="stat-tile hero">
              <span className="eyebrow">Programme couvert</span>
              <strong>{total ? Math.round((done / total) * 100) : 0} %</strong>
              <small>
                {done} sur {total} élément{total > 1 ? "s" : ""}
                {curriculum.child && ` · ${curriculum.child}`}
              </small>
            </div>
            {subjects.map((sub) => {
              const rows = items.filter((i) => i.subject === sub);
              const d = rows.filter((i) => i.done).length;
              return (
                <div className="stat-tile" key={sub}>
                  <span className="eyebrow">{sub}</span>
                  <strong>{Math.round((d / rows.length) * 100)} %</strong>
                  <small>
                    {d} / {rows.length} · prochain :{" "}
                    {rows.find((i) => !i.done)?.title ?? "tout est fait"}
                  </small>
                  <progress value={d} max={rows.length} />
                </div>
              );
            })}
          </section>
          <div className="section-heading">
            <h2>Éléments du programme</h2>
            <div className="discussion-actions">
              {items.some((i) => !i.planned_date) && (
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={spreadRemaining}
                >
                  <Wand2 size={15} /> Placer les éléments sans date
                </button>
              )}
              <button
                className="text-button"
                onClick={() =>
                  setItem({ subject: subjects[0] ?? "", planned_date: null })
                }
              >
                <Plus size={15} /> Ajouter un élément
              </button>
            </div>
          </div>
          {item && (
            <form
              className="editor form-grid"
              onSubmit={saveItem}
              key={item.id || "new"}
            >
              <label>
                Matière
                <input
                  name="subject"
                  defaultValue={item.subject}
                  required
                  maxLength={80}
                  list="subjects-list"
                />
                <datalist id="subjects-list">
                  {subjects.map((s2) => (
                    <option key={s2} value={s2} />
                  ))}
                </datalist>
              </label>
              <label>
                Date prévue (facultatif)
                <input
                  name="planned_date"
                  type="date"
                  defaultValue={item.planned_date ?? ""}
                />
              </label>
              <label className="span-2">
                Notion, chapitre ou activité
                <input
                  name="title"
                  defaultValue={item.title}
                  required
                  maxLength={200}
                />
              </label>
              <div className="discussion-actions span-2">
                <button className="button primary" disabled={busy}>
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setItem(null)}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
          {!items.length && (
            <Empty>
              Ce programme est vide. Utilisez « Importer » ou « Ajouter un
              élément ».
            </Empty>
          )}
          <div className="document-list">
            {items.map((i) => (
              <article key={i.id} className={i.done ? "done" : ""}>
                <button
                  className={`task-check big ${i.done ? "on" : ""}`}
                  disabled={busy}
                  aria-label={`${i.done ? "Remettre à faire" : "Terminer"} : ${i.title}`}
                  onClick={() =>
                    run(
                      () =>
                        api.save("curriculum_items", { ...i, done: !i.done }),
                      i.done ? "Remis à faire." : "Terminé !",
                    )
                  }
                >
                  <Check size={16} />
                </button>
                <div>
                  <strong>{i.title}</strong>
                  <small>
                    {i.subject}
                    {i.planned_date
                      ? ` · ${formatDate(i.planned_date)}`
                      : " · sans date"}
                  </small>
                </div>
                <button
                  className="icon-button"
                  aria-label={`Modifier ${i.title}`}
                  onClick={() => setItem(i)}
                >
                  <Pencil size={17} />
                </button>
                {deleteId === i.id ? (
                  <div className="delete-confirm">
                    <button
                      disabled={busy}
                      onClick={async () => {
                        if (
                          await run(
                            () => api.remove("curriculum_items", i.id),
                            "Élément retiré.",
                          )
                        )
                          setDeleteId("");
                      }}
                    >
                      Supprimer
                    </button>
                    <button onClick={() => setDeleteId("")}>Garder</button>
                  </div>
                ) : (
                  <button
                    className="icon-button"
                    aria-label={`Supprimer ${i.title}`}
                    onClick={() => setDeleteId(i.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </article>
            ))}
          </div>
          {deleteId === "curriculum" ? (
            <div className="delete-confirm">
              <button
                disabled={busy}
                onClick={async () => {
                  if (
                    await run(
                      () => api.remove("curricula", curriculum.id),
                      "Programme supprimé.",
                    )
                  ) {
                    setDeleteId("");
                    setCurrent("");
                  }
                }}
              >
                Supprimer tout le programme
              </button>
              <button onClick={() => setDeleteId("")}>Garder</button>
            </div>
          ) : (
            <button
              className="text-button danger"
              onClick={() => setDeleteId("curriculum")}
            >
              <Trash2 size={15} /> Supprimer ce programme
            </button>
          )}
        </>
      )}
    </>
  );
}
function Chart({
  series,
}: {
  series: { date: string; value: number; title: string }[];
}) {
  const w = 320;
  const h = 110;
  const pad = 22;
  if (!series.length) return null;
  const xs = (i: number) =>
    series.length === 1
      ? w / 2
      : pad + (i * (w - pad * 2)) / (series.length - 1);
  const ys = (v: number) => h - pad + 2 - ((h - pad * 2) * v) / 100;
  const path = series
    .map(
      (p, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(p.value).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg
      className="chart"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Évolution des résultats en pourcentage"
    >
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={pad} x2={w - pad} y1={ys(g)} y2={ys(g)} className="grid" />
          <text x={pad - 6} y={ys(g) + 3} className="axis" textAnchor="end">
            {g}
          </text>
        </g>
      ))}
      <path d={path} className="line" />
      {series.map((p, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(p.value)} r={4} className="dot">
            <title>
              {p.title} · {formatDate(p.date)} · {p.value} %
            </title>
          </circle>
          {(i === 0 || i === series.length - 1) && (
            <text
              x={xs(i)}
              y={ys(p.value) - 9}
              className="label"
              textAnchor="middle"
            >
              {p.value} %
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
function Results({
  data,
  profile,
  api,
  run,
  busy,
  childNames,
}: Props & { childNames: string[] }) {
  const kids = childNames.filter((n) => n !== everyone);
  const [child, setChild] = useState(kids[0] ?? "");
  const [edit, setEdit] = useState<Partial<Grade> | null>(null);
  const [deleteId, setDeleteId] = useState("");
  const grades = data.grades
    .filter((g) => g.child === child)
    .sort((a, b) => b.date.localeCompare(a.date));
  const stats = gradeStats(grades);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const score = Number(f.get("score"));
    const max = Number(f.get("max"));
    const weight = Number(f.get("weight") || 1);
    if (
      await run(async () => {
        if (!(weight > 0) || weight > 100)
          throw new Error(
            "La pondération doit être comprise entre 0,1 et 100.",
          );
        if (!(max > 0) || score < 0 || score > max)
          throw new Error("La note doit être comprise entre 0 et le maximum.");
        await api.save("grades", {
          id: edit?.id ?? crypto.randomUUID(),
          family_id: profile.family_id,
          child: required(String(f.get("child")), 80),
          subject: required(String(f.get("subject")), 80),
          title: required(String(f.get("title")), 160),
          score,
          max,
          date: String(f.get("date")),
          source: edit?.source ?? "manuel",
          created_at: edit?.created_at ?? new Date().toISOString(),
          weight,
        });
      }, "Résultat enregistré.")
    ) {
      setChild(String(f.get("child")));
      setEdit(null);
    }
  };
  return (
    <>
      <div className="filter-bar">
        <div className="tabs">
          {kids.map((k) => (
            <button
              key={k}
              className={child === k ? "active" : ""}
              onClick={() => setChild(k)}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          className="button primary"
          onClick={() => setEdit({ child, date: localDate(), max: 10 })}
        >
          <Plus size={16} /> Ajouter un résultat
        </button>
      </div>
      {edit && (
        <form
          className="editor form-grid"
          onSubmit={submit}
          key={edit.id || "new"}
        >
          <label>
            Enfant
            <input
              name="child"
              list="children-names-grades"
              defaultValue={edit.child}
              required
              maxLength={80}
            />
            <datalist id="children-names-grades">
              {kids.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </label>
          <label>
            Matière
            <input
              name="subject"
              defaultValue={edit.subject}
              required
              maxLength={80}
              list="grade-subjects"
            />
            <datalist id="grade-subjects">
              {[...new Set(data.grades.map((g) => g.subject))].map((s2) => (
                <option key={s2} value={s2} />
              ))}
            </datalist>
          </label>
          <label className="span-2">
            Intitulé (dictée, quiz, projet…)
            <input
              name="title"
              defaultValue={edit.title}
              required
              maxLength={160}
            />
          </label>
          <label>
            Note obtenue
            <input
              name="score"
              type="number"
              step="any"
              min={0}
              defaultValue={edit.score}
              required
            />
          </label>
          <label>
            Sur
            <input
              name="max"
              type="number"
              step="any"
              min={1}
              defaultValue={edit.max ?? 10}
              required
            />
          </label>
          <label>
            Date
            <input name="date" type="date" defaultValue={edit.date} required />
          </label>
          <label>
            Pondération
            <input
              name="weight"
              type="number"
              step="any"
              min={0.1}
              max={100}
              defaultValue={edit.weight ?? 1}
              required
            />
            <small className="muted">
              Poids dans la moyenne : 1 = normal, 2 = compte double, 0,5 =
              compte moitié. Un pourcentage fonctionne aussi (20 pour 20 %).
            </small>
          </label>
          <div className="discussion-actions">
            <button className="button primary" disabled={busy}>
              Enregistrer
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setEdit(null)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
      {!kids.length ? (
        <Empty>Ajoutez d’abord un enfant dans « Mes enfants ».</Empty>
      ) : !grades.length ? (
        <Empty>
          Aucun résultat pour {child}. Ajoutez une note ou faites un examen
          d’entraînement.
        </Empty>
      ) : (
        <>
          <section className="stats-grid">
            <div className="stat-tile hero">
              <span className="eyebrow">Moyenne générale ·{child}</span>
              <strong>{stats.overall} %</strong>
              <small>
                {grades.length} résultat{grades.length > 1 ? "s" : ""} ·{" "}
                {stats.subjects.length} matière
                {stats.subjects.length > 1 ? "s" : ""}
              </small>
            </div>
            {stats.subjects.map((s2) => (
              <div className="stat-tile" key={s2.subject}>
                <span className="eyebrow">{s2.subject}</span>
                <strong>{s2.average} %</strong>
                <small>
                  {s2.count} résultat{s2.count > 1 ? "s" : ""} · poids{" "}
                  {s2.weight} · dernier :{" "}
                  {percent(s2.latest.score, s2.latest.max)} %
                </small>
                <Chart series={s2.series} />
              </div>
            ))}
          </section>
          <p className="small muted">
            Moyennes pondérées : chaque note compte selon sa pondération.
            Repères pour la famille, pas un bulletin officiel.
          </p>
          <div className="section-heading">
            <h2>Détail des résultats</h2>
          </div>
          <div className="table-wrap">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matière</th>
                  <th>Intitulé</th>
                  <th>Note</th>
                  <th>%</th>
                  <th>Poids</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id}>
                    <td>
                      {formatDate(g.date, { day: "numeric", month: "short" })}
                    </td>
                    <td>{g.subject}</td>
                    <td>
                      {g.title}
                      {g.source === "examen" && (
                        <span className="pill">Entraînement</span>
                      )}
                    </td>
                    <td>
                      {g.score} / {g.max}
                    </td>
                    <td>
                      <strong>{percent(g.score, g.max)} %</strong>
                    </td>
                    <td>×{g.weight}</td>
                    <td className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={`Modifier ${g.title}`}
                        onClick={() => setEdit(g)}
                      >
                        <Pencil size={15} />
                      </button>
                      {deleteId === g.id ? (
                        <span className="delete-confirm">
                          <button
                            disabled={busy}
                            onClick={async () => {
                              if (
                                await run(
                                  () => api.remove("grades", g.id),
                                  "Résultat supprimé.",
                                )
                              )
                                setDeleteId("");
                            }}
                          >
                            Supprimer
                          </button>
                          <button onClick={() => setDeleteId("")}>
                            Garder
                          </button>
                        </span>
                      ) : (
                        <button
                          className="icon-button"
                          aria-label={`Supprimer ${g.title}`}
                          onClick={() => setDeleteId(g.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function CalendarImport({
  data,
  profile,
  api,
  run,
  busy,
  childNames,
  onDone,
}: Props & { childNames: string[]; onDone: () => void }) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const today = api.mode === "demo" ? "2026-09-07" : localDate();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(shiftDate(today, 90));
  const [child, setChild] = useState(everyone);
  const [allDay, setAllDay] = useState(true);
  const events = text ? parseIcs(text) : [];
  const rows = expandIcs(events, from, to).filter((r) => allDay || !r.allDay);
  const existing = new Map(
    data.tasks.filter((t) => t.source).map((t) => [t.source, t]),
  );
  const doImport = async () => {
    if (!rows.length) return;
    const ok = await run(
      async () => {
        for (const r of rows) {
          const prev = existing.get(r.uid);
          await api.save("tasks", {
            id: prev?.id ?? crypto.randomUUID(),
            family_id: profile.family_id,
            title: r.title,
            child: prev?.child ?? child,
            date: r.date,
            time: r.time,
            done: prev?.done ?? false,
            source: r.uid,
          });
        }
      },
      `${rows.length} événement${rows.length > 1 ? "s" : ""} importé${rows.length > 1 ? "s" : ""} dans votre semaine.`,
    );
    if (ok) onDone();
  };
  return (
    <section className="editor rise">
      <div className="section-heading">
        <h2>Importer un calendrier</h2>
        <button type="button" className="text-button" onClick={onDone}>
          Fermer
        </button>
      </div>
      <p className="small muted">
        Exportez votre calendrier au format <code>.ics</code> (Google Calendar :
        Paramètres → Importer et exporter → Exporter; Apple : Fichier →
        Exporter; Outlook : Enregistrer le calendrier). Les événements de la
        période choisie deviennent des activités de « Ma semaine ». Un second
        import du même fichier met à jour au lieu de dupliquer.
      </p>
      <label className="upload-zone small-zone">
        <UploadIcon size={20} />
        <strong>{name || "Choisir un fichier .ics"}</strong>
        <input
          type="file"
          accept=".ics,text/calendar"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              setName(file.name);
              setText((await file.text()).slice(0, 2_000_000));
            }
            e.target.value = "";
          }}
        />
      </label>
      <div className="form-grid">
        <label>
          Du
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Au
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label>
          Pour qui ?
          <input
            list="children-names-ics"
            value={child}
            onChange={(e) => setChild(e.target.value)}
            maxLength={80}
          />
          <datalist id="children-names-ics">
            {childNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          Inclure les événements « journée entière » (placés à 9 h)
        </label>
      </div>
      {text && (
        <p className="small">
          {events.length} événement{events.length > 1 ? "s" : ""} dans le
          fichier ·{" "}
          <strong>
            {rows.length} occurrence{rows.length > 1 ? "s" : ""}
          </strong>{" "}
          entre le {formatDate(from, { day: "numeric", month: "long" })} et le{" "}
          {formatDate(to, { day: "numeric", month: "long" })}
          {rows.some((r) => existing.has(r.uid)) &&
            " · certaines existent déjà et seront mises à jour"}
        </p>
      )}
      {rows.length > 0 && (
        <ul className="import-preview">
          {rows.slice(0, 8).map((r) => (
            <li key={r.uid}>
              <span>
                {formatDate(r.date, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}{" "}
                · {r.allDay ? "journée" : r.time}
              </span>
              <strong>{r.title}</strong>
            </li>
          ))}
          {rows.length > 8 && (
            <li className="muted">… et {rows.length - 8} de plus</li>
          )}
        </ul>
      )}
      <div className="discussion-actions">
        <button
          className="button primary"
          disabled={busy || !rows.length}
          onClick={doImport}
        >
          <CalendarPlus size={16} /> Importer
          {rows.length
            ? ` ${rows.length} événement${rows.length > 1 ? "s" : ""}`
            : ""}
        </button>
      </div>
    </section>
  );
}
