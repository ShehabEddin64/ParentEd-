import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Plus,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  CalendarDays,
  CalendarPlus,
  List,
  Flag,
  Trash2,
  Users,
  Star,
  Repeat,
  Megaphone,
  Map as MapIcon,
  Pencil,
} from "lucide-react";
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
        eyebrow="DES SOURCES POUR VOUS REPÉRER"
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
            <div className="resource-top">
              <div className="resource-icon">
                <ArrowRight size={23} />
              </div>
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
export function Community({ data, profile, api, run, busy }: Props) {
  const [selected, setSelected] = useState(location.hash.split("/")[1] || "");
  const [create, setCreate] = useState(false);
  const [category, setCategory] = useState("Toutes");
  const [group, setGroup] = useState("Tous");
  const [report, setReport] = useState(false);
  const [confirm, setConfirm] = useState("");
  useEffect(() => {
    const f = () => {
      setSelected(location.hash.split("/")[1] || "");
      setReport(false);
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const post = data.posts.find((p) => p.id === selected);
  const membership = (groupId: string) =>
    data.group_members.find(
      (m) => m.group_id === groupId && m.user_id === profile.id,
    );
  const groupName = (id: string | null) =>
    data.groups.find((g) => g.id === id)?.name;
  const publish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (
      await run(
        () =>
          api.save("posts", {
            id: crypto.randomUUID(),
            user_id: profile.id,
            author: profile.display_name,
            title: required(String(f.get("title")), 160),
            body: required(String(f.get("body"))),
            category: String(f.get("category")),
            created_at: new Date().toISOString(),
            group_id: String(f.get("group_id")) || null,
          }),
        "Votre discussion est publiée.",
      )
    ) {
      form.reset();
      setCreate(false);
    }
  };
  if (post)
    return (
      <>
        <a className="back-link" href="#communaute">
          <ArrowLeft size={17} />
          Toutes les discussions
        </a>
        <article className="discussion-detail">
          <div className="pill-row">
            <span className="pill">{post.category}</span>
            {post.group_id && (
              <span className="pill">{groupName(post.group_id)}</span>
            )}
          </div>
          <h1>{post.title}</h1>
          <div className="post-author">
            <span className="avatar sand">{post.author[0]}</span>
            <span>
              {post.author}
              <small>
                {new Date(post.created_at).toLocaleDateString("fr-CA")}
              </small>
            </span>
          </div>
          <p className="preserve-lines">{post.body}</p>
          <div className="discussion-actions">
            <button className="text-button" onClick={() => setReport(!report)}>
              <Flag size={16} />
              Signaler
            </button>
            {(post.user_id === profile.id || profile.role === "admin") &&
              (confirm === post.id ? (
                <>
                  <button
                    className="text-button danger"
                    disabled={busy}
                    onClick={async () => {
                      if (
                        await run(
                          () => api.remove("posts", post.id),
                          "Discussion supprimée.",
                        )
                      )
                        location.hash = "communaute";
                    }}
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    onClick={() => setConfirm("")}
                    className="text-button"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  className="text-button"
                  onClick={() => setConfirm(post.id)}
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              ))}
          </div>
          {report && (
            <form
              className="editor"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                if (
                  await run(
                    () =>
                      api.save("reports", {
                        id: crypto.randomUUID(),
                        post_id: post.id,
                        user_id: profile.id,
                        reason: required(String(f.get("reason")), 1000),
                        created_at: new Date().toISOString(),
                      }),
                    "Signalement enregistré pour la modération.",
                  )
                )
                  setReport(false);
              }}
            >
              <label>
                Motif du signalement
                <textarea name="reason" required maxLength={1000} />
              </label>
              <button className="button secondary" disabled={busy}>
                Transmettre à la modération
              </button>
            </form>
          )}
        </article>
        <section className="replies">
          <h2>
            {data.replies.filter((r) => r.post_id === post.id).length}{" "}
            réponse(s)
          </h2>
          {data.replies
            .filter((r) => r.post_id === post.id)
            .sort((a, b) => a.created_at.localeCompare(b.created_at))
            .map((r) => (
              <article className="reply" key={r.id}>
                <span className="avatar">{r.author[0]}</span>
                <div>
                  <strong>{r.author}</strong>
                  <p className="preserve-lines">{r.body}</p>
                  {(r.user_id === profile.id || profile.role === "admin") && (
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => api.remove("replies", r.id),
                          "Réponse supprimée.",
                        )
                      }
                    >
                      Supprimer ma réponse
                    </button>
                  )}
                </div>
              </article>
            ))}
          <form
            className="editor"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              if (
                await run(
                  () =>
                    api.save("replies", {
                      id: crypto.randomUUID(),
                      post_id: post.id,
                      user_id: profile.id,
                      author: profile.display_name,
                      body: required(String(f.get("body"))),
                      created_at: new Date().toISOString(),
                    }),
                  "Réponse publiée.",
                )
              )
                form.reset();
            }}
          >
            <label>
              À votre tour de partager
              <textarea
                name="body"
                placeholder="Une idée, une expérience, un mot de soutien…"
                required
                maxLength={5000}
              />
            </label>
            <button className="button primary" disabled={busy}>
              Publier ma réponse
              <ArrowRight size={17} />
            </button>
          </form>
        </section>
      </>
    );
  const posts = data.posts
    .filter((p) => category === "Toutes" || p.category === category)
    .filter(
      (p) =>
        group === "Tous" ||
        (group === "Général" ? !p.group_id : p.group_id === group),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <>
      <PageTitle
        eyebrow="ON AVANCE MIEUX ENSEMBLE"
        title="Entre parents, tout simplement."
        description="Des questions, des idées et des expériences à partager, sans jugement. Rejoignez un groupe de votre région ou autour d’un thème."
        action={
          <button className="button primary" onClick={() => setCreate(!create)}>
            <Plus size={18} />
            {create ? "Fermer" : "Lancer une discussion"}
          </button>
        }
      />
      <div className="community-layout">
        <div>
          {create && (
            <form className="editor" onSubmit={publish}>
              <h2>Qu’aimeriez-vous partager ?</h2>
              <label>
                Titre
                <input name="title" required maxLength={160} />
              </label>
              <div className="form-grid">
                <label>
                  Catégorie
                  <select name="category">
                    <option>Au quotidien</option>
                    <option>Questions et entraide</option>
                    <option>Découvertes</option>
                  </select>
                </label>
                <label>
                  Groupe
                  <select
                    name="group_id"
                    defaultValue={
                      group !== "Tous" && group !== "Général" ? group : ""
                    }
                  >
                    <option value="">Espace général</option>
                    {data.groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Votre message
                <textarea name="body" required maxLength={5000} />
              </label>
              <button className="button primary" disabled={busy}>
                Publier la discussion
              </button>
            </form>
          )}
          <div className="tabs">
            {[
              "Toutes",
              "Au quotidien",
              "Questions et entraide",
              "Découvertes",
            ].map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="post-list">
            {posts.map((p) => (
              <a href={"#communaute/" + p.id} className="post-card" key={p.id}>
                <div className="post-author">
                  <span className="avatar sand">{p.author[0]}</span>
                  <span>
                    {p.author}
                    <small>
                      {new Date(p.created_at).toLocaleDateString("fr-CA")}
                    </small>
                  </span>
                  <span className="pill">{p.category}</span>
                  {p.group_id && (
                    <span className="pill">{groupName(p.group_id)}</span>
                  )}
                </div>
                <h2>{p.title}</h2>
                <p>
                  {p.body.slice(0, 200)}
                  {p.body.length > 200 ? "…" : ""}
                </p>
                <small className="reply-count">
                  <MessageCircle size={16} />
                  {data.replies.filter((r) => r.post_id === p.id).length}{" "}
                  réponse(s)
                </small>
              </a>
            ))}
          </div>
          {!posts.length && (
            <Empty>
              La première discussion de ce groupe peut venir de vous.
            </Empty>
          )}
        </div>
        <aside className="community-side">
          <section className="groups-panel">
            <h2>
              <Users size={18} /> Groupes
            </h2>
            <button
              className={`group-row ${group === "Tous" ? "active" : ""}`}
              onClick={() => setGroup("Tous")}
            >
              <span>Toutes les discussions</span>
            </button>
            <button
              className={`group-row ${group === "Général" ? "active" : ""}`}
              onClick={() => setGroup("Général")}
            >
              <span>Espace général</span>
            </button>
            {(["region", "theme"] as const).map((kind) => (
              <div key={kind}>
                <span className="eyebrow">
                  {kind === "region" ? "PAR RÉGION" : "PAR THÈME"}
                </span>
                {data.groups
                  .filter((g) => g.kind === kind)
                  .map((g) => {
                    const m = membership(g.id);
                    const members = data.group_members.filter(
                      (x) => x.group_id === g.id,
                    ).length;
                    return (
                      <div
                        className={`group-row ${group === g.id ? "active" : ""}`}
                        key={g.id}
                      >
                        <button
                          className="group-name"
                          onClick={() => setGroup(g.id)}
                        >
                          <strong>{g.name}</strong>
                          <small>
                            {members} membre{members > 1 ? "s" : ""} ·{" "}
                            {g.description}
                          </small>
                        </button>
                        <button
                          className={`text-button ${m ? "" : "join"}`}
                          disabled={busy}
                          onClick={() =>
                            run(
                              () =>
                                m
                                  ? api.remove("group_members", m.id)
                                  : api.save("group_members", {
                                      id: crypto.randomUUID(),
                                      group_id: g.id,
                                      user_id: profile.id,
                                    }),
                              m
                                ? `Vous avez quitté « ${g.name} ».`
                                : `Bienvenue dans « ${g.name} » !`,
                            )
                          }
                        >
                          {m ? "Quitter" : "Rejoindre"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            ))}
          </section>
          <section className="community-guide">
            <h2>Une place pour chacun.</h2>
            <ul>
              <li>Échangeons avec bienveillance.</li>
              <li>Partageons nos expériences, sans imposer une méthode.</li>
              <li>
                Gardons les renseignements des enfants dans l’espace privé.
              </li>
              <li>Le bouton « Signaler » prévient l’équipe de modération.</li>
            </ul>
          </section>
        </aside>
      </div>
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
        });
      }, "Proposition transmise à l’équipe. Elle sera publiée après vérification.")
    )
      setPropose(null);
  };
  const details = (o: Occurrence) => {
    const e = o.event;
    return (
      <>
        <div className="pill-row">
          <span className="pill">RENCONTRE PARENT-ENFANT</span>
          {e.featured && (
            <span className="pill featured">
              <Megaphone size={11} /> À LA UNE
            </span>
          )}
          {e.recurrence !== "none" && (
            <span className="pill">
              <Repeat size={11} />{" "}
              {recurrenceLabels[e.recurrence].toUpperCase()}
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
        <p className="small muted">Organisé par {e.organizer}</p>
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
        eyebrow="SE RENCONTRER, DÉCOUVRIR, PARTAGER"
        title="Des moments à vivre ensemble."
        description="Des rencontres entre familles, en semaine ou le week-end, pour prolonger les découvertes hors de la maison. Proposez les vôtres."
        action={
          <button
            className="button primary"
            onClick={() =>
              setPropose(
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
              onClick={() => setPropose(null)}
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
                      onClick={() => setPropose(e)}
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
                  <Megaphone size={11} /> À LA UNE
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
      {view === "liste" ? (
        <div className="events-grid">
          {upcoming.slice(0, 30).map((o) => (
            <article className="event-card" key={o.key}>
              <div className="event-banner">
                <span>
                  {formatDate(o.date, { month: "short" })}
                  <strong>{Number(o.date.slice(-2))}</strong>
                </span>
                <div aria-hidden="true">✳</div>
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
      {(view === "liste" ? !upcoming.length : !monthly.length) && (
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
