# ParentEd

Espace membre en français pour les parents-éducateurs : cours pour parents avec modèles et questions, organisation familiale par enfant, portfolio privé, ressources officielles et favoris, communauté avec groupes régionaux et thématiques, rencontres (liste, calendrier, filtres, récurrence, propositions des membres, rappels), tutorat complémentaire (annuaire, disponibilités, réservation, séances hebdomadaires, comptes rendus) et administration des contenus.

**État au 6 septembre 2026 :** toutes les fonctionnalités du périmètre de `docs/idee-du-service.md` sont implémentées et vérifiées en démonstration locale et dans le navigateur (ordinateur et mobile). L’adaptateur Supabase (Auth avec inscription et réinitialisation, PostgreSQL, Storage) et les migrations sont prêts; les règles SQL sont exécutées par 19 tests PostgreSQL. **Aucun projet Supabase distant ni site Cloudflare n’a encore été créé par l’équipe** : la marche à suivre complète est dans [docs/deploiement.md](docs/deploiement.md). Paiements, vidéo hébergée, carte embarquée, courriels avancés et IA restent différés.

## Démarrer immédiatement

Prérequis : Node.js 22.13+ et npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Ouvrir http://127.0.0.1:5173 et choisir **Explorer avec Amélie**. Quatre profils fictifs : Amélie (famille avec Lina et Adam), Sami (autre famille), Nadia (tutrice), Camille (administration). Choix de profil local, **pas une authentification réelle**. Les données de démonstration ne quittent pas le navigateur : n’y déposez aucun renseignement personnel. Un nouveau profil de navigateur donne une démonstration vierge; pour réinitialiser, effacer les données du site.

## Publier : Supabase et Cloudflare

Suivre [docs/deploiement.md](docs/deploiement.md). En résumé :

1. Créer un projet Supabase et exécuter **`supabase/parented-complet.sql`** dans SQL Editor (migrations + contenus fictifs; section seed supprimable).
2. Renseigner Site URL et Redirect URLs dans Authentication.
3. Copier l’URL du projet et la clé publishable dans `.env.production` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_DEMO`).
4. `npx wrangler login` puis `npm run deploy`.
5. Nommer admin et tuteurs par `update public.profiles set role = ...` avec un UUID vérifié.

Ne jamais mettre une clé `service_role` dans une variable `VITE_*`. La clé publishable est publique; la sécurité repose sur Auth et RLS.

## Supabase local (facultatif)

Nécessite Docker. `npm run supabase:start`, `npm run supabase:reset` (efface la base **locale**), reporter les valeurs de `npx supabase status` dans `.env.local` avec `SUPABASE_SERVICE_ROLE_KEY` et `DEMO_PASSWORD` (12 caractères minimum), puis `npm run seed:users` crée les quatre comptes `*@demo.parented.test` et leurs données. Studio : http://127.0.0.1:54323; courriels locaux : http://127.0.0.1:54324.

## Vérifications

```sh
npm test
npm run build
npm run format:check
npm run check:cloudflare
```

- 13 tests métier et adaptateur de démonstration : persistance, isolation entre familles, tutorat, propositions, récurrence des rencontres, fichiers iCalendar, messages, notifications, profil.
- 24 tests exécutent **les trois migrations dans PostgreSQL via PGlite** : RLS parent/admin/tuteur, familles, fichiers, bookings, comptes rendus, favoris, groupes, questions, propositions, profils, annuaire sans family_id, messages, notifications par déclencheurs, j’aime, avis.
- Auth et Storage sont représentés par des schémas minimaux dans ces tests : ils valident les règles SQL, pas GoTrue/PostgREST/Storage en bout en bout. La recette sur Supabase réel ([docs/recette.md](docs/recette.md)) reste obligatoire avant un pilote.

## Fonctionnalités

| Volet | Réalisé |
| --- | --- |
| Formation des parents | 4 cours, leçons avec exercice, modèle réutilisable (copie et .txt), lien vidéo optionnel, note personnelle, questions à l’équipe avec réponses publiques, progression persistante, administration complète |
| Ressources officielles | Bibliothèque par étape, recherche, favoris, source et date de vérification |
| Communauté | Discussions avec « J’aime », épinglage et modification, groupes régionaux et thématiques, **annuaire des membres** (ville, intérêts, âges des enfants, présentation), **carte interactive** des familles, rencontres et tuteurs (OpenStreetMap, position au centre-ville seulement, opt-in), **messages privés**, **notifications** en application, signalement et modération |
| Rencontres | Liste, calendrier et **carte**, filtres région / semaine ou week-end / gratuit / mes inscriptions, nombre de familles inscrites, annonces à la une, récurrence hebdomadaire, bimensuelle ou mensuelle, propositions des membres avec choix du lieu sur la carte, vérifiées par l’équipe, rappel .ics |
| Tutorat complémentaire | Annuaire de tuteurs (matières, qualifications, tarif indicatif, mode, **avis et note moyenne des familles**), disponibilités, demande de séance ponctuelle ou hebdomadaire, confirmation par le tuteur, séances affichées dans la semaine familiale, compte rendu pédagogique visible par la famille, vue de coordination pour l’équipe |
| Organisation familiale | Semaine par enfant, plan hebdomadaire d’intentions, fiches enfants, livres et ressources associés, portfolio privé (notes datées et fichiers avec contexte), export JSON |
| Comptes | Connexion, inscription, confirmation par courriel, réinitialisation du mot de passe; **profil public** modifiable (prénom, ville, intérêts, présentation, visibilité sur la carte); rôles parent / tuteur / admin nommés en base |

## Architecture

- `src/domain.ts` : types, règles métier, récurrence, iCalendar.
- `src/data/gateway.ts` : contrat de données; `supabase.ts` seuls appels Supabase; `demo.ts` simulateur local avec les mêmes règles d’accès; `seed.ts` données fictives.
- `src/components/` : Courses, Family, Social (ressources, rencontres), Community (discussions, annuaire, carte, messages), MapView (Leaflet), Profile, Tutoring, Admin.
- `supabase/migrations/` : trois migrations versionnées; `supabase/parented-complet.sql` généré par `npm run sql:bundle`.
- `tests/` : métier et SQL. `scripts/` : seed, comptes locaux, bundle SQL.

Hébergement : React + TypeScript + Vite servi en SPA par Cloudflare Workers Static Assets (`wrangler.jsonc`); appels authentifiés directement vers Supabase, contrôlés par RLS. En-têtes de sécurité et CSP dans `public/_headers`.

## Limites connues

- Chargement plafonné à 1 000 lignes par table, sans pagination ni temps réel.
- Une famille par compte; pas d’invitation d’un second parent.
- Rappels par fichier .ics et notifications dans l’application; pas de courriel automatique.
- Carte : tuiles OpenStreetMap chargées depuis leur serveur public (politique d’usage à respecter; prévoir un fournisseur de tuiles dédié si le trafic augmente). Aucune géolocalisation en direct; les familles sont placées au centre de leur ville, sur choix explicite.
- Vidéos : liens externes, pas d’hébergement.
- Tutorat : aucune facturation dans l’application; le tuteur facture directement la famille. Le rôle tuteur est attribué par un opérateur.
- Contenus pédagogiques fictifs à relire avant un vrai lancement.
- Démonstration localStorage non sécurisée pour de vraies données.

[État d’avancement](docs/progress.md) · [Démonstration jury](docs/demo-jury.md) · [Déploiement](docs/deploiement.md) · [Décisions](docs/ParentEd-decisions-et-concessions.md)
