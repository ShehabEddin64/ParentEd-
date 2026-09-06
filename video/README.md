# ParentEd — vidéo de démonstration (côté parent)

Vidéo Remotion de ~107 s, 1920×1080, 30 fps. Narration en français québécois,
**aucune musique**. Le récit suit une parente fictive, Amélie, sur une semaine.

## Rendre la vidéo

```bash
cd video && npm run render
```

Sortie : `out/ParentEd-demo-parent.mp4`.

## Retoucher en direct

```bash
cd video && npm run studio
```

Ouvre Remotion Studio : chaque prise apparaît comme une séquence nommée dans la
timeline, on peut se déplacer image par image et voir l'effet d'un changement.

## Les douze prises

| Prise | Écran montré | Idée portée |
| --- | --- | --- |
| `intro` | Carton titre | Le point de vue : un parent, une semaine |
| `accueil` | Mon accueil | Ce qui m'attend aujourd'hui |
| `cours` | Mes cours | Des cours écrits pour le parent |
| `lecon` | Une leçon | Explication, exemple, exercice |
| `semaine` | Ma semaine | Tout au même endroit |
| `ajout` | Ajout d'une activité | Enregistrée tout de suite |
| `portfolio` | Portfolio privé | Jamais publié dans la communauté |
| `communaute` | Communauté | Des parents près de chez soi |
| `carte` | Carte | La ville, jamais l'adresse |
| `rencontres` | Rencontres | Proposées par les familles |
| `tutorat` | Rendez-vous et espace tuteur | Le parent reste l'enseignant |
| `fin` | Carton final | Se former, s'organiser, se rencontrer, se faire aider |

## Comment c'est fabriqué

- **Images** : `public/shots/*.png` — captures réelles de l'application en mode
  démonstration, prises par Playwright en 1440×900 à 2× (donc 2880×1800).
  Les interactions sont filmées en « avant / après » : le formulaire vide, le
  formulaire rempli, puis la semaine avec la nouvelle activité.
- **Mouvement** : `src/scenes.ts` décrit, pour chaque prise, des images-clés de
  caméra `{t, s, cx, cy}` — `s` le zoom, `cx`/`cy` le point visé **en
  coordonnées de l'application** (1440×900). `Screen.tsx` interpole entre les
  clés et empêche la caméra de sortir de l'image ou de couper la barre latérale
  en deux.
- **Curseur** : `cursor` et `clicks` dans la même unité. Le curseur se déplace
  avec un amorti, s'enfonce au clic et déclenche une onde ; la capture « après »
  prend le relais en trois images, ce qui donne l'impression d'un vrai clic.
- **Voix** : générée par la synthèse macOS (`say -v Amélie -r 166`), normalisée
  par ffmpeg. Le texte de chaque prise est dans `src/narration.json`, avec sa
  durée exacte — c'est cette durée qui fixe la longueur du plan.
- **Rythme** : durée d'un plan = narration + 1,15 s de respiration ; fondu
  enchaîné de 11 images entre les plans.

## Refaire la narration

Modifier les textes puis relancer le script de synthèse :

```bash
node ../scripts-video/narration.mjs
```

(le script est aussi conservé dans le dossier de travail de la session ; il
écrit les `.wav` dans `public/audio/` et met à jour `src/narration.json`).

Pour une voix différente : `say -v '?'` liste les voix installées ; `Amélie`
est la voix fr-CA par défaut ici. Pour une vraie voix humaine, remplacer les
fichiers `public/audio/<prise>.wav` en gardant les mêmes noms, puis mettre à
jour les durées dans `src/narration.json`.

## Refaire les captures

Le serveur de développement doit tourner (`npm run dev` à la racine), puis
rejouer les scripts de capture Playwright. Les points cliqués (`cursor`,
`clicks` dans `scenes.ts`) sont exprimés dans le repère 1440×900 : si l'interface
change de mise en page, il faut relever les nouvelles coordonnées — les scripts
de capture les affichent dans la console.

## Mentions

Toutes les données affichées sont fictives (profils Amélie, Sami, Lina, Adam,
Nadia, Camille). La vidéo l'indique au carton titre et au carton final. Aucun
paiement, aucun envoi de courriel et aucun service distant n'est montré comme
actif.
