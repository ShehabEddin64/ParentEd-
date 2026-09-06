import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  PlayCircle,
  Copy,
  Download,
  NotebookPen,
  MessageCircleQuestion,
} from "lucide-react";
import { completion, required } from "../domain";
import type { Props } from "../App";
import { Art, Empty, External, PageTitle, downloadBlob } from "./ui";
export function Courses({ data, profile, api, run, busy }: Props) {
  const [selected, setSelected] = useState(
    () => location.hash.split("/")[1] || "",
  );
  const [lessonId, setLessonId] = useState("");
  const [filter, setFilter] = useState("Tous");
  useEffect(() => {
    const f = () => {
      setSelected(location.hash.split("/")[1] || "");
      setLessonId("");
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const course = data.courses.find((c) => c.id === selected);
  const lessons = data.lessons
    .filter((l) => l.course_id === selected)
    .sort((a, b) => a.position - b.position);
  const lesson =
    lessons.find((l) => l.id === lessonId) ||
    lessons.find((l) => !data.progress.some((p) => p.lesson_id === l.id)) ||
    lessons[0];
  if (course) {
    const done = data.progress.find((p) => p.lesson_id === lesson?.id);
    const mark = () => {
      setLessonId(lesson.id);
      return run(
        async () => {
          if (done) await api.remove("progress", done.id);
          else
            await api.save("progress", {
              id: crypto.randomUUID(),
              lesson_id: lesson.id,
              user_id: profile.id,
              completed_at: new Date().toISOString(),
            });
        },
        done
          ? "Leçon remise à suivre."
          : "Progression enregistrée. Bravo pour ce pas !",
      );
    };
    return (
      <>
        <a href="#cours" className="back-link">
          <ArrowLeft size={17} />
          Tous les cours
        </a>
        <PageTitle
          eyebrow={course.category}
          title={course.title}
          description={course.description}
        />
        <div className="lesson-layout">
          <aside className="lesson-nav">
            <h2>Votre parcours</h2>
            <div className="progress-label">
              <span>
                {
                  data.progress.filter((p) =>
                    lessons.some((l) => l.id === p.lesson_id),
                  ).length
                }{" "}
                sur {lessons.length} leçons
              </span>
              <strong>{completion(lessons, data.progress)} %</strong>
            </div>
            <progress value={completion(lessons, data.progress)} max="100" />
            {lessons.map((l, i) => (
              <button
                key={l.id}
                className={lesson?.id === l.id ? "selected" : ""}
                onClick={() => setLessonId(l.id)}
              >
                {data.progress.some((p) => p.lesson_id === l.id) ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
                <span>
                  <small>
                    LEÇON {i + 1} · {l.minutes} MIN
                  </small>
                  {l.title}
                </span>
              </button>
            ))}
          </aside>
          {lesson ? (
            <article className="lesson-body" key={lesson.id}>
              <div className="lesson-meta">
                <BookOpen size={17} />
                Cours pour parents <span>·</span>
                <Clock size={16} />
                {lesson.minutes} min de lecture
              </div>
              <h2>{lesson.title}</h2>
              {lesson.video_url && (
                <div className="video-note">
                  <PlayCircle size={22} />
                  <div>
                    <strong>Vidéo du cours</strong>
                    <External url={lesson.video_url}>
                      Regarder la vidéo originale
                    </External>
                  </div>
                </div>
              )}
              {lesson.body.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <div className="exercise">
                <span className="eyebrow">À VOUS D’ESSAYER</span>
                <h3>Une petite action, aujourd’hui</h3>
                <p>{lesson.exercise}</p>
                <a href="#semaine" className="text-link">
                  Ouvrir mon espace familial <ArrowRight size={17} />
                </a>
              </div>
              {lesson.template && (
                <Template text={lesson.template} title={lesson.title} />
              )}
              <button
                className={`button ${done ? "secondary" : "primary"}`}
                disabled={busy}
                onClick={mark}
              >
                <CheckCircle2 size={18} />
                {busy
                  ? "Enregistrement…"
                  : done
                    ? "Terminée · remettre à suivre"
                    : "Marquer comme terminée"}
              </button>
              <p className="small muted">
                Votre progression est personnelle. Vous pouvez revenir sur
                chaque leçon.
              </p>
              <PersonalNote
                {...{ data, profile, api, run, busy }}
                lessonId={lesson.id}
              />
              <Questions
                {...{ data, profile, api, run, busy }}
                lessonId={lesson.id}
              />
            </article>
          ) : (
            <Empty>Les leçons de ce cours sont en préparation.</Empty>
          )}
        </div>
      </>
    );
  }
  const pct = (id: string) =>
    completion(
      data.lessons.filter((l) => l.course_id === id),
      data.progress,
    );
  const courses = data.courses
    .filter((c) => c.published)
    .sort((a, b) => a.position - b.position)
    .filter(
      (c) =>
        filter === "Tous" ||
        (filter === "En cours"
          ? pct(c.id) > 0 && pct(c.id) < 100
          : pct(c.id) === 100),
    );
  return (
    <>
      <PageTitle
        eyebrow="APPRENDRE POUR MIEUX ACCOMPAGNER"
        title="Un temps pour vous former."
        description="Des idées concrètes pour votre quotidien de parent-éducateur : modules, exemples, exercices et modèles à réutiliser."
      />
      <div className="tabs" aria-label="Filtrer les cours">
        {["Tous", "En cours", "Terminés"].map((t) => (
          <button
            key={t}
            className={filter === t ? "active" : ""}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="course-grid">
        {courses.map((c, i) => {
          const l = data.lessons.filter((l) => l.course_id === c.id);
          const p = pct(c.id);
          return (
            <a key={c.id} href={"#cours/" + c.id} className="course-card">
              <Art variant={i} />
              <div className="course-card-content">
                <span className="pill">{c.category}</span>
                <h2>{c.title}</h2>
                <p>{c.description}</p>
                <div className="lesson-meta">
                  <BookOpen size={16} />
                  {l.length} leçons<span>·</span>
                  {l.reduce((n, x) => n + x.minutes, 0)} min
                  {l.some((x) => x.template) && (
                    <>
                      <span>·</span>
                      <Download size={15} />
                      modèles
                    </>
                  )}
                </div>
                <div className="progress-label">
                  <span>
                    {p === 100 ? "Terminé" : p ? "En cours" : "À découvrir"}
                  </span>
                  <strong>{p} %</strong>
                </div>
                <progress value={p} max={100} />
                <span className="text-link">
                  {p ? "Retrouver le cours" : "Découvrir le cours"}
                  <ArrowRight size={17} />
                </span>
              </div>
            </a>
          );
        })}
      </div>
      {!courses.length && (
        <Empty>Aucun cours dans cette catégorie pour le moment.</Empty>
      )}
      <div className="gentle-note">
        À votre rythme : votre progression est enregistrée après chaque leçon
        terminée. Les cours s’adressent aux parents; ils ne remplacent pas les
        sources officielles.
      </div>
    </>
  );
}
function Template({ text, title }: { text: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <section className="template-box">
      <span className="eyebrow">MODÈLE À RÉUTILISER</span>
      <h3>{text.split("\n")[0]}</h3>
      <pre>{text.split("\n").slice(1).join("\n").trim()}</pre>
      <div className="discussion-actions">
        <button className="button secondary" type="button" onClick={copy}>
          <Copy size={16} />
          {copied ? "Copié !" : "Copier le modèle"}
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() =>
            downloadBlob(
              new Blob([text], { type: "text/plain;charset=utf-8" }),
              `parented-modele-${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.txt`,
            )
          }
        >
          <Download size={16} />
          Télécharger (.txt)
        </button>
      </div>
    </section>
  );
}
function PersonalNote({
  data,
  profile,
  api,
  run,
  busy,
  lessonId,
}: Props & { lessonId: string }) {
  const note = data.lesson_notes.find((n) => n.lesson_id === lessonId);
  const [body, setBody] = useState(note?.body ?? "");
  const [open, setOpen] = useState(Boolean(note));
  const save = async (e: FormEvent) => {
    e.preventDefault();
    await run(async () => {
      const clean = body.trim();
      if (!clean && note) await api.remove("lesson_notes", note.id);
      else if (clean)
        await api.save("lesson_notes", {
          id: note?.id ?? crypto.randomUUID(),
          user_id: profile.id,
          lesson_id: lessonId,
          body: required(clean),
          updated_at: new Date().toISOString(),
        });
    }, "Note personnelle enregistrée.");
  };
  return (
    <section className="lesson-extra">
      <button
        className="lesson-extra-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <NotebookPen size={18} />
        <span>
          <strong>Ma note personnelle</strong>
          <small>
            {note
              ? "Modifiée le " +
                new Date(note.updated_at).toLocaleDateString("fr-CA")
              : "Visible par vous seulement"}
          </small>
        </span>
      </button>
      {open && (
        <form onSubmit={save}>
          <label>
            Ce que je retiens, ce que j’essaie
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={5000}
              placeholder="Une idée à garder, un repère à essayer cette semaine…"
            />
          </label>
          <div className="form-actions">
            <button className="button primary" disabled={busy}>
              Enregistrer ma note
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
function Questions({
  data,
  profile,
  api,
  run,
  busy,
  lessonId,
}: Props & { lessonId: string }) {
  const [ask, setAsk] = useState(false);
  const questions = data.lesson_questions
    .filter((q) => q.lesson_id === lessonId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (
      await run(
        () =>
          api.save("lesson_questions", {
            id: crypto.randomUUID(),
            lesson_id: lessonId,
            user_id: profile.id,
            author: profile.display_name,
            body: required(String(f.get("body")), 2000),
            answer: null,
            answered_at: null,
            created_at: new Date().toISOString(),
          }),
        "Question transmise à l’équipe pédagogique.",
      )
    ) {
      form.reset();
      setAsk(false);
    }
  };
  return (
    <section className="lesson-extra">
      <div className="lesson-extra-toggle static">
        <MessageCircleQuestion size={18} />
        <span>
          <strong>Questions sur cette leçon</strong>
          <small>
            Les réponses de l’équipe sont visibles par tous les membres.
          </small>
        </span>
        <button
          type="button"
          className="text-button"
          onClick={() => setAsk(!ask)}
        >
          {ask ? "Fermer" : "Poser une question"}
        </button>
      </div>
      {ask && (
        <form onSubmit={submit}>
          <label>
            Votre question
            <textarea
              name="body"
              required
              maxLength={2000}
              placeholder="Évitez les renseignements personnels sur vos enfants."
            />
          </label>
          <div className="form-actions">
            <button className="button primary" disabled={busy}>
              Envoyer à l’équipe
            </button>
          </div>
        </form>
      )}
      {questions.map((q) => (
        <article className="question" key={q.id}>
          <div className="post-author">
            <span className="avatar sand">{q.author[0]}</span>
            <span>
              {q.author}
              <small>
                {new Date(q.created_at).toLocaleDateString("fr-CA")}
              </small>
            </span>
            {(q.user_id === profile.id || profile.role === "admin") && (
              <button
                className="text-button danger"
                disabled={busy}
                onClick={() =>
                  run(
                    () => api.remove("lesson_questions", q.id),
                    "Question supprimée.",
                  )
                }
              >
                Supprimer
              </button>
            )}
          </div>
          <p className="preserve-lines">{q.body}</p>
          {q.answer ? (
            <div className="answer">
              <span className="pill">RÉPONSE DE L’ÉQUIPE</span>
              <p className="preserve-lines">{q.answer}</p>
            </div>
          ) : (
            <small className="muted">En attente de réponse</small>
          )}
        </article>
      ))}
    </section>
  );
}
