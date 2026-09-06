# ParentEd — Décisions et concessions

6 septembre 2026. Supabase et Cloudflare sont acceptés par le porteur du projet. Les autres composants restent proposés ou différés comme précisé ci-dessous. Aucun abonnement ni service n’a été créé.

## C01 — Supabase géré au démarrage — accepté par le porteur du projet

Usage : PostgreSQL, authentification et stockage privé des documents au départ.
Gain : réduire le travail initial de développement et d’exploitation.
Concession : abonnement et consommation variables, dépendance aux services spécifiques, responsabilité persistante de bien configurer les accès et sauvegardes.
Migration : possible mais payante en travail; PostgreSQL facilite le transfert des données sans garantir une migration transparente de l’authentification, des fichiers, règles d’accès et fonctions.
Mesures prévues : appels fournisseur regroupés, logique métier séparée, schéma versionné, règles d’accès testées, quotas de fichiers, exports et restauration testés. Réévaluer sur consommation réelle et coût total de maintenance.

## C02 — Cloudflare pour l’hébergement — accepté par le porteur du projet

Cloudflare est retenu avec Supabase. Le framework et son mode de déploiement doivent être validés lors de l’implémentation; Next.js avec OpenNext reste une proposition. Tester les dépendances dans l’environnement Cloudflare.

## C03 — Version fonctionnelle avant intégrations commerciales — accepté

Construire d’abord un parcours utilisable avec Cloudflare et Supabase. Garder les paiements dans le plan mais ne pas intégrer Stripe ni activer une facturation à cette étape. Les autres intégrations externes (vidéo, courriels avancés, carte fournisseur et IA) sont reportées jusqu’à ce qu’une première version fonctionne et que leur ajout soit décidé. Prévoir leurs points d’intégration sans les implémenter prématurément. Ne pas présenter des simulations comme des services actifs.

Périmètre de première version proposé : connexion, rôles parent/admin, accueil, cours simples, ressources, discussions, événements en liste/calendrier et organisation familiale. Démonstration avec données fictives; pas de faux encaissement, de réservation externe prétendument confirmée ni de faux envoi de courriel. L’authentification doit être réellement testable avec la configuration nécessaire, même si les courriels avancés sont différés.

## Composants proposés et calendrier

| Élément | Proposition | Rôle |
| --- | --- | --- |
| Application | Next.js et TypeScript | Site public et espace membre |
| Hébergement | Cloudflare Workers avec adaptateur OpenNext | Servir l’application; tester les parcours et dépendances dans cet environnement avant engagement |
| Données, comptes, documents | Supabase | Base, connexion et fichiers privés; pas de doublon R2 au départ |
| Cours vidéo | Cloudflare Stream | Stockage et diffusion des vidéos de cours |
| Abonnements ParentEd | Stripe Checkout et Billing | Paiement et renouvellements; vérifier les notifications serveur |
| Courriels | Resend | Connexions, confirmations et rappels |
| Carte | Mapbox, candidat | Découverte d’événements, chargement à la demande; tarification à suivre |
| Tutorat | Réservation dans ParentEd, liens de réunion externes | Tuteur facturant directement les parents selon proposition opérationnelle; pas de paiement marketplace au départ |
| IA | Différée, fournisseur non sélectionné | Prévoir une intégration indépendante sans coût ni déploiement immédiat |

Cloudflare est accepté. Stripe, Stream, Resend, Mapbox et IA restent des étapes ultérieures, pas des dépendances requises pour la première version fonctionnelle. Ne pas intégrer un fournisseur supplémentaire sans bénéfice clair. Localisation des données et traitement chez chaque prestataire à examiner avant mise en production.

## Sources

- https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://supabase.com/pricing
- https://supabase.com/docs/guides/platform/regions
- https://developers.cloudflare.com/stream/pricing/
- https://stripe.com/fr-ca/pricing
- https://stripe.com/en-ca/billing/pricing
- https://resend.com/pricing
- https://www.mapbox.com/pricing

Repère budgétaire : Workers payant minimum 5 USD/mois et Supabase Pro à partir de 25 USD/mois, soit 30 USD de base, non un total de plateforme. Vidéos, courriels, carte, paiement, consommation supplémentaire, taxes et maintenance s’ajoutent.


## Contexte du challenge — précision du porteur du projet

ParentEd est développé dans le cadre d’un challenge et sera évalué par un jury. La première version doit permettre une démonstration claire du service et de sa réponse au problème posé. Aucun barème officiel supplémentaire n’a été fourni : ne pas inventer de critères ou de pondérations.

Le brief initial porte principalement sur un modèle d’affaires : expliquer qui paie, combien, la viabilité après l’année 1, qui enseigne, le nombre d’enfants ensemble, un mardi type et l’adaptation à d’autres environnements. La plateforme rend ce fonctionnement visible.

Préparer un parcours de démonstration reproductible avec des données fictives identifiées : accueil du parent, cours et progression, organisation de la semaine, communauté et inscription à un événement. Garder les dossiers familiaux privés. Signaler honnêtement les intégrations différées et les hypothèses financières; ne pas simuler un service connecté comme réel.

Ajouter docs/demo-jury.md : étapes de démonstration, scénario familial, correspondance entre besoins et fonctionnalités, fonctions réellement opérationnelles, limites et feuille de route. Il s’agit d’un support de présentation distinct de l’interface destinée aux familles; ne pas afficher des commentaires techniques ou des arguments pour le jury partout dans le produit.
