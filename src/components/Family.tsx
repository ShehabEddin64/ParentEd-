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
} from "lucide-react";
import {
  localDate,
  optional,
  required,
  safeUrl,
  shiftDate,
  weekDates,
  formatDate,
  type Task,
  type Child,
  type LibraryItem,
  type Note,
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
    ["bibliotheque", "Livres et ressources", BookMarked],
    ["portfolio", "Portfolio privé", LockKeyhole],
  ] as const;
  return (
    <>
      <PageTitle
        eyebrow="VOTRE QUOTIDIEN, À VOTRE FAÇON"
        title="De la place pour apprendre."
        description="Une semaine souple par enfant, vos livres et ressources, et un portfolio privé pour garder des traces."
        action={
          view === "semaine" && (
            <button
              className="button primary"
              onClick={() =>
                setEditing({ date: anchor, time: "09:00", child: everyone })
              }
            >
              <Plus size={18} />
              Ajouter une activité
            </button>
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
        <span className="eyebrow">PLAN HEBDOMADAIRE</span>
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
