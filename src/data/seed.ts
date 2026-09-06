import type { Data } from "../domain";
export const ids = {
  parent: "10000000-0000-4000-8000-000000000001",
  other: "10000000-0000-4000-8000-000000000002",
  admin: "10000000-0000-4000-8000-000000000003",
  family: "20000000-0000-4000-8000-000000000001",
  otherFamily: "20000000-0000-4000-8000-000000000002",
  adminFamily: "20000000-0000-4000-8000-000000000003",
};
export const seed: Data = {
  profiles: [
    {
      id: ids.parent,
      family_id: ids.family,
      display_name: "Amélie",
      role: "parent",
    },
    {
      id: ids.other,
      family_id: ids.otherFamily,
      display_name: "Sami",
      role: "parent",
    },
    {
      id: ids.admin,
      family_id: ids.adminFamily,
      display_name: "Camille",
      role: "admin",
    },
  ],
  courses: [
    {
      id: "30000000-0000-4000-8000-000000000001",
      title: "Trouver son rythme en famille",
      description:
        "Une semaine souple, des repères solides. Posez les bases d’une organisation qui vous ressemble.",
      category: "Organisation",
      position: 1,
      published: true,
    },
    {
      id: "30000000-0000-4000-8000-000000000002",
      title: "Faire ses premiers pas",
      description:
        "Clarifiez votre intention et repérez les ressources utiles pour commencer sereinement.",
      category: "Pour commencer",
      position: 2,
      published: true,
    },
    {
      id: "30000000-0000-4000-8000-000000000003",
      title: "Garder une trace des découvertes",
      description:
        "Un portfolio simple pour voir le chemin parcouru, sans tout conserver.",
      category: "Apprentissages",
      position: 3,
      published: true,
    },
  ],
  lessons: [
    {
      id: "40000000-0000-4000-8000-000000000001",
      course_id: "30000000-0000-4000-8000-000000000001",
      title: "Observer avant de planifier",
      minutes: 6,
      position: 1,
      body: "Avant de remplir un calendrier, prenez le temps d’observer votre famille. À quel moment votre enfant est-il le plus disponible ? Quelles activités vous donnent de l’énergie ? Les réponses vous aideront à choisir des repères réalistes.\n\nPendant deux ou trois jours, notez les moments de concentration, les besoins de mouvement et les pauses spontanées. Il ne s’agit pas d’évaluer la performance de votre famille : cherchez simplement ce qui facilite votre quotidien.\n\nChoisissez ensuite deux points d’appui : un moment pour commencer ensemble et un moment pour terminer. Entre les deux, gardez de la place pour les questions, les détours et le repos. Une routine utile vous soutient; elle peut évoluer.",
      exercise:
        "Notez un moment où votre famille se sent disponible. Ajoutez ensuite un premier rendez-vous dans « Ma semaine ».",
    },
    {
      id: "40000000-0000-4000-8000-000000000002",
      course_id: "30000000-0000-4000-8000-000000000001",
      title: "Construire une semaine souple",
      minutes: 8,
      position: 2,
      body: "Commencez par ce qui est déjà présent : repas, rendez-vous, sorties et temps de repos. Répartissez ensuite quelques intentions d’apprentissage dans les espaces disponibles. Évitez de planifier chaque minute.\n\nUn mardi peut commencer par une lecture partagée, se poursuivre par une promenade d’observation et se terminer par un temps calme. Les durées dépendent de votre famille. Une activité commune peut donner lieu à des défis différents selon les enfants.\n\nPrévoyez un espace libre chaque jour. Si une activité ne fonctionne pas, déplacez-la ou simplifiez-la. Le calendrier sert à rendre vos intentions visibles, pas à créer une obligation de tout accomplir.",
      exercise:
        "Planifiez deux activités et une pause pour mardi. Choisissez « Toute la famille » lorsque l’activité est partagée.",
    },
    {
      id: "40000000-0000-4000-8000-000000000003",
      course_id: "30000000-0000-4000-8000-000000000001",
      title: "Ajuster sans culpabiliser",
      minutes: 5,
      position: 3,
      body: "À la fin de la semaine, prenez quelques minutes pour regarder ce qui a aidé votre famille. Demandez à chacun de raconter une découverte et un moment difficile. Écoutez sans chercher tout de suite une solution.\n\nConservez un repère qui fonctionne et modifiez une seule chose pour la semaine suivante. Ce petit ajustement est plus facile à observer qu’un nouveau planning complet.\n\nUne activité reportée ne signifie pas qu’aucun apprentissage n’a eu lieu. Vos observations et vos échanges permettent de comprendre le chemin parcouru. Pour les démarches officielles, consultez les ressources gouvernementales liées dans la bibliothèque.",
      exercise:
        "Choisissez un repère à conserver la semaine prochaine et racontez pourquoi dans une note personnelle.",
    },
    {
      id: "40000000-0000-4000-8000-000000000004",
      course_id: "30000000-0000-4000-8000-000000000002",
      title: "Clarifier son intention",
      minutes: 7,
      position: 1,
      body: "Votre projet commence par une conversation. Qu’aimeriez-vous rendre possible dans votre quotidien ? Quels sont les besoins de votre enfant et les ressources dont vous disposez ?\n\nÉcrivez trois intentions concrètes, comme lire ensemble régulièrement ou apprendre à observer la nature. Distinguez vos envies des démarches administratives : les ressources officielles vous permettront de vérifier ces dernières.\n\nLes cours ParentEd sont destinés aux parents et proposent des pistes d’organisation. Ils ne remplacent pas les informations gouvernementales ni un accompagnement professionnel adapté à votre situation.",
      exercise:
        "Écrivez vos trois intentions. Consultez ensuite le portail officiel depuis la bibliothèque.",
    },
    {
      id: "40000000-0000-4000-8000-000000000005",
      course_id: "30000000-0000-4000-8000-000000000003",
      title: "Choisir une trace qui raconte",
      minutes: 6,
      position: 1,
      body: "Une trace utile raconte une découverte : une photo d’une construction, quelques phrases dictées ou un dessin accompagné d’une question. Conserver moins de traces, avec un peu de contexte, facilite leur relecture.\n\nNotez la date, l’activité et ce que votre enfant souhaite raconter. Privilégiez ses mots et protégez sa vie privée. Les documents de votre espace familial ne sont pas publiés dans la communauté.\n\nPrenez régulièrement le temps de revoir ces traces ensemble. Cet outil aide à observer les apprentissages; il ne constitue pas automatiquement un dossier répondant aux exigences officielles.",
      exercise:
        "Choisissez un document sans données sensibles et ajoutez-le à votre dossier familial privé.",
    },
  ],
  progress: [],
  tasks: [
    {
      id: "50000000-0000-4000-8000-000000000001",
      family_id: ids.family,
      title: "Lecture partagée : choisir notre histoire",
      child: "Toute la famille",
      date: "2026-09-08",
      time: "09:00",
      done: false,
    },
    {
      id: "50000000-0000-4000-8000-000000000002",
      family_id: ids.family,
      title: "Carnet nature au parc",
      child: "Lina",
      date: "2026-09-08",
      time: "10:30",
      done: false,
    },
    {
      id: "50000000-0000-4000-8000-000000000003",
      family_id: ids.family,
      title: "Un temps calme pour créer",
      child: "Adam",
      date: "2026-09-10",
      time: "14:00",
      done: false,
    },
  ],
  posts: [
    {
      id: "60000000-0000-4000-8000-000000000001",
      user_id: ids.other,
      author: "Sami",
      title: "Et si on commençait la journée dehors ?",
      body: "Cette semaine, nous avons commencé par une petite promenade. Les enfants ont choisi une feuille à dessiner au retour. Un moment simple qui nous a fait du bien. Et vous, quel petit rituel vous aide ?",
      category: "Au quotidien",
      created_at: "2026-09-06T13:00:00Z",
    },
    {
      id: "60000000-0000-4000-8000-000000000002",
      user_id: ids.admin,
      author: "Camille",
      title: "Bienvenue dans notre espace d’entraide",
      body: "Ici, on échange des idées et des expériences, avec respect. Gardez les renseignements personnels de vos enfants dans votre dossier familial. Présentez-vous en quelques mots si le cœur vous en dit !",
      category: "Bienvenue",
      created_at: "2026-09-05T12:00:00Z",
    },
  ],
  replies: [],
  events: [
    {
      id: "70000000-0000-4000-8000-000000000001",
      title: "Une matinée au jardin botanique",
      description:
        "Observer les couleurs de l’automne et remplir un petit carnet nature ensemble. Rencontre fictive et gratuite pour la démonstration. Chaque enfant reste sous la supervision de son parent. Annulation possible depuis cette page.",
      date: "2026-09-15",
      time: "10:00",
      location: "Montréal · Entrée du jardin",
      organizer: "Camille — ParentEd (fictif)",
      age: "6–12 ans",
      published: true,
    },
    {
      id: "70000000-0000-4000-8000-000000000002",
      title: "Café des parents : nos routines",
      description:
        "Un temps d’échange pour partager ce qui fonctionne, poser ses questions et repartir avec une idée. Rencontre fictive et gratuite. Les parents restent responsables de leurs enfants. Désinscription libre.",
      date: "2026-09-18",
      time: "13:30",
      location: "Montréal · Bibliothèque de quartier",
      organizer: "Sami — membre (fictif)",
      age: "Parents et enfants",
      published: true,
    },
  ],
  registrations: [],
  resources: [
    {
      id: "80000000-0000-4000-8000-000000000001",
      title: "L’enseignement à la maison au Québec",
      description:
        "Le point de départ officiel pour retrouver les informations du ministère. Nos cours sont un accompagnement indépendant.",
      category: "Pour commencer",
      url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison",
      source: "Gouvernement du Québec",
      checked_at: "2026-09-05",
    },
    {
      id: "80000000-0000-4000-8000-000000000002",
      title: "Démarche et étapes",
      description:
        "Retrouvez les étapes et les documents à consulter directement auprès de la source officielle.",
      category: "Démarches",
      url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/demarche-etapes",
      source: "Gouvernement du Québec",
      checked_at: "2026-09-05",
    },
    {
      id: "80000000-0000-4000-8000-000000000003",
      title: "Services de soutien",
      description:
        "Explorez les services publics décrits par le ministère et vérifiez les modalités qui concernent votre situation.",
      category: "Accompagnement",
      url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien",
      source: "Gouvernement du Québec",
      checked_at: "2026-09-05",
    },
  ],
  documents: [],
  reports: [],
};
