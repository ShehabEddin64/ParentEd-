# ParentEd — instructions de projet

Lire docs/ParentEd-decisions-et-concessions.md en premier, puis docs/idee-du-service.md et docs/direction-marque-et-produit.md. Les dernières décisions explicites de l’utilisateur priment sur les propositions historiques. Les budgets sont des hypothèses, pas des tarifs à publier.

- Marque validée : ParentEd, logotype parentEd. Examiner les références dans brand/ avant toute réalisation visuelle. Ne pas utiliser la planche entière comme logo; extraire un actif propre si possible et signaler toute approximation.
- Supabase et Cloudflare sont retenus. Next.js + TypeScript avec OpenNext est proposé : vérifier compatibilité et versions avant adoption.
- Première version : espace membre français, rôles parent/admin, cours pour parents, ressources officielles liées, communauté, événements en liste/calendrier et organisation familiale.
- Paiements, carte externe, hébergement vidéo spécialisé, automatisations avancées et IA sont différés. Ne pas créer d’intégrations facturées pour ces fonctions.
- Les cours sont pour les parents; le tutorat futur est complémentaire. Ne pas présenter ParentEd comme une école ni promettre une conformité gouvernementale.
- Dossiers familiaux privés séparés de la communauté. Tester les accès entre deux familles et les permissions administrateur. Ne pas permettre l’auto-attribution du rôle admin.
- Garder la logique métier distincte des appels Supabase; migrations SQL versionnées, règles RLS et accès aux fichiers testés. Prévoir exports et restauration.
- Aucun secret dans Git ou dans le navigateur. Fournir .env.example sans valeurs privées. Données de démonstration fictives et identifiées.
- La disponibilité locale ne prouve pas la compatibilité Cloudflare : tester aussi la compilation et la prévisualisation cible.
- Tests proportionnés aux parcours, persistance et permissions. Vérification visuelle sur ordinateur et mobile.
- Tenir README.md et docs/progress.md à jour : installation, commandes, configuration, réalisé, restant et limites. Ne pas déclarer un service connecté si seules des données simulées sont présentes.


## Contexte du challenge — précision du porteur du projet

ParentEd est développé dans le cadre d’un challenge et sera évalué par un jury. La première version doit permettre une démonstration claire du service et de sa réponse au problème posé. Aucun barème officiel supplémentaire n’a été fourni : ne pas inventer de critères ou de pondérations.

Le brief initial porte principalement sur un modèle d’affaires : expliquer qui paie, combien, la viabilité après l’année 1, qui enseigne, le nombre d’enfants ensemble, un mardi type et l’adaptation à d’autres environnements. La plateforme rend ce fonctionnement visible.

Préparer un parcours de démonstration reproductible avec des données fictives identifiées : accueil du parent, cours et progression, organisation de la semaine, communauté et inscription à un événement. Garder les dossiers familiaux privés. Signaler honnêtement les intégrations différées et les hypothèses financières; ne pas simuler un service connecté comme réel.

Ajouter docs/demo-jury.md : étapes de démonstration, scénario familial, correspondance entre besoins et fonctionnalités, fonctions réellement opérationnelles, limites et feuille de route. Il s’agit d’un support de présentation distinct de l’interface destinée aux familles; ne pas afficher des commentaires techniques ou des arguments pour le jury partout dans le produit.
