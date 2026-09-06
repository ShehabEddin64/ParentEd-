# Préparation juridique avant la page d’accueil publique

Registre de travail du 6 septembre 2026. ParentEd est en phase 1 : accès accordé par l’équipe, aucun paiement dans l’application. Les documents ci-dessous sont des **projets** publiés dans l’application (`#legal/...`, fichier `src/legal.ts`) ; ils doivent être complétés et relus par un juriste avant tout lancement public. Aucun conseil juridique ici.

## Documents publiés dans l’application

| Document | Adresse | Base | À compléter |
| --- | --- | --- | --- |
| Politique de confidentialité | `#legal/confidentialite` | Loi 25 (Québec) : responsable, finalités, tiers, conservation, droits, incidents | dénomination légale, adresse, responsable de la protection des renseignements personnels et son courriel, région d’hébergement Supabase, durée des sauvegardes |
| Politique sur les témoins | `#legal/temoins` | Stockage strictement nécessaire seulement; aucun bandeau requis tant qu’aucun outil de mesure n’est ajouté | rien, tant que la liste des services reste exacte |
| Conditions d’utilisation | `#legal/conditions` | Nature du service (ni école ni garde), communauté, rencontres, intervenants indépendants, contenus, assistant, responsabilité, droit applicable | district judiciaire, délai d’annulation standard des intervenants, courriel de contact |
| Paiement, annulation et remboursement | `#legal/paiement` | Phase sans paiement; engagements pour un futur abonnement (LPC, contrats à distance, OPC) | délais d’annulation des intervenants, hypothèse de prix |

Les liens figurent sur la page de connexion, dans le pied de page de l’application, et l’inscription exige de cocher l’acceptation des conditions et de la politique (version enregistrée dans les métadonnées du compte : `accepted_terms`).

## Liste de contrôle Loi 25 (secteur privé, Québec)

- [ ] Désigner la personne responsable de la protection des renseignements personnels et publier son titre et ses coordonnées.
- [ ] Tenir l’évaluation des facteurs relatifs à la vie privée (EFVP) : données recueillies, finalités, fournisseurs hors Québec (Supabase selon la région, Cloudflare, Open-Meteo, OpenStreetMap, Resend, Anthropic), mesures de limitation.
- [ ] Rédiger la politique de gouvernance interne (accès à la base réservé, journalisation, durée de conservation, destruction).
- [ ] Prévoir le registre des incidents de confidentialité et la procédure d’avis à la CAI et aux personnes.
- [ ] Paramètres par défaut les plus protecteurs : déjà le cas (profil vide, carte sur choix explicite, espace familial privé).
- [ ] Procédure de réponse aux demandes d’accès, de rectification, de portabilité et de suppression (30 jours). Ajouter un bouton « Supprimer mon compte » dans l’application (à faire; aujourd’hui : demande par courriel).
- [ ] Consentement distinct pour tout usage nouveau (mesure d’audience, infolettre).

## Vente et abonnement (phase 2)

- [ ] Avant tout paiement : prix TTC, contenu, renouvellement, annulation, remboursement, service à la clientèle, contrat transmis (contrats à distance, Loi sur la protection du consommateur; consulter l’OPC).
- [ ] Distinguer contractuellement l’abonnement ParentEd, les prestations des intervenants indépendants et les activités payantes de tiers.
- [ ] Vérifier fiscalité (TPS/TVQ) et statut des intervenants (autonomes) avec un comptable.
- [ ] Assurance responsabilité civile pour les rencontres organisées par ParentEd.

## Contenus et propriété intellectuelle

- [ ] Cours, modèles, examens : contenus originaux, mention de droit d’auteur.
- [ ] Ressources officielles : liens seulement, explications indépendantes datées; ne pas réhéberger de documents gouvernementaux sans autorisation.
- [ ] Photos : licence Unsplash via Lorem Picsum, crédits dans `docs/credits-photos.md`.

## Assistant IA

- [ ] Conditions : l’assistant peut se tromper, ne remplace ni conseiller ni source officielle (fait).
- [ ] Coût : quotas par membre et global, modèle configurable, journal des jetons (fait; voir `docs/deploiement.md`, section 7 ter).
- [ ] Données : seules la question et les contenus publics sont transmis à Anthropic; vérifier les conditions de conservation du fournisseur.

## Accessibilité et langue

- [ ] Interface et contrats en français (Charte de la langue française).
- [ ] Contrôle d’accessibilité (contrastes, clavier, lecteurs d’écran) avant lancement.
