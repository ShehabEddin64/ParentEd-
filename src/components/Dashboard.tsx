import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Eye,
  EyeOff,
  GraduationCap,
  MapPin,
  MessageSquare,
  NotebookPen,
  Plus,
  RotateCcw,
  Send,
  Settings2,
  Snowflake,
  Sparkles,
  Sun,
  Users,
  Video,
} from "lucide-react";
import type { Props } from "../App";
import {
  bookingStatusLabels,
  completion,
  formatDate,
  localDate,
  occurrences,
  percent,
  shiftDate,
  timeAgo,
  weekDates,
  type Booking,
  type Data,
} from "../domain";
import { photoFor } from "../images";
import {
  forecast,
  weatherKind,
  weatherLabel,
  type Forecast,
  type WeatherKind,
} from "../weather";
import { Empty, External, PageTitle } from "./ui";
type WidgetId =
  | "rdv"
  | "agenda"
  | "meteo"
  | "enfants"
  | "activite"
  | "cours"
  | "rencontre"
  | "communaute"
  | "portfolio"
  | "raccourcis";
type Size = "sm" | "md" | "lg";
type Widget = {
  id: WidgetId;
  title: string;
  size: Size;
  parentsOnly?: boolean;
};
const registry: Widget[] = [
  { id: "rdv", title: "Prochain rendez-vous", size: "md" },
  { id: "meteo", title: "Météo", size: "sm" },
  { id: "raccourcis", title: "Raccourcis", size: "sm" },
  { id: "agenda", title: "Ma semaine", size: "lg" },
  {
    id: "enfants",
    title: "Progrès des enfants",
    size: "lg",
    parentsOnly: true,
  },
  {
    id: "activite",
    title: "Programme par matière",
    size: "md",
    parentsOnly: true,
  },
  { id: "cours", title: "Cours en cours", size: "sm", parentsOnly: true },
  { id: "rencontre", title: "Prochaine rencontre", size: "sm" },
  { id: "communaute", title: "Communauté", size: "md" },
  { id: "portfolio", title: "Portfolio", size: "md", parentsOnly: true },
];
type Layout = { order: WidgetId[]; hidden: WidgetId[] };
function loadLayout(userId: string): Layout {
  try {
    const raw = localStorage.getItem("parented-dashboard:" + userId);
    if (raw) {
      const l = JSON.parse(raw) as Layout;
      const known = registry.map((w) => w.id);
      const order = [
        ...l.order.filter((id) => known.includes(id)),
        ...known.filter((id) => !l.order.includes(id)),
      ];
      return { order, hidden: l.hidden.filter((id) => known.includes(id)) };
    }
  } catch {
    /* ignore */
  }
  return { order: registry.map((w) => w.id), hidden: [] };
}
function saveLayout(userId: string, layout: Layout) {
  try {
    localStorage.setItem(
      "parented-dashboard:" + userId,
      JSON.stringify(layout),
    );
  } catch {
    /* ignore */
  }
}
/** Animated count from 0 to the value, respecting reduced motion. */
function useCountUp(value: number, ms = 700) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      setN(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return n;
}
export function Ring({
  value,
  size = 64,
  stroke = 7,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 50);
    return () => clearTimeout(t);
  }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-track"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-value"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, v)) / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-label">{label ?? `${Math.round(value)} %`}</span>
    </span>
  );
}
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 120;
  const h = 32;
  const xs = (i: number) => (i * (w - 6)) / (values.length - 1) + 3;
  const ys = (v: number) => h - 3 - ((h - 6) * v) / 100;
  const d = values
    .map((v, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`)
    .join(" ");
  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden="true"
    >
      <path d={d} />
      <circle
        cx={xs(values.length - 1)}
        cy={ys(values[values.length - 1])}
        r={3}
      />
    </svg>
  );
}
const weatherIcon: Record<WeatherKind, ReactNode> = {
  sun: <Sun size={34} />,
  cloudsun: <CloudSun size={34} />,
  cloud: <Cloud size={34} />,
  fog: <CloudFog size={34} />,
  rain: <CloudRain size={34} />,
  snow: <Snowflake size={34} />,
  storm: <CloudLightning size={34} />,
};
function daysUntil(date: string, time: string, now: Date) {
  const target = new Date(date + "T" + time + ":00");
  const ms = target.getTime() - now.getTime();
  if (ms < 0) return "en cours";
  const hours = Math.round(ms / 3600000);
  if (hours < 1) return "dans quelques minutes";
  if (hours < 24) return `dans ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "demain" : `dans ${days} jours`;
}
export function Dashboard(props: Props) {
  const { data, profile, api } = props;
  if (profile.role === "admin") return <AdminDashboard {...props} />;
  const today = api.mode === "demo" ? "2026-09-07" : localDate();
  const myTutor = data.tutors.find((t) => t.profile_id === profile.id);
  const [layout, setLayout] = useState(() => loadLayout(profile.id));
  const [customize, setCustomize] = useState(false);
  const update = (l: Layout) => {
    setLayout(l);
    saveLayout(profile.id, l);
  };
  const available = registry.filter((w) => !(w.parentsOnly && myTutor));
  const visible = layout.order
    .map((id) => available.find((w) => w.id === id))
    .filter((w): w is Widget => Boolean(w) && !layout.hidden.includes(w!.id));
  const children = data.children.length
    ? data.children.map((c) => c.name)
    : [
        ...new Set([
          ...data.tasks.map((t) => t.child),
          ...data.grades.map((g) => g.child),
        ]),
      ].filter((n) => n && n !== "Toute la famille");
  const firstName = profile.display_name.split(" ")[0];
  const move = (id: WidgetId, dir: -1 | 1) => {
    const order = [...layout.order];
    const i = order.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    update({ ...layout, order });
  };
  const toggle = (id: WidgetId) =>
    update({
      ...layout,
      hidden: layout.hidden.includes(id)
        ? layout.hidden.filter((x) => x !== id)
        : [...layout.hidden, id],
    });
  const ctx = { ...props, today, children, myTutor };
  const render: Record<WidgetId, () => ReactNode> = {
    rdv: () => <NextBooking {...ctx} />,
    agenda: () => <Agenda {...ctx} />,
    meteo: () => <Weather {...ctx} />,
    enfants: () => <ChildrenProgress {...ctx} />,
    activite: () => <SubjectBars {...ctx} />,
    cours: () => <CourseWidget {...ctx} />,
    rencontre: () => <NextEvent {...ctx} />,
    communaute: () => <CommunityWidget {...ctx} />,
    portfolio: () => <PortfolioWidget {...ctx} />,
    raccourcis: () => <Shortcuts {...ctx} />,
  };
  return (
    <>
      <PageTitle
        eyebrow={formatDate(today, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        title={`Bonjour ${firstName}.`}
        description={
          myTutor
            ? "Vos rendez-vous de la semaine et la vie de la communauté."
            : children.length
              ? `Voici où en ${children.length > 1 ? "sont" : "est"} ${children.join(" et ")} cette semaine.`
              : "Un espace pour apprendre, s’organiser et avancer ensemble."
        }
        action={
          <button
            className={`button ${customize ? "primary" : "secondary"}`}
            onClick={() => setCustomize(!customize)}
          >
            <Settings2 size={16} /> {customize ? "Terminer" : "Personnaliser"}
          </button>
        }
      />
      {customize && (
        <section className="customize rise">
          <div className="section-heading">
            <h2>Vos widgets</h2>
            <button
              className="text-button"
              onClick={() =>
                update({ order: registry.map((w) => w.id), hidden: [] })
              }
            >
              <RotateCcw size={14} /> Réinitialiser
            </button>
          </div>
          <ul>
            {layout.order
              .map((id) => available.find((w) => w.id === id))
              .filter((w): w is Widget => Boolean(w))
              .map((w, i, arr) => (
                <li
                  key={w.id}
                  className={layout.hidden.includes(w.id) ? "off" : ""}
                >
                  <button
                    className="icon-button"
                    aria-label={`${layout.hidden.includes(w.id) ? "Afficher" : "Masquer"} ${w.title}`}
                    onClick={() => toggle(w.id)}
                  >
                    {layout.hidden.includes(w.id) ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  <span>{w.title}</span>
                  <button
                    className="icon-button"
                    aria-label="Monter"
                    disabled={i === 0}
                    onClick={() => move(w.id, -1)}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Descendre"
                    disabled={i === arr.length - 1}
                    onClick={() => move(w.id, 1)}
                  >
                    <ChevronDown size={16} />
                  </button>
                </li>
              ))}
          </ul>
          <p className="small muted">Ce choix est mémorisé sur cet appareil.</p>
        </section>
      )}
      <section className="widgets">
        {visible.map((w, i) => (
          <article
            className={`widget ${w.size} rise`}
            style={{ "--i": i } as React.CSSProperties}
            key={w.id}
          >
            {render[w.id]()}
          </article>
        ))}
        {!visible.length && (
          <Empty>
            Tous les widgets sont masqués. Utilisez « Personnaliser » pour en
            afficher.
          </Empty>
        )}
      </section>
    </>
  );
}
type Ctx = Props & {
  today: string;
  children: string[];
  myTutor: Data["tutors"][number] | undefined;
};
function Head({
  title,
  link,
  label,
  icon,
}: {
  title: string;
  link?: string;
  label?: string;
  icon?: ReactNode;
}) {
  return (
    <header className="widget-head">
      <h2>
        {icon}
        {title}
      </h2>
      {link && (
        <a href={link} className="text-link">
          {label ?? "Ouvrir"} <ArrowUpRight size={14} />
        </a>
      )}
    </header>
  );
}
function NextBooking({ data, profile, today, myTutor }: Ctx) {
  const now = useMemo(() => new Date(today + "T08:00:00"), [today]);
  const list = data.bookings
    .filter((b) =>
      myTutor ? b.tutor_id === myTutor.id : b.family_id === profile.family_id,
    )
    .filter(
      (b) => ["demandée", "confirmée"].includes(b.status) && b.date >= today,
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const b: Booking | undefined = list[0];
  const tutor = b && data.tutors.find((t) => t.id === b.tutor_id);
  return (
    <>
      <Head
        title="Prochain rendez-vous"
        link="#tutorat"
        label={myTutor ? "Mes rendez-vous" : "Réserver"}
        icon={<GraduationCap size={18} />}
      />
      {!b ? (
        <div className="widget-empty">
          <p>Aucun rendez-vous à venir.</p>
          <a href="#tutorat" className="button primary">
            <CalendarPlus size={16} /> Choisir un créneau
          </a>
        </div>
      ) : (
        <div className="booking-hero">
          <div className="booking-when">
            <strong>{Number(b.date.slice(-2))}</strong>
            <span>{formatDate(b.date, { month: "short" })}</span>
            <small>{formatDate(b.date, { weekday: "long" })}</small>
          </div>
          <div className="booking-info">
            <span className="countdown">
              <Sparkles size={13} /> {daysUntil(b.date, b.time, now)} · {b.time}
            </span>
            <h3>
              {b.subject}
              {myTutor
                ? ` · ${b.child}`
                : tutor
                  ? ` avec ${tutor.display_name}`
                  : ""}
            </h3>
            <p className="small muted">
              {myTutor ? "" : `${b.child} · `}
              {bookingStatusLabels[b.status]}
              {tutor && ` · ${tutor.slot_minutes} min`}
              {b.weekly && " · chaque semaine"}
            </p>
            {b.status === "confirmée" && tutor?.meeting_url && (
              <External url={tutor.meeting_url}>
                <Video size={14} /> Rejoindre en ligne
              </External>
            )}
          </div>
        </div>
      )}
      {list.length > 1 && (
        <ul className="widget-list">
          {list.slice(1, 3).map((x) => (
            <li key={x.id}>
              <span>
                {formatDate(x.date, { day: "numeric", month: "short" })} ·{" "}
                {x.time}
              </span>
              <strong>{x.subject}</strong>
              <small>
                {myTutor
                  ? x.child
                  : data.tutors.find((t) => t.id === x.tutor_id)?.display_name}
              </small>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
function Agenda({ data, profile, today, myTutor }: Ctx) {
  const days = weekDates(today);
  type Item = {
    time: string;
    title: string;
    kind: "task" | "plan" | "session" | "event";
    sub?: string;
  };
  const registered = new Set(data.registrations.map((r) => r.event_id));
  const events = occurrences(
    data.events.filter((e) => e.published && registered.has(e.id)),
    days[0],
    days[6],
  );
  const itemsFor = (day: string): Item[] =>
    [
      ...data.tasks
        .filter((t) => t.date === day && !t.done)
        .map((t) => ({
          time: t.time,
          title: t.title,
          kind: "task" as const,
          sub: t.child,
        })),
      ...data.curriculum_items
        .filter((i) => i.planned_date === day && !i.done)
        .map((i) => ({
          time: "zz",
          title: i.title,
          kind: "plan" as const,
          sub: i.subject,
        })),
      ...data.bookings
        .filter(
          (b) =>
            (myTutor
              ? b.tutor_id === myTutor.id
              : b.family_id === profile.family_id) &&
            b.status === "confirmée" &&
            (b.date === day ||
              (b.weekly &&
                b.date <= day &&
                new Date(b.date + "T12:00:00").getDay() ===
                  new Date(day + "T12:00:00").getDay())),
        )
        .map((b) => ({
          time: b.time,
          title: `${b.subject}${myTutor ? " · " + b.child : ""}`,
          kind: "session" as const,
          sub: myTutor
            ? undefined
            : data.tutors.find((t) => t.id === b.tutor_id)?.display_name,
        })),
      ...events
        .filter((o) => o.date === day)
        .map((o) => ({
          time: o.event.time,
          title: o.event.title,
          kind: "event" as const,
          sub: o.event.location,
        })),
    ].sort((a, b) => a.time.localeCompare(b.time));
  const [selected, setSelected] = useState(today);
  const items = itemsFor(selected);
  return (
    <>
      <Head
        title="Ma semaine"
        link="#semaine"
        label="Ouvrir ma semaine"
        icon={<CalendarDays size={18} />}
      />
      <div className="agenda">
        <div className="agenda-days">
          {days.map((d) => {
            const n = itemsFor(d).length;
            return (
              <button
                key={d}
                className={`agenda-day ${d === selected ? "selected" : ""} ${d === today ? "today" : ""}`}
                onClick={() => setSelected(d)}
                aria-pressed={d === selected}
              >
                <span>
                  {formatDate(d, { weekday: "short" }).replace(".", "")}
                </span>
                <strong>{Number(d.slice(-2))}</strong>
                <em className="dots" aria-label={`${n} élément(s)`}>
                  {Array.from({ length: Math.min(n, 3) }, (_, i) => (
                    <i key={i} />
                  ))}
                </em>
              </button>
            );
          })}
        </div>
        <div className="agenda-list">
          <h3>
            {formatDate(selected, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          {!items.length ? (
            <p className="small muted">
              Rien de prévu. Une journée à inventer.
            </p>
          ) : (
            <ul>
              {items.map((it, i) => (
                <li key={i} className={it.kind}>
                  <span className="time">
                    {it.time === "zz" ? "—" : it.time}
                  </span>
                  <span className="mark" />
                  <span>
                    <strong>{it.title}</strong>
                    {it.sub && <small>{it.sub}</small>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <a href="#semaine" className="text-link">
            <Plus size={14} /> Ajouter une activité
          </a>
        </div>
      </div>
    </>
  );
}
function Weather({ profile }: Ctx) {
  const [state, setState] = useState<{ f?: Forecast; error?: string }>({});
  const lat = profile.lat;
  const lng = profile.lng;
  useEffect(() => {
    if (lat === null || lng === null) return;
    let live = true;
    forecast(lat, lng)
      .then((f) => live && setState({ f }))
      .catch(
        () => live && setState({ error: "Météo indisponible pour le moment." }),
      );
    return () => {
      live = false;
    };
  }, [lat, lng]);
  if (lat === null || lng === null)
    return (
      <>
        <Head
          title="Météo"
          link="#profil"
          label="Choisir ma ville"
          icon={<CloudSun size={18} />}
        />
        <div className="widget-empty">
          <p>Indiquez votre ville pour voir la météo des sorties.</p>
        </div>
      </>
    );
  const f = state.f;
  return (
    <>
      <Head title={`Météo · ${profile.city}`} icon={<CloudSun size={18} />} />
      {state.error ? (
        <p className="small muted">{state.error}</p>
      ) : !f ? (
        <p className="small muted">Chargement…</p>
      ) : (
        <div className="weather">
          <div className="weather-now">
            <span className={`weather-icon ${weatherKind(f.current.code)}`}>
              {weatherIcon[weatherKind(f.current.code)]}
            </span>
            <div>
              <strong>{f.current.temperature}°</strong>
              <small>{weatherLabel(f.current.code)}</small>
            </div>
          </div>
          <ul className="weather-days">
            {f.days.slice(1, 4).map((d) => (
              <li key={d.date}>
                <span>
                  {formatDate(d.date, { weekday: "short" }).replace(".", "")}
                </span>
                <span className={`weather-icon small ${weatherKind(d.code)}`}>
                  {weatherIcon[weatherKind(d.code)]}
                </span>
                <strong>{d.max}°</strong>
                <small>{d.min}°</small>
              </li>
            ))}
          </ul>
          <small className="muted">Source : Open-Meteo</small>
        </div>
      )}
    </>
  );
}
function ChildrenProgress({ data, today, children }: Ctx) {
  if (!children.length)
    return (
      <>
        <Head
          title="Progrès des enfants"
          link="#semaine"
          label="Ajouter un enfant"
          icon={<Users size={18} />}
        />
        <div className="widget-empty">
          <p>
            Ajoutez vos enfants dans « Ma semaine → Mes enfants » pour suivre
            leur programme et leurs résultats.
          </p>
        </div>
      </>
    );
  return (
    <>
      <Head
        title={`Progrès ${children.length > 1 ? "des enfants" : "de " + children[0]}`}
        link="#semaine"
        label="Résultats"
        icon={<Users size={18} />}
      />
      <div className="children-row">
        {children.map((name) => {
          const items = data.curriculum_items.filter(
            (i) =>
              data.curricula.find((c) => c.id === i.curriculum_id)?.child ===
              name,
          );
          const doneItems = items.filter((i) => i.done).length;
          const pct = items.length
            ? Math.round((doneItems / items.length) * 100)
            : 0;
          const grades = [...data.grades.filter((g) => g.child === name)].sort(
            (a, b) => a.date.localeCompare(b.date),
          );
          const avg = grades.length
            ? Math.round(
                grades.reduce((n, g) => n + percent(g.score, g.max), 0) /
                  grades.length,
              )
            : null;
          const nextItem = items
            .filter((i) => !i.done && i.planned_date && i.planned_date >= today)
            .sort((a, b) => a.planned_date!.localeCompare(b.planned_date!))[0];
          const child = data.children.find((c) => c.name === name);
          const traces =
            data.notes.filter((n) => n.child === name).length +
            data.documents.filter((d) => d.child === name).length;
          return (
            <div className="child-tile" key={name}>
              <header>
                <span className="avatar">{name[0]}</span>
                <div>
                  <h3>{name}</h3>
                  <small>
                    {child?.birth_year
                      ? `${new Date(today).getFullYear() - child.birth_year} ans · `
                      : ""}
                    {traces} trace{traces > 1 ? "s" : ""}
                  </small>
                </div>
              </header>
              <div className="child-metrics">
                <div className="metric-ring">
                  <Ring value={pct} label={items.length ? `${pct} %` : "—"} />
                  <small>Programme</small>
                </div>
                <div className="metric-ring">
                  <Ring
                    value={avg ?? 0}
                    label={avg === null ? "—" : `${avg} %`}
                  />
                  <small>Moyenne</small>
                </div>
                <div className="metric-spark">
                  <Sparkline
                    values={grades
                      .slice(-6)
                      .map((g) => percent(g.score, g.max))}
                  />
                  <small>
                    {grades.length
                      ? `${grades.length} résultat${grades.length > 1 ? "s" : ""}`
                      : "Aucun résultat"}
                  </small>
                </div>
              </div>
              <p className="small">
                {nextItem ? (
                  <>
                    Prochaine notion : <strong>{nextItem.title}</strong> ·{" "}
                    {formatDate(nextItem.planned_date!, {
                      day: "numeric",
                      month: "short",
                    })}
                  </>
                ) : (
                  "Rien de planifié : ajoutez une notion au programme."
                )}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
function SubjectBars({ data }: Ctx) {
  const bySubject = new Map<string, { done: number; total: number }>();
  for (const i of data.curriculum_items) {
    const s = bySubject.get(i.subject) ?? { done: 0, total: 0 };
    s.total++;
    if (i.done) s.done++;
    bySubject.set(i.subject, s);
  }
  const rows = [...bySubject].sort((a, b) => b[1].total - a[1].total);
  const total = data.curriculum_items.length;
  const done = useCountUp(data.curriculum_items.filter((i) => i.done).length);
  return (
    <>
      <Head
        title="Programme par matière"
        link="#semaine"
        label="Programme"
        icon={<ClipboardList size={18} />}
      />
      {!rows.length ? (
        <div className="widget-empty">
          <p>
            Importez votre programme pour suivre ce qui est couvert, matière par
            matière.
          </p>
          <a href="#semaine" className="button secondary">
            Importer un programme
          </a>
        </div>
      ) : (
        <>
          <p className="big-number">
            <strong>{done}</strong> <span>sur {total} éléments faits</span>
          </p>
          <ul className="bars">
            {rows.map(([subject, s]) => (
              <li key={subject}>
                <span>
                  {subject}{" "}
                  <strong>{Math.round((s.done / s.total) * 100)} %</strong>
                </span>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${(s.done / s.total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
function CourseWidget({ data }: Ctx) {
  const courses = data.courses
    .filter((c) => c.published)
    .sort((a, b) => a.position - b.position);
  const course =
    courses.find(
      (c) =>
        completion(
          data.lessons.filter((l) => l.course_id === c.id),
          data.progress,
        ) < 100,
    ) || courses[0];
  if (!course)
    return (
      <>
        <Head title="Cours" icon={<BookOpen size={18} />} />
        <Empty>Vos premiers cours arrivent bientôt.</Empty>
      </>
    );
  const lessons = data.lessons.filter((l) => l.course_id === course.id);
  const pct = completion(lessons, data.progress);
  return (
    <>
      <Head
        title="Cours en cours"
        link="#cours"
        label="Tous les cours"
        icon={<BookOpen size={18} />}
      />
      <a href={"#cours/" + course.id} className="course-mini">
        <img
          src={photoFor(
            "course",
            course.category + " " + course.title,
            course.id,
          )}
          alt=""
        />
        <div>
          <span className="pill">{course.category}</span>
          <h3>{course.title}</h3>
          <small>
            {lessons.length} leçons ·{" "}
            {lessons.reduce((n, l) => n + l.minutes, 0)} min
          </small>
        </div>
        <Ring value={pct} size={52} stroke={6} />
      </a>
    </>
  );
}
function NextEvent({ data, today }: Ctx) {
  const published = data.events.filter((e) => e.published);
  const next = occurrences(published, today, shiftDate(today, 120));
  const registered = new Set(data.registrations.map((r) => r.event_id));
  const o =
    next.find((x) => registered.has(x.event.id)) ??
    next.find((x) => x.event.featured) ??
    next[0];
  return (
    <>
      <Head
        title="Prochaine rencontre"
        link="#evenements"
        label="Toutes"
        icon={<MapPin size={18} />}
      />
      {!o ? (
        <Empty>Aucune rencontre à venir.</Empty>
      ) : (
        <a href="#evenements" className="event-mini">
          <img
            src={photoFor(
              "event",
              o.event.title + " " + o.event.description,
              o.event.id,
            )}
            alt=""
          />
          <div>
            <span className="pill">
              {registered.has(o.event.id)
                ? "Vous êtes inscrit"
                : o.event.featured
                  ? "À la une"
                  : "Suggestion"}
            </span>
            <h3>{o.event.title}</h3>
            <small>
              {formatDate(o.date, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              · {o.event.time}
            </small>
            <small>{o.event.location}</small>
          </div>
        </a>
      )}
    </>
  );
}
function CommunityWidget({ data, profile }: Ctx) {
  const unread = data.messages.filter(
    (m) => m.recipient_id === profile.id && !m.read_at,
  ).length;
  const nearby = data.members.filter(
    (m) =>
      m.city && m.city === profile.city && m.id !== profile.id && m.show_on_map,
  ).length;
  const posts = [...data.posts]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 2);
  return (
    <>
      <Head
        title="Communauté"
        link="#communaute"
        label="Ouvrir"
        icon={<Users size={18} />}
      />
      <div className="community-kpis">
        <a href="#communaute/messages" className={unread ? "hot" : ""}>
          <MessageSquare size={16} />
          <strong>{unread}</strong>
          <small>
            message{unread > 1 ? "s" : ""} non lu{unread > 1 ? "s" : ""}
          </small>
        </a>
        <a href={profile.city ? "#communaute/carte" : "#profil"}>
          <MapPin size={16} />
          <strong>{profile.city ? nearby : "?"}</strong>
          <small>
            {profile.city
              ? `famille${nearby > 1 ? "s" : ""} à ${profile.city}`
              : "ville à renseigner"}
          </small>
        </a>
        <a href="#communaute/membres">
          <Users size={16} />
          <strong>
            {data.members.filter((m) => m.role === "parent").length}
          </strong>
          <small>familles membres</small>
        </a>
      </div>
      <ul className="widget-list">
        {posts.map((p) => (
          <li key={p.id}>
            <a href={"#communaute/" + p.id}>
              <span className="avatar sand">{p.author[0]}</span>
              <span>
                <strong>{p.title}</strong>
                <small>
                  {p.author} · {timeAgo(p.created_at)} ·{" "}
                  {data.replies.filter((r) => r.post_id === p.id).length}{" "}
                  réponse(s)
                </small>
              </span>
              <ChevronRight size={16} />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
function PortfolioWidget({ data }: Ctx) {
  const entries = [
    ...data.notes.map((n) => ({
      id: n.id,
      title: n.title,
      date: n.date,
      child: n.child,
      kind: "note" as const,
    })),
    ...data.documents.map((d) => ({
      id: d.id,
      title: d.title,
      date: d.created_at.slice(0, 10),
      child: d.child,
      kind: "doc" as const,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  return (
    <>
      <Head
        title="Portfolio"
        link="#semaine"
        label="Ouvrir"
        icon={<NotebookPen size={18} />}
      />
      {!entries.length ? (
        <div className="widget-empty">
          <p>
            Gardez une trace des découvertes : une note, une photo, un dessin.
          </p>
          <a href="#semaine" className="button secondary">
            Écrire une note
          </a>
        </div>
      ) : (
        <ul className="widget-list">
          {entries.map((e) => (
            <li key={e.id}>
              <span>
                {formatDate(e.date, { day: "numeric", month: "short" })}
              </span>
              <strong>{e.title}</strong>
              <small>
                {e.child || "Famille"} ·{" "}
                {e.kind === "note" ? "note" : "fichier"}
              </small>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
function Shortcuts({ myTutor }: Ctx) {
  const links = myTutor
    ? [
        ["#tutorat", "Mes rendez-vous", <GraduationCap size={18} key="a" />],
        [
          "#communaute/messages",
          "Écrire à une famille",
          <Send size={18} key="b" />,
        ],
        ["#evenements", "Rencontres", <MapPin size={18} key="c" />],
        ["#profil", "Mon profil", <Users size={18} key="d" />],
      ]
    : [
        ["#semaine", "Ajouter une activité", <Plus size={18} key="a" />],
        ["#tutorat", "Réserver un créneau", <CalendarPlus size={18} key="b" />],
        ["#examens", "Passer un examen", <ClipboardList size={18} key="c" />],
        ["#semaine", "Écrire une note", <NotebookPen size={18} key="d" />],
        [
          "#communaute/messages",
          "Écrire à une famille",
          <Send size={18} key="e" />,
        ],
        ["#evenements", "Proposer une rencontre", <MapPin size={18} key="f" />],
      ];
  return (
    <>
      <Head title="Raccourcis" icon={<Sparkles size={18} />} />
      <div className="shortcuts">
        {links.map(([href, label, icon]) => (
          <a href={href as string} key={label as string}>
            {icon}
            <span>{label}</span>
            <ArrowRight size={14} />
          </a>
        ))}
      </div>
    </>
  );
}
function AdminDashboard({ data, profile, api }: Props) {
  const today = api.mode === "demo" ? "2026-09-07" : localDate();
  const monthStart = today.slice(0, 7) + "-01";
  const parents = data.members.filter((m) => m.role === "parent");
  const withProfile = parents.filter((m) => m.city || m.bio).length;
  const proposals = data.events.filter(
    (e) => !e.published && e.organizer.includes("membre"),
  ).length;
  const questions = data.lesson_questions.filter((q) => !q.answer).length;
  const bookingsMonth = data.bookings.filter(
    (b) => b.date >= monthStart && b.status !== "annulée",
  ).length;
  const attemptsMonth = data.exam_attempts.filter(
    (a) => a.created_at >= monthStart,
  ).length;
  const cities = [
    ...data.members.reduce(
      (m, x) => (x.city ? m.set(x.city, (m.get(x.city) ?? 0) + 1) : m),
      new Map<string, number>(),
    ),
  ].sort((a, b) => b[1] - a[1]);
  const weeks = Array.from({ length: 8 }, (_, i) =>
    shiftDate(weekDates(today)[0], -7 * (7 - i)),
  );
  const activity = weeks.map((start) => {
    const end = shiftDate(start, 7);
    const inWeek = (iso: string) =>
      iso.slice(0, 10) >= start && iso.slice(0, 10) < end;
    return {
      start,
      posts:
        data.posts.filter((p) => inWeek(p.created_at)).length +
        data.replies.filter((r) => inWeek(r.created_at)).length,
      bookings: data.bookings.filter(
        (b) => b.date >= start && b.date < end && b.status !== "annulée",
      ).length,
      members: data.members.filter((m) => inWeek(m.created_at)).length,
    };
  });
  const max = Math.max(
    1,
    ...activity.map((a) => a.posts + a.bookings + a.members),
  );
  const todo = [
    [data.reports.length, "signalement(s) à examiner", "#admin"],
    [proposals, "rencontre(s) proposée(s) à vérifier", "#admin"],
    [questions, "question(s) sans réponse", "#admin"],
    [
      data.tutors.filter((t) => !t.published).length,
      "profil(s) d’intervenant à publier",
      "#admin",
    ],
  ] as const;
  const kpis = [
    [parents.length, "familles membres", "#communaute/membres"],
    [withProfile, "profils complétés", "#communaute/membres"],
    [data.group_members.length, "adhésions aux groupes", "#communaute"],
    [data.registrations.length, "inscriptions aux rencontres", "#evenements"],
    [bookingsMonth, "rendez-vous ce mois-ci", "#admin"],
    [attemptsMonth, "examens passés ce mois-ci", "#examens"],
  ] as const;
  return (
    <>
      <PageTitle
        eyebrow={formatDate(today, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        title={`Bonjour ${profile.display_name}.`}
        description="L’état de la communauté et ce qui attend l’équipe aujourd’hui."
      />
      <section className="widgets">
        <article
          className="widget md rise"
          style={{ "--i": 0 } as React.CSSProperties}
        >
          <Head
            title="À traiter"
            link="#admin"
            label="Administration"
            icon={<ClipboardList size={18} />}
          />
          <ul className="todo">
            {todo.map(([n, label, link]) => (
              <li key={label} className={n ? "hot" : ""}>
                <a href={link}>
                  <strong>{n}</strong> <span>{label}</span>
                  <ChevronRight size={16} />
                </a>
              </li>
            ))}
          </ul>
        </article>
        <article
          className="widget md rise"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          <Head
            title="Activité des 8 dernières semaines"
            icon={<Sparkles size={18} />}
          />
          <div
            className="activity-chart"
            role="img"
            aria-label="Discussions, rendez-vous et nouveaux membres par semaine"
          >
            {activity.map((a) => (
              <div
                className="col"
                key={a.start}
                title={`Semaine du ${formatDate(a.start, { day: "numeric", month: "short" })} : ${a.posts} discussions, ${a.bookings} rendez-vous, ${a.members} nouveaux membres`}
              >
                <div
                  className="stack"
                  style={{
                    height: `${((a.posts + a.bookings + a.members) / max) * 100}%`,
                  }}
                >
                  <span style={{ flex: a.posts }} className="s1" />
                  <span style={{ flex: a.bookings }} className="s2" />
                  <span style={{ flex: a.members }} className="s3" />
                </div>
                <small>{Number(a.start.slice(-2))}</small>
              </div>
            ))}
          </div>
          <div className="legend">
            <span>
              <i className="s1" /> Discussions et réponses
            </span>
            <span>
              <i className="s2" /> Rendez-vous
            </span>
            <span>
              <i className="s3" /> Nouveaux membres
            </span>
          </div>
        </article>
        <article
          className="widget lg rise"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <Head title="La communauté en chiffres" icon={<Users size={18} />} />
          <div className="kpis">
            {kpis.map(([n, label, link]) => (
              <Kpi key={label} n={n} label={label} link={link} />
            ))}
          </div>
        </article>
        <article
          className="widget md rise"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <Head
            title="Familles par ville"
            link="#communaute/carte"
            label="Carte"
            icon={<MapPin size={18} />}
          />
          <ul className="bars">
            {cities.slice(0, 6).map(([city, n]) => (
              <li key={city}>
                <span>
                  {city} <strong>{n}</strong>
                </span>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${(n / cities[0][1]) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            {!cities.length && (
              <li className="small muted">Aucune ville renseignée.</li>
            )}
          </ul>
        </article>
        <article
          className="widget md rise"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <Head
            title="Prochaines rencontres"
            link="#evenements"
            label="Toutes"
            icon={<CalendarDays size={18} />}
          />
          <ul className="widget-list">
            {occurrences(
              data.events.filter((e) => e.published),
              today,
              shiftDate(today, 60),
            )
              .slice(0, 4)
              .map((o) => (
                <li key={o.key}>
                  <span>
                    {formatDate(o.date, { day: "numeric", month: "short" })} ·{" "}
                    {o.event.time}
                  </span>
                  <strong>{o.event.title}</strong>
                  <small>
                    {data.event_counts.find((c) => c.event_id === o.event.id)
                      ?.count ?? 0}{" "}
                    inscription(s)
                  </small>
                </li>
              ))}
          </ul>
        </article>
        <article
          className="widget md rise"
          style={{ "--i": 6 } as React.CSSProperties}
        >
          <Head
            title="Assistant : usage et coût"
            icon={<Sparkles size={18} />}
          />
          <AssistantUsage data={data} today={today} />
        </article>
        <article
          className="widget lg rise"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          <Head
            title="Dernières discussions"
            link="#communaute"
            label="Modérer"
            icon={<MessageSquare size={18} />}
          />
          <ul className="widget-list two-col">
            {[...data.posts]
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .slice(0, 4)
              .map((p) => (
                <li key={p.id}>
                  <a href={"#communaute/" + p.id}>
                    <span className="avatar sand">{p.author[0]}</span>
                    <span>
                      <strong>{p.title}</strong>
                      <small>
                        {p.author} · {timeAgo(p.created_at)}
                      </small>
                    </span>
                    <ChevronRight size={16} />
                  </a>
                </li>
              ))}
          </ul>
        </article>
      </section>
    </>
  );
}
function Kpi({ n, label, link }: { n: number; label: string; link: string }) {
  const v = useCountUp(n);
  return (
    <a href={link} className="kpi">
      <strong>{v}</strong>
      <small>{label}</small>
    </a>
  );
}

function AssistantUsage({ data, today }: { data: Data; today: string }) {
  const month = today.slice(0, 7);
  const rows = data.assistant_usage;
  const sum = (
    list: typeof rows,
    k: "questions" | "input_tokens" | "output_tokens",
  ) => list.reduce((n, r) => n + r[k], 0);
  const todayRows = rows.filter((r) => r.day === today);
  const monthRows = rows.filter((r) => r.day.startsWith(month));
  const cost = (list: typeof rows) =>
    (
      (sum(list, "input_tokens") * 5 + sum(list, "output_tokens") * 25) /
      1_000_000
    ).toFixed(2);
  if (!rows.length)
    return (
      <div className="widget-empty">
        <p>
          Aucune question posée à l’assistant IA. Sans clé configurée, le bouton
          « Besoin d’aide ? » utilise seulement la recherche intégrée, sans
          coût.
        </p>
      </div>
    );
  return (
    <>
      <div className="kpis">
        <div className="kpi">
          <strong>{sum(todayRows, "questions")}</strong>
          <small>
            questions aujourd’hui · {todayRows.length} membre
            {todayRows.length > 1 ? "s" : ""}
          </small>
        </div>
        <div className="kpi">
          <strong>{sum(monthRows, "questions")}</strong>
          <small>questions ce mois-ci</small>
        </div>
        <div className="kpi">
          <strong>{cost(monthRows)} $ US</strong>
          <small>coût estimé du mois (tarif Opus 5)</small>
        </div>
      </div>
      <small className="muted">
        {Math.round(sum(monthRows, "input_tokens") / 1000)} k jetons entrés ·{" "}
        {Math.round(sum(monthRows, "output_tokens") / 1000)} k jetons produits.
        Les quotas par membre et global se règlent dans les secrets de la
        fonction « assistant ».
      </small>
    </>
  );
}
