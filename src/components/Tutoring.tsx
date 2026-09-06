import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  Repeat,
  CheckCircle2,
  XCircle,
  NotebookPen,
  Info,
} from "lucide-react";
import type { Props } from "../App";
import {
  bookingStatusLabels,
  formatDate,
  localDate,
  optional,
  required,
  weekday,
  weekdayNames,
  type Booking,
  type Tutor,
} from "../domain";
import { Empty, PageTitle } from "./ui";
export function Tutoring(props: Props) {
  const { data, profile } = props;
  const mine = data.tutors.find((t) => t.profile_id === profile.id);
  if (mine) return <TutorSpace {...props} tutor={mine} />;
  return <FamilySpace {...props} />;
}
function Availability({ tutor, data }: { tutor: Tutor; data: Props["data"] }) {
  const slots = data.tutor_availability
    .filter((a) => a.tutor_id === tutor.id)
    .sort(
      (a, b) =>
        a.weekday - b.weekday || a.start_time.localeCompare(b.start_time),
    );
  if (!slots.length)
    return (
      <small className="muted">Disponibilités à confirmer avec l’équipe.</small>
    );
  return (
    <ul className="slots">
      {slots.map((s) => (
        <li key={s.id}>
          <Clock size={14} />
          {weekdayNames[s.weekday]} {s.start_time}–{s.end_time}
        </li>
      ))}
    </ul>
  );
}
function FamilySpace({ data, profile, api, run, busy }: Props) {
  const [subject, setSubject] = useState("Toutes");
  const [booking, setBooking] = useState<Tutor | null>(null);
  const [cancelId, setCancelId] = useState("");
  const tutors = data.tutors.filter(
    (t) =>
      t.published && (subject === "Toutes" || t.subjects.includes(subject)),
  );
  const subjects = [
    "Toutes",
    ...new Set(
      data.tutors.filter((t) => t.published).flatMap((t) => t.subjects),
    ),
  ];
  const bookings = data.bookings
    .filter((b) => b.family_id === profile.family_id)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!booking) return;
    const f = new FormData(e.currentTarget);
    const date = String(f.get("date"));
    const day = weekday(date);
    const slots = data.tutor_availability.filter(
      (a) => a.tutor_id === booking.id,
    );
    if (slots.length && !slots.some((s) => s.weekday === day)) {
      await run(async () => {
        throw new Error(
          `${booking.display_name} n’indique pas de disponibilité le ${weekdayNames[day].toLowerCase()}. Choisissez un autre jour.`,
        );
      });
      return;
    }
    if (
      await run(
        () =>
          api.save("bookings", {
            id: crypto.randomUUID(),
            tutor_id: booking.id,
            family_id: profile.family_id,
            user_id: profile.id,
            child: required(String(f.get("child")), 80),
            subject: required(String(f.get("subject")), 80),
            date,
            time: String(f.get("time")),
            weekly: f.has("weekly"),
            status: "demandée",
            note: optional(String(f.get("note")), 2000),
            created_at: new Date().toISOString(),
          }),
        "Demande envoyée. Le tuteur ou la tutrice confirmera le rendez-vous.",
      )
    )
      setBooking(null);
  };
  return (
    <>
      <PageTitle
        eyebrow="UN COUP DE MAIN, QUAND C’EST UTILE"
        title="Tutorat complémentaire."
        description="Un soutien ponctuel ou hebdomadaire dans certaines matières, comme l’aide extérieure d’un élève scolarisé. Le parent reste l’enseignant principal."
      />
      <div className="privacy-banner">
        <Info size={23} />
        <p>
          Les tuteurs partenaires sont indépendants et facturent directement les
          familles. ParentEd vérifie les qualifications annoncées, facilite la
          réservation et recueille les comptes rendus. Un compte rendu est une
          observation pédagogique, pas une évaluation officielle.
        </p>
      </div>
      {booking && (
        <form className="editor form-grid" onSubmit={submit} key={booking.id}>
          <div className="section-heading span-2">
            <h2>Demander une séance avec {booking.display_name}</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => setBooking(null)}
            >
              Annuler
            </button>
          </div>
          <label>
            Enfant
            <input
              name="child"
              list="children-booking"
              required
              maxLength={80}
              defaultValue={data.children[0]?.name ?? ""}
            />
            <datalist id="children-booking">
              {data.children.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </label>
          <label>
            Matière
            <select name="subject" defaultValue={booking.subjects[0]}>
              {booking.subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Date de la première séance
            <input
              name="date"
              type="date"
              required
              defaultValue={api.mode === "demo" ? "2026-09-10" : localDate()}
            />
          </label>
          <label>
            Heure
            <input
              name="time"
              type="time"
              required
              defaultValue={
                data.tutor_availability.find((a) => a.tutor_id === booking.id)
                  ?.start_time ?? "10:00"
              }
            />
          </label>
          <label className="checkbox-label span-2">
            <input type="checkbox" name="weekly" />
            <Repeat size={16} /> Rendez-vous hebdomadaire, même jour et même
            heure
          </label>
          <label className="span-2">
            Ce qui aiderait le tuteur à préparer (facultatif)
            <textarea
              name="note"
              maxLength={2000}
              placeholder="Où l’enfant bloque, ce qu’il aime… Évitez les renseignements sensibles."
            />
          </label>
          <div className="span-2 small muted">
            Disponibilités annoncées :{" "}
            <Availability tutor={booking} data={data} />
          </div>
          <button className="button primary" disabled={busy}>
            Envoyer la demande <ArrowRight size={17} />
          </button>
        </form>
      )}
      <div className="section-heading">
        <h2>Mes séances</h2>
      </div>
      {!bookings.length ? (
        <Empty>
          Aucune séance demandée pour l’instant. Choisissez un tuteur
          ci-dessous.
        </Empty>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => {
            const tutor = data.tutors.find((t) => t.id === b.tutor_id);
            const reports = data.tutor_reports.filter(
              (r) => r.booking_id === b.id,
            );
            return (
              <article className={`booking status-${b.status}`} key={b.id}>
                <div className="booking-head">
                  <span className="pill">{bookingStatusLabels[b.status]}</span>
                  {b.weekly && (
                    <span className="pill">
                      <Repeat size={11} /> HEBDOMADAIRE
                    </span>
                  )}
                </div>
                <h3>
                  {b.subject} avec {tutor?.display_name ?? "un tuteur"}
                </h3>
                <p className="small muted">
                  {b.child} ·{" "}
                  {formatDate(b.date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {b.time}
                  {b.weekly && " · puis chaque semaine"}
                </p>
                {b.note && <p className="small">{b.note}</p>}
                {reports.map((r) => (
                  <div className="answer" key={r.id}>
                    <span className="pill">COMPTE RENDU PÉDAGOGIQUE</span>
                    <p className="preserve-lines">{r.body}</p>
                    <small className="muted">
                      {new Date(r.created_at).toLocaleDateString("fr-CA")} ·
                      Observation, sans valeur d’évaluation officielle.
                    </small>
                  </div>
                ))}
                {["demandée", "confirmée"].includes(b.status) &&
                  (cancelId === b.id ? (
                    <div className="discussion-actions">
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={async () => {
                          if (
                            await run(
                              () =>
                                api.save("bookings", {
                                  ...b,
                                  status: "annulée",
                                }),
                              "Séance annulée.",
                            )
                          )
                            setCancelId("");
                        }}
                      >
                        Confirmer l’annulation
                      </button>
                      <button
                        className="text-button"
                        onClick={() => setCancelId("")}
                      >
                        Garder la séance
                      </button>
                    </div>
                  ) : (
                    <button
                      className="text-button danger"
                      onClick={() => setCancelId(b.id)}
                    >
                      <XCircle size={15} /> Annuler{" "}
                      {b.weekly ? "la série" : "la séance"}
                    </button>
                  ))}
              </article>
            );
          })}
        </div>
      )}
      <div className="section-heading">
        <h2>Tuteurs partenaires</h2>
      </div>
      <div className="tabs" aria-label="Filtrer par matière">
        {subjects.map((s) => (
          <button
            key={s}
            className={subject === s ? "active" : ""}
            onClick={() => setSubject(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {!tutors.length && (
        <Empty>Aucun tuteur pour cette matière pour le moment.</Empty>
      )}
      <div className="tutor-grid">
        {tutors.map((t) => (
          <article className="tutor-card" key={t.id}>
            <div className="tutor-head">
              <span className="avatar">{t.display_name[0]}</span>
              <div>
                <h3>{t.display_name}</h3>
                <small>{t.subjects.join(" · ")}</small>
              </div>
            </div>
            <p>{t.bio}</p>
            <ul className="event-facts">
              <li>
                <GraduationCap size={16} />
                {t.qualifications}
              </li>
              <li>
                <MapPin size={16} />
                {t.region || "Région à préciser"} · {t.mode}
              </li>
              {t.rate_hint && (
                <li>
                  <Info size={16} />
                  {t.rate_hint}
                </li>
              )}
            </ul>
            <Availability tutor={t} data={data} />
            <button
              className="button primary"
              onClick={() => setBooking(t)}
              disabled={busy}
            >
              <CalendarDays size={17} />
              Demander une séance
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
function TutorSpace({ data, api, run, busy, tutor }: Props & { tutor: Tutor }) {
  const [report, setReport] = useState<Booking | null>(null);
  const [edit, setEdit] = useState(false);
  const bookings = data.bookings
    .filter((b) => b.tutor_id === tutor.id)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const setStatus = (b: Booking, status: Booking["status"]) =>
    run(
      () => api.save("bookings", { ...b, status }),
      `Séance ${bookingStatusLabels[status].toLowerCase()}.`,
    );
  const saveReport = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!report) return;
    const f = new FormData(e.currentTarget);
    if (
      await run(
        () =>
          api.save("tutor_reports", {
            id: crypto.randomUUID(),
            booking_id: report.id,
            tutor_id: tutor.id,
            body: required(String(f.get("body"))),
            created_at: new Date().toISOString(),
          }),
        "Compte rendu transmis à la famille.",
      )
    )
      setReport(null);
  };
  const saveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      await run(
        () =>
          api.save("tutors", {
            ...tutor,
            display_name: required(String(f.get("display_name")), 80),
            bio: optional(String(f.get("bio")), 2000),
            qualifications: optional(String(f.get("qualifications")), 1000),
            rate_hint: optional(String(f.get("rate_hint")), 200),
            region: optional(String(f.get("region")), 120),
            mode: String(f.get("mode")) as Tutor["mode"],
          }),
        "Profil de tuteur mis à jour.",
      )
    )
      setEdit(false);
  };
  return (
    <>
      <PageTitle
        eyebrow="ESPACE TUTEUR"
        title={`Vos séances, ${tutor.display_name}.`}
        description="Confirmez les demandes, tenez vos rendez-vous hebdomadaires et transmettez un compte rendu pédagogique aux familles."
        action={
          <button className="button secondary" onClick={() => setEdit(!edit)}>
            {edit ? "Fermer" : "Mon profil"}
          </button>
        }
      />
      {!tutor.published && (
        <div className="privacy-banner">
          <Info size={23} />
          <p>
            Votre profil n’est pas encore publié : l’équipe le rendra visible
            après vérification.
          </p>
        </div>
      )}
      {edit && (
        <form className="editor form-grid" onSubmit={saveProfile}>
          <label>
            Nom affiché
            <input
              name="display_name"
              defaultValue={tutor.display_name}
              required
              maxLength={80}
            />
          </label>
          <label>
            Région
            <input name="region" defaultValue={tutor.region} maxLength={120} />
          </label>
          <label>
            Mode
            <select name="mode" defaultValue={tutor.mode}>
              <option>en ligne</option>
              <option>en personne</option>
              <option>les deux</option>
            </select>
          </label>
          <label>
            Tarif indicatif (facturé par vous)
            <input
              name="rate_hint"
              defaultValue={tutor.rate_hint}
              maxLength={200}
            />
          </label>
          <label className="span-2">
            Qualifications et références
            <textarea
              name="qualifications"
              defaultValue={tutor.qualifications}
              maxLength={1000}
            />
          </label>
          <label className="span-2">
            Présentation
            <textarea name="bio" defaultValue={tutor.bio} maxLength={2000} />
          </label>
          <p className="span-2 small muted">
            Les matières et la publication sont gérées par l’équipe ParentEd.
          </p>
          <button className="button primary" disabled={busy}>
            Enregistrer
          </button>
        </form>
      )}
      {report && (
        <form className="editor" onSubmit={saveReport} key={report.id}>
          <div className="section-heading">
            <h2>
              Compte rendu · {report.subject} · {report.child} ·{" "}
              {formatDate(report.date)}
            </h2>
            <button
              type="button"
              className="text-button"
              onClick={() => setReport(null)}
            >
              Annuler
            </button>
          </div>
          <label>
            Observations pédagogiques et pistes pour la maison
            <textarea
              name="body"
              required
              maxLength={5000}
              placeholder="Ce que l’enfant a réussi, ce qui reste fragile, une idée à essayer en famille."
            />
          </label>
          <p className="small muted">
            Restez factuel et bienveillant. Ce compte rendu est visible par la
            famille et l’équipe; il n’a pas valeur d’évaluation officielle.
          </p>
          <div className="form-actions">
            <button className="button primary" disabled={busy}>
              Transmettre
            </button>
          </div>
        </form>
      )}
      {!bookings.length && <Empty>Aucune demande pour le moment.</Empty>}
      <div className="booking-list">
        {bookings.map((b) => {
          const reports = data.tutor_reports.filter(
            (r) => r.booking_id === b.id,
          );
          return (
            <article className={`booking status-${b.status}`} key={b.id}>
              <div className="booking-head">
                <span className="pill">{bookingStatusLabels[b.status]}</span>
                {b.weekly && (
                  <span className="pill">
                    <Repeat size={11} /> HEBDOMADAIRE
                  </span>
                )}
              </div>
              <h3>
                {b.subject} · {b.child}
              </h3>
              <p className="small muted">
                {formatDate(b.date, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {b.time}
              </p>
              {b.note && <p className="small">Note du parent : {b.note}</p>}
              {reports.map((r) => (
                <div className="answer" key={r.id}>
                  <span className="pill">COMPTE RENDU</span>
                  <p className="preserve-lines">{r.body}</p>
                </div>
              ))}
              <div className="discussion-actions">
                {b.status === "demandée" && (
                  <>
                    <button
                      className="button primary"
                      disabled={busy}
                      onClick={() => setStatus(b, "confirmée")}
                    >
                      <CheckCircle2 size={16} /> Confirmer
                    </button>
                    <button
                      className="text-button danger"
                      disabled={busy}
                      onClick={() => setStatus(b, "annulée")}
                    >
                      Refuser
                    </button>
                  </>
                )}
                {b.status === "confirmée" && (
                  <>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() => setStatus(b, "terminée")}
                    >
                      Marquer terminée
                    </button>
                    <button
                      className="text-button danger"
                      disabled={busy}
                      onClick={() => setStatus(b, "annulée")}
                    >
                      Annuler
                    </button>
                  </>
                )}
                {["confirmée", "terminée"].includes(b.status) && (
                  <button className="text-button" onClick={() => setReport(b)}>
                    <NotebookPen size={15} /> Rédiger un compte rendu
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
