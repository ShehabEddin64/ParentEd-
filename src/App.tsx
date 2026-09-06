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
  GraduationCap,
  Star,
  Bell,
  MessageSquare,
  MapPin,
  ClipboardList,
} from "lucide-react";
import {
  completion,
  formatDate,
  localDate,
  occurrences,
  shiftDate,
  timeAgo,
  type Data,
  type Profile,
} from "./domain";
import type { Gateway } from "./data/gateway";
import { configured, SupabaseGateway } from "./data/supabase";
import { DemoGateway } from "./data/demo";
import { Empty, PageTitle } from "./components/ui";
import { Courses } from "./components/Courses";
import { Family } from "./components/Family";
import { Events, Resources } from "./components/Social";
import { Community } from "./components/Community";
import { Tutoring } from "./components/Tutoring";
import { Profile as ProfilePage } from "./components/Profile";
import { Exams } from "./components/Exams";
import { pages, photoFor } from "./images";
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
  ["tutorat", "Rendez-vous", GraduationCap],
  ["examens", "Examens", ClipboardList],
  ["ressources", "Ressources", Library],
  ["communaute", "Communauté", Users],
  ["evenements", "Rencontres", CalendarRange],
] as const;
const demoEnabled =
  import.meta.env.VITE_ENABLE_DEMO === "true" || import.meta.env.DEV;
