import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
} from "lucide-react";
import { completion } from "../domain";
import type { Props } from "../App";
import { Art, Empty, PageTitle } from "./ui";
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
            <article className="lesson-body">
              <div className="lesson-meta">
                <BookOpen size={17} />
                Cours pour parents <span>·</span>
                <Clock size={16} />
                {lesson.minutes} min de lecture
              </div>
              <h2>{lesson.title}</h2>
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
              <button
                className={`button ${done ? "secondary" : "primary"}`}
                disabled={busy}
                onClick={mark}
              >
                {done ? <CheckCircle2 size={18} /> : <CheckCircle2 size={18} />}
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
            </article>
          ) : (
            <Empty>Les leçons de ce cours sont en préparation.</Empty>
          )}
        </div>
      </>
    );
  }
  const courses = data.courses
    .filter((c) => c.published)
    .sort((a, b) => a.position - b.position)
    .filter(
      (c) =>
        filter === "Tous" ||
        (filter === "En cours"
          ? completion(
              data.lessons.filter((l) => l.course_id === c.id),
              data.progress,
            ) > 0 &&
            completion(
              data.lessons.filter((l) => l.course_id === c.id),
              data.progress,
            ) < 100
          : completion(
              data.lessons.filter((l) => l.course_id === c.id),
              data.progress,
            ) === 100),
    );
  return (
    <>
      <PageTitle
        eyebrow="APPRENDRE POUR MIEUX ACCOMPAGNER"
        title="Un temps pour vous former."
        description="Des idées concrètes pour votre quotidien de parent-éducateur."
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
          const pct = completion(l, data.progress);
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
                </div>
                <div className="progress-label">
                  <span>
                    {pct === 100 ? "Terminé" : pct ? "En cours" : "À découvrir"}
                  </span>
                  <strong>{pct} %</strong>
                </div>
                <progress value={pct} max={100} />
                <span className="text-link">
                  {pct ? "Retrouver le cours" : "Découvrir le cours"}
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
        terminée.
      </div>
    </>
  );
}
