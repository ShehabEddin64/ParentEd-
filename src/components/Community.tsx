import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  MessageCircle,
  Flag,
  Trash2,
  Users,
  Heart,
  Pin,
  Pencil,
  Search,
  Send,
  MapPin,
  Map as MapIcon,
  MessageSquare,
  CalendarDays,
  GraduationCap,
  Home,
} from "lucide-react";
import type { Props } from "../App";
import {
  formatDate,
  localDate,
  occurrences,
  quebecCities,
  required,
  shiftDate,
  timeAgo,
  type Member,
} from "../domain";
import { Empty, PageTitle } from "./ui";
import { pages } from "../images";
import { MapView, type MapMarker } from "./MapView";
function route() {
  const [, second = "", third = ""] = location.hash.slice(1).split("/");
  return { second, third };
}
export function Community(props: Props) {
  const { data, profile } = props;
  const [{ second, third }, setRoute] = useState(route);
  useEffect(() => {
    const f = () => setRoute(route());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const unread = data.messages.filter(
    (m) => m.recipient_id === profile.id && !m.read_at,
  ).length;
  const tabs = [
    ["", "Discussions", MessageCircle],
    ["membres", "Membres", Users],
    ["carte", "Carte", MapIcon],
    ["messages", "Messages", MessageSquare],
  ] as const;
  const tab = ["membres", "carte", "messages"].includes(second) ? second : "";
  const post =
    tab === "" && second ? data.posts.find((p) => p.id === second) : null;
  if (post) return <PostDetail {...props} postId={post.id} />;
  return (
    <>
      <PageTitle
        eyebrow="On avance mieux ensemble"
        title="Entre parents, tout simplement."
        description="Des discussions, des familles près de chez vous, une carte et des messages privés : de quoi se rencontrer pour de vrai."
      />
      {tab === "" && (
        <img className="section-photo" src={pages.community} alt="" />
      )}
      <div className="tabs community-tabs">
        {tabs.map(([id, label, Icon]) => (
          <a
            key={id}
            href={"#communaute" + (id ? "/" + id : "")}
            className={tab === id ? "active" : ""}
          >
            <Icon size={17} />
            {label}
            {id === "messages" && unread > 0 && (
              <span className="badge">{unread}</span>
            )}
          </a>
        ))}
      </div>
      {tab === "" && <Discussions {...props} />}
      {tab === "membres" && <Members {...props} />}
      {tab === "carte" && <CommunityMap {...props} />}
      {tab === "messages" && <Messages {...props} partnerId={third} />}
    </>
  );
}
function LikeButton({
  data,
  profile,
  api,
  run,
  busy,
  postId,
}: Props & { postId: string }) {
  const likes = data.post_likes.filter((l) => l.post_id === postId);
  const mine = likes.find((l) => l.user_id === profile.id);
  return (
    <button
      type="button"
      className={`like ${mine ? "on" : ""}`}
      aria-pressed={Boolean(mine)}
      disabled={busy}
      onClick={(e) => {
        e.preventDefault();
        void run(
          () =>
            mine
              ? api.remove("post_likes", mine.id)
              : api.save("post_likes", {
                  id: crypto.randomUUID(),
                  post_id: postId,
                  user_id: profile.id,
                }),
          mine ? "J’aime retiré." : "Merci pour ce soutien !",
        );
      }}
    >
      <Heart size={15} fill={mine ? "currentColor" : "none"} />
      {likes.length}
    </button>
  );
}
function Discussions(props: Props) {
  const { data, profile, api, run, busy } = props;
  const [create, setCreate] = useState(false);
  const [category, setCategory] = useState("Toutes");
  const [group, setGroup] = useState("Tous");
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
            pinned: false,
            updated_at: null,
          }),
        "Votre discussion est publiée.",
      )
    ) {
      form.reset();
      setCreate(false);
    }
  };
  const posts = data.posts
    .filter((p) => category === "Toutes" || p.category === category)
    .filter(
      (p) =>
        group === "Tous" ||
        (group === "Général" ? !p.group_id : p.group_id === group),
    )
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        b.created_at.localeCompare(a.created_at),
    );
  const myGroups = data.group_members
    .filter((m) => m.user_id === profile.id)
    .map((m) => m.group_id);
  return (
    <div className="community-layout">
      <div>
        <div className="section-heading">
          <h2>
            {group === "Tous"
              ? "Toutes les discussions"
              : group === "Général"
                ? "Espace général"
                : groupName(group)}
          </h2>
          <button className="button primary" onClick={() => setCreate(!create)}>
            <Plus size={18} />
            {create ? "Fermer" : "Lancer une discussion"}
          </button>
        </div>
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
                  <option>Rencontres et sorties</option>
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
            "Rencontres et sorties",
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
          {posts.map((p) => {
            const author = data.members.find((m) => m.id === p.user_id);
            const replies = data.replies.filter((r) => r.post_id === p.id);
            const last = replies
              .map((r) => r.created_at)
              .sort()
              .at(-1);
            return (
              <a
                href={"#communaute/" + p.id}
                className={`post-card ${p.pinned ? "pinned" : ""}`}
                key={p.id}
              >
                <div className="post-author">
                  <span className="avatar sand">{p.author[0]}</span>
                  <span>
                    {p.author}
                    <small>
                      {author?.city ? author.city + " · " : ""}
                      {timeAgo(p.created_at)}
                    </small>
                  </span>
                  {p.pinned && (
                    <span className="pill featured">
                      <Pin size={11} /> Épinglé
                    </span>
                  )}
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
                <div className="post-footer">
                  <small className="reply-count">
                    <MessageCircle size={16} />
                    {replies.length} réponse{replies.length > 1 ? "s" : ""}
                    {last && <span> · dernière {timeAgo(last)}</span>}
                  </small>
                  <LikeButton {...props} postId={p.id} />
                </div>
              </a>
            );
          })}
        </div>
        {!posts.length && (
          <Empty>La première discussion de ce groupe peut venir de vous.</Empty>
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
          {!myGroups.length && (
            <p className="small muted">
              Rejoignez le groupe de votre région pour voir les rencontres
              proches et les familles qui cherchent des compagnons de sortie.
            </p>
          )}
        </section>
        <NearbyPanel {...props} />
        <section className="community-guide">
          <h2>Une place pour chacun.</h2>
          <ul>
            <li>Échangeons avec bienveillance.</li>
            <li>Partageons nos expériences, sans imposer une méthode.</li>
            <li>Gardons les renseignements des enfants dans l’espace privé.</li>
            <li>Le bouton « Signaler » prévient l’équipe de modération.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
function NearbyPanel({ data, profile }: Props) {
  const nearby = data.members.filter(
    (m) =>
      m.city && m.city === profile.city && m.id !== profile.id && m.show_on_map,
  );
  if (!profile.city)
    return (
      <section className="nearby-panel">
        <h2>
          <MapPin size={18} /> Près de chez vous
        </h2>
        <p className="small muted">
          Indiquez votre ville dans votre profil pour voir les familles de votre
          secteur.
        </p>
        <a href="#profil" className="text-link">
          Compléter mon profil <ArrowRight size={15} />
        </a>
      </section>
    );
  return (
    <section className="nearby-panel">
      <h2>
        <MapPin size={18} /> Familles à {profile.city}
      </h2>
      {!nearby.length ? (
        <p className="small muted">
          Aucune autre famille visible pour l’instant. Vous pouvez lancer la
          première discussion de votre secteur.
        </p>
      ) : (
        <ul className="member-mini-list">
          {nearby.slice(0, 5).map((m) => (
            <li key={m.id}>
              <span className="avatar">{m.display_name[0]}</span>
              <span>
                <strong>{m.display_name}</strong>
                <small>
                  {m.children_ages
                    ? "Enfants : " + m.children_ages
                    : m.interests.slice(0, 2).join(", ")}
                </small>
              </span>
              <a
                href={"#communaute/messages/" + m.id}
                className="icon-button"
                aria-label={`Écrire à ${m.display_name}`}
              >
                <Send size={15} />
              </a>
            </li>
          ))}
        </ul>
      )}
      <a href="#communaute/carte" className="text-link">
        Voir la carte <ArrowRight size={15} />
      </a>
    </section>
  );
}
function MemberCard({
  m,
  me,
  data,
}: {
  m: Member;
  me: string;
  data: Props["data"];
}) {
  const shared = data.group_members
    .filter((g) => g.user_id === m.id)
    .map((g) => data.groups.find((x) => x.id === g.group_id)?.name)
    .filter(Boolean);
  return (
    <article className="member-card">
      <div className="tutor-head">
        <span className="avatar sand">{m.display_name[0]}</span>
        <div>
          <h3>{m.display_name}</h3>
          <small>
            {m.role === "tutor"
              ? "Tuteur partenaire"
              : m.role === "admin"
                ? "Équipe ParentEd"
                : "Parent"}
            {m.city && ` · ${m.city}`}
            {m.children_ages && ` · enfants de ${m.children_ages}`}
          </small>
        </div>
      </div>
      {m.bio && <p>{m.bio}</p>}
      {m.interests.length > 0 && (
        <div className="pill-row">
          {m.interests.map((i) => (
            <span className="pill" key={i}>
              {i}
            </span>
          ))}
        </div>
      )}
      {shared.length > 0 && (
        <small className="muted">Groupes : {shared.join(", ")}</small>
      )}
      <div className="discussion-actions">
        <small className="muted">
          Membre depuis{" "}
          {formatDate(m.created_at.slice(0, 10), {
            month: "long",
            year: "numeric",
          })}
        </small>
        {m.id !== me && (
          <a href={"#communaute/messages/" + m.id} className="button secondary">
            <Send size={15} /> Écrire
          </a>
        )}
      </div>
    </article>
  );
}
function Members({ data, profile }: Props) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Toutes");
  const [interest, setInterest] = useState("Tous");
  const cities = [
    "Toutes",
    ...new Set(data.members.map((m) => m.city).filter(Boolean)),
  ];
  const interests = [
    "Tous",
    ...new Set(data.members.flatMap((m) => m.interests)),
  ];
  const rows = data.members
    .filter((m) => m.role !== "admin" || m.bio)
    .filter((m) => city === "Toutes" || m.city === city)
    .filter((m) => interest === "Tous" || m.interests.includes(interest))
    .filter((m) =>
      (m.display_name + " " + m.bio + " " + m.city)
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr")),
    )
    .sort((a, b) =>
      a.id === profile.id
        ? -1
        : b.id === profile.id
          ? 1
          : b.created_at.localeCompare(a.created_at),
    );
  return (
    <>
      <div className="filter-bar">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="Rechercher un membre"
            placeholder="Prénom, ville, mot-clé…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Intérêt"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
        >
          {interests.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <a href="#profil" className="text-link">
          <Pencil size={15} /> Mon profil
        </a>
      </div>
      {!profile.bio && !profile.city && (
        <div className="privacy-banner">
          <Users size={22} />
          <p>
            Votre profil est presque vide : ajoutez votre ville et vos intérêts
            pour que les autres familles puissent vous trouver.{" "}
            <a href="#profil">Compléter mon profil</a>
          </p>
        </div>
      )}
      <div className="member-grid">
        {rows.map((m) => (
          <MemberCard key={m.id} m={m} me={profile.id} data={data} />
        ))}
      </div>
      {!rows.length && <Empty>Aucun membre ne correspond à ces filtres.</Empty>}
    </>
  );
}
function CommunityMap(props: Props) {
  const { data, profile, api } = props;
  const today = api.mode === "demo" ? "2026-09-07" : localDate();
  const [layers, setLayers] = useState({
    family: true,
    event: true,
    tutor: true,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const markers = useMemo(() => {
    const out: MapMarker[] = [];
    if (layers.family) {
      const byCity = new Map<string, Member[]>();
      for (const m of data.members) {
        if (
          !m.show_on_map ||
          m.lat === null ||
          m.lng === null ||
          m.role === "tutor"
        )
          continue;
        byCity.set(m.city, [...(byCity.get(m.city) ?? []), m]);
      }
      for (const [city, members] of byCity)
        out.push({
          id: "city:" + city,
          lat: members[0].lat!,
          lng: members[0].lng!,
          title: `${members.length} famille${members.length > 1 ? "s" : ""} à ${city}`,
          subtitle: members.map((m) => m.display_name).join(", "),
          kind: "family",
          count: members.length,
        });
    }
    if (layers.event) {
      const seen = new Set<string>();
      for (const o of occurrences(
        data.events.filter(
          (e) => e.published && e.lat !== null && e.lng !== null,
        ),
        today,
        shiftDate(today, 120),
      )) {
        if (seen.has(o.event.id)) continue;
        seen.add(o.event.id);
        out.push({
          id: "event:" + o.event.id,
          lat: o.event.lat!,
          lng: o.event.lng!,
          title: o.event.title,
          subtitle: formatDate(o.date) + " · " + o.event.time,
          kind: "event",
        });
      }
    }
    if (layers.tutor)
      for (const t of data.tutors.filter((t) => t.published)) {
        const place = quebecCities.find((c) =>
          t.region.toLowerCase().includes(c.name.toLowerCase()),
        );
        if (place)
          out.push({
            id: "tutor:" + t.id,
            lat: place.lat + 0.02,
            lng: place.lng + 0.02,
            title: t.display_name + " · " + t.subjects.join(", "),
            subtitle: t.region + " · " + t.mode,
            kind: "tutor",
          });
      }
    return out;
  }, [data, layers, today]);
  const detail = selected ? markers.find((m) => m.id === selected) : null;
  const [kind, id] = selected?.split(":") ?? [];
  return (
    <>
      <div className="filter-bar">
        <div className="map-legend">
          {(
            [
              ["family", "Familles", Home],
              ["event", "Rencontres", CalendarDays],
              ["tutor", "Tuteurs", GraduationCap],
            ] as const
          ).map(([k, label, Icon]) => (
            <label
              key={k}
              className={`chip legend-${k} ${layers[k] ? "on" : ""}`}
            >
              <input
                type="checkbox"
                checked={layers[k]}
                onChange={(e) =>
                  setLayers({ ...layers, [k]: e.target.checked })
                }
              />
              <Icon size={14} /> {label}
            </label>
          ))}
        </div>
        <small className="muted">
          Les familles apparaissent au centre de leur ville, jamais à leur
          adresse. {profile.show_on_map ? "Vous êtes visible." : ""}{" "}
          <a href="#profil">Modifier ma visibilité</a>
        </small>
      </div>
      <div className="map-layout">
        <MapView
          markers={markers}
          selectedId={selected}
          onSelect={setSelected}
          height={520}
        />
        <aside className="map-side">
          {!detail ? (
            <div className="map-hint">
              <MapPin size={26} />
              <h3>Cliquez sur un repère</h3>
              <p className="small muted">
                {markers
                  .filter((m) => m.kind === "family")
                  .reduce((n, m) => n + (m.count ?? 1), 0)}{" "}
                familles visibles ·{" "}
                {markers.filter((m) => m.kind === "event").length} rencontres à
                venir · {markers.filter((m) => m.kind === "tutor").length}{" "}
                tuteurs
              </p>
            </div>
          ) : kind === "city" ? (
            <>
              <span className="pill">Familles</span>
              <h3>{detail.title}</h3>
              <ul className="member-mini-list">
                {data.members
                  .filter(
                    (m) => m.city === id && m.show_on_map && m.role !== "tutor",
                  )
                  .map((m) => (
                    <li key={m.id}>
                      <span className="avatar">{m.display_name[0]}</span>
                      <span>
                        <strong>{m.display_name}</strong>
                        <small>
                          {m.children_ages
                            ? "Enfants : " + m.children_ages
                            : m.interests.slice(0, 2).join(", ")}
                        </small>
                      </span>
                      {m.id !== profile.id && (
                        <a
                          href={"#communaute/messages/" + m.id}
                          className="icon-button"
                          aria-label={`Écrire à ${m.display_name}`}
                        >
                          <Send size={15} />
                        </a>
                      )}
                    </li>
                  ))}
              </ul>
              <a href="#communaute/membres" className="text-link">
                Voir l’annuaire <ArrowRight size={15} />
              </a>
            </>
          ) : kind === "event" ? (
            (() => {
              const e = data.events.find((x) => x.id === id)!;
              const next = occurrences([e], today, shiftDate(today, 365))[0];
              const count =
                data.event_counts.find((c) => c.event_id === e.id)?.count ?? 0;
              return (
                <>
                  <span className="pill">Rencontre</span>
                  <h3>{e.title}</h3>
                  <p className="small">
                    {next ? formatDate(next.date) : formatDate(e.date)} ·{" "}
                    {e.time}
                    <br />
                    {e.location}
                  </p>
                  <p className="small muted">
                    {count} famille{count > 1 ? "s" : ""} inscrite
                    {count > 1 ? "s" : ""} · {e.price}
                  </p>
                  <a href="#evenements" className="button primary">
                    Voir et m’inscrire <ArrowRight size={15} />
                  </a>
                </>
              );
            })()
          ) : (
            (() => {
              const t = data.tutors.find((x) => x.id === id)!;
              return (
                <>
                  <span className="pill">Tuteur partenaire</span>
                  <h3>{t.display_name}</h3>
                  <p className="small">{t.subjects.join(" · ")}</p>
                  <p className="small muted">{t.qualifications}</p>
                  <a href="#tutorat" className="button primary">
                    Demander une séance <ArrowRight size={15} />
                  </a>
                </>
              );
            })()
          )}
        </aside>
      </div>
    </>
  );
}
function Messages({
  data,
  profile,
  api,
  run,
  busy,
  partnerId,
}: Props & { partnerId: string }) {
  const mine = data.messages.filter(
    (m) => m.sender_id === profile.id || m.recipient_id === profile.id,
  );
  const partners = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of [...mine].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )) {
      const other = m.sender_id === profile.id ? m.recipient_id : m.sender_id;
      if (!map.has(other)) map.set(other, m.created_at);
    }
    if (partnerId && !map.has(partnerId)) map.set(partnerId, "");
    return [...map.keys()];
  }, [mine, partnerId, profile.id]);
  const current = partnerId || partners[0] || "";
  const partner = data.members.find((m) => m.id === current);
  const thread = mine
    .filter((m) => m.sender_id === current || m.recipient_id === current)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const unreadIds = thread
    .filter((m) => m.recipient_id === profile.id && !m.read_at)
    .map((m) => m.id);
  useEffect(() => {
    if (!unreadIds.length) return;
    void run(async () => {
      for (const id of unreadIds)
        await api.patch("messages", id, { read_at: new Date().toISOString() });
    }, "Messages lus.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadIds.join(",")]);
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (
      await run(
        () =>
          api.save("messages", {
            id: crypto.randomUUID(),
            sender_id: profile.id,
            recipient_id: current,
            body: required(String(f.get("body")), 3000),
            created_at: new Date().toISOString(),
            read_at: null,
          }),
        "Message envoyé.",
      )
    )
      form.reset();
  };
  return (
    <div className="messages-layout">
      <aside className="conversations">
        <h2>Conversations</h2>
        {!partners.length && (
          <p className="small muted">
            Aucune conversation. Écrivez à une famille depuis l’annuaire ou la
            carte.
          </p>
        )}
        {partners.map((id) => {
          const m = data.members.find((x) => x.id === id);
          const last = mine
            .filter((x) => x.sender_id === id || x.recipient_id === id)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
          const unread = mine.filter(
            (x) => x.sender_id === id && !x.read_at,
          ).length;
          return (
            <a
              key={id}
              href={"#communaute/messages/" + id}
              className={`conversation ${id === current ? "active" : ""}`}
            >
              <span className="avatar sand">{m?.display_name[0] ?? "?"}</span>
              <span>
                <strong>{m?.display_name ?? "Membre"}</strong>
                <small>
                  {last ? last.body.slice(0, 40) : "Nouvelle conversation"}
                </small>
              </span>
              {unread > 0 && <span className="badge">{unread}</span>}
            </a>
          );
        })}
        <a href="#communaute/membres" className="text-link">
          <Users size={15} /> Trouver une famille
        </a>
      </aside>
      <section className="thread">
        {!partner ? (
          <Empty>
            Choisissez une conversation ou écrivez à un membre depuis
            l’annuaire.
          </Empty>
        ) : (
          <>
            <header className="thread-head">
              <span className="avatar sand">{partner.display_name[0]}</span>
              <div>
                <strong>{partner.display_name}</strong>
                <small className="muted">
                  {partner.city}
                  {partner.children_ages &&
                    ` · enfants de ${partner.children_ages}`}
                </small>
              </div>
            </header>
            <div className="bubbles">
              {!thread.length && (
                <p className="small muted">
                  Dites bonjour ! Proposez une sortie, une question, un échange
                  de ressources.
                </p>
              )}
              {thread.map((m) => (
                <div
                  key={m.id}
                  className={`bubble ${m.sender_id === profile.id ? "me" : ""}`}
                >
                  <p className="preserve-lines">{m.body}</p>
                  <small>
                    {timeAgo(m.created_at)}
                    {m.sender_id === profile.id && m.read_at && " · lu"}
                  </small>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="compose">
              <textarea
                name="body"
                required
                maxLength={3000}
                placeholder="Votre message… (aucun renseignement sensible sur les enfants)"
              />
              <button className="button primary" disabled={busy}>
                <Send size={16} /> Envoyer
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
function PostDetail(props: Props & { postId: string }) {
  const { data, profile, api, run, busy, postId } = props;
  const post = data.posts.find((p) => p.id === postId)!;
  const [report, setReport] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [edit, setEdit] = useState(false);
  const author = data.members.find((m) => m.id === post.user_id);
  const groupName = data.groups.find((g) => g.id === post.group_id)?.name;
  const canEdit = post.user_id === profile.id || profile.role === "admin";
  return (
    <>
      <a className="back-link" href="#communaute">
        <ArrowLeft size={17} />
        Toutes les discussions
      </a>
      <article className="discussion-detail">
        <div className="pill-row">
          {post.pinned && (
            <span className="pill featured">
              <Pin size={11} /> Épinglé
            </span>
          )}
          <span className="pill">{post.category}</span>
          {groupName && <span className="pill">{groupName}</span>}
        </div>
        {edit ? (
          <form
            className="editor"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (
                await run(
                  () =>
                    api.patch("posts", post.id, {
                      title: required(String(f.get("title")), 160),
                      body: required(String(f.get("body"))),
                      updated_at: new Date().toISOString(),
                    }),
                  "Discussion modifiée.",
                )
              )
                setEdit(false);
            }}
          >
            <label>
              Titre
              <input
                name="title"
                defaultValue={post.title}
                required
                maxLength={160}
              />
            </label>
            <label>
              Message
              <textarea
                name="body"
                defaultValue={post.body}
                required
                maxLength={5000}
              />
            </label>
            <div className="discussion-actions">
              <button className="button primary" disabled={busy}>
                Enregistrer
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => setEdit(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1>{post.title}</h1>
            <div className="post-author">
              <span className="avatar sand">{post.author[0]}</span>
              <span>
                {post.author}
                <small>
                  {author?.city ? author.city + " · " : ""}
                  {new Date(post.created_at).toLocaleDateString("fr-CA")}
                  {post.updated_at && " · modifié"}
                </small>
              </span>
              {author && author.id !== profile.id && (
                <a
                  href={"#communaute/messages/" + author.id}
                  className="text-button"
                >
                  <Send size={15} /> Écrire à {author.display_name}
                </a>
              )}
            </div>
            <p className="preserve-lines">{post.body}</p>
          </>
        )}
        <div className="discussion-actions">
          <LikeButton {...props} postId={post.id} />
          <button className="text-button" onClick={() => setReport(!report)}>
            <Flag size={16} />
            Signaler
          </button>
          {canEdit && !edit && (
            <button className="text-button" onClick={() => setEdit(true)}>
              <Pencil size={16} /> Modifier
            </button>
          )}
          {profile.role === "admin" && (
            <button
              className="text-button"
              disabled={busy}
              onClick={() =>
                run(
                  () => api.patch("posts", post.id, { pinned: !post.pinned }),
                  post.pinned
                    ? "Discussion désépinglée."
                    : "Discussion épinglée en tête.",
                )
              }
            >
              <Pin size={16} /> {post.pinned ? "Désépingler" : "Épingler"}
            </button>
          )}
          {canEdit &&
            (confirm ? (
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
                  onClick={() => setConfirm(false)}
                  className="text-button"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button className="text-button" onClick={() => setConfirm(true)}>
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
          {data.replies.filter((r) => r.post_id === post.id).length} réponse(s)
        </h2>
        {data.replies
          .filter((r) => r.post_id === post.id)
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
          .map((r) => (
            <article className="reply" key={r.id}>
              <span className="avatar">{r.author[0]}</span>
              <div>
                <strong>{r.author}</strong>{" "}
                <small className="muted">{timeAgo(r.created_at)}</small>
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
                    Supprimer
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
}
