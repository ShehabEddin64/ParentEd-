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
  const problems = [
    [
      "« Et la socialisation ? »",
      "Trouver d'autres familles près de chez vous, des sorties régulières et des amis pour vos enfants ne devrait pas dépendre de la chance.",
    ],
    [
      "L'incertitude des démarches",
      "Avis, projet d'apprentissage, bilans, épreuves : le cadre québécois est précis mais dispersé. On avance en craignant d'avoir manqué quelque chose.",
    ],
    [
      "Des ressources partout, et nulle part",
      "Groupes Facebook, PDF gouvernementaux, blogues : des heures à chercher, sans savoir ce qui est fiable ni à jour.",
    ],
    [
      "Une matière qui bloque",
      "Les fractions, la grammaire, les sciences : parfois il faut un coup de main extérieur, sans renoncer à enseigner soi-même.",
    ],
    [
      "Le temps et la charge mentale",
      "Planifier, garder des traces, préparer les bilans, tout en vivant. Sans outil pensé pour la famille, tout repose sur des cahiers et la mémoire.",
    ],
  ];
  const solutions = [
    [
      "Une communauté près de chez vous",
      "Carte des familles par ville, groupes, messages privés, rencontres en semaine et le week-end.",
    ],
    [
      "Des cours pour les parents",
      "Démarrer, bâtir son projet d'apprentissage, planifier, préparer les bilans. Écrits pour le Québec, avec modèles.",
    ],
    [
      "Les ressources officielles, expliquées",
      "Chaque lien gouvernemental accompagné de nos repères, daté et classé par étape.",
    ],
    [
      "Tuteurs, conseillers et coachs",
      "Un calendrier de créneaux réels, une réservation confirmée tout de suite, un compte rendu après la séance.",
    ],
    [
      "L'organisation de la famille",
      "Semaine par enfant, programme importé et réparti, portfolio privé, résultats pondérés, calendrier importé.",
    ],
    [
      "Des examens d'entraînement",
      "Chronométrés, corrigés avec explications, résultats suivis par enfant.",
    ],
  ];
  const stack = [
    ["Cours pour parents, modèles et mises à jour", "300 $ / an"],
    ["Deux rencontres par année avec un conseiller aux démarches", "200 $"],
    [
      "Organisation familiale : semaine, programme, portfolio, résultats",
      "120 $ / an",
    ],
    ["Examens d'entraînement corrigés", "90 $ / an"],
    ["Bibliothèque de ressources officielles expliquées", "60 $ / an"],
    ["Communauté, carte des familles, rencontres, messages", "sans prix"],
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
      "Le tutorat est-il compris ?",
      "Les rencontres avec un conseiller aux démarches sont comprises. Les tuteurs et coachs sont des professionnels indépendants : ils fixent leur tarif (souvent 45 à 65 $ l'heure) et facturent directement la famille. ParentEd vérifie les qualifications et gère l'agenda, sans commission.",
    ],
    [
      "Où vont les données de mes enfants ?",
      "Dans votre espace privé, protégé par des règles d'accès famille par famille. L'équipe ParentEd n'y a pas accès par l'application. Aucun profil public d'enfant, jamais d'adresse sur la carte. Politique de confidentialité conforme à la Loi 25.",
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
  const tools = [
    [
      "accueil",
      "Accueil",
      "Votre semaine en un coup d'œil : prochain rendez-vous, agenda, météo des sorties, progrès des enfants, raccourcis. Chaque widget se déplace ou se masque.",
    ],
    [
      "semaine",
      "Ma semaine",
      "Le planning par enfant, le programme importé et réparti sur vos jours d'école, les séances de tutorat et vos activités, au même endroit.",
    ],
    [
      "carte",
      "Carte des familles",
      "Les familles par ville, les rencontres à venir et les tuteurs, sur une carte. Un clic pour écrire à une famille ou s'inscrire à une sortie.",
    ],
    [
      "rendezvous",
      "Rendez-vous",
      "Tuteurs, conseillers et coachs vérifiés, avec leurs créneaux réels. La réservation est confirmée tout de suite; le compte rendu arrive après la séance.",
    ],
    [
      "examens",
      "Examens",
      "Des examens d'entraînement chronométrés et corrigés, résultat enregistré par enfant.",
    ],
    [
      "resultats",
      "Résultats",
      "Notes pondérées, moyenne générale et par matière, courbes d'évolution. Des repères pour la famille, pas un bulletin officiel.",
    ],
  ] as const;
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
          <a href="#probleme">Le problème</a>
          <a href="#solution">La solution</a>
          <a href="#outils">Les outils</a>
          <a href="#offre">L'offre et le tarif</a>
          <a href="#faq">Questions</a>
        </nav>
        <div className="landing-nav-actions">
          <a href="#connexion" className="text-link">
            Se connecter
          </a>
          <a href="#appel" className="button pop">
            Réserver un appel
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
            L'école à la maison, <span>sans être seul.</span>
          </h1>
          <p className="hero-sub">
            Des familles près de chez vous, des cours pour vous, des repères
            clairs pour les démarches et un coup de main quand une matière
            bloque. En un seul espace, pour les parents-éducateurs du Québec.
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
            Phase pilote gratuite · Sans engagement · Données familiales privées
          </p>
        </div>
        <div className="scene" aria-hidden="true">
          <div className="sun" />
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
          <div className="hill front" />
          <div className="kids">
            <Kid pose="read" color="#1d4ed8" className="k-read" />
            <Kid pose="kite" color="#ff7a3d" className="k-kite" />
            <Kid pose="jump" color="#ffd166" className="k-jump" />
            <Kid pose="ball" color="#7ed37a" className="k-ball" />
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
          <h2>
            Enseigner à la maison est un beau choix. Le faire seul, c'est
            épuisant.
          </h2>
          <p className="section-lead">
            Cinq difficultés que les familles nous décrivent, encore et encore.
          </p>
        </Reveal>
        <div className="plain-grid">
          {problems.map(([title, text]) => (
            <Reveal key={title} className="plain-item">
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="solution" className="landing-section solution">
        <Reveal>
          <h2>
            Un seul espace pour se former, s'organiser, trouver du soutien et
            rencontrer des familles.
          </h2>
        </Reveal>
        <div className="plain-grid three">
          {solutions.map(([title, text]) => (
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
          <h2>Une plateforme qui a tous les outils dont vous avez besoin.</h2>
          <p className="section-lead">
            Ce sont de vraies captures de ParentEd, avec une famille de
            démonstration.
          </p>
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
                alt={`Capture d'écran de ParentEd : ${tools[i][1]}`}
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
          <h2>
            Tout ce qu'il faut pour une année d'école maison sereine, pour moins
            que le prix d'une heure de tutorat par semaine.
          </h2>
        </Reveal>
        <div className="offer-grid">
          <Reveal className="offer-stack">
            <h3>Ce que comprend l'accompagnement ParentEd</h3>
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
              <span>Valeur estimée</span>
              <strong>plus de 770 $ par année</strong>
            </div>
            <div className="offer-bonus">
              <strong>Bonus familles fondatrices</strong>
              <p>
                Accès gratuit pendant toute la phase pilote, un appel de
                démarrage avec un conseiller, et vos idées qui façonnent la
                plateforme. 50 places au Québec, puis liste d'attente.
              </p>
            </div>
          </Reveal>
          <Reveal className="price-card">
            <p className="price-label">Tarif de lancement prévu</p>
            <div className="price">
              <strong>49 $</strong>
              <span>par mois, par famille</span>
            </div>
            <p className="price-cheaper">
              Moins cher qu'une seule heure de tutorat privé (45 à 65 $) et sans
              commune mesure avec une école privée (plusieurs milliers de
              dollars par année).
            </p>
            <ul>
              {[
                "Tout l'accompagnement ci-contre, sans limite",
                "Sans engagement, annulable en deux clics",
                "Phase pilote : 0 $ pour les familles fondatrices",
                "Aucun paiement dans l'application pour l'instant",
              ].map((x) => (
                <li key={x}>
                  <Check size={16} /> {x}
                </li>
              ))}
            </ul>
            <a href="#appel" className="button pop big">
              Réserver ma place <ArrowRight size={18} />
            </a>
            <p className="price-guarantee">
              Notre engagement : remboursement intégral si le service est
              indisponible par notre faute; vos données restent les vôtres et
              sont exportables à tout moment. Les séances de tutorat sont
              facturées par les intervenants, sans commission.
            </p>
          </Reveal>
        </div>
      </section>
      <section id="faq" className="landing-section faq">
        <Reveal>
          <h2>Questions fréquentes</h2>
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
                <ArrowRight size={22} />
              </button>
              {open === i && <p className="faq-answer">{a}</p>}
            </Reveal>
          ))}
        </div>
      </section>
      <section id="appel" className="landing-section contact">
        <Reveal>
          <h2>Réservez un appel de 20 minutes.</h2>
          <p className="section-lead">
            Un membre de l'équipe vous montre la plateforme, répond à vos
            questions sur les démarches et vous dit si ParentEd convient à votre
            famille. Sans pression, sans engagement. Réponse sous deux jours
            ouvrables.
          </p>
        </Reveal>
        <Reveal>
          <LeadForm submitLead={submitLead} mode={mode} />
        </Reveal>
      </section>
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/parented-logo.png" alt="parentEd" />
            <p>Accompagner les parents, apprendre en famille.</p>
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
            <h4>ParentEd</h4>
            <a href="#probleme">Le problème</a>
            <a href="#solution">La solution</a>
            <a href="#offre">L'offre et le tarif</a>
            <a href="#faq">Questions fréquentes</a>
          </div>
          <div>
            <h4>Espace membre</h4>
            <a href="#connexion">Se connecter</a>
            <a href="#connexion">Créer un compte</a>
            {demoEnabled && <a href="#connexion">Voir la démonstration</a>}
            <a href="#appel">Réserver un appel</a>
          </div>
          <div>
            <h4>Légal</h4>
            {legalLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <h4>Contact</h4>
            <a href="#appel">
              <Phone size={14} /> Réserver un appel
            </a>
            <a href="#appel">
              <Mail size={14} /> Nous écrire
            </a>
            <p className="footer-note">Québec, Canada</p>
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
          Réserver un appel
        </button>
        <button
          type="button"
          className={kind === "liste" ? "active" : ""}
          onClick={() => setKind("liste")}
        >
          Liste des familles fondatrices
        </button>
      </div>
      {state.error && (
        <div className="alert" role="alert">
          {state.error}
        </div>
      )}
      <div className="form-grid">
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
            <label className="span-2">
              Meilleur moment pour vous joindre
              <input
                name="preferred"
                maxLength={120}
                placeholder="En soirée, mardi ou jeudi…"
              />
            </label>
            <label className="span-2">
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
      </div>
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