function initialApi(): Gateway | null {
  if (demoEnabled && sessionStorage.getItem("parented-mode") === "demo")
    return new DemoGateway();
  if (configured) return new SupabaseGateway();
  return null;
}
function authHash() {
  return /[#&](access_token|error|type)=/.test(window.location.hash);
}
function currentPage() {
  if (authHash()) return "accueil";
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
  const [recovery, setRecovery] = useState(false);
  const [bell, setBell] = useState(false);
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
    const unsubscribe = api.onAuthEvent((event) => {
      if (event === "recovery" && live) setRecovery(true);
    });
    const params = new URLSearchParams(window.location.hash.slice(1));
    const urlError = params.get("error_description");
    api
      .session()
      .then(async (p) => {
        if (live) setProfile(p);
        if (p) {
          const d = await api.load();
          if (live) setData(d);
        }
        if (authHash()) {
          if (params.get("type") === "recovery" && live) setRecovery(true);
          history.replaceState(null, "", window.location.pathname + "#accueil");
          if (urlError && live)
            setError(
              "Ce lien n’est plus valide. Demandez un nouveau courriel depuis la page de connexion.",
            );
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
      unsubscribe();
    };
  }, [api]);
  useEffect(() => {
    const onHash = () => {
      window.scrollTo({ top: 0 });
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
      if (api) {
        const fresh = await api.load();
        setData(fresh);
        const me = fresh.profiles.find((p) => p.id === profile?.id);
        if (me) setProfile(me);
      }
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
  const signup = async (email: string, password: string, name: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (!api) throw new Error("Supabase n’est pas encore configuré.");
      const result = await api.signup(email, password, name);
      if (result === "confirm")
        setNotice(
          "Compte créé. Ouvrez le courriel de confirmation, puis connectez-vous.",
        );
      else {
        setProfile(result);
        setData(await api.load());
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const reset = async (email: string) => {
    setBusy(true);
    setError("");
    try {
      if (!api) throw new Error("Supabase n’est pas encore configuré.");
      await api.resetPassword(email);
      setNotice(
        "Si un compte existe pour ce courriel, un lien de réinitialisation vient d’être envoyé.",
      );
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
      setRecovery(false);
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
  if (!profile)
    return (
      <Login
        login={login}
        signup={signup}
        reset={reset}
        busy={busy}
        error={error}
        notice={notice}
      />
    );
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
        <span className="nav-label">
          {profile.role === "tutor" ? "ESPACE TUTEUR" : "MON ESPACE PARENT"}
        </span>
        <nav aria-label="Navigation principale" onClick={() => setMenu(false)}>
          {navigation.map(([id, label, Icon]) => (
            <a
              key={id}
              href={"#" + id}
              className={page === id ? "active" : ""}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={20} />
              {id === "tutorat" && profile.role === "tutor"
                ? "Mes séances"
                : label}
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
            <a href="#profil" className="profile-link" aria-label="Mon profil">
              <span className="avatar">{profile.display_name.slice(0, 1)}</span>
              <div>
                <strong>{profile.display_name}</strong>
                <small>
                  {profile.role === "admin"
                    ? "Administration"
                    : profile.role === "tutor"
                      ? "Tuteur partenaire"
                      : profile.city || "Compléter mon profil"}
                </small>
              </div>
            </a>
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
              {navigation.find((n) => n[0] === page)?.[1] ||
                (page === "profil" ? "Mon profil" : "Administration")}
            </strong>
          </span>
          <span className="topbar-right">
            <span className="topbar-tag">
              <span className="status-dot" />
              {api?.mode === "demo"
                ? "Démonstration · données fictives"
                : "Espace membre"}
            </span>
            {data && api && (
              <Notifications
                data={data}
                api={api}
                run={run}
                busy={busy}
                open={bell}
                setOpen={setBell}
              />
            )}
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
          {recovery && api && (
            <NewPassword
              busy={busy}
              onSubmit={(password) =>
                run(async () => {
                  await api.updatePassword(password);
                  setRecovery(false);
                }, "Mot de passe modifié. Vous êtes connecté.")
              }
              onCancel={() => setRecovery(false)}
            />
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
          ) : page === "tutorat" ? (
            <Tutoring {...props} />
          ) : page === "ressources" ? (
            <Resources {...props} />
          ) : page === "communaute" ? (
            <Community {...props} />
          ) : page === "evenements" ? (
            <Events {...props} />
          ) : page === "examens" ? (
            <Exams {...props} />
          ) : page === "profil" ? (
            <ProfilePage {...props} />
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
function Notifications({
  data,
  api,
  run,
  busy,
  open,
  setOpen,
}: {
  data: Data;
  api: Gateway;
  run: Run;
  busy: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const items = [...data.notifications].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const unread = items.filter((n) => !n.read_at);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, setOpen]);
  const openItem = async (id: string, link: string, read: boolean) => {
    setOpen(false);
    if (!read)
      await run(
        () =>
          api.patch("notifications", id, { read_at: new Date().toISOString() }),
        "Notification lue.",
      );
    if (link) window.location.hash = link.replace(/^#/, "");
  };
  return (
    <div className="bell-wrap">
      <button
        className="icon-button bell"
        aria-label={`Notifications${unread.length ? ` (${unread.length} non lues)` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Bell size={18} />
        {unread.length > 0 && <span className="badge">{unread.length}</span>}
      </button>
      {open && (
        <div className="bell-menu" role="dialog" aria-label="Notifications">
          <div className="section-heading">
            <h2>Notifications</h2>
            {unread.length > 0 && (
              <button
                className="text-button"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    for (const n of unread)
                      await api.patch("notifications", n.id, {
                        read_at: new Date().toISOString(),
                      });
                  }, "Tout est lu.")
                }
              >
                Tout marquer lu
              </button>
            )}
          </div>
          {!items.length && (
            <p className="small muted">
              Rien pour l’instant. Les réponses, messages et séances
              apparaîtront ici.
            </p>
          )}
          {items.slice(0, 12).map((n) => (
            <button
              key={n.id}
              className={`bell-item ${n.read_at ? "" : "unread"}`}
              onClick={() => openItem(n.id, n.link, Boolean(n.read_at))}
            >
              <span className="bell-icon">
                {n.kind === "message" ? (
                  <MessageSquare size={15} />
                ) : n.kind === "booking" || n.kind === "report" ? (
                  <GraduationCap size={15} />
                ) : n.kind === "event" ? (
                  <MapPin size={15} />
                ) : n.kind === "like" ? (
                  <Star size={15} />
                ) : (
                  <Users size={15} />
                )}
              </span>
              <span>
                <strong>{n.title}</strong>
                {n.body && <small>{n.body}</small>}
                <small className="muted">{timeAgo(n.created_at)}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function NewPassword({
  busy,
  onSubmit,
  onCancel,
}: {
  busy: boolean;
  onSubmit: (password: string) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);
  return (
    <form
      className="editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (password !== confirm) {
          setMismatch(true);
          return;
        }
        setMismatch(false);
        void onSubmit(password);
      }}
    >
      <div className="section-heading">
        <h2>Choisir un nouveau mot de passe</h2>
        <button type="button" className="text-button" onClick={onCancel}>
          Plus tard
        </button>
      </div>
      <div className="form-grid">
        <label>
          Nouveau mot de passe (12 caractères minimum)
          <input
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          Confirmer
          <input
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
      </div>
      {mismatch && (
        <p className="small danger">
          Les deux mots de passe ne correspondent pas.
        </p>
      )}
      <div className="form-actions">
        <button className="button primary" disabled={busy}>
          Enregistrer le mot de passe
        </button>
      </div>
    </form>
  );
}
function Login({
  login,
  signup,
  reset,
  busy,
  error,
  notice,
}: {
  login: (email: string, password: string, demo?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  reset: (email: string) => Promise<void>;
  busy: boolean;
  error: string;
  notice: string;
}) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "login") void login(email, password);
    else if (mode === "signup") void signup(email, password, name);
    else void reset(email);
  };
  return (
    <div className="login">
      <section className="login-story">
        <img src="/parented-logo.png" alt="parentEd" />
        <div>
          <span className="eyebrow">Pour les parents qui font apprendre</span>
          <h1>
            Un peu de repères.
            <br />
            Beaucoup de possibles.
          </h1>
          <p>
            Se former, organiser la semaine, trouver des ressources fiables, un
            soutien complémentaire et une communauté active. En un seul espace.
          </p>
          <img className="story-photo" src={pages.login} alt="" />
          <span className="story-caption">
            <Leaf size={18} /> Grandir ensemble, une découverte à la fois.
          </span>
        </div>
        <small>
          Les cours ParentEd s’adressent aux parents-éducateurs. ParentEd n’est
          ni une école ni une garantie de conformité gouvernementale.
        </small>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <span className="eyebrow">Votre espace parent</span>
          <h2>
            {mode === "signup"
              ? "Créer votre espace familial."
              : mode === "reset"
                ? "Retrouver l’accès à votre espace."
                : "Heureux de vous retrouver."}
          </h2>
          <p>
            {mode === "signup"
              ? "Un compte par parent; votre famille et vos documents restent privés."
              : mode === "reset"
                ? "Nous vous envoyons un lien pour choisir un nouveau mot de passe."
                : "Un petit pas aujourd’hui, de nouvelles idées pour demain."}
          </p>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              <Check size={17} /> {notice}
            </div>
          )}
          {configured ? (
            <form onSubmit={submit}>
              {mode === "signup" && (
                <label>
                  Votre prénom (affiché dans la communauté)
                  <input
                    autoComplete="given-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={80}
                  />
                </label>
              )}
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
              {mode !== "reset" && (
                <label>
                  Mot de passe
                  <input
                    type="password"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    minLength={mode === "signup" ? 12 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
              )}
              {mode === "signup" && (
                <p className="muted small">
                  12 caractères minimum. En créant un compte, vous acceptez que
                  ParentEd conserve votre courriel et vos données familiales
                  pour fournir le service.
                </p>
              )}
              <button className="button primary" disabled={busy}>
                {busy
                  ? "Un instant…"
                  : mode === "signup"
                    ? "Créer mon compte"
                    : mode === "reset"
                      ? "Envoyer le lien"
                      : "Me connecter"}
                <ArrowRight size={18} />
              </button>
              <div className="login-links">
                {mode !== "login" && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setMode("login")}
                  >
                    J’ai déjà un compte
                  </button>
                )}
                {mode !== "signup" && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setMode("signup")}
                  >
                    Créer un compte
                  </button>
                )}
                {mode !== "reset" && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setMode("reset")}
                  >
                    Mot de passe oublié
                  </button>
                )}
              </div>
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
              <span className="pill">Démonstration</span>
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
                  onClick={() => login("nadia@demo.parented.test", "", true)}
                >
                  Tutrice : Nadia
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
function Dashboard(props: Props) {
  const { data, profile, api } = props;
  if (profile.role === "admin") return <AdminDashboard {...props} />;
  const today = api.mode === "demo" ? "2026-09-07" : localDate();
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
  const published = data.events.filter((e) => e.published);
  const next = occurrences(published, today, shiftDate(today, 120));
  const featured =
    next.find((o) =>
      data.registrations.some((r) => r.event_id === o.event.id),
    ) ??
    next.find((o) => o.event.featured) ??
    next[0];
  const myTutor = data.tutors.find((t) => t.profile_id === profile.id);
  const session = data.bookings
    .filter((b) =>
      myTutor ? b.tutor_id === myTutor.id : b.family_id === profile.family_id,
    )
    .filter(
      (b) => ["demandée", "confirmée"].includes(b.status) && b.date >= today,
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const pendingForTutor = myTutor
    ? data.bookings.filter(
        (b) => b.tutor_id === myTutor.id && b.status === "demandée",
      ).length
    : 0;
  const unreadMessages = data.messages.filter(
    (m) => m.recipient_id === profile.id && !m.read_at,
  ).length;
  const nearby = data.members.filter(
    (m) =>
      m.city && m.city === profile.city && m.id !== profile.id && m.show_on_map,
  ).length;
  const children = data.children.length
    ? data.children.map((c) => c.name)
    : [
        ...new Set([
          ...data.tasks.map((t) => t.child),
          ...data.grades.map((g) => g.child),
        ]),
      ].filter((n) => n && n !== "Toute la famille");
  const firstName = profile.display_name.split(" ")[0];
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
            ? "Vos rendez-vous, vos comptes rendus et la vie de la communauté."
            : children.length
              ? `Voici où en ${children.length > 1 ? "sont" : "est"} ${children.join(" et ")} cette semaine.`
              : "Un espace pour apprendre, s’organiser et avancer ensemble."
        }
      />
      <section className="dashboard-grid">
        <div className="hero-card">
          <img className="hero-photo" src={pages.hero} alt="" />
          <div className="hero-content">
            <span className="hero-kicker">
              <span />
              {myTutor ? "Cette semaine" : "Votre semaine"}
            </span>
            <h2>
              {session
                ? `${session.subject} ${formatDate(session.date, { weekday: "long" })} à ${session.time}`
                : "À chacun son rythme."}
            </h2>
            <p>
              {session
                ? myTutor
                  ? `${session.child} · ${bookingStatus(session.status)}`
                  : `${session.child} avec ${data.tutors.find((t) => t.id === session.tutor_id)?.display_name ?? "votre tuteur"} · ${bookingStatus(session.status)}`
                : "Quelques repères pour une semaine plus sereine, et de la place pour l’imprévu."}
            </p>
            <a
              className="button white"
              href={myTutor ? "#tutorat" : "#semaine"}
            >
              {myTutor ? "Voir mes rendez-vous" : "Ouvrir ma semaine"}
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
        <div className="week-glance">
          <span className="eyebrow">En un coup d’œil</span>
          <h3>{myTutor ? "Vos rendez-vous" : "Où vous en êtes"}</h3>
          {myTutor ? (
            <div className="glance-row">
              <span className="glance-icon green">
                <GraduationCap size={21} />
              </span>
              <div>
                <strong>
                  {pendingForTutor} demande{pendingForTutor > 1 ? "s" : ""} à
                  confirmer
                </strong>
                <small>Dans votre espace</small>
              </div>
            </div>
          ) : (
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
                <small>
                  {course
                    ? `${done} % de « ${course.title} »`
                    : "Vos cours pour parents"}
                </small>
              </div>
            </div>
          )}
          <div className="glance-row">
            <span className="glance-icon sand">
              <MessageSquare size={21} />
            </span>
            <div>
              <strong>
                {unreadMessages
                  ? `${unreadMessages} message${unreadMessages > 1 ? "s" : ""} non lu${unreadMessages > 1 ? "s" : ""}`
                  : "Aucun message en attente"}
              </strong>
              <small>
                {data.notifications.filter((n) => !n.read_at).length}{" "}
                notification(s) non lue(s)
              </small>
            </div>
          </div>
          <div className="glance-row">
            <span className="glance-icon green">
              <MapPin size={21} />
            </span>
            <div>
              <strong>
                {profile.city
                  ? `${nearby} famille${nearby > 1 ? "s" : ""} près de ${profile.city}`
                  : "Ville non renseignée"}
              </strong>
              <small>
                {profile.city
                  ? "Sur la carte de la communauté"
                  : "Complétez votre profil pour trouver des familles"}
              </small>
            </div>
          </div>
          <a
            href={profile.city ? "#communaute/carte" : "#profil"}
            className="text-link"
          >
            {profile.city ? "Voir la carte" : "Compléter mon profil"}{" "}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      {!myTutor && children.length > 0 && (
        <>
          <div className="section-heading">
            <h2>
              Les progrès de {children.length > 1 ? "vos enfants" : children[0]}
            </h2>
            <a href="#semaine">
              Ma semaine <ArrowRight size={16} />
            </a>
          </div>
          <section className="children-progress">
            {children.map((name) => (
              <ChildProgress key={name} name={name} data={data} today={today} />
            ))}
          </section>
        </>
      )}
      <section className="dashboard-lower">
        <div>
          {course && (
            <a href={"#cours/" + course.id} className="continue-card">
              <div className="card-photo">
                <img
                  className="photo"
                  src={photoFor(
                    "course",
                    course.category + " " + course.title,
                    course.id,
                  )}
                  alt=""
                />
              </div>
              <div>
                <span className="pill">
                  {done ? "Cours en cours" : "Cours suggéré"}
                </span>
                <h3>{course.title}</h3>
                <p>
                  {lessons.length} leçons ·{" "}
                  {lessons.reduce((n, l) => n + l.minutes, 0)} minutes
                </p>
                <div className="progress-label">
                  <span>
                    {done ? "Votre progression" : "Pas encore commencé"}
                  </span>
                  <strong>{done} %</strong>
                </div>
                <progress value={done} max={100} />
              </div>
            </a>
          )}
          <div className="section-heading">
            <h2>Dans la communauté</h2>
            <a href="#communaute">
              Voir tout <ArrowRight size={16} />
            </a>
          </div>
          {[...data.posts]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 2)
            .map((p) => (
              <a
                href={"#communaute/" + p.id}
                className="community-preview"
                key={p.id}
              >
                <span className="avatar sand">{p.author[0]}</span>
                <div>
                  <small>
                    {p.author} <span>· {timeAgo(p.created_at)}</span>
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
            <h2>Prochaine rencontre</h2>
            <CalendarRange size={19} />
          </div>
          {featured ? (
            <a href="#evenements" className="event-preview">
              <div className="card-photo">
                <img
                  className="photo"
                  src={photoFor(
                    "event",
                    featured.event.title + " " + featured.event.description,
                    featured.event.id,
                  )}
                  alt=""
                />
              </div>
              <div>
                <span className="pill">
                  {data.registrations.some(
                    (r) => r.event_id === featured.event.id,
                  )
                    ? "Vous êtes inscrit"
                    : featured.event.featured
                      ? "À la une"
                      : "Suggestion"}
                </span>
                <h3>{featured.event.title}</h3>
                <p>
                  {formatDate(featured.date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  · {featured.event.time}
                </p>
              </div>
            </a>
          ) : (
            <Empty>Aucune rencontre à venir.</Empty>
          )}
          {data.notes.length + data.documents.length > 0 && (
            <a href="#semaine" className="horizon-item">
              <span className="pill">Dernière trace au portfolio</span>
              <h3>
                {
                  [
                    ...data.notes.map((n) => ({ t: n.title, d: n.date })),
                    ...data.documents.map((d) => ({
                      t: d.title,
                      d: d.created_at.slice(0, 10),
                    })),
                  ].sort((a, b) => b.d.localeCompare(a.d))[0]?.t
                }
              </h3>
              <p>
                {formatDate(
                  [
                    ...data.notes.map((n) => n.date),
                    ...data.documents.map((d) => d.created_at.slice(0, 10)),
                  ]
                    .sort()
                    .at(-1)!,
                )}
              </p>
            </a>
          )}
        </div>
      </section>
    </>
  );
}
function bookingStatus(s: string) {
  return s === "confirmée"
    ? "confirmé"
    : s === "demandée"
      ? "en attente de confirmation"
      : s;
}
function ChildProgress({
  name,
  data,
  today,
}: {
  name: string;
  data: Data;
  today: string;
}) {
  const items = data.curriculum_items.filter(
    (i) => data.curricula.find((c) => c.id === i.curriculum_id)?.child === name,
  );
  const doneItems = items.filter((i) => i.done).length;
  const grades = data.grades.filter((g) => g.child === name);
  const avg = grades.length
    ? Math.round(
        grades.reduce((n, g) => n + (g.score / g.max) * 100, 0) / grades.length,
      )
    : null;
  const recent = [...grades]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const trend =
    recent.length >= 2
      ? Math.round(
          (recent[0].score / recent[0].max -
            recent[recent.length - 1].score / recent[recent.length - 1].max) *
            100,
        )
      : null;
  const nextItem = items
    .filter((i) => !i.done && i.planned_date && i.planned_date >= today)
    .sort((a, b) => a.planned_date!.localeCompare(b.planned_date!))[0];
  const session = data.bookings
    .filter(
      (b) =>
        b.child === name &&
        ["demandée", "confirmée"].includes(b.status) &&
        b.date >= today,
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const traces =
    data.notes.filter((n) => n.child === name).length +
    data.documents.filter((d) => d.child === name).length;
  const child = data.children.find((c) => c.name === name);
  return (
    <article className="child-progress">
      <header>
        <span className="avatar">{name[0]}</span>
        <div>
          <h3>{name}</h3>
          <small>
            {child?.birth_year
              ? `${new Date(today).getFullYear() - child.birth_year} ans · `
              : ""}
            {traces} trace{traces > 1 ? "s" : ""} au portfolio
          </small>
        </div>
      </header>
      <div className="metric">
        <span>
          Programme couvert{" "}
          <strong>
            {items.length
              ? `${Math.round((doneItems / items.length) * 100)} %`
              : "aucun programme"}
          </strong>
        </span>
        <progress value={doneItems} max={items.length || 1} />
      </div>
      <div className="metric">
        <span>
          Moyenne des résultats{" "}
          <strong>
            {avg === null ? "pas encore de note" : `${avg} %`}
            {trend !== null && trend !== 0 && (
              <span className={trend > 0 ? "up" : "down"}>
                {" "}
                {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}
              </span>
            )}
          </strong>
        </span>
        <progress value={avg ?? 0} max={100} />
      </div>
      <div className="next">
        {nextItem ? (
          <>
            Prochaine notion : <strong>{nextItem.title}</strong>
            <small>
              {nextItem.subject} · {formatDate(nextItem.planned_date!)}
            </small>
          </>
        ) : session ? (
          <>
            Prochaine séance : <strong>{session.subject}</strong>
            <small>
              {formatDate(session.date)} · {session.time}
            </small>
          </>
        ) : (
          <>
            Rien de planifié cette semaine
            <small>
              Ajoutez un programme ou une activité dans « Ma semaine ».
            </small>
          </>
        )}
      </div>
    </article>
  );
}
function AdminDashboard({ data, profile, api }: Props) {
  const today = api.mode === "demo" ? "2026-09-07" : localDate();
  const monthStart = today.slice(0, 7) + "-01";
  const stat = (n: number, label: string, link: string, alert = false) => (
    <div
      className={`stat-tile ${alert && n > 0 ? "alert-tile" : ""}`}
      key={label}
    >
      <strong>{n}</strong>
      <small>{label}</small>
      <a href={link}>{alert && n > 0 ? "À traiter" : "Voir"}</a>
    </div>
  );
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
      <section className="admin-stats">
        {stat(data.reports.length, "signalements", "#admin", true)}
        {stat(proposals, "rencontres à vérifier", "#admin", true)}
        {stat(questions, "questions sans réponse", "#admin", true)}
        {stat(
          data.tutors.filter((t) => !t.published).length,
          "profils d’intervenants à publier",
          "#admin",
          true,
        )}
        {stat(parents.length, "familles membres", "#communaute/membres")}
        {stat(withProfile, "profils complétés", "#communaute/membres")}
        {stat(
          data.group_members.length,
          "adhésions à des groupes",
          "#communaute",
        )}
        {stat(data.posts.length, "discussions", "#communaute")}
        {stat(data.replies.length, "réponses", "#communaute")}
        {stat(
          data.registrations.reduce((n) => n + 1, 0),
          "inscriptions aux rencontres",
          "#evenements",
        )}
        {stat(bookingsMonth, "rendez-vous ce mois-ci", "#admin")}
        {stat(attemptsMonth, "examens passés ce mois-ci", "#examens")}
        {stat(
          data.courses.filter((c) => c.published).length,
          "cours publiés",
          "#admin",
        )}
        {stat(
          data.exams.filter((e) => e.published).length,
          "examens publiés",
          "#admin",
        )}
      </section>
      <section className="dashboard-lower">
        <div>
          <div className="section-heading">
            <h2>Dernières discussions</h2>
            <a href="#communaute">
              Modérer <ArrowRight size={16} />
            </a>
          </div>
          {[...data.posts]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 4)
            .map((p) => (
              <a
                href={"#communaute/" + p.id}
                className="community-preview"
                key={p.id}
              >
                <span className="avatar sand">{p.author[0]}</span>
                <div>
                  <small>
                    {p.author} <span>· {timeAgo(p.created_at)}</span>
                  </small>
                  <h3>{p.title}</h3>
                  <p>{p.body.slice(0, 100)}…</p>
                </div>
                <ChevronRight size={20} />
              </a>
            ))}
        </div>
        <div className="upcoming">
          <div className="section-heading">
            <h2>Familles par ville</h2>
            <MapPin size={19} />
          </div>
          <div className="stat-tile">
            {cities.length ? (
              cities.slice(0, 8).map(([city, n]) => (
                <div className="metric" key={city}>
                  <span>
                    {city} <strong>{n}</strong>
                  </span>
                  <progress value={n} max={cities[0][1]} />
                </div>
              ))
            ) : (
              <small className="muted">Aucune ville renseignée.</small>
            )}
          </div>
          <div className="section-heading">
            <h2>Prochaines rencontres</h2>
          </div>
          {occurrences(
            data.events.filter((e) => e.published),
            today,
            shiftDate(today, 60),
          )
            .slice(0, 3)
            .map((o) => (
              <a href="#evenements" className="horizon-item" key={o.key}>
                <span className="pill">
                  {data.event_counts.find((c) => c.event_id === o.event.id)
                    ?.count ?? 0}{" "}
                  inscription(s)
                </span>
                <h3>{o.event.title}</h3>
                <p>
                  {formatDate(o.date)} · {o.event.time}
                </p>
              </a>
            ))}
        </div>
      </section>
    </>
  );
}
