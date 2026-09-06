import { useEffect, useState, useRef, type FormEvent } from "react";
import {
  Home,
  BookOpen,
  CalendarDays,
  Library,
  Users,
  CalendarRange,
  ShieldCheck,
  LogOut,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  LockKeyhole,
  Check,
  Leaf,
  ArrowUpRight,
} from "lucide-react";
import { completion, type Data, type Profile } from "./domain";
import type { Gateway } from "./data/gateway";
import { configured, SupabaseGateway } from "./data/supabase";
import { DemoGateway } from "./data/demo";
import { Art, Empty, PageTitle } from "./components/ui";
import { Courses } from "./components/Courses";
import { Family } from "./components/Family";
import { Community, Events, Resources } from "./components/Social";
import { Admin } from "./components/Admin";
export type Run = (
  work: () => Promise<void>,
  message?: string,
) => Promise<boolean>;
export type Props = {
  data: Data;
  profile: Profile;
  api: Gateway;
  run: Run;
  busy: boolean;
};
const navigation = [
  ["accueil", "Mon accueil", Home],
  ["cours", "Mes cours", BookOpen],
  ["semaine", "Ma semaine", CalendarDays],
  ["ressources", "Ressources", Library],
  ["communaute", "Communauté", Users],
  ["evenements", "Événements", CalendarRange],
] as const;
const demoEnabled =
  import.meta.env.VITE_ENABLE_DEMO === "true" || import.meta.env.DEV;
