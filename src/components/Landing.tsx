import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Check,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Youtube,
} from "lucide-react";
import { legalLinks } from "../legal";
import type { LeadInput } from "../data/gateway";
import { landingText, loadLang, saveLang, type Lang } from "../landing-text";
type Props = {
  submitLead: (lead: LeadInput) => Promise<void>;
  demoEnabled: boolean;
  mode: "supabase" | "demo" | "none";
};
const floaters = [
  {
    left: "10%",
    top: "30%",
    size: 34,
    delay: "-2s",
    duration: "13s",
    kind: "leaf",
  },
  {
    left: "28%",
    top: "22%",
    size: 44,
    delay: "-8s",
    duration: "17s",
    kind: "plane",
  },
  {
    left: "50%",
    top: "18%",
    size: 26,
    delay: "-5s",
    duration: "12s",
    kind: "star",
  },
  {
    left: "66%",
    top: "26%",
    size: 36,
    delay: "-10s",
    duration: "18s",
    kind: "leaf",
  },
  {
    left: "84%",
    top: "20%",
    size: 40,
    delay: "-7s",
    duration: "16s",
    kind: "plane",
  },
] as const;
/** Simple stylised children and a parent, drawn with basic shapes (no photos of real children on the public page). */
function Kid({
  pose,
  color,
  className,
}: {
  pose: "kite" | "read" | "teach" | "jump" | "ball";
  color: string;
  className?: string;
}) {
  const skin = "#f1c9a5";
  const hair = "#2b2118";
  const pants = "#274c9a";
  if (pose === "kite")
    return (
      <svg
        className={`kid ${className ?? ""}`}
        viewBox="0 0 160 190"
        aria-hidden="true"
      >
        <path
          d="M104 14 L138 0 L146 44 L112 52 Z"
          fill="#ffd166"
          stroke="#e29a2c"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M108 48 C100 78 86 98 68 118"
          fill="none"
          stroke="#e29a2c"
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />
        <path
          d="M124 52 q8 10 -2 18 q-8 8 2 16"
          fill="none"
          stroke="#ff7a3d"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="56" cy="88" r="17" fill={skin} />
        <path
          d="M39 84 q17 -22 36 -3 q-4 -13 -19 -13 q-15 0 -17 16z"
          fill={hair}
        />
        <path d="M48 105 h18 l8 36 h-32 z" fill={color} />
        <path
          d="M66 112 l14 -16"
          stroke={skin}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M48 114 l-13 -10"
          stroke={skin}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M50 141 l-10 32"
          stroke={pants}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M68 141 l12 30"
          stroke={pants}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <ellipse cx="38" cy="178" rx="10" ry="5" fill={hair} />
        <ellipse cx="82" cy="176" rx="10" ry="5" fill={hair} />
      </svg>
    );
  if (pose === "read")
    return (
      <svg
        className={`kid ${className ?? ""}`}
        viewBox="0 0 160 180"
        aria-hidden="true"
      >
        <circle cx="80" cy="66" r="17" fill="#c98b5a" />
        <path
          d="M63 62 q17 -24 36 -5 q-2 -14 -19 -14 q-17 0 -17 19z"
          fill={hair}
        />
        <path d="M62 84 h36 l10 38 h-56 z" fill={color} />
        <path d="M44 126 h72 v12 h-72z" fill={pants} />
        <path
          d="M52 106 l-10 12 h76 l-10 -12z"
          fill="#fff"
          stroke="#c9d3e8"
          strokeWidth="2.5"
        />
        <path d="M80 106 v26" stroke="#c9d3e8" strokeWidth="2.5" />
        <path
          d="M44 138 l-8 26"
          stroke={pants}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M116 138 l8 26"
          stroke={pants}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <ellipse cx="34" cy="168" rx="10" ry="5" fill={hair} />
        <ellipse cx="126" cy="168" rx="10" ry="5" fill={hair} />
      </svg>
    );
  if (pose === "teach")
    return (
      <svg
        className={`kid ${className ?? ""}`}
        viewBox="0 0 260 200"
        aria-hidden="true"
      >
        <rect x="140" y="18" width="110" height="78" rx="8" fill="#1d4ed8" />
        <path
          d="M156 42 h36 M156 58 h62 M156 74 h28"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle
          cx="216"
          cy="74"
          r="10"
          fill="none"
          stroke="#7ed37a"
          strokeWidth="4"
        />
        <circle cx="70" cy="58" r="19" fill={skin} />
        <path
          d="M51 52 q19 -26 40 -5 q0 -16 -19 -19 q-21 0 -21 24z"
          fill={hair}
        />
        <path d="M54 80 h32 l12 52 h-56z" fill={color} />
        <path
          d="M86 90 l46 -30"
          stroke={skin}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M54 96 l-14 20"
          stroke={skin}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M58 132 l-4 48"
          stroke={pants}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M84 132 l8 48"
          stroke={pants}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <circle cx="142" cy="136" r="12" fill="#c98b5a" />
        <path
          d="M130 132 q12 -16 24 -2 q0 -10 -12 -10 q-12 0 -12 12z"
          fill={hair}
        />
        <path d="M132 150 h20 l4 26 h-28z" fill="#ff7a3d" />
        <path
          d="M152 154 l10 -12"
          stroke="#c98b5a"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M136 176 l-2 16 M148 176 l2 16"
          stroke={pants}
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    );
  if (pose === "ball")
    return (
      <svg
        className={`kid ${className ?? ""}`}
        viewBox="0 0 170 190"
        aria-hidden="true"
      >
        <circle cx="128" cy="150" r="20" fill="#ff7a3d" />
        <path
          d="M110 143 q18 -6 36 0 M110 157 q18 6 36 0 M128 130 v40"
          stroke="#fff"
          strokeWidth="3"
          fill="none"
        />
        <circle cx="62" cy="56" r="17" fill="#8d5a3a" />
        <path
          d="M45 52 q17 -24 36 -4 q-2 -14 -19 -14 q-17 0 -17 18z"
          fill={hair}
        />
        <path d="M52 74 h22 l8 36 h-36z" fill={color} />
        <path
          d="M74 84 l20 -6"
          stroke="#8d5a3a"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M52 86 l-14 12"
          stroke="#8d5a3a"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M56 110 l-12 30"
          stroke={pants}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M74 110 l30 22"
          stroke={pants}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <ellipse cx="42" cy="146" rx="10" ry="5" fill={hair} />
      </svg>
    );
  return (
    <svg
      className={`kid ${className ?? ""}`}
      viewBox="0 0 160 180"
      aria-hidden="true"
    >
      <circle cx="80" cy="54" r="17" fill="#8d5a3a" />
      <path
        d="M63 50 q17 -24 36 -3 q-2 -14 -19 -14 q-17 0 -17 17z"
        fill={hair}
      />
      <path d="M66 72 h28 l6 36 h-40 z" fill={color} />
      <path
        d="M66 80 l-22 -22"
        stroke="#8d5a3a"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M94 80 l22 -22"
        stroke="#8d5a3a"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M70 108 l-16 26"
        stroke={pants}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M90 108 l16 26"
        stroke={pants}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="34" cy="30" r="6" fill="#ffd166" />
      <circle cx="128" cy="26" r="5" fill="#ff7a3d" />
      <path
        d="M116 46 l8 -8 M120 54 l10 -2"
        stroke="#7ed37a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            el.classList.add("in");
            io.disconnect();
          }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
export function Landing({ submitLead, demoEnabled, mode }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const move = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty(
        "--mx",
        ((e.clientX - r.left) / r.width - 0.5).toFixed(3),
      );
      hero.style.setProperty(
        "--my",
        ((e.clientY - r.top) / r.height - 0.5).toFixed(3),
      );
    };
    const reset = () => {
      hero.style.setProperty("--mx", "0");
      hero.style.setProperty("--my", "0");
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", reset);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
    };
  }, []);
  const [lang, setLang] = useState<Lang>(loadLang);
  const t = landingText[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    saveLang(lang);
  }, [lang]);
  const tools = t.tools.items;
  const [open, setOpen] = useState(0);
  const [tool, setTool] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setTool((x) => (x + 1) % tools.length), 6000);
    return () => clearInterval(t);
  }, [tools.length]);
  return (
    <div className="landing">
      <header className="landing-nav">
        <a href="#" className="landing-brand">
          <img src="/parented-logo.png" alt="parentEd" />
        </a>
        <nav aria-label="Sections">
          <a href="#probleme">{t.nav.problem}</a>
          <a href="#solution">{t.nav.solution}</a>
          <a href="#outils">{t.nav.tools}</a>
          <a href="#offre">{t.nav.offer}</a>
          <a href="#faq">{t.nav.faq}</a>
        </nav>
        <div className="landing-nav-actions">
          <div
            className="lang-switch"
            role="group"
            aria-label="Langue / Language"
          >
            <button
              className={lang === "fr" ? "active" : ""}
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
            >
              FR
            </button>
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
          <a href="#connexion" className="text-link">
            {t.nav.login}
          </a>
          <a href="#appel" className="button pop">
            {t.nav.call}
          </a>
        </div>
      </header>
      <section
        className="hero-scene"
        ref={heroRef}
        aria-label="ParentEd, l'école à la maison sans être seul"
      >
        <div className="hero-copy">
          <h1>
            {t.hero.title} <span>{t.hero.accent}</span>
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-actions">
            <a href="#appel" className="button pop big">
              {t.hero.cta} <ArrowRight size={18} />
            </a>
            <a href="#connexion" className="button ghost big">
              {demoEnabled ? t.hero.demo : t.hero.login}
            </a>
          </div>
          <p className="hero-trust">{t.hero.trust}</p>
        </div>
        <div className="scene" aria-hidden="true">
          <svg className="birds" viewBox="0 0 180 80">
            <g className="bird b1">
              <path
                d="M9 38C15 31 22 31 29 37C36 30 44 29 52 36"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g className="bird b2">
              <path
                d="M72 56C77 51 82 51 87 55C92 50 97 50 102 54"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <g className="bird b3">
              <path
                d="M125 26C130 20 136 20 141 25C146 20 152 20 157 24"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
          <div className="mist m1" />
          <div className="mist m2" />
          <div className="hill back" />
          <div className="hill middle" />
          <div className="kids back">
            <Kid pose="read" color="#1d4ed8" className="k-read" />
            <Kid pose="ball" color="#7ed37a" className="k-ball" />
          </div>
          <div className="hill front" />
          <div className="kids">
            <Kid pose="kite" color="#ff7a3d" className="k-kite" />
            <Kid pose="jump" color="#ffd166" className="k-jump" />
            <Kid pose="teach" color="#7ed37a" className="k-teach" />
          </div>
          <div className="floaters">
            {floaters.map((f, i) => (
              <span
                key={i}
                className={`floater ${f.kind}`}
                style={
                  {
                    "--fl": f.left,
                    "--ft": f.top,
                    "--fs": `${f.size}px`,
                    "--fd": f.delay,
                    "--fu": f.duration,
                  } as React.CSSProperties
                }
              >
                <i />
              </span>
            ))}
          </div>
        </div>
      </section>
      <section id="probleme" className="landing-section problem">
        <Reveal>
          <h2>{t.problem.title}</h2>
          <p className="section-lead">
            Cinq difficultés que les familles nous décrivent, encore et encore.
          </p>
        </Reveal>
        <div className="plain-grid">
          {t.problem.items.map(([title, text]) => (
            <Reveal key={title} className="plain-item">
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="solution" className="landing-section solution">
        <Reveal>
          <h2>{t.solution.title}</h2>
        </Reveal>
        <div className="plain-grid three">
          {t.solution.items.map(([title, text]) => (
            <Reveal key={title} className="plain-item check">
              <Check size={20} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="outils" className="landing-section tools">
        <Reveal>
          <h2>{t.tools.title}</h2>
          <p className="section-lead">{t.tools.lead}</p>
        </Reveal>
        <Reveal>
          <div
            className="tool-tabs"
            role="tablist"
            aria-label="Outils de la plateforme"
          >
            {tools.map(([key, label], i) => (
              <button
                key={key}
                role="tab"
                aria-selected={tool === i}
                className={tool === i ? "active" : ""}
                onClick={() => setTool(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="device">
            <div className="device-bar">
              <span />
              <span />
              <span />
              <em>parented.parented.workers.dev</em>
            </div>
            {tools.map(([key], i) => (
              <img
                key={key}
                src={`/images/app-${key}.jpg`}
                alt={`${t.tools.alt} ${tools[i][1]}`}
                className={tool === i ? "show" : ""}
                loading="eager"
              />
            ))}
          </div>
          <p className="tool-caption">{tools[tool][2]}</p>
        </Reveal>
      </section>
      <section id="offre" className="landing-section offer">
        <Reveal>
          <h2>{t.offer.title}</h2>
        </Reveal>
        <div className="offer-grid">
          <Reveal className="offer-stack">
            <h3>{t.offer.stackTitle}</h3>
            <ul>
              {t.offer.stack.map(([item, value]) => (
                <li key={item}>
                  <Check size={18} />
                  <span>{item}</span>
                  <em>{value}</em>
                </li>
              ))}
            </ul>
            <div className="offer-total">
              <span>{t.offer.totalLabel}</span>
              <strong>{t.offer.total}</strong>
            </div>
            <div className="offer-bonus">
              <strong>{t.offer.bonusTitle}</strong>
              <p>{t.offer.bonus}</p>
            </div>
          </Reveal>
          <Reveal className="price-card">
            <p className="price-label">{t.offer.priceLabel}</p>
            <div className="price">
              <strong>{t.offer.price}</strong>
              <span>{t.offer.per}</span>
            </div>
            <p className="price-cheaper">{t.offer.cheaper}</p>
            <ul>
              {t.offer.includes.map((x) => (
                <li key={x}>
                  <Check size={16} /> {x}
                </li>
              ))}
            </ul>
            <a href="#appel" className="button pop big">
              {t.offer.cta} <ArrowRight size={18} />
            </a>
            <p className="price-guarantee">{t.offer.guarantee}</p>
          </Reveal>
        </div>
      </section>
      <section id="faq" className="landing-section faq">
        <Reveal>
          <h2>{t.faq.title}</h2>
        </Reveal>
        <div className="faq-list">
          {t.faq.items.map(([q, a], i) => (
            <Reveal key={q}>
              <button
                className={`faq-item ${open === i ? "open" : ""}`}
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span>{q}</span>
                <ArrowRight size={22} />
              </button>
              {open === i && <p className="faq-answer">{a}</p>}
            </Reveal>
          ))}
        </div>
      </section>
      <section id="appel" className="landing-section contact">
        <Reveal>
          <h2>{t.contact.title}</h2>
          <p className="section-lead">{t.contact.lead}</p>
        </Reveal>
        <Reveal>
          <LeadForm submitLead={submitLead} mode={mode} t={t.contact} />
        </Reveal>
      </section>
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/parented-logo.png" alt="parentEd" />
            <p>{t.footer.tagline}</p>
            <div className="social">
              <a
                href="#"
                aria-label="Instagram"
                onClick={(e) => e.preventDefault()}
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                onClick={(e) => e.preventDefault()}
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                onClick={(e) => e.preventDefault()}
              >
                <Youtube size={18} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                onClick={(e) => e.preventDefault()}
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4>{t.footer.product}</h4>
            <a href="#probleme">{t.nav.problem}</a>
            <a href="#solution">{t.nav.solution}</a>
            <a href="#outils">{t.nav.tools}</a>
            <a href="#offre">{t.nav.offer}</a>
            <a href="#faq">{t.footer.faq}</a>
          </div>
          <div>
            <h4>{t.footer.member}</h4>
            <a href="#connexion">{t.footer.login}</a>
            <a href="#connexion">{t.footer.signup}</a>
            {demoEnabled && <a href="#connexion">{t.footer.demo}</a>}
            <a href="#appel">{t.footer.call}</a>
          </div>
          <div>
            <h4>{t.footer.legal}</h4>
            {legalLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <h4>{t.footer.contact}</h4>
            <a href="#appel">
              <Phone size={14} /> {t.footer.call}
            </a>
            <a href="#appel">
              <Mail size={14} /> {t.footer.write}
            </a>
            <p className="footer-note">{t.footer.place}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} ParentEd. Tous droits réservés.
          </span>
          <span>
            ParentEd n'est ni une école ni un service de garde. Les sources
            officielles du ministère de l'Éducation font foi.
          </span>
        </div>
      </footer>
    </div>
  );
}
function LeadForm({
  submitLead,
  mode,
  t,
}: {
  submitLead: (lead: LeadInput) => Promise<void>;
  mode: Props["mode"];
  t: (typeof landingText)["fr"]["contact"];
}) {
  const [kind, setKind] = useState<"appel" | "liste">("appel");
  const [state, setState] = useState<{
    busy: boolean;
    done: boolean;
    error: string;
  }>({ busy: false, done: false, error: "" });
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (String(f.get("website") || "")) return;
    setState({ busy: true, done: false, error: "" });
    try {
      await submitLead({
        kind,
        name: String(f.get("name") || "")
          .trim()
          .slice(0, 120),
        email: String(f.get("email") || "")
          .trim()
          .slice(0, 200),
        message: String(f.get("message") || "")
          .trim()
          .slice(0, 2000),
        preferred: String(f.get("preferred") || "")
          .trim()
          .slice(0, 120),
      });
      setState({ busy: false, done: true, error: "" });
    } catch (err) {
      setState({ busy: false, done: false, error: (err as Error).message });
    }
  };
  if (state.done)
    return (
      <div className="lead-form done">
        <span className="done-mark">
          <Check size={26} />
        </span>
        <h3>{kind === "appel" ? t.doneCall : t.doneList}</h3>
        <p>{kind === "appel" ? t.doneCallText : t.doneListText}</p>
        {mode !== "supabase" && (
          <small className="muted">
            {mode === "none" ? t.noneNote : t.demoNote}
          </small>
        )}
      </div>
    );
  return (
    <form className="lead-form" onSubmit={submit}>
      <div className="tabs">
        <button
          type="button"
          className={kind === "appel" ? "active" : ""}
          onClick={() => setKind("appel")}
        >
          {t.tabCall}
        </button>
        <button
          type="button"
          className={kind === "liste" ? "active" : ""}
          onClick={() => setKind("liste")}
        >
          {t.tabList}
        </button>
      </div>
      {state.error && (
        <div className="alert" role="alert">
          {state.error}
        </div>
      )}
      <div className="form-grid">
        <label>
          {t.name}
          <input
            name="name"
            maxLength={120}
            required
            placeholder={t.namePh}
            autoComplete="given-name"
          />
        </label>
        <label>
          {t.email}
          <input
            name="email"
            type="email"
            maxLength={200}
            required
            placeholder="vous@exemple.ca"
            autoComplete="email"
          />
        </label>
        {kind === "appel" && (
          <>
            <label className="span-2">
              {t.preferred}
              <input
                name="preferred"
                maxLength={120}
                placeholder={t.preferredPh}
              />
            </label>
            <label className="span-2">
              {t.message}
              <textarea
                name="message"
                maxLength={2000}
                placeholder={t.messagePh}
                rows={3}
              />
            </label>
          </>
        )}
      </div>
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hp"
        aria-hidden="true"
      />
      <button className="button pop big" disabled={state.busy}>
        {state.busy ? t.sending : kind === "appel" ? t.sendCall : t.sendList}{" "}
        <ArrowRight size={18} />
      </button>
      <small className="muted">
        {t.consent} <a href="#legal/confidentialite">{t.consentLink}</a>
        {t.consentEnd}
      </small>
    </form>
  );
}
