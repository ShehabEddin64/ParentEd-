Nous commençons le développement de ParentEd dans ce projet. Lis AGENTS.md, les décisions et le brief dans docs/, puis inspecte les références de marque dans brand/. Distingue décisions acceptées, propositions et études historiques.

Inspecte d’abord le dossier et respecte tout code existant. Si ce dossier n’a pas son propre dépôt Git, initialise un dépôt local dédié sans modifier le dépôt parent, sans pousser ni créer de dépôt distant. Ajoute les exclusions de secrets et dépendances nécessaires.

Construis une première version fonctionnelle locale en français, avec Supabase et une cible Cloudflare. Next.js/TypeScript est une proposition : vérifie sa compatibilité Cloudflare/OpenNext avant de la retenir. N’active pas Stripe, l’IA, la carte externe ou d’autres services différés.

Travaille par incréments fonctionnels : socle et identité ParentEd; connexion et rôles; cours pour parents et progression; ressources; organisation familiale; communauté et événements liste/calendrier. Commence par un parcours vertical complet connexion → cours → progression persistante, puis continue vers les autres fonctionnalités. Prévois un espace administrateur minimal pour gérer les contenus. Évite les boutons inactifs et les succès simulés.

Pour le design, respecte le logo et les couleurs fournis. Propose une interface lisible et soignée, inspirée de la structure cours/communauté de Zenler, Skool et Podia, avec navigation stable. Ces noms sont des inspirations, pas des maquettes exactes déjà approuvées. Ne transforme pas les chiffres du business plan en contenu marketing.

Implémente migrations, autorisations et tests d’isolation entre familles. Fournis .env.example et des données fictives. Si Supabase distant n’est pas configuré, examine la possibilité de le faire fonctionner localement; sinon continue les travaux indépendants et indique exactement la configuration manquante. Ne demande pas de secrets dans la conversation.

Vérifie les parcours dans le navigateur, la persistance, les états vide/erreur/chargement et le rendu mobile. Exécute les vérifications de build et permissions pertinentes. Prépare la configuration Cloudflare sans publier le site à cette étape.

Fais les choix courants toi-même, communique les décisions importantes et avance jusqu’à une version testable. Documente ce qui fonctionne réellement, ce qui reste à faire et les commandes de démarrage dans README.md et docs/progress.md.


## Contexte du challenge — précision du porteur du projet

ParentEd est développé dans le cadre d’un challenge et sera évalué par un jury. La première version doit permettre une démonstration claire du service et de sa réponse au problème posé. Aucun barème officiel supplémentaire n’a été fourni : ne pas inventer de critères ou de pondérations.

Le brief initial porte principalement sur un modèle d’affaires : expliquer qui paie, combien, la viabilité après l’année 1, qui enseigne, le nombre d’enfants ensemble, un mardi type et l’adaptation à d’autres environnements. La plateforme rend ce fonctionnement visible.

Préparer un parcours de démonstration reproductible avec des données fictives identifiées : accueil du parent, cours et progression, organisation de la semaine, communauté et inscription à un événement. Garder les dossiers familiaux privés. Signaler honnêtement les intégrations différées et les hypothèses financières; ne pas simuler un service connecté comme réel.

Ajouter docs/demo-jury.md : étapes de démonstration, scénario familial, correspondance entre besoins et fonctionnalités, fonctions réellement opérationnelles, limites et feuille de route. Il s’agit d’un support de présentation distinct de l’interface destinée aux familles; ne pas afficher des commentaires techniques ou des arguments pour le jury partout dans le produit.

Tu disposes d’une grande liberté de réflexion, de conception et d’implémentation. Les documents décrivent notre intention et nos décisions; ils ne constituent pas une spécification rigide. Analyse-les avec esprit critique et distingue les contraintes confirmées des simples suggestions. Choisis l’architecture, les parcours et les priorités qui servent le mieux ParentEd. Tu peux améliorer, simplifier ou réorganiser les propositions en expliquant brièvement tes choix. Respecte les décisions explicites et signale les contradictions importantes. L’objectif est une expérience cohérente et fonctionnelle, convaincante pour le jury et utile aux familles. Avance de manière autonome sur les choix courants.

