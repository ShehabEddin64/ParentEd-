# ParentEd — démonstration au jury

Support de présentation, distinct de l’interface familiale. Aucun barème officiel n’a été fourni.

## Ce que l’on démontre

ParentEd accompagne **les parents qui enseignent à la maison** : acquérir des repères, les appliquer au quotidien, conserver des traces et trouver de l’entraide. Ce n’est pas une école, une garderie ou une promesse de conformité gouvernementale.

## Préparation reproductible

1. Suivre le README, démarrer `npm run dev`, ouvrir http://127.0.0.1:5173 dans un profil de navigateur neuf pour une démonstration vierge.
2. Choisir « Explorer avec Amélie ». Annoncer une seule fois : **famille et contenus fictifs, sauvegarde dans ce navigateur; Supabase n’est pas connecté sur cette machine**.
3. Scénario : Amélie accompagne Lina et Adam. Elle veut une semaine plus souple, quelques activités communes et des traces simples. Ce scénario illustre deux enfants d’une même famille; il ne fixe pas une taille de classe.
4. La semaine de référence est celle du **7 au 13 septembre 2026**, indépendamment de la date du jour. Les rencontres de démonstration ont lieu les 15 et 18 septembre 2026.

Avec Supabase local configuré, utiliser les comptes de démonstration créés par `npm run seed:users` et **désactiver le simulateur**. Ne dire « connecté à Supabase » qu’après avoir vérifié les comptes et les écritures dans cette instance.

## Parcours, environ 6 minutes

| Étape | Manipulation | Ce que cela rend concret |
| --- | --- | --- |
| 1. Accueil | Montrer les cours, le planning et la rencontre à venir | Un point de départ compréhensible pour le parent |
| 2. Se former | Ouvrir « Trouver son rythme en famille », lire « Observer avant de planifier » | Les cours s’adressent à l’adulte; une idée applicable immédiatement |
| 3. Progression | Marquer la leçon terminée; recharger la page et montrer 33 % | Une progression persistante, reprise à son rythme |
| 4. Mardi type | Ouvrir « Ma semaine », ajouter une pause mardi à 11 h; modifier si nécessaire | Lecture partagée à 9 h, carnet nature à 10 h 30, marge pour respirer |
| 5. Vie privée | Ouvrir « Dossier privé », déposer un PNG/PDF fictif; télécharger le fichier ou l’export | Les traces familiales sont séparées de la communauté |
| 6. Entraide | Lire la discussion sur les promenades; publier une réponse fictive | L’expérience des parents devient une ressource partagée |
| 7. Rencontres | S’inscrire à la matinée au jardin; recharger puis montrer le calendrier | Inscription enregistrée et rencontre située dans le temps |
| 8. Isolation | Se déconnecter puis entrer avec Sami | Sa progression et son planning sont distincts de ceux d’Amélie |
| 9. Administration, facultatif | Entrer avec Camille, modifier un cours ou traiter un signalement | L’équipe anime et maintient les contenus; elle n’accède pas aux dossiers des familles |

Pour un format de trois minutes : étapes 1 à 4, puis 7. Ne pas inventer un échange réel avec une famille, un paiement, un courriel ou une réservation externe.

## Réponse au brief de modèle d’affaires

Les hypothèses ci-dessous sont **des propositions de travail**, non des tarifs proposés dans le produit. Références : `ParentEd-modele-operationnel-et-financier.md`, puis les corrections de `ParentEd-couts-techniques-et-equipe.md`. Les décisions Supabase/Cloudflare remplacent les anciennes propositions Vercel.

- **Qui paie et combien ?** Hypothèse historique : abonnement familial de 49 CAD/mois. Prix, contenu commercial et acceptation par les familles restent à valider. Aucun encaissement dans la V1. Les frais de tutorat proposés restent séparés et le tutorat n’est pas opérationnel dans le produit.
- **Viabilité après l’année 1 ?** Le scénario corrigé retient 78 000 CAD de coûts annuels fixes. Avec l’hypothèse de frais de 2,064 CAD par mensualité, le seuil calculé est de 139 familles payantes moyennes sur douze mois; à 150 familles, résultat hypothétique de 6 484,80 CAD avant impôt et coûts additionnels. Ces calculs ne démontrent ni acquisition, ni rétention, ni capacité de support. L’année 1 exige un financement propre à valider; ce n’est pas une activité immédiatement autofinancée.
- **Qui enseigne ?** Le parent assure l’enseignement des enfants. Une équipe pédagogique doit produire et relire les cours pour les parents. Les textes actuels sont des contenus de démonstration, pas une bibliothèque pédagogique validée. La coordination anime et modère; ses capacités humaines ne sont pas remplacées par l’application.
- **Combien d’enfants ensemble ?** Aucun modèle de classe dans cette V1. Les rencontres supposent la présence et la supervision des parents. La proposition historique de 6 à 10 familles est un repère de confort à valider selon lieu et activité, pas un ratio légal ni une capacité imposée par le logiciel. Le tutorat individuel futur reste distinct.
- **Un mardi type ?** Partir du planning d’Amélie : lecture ensemble, sortie d’observation, pause; garder une trace si utile et prendre un court moment de formation pour le parent. L’horaire est une illustration, pas un programme certifié. Transport, présence et supervision restent familiaux.
- **Adaptation ailleurs ?** Le socle cours/organisation/communauté se réutilise. Les ressources, démarches, langue, horaires, services humains et contrats doivent être adaptés et revus pour chaque territoire. La disponibilité technique ne garantit pas la disponibilité d’une communauté locale.

## Réellement opérationnel / limites

**Exécuté en démonstration locale :** entrée dans les profils fictifs, cours, progression persistante, tâches, réponse communautaire, inscription persistante, administration de contenu; interface responsive. Les règles SQL sont exécutées par les tests PostgreSQL, y compris l’isolation de fichiers.

**Implémenté, à valider sur Supabase complet :** authentification courriel/mot de passe, écritures PostgreSQL via PostgREST, fichiers privés via Storage. Aucun service distant n’a été connecté. La prévisualisation Cloudflare a été testée; aucun site publié.

**À compléter pour un pilote réel :** instance Supabase, recette Auth/Storage, comptes et récupération, contenus pédagogiques et animation réelle, traitement des données et sauvegarde complète. Ensuite seulement, décider des intégrations différées : paiements, vidéo, tutorat, carte, rappels et IA.
