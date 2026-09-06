-- Fictitious learning content for local demonstration. Not production content.
insert into public.courses (id,title,description,category,position,published) values ('30000000-0000-4000-8000-000000000001','Trouver son rythme en famille','Une semaine souple, des repères solides. Posez les bases d’une organisation qui vous ressemble.','Organisation',1,true) on conflict(id) do nothing;
insert into public.courses (id,title,description,category,position,published) values ('30000000-0000-4000-8000-000000000002','Faire ses premiers pas','Clarifiez votre intention et repérez les ressources utiles pour commencer sereinement.','Pour commencer',2,true) on conflict(id) do nothing;
insert into public.courses (id,title,description,category,position,published) values ('30000000-0000-4000-8000-000000000003','Garder une trace des découvertes','Un portfolio simple pour voir le chemin parcouru, sans tout conserver.','Apprentissages',3,true) on conflict(id) do nothing;
insert into public.courses (id,title,description,category,position,published) values ('30000000-0000-4000-8000-000000000004','Préparer ses bilans sans stress','Comprendre à quoi servent les bilans de progression et rassembler ce qui compte, au fil de l’année.','Démarches',4,true) on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Observer avant de planifier',6,1,'Avant de remplir un calendrier, prenez le temps d’observer votre famille. À quel moment votre enfant est-il le plus disponible ? Quelles activités vous donnent de l’énergie ? Les réponses vous aideront à choisir des repères réalistes.

Pendant deux ou trois jours, notez les moments de concentration, les besoins de mouvement et les pauses spontanées. Il ne s’agit pas d’évaluer la performance de votre famille : cherchez simplement ce qui facilite votre quotidien.

Choisissez ensuite deux points d’appui : un moment pour commencer ensemble et un moment pour terminer. Entre les deux, gardez de la place pour les questions, les détours et le repos. Une routine utile vous soutient; elle peut évoluer.','Notez un moment où votre famille se sent disponible. Ajoutez ensuite un premier rendez-vous dans « Ma semaine ».',null,'Journal d’observation — trois jours

Jour 1
- Moment de grande disponibilité :
- Besoin de bouger vers :
- Pause spontanée :

Jour 2
- Moment de grande disponibilité :
- Besoin de bouger vers :
- Pause spontanée :

Jour 3
- Moment de grande disponibilité :
- Besoin de bouger vers :
- Pause spontanée :

Deux points d’appui choisis :
1.
2.') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','Construire une semaine souple',8,2,'Commencez par ce qui est déjà présent : repas, rendez-vous, sorties et temps de repos. Répartissez ensuite quelques intentions d’apprentissage dans les espaces disponibles. Évitez de planifier chaque minute.

Un mardi peut commencer par une lecture partagée, se poursuivre par une promenade d’observation et se terminer par un temps calme. Les durées dépendent de votre famille. Une activité commune peut donner lieu à des défis différents selon les enfants.

Prévoyez un espace libre chaque jour. Si une activité ne fonctionne pas, déplacez-la ou simplifiez-la. Le calendrier sert à rendre vos intentions visibles, pas à créer une obligation de tout accomplir.','Planifiez deux activités et une pause pour mardi. Choisissez « Toute la famille » lorsque l’activité est partagée.',null,'Plan hebdomadaire souple

Intentions de la semaine (2 ou 3 au plus) :
-
-

Repères fixes (repas, rendez-vous, sorties) :
-

Matin — moment pour commencer ensemble :
Après-midi — temps calme ou sortie :
Espace libre chaque jour : oui / à protéger

Ce que je déplace si la journée déborde :') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','Ajuster sans culpabiliser',5,3,'À la fin de la semaine, prenez quelques minutes pour regarder ce qui a aidé votre famille. Demandez à chacun de raconter une découverte et un moment difficile. Écoutez sans chercher tout de suite une solution.

Conservez un repère qui fonctionne et modifiez une seule chose pour la semaine suivante. Ce petit ajustement est plus facile à observer qu’un nouveau planning complet.

Une activité reportée ne signifie pas qu’aucun apprentissage n’a eu lieu. Vos observations et vos échanges permettent de comprendre le chemin parcouru. Pour les démarches officielles, consultez les ressources gouvernementales liées dans la bibliothèque.','Choisissez un repère à conserver la semaine prochaine et racontez pourquoi dans votre note personnelle, sous cette leçon.',null,'') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000002','Clarifier son intention',7,1,'Votre projet commence par une conversation. Qu’aimeriez-vous rendre possible dans votre quotidien ? Quels sont les besoins de votre enfant et les ressources dont vous disposez ?

Écrivez trois intentions concrètes, comme lire ensemble régulièrement ou apprendre à observer la nature. Distinguez vos envies des démarches administratives : les ressources officielles vous permettront de vérifier ces dernières.

