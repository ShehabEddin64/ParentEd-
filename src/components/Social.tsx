import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Search,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  CalendarDays,
  CalendarPlus,
  List,
  Trash2,
  Users,
  Star,
  Repeat,
  Megaphone,
  Map as MapIcon,
  Pencil,
} from "lucide-react";
import { MapView, type MapMarker } from "./MapView";
import { photoFor } from "../images";
import type { Props } from "../App";
import {
  formatDate,
  icsFor,
  isWeekend,
  localDate,
  occurrences,
  optional,
  recurrenceLabels,
  required,
  safeUrl,
  shiftDate,
  type Event,
  type Occurrence,
  type Recurrence,
} from "../domain";
import { downloadBlob, Empty, External, PageTitle } from "./ui";
export function Resources({ data, profile, api, run, busy }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const favorite = (id: string) =>
    data.favorites.find((f) => f.resource_id === id);
  const rows = data.resources.filter(
    (r) =>
      (category === "Toutes" || r.category === category) &&
      (!onlyFavorites || favorite(r.id)) &&
      (r.title + " " + r.description + " " + r.source)
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr")),
  );
  const toggle = (id: string) => {
    const f = favorite(id);
    return run(
      () =>
        f
          ? api.remove("favorites", f.id)
          : api.save("favorites", {
              id: crypto.randomUUID(),
              user_id: profile.id,
              resource_id: id,
            }),
      f ? "Retiré de vos favoris." : "Ajouté à vos favoris.",
    );
  };
  return (
    <>
      <PageTitle
        eyebrow="Des sources pour vous repérer"
        title="Les bonnes ressources, au bon endroit."
        description="Des liens officiels classés par étape, accompagnés de nos repères pour savoir par où commencer. Gardez vos favoris à portée de main."
      />
      <div className="filter-bar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="Rechercher une ressource"
            placeholder="Rechercher une ressource…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Étape ou catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["Toutes", ...new Set(data.resources.map((r) => r.category))].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={onlyFavorites}
            onChange={(e) => setOnlyFavorites(e.target.checked)}
          />
          <Star size={15} /> Mes favoris ({data.favorites.length})
        </label>
      </div>
      <div className="resource-grid">
        {rows.map((r) => (
          <article className="resource-card" key={r.id}>
            <div className="card-photo">
              <img
                className="photo"
                src={photoFor("resource", r.category + " " + r.title, r.id)}
                alt=""
                loading="lazy"
              />
            </div>
            <div className="resource-top">
              <button
                className={`icon-button star ${favorite(r.id) ? "on" : ""}`}
                aria-pressed={Boolean(favorite(r.id))}
                aria-label={
                  favorite(r.id)
                    ? `Retirer ${r.title} des favoris`
                    : `Ajouter ${r.title} aux favoris`
                }
                disabled={busy}
                onClick={() => toggle(r.id)}
              >
                <Star
                  size={18}
                  fill={favorite(r.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            <div className="resource-body">
              <span className="pill">{r.category}</span>
              <h2>{r.title}</h2>
              <p>{r.description}</p>
              <small>
                {r.source}
                <br />
                Référence relevée le {r.checked_at}
              </small>
              {safeUrl(r.url) && (
                <External url={r.url}>Consulter la source officielle</External>
              )}
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <Empty>
          {onlyFavorites
            ? "Aucun favori pour l’instant. Cliquez sur l’étoile d’une ressource pour la retrouver ici."
            : "Aucune ressource ne correspond à votre recherche."}
        </Empty>
      )}
      <p className="gentle-note">
        Nos explications sont indépendantes du gouvernement. Consultez toujours
        la source pour les informations à jour.
      </p>
    </>
  );
}
export function Events({ data, profile, api, run, busy }: Props) {
  const today = api.mode === "demo" ? "2026-09-07" : localDate();
  const [view, setView] = useState("liste");
  const [selected, setSelected] = useState<Occurrence | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [region, setRegion] = useState("Toutes");
  const [moment, setMoment] = useState("Tous");
  const [free, setFree] = useState(false);
  const [propose, setPropose] = useState<Partial<Event> | null>(null);
  const [pick, setPick] = useState<{ lat: number; lng: number } | null>(null);
  const [mapSelected, setMapSelected] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState("");
  const [month, setMonth] = useState(today.slice(0, 7));
  const published = data.events.filter((e) => e.published);
  const regions = [
    "Toutes",
    ...new Set(published.map((e) => e.region).filter(Boolean)),
  ];
  const registered = (id: string) =>
    data.registrations.find((r) => r.event_id === id);
  const matches = (e: Event, date: string) =>
    (!onlyMine || registered(e.id)) &&
    (region === "Toutes" || e.region === region) &&
    (moment === "Tous" ||
      (moment === "Week-end" ? isWeekend(date) : !isWeekend(date))) &&
    (!free || /gratuit|libre/i.test(e.price));
  const upcoming = occurrences(published, today, shiftDate(today, 120)).filter(
    (o) => matches(o.event, o.date),
  );
  const participants = (id: string) =>
    data.event_counts.find((c) => c.event_id === id)?.count ?? 0;
  const mapMarkers = useMemo(() => {
    const seen = new Set<string>();
    const out: MapMarker[] = [];
    for (const o of upcoming) {
      const e = o.event;
      if (seen.has(e.id) || e.lat === null || e.lng === null) continue;
      seen.add(e.id);
      out.push({
        id: e.id,
        lat: e.lat,
        lng: e.lng,
        title: e.title,
        subtitle: formatDate(o.date) + " · " + e.time,
        kind: "event",
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.events, data.event_counts, onlyMine, region, moment, free, today]);
  const mapDetail = mapSelected
    ? upcoming.find((o) => o.event.id === mapSelected)
    : null;
  const featured = published.filter(
    (e) => e.featured && (e.recurrence !== "none" || e.date >= today),
  );
  const mine = data.events.filter(
    (e) => e.created_by === profile.id && profile.role !== "admin",
  );
  const register = async (e: Event) => {
    const r = registered(e.id);
    await run(
      () =>
        r
          ? api.remove("registrations", r.id)
          : api.save("registrations", {
              id: crypto.randomUUID(),
              event_id: e.id,
              user_id: profile.id,
            }),
      r
        ? "Inscription annulée."
        : api.mode === "demo"
          ? "Inscription fictive enregistrée."
          : "Votre inscription est enregistrée.",
    );
  };
  const submitProposal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const map = String(f.get("map_url") || "").trim();
    if (
      await run(async () => {
        if (map && !safeUrl(map))
          throw new Error("Le lien de carte doit commencer par https://");
        await api.save("events", {
          id: propose?.id ?? crypto.randomUUID(),
          title: required(String(f.get("title")), 160),
          description: required(String(f.get("description"))),
          date: String(f.get("date")),
          time: String(f.get("time")),
          location: required(String(f.get("location")), 200),
          organizer: `${profile.display_name} — membre`,
          age: required(String(f.get("age")), 80),
          published: false,
          region: optional(String(f.get("region")), 120),
          price: required(String(f.get("price")), 120),
          featured: false,
          recurrence: String(f.get("recurrence")) as Recurrence,
          recurrence_until: String(f.get("recurrence_until") || "") || null,
          map_url: map || null,
          created_by: profile.id,
          lat: pick?.lat ?? null,
          lng: pick?.lng ?? null,
        });
      }, "Proposition transmise à l’équipe. Elle sera publiée après vérification.")
    ) {
      setPropose(null);
      setPick(null);
    }
  };
  const openProposal = (e: Partial<Event> | null) => {
    setPropose(e);
    setPick(
      e &&
        e.lat !== null &&
        e.lat !== undefined &&
        e.lng !== null &&
        e.lng !== undefined
        ? { lat: e.lat, lng: e.lng }
        : null,
    );
  };
  const details = (o: Occurrence) => {
    const e = o.event;
    return (
      <>
        <div className="pill-row">
          <span className="pill">Rencontre parent-enfant</span>
          {e.featured && (
            <span className="pill featured">
              <Megaphone size={11} /> À la une
            </span>
          )}
          {e.recurrence !== "none" && (
            <span className="pill">
              <Repeat size={11} /> {recurrenceLabels[e.recurrence]}
            </span>
          )}
        </div>
        <h2>{e.title}</h2>
        <p>{e.description}</p>
        <ul className="event-facts">
          <li>
            <CalendarDays size={17} />
            {formatDate(o.date, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {isWeekend(o.date) ? " · week-end" : " · semaine"}
          </li>
          <li>
            <Clock size={17} />
            {e.time}
          </li>
          <li>
            <MapPin size={17} />
            {e.location}
            {e.region && ` · ${e.region}`}
          </li>
          <li>
            <Users size={17} />
            {e.age} · {e.price}
          </li>
        </ul>
        <p className="small muted">
          Organisé par {e.organizer}
          {participants(e.id) > 0 && (
            <>
              {" "}
              ·{" "}
              <strong>
                {participants(e.id)} famille{participants(e.id) > 1 ? "s" : ""}{" "}
                inscrite{participants(e.id) > 1 ? "s" : ""}
              </strong>
            </>
          )}
        </p>
        <div className="discussion-actions">
          <button
            className={`button ${registered(e.id) ? "secondary" : "primary"}`}
            disabled={busy}
            onClick={() => register(e)}
          >
            {registered(e.id) ? (
              <>
                <CheckCircle2 size={17} />
                Inscrit · annuler
              </>
            ) : (
              <>
                M’inscrire
                <ArrowRight size={17} />
              </>
            )}
          </button>
          <button
            className="text-button"
            onClick={() =>
              downloadBlob(
                new Blob([icsFor(e, o.date)], {
                  type: "text/calendar;charset=utf-8",
                }),
                `parented-${e.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.ics`,
              )
            }
          >
            <CalendarPlus size={16} /> Rappel dans mon calendrier
          </button>
          {e.map_url && safeUrl(e.map_url) && (
            <External url={e.map_url}>
              <MapIcon size={16} /> Voir le lieu sur la carte
            </External>
          )}
        </div>
      </>
    );
  };
  const first = new Date(month + "-01T12:00:00");
  const blanks = (first.getDay() + 6) % 7;
  const count = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
  ).getDate();
  const monthEnd = month + "-" + String(count).padStart(2, "0");
  const monthly = occurrences(published, month + "-01", monthEnd).filter((o) =>
    matches(o.event, o.date),
  );
  return (
    <>
      <PageTitle
        eyebrow="Se rencontrer, découvrir, partager"
        title="Des moments à vivre ensemble."
        description="Des rencontres entre familles, en semaine ou le week-end, pour prolonger les découvertes hors de la maison. Proposez les vôtres."
        action={
          <button
            className="button primary"
            onClick={() =>
              openProposal(
                propose
                  ? null
                  : {
                      recurrence: "none",
                      price: "Gratuit",
                      time: "10:00",
                      date: shiftDate(today, 14),
                    },
              )
            }
          >
            <Plus size={18} />
            {propose ? "Fermer" : "Proposer une rencontre"}
          </button>
        }
      />
      {propose && (
        <form
          className="editor form-grid"
          onSubmit={submitProposal}
          key={propose.id || "new"}
        >
          <div className="section-heading span-2">
            <h2>
              {propose.id
                ? "Modifier ma proposition"
                : "Proposer une rencontre parent-enfant"}
            </h2>
            <button
              type="button"
              className="text-button"
              onClick={() => openProposal(null)}
            >
              Annuler
            </button>
          </div>
          <p className="span-2 small muted">
            L’équipe vérifie chaque proposition avant publication. Les parents
            restent présents et responsables de leurs enfants; indiquez le lieu
            de rencontre, jamais un domicile.
          </p>
          <label className="span-2">
            Titre
            <input
              name="title"
              defaultValue={propose.title}
              required
              maxLength={160}
            />
          </label>
          <label className="span-2">
            Description (déroulement, ce qu’il faut apporter, conditions)
            <textarea
              name="description"
              defaultValue={propose.description}
              required
              maxLength={5000}
            />
          </label>
          <label>
            Date
            <input
              name="date"
              type="date"
              defaultValue={propose.date}
              required
            />
          </label>
          <label>
            Heure
            <input
              name="time"
              type="time"
              defaultValue={propose.time}
              required
            />
          </label>
          <label>
            Lieu public de rencontre
            <input
              name="location"
              defaultValue={propose.location}
              required
              maxLength={200}
              placeholder="Ville · Parc, bibliothèque…"
            />
          </label>
          <label>
            Région
            <input
              name="region"
              list="regions"
              defaultValue={propose.region}
              maxLength={120}
            />
            <datalist id="regions">
              {regions
                .filter((r) => r !== "Toutes")
                .map((r) => (
                  <option key={r} value={r} />
                ))}
            </datalist>
          </label>
          <label>
            Âges visés
            <input
              name="age"
              defaultValue={propose.age}
              required
              maxLength={80}
              placeholder="6–12 ans, tous les âges…"
            />
          </label>
          <label>
            Prix
            <input
              name="price"
              defaultValue={propose.price}
              required
              maxLength={120}
              placeholder="Gratuit, entrée libre, 5 $ par famille…"
            />
          </label>
          <label>
            Récurrence
            <select
              name="recurrence"
              defaultValue={propose.recurrence ?? "none"}
            >
              {(Object.keys(recurrenceLabels) as Recurrence[]).map((r) => (
                <option key={r} value={r}>
                  {recurrenceLabels[r]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Jusqu’au (si récurrent)
            <input
              name="recurrence_until"
              type="date"
              defaultValue={propose.recurrence_until ?? ""}
            />
          </label>
          <label className="span-2">
            Lien vers une carte (facultatif, HTTPS)
            <input
              name="map_url"
              type="url"
              defaultValue={propose.map_url ?? ""}
              placeholder="https://www.openstreetmap.org/…"
            />
          </label>
          <div className="span-2">
            <span className="eyebrow">
              Lieu sur la carte ·cliquez pour placer le repère
              {pick ? " (placé)" : ""}
            </span>
            <MapView
              markers={[]}
              pick={pick}
              onPick={(lat, lng) => setPick({ lat, lng })}
              height={260}
              fit={false}
            />
          </div>
          <button className="button primary" disabled={busy}>
            Transmettre la proposition
          </button>
        </form>
      )}
      {mine.length > 0 && (
        <section className="proposals">
          <div className="section-heading">
            <h2>Mes propositions</h2>
          </div>
          <div className="document-list">
            {mine.map((e) => (
              <article key={e.id}>
                <Megaphone size={22} />
                <div>
                  <strong>{e.title}</strong>
                  <small>
                    {formatDate(e.date)} · {e.time} ·{" "}
                    {e.published ? "Publiée" : "En attente de vérification"}
                  </small>
                </div>
                {!e.published && (
                  <>
                    <button
                      className="icon-button"
                      aria-label={`Modifier ${e.title}`}
                      onClick={() => openProposal(e)}
                    >
                      <Pencil size={17} />
                    </button>
                    {deleteId === e.id ? (
                      <div className="delete-confirm">
                        <button
                          disabled={busy}
                          onClick={async () => {
                            if (
                              await run(
                                () => api.remove("events", e.id),
                                "Proposition retirée.",
                              )
                            )
                              setDeleteId("");
                          }}
                        >
                          Retirer
                        </button>
                        <button onClick={() => setDeleteId("")}>Garder</button>
                      </div>
                    ) : (
                      <button
                        className="icon-button"
                        aria-label={`Retirer ${e.title}`}
                        onClick={() => setDeleteId(e.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      {featured.length > 0 && !onlyMine && (
        <section className="featured-strip">
          {featured.map((e) => {
            const next = occurrences([e], today, shiftDate(today, 365))[0];
            return (
              <a
                key={e.id}
                href="#evenements"
                className="featured-card"
                onClick={(ev) => {
                  ev.preventDefault();
                  if (next) {
                    setSelected(next);
                    setView("calendrier");
                    setMonth(next.date.slice(0, 7));
                  }
                }}
              >
                <span className="pill featured">
                  <Megaphone size={11} /> À la une
                </span>
                <h3>{e.title}</h3>
                <p>
                  {next ? formatDate(next.date) : formatDate(e.date)} · {e.time}{" "}
                  · {e.location}
                </p>
              </a>
            );
          })}
        </section>
      )}
      <div className="filter-bar">
        <div className="tabs">
          <button
            className={view === "liste" ? "active" : ""}
            onClick={() => setView("liste")}
          >
            <List size={17} />
            Liste
          </button>
          <button
            className={view === "calendrier" ? "active" : ""}
            onClick={() => setView("calendrier")}
          >
            <CalendarDays size={17} />
            Calendrier
          </button>
          <button
            className={view === "carte" ? "active" : ""}

            onClick={() => setView("carte")}
          >
            <MapIcon size={17} />
            Carte
          </button>
        </div>
        <select
          aria-label="Région"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select
          aria-label="Moment"
          value={moment}
          onChange={(e) => setMoment(e.target.value)}
        >
          {["Tous", "Semaine", "Week-end"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={free}
            onChange={(e) => setFree(e.target.checked)}
          />
          Gratuit
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
          />
          Mes inscriptions
        </label>
      </div>
      {view === "carte" ? (
        <div className="map-layout">
          <MapView
            markers={mapMarkers}
            selectedId={mapSelected}
            onSelect={setMapSelected}
            height={520}
          />
          <aside className="map-side">
            {mapDetail ? (
              <div className="event-content">{details(mapDetail)}</div>
            ) : (
              <div className="map-hint">
                <MapPin size={26} />
                <h3>Cliquez sur un repère</h3>
                <p className="small muted">
                  {mapMarkers.length} rencontre
                  {mapMarkers.length > 1 ? "s" : ""} géolocalisée
                  {mapMarkers.length > 1 ? "s" : ""} dans les 4 prochains mois.
                  {upcoming.length > mapMarkers.length &&
                    " Certaines rencontres n’ont pas encore de lieu sur la carte."}
                </p>
              </div>
            )}
          </aside>
        </div>
      ) : view === "liste" ? (
        <div className="events-grid">
          {upcoming.slice(0, 30).map((o) => (
            <article className="event-card" key={o.key}>
              <div className="card-photo">
                <img
                  className="photo"
                  src={photoFor(
                    "event",
                    o.event.title + " " + o.event.description,
                    o.event.id,
                  )}
                  alt=""
                  loading="lazy"
                />
                <div className="date-chip">
                  <span>{formatDate(o.date, { month: "short" })}</span>
                  <strong>{Number(o.date.slice(-2))}</strong>
                </div>
              </div>
              <div className="event-content">{details(o)}</div>
            </article>
          ))}
        </div>
      ) : (
        <>
          <label className="month-picker">
            Mois
            <input
              aria-label="Mois des événements"
              type="month"
              value={month}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
            />
          </label>
          <div className="month-grid">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <strong key={d}>{d}</strong>
            ))}
            {Array.from({ length: blanks }, (_, i) => (
              <div className="calendar-blank" key={"b" + i} />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = month + "-" + String(i + 1).padStart(2, "0");
              return (
                <div key={date} className={date === today ? "today" : ""}>
                  <span>{i + 1}</span>
                  {monthly
                    .filter((o) => o.date === date)
                    .map((o) => (
                      <button
                        key={o.key}
                        className={selected?.key === o.key ? "selected" : ""}
                        onClick={() => setSelected(o)}
                      >
                        {o.event.time} · {o.event.title}
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
          {selected && (
            <article className="event-content calendar-detail">
              <button className="text-button" onClick={() => setSelected(null)}>
                Fermer le détail
              </button>
              {details(selected)}
            </article>
          )}
        </>
      )}
      {(view === "liste"
        ? !upcoming.length
        : view === "carte"
          ? !mapMarkers.length
          : !monthly.length) && (
        <Empty>
          {onlyMine
            ? "Vous n’êtes inscrit à aucune rencontre correspondant à ces filtres."
            : "Aucune rencontre pour ces filtres."}
        </Empty>
      )}
      <p className="gentle-note">
        Les rencontres sont proposées par l’équipe ou par des membres et
        vérifiées avant publication. Les parents restent présents et
        responsables; ParentEd n’assure pas de garde d’enfants.
      </p>
    </>
  );
}
