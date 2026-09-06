# Avancement ParentEd

Mis à jour le 6 septembre 2026 (troisième itération).

## Réalisé

### Première itération
- Socle React/TypeScript/Vite + Cloudflare Workers Static Assets, identité parentEd, navigation stable, responsive.
- Contrat de données, adaptateur Supabase, simulateur local; cours et progression; ressources; semaine familiale et dossier privé; communauté et signalements; événements liste/calendrier; administration; migration SQL, RLS, bucket privé; tests métier et PostgreSQL; README, recette, scénario jury, sauvegarde.

### Seconde itération : périmètre complet de `idee-du-service.md`
- **Cours** : modèles réutilisables (copie / .txt), lien vidéo optionnel, note personnelle par leçon, questions à l’équipe avec réponses publiques, quatrième cours « Préparer ses bilans ». Administration des nouveaux champs et onglet Questions.
- **Ressources** : favoris personnels et filtre « Mes favoris », deux ressources officielles supplémentaires.
- **Communauté** : groupes régionaux et thématiques, adhésion, publication et filtre par groupe; administration des groupes.
- **Rencontres** : région, prix, annonce à la une, récurrence (hebdomadaire, bimensuelle, mensuelle) avec développement des occurrences, filtres semaine/week-end/gratuit/région, propositions des membres en brouillon vérifiées puis publiées par l’équipe, rappel iCalendar, lien vers une carte externe.
- **Tutorat** : tables `tutors`, `tutor_availability`, `bookings`, `tutor_reports`; rôle `tutor`; annuaire, demande de séance ponctuelle ou hebdomadaire avec contrôle des jours de disponibilité, confirmation / refus / clôture par le tuteur, compte rendu pédagogique lisible par la famille, séances confirmées affichées dans la semaine, vue de coordination admin. Profil de démonstration Nadia.
- **Organisation familiale** : fiches enfants, plan hebdomadaire d’intentions, livres et ressources associés, portfolio privé combinant notes datées et fichiers avec enfant et contexte, export JSON étendu.
- **Comptes** : inscription, confirmation par courriel, réinitialisation et changement du mot de passe, gestion des liens Auth dans l’URL. Rôles admin/tuteur toujours nommés en base.
- **Migration** `202609060002_parented_v2.sql`, seed régénéré, script `npm run sql:bundle` produisant `supabase/parented-complet.sql`, script de comptes locaux étendu (quatre comptes, liaison du tuteur), `npm run deploy`.
- **Documentation** : `docs/deploiement.md` (Supabase, Auth, Cloudflare, rôles, dépannage), README, scénario jury et recette mis à jour.

### Troisième itération : une vraie communauté
- **Profils membres** : ville (liste de villes du Québec, position au centre-ville), présentation, âges des enfants sans prénom, intérêts, visibilité sur la carte; page « Mon profil ». Vue `members` sans `family_id`; mise à jour limitée par droits de colonnes (rôle et famille immuables).
- **Annuaire** avec recherche et filtres ville / intérêt; « Familles près de chez vous » sur l’accueil et dans la communauté.
- **Carte interactive** (Leaflet + OpenStreetMap, sans compte ni clé) : familles agrégées par ville, rencontres à venir, tuteurs par région; panneau de détail avec actions; vue carte des rencontres; choix du lieu d’une proposition en cliquant sur la carte; coordonnées dans l’administration.
- **Messages privés** entre membres, conversations, accusé de lecture.
- **Notifications** en application, produites par des déclencheurs SQL : réponse à ma discussion, j’aime, message reçu, demande et statut de séance, compte rendu, question répondue, rencontre publiée. Cloche avec compteur, « tout marquer lu ».
- **Discussions** : j’aime, épinglage par l’équipe, modification par l’auteur, catégorie « Rencontres et sorties », dernière activité.
- **Rencontres** : nombre de familles inscrites (vue agrégée, inscriptions individuelles toujours privées).
- **Tutorat** : avis des familles après une séance terminée, note moyenne sur les fiches, avis visibles par le tuteur.
- Migration `202609060003_parented_v3.sql`, seed et bundle SQL régénérés, comptes de démonstration Fatima et Marc, 37 tests.

## Vérifications exécutées

- `npm test` : **37 tests réussis**, dont **24 tests PostgreSQL/PGlite** exécutant les trois migrations (tutorat, propositions, favoris, groupes, questions, familles, profils, annuaire, messages, notifications, j’aime, avis).
- `npm run build` et `tsc -b` réussis; `npm run format:check` réussi; `wrangler deploy --dry-run` réussi, sans publication.
- Navigateur (Vite 5173, ordinateur 1280 px et mobile 375 px) : accueil, tutorat, rencontres avec annonce à la une et récurrence, communauté avec groupes, semaine avec plan hebdomadaire et séance de tutorat, leçon avec modèle/note/questions, portfolio; flux exécutés : demande de séance (refus d’un jour sans disponibilité, puis acceptation), favori, adhésion à un groupe, proposition de rencontre visible par l’administration, espace tutrice Nadia avec ses séances.

## Ce qui reste à faire par le propriétaire

- Créer le projet Supabase, exécuter `supabase/parented-complet.sql`, configurer Auth, puis `npx wrangler login` et `npm run deploy` (voir `docs/deploiement.md`). Aucun compte fournisseur n’a été créé par l’équipe technique.
- Exécuter la recette sur l’instance réelle, y compris inscription, confirmation par courriel, réinitialisation, deux familles, un tuteur et l’administration.
- Relire les contenus pédagogiques, remplacer les fiches fictives de tuteurs, rédiger la politique de confidentialité et la procédure de suppression de compte.

## Concessions de cette version

- Rappels par fichier .ics; pas de courriel ni notification automatique (Resend différé).
- Carte : lien externe; pas de carte embarquée (Mapbox différé).
- Vidéos : liens externes (Cloudflare Stream différé).
- Aucun paiement ni facturation; le tuteur facture directement.
- Une famille par compte; pas d’invitation d’un second parent.
- Chargement plafonné à 1 000 lignes par table; pas de temps réel.
- Démonstration localStorage non sécurisée pour de vraies données; contenus fictifs à relire.