Les cours ParentEd sont destinés aux parents et proposent des pistes d’organisation. Ils ne remplacent pas les informations gouvernementales ni un accompagnement professionnel adapté à votre situation.','Écrivez vos trois intentions. Consultez ensuite le portail officiel depuis la bibliothèque.',null,'Nos trois intentions

1. Nous aimerions…
   Parce que…
2. Nous aimerions…
   Parce que…
3. Nous aimerions…
   Parce que…

Ce qui relève des démarches officielles (à vérifier dans les ressources) :
-') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000003','Choisir une trace qui raconte',6,1,'Une trace utile raconte une découverte : une photo d’une construction, quelques phrases dictées ou un dessin accompagné d’une question. Conserver moins de traces, avec un peu de contexte, facilite leur relecture.

Notez la date, l’activité et ce que votre enfant souhaite raconter. Privilégiez ses mots et protégez sa vie privée. Les documents de votre espace familial ne sont pas publiés dans la communauté.

Prenez régulièrement le temps de revoir ces traces ensemble. Cet outil aide à observer les apprentissages; il ne constitue pas automatiquement un dossier répondant aux exigences officielles.','Choisissez un document sans données sensibles et ajoutez-le à votre portfolio privé, avec une courte note de contexte.',null,'Fiche de trace

