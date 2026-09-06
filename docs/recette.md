# Recette ParentEd — 6 septembre 2026

## Résultats exécutés

Environnement : macOS, Node 24.13.1. Vérifications navigateur via Codex In-app Browser, avec une vue ordinateur 1280 × 720 et une vue mobile 390 × 844 (accueil et planning). Aucun service distant impliqué.

| Vérification | Résultat observé |
| --- | --- |
| Build TypeScript / Vite | Réussi |
| Dry-run Cloudflare Workers Static Assets | Réussi, aucun déploiement |
| Prévisualisation Wrangler/workerd à 8787 | Page servie, connexion démo, administration, fichiers et responsive inspectés |
| Tests métier et adaptateur local | 7 tests réussis |
| Migration et RLS dans PostgreSQL PGlite | 14 tests réussis |
| Connexion démo Amélie | Accueil visible |
| Cours → leçon terminée | 33 % enregistré et conservé au rechargement à 5173 |
| Activité familiale | Ajout « Observer les oiseaux — essai fictif » visible dans la semaine |
| Communauté | Réponse fictive publiée, compteur passé à 1 |
| Événement | Inscription conservée au rechargement; vue calendrier présente |
| Autre famille | Sami voit 0 leçon et 0 activité; ne reprend pas celles d’Amélie |
| Administration | Description d’un cours modifiée et retrouvée après rechargement à 8787 |
| Fichier privé | PNG de test ajouté, métadonnée retrouvée après rechargement |
| Format interdit | Fichier CSS refusé, message français; reprise après actualisation |
| Téléchargement démo | Défaut CSP corrigé : conversion base64 → Blob sans fetch. Test unitaire vérifie les octets et le refus inter-familles; navigateur affiche « Téléchargement préparé » sans erreur |
| Réception physique du téléchargement/export | Événement de téléchargement non observé par l’outil du navigateur intégré; fichier final sur disque à vérifier dans Chrome/Safari avant pilote |
| Mobile | Accueil et planning examinés à 390 px; planning en liste quotidienne; largeur de contenu 390 px sans débordement observé |
| Supabase local complet | Non exécutable : Docker et Podman absents, confirmé par la CLI |
| Supabase distant | Non configuré, aucune validation Auth/PostgREST/Storage distante |

Les fichiers SQL sont réellement exécutés par PostgreSQL/PGlite, et non vérifiés uniquement par recherche de chaînes. Les schémas Auth/Storage minimaux du banc d’essai ne sont pas les services Supabase complets. Le mode localStorage est un simulateur, pas une garantie de confidentialité pour un navigateur partagé.

## Protocole à exécuter après configuration Supabase

Utiliser exclusivement une instance locale ou de recette et des données fictives. Désactiver `VITE_ENABLE_DEMO` pour éviter de confondre les deux modes.

1. Initialiser la base et les comptes via le README. Vérifier un refus avec un mot de passe erroné, puis la connexion correcte et la déconnexion.
2. Avec Amélie, terminer une leçon; vérifier la ligne dans `progress`, recharger puis reconnecter. Retrouver la même progression.
3. Avec Sami dans un profil de navigateur distinct, vérifier l’absence de progression et de tâches d’Amélie. Essayer lecture, insertion, modification et suppression d’un UUID de l’autre famille **via l’API**, pas seulement par l’interface.
4. Avec un parent, tenter de modifier `profiles.role` et `family_id`. Les privilèges doivent refuser l’action. Vérifier qu’un rôle envoyé dans les métadonnées d’un nouveau compte reste sans effet.
5. Avec Camille, créer un brouillon de cours, une leçon et publier. Vérifier la visibilité parent avant/après publication. Modifier une ressource et un événement. Confirmer que les tâches et documents d’Amélie restent invisibles à Camille.
6. Charger un PDF et un PNG inoffensifs. Télécharger et comparer les octets. Tester un fichier trop volumineux, un type refusé et un chemin d’autre famille via Storage. Vérifier que le bucket est privé et qu’aucune URL publique ne donne accès aux fichiers.
7. Publier une discussion et une réponse; signaler avec un autre compte; traiter le signalement en admin. Vérifier qu’un membre ne peut pas supprimer le message d’un autre.
8. S’inscrire à un événement; recharger, vérifier l’unicité et annuler. Les inscriptions des autres parents doivent rester privées.
9. Couper le réseau avant une écriture : erreur visible, aucune fausse confirmation, formulaire conservé. Rétablir puis réessayer. Tester une session expirée et les états vides.
10. Exporter le JSON familial et télécharger les documents dans Chrome/Safari. Contrôler les données, puis exécuter la restauration isolée décrite dans `sauvegarde-et-restauration.md`.
11. Reconstruire avec les paramètres Supabase, puis refaire le parcours sur `npm run preview:cloudflare` (8787). La réussite Vite seule ne suffit pas.

Contrôle mobile complémentaire : connexion, menu au clavier/Escape, cours long, formulaire d’activité, discussion longue et calendrier mensuel. Ne pas extrapoler les deux captures vérifiées à tous les navigateurs ou appareils.

## Compléments V2 à exécuter sur Supabase réel

12. Inscription depuis le site : créer un compte, recevoir le courriel, confirmer, se connecter; vérifier qu’un profil `parent` et une famille sont créés. Tester « Mot de passe oublié » et le formulaire de nouveau mot de passe.
13. Tutorat : nommer un compte `tutor` et relier `tutors.profile_id`. Avec Amélie, demander une séance; vérifier qu’un statut « confirmée » envoyé directement est refusé. Avec le tuteur, confirmer, clore et rédiger un compte rendu. Avec Sami, vérifier l’absence totale des séances et comptes rendus d’Amélie, via l’API aussi.
14. Propositions : avec Sami, proposer une rencontre; vérifier qu’Amélie ne la voit pas et ne peut pas s’y inscrire; publier avec Camille, puis vérifier la visibilité et l’inscription.
15. Groupes, favoris, notes de leçon, questions : vérifier l’unicité (double favori refusé), l’isolation des notes personnelles et la réponse d’une question par l’administration seule.
16. Famille : enfants, plan hebdomadaire, bibliothèque et portfolio invisibles pour Camille et Sami; export JSON complet.
17. Après `npm run deploy`, refaire les étapes 12 et 13 sur l’URL publique, avec Site URL et Redirect URLs configurées.
