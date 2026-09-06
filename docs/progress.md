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

### Quatrième itération : réservation réelle, examens, programme, notes
- **Rendez-vous** : annuaire élargi aux conseillers aux démarches et coachs parentaux; créneaux concrets calculés à partir des disponibilités (30/45/60/90 min) et des réservations existantes; calendrier de sélection sur deux semaines; réservation confirmée immédiatement; déclencheur SQL `check_booking_slot` refusant un créneau hors disponibilité ou déjà pris (y compris séries hebdomadaires); lien de rencontre en ligne; fonction Edge `booking-email` (Resend) pour le courriel de confirmation.
- **Examens** : tables `exams`, `exam_questions`, `exam_attempts`; page « Examens » avec examens chronométrés, correction et explications, résultat enregistré par enfant et converti en note; ressources de préparation; administration des examens et questions; 3 examens fictifs (16 questions).
- **Programme** : `curricula` et `curriculum_items`; import par fichier CSV/texte ou collage, répartition automatique sur les jours choisis, éléments affichés dans « Ma semaine », suivi du % couvert global et par matière.
- **Résultats** : `grades`; saisie manuelle, notes issues des examens, moyenne générale et par matière, courbe d’évolution, tableau détaillé.
- Migration `202609060004_parented_v4.sql`, seed enrichi (Julie conseillère, Omar coach, programme et notes de Lina), 39 tests.

### Cinquième itération : design apaisé, photographies, tableaux de bord
- Langage visuel : étiquettes en boîte remplacées par des libellés en texte, accents dorés retirés, coins et boutons arrondis, ombres légères, onglets en pastilles sombres, libellés en casse de phrase.
- Photographies réelles (licence Unsplash via Lorem Picsum, créditées) pour la connexion, l’accueil, les cours, les rencontres, les ressources, les examens et les en-têtes de section; catalogue par mot-clé dans `src/images.ts`.
- Accueil parent : une seule action principale, progrès par enfant (programme couvert, moyenne et tendance, prochaine notion ou séance, traces), prochaine rencontre et dernières discussions.
- Accueil administration : statistiques (signalements, propositions, questions, profils à publier, familles, profils complétés, adhésions, discussions, inscriptions, rendez-vous et examens du mois), familles par ville, prochaines rencontres.
- Contenus : 3 examens supplémentaires (16 questions), 4 rencontres de plus (robotique, randonnée, club de lecture mensuel, journée sciences), membre Youssef (père de deux garçons).

### Sixième itération : tableau de bord à widgets, animations
- Accueil parent et tuteur en **widgets** (prochain rendez-vous avec compte à rebours et lien de rencontre, météo Open-Meteo de la ville du profil, raccourcis, agenda de la semaine avec jours cliquables, progrès des enfants en anneaux et courbes, programme par matière, cours en cours, prochaine rencontre, communauté, portfolio). Chaque widget se masque et se réordonne; le choix est mémorisé sur l’appareil.
- Accueil administration : liste « À traiter », graphique d’activité sur 8 semaines (discussions, rendez-vous, nouveaux membres), indicateurs animés, familles par ville, prochaines rencontres, dernières discussions.
- Animations discrètes : apparition en cascade des cartes et widgets, anneaux et barres qui se remplissent, survols; désactivées avec `prefers-reduced-motion`.
- Ressources : correction de l’affichage des cartes (photo au-dessus, étoile en coin).
- Rencontres de démonstration réduites à cinq.
- CSP : `api.open-meteo.com` autorisé pour la météo.

### Septième itération : pondération, import de calendrier, assistant
- **Résultats pondérés** : colonne `weight` (migration V5), champ « Pondération » dans le formulaire, moyennes générale et par matière pondérées, poids affiché dans le tableau.
- **Import de calendrier** : bouton « Importer un calendrier » dans Ma semaine; lecture des fichiers `.ics` (Google, Apple, Outlook) avec dépliage des lignes, dates locales, UTC et journée entière, récurrences quotidiennes/hebdomadaires/mensuelles (UNTIL et COUNT), aperçu, période, enfant; les activités importées gardent leur identifiant source pour être mises à jour sans doublon (colonne `tasks.source`).
- **Assistant « Besoin d’aide ? »** : panneau flottant; recherche locale dans cours, leçons, ressources, examens, rencontres et pages, avec réponses préparées aux questions fréquentes; fonction Edge `assistant` (Claude, clé à fournir) pour des réponses en langage naturel à partir des contenus publics.
- 42 tests.

### Huitième itération : coût de l’assistant, mentions légales
- Assistant : migration V6 (`assistant_usage`, `assistant_allow`, `assistant_record`), quota quotidien par membre et plafond global appliqués en base, limites de longueur, historique court, journal des jetons; compteur de questions restantes dans le panneau; widget « Assistant : usage et coût » sur l’accueil de l’administration; modèle et quotas configurables par secrets.
- Mentions légales dans l’application (`#legal/...`, accessibles sans connexion) : politique de confidentialité (Loi 25), politique sur les témoins, conditions d’utilisation, paiement/annulation/remboursement (phase sans paiement). Liens sur la page de connexion et le pied de page; case d’acceptation obligatoire à l’inscription, version enregistrée dans les métadonnées du compte. Champs « À COMPLÉTER » mis en évidence.
- `docs/juridique.md` : liste de contrôle Loi 25, LPC/OPC, contenus, IA, accessibilité, en préparation de la page d’accueil publique.

### Dixième itération : page d’accueil publique
- Page d’accueil à la racine du site (la connexion passe sur `#connexion`) : héros animé en couches (parallaxe, collines, soleil, oiseaux, brume, feuilles, avions en papier, étoiles, enfants dessinés en vectoriel qui jouent et apprennent), motifs griffonnés, sections Problème, Solution (six volets avec photos), Un mardi type, Offre (pile de valeur, bonus fondateurs, engagement, 50 familles fondatrices), Tarif (49 $ prévu, aucun paiement actuel, comparatif), FAQ, formulaire d’appel et liste d’attente, pied de page avec mentions légales.
- Migration V8 : table `leads` (insertion anonyme limitée à 3 par courriel et 300 par jour, lecture réservée à l’équipe); onglet « Demandes de contact » dans l’administration avec réponse par courriel et statut traité.
- Animations respectueuses de `prefers-reduced-motion`.
- Révision selon les retours : héros blanc sans photo avec de grands personnages sur les collines, titres centrés et agrandis sans sur-titres, sections rapprochées, listes sans boîtes ni icônes, solution en six points sans photos, « mardi type » retiré, offre et tarif côte à côte avec la comparaison « moins cher qu’une heure de tutorat », FAQ en grand, pied de page blanc avec logo visible, colonnes et icônes sociales.
- Section « Une plateforme qui a tous les outils dont vous avez besoin » : six captures réelles de la démonstration (accueil, semaine, carte, rendez-vous, examens, résultats) dans un cadre de navigateur, onglets et rotation automatique; script `scripts/capture-screens.mjs` (Playwright) pour les régénérer.

## Vérifications exécutées

- `npm test` : **43 tests réussis**, dont **28 tests PostgreSQL/PGlite** exécutant les six migrations (tutorat, propositions, favoris, groupes, questions, familles, profils, annuaire, messages, notifications, j’aime, avis).
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
