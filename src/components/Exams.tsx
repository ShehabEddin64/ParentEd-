import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  RotateCcw,
  Trophy,
} from "lucide-react";
import type { Props } from "../App";
import { percent, safeUrl, type Exam } from "../domain";
import { Empty, External, PageTitle } from "./ui";
import { photoFor } from "../images";
export function Exams(props: Props) {
  const { data, profile } = props;
  const [selected, setSelected] = useState(
    () => location.hash.split("/")[1] || "",
  );
  useEffect(() => {
    const f = () => setSelected(location.hash.split("/")[1] || "");
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const exam = data.exams.find((e) => e.id === selected);
  if (exam) return <Runner {...props} exam={exam} />;
  const exams = data.exams
    .filter((e) => e.published)
    .sort((a, b) => a.position - b.position);
  const prep = data.resources.filter((r) =>
    /examen|épreuve|bilan|évaluation/i.test(
      r.category + " " + r.title + " " + r.description,
    ),
  );
  const attempts = data.exam_attempts.filter(
    (a) => a.family_id === profile.family_id,
  );
  return (
    <>
      <PageTitle
        eyebrow="S’entraîner sans pression"
        title="Préparation aux examens."
        description="Des examens d’entraînement corrigés, inspirés du format des épreuves, et des ressources pour préparer les bilans. Ce ne sont pas des évaluations officielles."
      />
      <div className="privacy-banner">
        <ClipboardList size={23} />
        <p>
          Les résultats restent dans votre espace familial et alimentent les
          statistiques de « Ma semaine → Résultats ». Les épreuves
          ministérielles et leurs modalités relèvent des sources officielles
          liées ci-dessous.
        </p>
      </div>
      <div className="exam-grid">
        {exams.map((e) => {
          const count = data.exam_questions.filter(
            (q) => q.exam_id === e.id,
          ).length;
          const mine = attempts
            .filter((a) => a.exam_id === e.id)
            .sort((a, b) => b.created_at.localeCompare(a.created_at));
          const best = mine.length
            ? Math.max(...mine.map((a) => percent(a.score, a.total)))
            : null;
          return (
            <a href={"#examens/" + e.id} className="exam-card" key={e.id}>
              <div className="card-photo">
                <img
                  className="photo"
                  src={photoFor("exam", e.subject, e.id)}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="exam-card-content">
                <div className="pill-row">
                  <span className="pill">{e.subject}</span>
                  {e.level && <span className="pill">{e.level}</span>}
                </div>
                <h2>{e.title}</h2>
                <p>{e.description}</p>
                <div className="lesson-meta">
                  <ClipboardList size={16} />
                  {count} questions <span>·</span>
                  <Clock size={16} />
                  {e.minutes} min
                </div>
                {best !== null ? (
                  <div className="progress-label">
                    <span>
                      Meilleur résultat · {mine.length} essai
                      {mine.length > 1 ? "s" : ""}
                    </span>
                    <strong>{best} %</strong>
                  </div>
                ) : (
                  <div className="progress-label">
                    <span>Pas encore essayé</span>
                  </div>
                )}
                <progress value={best ?? 0} max={100} />
                <span className="text-link">
                  {best !== null ? "Refaire l’examen" : "Commencer"}{" "}
                  <ArrowRight size={16} />
                </span>
              </div>
            </a>
          );
        })}
      </div>
      {!exams.length && (
        <Empty>Les examens d’entraînement arrivent bientôt.</Empty>
      )}
      <div className="section-heading">
        <h2>Ressources pour préparer les bilans et épreuves</h2>
        <a href="#ressources">
          Toute la bibliothèque <ArrowRight size={16} />
        </a>
      </div>
      <div className="resource-grid">
        {prep.map((r) => (
          <article className="resource-card" key={r.id}>
            <div className="card-photo">
              <img
                className="photo"
                src={photoFor("resource", r.category + " " + r.title, r.id)}
                alt=""
                loading="lazy"
              />
            </div>
            <div className="resource-body">
              <span className="pill">{r.category}</span>
              <h2>{r.title}</h2>
              <p>{r.description}</p>
              <small>
                {r.source} · relevé le {r.checked_at}
              </small>
              {safeUrl(r.url) && (
                <External url={r.url}>Consulter la source officielle</External>
              )}
            </div>
          </article>
        ))}
      </div>
      {!prep.length && (
        <Empty>Aucune ressource de préparation liée pour le moment.</Empty>
      )}
    </>
  );
}
function Runner({
  data,
  profile,
  api,
  run,
  busy,
  exam,
}: Props & { exam: Exam }) {
  const questions = data.exam_questions
    .filter((q) => q.exam_id === exam.id)
    .sort((a, b) => a.position - b.position);
  const [child, setChild] = useState(data.children[0]?.name ?? "");
  const [started, setStarted] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (started === null || result) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [started, result]);
  const elapsed = started === null ? 0 : Math.floor((now - started) / 1000);
  const remaining = Math.max(0, exam.minutes * 60 - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const submit = async () => {
    const score = questions.filter(
      (q, i) => answers[i] === q.answer_index,
    ).length;
    const ok = await run(async () => {
      await api.save("exam_attempts", {
        id: crypto.randomUUID(),
        family_id: profile.family_id,
        user_id: profile.id,
        exam_id: exam.id,
        child: child.trim().slice(0, 80),
        score,
        total: questions.length,
        answers: answers.map((a) => a ?? -1),
        created_at: new Date().toISOString(),
      });
      if (child.trim())
        await api.save("grades", {
          id: crypto.randomUUID(),
          family_id: profile.family_id,
          child: child.trim().slice(0, 80),
          subject: exam.subject,
          title: exam.title + " (entraînement)",
          score,
          max: questions.length,
          date: new Date().toISOString().slice(0, 10),
          source: "examen",
          created_at: new Date().toISOString(),
        });
    }, `Résultat enregistré : ${score} / ${questions.length}.`);
    if (ok) setResult({ score });
  };
  useEffect(() => {
    if (started !== null && !result && remaining === 0 && !busy) void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);
  if (!questions.length)
    return (
      <>
        <a href="#examens" className="back-link">
          <ArrowLeft size={17} /> Tous les examens
        </a>
        <Empty>Cet examen est en préparation.</Empty>
      </>
    );
  if (started === null)
    return (
      <>
        <a href="#examens" className="back-link">
          <ArrowLeft size={17} /> Tous les examens
        </a>
        <PageTitle
          eyebrow={`${exam.subject}${exam.level ? " · " + exam.level : ""}`}
          title={exam.title}
          description={exam.description}
        />
        <section className="editor exam-start">
          <ul className="event-facts">
            <li>
              <ClipboardList size={17} /> {questions.length} questions à choix
              multiples
            </li>
            <li>
              <Clock size={17} /> {exam.minutes} minutes conseillées; le chrono
              s’arrête à la fin du temps
            </li>
            <li>
              <CheckCircle2 size={17} /> Correction immédiate avec explications;
              résultat ajouté aux notes de l’enfant
            </li>
          </ul>
          <label>
            Qui passe l’examen ?
            <input
              list="children-exam"
              value={child}
              onChange={(e) => setChild(e.target.value)}
              maxLength={80}
              placeholder="Prénom de l’enfant (laisser vide pour ne pas enregistrer de note)"
            />
            <datalist id="children-exam">
              {data.children.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>
          <p className="small muted">
            Entraînement fictif : ni le contenu ni le résultat n’ont valeur
            officielle. Installez l’enfant au calme, sans aide, comme lors d’une
            vraie épreuve.
          </p>
          <button
            className="button primary"
            onClick={() => setStarted(Date.now())}
          >
            Commencer <ArrowRight size={17} />
          </button>
        </section>
      </>
    );
  if (result) {
    const pct = percent(result.score, questions.length);
    return (
      <>
        <a href="#examens" className="back-link">
          <ArrowLeft size={17} /> Tous les examens
        </a>
        <PageTitle
          eyebrow="Résultat"
          title={`${result.score} / ${questions.length} · ${pct} %`}
          description={
            pct >= 80
              ? "Très bien ! Les notions sont bien en place."
              : pct >= 50
                ? "En bonne voie. Relisez les explications ci-dessous et refaites l’examen dans quelques jours."
                : "Ce sont des notions à retravailler ensemble; les explications ci-dessous donnent des pistes."
          }
        />
        <div className="discussion-actions">
          <button
            className="button primary"
            onClick={() => {
              setAnswers(questions.map(() => null));
              setResult(null);
              setStarted(null);
            }}
          >
            <RotateCcw size={16} /> Refaire
          </button>
          <a href="#semaine" className="button secondary">
            <Trophy size={16} /> Voir les résultats de {child || "l’enfant"}
          </a>
        </div>
        <ol className="review-list">
          {questions.map((q, i) => {
            const good = answers[i] === q.answer_index;
            return (
              <li key={q.id} className={good ? "good" : "bad"}>
                <div className="review-head">
                  {good ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  <strong>{q.prompt}</strong>
                </div>
                <p className="small">
                  Votre réponse :{" "}
                  {answers[i] === null || answers[i] === undefined
                    ? "aucune"
                    : q.options[answers[i]!]}
                  {!good && (
                    <>
                      {" "}
                      · Bonne réponse :{" "}
                      <strong>{q.options[q.answer_index]}</strong>
                    </>
                  )}
                </p>
                {q.explanation && (
                  <p className="small muted">{q.explanation}</p>
                )}
              </li>
            );
          })}
        </ol>
      </>
    );
  }
  const answered = answers.filter((a) => a !== null).length;
  return (
    <>
      <div className="exam-bar">
        <strong>{exam.title}</strong>
        <span className={`timer ${remaining < 60 ? "danger" : ""}`}>
          <Clock size={16} /> {mm}:{ss}
        </span>
        <span className="muted small">
          {answered} / {questions.length} répondues
        </span>
      </div>
      <ol className="question-list">
        {questions.map((q, i) => (
          <li key={q.id} className="question-card">
            <strong>
              {i + 1}. {q.prompt}
            </strong>
            <div className="options">
              {q.options.map((o, j) => (
                <label
                  key={j}
                  className={`option ${answers[i] === j ? "on" : ""}`}
                >
                  <input
                    type="radio"
                    name={"q" + q.id}
                    checked={answers[i] === j}
                    onChange={() =>
                      setAnswers(answers.map((a, k) => (k === i ? j : a)))
                    }
                  />
                  {o}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="discussion-actions">
        <button className="button primary" disabled={busy} onClick={submit}>
          Remettre l’examen <ArrowRight size={17} />
        </button>
        <button className="text-button" onClick={() => setStarted(null)}>
          Abandonner
        </button>
      </div>
    </>
  );
}
