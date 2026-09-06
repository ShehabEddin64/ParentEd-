/** Real photographs (Unsplash licence, served by Lorem Picsum; see docs/credits-photos.md). Chosen by content key, deterministic fallback otherwise. */
const catalogue = {
  course: {
    organisation: "/images/course-organisation.jpg",
    "pour commencer": "/images/course-commencer.jpg",
    apprentissages: "/images/course-apprentissages.jpg",
    démarches: "/images/course-demarches.jpg",
  },
  event: {
    jardin: "/images/event-jardin.jpg",
    café: "/images/event-cafe.jpg",
    parc: "/images/event-parc.jpg",
    marché: "/images/event-marche.jpg",
    robot: "/images/event-robotique.jpg",
    randonnée: "/images/event-randonnee.jpg",
    lecture: "/images/event-lecture.jpg",
    sciences: "/images/event-sciences.jpg",
  },
  resource: {
    démarches: "/images/resource-demarches.jpg",
    "vie privée": "/images/resource-vieprivee.jpg",
    "pour commencer": "/images/resource-commencer.jpg",
    accompagnement: "/images/resource-default.jpg",
  },
  exam: {
    mathématiques: "/images/exam-maths.jpg",
    français: "/images/exam-francais.jpg",
    sciences: "/images/exam-sciences.jpg",
    "univers social": "/images/exam-social.jpg",
  },
} as const;
const fallbacks: Record<keyof typeof catalogue, string[]> = {
  course: Object.values(catalogue.course),
  event: ["/images/event-default.jpg", ...Object.values(catalogue.event)],
  resource: [
    "/images/resource-default.jpg",
    ...Object.values(catalogue.resource),
  ],
  exam: ["/images/exam-default.jpg", ...Object.values(catalogue.exam)],
};
export const pages = {
  hero: "/images/hero.jpg",
  login: "/images/login.jpg",
  rdv: "/images/rdv.jpg",
  community: "/images/community.jpg",
  family: "/images/family.jpg",
  map: "/images/community-map.jpg",
};
function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
/** Picks a photo for a content row: by keyword in the text, else a stable fallback for that id. */
export function photoFor(
  kind: keyof typeof catalogue,
  text: string,
  id = text,
) {
  const t = text.toLocaleLowerCase("fr");
  for (const [key, path] of Object.entries(catalogue[kind]))
    if (t.includes(key)) return path;
  const list = fallbacks[kind];
  return list[hash(id) % list.length];
}
