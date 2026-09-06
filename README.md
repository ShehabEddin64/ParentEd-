# ParentEd

Première version locale en français pour accompagner les parents-éducateurs : cours et progression, organisation familiale, documents privés, ressources officielles, communauté, événements et administration des contenus.

**État au 6 septembre 2026 :** démonstration fonctionnelle avec persistance dans le navigateur; adaptateur Supabase Auth/PostgreSQL/Storage et migrations implémentés. Aucun Supabase distant connecté. Supabase local ne peut pas démarrer sur la machine inspectée : Docker et Podman sont absents. Cloudflare Workers Static Assets compilé, contrôlé en dry-run et prévisualisé localement. Aucun site publié, aucun paiement activé.

## Démarrer immédiatement

Prérequis : Node.js 22.13+ (Node 24.13.1 utilisé ici), npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Ouvrir http://127.0.0.1:5173 et choisir **Explorer avec Amélie**. `VITE_ENABLE_DEMO=true` active explicitement la démonstration dans les builds. En serveur de développement, elle est aussi disponible sans fichier d’environnement.

Trois profils fictifs sont proposés : Amélie, Sami (autre famille), Camille (administration). Il s’agit d’un choix de profil local, **pas d’une authentification réelle**. Les données de démonstration ne quittent pas le navigateur. Ne pas y déposer de renseignements personnels. Les contrôles du simulateur ne constituent pas une frontière de sécurité : une personne ayant accès à ce navigateur peut lire son stockage.

La progression, les activités, les réponses et les inscriptions persistent après rechargement et déconnexion. Chaque origine/port a son stockage indépendant : 5173 et 8787 ont deux démonstrations distinctes. Un nouveau profil de navigateur donne une démonstration vierge. Pour réinitialiser un essai, effacer les données du site dans les outils du navigateur après avoir exporté ce qui doit être conservé.

## Activer Supabase local

1. Installer et démarrer un moteur compatible Docker. La CLI Supabase est une dépendance du projet.
2. Démarrer la stack et appliquer les migrations/données fictives :

```sh
npm run supabase:start
npm run supabase:reset
```

`supabase:reset` efface **la base locale** du projet. Ne pas l’utiliser sur des données à conserver.

3. Reporter **localement**, sans partager de secrets dans une conversation, les valeurs fournies par `npx supabase status` dans `.env.local` :

```dotenv
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<clé anon ou publishable locale>
VITE_ENABLE_DEMO=false
SUPABASE_SERVICE_ROLE_KEY=<clé service locale, pour le script uniquement>
DEMO_PASSWORD=<mot de passe choisi, au moins 12 caractères>
```

4. Créer les trois comptes locaux et leurs données :

```sh
npm run seed:users
npm run dev
```

Comptes : `amelie@demo.parented.test`, `sami@demo.parented.test`, `admin@demo.parented.test`. Ils utilisent le mot de passe défini localement dans `DEMO_PASSWORD`. Le script refuse un hôte distant et ne journalise pas de secrets. Il est idempotent; pour un compte déjà créé, son mot de passe existant est conservé.

5. Ouvrir l’application, se connecter avec courriel/mot de passe, terminer une leçon, recharger, se déconnecter/reconnecter et vérifier la progression. Tester la famille Sami et l’administration; voir [le protocole de recette](docs/recette.md).

Studio : http://127.0.0.1:54323. Boîte de courriels locale : http://127.0.0.1:54324. La confirmation de courriel est désactivée **uniquement dans la configuration locale**. Les comptes sont fournis par l’équipe; pas de parcours public d’inscription/récupération de mot de passe dans cette V1.

### Projet Supabase géré

Appliquer les migrations versionnées à un projet choisi par le propriétaire, puis renseigner l’URL et la clé publique dans `.env.local`. Ne pas charger `seed.sql` dans une base de production sans avoir choisi explicitement les contenus de démonstration. Créer les comptes avec les outils d’administration Supabase. Le trigger crée toujours un profil **parent** et une famille indépendante; il ignore les rôles/familles envoyés dans les métadonnées.

La nomination d’un administrateur se fait exclusivement par un opérateur autorisé, dans la base, après vérification du compte : `update public.profiles set role = 'admin' where id = '<uuid vérifié>';`. Aucun bouton ni droit client de modification du rôle. Une famille correspond à un compte au démarrage; invitations d’un deuxième parent non implémentées.

Ne jamais utiliser une clé `service_role`/secret dans `VITE_*`. Les variables `VITE_*` sont incluses dans le JavaScript public. La clé anon/publishable est volontairement publique : la sécurité repose sur Auth et RLS. `.env.local` est exclu de Git.

## Cible Cloudflare, sans publier

L’espace membre utilise React + TypeScript et Vite. Il est servi comme SPA par **Cloudflare Workers Static Assets**; les appels authentifiés vont directement à Supabase et sont contrôlés par RLS. Pas de serveur Next.js ni d’adaptateur OpenNext requis pour ce périmètre.

```sh
npm run build
npm run check:cloudflare
npm run preview:cloudflare
```

