# Déployer ParentEd : Supabase + Cloudflare

Guide pas à pas pour passer de la démonstration locale à un site publié. Aucun secret ne doit être collé dans une conversation ni dans Git. Comptez environ 30 minutes.

## 1. Créer le projet Supabase

1. Ouvrir https://supabase.com/dashboard et créer un projet (**New project**). Choisir un mot de passe de base de données fort et le conserver dans un gestionnaire de mots de passe. Région recommandée pour le Québec : `ca-central-1` (Canada, Central), si disponible.
2. Attendre la fin de la création (1 à 2 minutes).

## 2. Appliquer le SQL

Le fichier **`supabase/parented-complet.sql`** contient tout : tables, fonctions, déclencheurs, privilèges, règles RLS, bucket privé et contenus de démonstration fictifs (cours, leçons, ressources, groupes, rencontres, tuteurs).

1. Dashboard → **SQL Editor** → **New query**.
2. Coller l’intégralité de `supabase/parented-complet.sql`, cliquer **Run**. Le script est enveloppé dans une transaction : soit tout passe, soit rien n’est appliqué.
3. Si vous ne voulez **pas** des contenus fictifs (Nadia, Karim, rencontres de démonstration…), supprimez la section « Contenus de démonstration fictifs » avant d’exécuter, ou exécutez seulement les deux migrations de `supabase/migrations/` dans l’ordre.

Base déjà migrée ? N’exécutez que les migrations manquantes de `supabase/migrations/`, dans l’ordre (par exemple `202609060003_parented_v3.sql` si les deux premières sont déjà passées). Chaque migration ne s’exécute qu’une fois.

Régénérer le fichier complet après toute modification des migrations ou du seed :

```bash
npm run sql:bundle
```

## 3. Configurer l’authentification

Dashboard → **Authentication** → **URL Configuration** :

- **Site URL** : l’adresse publique du site, par exemple `https://parented.<votre-sous-domaine>.workers.dev` (vous la connaîtrez après le premier déploiement Cloudflare; mettez-la à jour ensuite).
- **Redirect URLs** : ajouter la même adresse, plus `http://127.0.0.1:5173` pour les tests locaux.

Authentication → **Providers** → **Email** : laisser **Confirm email** activé pour un vrai lancement. L’application gère l’inscription, la confirmation par courriel et la réinitialisation du mot de passe. Le service de courriel intégré de Supabase est limité à quelques envois par heure : pour un pilote réel, configurer un SMTP personnalisé (Authentication → **SMTP Settings**), par exemple Resend, décision différée dans `ParentEd-decisions-et-concessions.md`.

Authentication → **Sign In / Providers** → mot de passe : **12 caractères minimum** (l’interface l’exige aussi).

## 4. Récupérer les clés publiques

Dashboard → **Project Settings** → **API** (ou **API Keys**) :

- **Project URL** → `VITE_SUPABASE_URL`
- **anon / publishable key** → `VITE_SUPABASE_ANON_KEY`

Ces deux valeurs sont **publiques par conception** : la sécurité repose sur Auth et RLS. Ne jamais utiliser la clé `service_role` dans l’application.

Créer `.env.production` à la racine (exclu de Git par `.env.*`) :

```dotenv
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_publishable
VITE_ENABLE_DEMO=true
```

`VITE_ENABLE_DEMO=true` garde le bouton « Explorer avec Amélie » sur le site publié : pratique pour un jury, données fictives stockées dans le navigateur du visiteur seulement. Passer à `false` pour un site réservé aux membres.

## 5. Nommer les rôles admin et tuteur

Tout nouveau compte est un **parent** avec sa propre famille. Les rôles se donnent en base, jamais depuis l’interface.

1. Créer le compte depuis le site (« Créer un compte ») ou depuis Dashboard → Authentication → Users → **Add user**.
2. Récupérer l’UUID du compte dans Authentication → Users.
3. SQL Editor :

