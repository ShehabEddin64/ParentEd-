/** Legal documents shown at #legal/<slug>. Drafts prepared for Québec (Loi 25, LPC); fields marked [À COMPLÉTER] must be filled and the whole reviewed by a lawyer before public launch. */
export const termsVersion = "2026-09-06";
export const organisation = {
  name: "[À COMPLÉTER : dénomination légale de l’organisation, ex. ParentEd inc. ou Coopérative ParentEd]",
  address: "[À COMPLÉTER : adresse postale, Québec]",
  email: "[À COMPLÉTER : courriel de contact, ex. bonjour@parented.ca]",
  privacyOfficer:
    "[À COMPLÉTER : nom et titre de la personne responsable de la protection des renseignements personnels]",
  privacyEmail:
    "[À COMPLÉTER : courriel de la personne responsable, ex. confidentialite@parented.ca]",
};
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
    title: "Politique de confidentialité",
    summary:
      "Quels renseignements ParentEd recueille, pourquoi, où ils sont hébergés, qui y accède et quels sont vos droits.",
    updated: termsVersion,
    sections: [
      {
        h: "1. Qui nous sommes",
        p: [
          `ParentEd est exploité par ${organisation.name}, ${organisation.address}. Nous sommes responsables des renseignements personnels recueillis par l’application ParentEd (ci-après « le Service »). La personne responsable de la protection des renseignements personnels est ${organisation.privacyOfficer}, joignable à ${organisation.privacyEmail}.`,
          "Cette politique est rédigée conformément à la Loi sur la protection des renseignements personnels dans le secteur privé (Québec), telle que modifiée par la Loi 25. Elle s’applique à toute personne qui crée un compte ou consulte le Service.",
        ],
      },
      {
        h: "2. Renseignements que nous recueillons",
        p: [
          "Compte : adresse courriel, mot de passe (haché, jamais lisible par nous), prénom affiché, date de création.",
          "Profil public facultatif : ville ou secteur, présentation, tranches d’âge des enfants sans prénom, intérêts, choix d’apparaître sur la carte. Ces éléments sont visibles par les autres membres connectés seulement si vous les renseignez.",
          "Espace familial privé : prénoms ou surnoms d’enfants, année de naissance facultative, activités planifiées, programme, notes et résultats, notes de portfolio et fichiers déposés (PDF, PNG, JPEG). Ces données ne sont visibles que par le compte qui les a créées; l’équipe ParentEd n’y a pas accès par l’application.",
          "Communauté : discussions, réponses, réactions, adhésions aux groupes, messages privés, signalements, questions posées sous les leçons.",
          "Rendez-vous : demandes de séance (enfant, sujet, date, note facultative), comptes rendus rédigés par l’intervenant, avis laissés.",
          "Assistant : la question posée et l’historique court de la conversation en cours; jamais les données de l’espace familial.",
          "Données techniques : journaux de connexion et d’erreurs de nos hébergeurs (adresse IP, navigateur, horodatage), conservés par ceux-ci pour la sécurité.",
        ],
      },
      {
        h: "3. Pourquoi nous les utilisons",
        p: [
          "Fournir le Service : authentification, sauvegarde de votre espace, affichage de la communauté, prise de rendez-vous, notifications dans l’application, courriels de confirmation.",
          "Améliorer le Service à partir de statistiques agrégées (nombre de membres, de rencontres, de questions). Nous n’utilisons pas de profilage publicitaire.",
          "Respecter nos obligations : sécurité, modération, réponses aux demandes légales.",
          "Nous ne vendons ni ne louons vos renseignements. Nous ne les utilisons pas pour entraîner des modèles d’intelligence artificielle.",
        ],
      },
      {
        h: "4. Renseignements concernant les enfants",
        p: [
          "ParentEd s’adresse aux parents. Les renseignements sur les enfants sont saisis par le parent, restent dans son espace privé et servent uniquement à son organisation. Nous demandons de ne pas y déposer de renseignements sensibles (santé, diagnostics, numéros officiels) et de ne jamais en publier dans la communauté.",
          "Les intervenants (tuteurs, conseillers, coachs) voient uniquement le prénom ou surnom, le sujet et la note que le parent leur transmet lors d’une réservation, ainsi que leurs propres comptes rendus.",
        ],
      },
      {
        h: "5. Où sont hébergées les données et qui y accède",
        p: [
          "Base de données, comptes et fichiers : Supabase, sur des serveurs situés dans la région choisie du projet ([À COMPLÉTER : ex. Canada (Central) / États-Unis]). Hébergement du site : Cloudflare (réseau mondial). Ces fournisseurs agissent comme sous-traitants et n’utilisent pas vos données pour leur compte.",
          "Services utilisés à la demande : Open-Meteo (météo : seules les coordonnées du centre de votre ville sont envoyées), OpenStreetMap (fond de carte : votre adresse IP est vue par leurs serveurs lors du chargement des tuiles), Resend (courriels de confirmation de rendez-vous, si activé), Anthropic (assistant : le texte de votre question, si activé). Certains de ces fournisseurs sont situés hors du Québec; nous avons évalué ces transferts et limitons les données transmises au strict nécessaire.",
          "Accès interne : l’équipe ParentEd accède aux contenus publiés (cours, rencontres, discussions, signalements) et aux données de coordination des rendez-vous, jamais à l’espace familial privé par l’application. L’accès direct à la base est réservé à des opérateurs autorisés, journalisé, et utilisé uniquement pour la maintenance ou la sécurité.",
        ],
      },
      {
        h: "6. Conservation",
        p: [
          "Vos données sont conservées tant que votre compte est actif. À la suppression du compte, l’espace familial, les fichiers, les messages et le profil sont supprimés dans un délai de 30 jours; les contributions publiques (discussions, réponses) sont anonymisées ou supprimées à votre demande. Les sauvegardes techniques sont écrasées selon leur cycle ([À COMPLÉTER : ex. 30 jours]).",
          "Les journaux techniques des hébergeurs sont conservés selon leurs propres durées, à des fins de sécurité.",
        ],
      },
      {
        h: "7. Vos droits",
        p: [
          "Vous pouvez consulter et corriger vos renseignements dans l’application (Mon profil, Ma semaine), exporter votre espace familial (Ma semaine → Portfolio → Exporter), retirer votre consentement à apparaître sur la carte, et demander l’accès, la rectification, la portabilité ou la suppression de vos renseignements en écrivant à " +
            organisation.privacyEmail +
            ". Nous répondons dans les 30 jours.",
          "Si vous n’êtes pas satisfait de notre réponse, vous pouvez porter plainte à la Commission d’accès à l’information du Québec (cai.gouv.qc.ca).",
        ],
      },
      {
        h: "8. Sécurité",
        p: [
          "Connexion chiffrée (HTTPS), mots de passe hachés, règles d’accès appliquées dans la base de données pour chaque famille, fichiers dans un espace privé sans lien public, en-têtes de sécurité du navigateur. En cas d’incident de confidentialité présentant un risque de préjudice sérieux, nous en informons les personnes concernées et la Commission d’accès à l’information, et nous le consignons dans notre registre des incidents.",
        ],
      },
      {
        h: "9. Modifications",
        p: [
          "Nous pouvons modifier cette politique. La date de mise à jour figure en haut de la page; les changements importants sont annoncés dans l’application. La version en vigueur est celle publiée ici.",
        ],
      },
    ],
  },
  {
    slug: "temoins",
    title: "Politique sur les témoins (cookies) et le stockage local",
    summary:
      "ParentEd n’utilise aucun témoin publicitaire ni outil de suivi tiers. Seul le stockage strictement nécessaire au fonctionnement est utilisé.",
    updated: termsVersion,
    sections: [
      {
        h: "1. Ce que nous utilisons",
        p: [
          "Session de connexion : un jeton stocké dans votre navigateur (localStorage) par notre fournisseur d’authentification, nécessaire pour rester connecté. Durée : jusqu’à la déconnexion ou l’expiration du jeton.",
          "Préférences d’affichage : la disposition de vos widgets d’accueil, le mode de démonstration, la mémoire de la météo pendant 30 minutes. Ces valeurs restent sur votre appareil et ne nous sont pas transmises.",
          "Mode démonstration : lorsque vous explorez avec un profil fictif, toutes vos actions sont stockées uniquement dans votre navigateur.",
          "Aucun témoin de mesure d’audience, de publicité ou de réseaux sociaux. Aucun pixel de suivi dans nos courriels.",
        ],
      },
      {
        h: "2. Témoins de tiers",
        p: [
          "Les fonds de carte (OpenStreetMap) et les prévisions météo (Open-Meteo) sont chargés directement depuis leurs serveurs, sans témoin de notre part. Consultez leurs politiques respectives pour leurs journaux techniques.",
          "Cloudflare, notre hébergeur, peut déposer un témoin strictement nécessaire à la sécurité (protection contre les abus) ; il ne sert pas au suivi.",
        ],
      },
      {
        h: "3. Vos choix",
        p: [
          "Comme nous n’utilisons que du stockage strictement nécessaire, aucun bandeau de consentement n’est requis. Vous pouvez à tout moment effacer les données du site dans les réglages de votre navigateur; vous serez alors déconnecté et vos préférences d’affichage reviendront par défaut.",
          "Si nous ajoutons un jour un outil de mesure d’audience, nous demanderons votre consentement au préalable et mettrons cette page à jour.",
        ],
      },
    ],
  },
  {
    slug: "conditions",
    title: "Conditions d’utilisation",
    summary:
      "Les règles d’utilisation de ParentEd : à qui s’adresse le Service, ce qu’il est et n’est pas, les responsabilités de chacun.",
    updated: termsVersion,
    sections: [
      {
        h: "1. Le Service",
        p: [
          `ParentEd est un espace membre d’accompagnement des parents-éducateurs, exploité par ${organisation.name}. Il propose des cours destinés aux parents, des liens vers des ressources officielles accompagnés d’explications, des outils d’organisation familiale, une communauté, des rencontres entre familles, des examens d’entraînement et la prise de rendez-vous avec des intervenants partenaires.`,
          "ParentEd n’est ni une école, ni un service de garde, ni un organisme gouvernemental. Il ne délivre aucun diplôme, ne garantit aucune conformité aux obligations légales de l’enseignement à la maison et ne remplace pas les sources officielles du ministère de l’Éducation, qui font seules foi. Le parent conserve l’entière responsabilité de l’enseignement et des démarches.",
        ],
      },
      {
        h: "2. Compte et admissibilité",
        p: [
          "Le Service est réservé aux personnes majeures. Un compte par parent; vous êtes responsable de la confidentialité de votre mot de passe et des actions réalisées avec votre compte. Vous vous engagez à fournir des renseignements exacts et à ne pas créer de compte au nom d’autrui.",
          "Les rôles d’administration et d’intervenant sont attribués par l’équipe ParentEd après vérification.",
        ],
      },
      {
        h: "3. Règles de la communauté",
        p: [
          "Bienveillance et respect; aucun contenu haineux, harcelant, trompeur, publicitaire non sollicité ou illégal. Ne publiez jamais de renseignements personnels sur des enfants (les vôtres ou ceux d’autrui) dans les discussions, les groupes, les messages ou les propositions de rencontre.",
          "Vous restez propriétaire de vos contenus et accordez à ParentEd une licence non exclusive pour les afficher dans le Service. L’équipe peut retirer un contenu, suspendre ou fermer un compte en cas de manquement, après avis lorsque c’est possible.",
        ],
      },
      {
        h: "4. Rencontres entre familles",
        p: [
          "Les rencontres publiées sont proposées par l’équipe ou par des membres, après vérification de forme. ParentEd ne fournit pas de supervision : chaque parent reste présent et responsable de ses enfants, du transport, de l’assurance et de la sécurité. Vérifiez l’organisateur, le lieu, l’âge visé et le prix affichés. ParentEd n’est pas partie aux activités organisées par des membres ou des tiers.",
        ],
      },
      {
        h: "5. Rendez-vous avec les intervenants",
        p: [
          "Les tuteurs et coachs partenaires sont des professionnels indépendants : ils fixent leurs tarifs, facturent directement les familles et sont responsables de leurs prestations. ParentEd vérifie les qualifications annoncées et les références selon sa procédure, met à disposition l’agenda et recueille les comptes rendus, sans garantir un résultat scolaire.",
          "Un compte rendu d’intervenant est une observation pédagogique; ce n’est pas une évaluation officielle. Les rencontres avec un conseiller aux démarches sont comprises dans l’accompagnement et ne constituent pas un avis juridique.",
          "Annulation : un rendez-vous peut être annulé depuis l’application; les conditions d’annulation tardive ou de non-présentation sont celles de l’intervenant, affichées sur sa fiche ([À COMPLÉTER : délai standard, ex. 24 heures]).",
        ],
      },
      {
        h: "6. Contenus, cours et examens d’entraînement",
        p: [
          "Les cours, modèles et examens d’entraînement sont des contenus originaux de ParentEd destinés aux parents. Ils sont protégés par le droit d’auteur; l’usage est personnel et familial. Les examens d’entraînement sont fictifs, inspirés du format des épreuves, et n’ont aucune valeur officielle.",
          "Les ressources officielles sont des liens vers les sites gouvernementaux, accompagnés de nos explications indépendantes datées. En cas de divergence, la source officielle prévaut.",
        ],
      },
      {
        h: "7. Assistant",
        p: [
          "L’assistant « Besoin d’aide ? » répond à partir des contenus de ParentEd et peut se tromper. Il ne remplace ni un conseiller, ni un professionnel, ni la source officielle. Son usage est limité par un nombre de questions quotidien.",
        ],
      },
      {
        h: "8. Disponibilité et responsabilité",
        p: [
          "Nous faisons de notre mieux pour maintenir le Service disponible et sauvegardé, sans garantie d’absence d’interruption. Dans les limites permises par la loi, ParentEd n’est pas responsable des dommages indirects résultant de l’usage du Service, des activités entre membres ou des prestations des intervenants. Rien dans ces conditions ne retire les droits que la Loi sur la protection du consommateur vous accorde.",
        ],
      },
      {
        h: "9. Résiliation",
        p: [
          "Vous pouvez fermer votre compte à tout moment en écrivant à " +
            organisation.email +
            " ; vos données sont alors traitées selon la politique de confidentialité. Nous pouvons suspendre un compte en cas de manquement grave ou d’exigence légale.",
        ],
      },
      {
        h: "10. Droit applicable",
        p: [
          "Ces conditions sont régies par les lois du Québec et les lois du Canada qui s’y appliquent. Tout différend relève des tribunaux du district judiciaire de [À COMPLÉTER], sous réserve des recours prévus par la Loi sur la protection du consommateur.",
          `Contact : ${organisation.email}. Version du ${termsVersion}.`,
        ],
      },
    ],
  },
  {
    slug: "paiement",
    title: "Paiement, annulation et remboursement",
    summary:
      "Phase actuelle sans paiement dans l’application; ce que nous nous engageons à afficher avant tout abonnement futur.",
    updated: termsVersion,
    sections: [
      {
        h: "1. Phase actuelle : aucun paiement dans l’application",
        p: [
          "Dans cette première phase, ParentEd ne perçoit aucun paiement par l’application : pas d’abonnement, pas de frais, aucune donnée bancaire recueillie. L’accès est accordé par l’équipe aux familles participantes.",
          "Les seules sommes qui peuvent être échangées le sont directement entre une famille et un intervenant indépendant (tuteur, coach) pour ses séances, ou avec l’organisateur d’une rencontre payante clairement identifiée. ParentEd n’encaisse rien et ne prend aucune commission sur ces montants.",
        ],
      },
      {
        h: "2. Séances avec les intervenants",
        p: [
          "Le tarif indicatif est affiché sur la fiche de l’intervenant; le prix définitif, le mode de paiement et la facture sont convenus avec lui. Annulation : depuis l’application, à tout moment; les frais d’annulation tardive éventuels sont ceux annoncés par l’intervenant ([À COMPLÉTER : ex. gratuit jusqu’à 24 heures avant]). Toute contestation sur une prestation est d’abord réglée avec l’intervenant; l’équipe ParentEd peut être saisie à " +
            organisation.email +
            " et retirer un intervenant du réseau.",
        ],
      },
      {
        h: "3. Rencontres payantes",
        p: [
          "Lorsqu’une rencontre a un prix (entrée d’un site, tarif de groupe), il est affiché sur sa fiche avec l’organisateur. Le paiement se fait sur place ou auprès de l’organisateur; l’inscription dans ParentEd est gratuite et annulable depuis la page de la rencontre.",
        ],
      },
      {
        h: "4. Abonnement futur : nos engagements",
        p: [
          "Si ParentEd propose un abonnement payant, nous publierons avant tout paiement : le prix toutes taxes comprises, le contenu exact de l’offre, la fréquence et le mode de renouvellement, la durée d’engagement, la procédure d’annulation, la politique de remboursement et les coordonnées du service à la clientèle, conformément aux règles des contrats à distance de la Loi sur la protection du consommateur du Québec (Office de la protection du consommateur).",
          "Principes retenus : abonnement mensuel sans engagement annuel, annulation en quelques clics prenant effet à la fin de la période payée, remboursement intégral en cas d’indisponibilité prolongée du Service imputable à ParentEd, contrat transmis par courriel. [À COMPLÉTER : hypothèse de prix, ex. 49 $ par mois, à valider.]",
          "Aucun de ces engagements ne limite les droits que la loi vous accorde, y compris le droit de résolution prévu pour les contrats à distance.",
        ],
      },
      {
        h: "5. Contact",
        p: [
          `Questions sur les paiements ou une facture d’intervenant : ${organisation.email}. Version du ${termsVersion}.`,
        ],
      },
    ],
  },
];
export const legalLinks = legalDocs.map((d) => ({
  href: "#legal/" + d.slug,
  label: d.title,
}));