Ouvrir http://127.0.0.1:8787. `check:cloudflare` relance le build puis exécute `wrangler deploy --dry-run` : **aucun déploiement**. La preview exécute la cible locale Wrangler/workerd. Les valeurs `VITE_*` sont figées au build; reconstruire après tout changement de configuration. `wrangler.jsonc` contient le nom, la date de compatibilité et le repli SPA. `public/_headers` fournit les en-têtes de sécurité, dont une CSP compatible Supabase standard et local. Un domaine Supabase personnalisé nécessiterait l’ajustement de `connect-src`.

Pour une future publication, désactiver la démonstration, terminer la recette Supabase, préparer le projet Cloudflare et ses paramètres, puis décider du déploiement. Aucun compte Cloudflare, domaine ou intégration payante n’a été créé.

## Vérifications

```sh
npm test
npm run build
npm run format:check
npm run check:cloudflare
```

- 7 tests métier/adaptateur de démonstration : persistance, deux familles, permissions, échec de stockage, dates et validation.
- 14 tests exécutent **la migration réelle dans PostgreSQL via PGlite** : RLS anonyme/parent/admin, progression, brouillons, fichiers, documents, modération, inscriptions, restauration transactionnelle de tâches.
- Auth et Storage sont représentés par des schémas minimaux dans ces tests. Cela teste les règles SQL; **cela ne valide pas GoTrue, PostgREST, les JWT, le service de fichiers ni ses limites MIME/taille en bout en bout**. Une recette sur Supabase réel reste obligatoire.
- Parcours navigateur contrôlés manuellement via l’outil navigateur : détails dans [docs/recette.md](docs/recette.md). Pas de suite Playwright automatisée exécutée.

## Architecture

- `src/domain.ts` : types et règles indépendantes du fournisseur.
- `src/data/gateway.ts` : contrat de données.
- `src/data/supabase.ts` : seuls appels Supabase applicatifs.
- `src/data/demo.ts` : simulation locale explicite, séparée de Supabase.
- `src/data/seed.ts` : profils et contenus fictifs; `npm run seed:content` régénère le seed SQL de contenu.
- `src/components/` : cours, planning/dossier privé, communauté/événements/ressources, administration.
- `supabase/migrations/` : schéma, trigger de profil, privilèges, RLS et bucket privé.
- `tests/` : vérifications métier et SQL.

Versions résolues consignées dans `package-lock.json` : React 19.2.8, Vite 7.3.6, TypeScript 5.9.3, Supabase JS 2.115.0, CLI Supabase 2.116.0 et Wrangler 4.129.0. Le choix de Vite 7 est volontaire : version compatible installée et testée, sans obligation d’adopter Vite 8. Documentation consultée : [Cloudflare React/Vite](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/), [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), [Supabase local](https://supabase.com/docs/guides/local-development/cli-workflows), [RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Marque

Le logotype `parentEd` provient d’une extraction rectangulaire du PNG fourni dans `brand/`, sans redessin. Le PDF est une planche matricielle avec une couche texte; aucun logo vectoriel autonome n’était disponible. Les actifs `public/parented-logo.png` et `public/favicon.png` gardent un fond blanc. Ce sont des extractions raster, pas des masters vectoriels. Couleurs relevées dans les pixels dominants : bleu `#1D4ED8`, accent `#7CB0FF`. Les illustrations de cours sont des compositions CSS/SVG simples; aucune photo externe ni police tierce téléchargée.

## Limites et suites

- Supabase Auth/Storage complet reste à connecter et à tester. La démonstration locale est actuellement le seul parcours de connexion exécuté.
- Cours textuels fictifs à relire pédagogiquement; pas de vidéo hébergée. Ressources liées issues du registre fourni, dates de relevé conservées, sans nouvelle validation juridique.
- Chargement limité à 1 000 lignes par table, sans pagination; convenable pour ce prototype, à remplacer avant montée en charge.
- Planning éditable, pas de récurrence/notifications, ni invitation de second parent. Les heures d’événements sont affichées comme heures locales du Québec.
- Documents : 5 Mo côté Supabase, 1 Mo en démo pour limiter localStorage. Suppression fichiers/métadonnées en deux opérations, pas une transaction distribuée; prévoir un contrôle des fichiers orphelins.
- Sauvegarde/export décrit dans [docs/sauvegarde-et-restauration.md](docs/sauvegarde-et-restauration.md); reprise complète Auth + Storage pas encore testée.
- Paiements, IA, carte externe, tutorat/réservations de tuteurs, vidéo spécialisée et automatisations avancées différés.
- Avant accueil de vraies familles : recette connectée, processus de comptes et récupération, contenus validés, politique de confidentialité et procédures de conservation/support adaptées au service.

[État d’avancement](docs/progress.md) · [Démonstration jury](docs/demo-jury.md) · [Décisions](docs/ParentEd-decisions-et-concessions.md)

Un dépôt Git local dédié a été initialisé à cette racine. Le dépôt vide préexistant `ParentEd/` est conservé et exclu; aucun push ni dépôt distant créé.
