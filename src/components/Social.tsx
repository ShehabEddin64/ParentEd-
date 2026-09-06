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
  List,
  Flag,
  Trash2,
  Users,
} from "lucide-react";
import type { Props } from "../App";
import { required, safeUrl, type Event } from "../domain";
import { Empty, External, PageTitle } from "./ui";
export function Resources({ data }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");
  const rows = data.resources.filter(
    (r) =>
      (category === "Toutes" || r.category === category) &&
      (r.title + " " + r.description)
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr")),
  );
  return (
    <>
      <PageTitle
        eyebrow="DES SOURCES POUR VOUS REPÉRER"
        title="Les bonnes ressources, au bon endroit."
        description="Des liens officiels, accompagnés de repères pour savoir par où commencer."
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
          aria-label="Catégorie de ressource"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["Toutes", ...new Set(data.resources.map((r) => r.category))].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
      </div>
      <div className="resource-grid">
        {rows.map((r) => (
          <article className="resource-card" key={r.id}>
            <div className="resource-icon">
              <ArrowRight size={23} />
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
        <Empty>Aucune ressource ne correspond à votre recherche.</Empty>
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
          <span className="pill">{post.category}</span>
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
  return (
    <>
      <PageTitle
        eyebrow="ON AVANCE MIEUX ENSEMBLE"
        title="Entre parents, tout simplement."
        description="Des questions, des idées et des expériences à partager, sans jugement."
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
              <label>
                Catégorie
                <select name="category">
                  <option>Au quotidien</option>
                  <option>Questions et entraide</option>
                  <option>Découvertes</option>
                </select>
              </label>
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
            {data.posts
              .filter((p) => category === "Toutes" || p.category === category)
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .map((p) => (
                <a
                  href={"#communaute/" + p.id}
                  className="post-card"
                  key={p.id}
                >
                  <div className="post-author">
                    <span className="avatar sand">{p.author[0]}</span>
                    <span>
                      {p.author}
                      <small>
                        {new Date(p.created_at).toLocaleDateString("fr-CA")}
                      </small>
                    </span>
                    <span className="pill">{p.category}</span>
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
          {!data.posts.some(
            (p) => category === "Toutes" || p.category === category,
          ) && <Empty>La première discussion peut venir de vous.</Empty>}
        </div>
        <aside className="community-guide">
          <Users size={28} />
          <h2>Une place pour chacun.</h2>
          <p>
            Les petits essais méritent autant d’être partagés que les grandes
            découvertes.
          </p>
          <ul>
            <li>Échangeons avec bienveillance.</li>
            <li>Partageons nos expériences, sans imposer une méthode.</li>
            <li>Gardons les renseignements des enfants dans l’espace privé.</li>
          </ul>
          <a href="#semaine" className="text-link">
            Mon dossier familial
            <ArrowRight size={16} />
          </a>
        </aside>
      </div>
    </>
  );
}
export function Events({ data, profile, api, run, busy }: Props) {
  const [view, setView] = useState("liste");
  const [selected, setSelected] = useState<Event | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const rows = data.events
    .filter(
      (e) =>
        e.published &&
        (!onlyMine || data.registrations.some((r) => r.event_id === e.id)),
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const [month, setMonth] = useState(
    () => rows[0]?.date.slice(0, 7) || new Date().toISOString().slice(0, 7),
  );
  const register = async (e: Event) => {
    const r = data.registrations.find((r) => r.event_id === e.id);
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
  const details = (e: Event) => (
    <>
      <span className="pill">RENCONTRE PARENT-ENFANT</span>
      <h2>{e.title}</h2>
      <p>{e.description}</p>
      <ul className="event-facts">
        <li>
          <CalendarDays size={17} />
          {new Date(e.date + "T12:00:00").toLocaleDateString("fr-CA", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </li>
        <li>
          <Clock size={17} />
          {e.time}
        </li>
        <li>
          <MapPin size={17} />
          {e.location}
        </li>
        <li>
          <Users size={17} />
          {e.age}
        </li>
      </ul>
      <p className="small muted">Organisé par {e.organizer}</p>
      <button
        className={`button ${data.registrations.some((r) => r.event_id === e.id) ? "secondary" : "primary"}`}
        disabled={busy}
        onClick={() => register(e)}
      >
        {data.registrations.some((r) => r.event_id === e.id) ? (
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
    </>
  );
  const first = new Date(month + "-01T12:00:00");
  const blanks = (first.getDay() + 6) % 7;
  const count = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    0,
  ).getDate();
  return (
    <>
      <PageTitle
        eyebrow="SE RENCONTRER, DÉCOUVRIR, PARTAGER"
        title="Des moments à vivre ensemble."
        description="Des rencontres entre familles, pour prolonger les découvertes hors de la maison."
      />
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
          {rows.map((e) => (
            <article className="event-card" key={e.id}>
              <div className="event-banner">
                <span>
                  {new Date(e.date + "T12:00:00").toLocaleDateString("fr-CA", {
                    month: "short",
                  })}
                  <strong>{Number(e.date.slice(-2))}</strong>
                </span>
                <div aria-hidden="true">✳</div>
              </div>
              <div className="event-content">{details(e)}</div>
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
                <div key={date}>
                  <span>{i + 1}</span>
                  {rows
                    .filter((e) => e.date === date)
                    .map((e) => (
                      <button key={e.id} onClick={() => setSelected(e)}>
                        {e.time} · {e.title}
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
      {!rows.length && (
        <Empty>
          {onlyMine
            ? "Vous n’êtes inscrit à aucune rencontre."
            : "Aucune rencontre pour le moment."}
        </Empty>
      )}
    </>
  );
}
