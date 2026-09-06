# Avancement ParentEd

Mis à jour le 6 septembre 2026.

## Réalisé

- Consignes et décisions lues, dossier inspecté, références PNG/PDF examinées. Dépôt local initialisé à la racine; sous-dépôt vide existant conservé. Aucun push.
- Logotype raster propre extrait de la référence et couleurs relevées. Interface française avec navigation stable, accueil, rendus ordinateur/mobile et composants illustratifs sobres.
- Choix React/TypeScript/Vite + Cloudflare Workers Static Assets, adapté à l’espace membre sans SSR. Next.js/OpenNext n’a pas été adopté; pas de dépendance à Sites ou à un autre hébergeur.
- Contrat de données et règles métier indépendants du client Supabase. Adaptateur Supabase Auth, PostgreSQL et Storage implémenté; mode démo explicite séparé.
- Parcours vertical : entrée dans un profil fictif → cours textuel → leçon terminée → progression persistante. Adaptateur pour connexion réelle courriel/mot de passe prêt à configurer.
- Bibliothèque de liens officiels avec recherche, catégories, source et date du registre fourni.
- Semaine familiale : ajout, modification, achèvement et suppression d’activités; dossier privé, dépôt, préparation du téléchargement et export JSON.
- Communauté : discussions, réponses, signalements, suppression par auteur/admin et modération.
- Événements : liste/calendrier, inscriptions personnelles et annulation.
- Administration : création/édition des cours, leçons, ressources et événements; publication/brouillons; gestion des signalements. Pas d’accès administratif transversal aux dossiers familiaux.
- Migration SQL, trigger de création du profil parent, privilèges explicites, RLS par famille/utilisateur, bucket privé 5 Mo et MIME restreints. Attribution admin réservée à un opérateur de base.
- `.env.example`, exclusions, seed de contenu et script de comptes **réservé au Supabase local**.
- README, scénario jury, protocole de recette et stratégie d’export/restauration.

## Vérifications exécutées

- `npm test` : **21 tests réussis**, dont **14 tests PostgreSQL/PGlite** exécutant la migration réelle.
- `npm run build` : TypeScript et Vite réussis.
- `wrangler deploy --dry-run` : réussi, sans publication.
- Prévisualisation locale Cloudflare (Wrangler/workerd, 8787) opérationnelle et inspectée dans le navigateur.
- Connexion de démonstration, progression après rechargement, activité, réponse, inscription persistante, séparation des profils, édition admin persistante, dépôt PNG et refus d’un format interdit vérifiés.
- Accueil et planning mobile examinés à 390 × 844; accueil ordinateur à 1280 × 720.
- Défaut de téléchargement démo découvert grâce aux en-têtes CSP Cloudflare et corrigé par conversion base64 locale; test de non-régression des octets ajouté. La réception du fichier sur disque n’a pas été observée par le navigateur intégré : à contrôler dans Chrome/Safari.
- Dépendances installées avec audit npm sans vulnérabilité signalée lors de l’installation. Cela ne remplace pas une revue de sécurité.

Détails et limites exacts : [recette.md](recette.md).

## Ce qui empêche le test Supabase complet

`npx supabase status` a confirmé : **Docker absent, Podman absent, aucun projet lié**. Aucun URL/clé Supabase fourni dans le projet. La CLI est installée comme dépendance; la stack de services ne tourne pas. Aucun service distant n’est présenté comme connecté.

Pour poursuivre : installer/démarrer un moteur Docker compatible, puis appliquer les étapes du README, ou configurer un projet Supabase géré choisi par le propriétaire. Les valeurs privées doivent rester dans `.env.local`, jamais dans la conversation ni dans Git.

Les tests PGlite valident PostgreSQL/RLS avec des schémas Auth/Storage minimaux. Ils ne prouvent pas la compatibilité complète des services Auth, JWT, PostgREST ou Storage. La recette connectée et la restauration complète sont encore à exécuter.

## Concessions de cette version

- Démonstration localStorage non sécurisée pour de vraies données; une famille par compte dans le parcours Supabase actuel, sans invitation d’un second parent.
- Contenus de démonstration à relire; pas de vidéo spécialisée, ni de promesse de conformité. Les sources gouvernementales restent des liens externes.
- Chargement initial plafonné à 1 000 lignes/table; pagination et rafraîchissement temps réel non implémentés.
- Pas de parcours public d’inscription/récupération de mot de passe; comptes fournis par l’équipe.
- Pas de fichiers supérieurs à 1 Mo en démo; 5 Mo prévus et déclarés dans le bucket Supabase. Les opérations fichier/métadonnée ne sont pas atomiques.
- Les pages cours/communauté/événements utilisent des routes par fragment; pas de référencement public SSR.
- Aucun prix commercial affiché, aucun paiement, IA, carte externe, réservation de tuteur, courriel avancé ou automatisation activé.

## Prochaine étape utile

Faire tourner Supabase local ou configurer l’instance choisie, puis exécuter entièrement `docs/recette.md`. Résoudre les écarts Auth/Storage éventuels et vérifier les téléchargements/restauration avant une démonstration présentée comme connectée. La publication Cloudflare reste une étape distincte, non exécutée.
