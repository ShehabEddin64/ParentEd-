import { useEffect, useState, useRef } from "react";
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
  GraduationCap,
  Star,
  Bell,
  MessageSquare,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { timeAgo, type Data, type Profile } from "./domain";
import type { Gateway } from "./data/gateway";
import { DemoGateway } from "./data/demo";
import { Empty } from "./components/ui";
import { Courses } from "./components/Courses";
import { Family } from "./components/Family";
import { Events, Resources } from "./components/Social";
import { Community } from "./components/Community";
import { Tutoring } from "./components/Tutoring";
import { Profile as ProfilePage } from "./components/Profile";
import { Exams } from "./components/Exams";
import { Dashboard } from "./components/Dashboard";
import { Assistant } from "./components/Assistant";
import { Legal } from "./components/Legal";
import { Landing } from "./components/Landing";
import { legalLinks } from "./legal";
import { pages } from "./images";
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
const demoEnabled = true;
function initialApi(): Gateway | null {
  if (demoEnabled && sessionStorage.getItem("parented-mode") === "demo")
    return new DemoGateway();
  return null;
}
function authHash() {
  return /[#&](access_token|error|type)=/.test(window.location.hash);
}
function currentPage() {
  if (authHash()) return "accueil";
  return window.location.hash.slice(1).split("/")[0] || "accueil";
}
function legalSlug() {
  const [page, slug = ""] = window.location.hash.slice(1).split("/");
  return page === "legal" ? slug || "confidentialite" : "";
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
      if (!provider) throw new Error("Choisissez un profil de démonstration.");
      const p = await provider.login(email, password);
      const d = await provider.load();
      if (demo) sessionStorage.setItem("parented-mode", "demo");
      setApi(provider);
      setProfile(p);
      setData(d);
      window.location.hash = "accueil";
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
      if (api.mode === "demo") setApi(null);
      window.location.hash = "";
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
  if (page === "legal")
    return (
      <div className="legal-page">
        <a className="brand" href={profile ? "#accueil" : "#"}>
          <img src="/parented-logo.png" alt="parentEd" />
        </a>
        <Legal slug={legalSlug()} back={profile ? "#accueil" : "#"} />
      </div>
    );
  if (!profile && page !== "connexion") return <Landing />;
  if (!profile)
    return <Login login={login} busy={busy} error={error} notice={notice} />;
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
        {props && <Assistant {...props} />}
        <footer>
          parentEd <span>À votre rythme. Ensemble.</span>
          <nav className="footer-links" aria-label="Mentions légales">
            {legalLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
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
function Login({
  login,
  busy,
  error,
  notice,
}: {
  login: (email: string, password: string, demo?: boolean) => Promise<void>;
  busy: boolean;
  error: string;
  notice: string;
}) {
  return (
    <div className="login">
      <section className="login-story">
        <a href="#" aria-label="Retour à l’accueil">
          <img src="/parented-logo.png" alt="parentEd" />
        </a>
        <div>
          <span className="eyebrow">Muslim Hacks · Montréal</span>
          <h1>
            Apprendre en famille.
            <br />
            Un projet de hackathon.
          </h1>
          <p>
            Explorez ParentEd avec une famille fictive : cours, organisation,
            communauté et rencontres.
          </p>
          <img className="story-photo" src={pages.login} alt="" />
          <span className="story-caption">
            <Leaf size={18} />
            Une démonstration, à votre rythme.
          </span>
        </div>
        <small>
          Aucun compte, abonnement ou paiement. N’utilisez aucune donnée
          personnelle.
        </small>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <span className="eyebrow">Prototype de hackathon</span>
          <h2>Choisissez un profil fictif.</h2>
          <p>
            Les essais sont sauvegardés uniquement dans ce navigateur. Il ne
            s’agit pas d’une connexion sécurisée.
          </p>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          {notice && <div role="status">{notice}</div>}
          <div className="demo-choice">
            <span className="pill">Démonstration locale</span>
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
          <nav className="footer-links" aria-label="À propos de la démo">
            {legalLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