Date :
Enfant :
Activité :
Ce que l’enfant raconte (ses mots) :
Ce que j’ai observé :
Question qui reste ouverte :') on conflict(id) do nothing;
insert into public.lessons (id,course_id,title,minutes,position,body,exercise,video_url,template) values ('40000000-0000-4000-8000-000000000006','30000000-0000-4000-8000-000000000004','À quoi sert un bilan de progression',7,1,'Le cadre québécois prévoit des bilans qui décrivent la progression de l’enfant au fil de l’année. Leur but n’est pas de tout prouver : ils rendent lisible le chemin parcouru pour votre enfant, pour vous et pour votre interlocuteur.

Un bilan devient simple lorsqu’il s’appuie sur des traces déjà rassemblées : quelques notes datées, des photos choisies et vos observations. Le portfolio privé de ParentEd vous aide à les regrouper par enfant.

Ce cours explique la logique et propose une méthode de travail. Les exigences exactes, les dates et les formulaires appartiennent aux sources officielles : consultez-les depuis la bibliothèque et gardez la date de votre relevé.','Ouvrez la ressource « Démarche et étapes », puis notez dans votre plan hebdomadaire un moment de dix minutes, cette semaine, pour relire vos traces.',null,'Canevas de relecture avant un bilan

Période couverte :
Enfant :

Ce que nous avons exploré (3 à 5 points) :
-

Traces qui l’illustrent (dates) :
-

Ce que l’enfant dit avoir appris :

Ce que nous ajustons pour la suite :

Rappel : vérifier les attentes exactes et les échéances dans la source officielle.') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000001','L’enseignement à la maison au Québec','Le point de départ officiel pour retrouver les informations du ministère. Nos cours sont un accompagnement indépendant.','Pour commencer','https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison','Gouvernement du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000002','Démarche et étapes','Retrouvez les étapes et les documents à consulter directement auprès de la source officielle : avis, projet d’apprentissage, bilans et suivi.','Démarches','https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/demarche-etapes','Gouvernement du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000003','Services de soutien','Explorez les services publics décrits par le ministère et vérifiez les modalités qui concernent votre situation.','Accompagnement','https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien','Gouvernement du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000004','Guide des exigences (PDF officiel)','Le guide gouvernemental détaillé. Long à lire : nos cours « Faire ses premiers pas » et « Préparer ses bilans » proposent par où commencer.','Démarches','https://cdn-contenu.quebec.ca/cdn-contenu/education/enseignement-maison/Guide-exigences-enseignement-maison.pdf','Gouvernement du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.resources (id,title,description,category,url,source,checked_at) values ('80000000-0000-4000-8000-000000000005','Vie privée : collecte de renseignements personnels','Repères de la Commission d’accès à l’information pour comprendre ce qu’une entreprise peut collecter. Utile pour choisir vos outils et applications.','Vie privée','https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/collecte-renseignements-personnels_entreprises','Commission d’accès à l’information du Québec','2026-09-05') on conflict(id) do nothing;
insert into public.groups (id,name,description,kind,created_at) values ('a0000000-0000-4000-8000-000000000001','Montréal et environs','Familles de l’île de Montréal : rencontres au parc, sorties et entraide de proximité.','region','2026-09-01T12:00:00Z') on conflict(id) do nothing;
insert into public.groups (id,name,description,kind,created_at) values ('a0000000-0000-4000-8000-000000000002','Laval et Rive-Nord','Pour coordonner des activités et s’entraider au nord de la rivière.','region','2026-09-01T12:00:00Z') on conflict(id) do nothing;
insert into public.groups (id,name,description,kind,created_at) values ('a0000000-0000-4000-8000-000000000003','Débuter l’école maison','Vos premières questions, sans jugement : démarches, organisation et confiance.','theme','2026-09-01T12:00:00Z') on conflict(id) do nothing;
insert into public.groups (id,name,description,kind,created_at) values ('a0000000-0000-4000-8000-000000000004','Apprendre dehors','Nature, observation, sorties : partager nos idées d’apprentissage en plein air.','theme','2026-09-01T12:00:00Z') on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000001','Une matinée au jardin botanique','Observer les couleurs de l’automne et remplir un petit carnet nature ensemble. Rencontre fictive et gratuite pour la démonstration. Chaque enfant reste sous la supervision de son parent. Annulation possible depuis cette page.','2026-09-15','10:00','Montréal · Entrée du jardin','Camille — ParentEd (fictif)','6–12 ans',true,'Montréal','Gratuit',true,'none',null,'https://www.openstreetmap.org/?mlat=45.5590&mlon=-73.5630#map=16/45.5590/-73.5630',null,45.559,-73.563) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000002','Café des parents : nos routines','Un temps d’échange pour partager ce qui fonctionne, poser ses questions et repartir avec une idée. Rencontre fictive et gratuite. Les parents restent responsables de leurs enfants. Désinscription libre.','2026-09-18','13:30','Montréal · Bibliothèque de quartier','Sami — membre (fictif)','Parents et enfants',true,'Montréal','Gratuit',false,'none',null,null,null,45.523,-73.58) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000003','Le parc du mardi','Rencontre récurrente au parc pour jouer, discuter et se retrouver chaque semaine. Rencontre fictive. Chaque famille apporte sa collation; les parents restent présents et responsables.','2026-09-08','14:30','Montréal · Parc Laurier, près des jeux d’eau','Camille — ParentEd (fictif)','Tous les âges',true,'Montréal','Gratuit',false,'weekly','2026-11-24','https://www.openstreetmap.org/?mlat=45.5310&mlon=-73.5880#map=16/45.5310/-73.5880',null,45.531,-73.588) on conflict(id) do nothing;
insert into public.events (id,title,description,date,time,location,organizer,age,published,region,price,featured,recurrence,recurrence_until,map_url,created_by,lat,lng) values ('70000000-0000-4000-8000-000000000004','Samedi découverte : le marché et ses saisons','Une sortie du week-end pour observer les produits d’ici, calculer un petit budget et discuter avec les producteurs. Rencontre fictive. Les achats restent à la charge de chaque famille.','2026-09-19','09:30','Laval · Marché public','Camille — ParentEd (fictif)','5–14 ans',true,'Laval et Rive-Nord','Entrée libre',false,'none',null,null,null,45.558,-73.73) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published) values ('90000000-0000-4000-8000-000000000001',null,'Nadia',array['Mathématiques','Sciences']::text[],'Baccalauréat en enseignement au secondaire (fictif) · 6 ans d’expérience en soutien individuel · Références vérifiées par l’équipe (fictif)','J’aime partir de ce que l’enfant comprend déjà pour construire la suite, avec des manipulations concrètes. Séances individuelles, en ligne ou à la bibliothèque.','Environ 55 $ / heure, facturé directement par la tutrice','Montréal','les deux',true) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published) values ('90000000-0000-4000-8000-000000000002',null,'Karim',array['Français','Anglais']::text[],'Maîtrise en didactique des langues (fictif) · Ateliers de lecture pour 6–12 ans · Références vérifiées par l’équipe (fictif)','Lecture, écriture et plaisir des mots. Je propose des séances courtes et régulières plutôt que de longs blocs.','45 à 60 $ / heure selon la formule, facturé directement','Laval et Rive-Nord','en ligne',true) on conflict(id) do nothing;
insert into public.tutors (id,profile_id,display_name,subjects,qualifications,bio,rate_hint,region,mode,published) values ('90000000-0000-4000-8000-000000000003',null,'Profil en préparation',array['Musique']::text[],'Vérification des références en cours (fictif)','','','Montréal','en personne',false) on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001',2,'13:00','16:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000001',4,'09:00','12:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000002',3,'14:00','17:00') on conflict(id) do nothing;
insert into public.tutor_availability (id,tutor_id,weekday,start_time,end_time) values ('91000000-0000-4000-8000-000000000004','90000000-0000-4000-8000-000000000002',6,'09:00','12:00') on conflict(id) do nothing;
