# Exports et restauration

## Export familial disponible

Dans Ma semaine → Dossier privé, « Exporter mon organisation et ma progression » produit un JSON versionné contenant les tâches, la progression et les métadonnées des documents visibles du parent courant. Les fichiers doivent être téléchargés séparément. Cet export ne comprend pas Auth, les discussions ou toute la base; il n’est pas une sauvegarde complète du service.

En mode démo, le navigateur est le seul stockage. Il n’y a pas de synchronisation entre appareils. La limite d’un fichier est de 1 Mo; le quota total dépend du navigateur. Aucune réussite n’est affichée lorsqu’une écriture locale échoue.

## Sauvegarde opérateur Supabase, à mettre en service

Avant modification d’une vraie instance :

1. Préparer un emplacement privé chiffré, exclu de Git (`backups/` est exclu). Limiter l’accès aux opérateurs autorisés.
2. Sauvegarder le schéma, les données et rôles avec les outils Supabase/PostgreSQL adaptés au projet, en suivant [le guide officiel](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore). Conserver les migrations versionnées et les versions des outils.
3. Sauvegarder séparément les **octets des objets Storage** et leur manifeste chemin/taille/hash. Une sauvegarde PostgreSQL ne contient pas les fichiers. Les identifiants `auth.users`, les profils, les familles et les chemins de documents doivent rester cohérents.
4. Définir fréquence, rétention, chiffrement, responsable et objectifs de reprise avant toute collecte de données réelles.
5. Restaurer d’abord dans un environnement isolé, jamais directement par-dessus une base active. Installer les migrations/extensions compatibles, restaurer Auth/données et réimporter les fichiers dans le bucket privé.
6. Contrôler le nombre de lignes, les hashes des fichiers, les contraintes, RLS et privilèges. Tester deux familles et un administrateur via les véritables API Auth/Storage. Vérifier connexion, progression, téléchargement et refus d’accès inter-familles.

Ne pas réinjecter un JSON fourni par un utilisateur avec une clé de service : ses identifiants de famille/compte ne sont pas fiables. Un import doit réattribuer l’identité côté serveur et valider le schéma. Pas de bouton d’import dans la V1.

## Ce qui a été testé

Le test `restaure les données exportées dans une transaction PostgreSQL` exporte et réinsère les tâches de la famille authentifiée sous RLS, puis compare les lignes. Les tests de permissions refusent les chemins et identifiants d’une autre famille.

**Limite explicite :** aucune restauration complète Supabase Auth + Storage n’a été exécutée, faute d’instance. Le protocole ci-dessus reste à exécuter avant un pilote réel. La suppression d’un fichier et de ses métadonnées est composée de deux appels : en cas d’échec partiel, contrôler les objets/métadonnées orphelins avant nettoyage.
