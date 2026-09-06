import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Library,
  MapPin,
  MessageCircleQuestion,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { Props } from "../App";
type Hit = {
  title: string;
  sub: string;
  href: string;
  icon: "course" | "resource" | "exam" | "page" | "event";
};
type Turn = { role: "user" | "assistant"; content: string; hits?: Hit[] };
const pages: Hit[] = [
  {
    title: "Ma semaine",
    sub: "Planning par enfant, programme, portfolio, résultats",
    href: "#semaine",
    icon: "page",
  },
  {
    title: "Rendez-vous",
    sub: "Tuteurs, conseillers aux démarches, coachs : réserver un créneau",
    href: "#tutorat",
    icon: "page",
  },
  {
    title: "Examens d’entraînement",
    sub: "S’exercer et suivre les résultats",
    href: "#examens",
    icon: "page",
  },
  {
    title: "Ressources officielles",
    sub: "Liens gouvernementaux expliqués, favoris",
    href: "#ressources",
    icon: "page",
  },
  {
    title: "Communauté",
    sub: "Groupes, annuaire des familles, carte, messages privés",
    href: "#communaute",
    icon: "page",
  },
  {
    title: "Rencontres",
    sub: "Sorties entre familles, proposer une rencontre",
    href: "#evenements",
    icon: "page",
  },
  {
    title: "Mon profil",
    sub: "Ville, intérêts, visibilité sur la carte",
    href: "#profil",
    icon: "page",
  },
];
const faq: { q: string[]; a: string; hits?: Hit[] }[] = [
  {
    q: ["avis", "déclar", "commencer", "démarrer", "inscri"],
    a: "Pour commencer l’école à la maison au Québec, la démarche officielle (avis, projet d’apprentissage, suivi) est décrite par le ministère. Le cours « Faire ses premiers pas » vous aide à vous y retrouver, et la ressource « Démarche et étapes » renvoie à la source officielle. Un conseiller peut relire votre projet depuis la page Rendez-vous.",
    hits: [
      {
        title: "Démarche et étapes",
        sub: "Source officielle",
        href: "#ressources",
        icon: "resource",
      },
    ],
  },
  {
    q: ["bilan", "évaluation", "épreuve", "examen ministériel"],
    a: "Les bilans de progression et les épreuves relèvent des exigences officielles. Le cours « Préparer ses bilans sans stress » explique la logique et propose un canevas; le portfolio de « Ma semaine » rassemble vos traces; les examens d’entraînement permettent de s’exercer sans pression. ParentEd n’est pas une évaluation officielle.",
  },
  {
    q: ["tuteur", "tutorat", "rendez-vous", "réserv", "coach", "conseill"],
    a: "Depuis la page Rendez-vous, choisissez un tuteur, un conseiller ou un coach, puis un créneau libre dans son calendrier : la réservation est confirmée tout de suite. Les tuteurs et coachs facturent directement la famille; les rencontres avec un conseiller sont comprises.",
  },
  {
    q: ["programme", "curriculum", "calendrier", "import", "google"],
    a: "Dans « Ma semaine → Programme », collez ou importez votre programme (fichier CSV ou texte) : ParentEd le répartit sur vos jours d’école. Dans l’onglet « Ma semaine », le bouton « Importer un calendrier » lit un fichier .ics exporté de Google Calendar, Apple ou Outlook.",
  },
  {
    q: ["note", "résultat", "moyenne", "pondér"],
    a: "Dans « Ma semaine → Résultats », ajoutez chaque évaluation avec sa note, son maximum et sa pondération : les moyennes par matière et la moyenne générale sont pondérées. Les examens d’entraînement s’y ajoutent automatiquement.",
  },
  {
    q: ["famille", "rencontrer", "carte", "près", "région", "message"],
    a: "Dans Communauté → Carte, vous voyez les familles par ville (position au centre-ville, sur choix), les rencontres et les tuteurs. L’annuaire permet d’écrire un message privé à une famille. Ajoutez votre ville dans Mon profil pour apparaître.",
  },
  {
    q: ["mot de passe", "connexion", "compte"],
    a: "Depuis la page de connexion, « Mot de passe oublié » envoie un lien de réinitialisation par courriel. Chaque parent a son compte; la famille et ses documents restent privés.",
  },
];
function search(q: string, data: Props["data"]): Hit[] {
  const t = q.toLocaleLowerCase("fr");
  const words = t.split(/\s+/).filter((w) => w.length > 2);
  const score = (text: string) =>
    words.reduce(
      (n, w) => n + (text.toLocaleLowerCase("fr").includes(w) ? 1 : 0),
      0,
    );
  const hits: (Hit & { s: number })[] = [
    ...data.courses
      .filter((c) => c.published)
      .map((c) => ({
        title: c.title,
        sub: "Cours · " + c.category,
        href: "#cours/" + c.id,
        icon: "course" as const,
        s: score(
          c.title +
            " " +
            c.description +
            " " +
            data.lessons
              .filter((l) => l.course_id === c.id)
              .map((l) => l.title + " " + l.body)
              .join(" "),
        ),
      })),
    ...data.resources.map((r) => ({
      title: r.title,
      sub: "Ressource · " + r.source,
      href: "#ressources",
      icon: "resource" as const,
      s: score(r.title + " " + r.description + " " + r.category),
    })),
    ...data.exams
      .filter((e) => e.published)
      .map((e) => ({
        title: e.title,
        sub: "Examen · " + e.subject,
        href: "#examens/" + e.id,
        icon: "exam" as const,
        s: score(e.title + " " + e.subject + " " + e.description),
      })),
    ...data.events
      .filter((e) => e.published)
      .map((e) => ({
        title: e.title,
        sub: "Rencontre · " + e.location,
        href: "#evenements",
        icon: "event" as const,
        s: score(e.title + " " + e.description),
      })),
    ...pages.map((p) => ({ ...p, s: score(p.title + " " + p.sub) })),
  ];
  return hits
    .filter((h) => h.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 5);
}
function localAnswer(q: string, data: Props["data"]): Turn {
  const t = q.toLocaleLowerCase("fr");
  const hits = search(q, data);
  const f = faq.find((x) => x.q.some((k) => t.includes(k)));
  if (f)
    return {
      role: "assistant",
      content: f.a,
      hits: [...(f.hits ?? []), ...hits].slice(0, 4),
    };
  if (hits.length)
    return {
      role: "assistant",
      content: "Voici ce que ParentEd propose sur ce sujet :",
      hits,
    };
  return {
    role: "assistant",
    content:
      "Je n’ai rien trouvé dans les contenus de ParentEd pour cette question. Essayez d’autres mots, posez-la dans la communauté, ou réservez une rencontre avec un conseiller.",
    hits: pages.slice(1, 3),
  };
}
const icons = {
  course: BookOpen,
  resource: Library,
  exam: ClipboardList,
  page: Sparkles,
  event: MapPin,
};
export function Assistant({ data, profile, api }: Props) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<boolean | null>(
    api.mode === "supabase" ? null : false,
  );
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [turns, busy]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  const ask = async (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    const next: Turn[] = [...turns, { role: "user", content: q }];
    setTurns(next);
    setBusy(true);
    try {
      const result =
        ai === false
          ? null
          : await api.askAssistant(
              next.map(({ role, content }) => ({ role, content })),
            );
      const answer = result?.answer ?? null;
      if (result?.remaining !== undefined) setRemaining(result.remaining);
      if (answer === null) {
        setAi(false);
        setTurns([...next, localAnswer(q, data)]);
      } else {
        setAi(true);
        setTurns([
          ...next,
          {
            role: "assistant",
            content: answer,
            hits: search(q, data).slice(0, 3),
          },
        ]);
      }
    } catch (err) {
      setTurns([
        ...next,
        {
          role: "assistant",
          content: (err as Error).message + " En attendant, voici des pistes :",
          hits: search(q, data),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };
  const suggestions = [
    "Comment commencer l’école à la maison ?",
    "Comment préparer un bilan ?",
    "Comment réserver un tuteur ?",
    "Importer mon calendrier Google",
  ];
  return (
    <>
      <button
        className={`assistant-fab ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Fermer l’assistant" : "Besoin d’aide ?"}
      >
        {open ? <X size={20} /> : <MessageCircleQuestion size={20} />}
        {!open && <span>Besoin d’aide ?</span>}
      </button>
      {open && (
        <aside
          className="assistant rise"
          role="dialog"
          aria-label="Assistant ParentEd"
        >
          <header>
            <span className="avatar">
              <Sparkles size={16} />
            </span>
            <div>
              <strong>Assistant ParentEd</strong>
              <small>
                {ai === true
                  ? "Répond à partir des cours et ressources ParentEd"
                  : ai === false
                    ? "Recherche dans les cours, ressources et pages"
                    : "Bonjour " + profile.display_name.split(" ")[0] + " !"}
              </small>
            </div>
          </header>
          <div className="assistant-body">
            {!turns.length && (
              <div className="assistant-intro">
                <p>
                  Posez une question sur l’école à la maison ou sur ParentEd. Je
                  cherche dans nos cours et ressources et je vous indique où
                  cliquer.
                </p>
                <div className="assistant-suggestions">
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => setInput(s)}>
                      {s}
                    </button>
                  ))}
                </div>
                <small className="muted">
                  Aucune donnée sur vos enfants n’est envoyée. Pour les
                  démarches officielles, la source gouvernementale fait foi.
                </small>
              </div>
            )}
            {turns.map((t, i) => (
              <div key={i} className={`assistant-turn ${t.role}`}>
                <p className="preserve-lines">{t.content}</p>
                {t.hits && t.hits.length > 0 && (
                  <ul className="assistant-hits">
                    {t.hits.map((h) => {
                      const Icon = icons[h.icon];
                      return (
                        <li key={h.href + h.title}>
                          <a href={h.href} onClick={() => setOpen(false)}>
                            <Icon size={15} />
                            <span>
                              <strong>{h.title}</strong>
                              <small>{h.sub}</small>
                            </span>
                            <ArrowRight size={14} />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
            {busy && (
              <div className="assistant-turn assistant">
                <p className="muted">Je cherche…</p>
              </div>
            )}
            <div ref={end} />
          </div>
          <form onSubmit={ask} className="assistant-compose">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
              maxLength={1000}
              aria-label="Votre question"
            />
            <button
              className="button primary"
              disabled={busy || !input.trim()}
              aria-label="Envoyer"
            >
              <Send size={16} />
            </button>
          </form>
          {remaining !== null && (
            <p className="assistant-quota">
              {remaining > 0
                ? `${remaining} question${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""} aujourd’hui`
                : "Quota du jour atteint : la recherche intégrée reste disponible."}
            </p>
          )}
          <footer className="assistant-foot">
            <a href="#tutorat" onClick={() => setOpen(false)}>
              <GraduationCap size={14} /> Parler à un conseiller
            </a>
            <a href="#communaute" onClick={() => setOpen(false)}>
              <Users size={14} /> Demander à la communauté
            </a>
            <a href="#semaine" onClick={() => setOpen(false)}>
              <CalendarDays size={14} /> Ma semaine
            </a>
          </footer>
        </aside>
      )}
    </>
  );
}
