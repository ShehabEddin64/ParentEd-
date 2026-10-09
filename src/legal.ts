/** Notices for the local hackathon demonstration, not commercial terms. */
export const termsVersion = "2026-10-08";
export type LegalDoc = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  sections: { h: string; p: string[] }[];
};
export const legalDocs: LegalDoc[] = [
  {
    slug: "confidentialite",
    title: "À propos de cette démonstration",
    summary: "ParentEd — un projet réalisé pour Muslim Hacks à Montréal.",
    updated: termsVersion,
    sections: [
      {
        h: "Un prototype de hackathon",
        p: [
          "Cette version présente des parcours avec des familles et des intervenants fictifs. Ce n’est pas un service commercial : aucun compte réel, abonnement, paiement, courriel ou rendez-vous externe n’est créé.",
        ],
      },
      {
        h: "Des données dans votre navigateur",
        p: [
          "Les essais et fichiers sont stockés localement dans ce navigateur. Ils ne sont pas envoyés à un serveur. Les profils ne constituent pas une authentification sécurisée : une personne ayant accès à ce navigateur peut lire ou modifier ces données. N’utilisez aucune donnée personnelle ou sensible.",
          "Pour effacer vos essais, utilisez les réglages de votre navigateur pour supprimer les données de ce site. L’effacement est définitif; exportez d’abord les exemples que vous souhaitez conserver.",
        ],
      },
      {
        h: "Liens et exemples",
        p: [
          "Les ressources officielles ouvrent des sites tiers lorsque vous cliquez dessus. Leurs propres règles s’appliquent alors. La météo est fictive et la carte est un schéma local sans fond cartographique externe. La recherche d’aide utilise les contenus locaux, sans intelligence artificielle payante.",
        ],
      },
      {
        h: "Un outil d’accompagnement",
        p: [
          "ParentEd n’est ni une école ni une garantie de conformité gouvernementale. Les cours et résultats sont des exemples de démonstration.",
        ],
      },
    ],
  },
];
export const legalLinks = legalDocs.map((d) => ({
  href: "#legal/" + d.slug,
  label: d.title,
}));