```sql
-- Administration des contenus
update public.profiles set role = 'admin' where id = '<uuid vérifié>';

-- Tuteur partenaire : créer ou relier la fiche d’annuaire au compte
update public.profiles set role = 'tutor' where id = '<uuid du tuteur>';
update public.tutors set profile_id = '<uuid du tuteur>', published = true where display_name = 'Nadia';
```

L’administration crée les fiches de tuteurs dans l’onglet **Tuteurs** et peut y coller l’UUID du compte; la nomination du rôle `tutor` reste une opération SQL volontaire.

## 6. Tester en local contre le vrai Supabase

```bash
cp .env.production .env.local
npm run dev
```

Créer un compte, confirmer le courriel, se connecter, terminer une leçon, recharger. Suivre `docs/recette.md` pour la recette complète (deux familles, tuteur, administration).

## 7. Déployer sur Cloudflare Workers

Prérequis : un compte Cloudflare (gratuit suffit pour démarrer : Workers Static Assets est inclus dans l’offre Free).

```bash
npx wrangler login
```

Une page du navigateur s’ouvre pour autoriser Wrangler. Ensuite :

```bash
npm run deploy
```

Cette commande compile avec les variables de `.env.production` (Vite les fige dans le JavaScript) puis exécute `wrangler deploy`. Wrangler affiche l’URL publique, du type `https://parented.<compte>.workers.dev`.

Retourner dans Supabase → Authentication → URL Configuration et renseigner cette URL comme **Site URL** et dans les **Redirect URLs**. Sans cela, les liens de confirmation et de réinitialisation renvoient vers localhost.

Vérifier avant d’annoncer le site :

```bash
npm test
npm run build
npm run check:cloudflare
```

### Domaine personnalisé (facultatif)

Dashboard Cloudflare → Workers & Pages → `parented` → **Settings** → **Domains & Routes** → **Add** → Custom domain. Le domaine doit être géré par Cloudflare. Ajouter ensuite ce domaine aux Redirect URLs Supabase.

### Déploiement automatique depuis GitHub (facultatif)

Workers & Pages → `parented` → Settings → **Builds** → connecter le dépôt. Commande de build : `npm run build`, commande de déploiement : `npx wrangler deploy`. Ajouter `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` et `VITE_ENABLE_DEMO` dans les **variables de build** (elles sont publiques, pas des secrets).

## 8. Sécurité et exploitation

- `public/_headers` publie une CSP qui autorise `https://*.supabase.co` et les tuiles `tile.openstreetmap.org` pour la carte : un domaine Supabase personnalisé ou un autre fournisseur de tuiles exige d’ajuster `connect-src` / `img-src`.
- Les fichiers du portfolio vont dans le bucket privé `family-documents` (5 Mo, PDF/PNG/JPEG). Aucune URL publique n’existe.
- Sauvegardes : activer les sauvegardes du projet Supabase (Pro) ou suivre `docs/sauvegarde-et-restauration.md`.
- Chargement plafonné à 1 000 lignes par table : convenable pour un pilote, à paginer avant une montée en charge.
- Avant d’accueillir de vraies familles : politique de confidentialité, procédure de suppression de compte, SMTP dédié et recette complète sur l’instance réelle.

## Dépannage

| Symptôme | Cause probable | Correction |
| --- | --- | --- |
| « Votre profil est indisponible » après connexion | Migrations non appliquées ou déclencheur absent | Exécuter `parented-complet.sql`; vérifier `public.profiles` |
| « Chargement impossible… migrations SQL » | Base migrée en V1 seulement | Exécuter `202609060002_parented_v2.sql` |
| Lien de courriel qui ouvre localhost | Site URL non renseignée | Étape 3 puis 7 |
| Courriels non reçus | Quota du SMTP intégré | Configurer un SMTP personnalisé |
| Bouton démo absent sur le site | `VITE_ENABLE_DEMO` à `false` au build | Modifier `.env.production`, redéployer |
| Le tuteur ne voit pas ses séances | `tutors.profile_id` non relié | Étape 5 |
