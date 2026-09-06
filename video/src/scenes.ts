import narration from "./narration.json";
import { FPS } from "./theme";

export type Cam = { t: number; s: number; cx: number; cy: number };
export type Shot = { src: string; at: number };
export type Click = { at: number; x: number; y: number };
export type Cursor = { from: [number, number]; to: [number, number]; start: number; end: number };

export type Scene = {
  id: string;
  kind: "title" | "screen" | "end";
  chip?: string;
  key?: string;
  shots?: Shot[];
  cam?: Cam[];
  cursor?: Cursor[];
  clicks?: Click[];
  /** secondes ajoutées à la narration pour laisser respirer le plan */
  pad?: number;
};

const N: Record<string, number> = Object.fromEntries(
  narration.map((n) => [n.id, n.duration])
);

export const scenes: Scene[] = [
  {
    id: "intro",
    kind: "title",
    pad: 1.5,
  },
  {
    id: "accueil",
    kind: "screen",
    chip: "Mon accueil",
    key: "Ce qui m’attend aujourd’hui",
    shots: [{ src: "shots/accueil.png", at: 0 }],
    cam: [
      { t: 0, s: 1.02, cx: 720, cy: 430 },
      { t: 3.4, s: 1.45, cx: 545, cy: 340 },
      { t: 6.6, s: 1.28, cx: 820, cy: 520 },
      { t: 10.5, s: 1.2, cx: 780, cy: 560 },
    ],
  },
  {
    id: "cours",
    kind: "screen",
    chip: "Mes cours",
    key: "Des cours écrits pour le parent",
    shots: [{ src: "shots/cours.png", at: 0 }],
    cam: [
      { t: 0, s: 1.05, cx: 720, cy: 400 },
      { t: 4.2, s: 1.24, cx: 700, cy: 560 },
      { t: 7.2, s: 1.3, cx: 560, cy: 640 },
    ],
    cursor: [{ from: [980, 300], to: [452, 690], start: 3.6, end: 5.5 }],
    clicks: [{ at: 5.6, x: 452, y: 690 }],
  },
  {
    id: "lecon",
    kind: "screen",
    chip: "Une leçon",
    key: "Explication, exemple, exercice",
    shots: [
      { src: "shots/cours-detail.png", at: 0 },
      { src: "shots/cours-lecon.png", at: 6.6 },
    ],
    cam: [
      { t: 0, s: 1.06, cx: 720, cy: 420 },
      { t: 3.2, s: 1.4, cx: 430, cy: 470 },
      { t: 6.4, s: 1.4, cx: 430, cy: 470 },
      { t: 7.0, s: 1.2, cx: 900, cy: 480 },
      { t: 12.8, s: 1.32, cx: 950, cy: 540 },
    ],
    cursor: [{ from: [900, 300], to: [411, 447], start: 3.4, end: 5.6 }],
    clicks: [{ at: 6.2, x: 411, y: 447 }],
  },
  {
    id: "semaine",
    kind: "screen",
    chip: "Ma semaine",
    key: "Tout au même endroit",
    shots: [{ src: "shots/semaine.png", at: 0 }],
    cam: [
      { t: 0, s: 1.02, cx: 720, cy: 430 },
      { t: 3.6, s: 1.3, cx: 700, cy: 400 },
      { t: 6.8, s: 1.22, cx: 720, cy: 580 },
      { t: 9.0, s: 1.3, cx: 640, cy: 600 },
    ],
  },
  {
    id: "ajout",
    kind: "screen",
    chip: "Ajouter une activité",
    key: "Enregistrée tout de suite",
    shots: [
      { src: "shots/semaine.png", at: 0 },
      { src: "shots/semaine-form-rempli.png", at: 2.3 },
      { src: "shots/semaine-apres.png", at: 5.9 },
    ],
    cam: [
      { t: 0, s: 1.16, cx: 1000, cy: 300 },
      { t: 2.0, s: 1.32, cx: 1100, cy: 240 },
      { t: 2.4, s: 1.18, cx: 800, cy: 430 },
      { t: 5.4, s: 1.3, cx: 880, cy: 500 },
      { t: 6.0, s: 1.15, cx: 620, cy: 560 },
      { t: 10.0, s: 1.42, cx: 420, cy: 620 },
    ],
    cursor: [
      { from: [700, 520], to: [1304, 181], start: 0.5, end: 1.9 },
      { from: [1304, 181], to: [931, 620], start: 3.5, end: 5.2 },
    ],
    clicks: [
      { at: 2.0, x: 1304, y: 181 },
      { at: 5.4, x: 931, y: 620 },
    ],
  },
  {
    id: "portfolio",
    kind: "screen",
    chip: "Portfolio privé",
    key: "Jamais publié dans la communauté",
    shots: [{ src: "shots/portfolio.png", at: 0 }],
    cam: [
      { t: 0, s: 1.04, cx: 720, cy: 420 },
      { t: 3.4, s: 1.42, cx: 700, cy: 380 },
      { t: 7.6, s: 1.3, cx: 760, cy: 470 },
    ],
  },
  {
    id: "communaute",
    kind: "screen",
    chip: "Communauté",
    key: "Des parents près de chez soi",
    shots: [{ src: "shots/communaute.png", at: 0 }],
    cam: [
      { t: 0, s: 1.03, cx: 720, cy: 420 },
      { t: 3.6, s: 1.26, cx: 640, cy: 520 },
      { t: 8.4, s: 1.34, cx: 1080, cy: 520 },
    ],
  },
  {
    id: "carte",
    kind: "screen",
    chip: "La carte",
    key: "La ville, jamais l’adresse",
    shots: [{ src: "shots/carte.png", at: 0 }],
    cam: [
      { t: 0, s: 1.1, cx: 700, cy: 480 },
      { t: 5.2, s: 1.45, cx: 640, cy: 560 },
    ],
  },
  {
    id: "rencontres",
    kind: "screen",
    chip: "Rencontres",
    key: "Proposées par les familles",
    shots: [
      { src: "shots/evenements-avant.png", at: 0 },
      { src: "shots/evenements-inscrit.png", at: 5.7 },
    ],
    cam: [
      { t: 0, s: 1.05, cx: 720, cy: 430 },
      { t: 3.4, s: 1.3, cx: 480, cy: 420 },
      { t: 5.4, s: 1.44, cx: 420, cy: 440 },
      { t: 6.0, s: 1.24, cx: 560, cy: 470 },
      { t: 9.0, s: 1.3, cx: 620, cy: 500 },
    ],
    cursor: [{ from: [1000, 250], to: [363, 450], start: 3.2, end: 5.1 }],
    clicks: [{ at: 5.3, x: 363, y: 450 }],
  },
  {
    id: "tutorat",
    kind: "screen",
    chip: "Rendez-vous et tutorat",
    key: "Le parent reste l’enseignant",
    shots: [
      { src: "shots/tutorat.png", at: 0 },
      { src: "shots/tutrice.png", at: 6.4 },
    ],
    cam: [
      { t: 0, s: 1.04, cx: 720, cy: 420 },
      { t: 4.0, s: 1.3, cx: 660, cy: 560 },
      { t: 6.2, s: 1.3, cx: 660, cy: 560 },
      { t: 6.8, s: 1.1, cx: 720, cy: 430 },
      { t: 10.7, s: 1.34, cx: 680, cy: 520 },
    ],
  },
  { id: "fin", kind: "end", pad: 1.8 },
];

export const sceneFrames = (s: Scene) => {
  const audio = N[s.id] ?? 4;
  const pad = s.pad ?? 1.15;
  return Math.round((audio + pad) * FPS);
};

export const AUDIO_LEAD = Math.round(0.3 * FPS);

export const timeline = (() => {
  let acc = 0;
  return scenes.map((s) => {
    const dur = sceneFrames(s);
    const from = acc;
    acc += dur;
    return { scene: s, from, dur };
  });
})();

export const TOTAL = timeline.reduce((a, t) => a + t.dur, 0);
