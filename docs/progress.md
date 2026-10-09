# ParentEd — archive du hackathon

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
