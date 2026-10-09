# Vérifications de l’archive hackathon

Commandes : `npm test`, `npm run build`, `npm run check:safety`, `npm run preview`.

Les tests métier vérifient le simulateur, la persistance et les parcours familiaux. Les tests SQL exécutent les migrations dans PGlite, sans serveur externe.

La vérification de sécurité doit confirmer : pas de dépendance Supabase/Cloudflare/AI/email, pas de script deploy, pas d’environnement activant un fournisseur, pas d’appel réseau applicatif, pas de credential détecté dans les fichiers vérifiés ni le bundle.

Dans le navigateur :

- Landing FR/EN présentée comme un projet Muslim Hacks Montréal.
- Accès direct aux profils fictifs, sans courriel ni mot de passe.
- Cours et progression après rechargement.
- Administration et planning encore utilisables.
- Aucun formulaire commercial ou tarif d’abonnement.
- Aucun appel réseau vers un fournisseur pendant les interactions.
- Météo fictive et carte schématique explicitement identifiées.

Les tests SQL représentent l’architecture du prototype original. Ils ne sécurisent pas le stockage local du navigateur et ne prouvent pas l’arrêt des anciennes instances cloud.
