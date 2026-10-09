# ParentEd — archive du hackathon

9 octobre 2026 : ajout au README du retour personnel du créateur sur Claude Opus 5 et ses premiers essais d’Astra 6, ainsi que des inspirations de marque et d’interface (GoHighLevel, Coursera et Khan Academy). Modification documentaire uniquement.

Mise à jour : 8 octobre 2026.

À la demande du propriétaire, ParentEd est désormais présenté comme son projet pour **Muslim Hacks à Montréal**, et non comme un service commercial actif.

## Nettoyage

- README de portfolio, démarrage sans compte ni clé.
- Exécution exclusivement avec les profils et données fictifs du navigateur.
- Suppression du client Supabase, des fonctions AI/email, de la configuration Cloudflare et des commandes de déploiement/provisionnement.
- Suppression de la configuration locale de production du projet; aucun secret recopié dans la documentation.
- Retrait du formulaire de contact, du tarif commercial et des promesses d’exploitation.
- Météo remplacée par une fixture indiquée; carte remplacée par un schéma sans tuiles externes.
- Migrations SQL conservées pour les tests PostgreSQL/PGlite et la compréhension de l’architecture.
- Notes commerciales, instructions de lancement en production et prompt de travail retirés de la version publique courante.
- Scripts vidéo rendus indépendants du chemin personnel de la machine; rendus MP4 exclus du suivi Git.
- Contrôle automatique de régression des credentials et intégrations ajouté.

## Limites

Les anciennes ressources hébergées ne sont pas arrêtées par une modification du dépôt. Voir `service-retirement.md`. Une ancienne clé publique anon Supabase a été trouvée dans l’historique; consulter `SECURITY.md`. Aucun service payant n’est réintroduit pour tester cette archive.

Les captures et la présentation originales sont conservées comme traces du hackathon; leur carte peut différer de la version hors ligne actuelle. La démonstration locale ne doit contenir aucune donnée personnelle.

## Vérification du nettoyage

- 45 tests réussis (règles métier et permissions PostgreSQL locales).
- Compilation de production et `npm run check:safety` réussies.
- Navigateur : accueil du hackathon, choix de profil, ouverture de cours et progression conservée dans un nouvel onglet après sélection du même profil.
- La compilation signale un bundle JavaScript supérieur à 500 kB; optimisation reportée.

Avec l’autorisation explicite du propriétaire, l’historique Git a été réécrit pour retirer l’ancienne clé publique et son URL de projet. Les anciennes copies et les services hébergés restent hors de portée de cette opération.
