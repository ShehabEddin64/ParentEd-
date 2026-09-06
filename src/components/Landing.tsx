import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardList,
  GraduationCap,
  Library,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { pages, photoFor } from "../images";
import { legalLinks } from "../legal";
import type { LeadInput } from "../data/gateway";
type Props = {
  submitLead: (lead: LeadInput) => Promise<void>;
  demoEnabled: boolean;
  mode: "supabase" | "demo" | "none";
};
const floaters = [
  {
    left: "12%",
    top: "38%",
    size: 30,
    delay: "-2s",
    duration: "13s",
    kind: "leaf",
  },
  {
    left: "30%",
    top: "58%",
    size: 40,
    delay: "-8s",
    duration: "17s",
    kind: "plane",
  },
  {
    left: "47%",
    top: "44%",
    size: 22,
    delay: "-5s",
    duration: "12s",
    kind: "leaf",
  },
  {
    left: "62%",
    top: "56%",
    size: 34,
    delay: "-10s",
    duration: "18s",
    kind: "star",
  },
  {
    left: "76%",
    top: "42%",
    size: 26,
    delay: "-3s",
    duration: "14s",
    kind: "leaf",
  },
  {
    left: "88%",
    top: "60%",
    size: 36,
    delay: "-7s",
    duration: "16s",
    kind: "plane",
  },
] as const;
/** Small stylised children drawn with basic shapes: no photos of real kids on the public page. */
function Kid({
  pose,
  color,
  hair = "#2b2118",
  className,
}: {
  pose: "kite" | "read" | "teach" | "jump";
  color: string;
  hair?: string;
  className?: string;
}) {
  if (pose === "kite")
    return (
      <svg
        className={`kid ${className ?? ""}`}
        viewBox="0 0 140 160"
        aria-hidden="true"
      >
        <path
          d="M92 18 L118 6 L124 40 L98 46 Z"
          fill="#ffd166"
          stroke="#e29a2c"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M96 42 C90 66 80 84 64 104"
          fill="none"
          stroke="#e29a2c"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M108 46 q6 8 -2 14 q-6 6 2 12"
          fill="none"
          stroke="#ff7a3d"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="52" cy="76" r="14" fill="#f4c7a6" />
        <path
          d="M38 72 q14 -18 30 -2 q-4 -10 -16 -10 q-12 0 -14 12z"
          fill={hair}
        />
        <path d="M46 90 h14 l6 30 h-26 z" fill={color} />
        <path
          d="M60 96 l10 -12"
          stroke="#f4c7a6"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M46 98 l-10 -8"
          stroke="#f4c7a6"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M46 120 l-8 26"
          stroke="#274c9a"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M62 120 l10 24"
          stroke="#274c9a"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <ellipse cx="36" cy="150" rx="8" ry="4" fill="#2b2118" />
        <ellipse cx="74" cy="148" rx="8" ry="4" fill="#2b2118" />
      </svg>
    );
  if (pose === "read")
    return (
      <svg
        className={`kid ${className ?? ""}`}
        viewBox="0 0 140 160"
        aria-hidden="true"
      >
        <circle cx="70" cy="62" r="14" fill="#c98b5a" />
        <path
          d="M56 58 q14 -20 30 -4 q-2 -12 -16 -12 q-14 0 -14 16z"
          fill={hair}
        />
        <path d="M54 76 h32 l8 32 h-48 z" fill={color} />
        <path d="M40 112 h60 v10 h-60z" fill="#274c9a" />
        <path
          d="M46 96 l-8 10 h64 l-8 -10z"
          fill="#fff"
          stroke="#c9d3e8"
          strokeWidth="2"
        />
        <path d="M70 96 v22" stroke="#c9d3e8" strokeWidth="2" />
        <path
          d="M40 122 l-6 22"
          stroke="#274c9a"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M100 122 l6 22"
          stroke="#274c9a"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <ellipse cx="32" cy="148" rx="8" ry="4" fill="#2b2118" />
        <ellipse cx="108" cy="148" rx="8" ry="4" fill="#2b2118" />
      </svg>
    );
  if (pose === "teach")
    return (
      <svg
        className={`kid ${className ?? ""}`}
        viewBox="0 0 220 170"
        aria-hidden="true"
      >
        <rect
          x="120"
          y="20"
          width="90"
          height="64"
          rx="6"
          fill="#1d4ed8"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <path
          d="M134 40 h30 M134 52 h50 M134 64 h22"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx="180"
          cy="66"
          r="9"
          fill="none"
          stroke="#7ed37a"
          strokeWidth="3"
        />
        <circle cx="60" cy="52" r="16" fill="#f4c7a6" />
        <path
          d="M44 46 q16 -22 34 -4 q0 -14 -16 -16 q-18 0 -18 20z"
          fill={hair}
        />
        <path d="M46 70 h28 l10 44 h-48z" fill={color} />
        <path
          d="M74 80 l40 -26"
          stroke="#f4c7a6"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M46 84 l-12 18"
          stroke="#f4c7a6"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M50 114 l-4 40"
          stroke="#274c9a"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M72 114 l6 40"
          stroke="#274c9a"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <circle cx="120" cy="118" r="10" fill="#c98b5a" />
        <path
          d="M110 114 q10 -14 20 -2 q0 -8 -10 -8 q-10 0 -10 10z"
          fill="#2b2118"
        />
        <path d="M112 128 h16 l4 22 h-24z" fill="#ff7a3d" />
        <path
          d="M128 132 l8 -10"
          stroke="#c98b5a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M116 150 l-2 14 M126 150 l2 14"
          stroke="#274c9a"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    );
  return (
    <svg
      className={`kid ${className ?? ""}`}
      viewBox="0 0 140 160"
      aria-hidden="true"
    >
      <circle cx="70" cy="50" r="14" fill="#8d5a3a" />
      <path
        d="M56 46 q14 -20 30 -2 q-2 -12 -16 -12 q-14 0 -14 14z"
        fill={hair}
      />
      <path d="M58 64 h24 l6 30 h-36 z" fill={color} />
      <path
        d="M58 70 l-18 -18"
        stroke="#8d5a3a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M82 70 l18 -18"
        stroke="#8d5a3a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M62 94 l-14 22"
        stroke="#274c9a"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M78 94 l14 22"
        stroke="#274c9a"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="30" cy="30" r="5" fill="#ffd166" />
      <circle cx="112" cy="26" r="4" fill="#ff7a3d" />
      <path
        d="M100 44 l6 -6 M104 50 l8 -2"
        stroke="#7ed37a"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function Doodles() {
  return (
    <svg className="doodles" aria-hidden="true">
      <defs>
        <pattern
          id="doodle"
          width="220"
          height="220"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M30 40 l6 -14 l6 14 l-14 -9 h16z"
            fill="none"
            stroke="#ff7a3d"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle
            cx="120"
            cy="30"
            r="7"
            fill="none"
            stroke="#7ed37a"
            strokeWidth="2.5"
          />
          <path
            d="M180 60 h18 M189 51 v18"
            stroke="#1d4ed8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M40 130 q10 -14 20 0 t20 0"
            fill="none"
            stroke="#ffd166"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect
            x="140"
            y="120"
            width="26"
            height="18"
            rx="4"
            fill="none"
            stroke="#ff7a3d"
            strokeWidth="2"
          />
          <path
            d="M150 120 v18 M156 120 v18"
            stroke="#ff7a3d"
            strokeWidth="2"
          />
          <path
            d="M80 190 l24 -24 l6 6 l-24 24z"
            fill="none"
            stroke="#7ed37a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="200" cy="190" r="4" fill="#1d4ed8" />
          <path
            d="M20 200 a8 8 0 1 1 16 0"
            fill="none"
            stroke="#ffd166"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#doodle)" />
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
      { threshold: 0.15 },
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
  const problems = [
    {
      icon: <Users size={22} />,
      title: "« Et la socialisation ? »",
      text: "La question qu'on vous pose à chaque souper. Trouver d'autres familles près de chez vous, des sorties régulières et des amis pour vos enfants ne devrait pas dépendre de la chance.",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "L'incertitude des démarches",
      text: "Avis, projet d'apprentissage, bilans, épreuves : le cadre québécois est précis, mais dispersé. On avance en craignant d'avoir manqué quelque chose.",
    },
    {
      icon: <Library size={22} />,
      title: "Des ressources partout, et nulle part",
      text: "Groupes Facebook, PDF gouvernementaux, blogues : des heures à chercher, sans savoir ce qui est fiable ni à jour.",
    },
    {
      icon: <GraduationCap size={22} />,
      title: "Une matière qui bloque",
      text: "Les fractions, la grammaire, les sciences : parfois il faut un coup de main extérieur, sans renoncer à enseigner soi-même.",
    },
    {
      icon: <CalendarDays size={22} />,
      title: "Le temps et la charge mentale",
      text: "Planifier, garder des traces, préparer les bilans, tout en vivant. Sans outil pensé pour la famille, tout repose sur des cahiers et la mémoire.",
    },
  ];
  const solutions = [
    {
      key: "community",
      title: "Une vraie communauté, près de chez vous",
      text: "Carte des familles par ville, groupes régionaux et thématiques, messages privés, rencontres proposées par les membres et vérifiées par l'équipe. Sorties en semaine comme le week-end.",
      img: pages.community,
      icon: <MapPin size={18} />,
    },
    {
      key: "courses",
      title: "Des cours pour les parents",
      text: "Modules courts avec exemples, exercices et modèles réutilisables : démarrer, bâtir son projet d'apprentissage, planifier, préparer les bilans. Écrits pour le Québec.",
      img: photoFor("course", "Pour commencer"),
      icon: <BookOpen size={18} />,
    },
    {
      key: "resources",
      title: "Les ressources officielles, expliquées",
      text: "Chaque lien gouvernemental accompagné de nos repères, daté et classé par étape. Vos favoris à portée de main. La source officielle fait toujours foi.",
      img: photoFor("resource", "Démarches"),
      icon: <Library size={18} />,
    },
    {
      key: "tutoring",
      title: "Tuteurs, conseillers et coachs, sur rendez-vous",
      text: "Un calendrier de créneaux réels, une réservation confirmée tout de suite, un compte rendu pédagogique après la séance. Vous restez l'enseignant principal.",
      img: pages.rdv,
      icon: <GraduationCap size={18} />,
    },
    {
      key: "family",
      title: "L'organisation de la famille, enfant par enfant",
      text: "Semaine souple, programme importé et réparti sur vos jours d'école, portfolio privé, résultats pondérés avec courbes, calendrier importé de Google ou Apple.",
      img: pages.family,
      icon: <CalendarDays size={18} />,
    },
    {
      key: "exams",
      title: "Des examens d'entraînement",
      text: "Chronométrés, corrigés avec explications, résultats suivis par enfant. Pour s'exercer sans pression avant les vraies épreuves.",
      img: photoFor("exam", "Mathématiques"),
      icon: <ClipboardList size={18} />,
    },
  ];
  const stack = [
    ["Cours pour parents, modèles et mises à jour", "valeur 300 $ / an"],
    [
      "Deux rencontres par année avec un conseiller aux démarches",
      "valeur 200 $",
    ],
    [
      "Organisation familiale : semaine, programme, portfolio, résultats",
      "valeur 120 $ / an",
    ],
    [
      "Examens d'entraînement corrigés, tous niveaux du primaire",
      "valeur 90 $ / an",
    ],
    [
      "Bibliothèque de ressources officielles expliquées et mise à jour",
      "valeur 60 $ / an",
    ],
    [
      "Communauté : carte des familles, groupes, messages, rencontres",
      "sans prix",
    ],
    ["Agenda des tuteurs et coachs vérifiés, comptes rendus", "sans prix"],
  ];
  const faq = [
    [
      "ParentEd est-il une école ?",
      "Non. ParentEd accompagne les parents qui enseignent à la maison. Le parent reste responsable de l'enseignement et des démarches; les sources officielles du ministère font foi. Nous ne délivrons ni diplôme ni garantie de conformité.",
    ],
    [
      "Combien ça coûte aujourd'hui ?",
      "Rien pendant la phase pilote : les familles fondatrices ont accès à tout, gratuitement, en échange de leurs retours. Le tarif de lancement prévu ensuite est de 49 $ par mois, sans engagement, annulable en deux clics. Aucun paiement n'est pris dans l'application pour l'instant.",
    ],
    [
      "Et le tutorat, il est compris ?",
      "Les rencontres avec un conseiller aux démarches sont comprises. Les tuteurs et coachs sont des professionnels indépendants : ils fixent leur tarif (souvent 45 à 65 $ l'heure) et facturent directement la famille. ParentEd vérifie les qualifications et gère l'agenda, sans commission.",
    ],
    [
      "Où vont les données de mes enfants ?",
      "Dans votre espace privé, hébergé chez Supabase, protégé par des règles d'accès famille par famille. L'équipe ParentEd n'y a pas accès par l'application. Aucun profil public d'enfant, jamais d'adresse sur la carte. Politique de confidentialité conforme à la Loi 25.",
    ],
    [
      "Faut-il habiter Montréal ?",
      "Non. La communauté grandit ville par ville au Québec; plus il y a de familles dans votre secteur, plus la carte et les rencontres deviennent utiles. Les cours, ressources, examens et rendez-vous en ligne fonctionnent partout.",
    ],
    [
      "Puis-je essayer avant ?",
      demoEnabled
        ? "Oui : la démonstration avec une famille fictive est ouverte, sans compte. Vous pouvez aussi réserver un appel de 20 minutes."
        : "Réservez un appel de 20 minutes : nous vous montrons la plateforme et répondons à vos questions.",
    ],
  ];
  const [open, setOpen] = useState(0);
  return (
    <div className="landing">
      <header className="landing-nav">
        <a href="#" className="landing-brand">
          <img src="/parented-logo.png" alt="parentEd" />
        </a>
        <nav aria-label="Sections">
          <a href="#probleme">Le problème</a>
          <a href="#solution">La solution</a>
          <a href="#offre">L'offre</a>
          <a href="#tarif">Tarif</a>
          <a href="#faq">Questions</a>
        </nav>
        <div className="landing-nav-actions">
          <a href="#connexion" className="text-link">
            Se connecter
          </a>
          <a href="#appel" className="button pop">
            <Phone size={16} /> Réserver un appel
          </a>
        </div>
      </header>
      <section
        className="hero-scene"
        ref={heroRef}
        aria-label="ParentEd, l'école à la maison sans être seul"
      >
        <div className="sky" />
        <div className="scene-photo">
          <img src={pages.hero} alt="" draggable={false} />
          <div className="scene-tint" />
        </div>
        <div className="sun" />
        <svg className="birds" viewBox="0 0 180 80" aria-hidden="true">
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
        <div className="hill front" />
        <div className="kids" aria-hidden="true">
          <Kid pose="kite" color="#ff7a3d" className="k-kite" />
          <Kid pose="jump" color="#ffd166" className="k-jump" />
          <Kid pose="teach" color="#7ed37a" className="k-teach" />
          <Kid pose="read" color="#1d4ed8" hair="#5a3a22" className="k-read" />
        </div>
        <div className="floaters" aria-hidden="true">
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
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span />
            Pour les parents-éducateurs du Québec
          </p>
          <h1>
            <span>L'école à la maison,</span>
            <span>sans être seul.</span>
          </h1>
          <p className="hero-sub">
            Des familles près de chez vous, des cours pour vous, des repères
            clairs pour les démarches et un coup de main quand une matière
            bloque. En un seul espace.
          </p>
          <div className="hero-actions">
            <a href="#appel" className="button pop big">
              Réserver un appel gratuit <ArrowRight size={18} />
            </a>
            <a href="#connexion" className="button ghost big">
              {demoEnabled ? "Voir la démonstration" : "Se connecter"}
            </a>
          </div>
          <p className="hero-trust">
            <Check size={14} /> Phase pilote gratuite <Check size={14} /> Sans
            engagement <Check size={14} /> Données familiales privées
          </p>
        </div>
      </section>
      <section id="probleme" className="landing-section problem">
        <Doodles />
        <Reveal>
          <p className="section-kicker">Le problème</p>
          <h2>
            Enseigner à la maison est un beau choix. Le faire seul, c'est
            épuisant.
          </h2>
          <p className="section-lead">
            Cinq difficultés que les familles nous décrivent, encore et encore.
          </p>
        </Reveal>
        <div className="problem-grid">
          {problems.map((p, i) => (
            <Reveal key={p.title} className={`problem-card c${i % 3}`}>
              <span className="problem-icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="solution" className="landing-section solution">
        <Reveal>
          <p className="section-kicker">La solution</p>
          <h2>
            Un seul espace pour se former, s'organiser, trouver du soutien et
            rencontrer des familles.
          </h2>
        </Reveal>
        <div className="solution-list">
          {solutions.map((s, i) => (
            <Reveal
              key={s.key}
              className={`solution-row ${i % 2 ? "flip" : ""}`}
            >
              <div className="solution-photo">
                <img src={s.img} alt="" loading="lazy" />
              </div>
              <div className="solution-text">
                <span className="solution-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="landing-section tuesday">
        <Reveal>
          <p className="section-kicker">Un mardi type</p>
          <h2>À quoi ressemble une journée avec ParentEd ?</h2>
          <p className="section-lead">
            Exemple fictif : un parent disponible en journée et un enfant de 8
            ans. Chaque famille bâtit son propre rythme.
          </p>
        </Reveal>
        <Reveal>
          <ol className="timeline">
            {[
              [
                "8 h 45",
                "Un coup d'œil à la semaine : ce qui est prévu, ce qui est déjà fait.",
                "Ma semaine",
              ],
              [
                "9 h",
                "Lecture et écriture avec le parent, à partir des ressources choisies.",
                "Programme",
              ],
              [
                "10 h 20",
                "Mathématiques, puis un temps calme. La notion du jour est cochée.",
                "Programme",
              ],
              [
                "13 h",
                "Séance de tutorat réservée la semaine dernière; le compte rendu arrive après.",
                "Rendez-vous",
              ],
              [
                "14 h 30",
                "Le parc du mardi avec trois autres familles du quartier.",
                "Rencontres",
              ],
              [
                "16 h",
                "Une photo du pont en cartons dans le portfolio, deux phrases dictées par l'enfant.",
                "Portfolio",
              ],
              [
                "En soirée",
                "Quinze minutes d'un cours pour parents : préparer le premier bilan.",
                "Mes cours",
              ],
            ].map(([time, text, tag]) => (
              <li key={time}>
                <span className="t-time">{time}</span>
                <span className="t-text">
                  {text}
                  <small>{tag}</small>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>
      <section id="offre" className="landing-section offer">
        <Doodles />
        <Reveal>
          <p className="section-kicker">L'offre</p>
          <h2>
            L'accompagnement ParentEd : tout ce qu'il faut pour une année
            d'école maison sereine.
          </h2>
          <p className="section-lead">
            Le résultat qu'on vise : des enfants qui apprennent, des amis, des
            démarches sous contrôle et un parent qui n'est plus seul. Voici ce
            que contient l'accompagnement.
          </p>
        </Reveal>
        <div className="offer-grid">
          <Reveal className="offer-stack">
            <ul>
              {stack.map(([item, value]) => (
                <li key={item}>
                  <Check size={18} />
                  <span>{item}</span>
                  <em>{value}</em>
                </li>
              ))}
            </ul>
            <div className="offer-total">
              <span>Valeur estimée de l'ensemble</span>
              <strong>plus de 770 $ par année</strong>
            </div>
          </Reveal>
          <Reveal className="offer-side">
            <div className="offer-bonus">
              <span className="section-kicker">Bonus familles fondatrices</span>
              <ul>
                <li>
                  <Sparkles size={16} /> Accès gratuit pendant toute la phase
                  pilote
                </li>
                <li>
                  <Sparkles size={16} /> Un appel de 20 minutes avec un
                  conseiller pour démarrer
                </li>
                <li>
                  <Sparkles size={16} /> Vos idées façonnent la plateforme :
                  chaque retour est lu et répondu
                </li>
              </ul>
            </div>
            <div className="offer-guarantee">
              <ShieldCheck size={22} />
              <div>
                <strong>Notre engagement</strong>
                <p>
                  Zéro paiement tant que la phase pilote dure. Ensuite, sans
                  engagement, annulable en deux clics, remboursement intégral si
                  le service est indisponible par notre faute. Vos données
                  restent les vôtres, exportables à tout moment.
                </p>
              </div>
            </div>
            <div className="offer-scarcity">
              <strong>50 familles fondatrices</strong>
              <p>
                Nous ouvrons la phase pilote à 50 familles au Québec pour
                accompagner chacune de près. Ensuite, liste d'attente.
              </p>
              <a href="#appel" className="button pop">
                Réserver ma place <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
      <section id="tarif" className="landing-section pricing">
        <Reveal>
          <p className="section-kicker">Tarif</p>
          <h2>Un prix pensé pour les familles, pas pour les écoles.</h2>
        </Reveal>
        <div className="pricing-grid">
          <Reveal className="price-card main">
            <span className="section-kicker">Accompagnement ParentEd</span>
            <div className="price">
              <strong>49 $</strong>
              <span>par mois, par famille</span>
            </div>
            <p className="price-note">
              Tarif de lancement prévu après la phase pilote. Sans engagement,
              annulable en deux clics. Aucun paiement n'est pris dans
              l'application pour l'instant.
            </p>
            <ul>
              {[
                "Tous les cours, modèles et ressources",
                "Organisation, portfolio, résultats, examens",
                "Communauté, carte, rencontres, messages",
                "Deux rencontres par année avec un conseiller",
                "Agenda des tuteurs et coachs vérifiés",
              ].map((x) => (
                <li key={x}>
                  <Check size={16} /> {x}
                </li>
              ))}
            </ul>
            <a href="#appel" className="button pop big">
              Commencer gratuitement <ArrowRight size={18} />
            </a>
          </Reveal>
          <Reveal className="price-compare">
            <h3>Pour comparer</h3>
            <ul>
              <li>
                <span>Une heure de tutorat privé</span>
                <strong>45 à 65 $</strong>
              </li>
              <li>
                <span>Une école privée au Québec</span>
                <strong>plusieurs milliers $ / an</strong>
              </li>
              <li>
                <span>Chercher seul, chaque semaine</span>
                <strong>des heures de votre temps</strong>
              </li>
              <li>
                <span>ParentEd, tout compris sauf les séances de tutorat</span>
                <strong>49 $ / mois</strong>
              </li>
            </ul>
            <p className="small muted">
              Les séances de tutorat et de coaching sont facturées directement
              par les intervenants indépendants; ParentEd ne prend aucune
              commission.
            </p>
          </Reveal>
        </div>
      </section>
      <section id="faq" className="landing-section faq">
        <Reveal>
          <p className="section-kicker">Questions fréquentes</p>
          <h2>Ce que les parents nous demandent d'abord.</h2>
        </Reveal>
        <div className="faq-list">
          {faq.map(([q, a], i) => (
            <Reveal key={q}>
              <button
                className={`faq-item ${open === i ? "open" : ""}`}
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span>{q}</span>
                <ArrowRight size={18} />
              </button>
              {open === i && <p className="faq-answer">{a}</p>}
            </Reveal>
          ))}
        </div>
      </section>
      <section id="appel" className="landing-section contact">
        <Doodles />
        <div className="contact-grid">
          <Reveal>
            <p className="section-kicker">On se parle ?</p>
            <h2>Réservez un appel de 20 minutes.</h2>
            <p className="section-lead">
              Un membre de l'équipe vous montre la plateforme, répond à vos
              questions sur les démarches et vous dit si ParentEd convient à
              votre famille. Sans pression, sans engagement.
            </p>
            <ul className="contact-points">
              <li>
                <MessageSquare size={16} /> Réponse sous deux jours ouvrables
              </li>
              <li>
                <Phone size={16} /> Par téléphone ou visioconférence, à votre
                convenance
              </li>
              <li>
                <ShieldCheck size={16} /> Votre courriel sert uniquement à vous
                répondre
              </li>
            </ul>
          </Reveal>
          <Reveal>
            <LeadForm submitLead={submitLead} mode={mode} />
          </Reveal>
        </div>
      </section>
      <footer className="landing-footer">
        <div>
          <img src="/parented-logo.png" alt="parentEd" />
          <p>À votre rythme. Ensemble.</p>
          <small>
            ParentEd n'est ni une école ni un service de garde. Les sources
            officielles du ministère de l'Éducation font foi.
          </small>
        </div>
        <nav aria-label="Mentions légales">
          {legalLinks.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href="#connexion">Se connecter</a>
        </nav>
      </footer>
    </div>
  );
}
function LeadForm({
  submitLead,
  mode,
}: {
  submitLead: (lead: LeadInput) => Promise<void>;
  mode: Props["mode"];
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
        <h3>
          {kind === "appel" ? "Demande reçue !" : "Vous êtes sur la liste !"}
        </h3>
        <p>
          {kind === "appel"
            ? "Nous vous écrivons sous deux jours ouvrables pour fixer l'appel."
            : "Nous vous écrivons dès qu'une place de famille fondatrice se libère."}
        </p>
        {mode !== "supabase" && (
          <small className="muted">
            {mode === "none"
              ? "Site non relié à la base : cette demande n'a pas été transmise."
              : "Mode démonstration : la demande est enregistrée dans ce navigateur seulement."}
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
          <Phone size={15} /> Réserver un appel
        </button>
        <button
          type="button"
          className={kind === "liste" ? "active" : ""}
          onClick={() => setKind("liste")}
        >
          <Sparkles size={15} /> Liste des familles fondatrices
        </button>
      </div>
      {state.error && (
        <div className="alert" role="alert">
          {state.error}
        </div>
      )}
      <label>
        Prénom
        <input
          name="name"
          maxLength={120}
          required
          placeholder="Votre prénom"
          autoComplete="given-name"
        />
      </label>
      <label>
        Courriel
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
          <label>
            Meilleur moment pour vous joindre
            <input
              name="preferred"
              maxLength={120}
              placeholder="En soirée, mardi ou jeudi…"
            />
          </label>
          <label>
            Votre situation, en quelques mots (facultatif)
            <textarea
              name="message"
              maxLength={2000}
              placeholder="Âges des enfants, où vous en êtes, ce qui vous préoccupe. Aucun renseignement sensible."
              rows={3}
            />
          </label>
        </>
      )}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hp"
        aria-hidden="true"
      />
      <button className="button pop big" disabled={state.busy}>
        {state.busy
          ? "Envoi…"
          : kind === "appel"
            ? "Demander un appel"
            : "Rejoindre la liste"}{" "}
        <ArrowRight size={18} />
      </button>
      <small className="muted">
        En envoyant, vous acceptez notre{" "}
        <a href="#legal/confidentialite">politique de confidentialité</a>.
        Aucune infolettre sans votre accord.
      </small>
    </form>
  );
}
