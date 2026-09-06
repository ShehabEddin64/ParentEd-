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
  Star,
  Video,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Props } from "../App";
import {
  bookingStatusLabels,
  formatDate,
  localDate,
  optional,
  required,
  shiftDate,
  slotsFor,
  tutorKindLabels,
  weekdayNames,
  averageRating,
  type Booking,
  type Tutor,
  type Slot,
} from "../domain";
import { Empty, External, PageTitle } from "./ui";
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
function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(value) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
function Reviews({
  data,
  tutorId,
  limit = 2,
}: {
  data: Props["data"];
  tutorId: string;
  limit?: number;
}) {
  const reviews = data.tutor_reviews
    .filter((r) => r.tutor_id === tutorId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const avg = averageRating(reviews);
  if (!avg)
    return <small className="muted">Pas encore d’avis de familles.</small>;
  return (
    <div className="reviews">
      <div className="review-summary">
        <Stars value={avg} />
        <strong>{avg}</strong>
        <small className="muted">
          · {reviews.length} avis de famille{reviews.length > 1 ? "s" : ""}
        </small>
      </div>
      {reviews.slice(0, limit).map((r) => (
        <blockquote key={r.id}>
          <Stars value={r.rating} size={11} /> <span>{r.body}</span>
          <small className="muted"> — {r.author}</small>
        </blockquote>
      ))}
    </div>
  );
}
/** Two-week slot calendar: pick a concrete free slot. */
function SlotPicker({
  tutor,
  data,
  from,
  value,
  onChange,
}: {
  tutor: Tutor;
  data: Props["data"];
  from: string;
  value: Slot | null;
  onChange: (s: Slot) => void;
}) {
  const [start, setStart] = useState(from);
  const slots = slotsFor(
    tutor,
    data.tutor_availability,
    data.bookings,
    start,
    14,
  );
  const days = [...new Set(slots.map((s) => s.date))];
  return (
    <div className="slot-picker">
      <div className="calendar-toolbar">
        <strong>
          {formatDate(start, { day: "numeric", month: "long" })} →{" "}
          {formatDate(shiftDate(start, 13), { day: "numeric", month: "long" })}
        </strong>
        <div className="calendar-controls">
          <button
            type="button"
            className="icon-button"
            aria-label="Deux semaines avant"
            onClick={() => setStart(shiftDate(start, -14))}
            disabled={start <= from}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Deux semaines après"
            onClick={() => setStart(shiftDate(start, 14))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      {!days.length ? (
        <p className="small muted">
          Aucun créneau sur ces deux semaines. Essayez les semaines suivantes.
        </p>
      ) : (
        <div className="slot-days">
          {days.map((d) => (
            <div className="slot-day" key={d}>
              <header>
                <span>{formatDate(d, { weekday: "short" })}</span>
                <strong>{Number(d.slice(-2))}</strong>
                <small>{formatDate(d, { month: "short" })}</small>
              </header>
              {slots
                .filter((s) => s.date === d)
                .map((s) => (
                  <button
                    type="button"
                    key={s.time}
                    disabled={s.taken}
                    className={`slot ${value?.date === s.date && value?.time === s.time ? "selected" : ""}`}
                    onClick={() => onChange(s)}
                    aria-pressed={
                      value?.date === s.date && value?.time === s.time
                    }
                  >
                    {s.time}
                    {s.taken && <small>pris</small>}
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
      <small className="muted">
        Créneaux de {tutor.slot_minutes} minutes, calculés à partir des
        disponibilités annoncées et des réservations existantes.
      </small>
    </div>
  );
}
function FamilySpace({ data, profile, api, run, busy }: Props) {
  const today = api.mode === "demo" ? "2026-09-07" : localDate();
  const [kind, setKind] = useState<"tous" | Tutor["kind"]>("tous");
  const [subject, setSubject] = useState("Toutes");
  const [booking, setBooking] = useState<Tutor | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [cancelId, setCancelId] = useState("");
  const [reviewId, setReviewId] = useState("");
  const [emailed, setEmailed] = useState<Record<string, boolean>>({});
  const published = data.tutors.filter((t) => t.published);
  const tutors = published.filter(
    (t) =>
      (kind === "tous" || t.kind === kind) &&
      (subject === "Toutes" || t.subjects.includes(subject)),
  );
  const subjects = [
    "Toutes",
    ...new Set(
      published
        .filter((t) => kind === "tous" || t.kind === kind)
        .flatMap((t) => t.subjects),
    ),
  ];
  const bookings = data.bookings
    .filter((b) => b.family_id === profile.family_id)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!booking) return;
    const f = new FormData(e.currentTarget);
    if (!slot) {
      await run(async () => {
        throw new Error("Choisissez un créneau dans le calendrier.");
      });
      return;
    }
    const id = crypto.randomUUID();
    const ok = await run(
      () =>
        api.save("bookings", {
          id,
          tutor_id: booking.id,
          family_id: profile.family_id,
          user_id: profile.id,
          child: required(String(f.get("child")), 80),
          subject: required(String(f.get("subject")), 80),
          date: slot.date,
          time: slot.time,
          weekly: f.has("weekly"),
          status: "confirmée",
          note: optional(String(f.get("note")), 2000),
          created_at: new Date().toISOString(),
        }),
      `Rendez-vous confirmé le ${formatDate(slot.date)} à ${slot.time}.`,
    );
    if (ok) {
      setBooking(null);
      setSlot(null);
      const sent = await api.sendBookingEmail(id);
      setEmailed((m) => ({ ...m, [id]: sent }));
    }
  };
  const submitReview = async (e: FormEvent<HTMLFormElement>, b: Booking) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      await run(
        () =>
          api.save("tutor_reviews", {
            id: crypto.randomUUID(),
            tutor_id: b.tutor_id,
            booking_id: b.id,
            user_id: profile.id,
            author: profile.display_name,
            rating: Number(f.get("rating")),
            body: optional(String(f.get("body")), 2000),
            created_at: new Date().toISOString(),
          }),
        "Merci pour votre avis ! Il aide les autres familles.",
      )
    )
      setReviewId("");
  };
  return (
    <>
      <PageTitle
        eyebrow="UN COUP DE MAIN, QUAND C’EST UTILE"
        title="Rendez-vous et tutorat."
        description="Réservez un créneau réel avec un tuteur, un conseiller aux démarches ou un coach parental. Le parent reste l’enseignant principal."
      />
      <div className="privacy-banner">
        <Info size={23} />
        <p>
          Les tuteurs et coachs partenaires sont indépendants et facturent
          directement les familles; les rencontres avec un conseiller sont
          comprises dans l’accompagnement. ParentEd vérifie les qualifications
          annoncées, gère l’agenda et recueille les comptes rendus. Un compte
          rendu est une observation pédagogique, pas une évaluation officielle.
        </p>
      </div>
      {booking && (
        <form className="editor form-grid" onSubmit={submit} key={booking.id}>
          <div className="section-heading span-2">
            <h2>
              Réserver avec {booking.display_name} ·{" "}
              {tutorKindLabels[booking.kind]}
            </h2>
            <button
              type="button"
              className="text-button"
              onClick={() => setBooking(null)}
            >
              Annuler
            </button>
          </div>
          <label>
            {booking.kind === "tuteur" ? "Enfant" : "Pour qui ?"}
            <input
              name="child"
              list="children-booking"
              required
              maxLength={80}
              defaultValue={
                booking.kind === "tuteur"
                  ? (data.children[0]?.name ?? "")
                  : profile.display_name
              }
            />
            <datalist id="children-booking">
              {data.children.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
              <option value={profile.display_name} />
            </datalist>
          </label>
          <label>
            Sujet
            <select name="subject" defaultValue={booking.subjects[0]}>
              {booking.subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="span-2">
            <span className="eyebrow">CHOISIR UN CRÉNEAU</span>
            <SlotPicker
              tutor={booking}
              data={data}
              from={shiftDate(today, 1)}
              value={slot}
              onChange={setSlot}
            />
          </div>
          {booking.kind === "tuteur" && (
            <label className="checkbox-label span-2">
              <input type="checkbox" name="weekly" />
              <Repeat size={16} /> Rendez-vous hebdomadaire, même jour et même
              heure
            </label>
          )}
          <label className="span-2">
            Ce qui aiderait à préparer (facultatif)
            <textarea
              name="note"
              maxLength={2000}
              placeholder="Où l’enfant bloque, ce qu’il aime, votre question… Évitez les renseignements sensibles."
            />
          </label>
          <p className="span-2 small muted">
            {slot ? (
              <>
                Créneau choisi :{" "}
                <strong>
                  {formatDate(slot.date)} à {slot.time}
                </strong>
                . La réservation est confirmée immédiatement
                {api.mode === "supabase"
                  ? " et un courriel de confirmation est envoyé si le service de courriel est configuré."
                  : "."}
              </>
            ) : (
              "Sélectionnez un créneau libre ci-dessus."
            )}
          </p>
          <button className="button primary" disabled={busy || !slot}>
            Confirmer le rendez-vous <ArrowRight size={17} />
          </button>
        </form>
      )}
      <div className="section-heading">
        <h2>Mes rendez-vous</h2>
      </div>
      {!bookings.length ? (
        <Empty>
          Aucun rendez-vous pour l’instant. Choisissez une personne ci-dessous.
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
                  {tutor && (
                    <span className="pill">
                      {tutorKindLabels[tutor.kind].toUpperCase()}
                    </span>
                  )}
                  {b.weekly && (
                    <span className="pill">
                      <Repeat size={11} /> HEBDOMADAIRE
                    </span>
                  )}
                  {emailed[b.id] && (
                    <span className="pill featured">
                      <Mail size={11} /> COURRIEL ENVOYÉ
                    </span>
                  )}
                </div>
                <h3>
                  {b.subject} avec {tutor?.display_name ?? "un intervenant"}
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
                  {tutor && ` · ${tutor.slot_minutes} min`}
                  {b.weekly && " · puis chaque semaine"}
                </p>
                {b.status === "confirmée" && tutor?.meeting_url && (
                  <External url={tutor.meeting_url}>
                    <Video size={15} /> Lien de la rencontre en ligne
                  </External>
                )}
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
                {b.status === "terminée" &&
                  !data.tutor_reviews.some((r) => r.booking_id === b.id) &&
                  (reviewId === b.id ? (
                    <form
                      className="review-form"
                      onSubmit={(e) => submitReview(e, b)}
                    >
                      <label>
                        Votre note
                        <select name="rating" defaultValue="5">
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} / 5
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Un mot pour les autres familles (facultatif)
                        <textarea
                          name="body"
                          maxLength={2000}
                          placeholder="Ce qui a aidé votre enfant, le style du tuteur…"
                        />
                      </label>
                      <div className="discussion-actions">
                        <button className="button primary" disabled={busy}>
                          Publier mon avis
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setReviewId("")}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => setReviewId(b.id)}
                    >
                      <Star size={15} /> Laisser un avis
                    </button>
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
                              "Rendez-vous annulé.",
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
                        Garder le rendez-vous
                      </button>
                    </div>
                  ) : (
                    <button
                      className="text-button danger"
                      onClick={() => setCancelId(b.id)}
                    >
                      <XCircle size={15} /> Annuler{" "}
                      {b.weekly ? "la série" : "le rendez-vous"}
                    </button>
                  ))}
              </article>
            );
          })}
        </div>
      )}
      <div className="section-heading">
        <h2>Prendre rendez-vous</h2>
      </div>
      <div className="filter-bar">
        <div className="tabs" aria-label="Type d’intervenant">
          {(["tous", "tuteur", "conseiller", "coach"] as const).map((k) => (
            <button
              key={k}
              className={kind === k ? "active" : ""}
              onClick={() => {
                setKind(k);
                setSubject("Toutes");
              }}
            >
              {k === "tous" ? "Tous" : tutorKindLabels[k] + "s"}
            </button>
          ))}
        </div>
        <select
          aria-label="Sujet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {!tutors.length && <Empty>Personne pour ce filtre pour le moment.</Empty>}
      <div className="tutor-grid">
        {tutors.map((t) => {
          const free = slotsFor(
            t,
            data.tutor_availability,
            data.bookings,
            shiftDate(today, 1),
            14,
          ).filter((s) => !s.taken);
          return (
            <article className="tutor-card" key={t.id}>
              <div className="tutor-head">
                <span className="avatar">{t.display_name[0]}</span>
                <div>
                  <h3>{t.display_name}</h3>
                  <small>
                    {tutorKindLabels[t.kind]} · {t.subjects.join(" · ")}
                  </small>
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
                  {t.meeting_url && (
                    <>
                      {" "}
                      · <Video size={14} /> en ligne
                    </>
                  )}
                </li>
                {t.rate_hint && (
                  <li>
                    <Info size={16} />
                    {t.rate_hint}
                  </li>
                )}
              </ul>
              <Availability tutor={t} data={data} />
              <small className="muted">
                {free.length
                  ? `${free.length} créneau${free.length > 1 ? "x" : ""} libre${free.length > 1 ? "s" : ""} sur 14 jours`
                  : "Complet sur 14 jours"}{" "}
                · {t.slot_minutes} min
              </small>
              <Reviews data={data} tutorId={t.id} />
              <button
                className="button primary"
                onClick={() => {
                  setBooking(t);
                  setSlot(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={busy}
              >
                <CalendarDays size={17} />
                Choisir un créneau
              </button>
            </article>
          );
        })}
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
      `Rendez-vous ${bookingStatusLabels[status].toLowerCase()}.`,
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
    const meeting = optional(String(f.get("meeting_url")), 300);
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
            slot_minutes: Number(
              f.get("slot_minutes"),
            ) as Tutor["slot_minutes"],
            meeting_url: meeting || null,
            contact_email:
              optional(String(f.get("contact_email")), 200) || null,
          }),
        "Profil mis à jour.",
      )
    )
      setEdit(false);
  };
  return (
    <>
      <PageTitle
        eyebrow={`ESPACE ${tutorKindLabels[tutor.kind].toUpperCase()}`}
        title={`Vos rendez-vous, ${tutor.display_name}.`}
        description="Les familles réservent directement vos créneaux libres. Tenez vos rendez-vous, clôturez-les et transmettez un compte rendu."
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
            Durée d’un créneau
            <select
              name="slot_minutes"
              defaultValue={String(tutor.slot_minutes)}
            >
              {[30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </label>
          <label>
            Lien de rencontre en ligne (HTTPS)
            <input
              name="meeting_url"
              type="url"
              defaultValue={tutor.meeting_url ?? ""}
              placeholder="https://meet…"
            />
          </label>
          <label>
            Courriel pour les confirmations
            <input
              name="contact_email"
              type="email"
              defaultValue={tutor.contact_email ?? ""}
            />
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
            Les matières, les disponibilités et la publication sont gérées avec
            l’équipe ParentEd.
          </p>
          <button className="button primary" disabled={busy}>
            Enregistrer
          </button>
        </form>
      )}
      <section className="editor">
        <h2>Mes disponibilités</h2>
        <Availability tutor={tutor} data={data} />
        <h2>Avis des familles</h2>
        <Reviews data={data} tutorId={tutor.id} limit={10} />
      </section>
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
            Observations et pistes pour la maison
            <textarea
              name="body"
              required
              maxLength={5000}
              placeholder="Ce qui a été réussi, ce qui reste fragile, une idée à essayer en famille."
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
      {!bookings.length && <Empty>Aucun rendez-vous pour le moment.</Empty>}
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
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() => setStatus(b, "confirmée")}
                  >
                    <CheckCircle2 size={16} /> Confirmer
                  </button>
                )}
                {["demandée", "confirmée"].includes(b.status) && (
                  <>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() => setStatus(b, "terminée")}
                    >
                      Marquer terminé
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