function initialApi(): Gateway | null {
  if (demoEnabled && sessionStorage.getItem("parented-mode") === "demo")
    return new DemoGateway();
  if (configured) return new SupabaseGateway();
  return null;
}
function currentPage() {
  return window.location.hash.slice(1).split("/")[0] || "accueil";
}
export default function App() {
  const [api, setApi] = useState<Gateway | null>(initialApi);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(currentPage);
  const [menu, setMenu] = useState(false);
  const pending = useRef(false);
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 640px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const change = () => setMobile(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);
  useEffect(() => {
    let live = true;
    setLoading(true);
    if (!api) {
      setLoading(false);
      return;
    }
    api
      .session()
      .then(async (p) => {
        if (live) setProfile(p);
        if (p) {
          const d = await api.load();
          if (live) setData(d);
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [api]);
  useEffect(() => {
    const onHash = () => {
      setPage(currentPage());
      setMenu(false);
      setError("");
      setNotice("");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const run: Run = async (work, message = "Enregistré.") => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
      if (api) setData(await api.load());
      setNotice(message);
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Une erreur est survenue. Réessayez.",
      );
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const login = async (email: string, password: string, demo = false) => {
    setBusy(true);
    setError("");
    try {
      const provider = demo ? new DemoGateway() : api;
      if (!provider) throw new Error("Supabase n’est pas encore configuré.");
      const p = await provider.login(email, password);
      const d = await provider.load();
      if (demo) sessionStorage.setItem("parented-mode", "demo");
      setApi(provider);
      setProfile(p);
      setData(d);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    if (!api) return;
    setBusy(true);
    try {
      await api.logout();
      setProfile(null);
      setData(null);
      sessionStorage.removeItem("parented-mode");
      if (api.mode === "demo")
        setApi(configured ? new SupabaseGateway() : null);
      window.location.hash = "accueil";
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (loading)
    return (
      <div className="loading-screen">
        <img src="/parented-logo.png" alt="parentEd" />
        <p role="status">Ouverture de votre espace…</p>
      </div>
    );
  if (!profile) return <Login login={login} busy={busy} error={error} />;
  const props = data && api ? { data, profile, api, run, busy } : null;
  return (
    <div className="app-shell">
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Aller au contenu
      </a>
      <aside
        inert={mobile && !menu}
        className={`sidebar ${menu ? "open" : ""}`}
      >
        <a className="brand" href="#accueil">
          <img src="/parented-logo.png" alt="parentEd — accueil" />
        </a>
        <span className="nav-label">MON ESPACE PARENT</span>
        <nav aria-label="Navigation principale" onClick={() => setMenu(false)}>
          {navigation.map(([id, label, Icon]) => (
            <a
              key={id}
              href={"#" + id}
              className={page === id ? "active" : ""}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={20} />
              {label}
              {page === id && <span className="nav-active-dot" />}
            </a>
          ))}
          {profile.role === "admin" && (
            <a href="#admin" className={page === "admin" ? "active" : ""}>
              <ShieldCheck size={20} />
              Administration
            </a>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="private-note">
            <LockKeyhole size={19} />
            <div>
              <strong>Un espace à vous</strong>
              <p>Vos documents familiaux restent privés.</p>
            </div>
          </div>
          <div className="profile">
            <span className="avatar">{profile.display_name.slice(0, 1)}</span>
            <div>
              <strong>{profile.display_name}</strong>
              <small>
                {profile.role === "admin" ? "Administration" : "Espace parent"}
              </small>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              disabled={busy}
              aria-label="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          aria-label="Fermer la navigation"
          className="scrim"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <div className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <span>
            Mon espace <ChevronRight size={14} />{" "}
            <strong>
              {navigation.find((n) => n[0] === page)?.[1] || "Administration"}
            </strong>
          </span>
          <span className="topbar-tag">
            <span className="status-dot" />
            {api?.mode === "demo"
              ? "Démonstration · données fictives"
              : "Espace membre"}
          </span>
        </div>
        <main id="main" tabIndex={-1}>
          {error && (
            <div className="alert" role="alert">
              {error}
              <button
                onClick={() => run(async () => {}, "Données actualisées.")}
                disabled={busy}
              >
                Réessayer
              </button>
            </div>
          )}
          {notice && (
            <div className="toast" role="status">
              <Check size={18} />
              {notice}
            </div>
          )}
          {!props ? (
            <Empty>
              Impossible de charger votre espace. Utilisez « Réessayer ».
            </Empty>
          ) : page === "accueil" ? (
            <Dashboard {...props} />
          ) : page === "cours" ? (
            <Courses {...props} />
          ) : page === "semaine" ? (
            <Family {...props} />
          ) : page === "ressources" ? (
            <Resources {...props} />
          ) : page === "communaute" ? (
            <Community {...props} />
          ) : page === "evenements" ? (
            <Events {...props} />
          ) : page === "admin" && profile.role === "admin" ? (
            <Admin {...props} />
          ) : (
            <Empty>
              Cette page n’est pas disponible.{" "}
              <a href="#accueil">Revenir à l’accueil</a>
            </Empty>
          )}
        </main>
        <footer>
          parentEd <span>À votre rythme. Ensemble.</span>
          {api?.mode === "demo" && (
            <small>Sauvegarde dans ce navigateur uniquement</small>
          )}
        </footer>
      </div>
    </div>
  );
}
function Login({
  login,
  busy,
  error,
}: {
  login: (email: string, password: string, demo?: boolean) => Promise<void>;
  busy: boolean;
  error: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void login(email, password);
  };
  return (
    <div className="login">
      <section className="login-story">
        <img src="/parented-logo.png" alt="parentEd" />
        <div>
          <span className="eyebrow">POUR LES PARENTS QUI FONT APPRENDRE</span>
          <h1>
            Un peu de repères.
            <br />
            Beaucoup de possibles.
          </h1>
          <p>
            Apprenez, organisez votre quotidien et trouvez du soutien pour votre
            aventure en famille.
          </p>
          <Art large />
          <span className="story-caption">
            <Leaf size={18} /> Grandir ensemble, une découverte à la fois.
          </span>
        </div>
        <small>Les cours ParentEd s’adressent aux parents-éducateurs.</small>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <span className="eyebrow">VOTRE ESPACE PARENT</span>
          <h2>Heureux de vous retrouver.</h2>
          <p>Un petit pas aujourd’hui, de nouvelles idées pour demain.</p>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          {configured ? (
            <form onSubmit={submit}>
              <label>
                Adresse courriel
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Mot de passe
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button className="button primary" disabled={busy}>
                {busy ? "Connexion…" : "Me connecter"}
                <ArrowRight size={18} />
              </button>
              <p className="muted small">
                Utilisez le compte fourni par l’équipe ParentEd.
              </p>
            </form>
          ) : (
            <div className="connection-note">
              <LockKeyhole size={20} />
              <p>
                La connexion aux comptes membres sera disponible après
                configuration de Supabase.
              </p>
            </div>
          )}
          {demoEnabled && (
            <div className="demo-choice">
              <span className="pill">DÉMONSTRATION</span>
              <h3>Découvrez une semaine en famille</h3>
              <p>
                Profils et contenus fictifs. Vos essais restent dans ce
                navigateur. N’y ajoutez aucune donnée personnelle.
              </p>
              <button
                className="button primary"
                disabled={busy}
                onClick={() => login("amelie@demo.parented.test", "", true)}
              >
                Explorer avec Amélie <ArrowRight size={18} />
              </button>
              <div className="demo-secondary">
                <button
                  disabled={busy}
                  onClick={() => login("sami@demo.parented.test", "", true)}
                >
                  Autre famille : Sami
                </button>
                <button
                  disabled={busy}
                  onClick={() => login("admin@demo.parented.test", "", true)}
                >
                  Administration
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
function Dashboard({ data, profile }: Props) {
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
  const lessons = data.lessons
    .filter((l) => l.course_id === course?.id)
    .sort((a, b) => a.position - b.position);
  const done = completion(lessons, data.progress);
  const task = data.tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const event = data.events
    .filter((e) => e.published)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  return (
    <>
      <PageTitle
        eyebrow="CHAQUE PETIT PAS COMPTE"
        title={`Bonjour ${profile.display_name}.`}
        description="Un espace pour apprendre, s’organiser et avancer ensemble."
      />
      <section className="dashboard-grid">
        <div className="hero-card">
          <div className="hero-content">
            <span className="hero-kicker">
              <span />
              VOTRE FIL CONDUCTEUR
            </span>
            <h2>
              À chacun son rythme.
              <br />À vous de trouver le vôtre.
            </h2>
            <p>
              Quelques repères pour une semaine plus sereine,
              <br className="desktop-only" /> et de la place pour l’imprévu.
            </p>
            <a className="button white" href="#semaine">
              Organiser ma semaine
              <ArrowRight size={18} />
            </a>
          </div>
          <Art large />
        </div>
        <div className="week-glance">
          <span className="eyebrow">VOTRE PETITE BOUSSOLE</span>
          <h3>Cette semaine, on avance.</h3>
          <div className="glance-row">
            <span className="glance-icon">
              <BookOpen size={21} />
            </span>
            <div>
              <strong>
                {data.progress.length} leçon
                {data.progress.length > 1 ? "s" : ""} terminée
                {data.progress.length > 1 ? "s" : ""}
              </strong>
              <small>Chaque idée fait son chemin</small>
            </div>
          </div>
          <div className="glance-row">
            <span className="glance-icon green">
              <CalendarDays size={21} />
            </span>
            <div>
              <strong>
                {data.tasks.filter((t) => !t.done).length} activité
                {data.tasks.filter((t) => !t.done).length > 1 ? "s" : ""} à
                vivre
              </strong>
              <small>Dans votre planning familial</small>
            </div>
          </div>
          <a href="#semaine" className="text-link">
            Voir mon organisation <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <section className="dashboard-lower">
        <div>
          <div className="section-heading">
            <h2>Un moment pour apprendre</h2>
            <a href="#cours">
              Tous les cours <ArrowRight size={16} />
            </a>
          </div>
          {course ? (
            <a href={"#cours/" + course.id} className="continue-card">
              <Art />
              <div>
                <span className="pill">{done ? "EN COURS" : "POUR VOUS"}</span>
                <h3>{course.title}</h3>
                <p>
                  {lessons.length} leçons ·{" "}
                  {lessons.reduce((n, l) => n + l.minutes, 0)} minutes · À votre
                  rythme
                </p>
                <div className="progress-label">
                  <span>
                    {done
                      ? "Votre progression"
                      : "Prêt à faire le premier pas ?"}
                  </span>
                  <strong>{done} %</strong>
                </div>
                <progress value={done} max={100} />
                <span className="text-link">
                  {done === 100
                    ? "Revoir le cours"
                    : done
                      ? "Continuer mon cours"
                      : "Commencer le cours"}
                  <ArrowRight size={17} />
                </span>
              </div>
            </a>
          ) : (
            <Empty>Vos premiers cours arrivent bientôt.</Empty>
          )}
          <div className="section-heading">
            <h2>La vie de la communauté</h2>
            <a href="#communaute">
              Rejoindre les échanges <ArrowRight size={16} />
            </a>
          </div>
          {data.posts.slice(0, 1).map((p) => (
            <a
              href={"#communaute/" + p.id}
              className="community-preview"
              key={p.id}
            >
              <span className="avatar sand">{p.author[0]}</span>
              <div>
                <small>
                  {p.author} <span>· {p.category}</span>
                </small>
                <h3>{p.title}</h3>
                <p>{p.body.slice(0, 115)}…</p>
              </div>
              <ChevronRight size={20} />
            </a>
          ))}
        </div>
        <div className="upcoming">
          <div className="section-heading">
            <h2>À l’horizon</h2>
            <CalendarRange size={19} />
          </div>
          {task && (
            <a href="#semaine" className="horizon-item">
              <span className="pill">EN FAMILLE</span>
              <h3>{task.title}</h3>
              <p>
                {new Date(task.date + "T12:00:00").toLocaleDateString("fr-CA", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                · {task.time}
              </p>
              <small>{task.child}</small>
            </a>
          )}
          {event ? (
            <a href="#evenements" className="event-preview">
              <div className="event-art">
                <Leaf size={58} strokeWidth={1} />
                <span>LES RENCONTRES PARENTED</span>
              </div>
              <div>
                <span className="pill">ON SE RETROUVE ?</span>
                <h3>{event.title}</h3>
                <p>
                  {new Date(event.date + "T12:00:00").toLocaleDateString(
                    "fr-CA",
                    { day: "numeric", month: "long" },
                  )}{" "}
                  · {event.time}
                </p>
                <span className="text-link">
                  Découvrir la rencontre <ArrowUpRight size={16} />
                </span>
              </div>
            </a>
          ) : (
            <Empty>Aucune rencontre à venir.</Empty>
          )}
        </div>
      </section>
    </>
  );
}
