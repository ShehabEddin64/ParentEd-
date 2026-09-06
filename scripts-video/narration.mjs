import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const AUDIO = '/Users/shehabalbikbachi/Desktop/ParentEd/video/public/audio';
fs.mkdirSync(AUDIO, { recursive: true });

const VOICE = 'Amélie';
const RATE = '166';

// une prise = un plan narré
const takes = [
  {
    id: 'intro',
    text: "Enseigner à la maison, ça commence par beaucoup de questions. Voici comment ParentEd accompagne un parent, une semaine à la fois.",
  },
  {
    id: 'accueil',
    text: "Lundi matin. En ouvrant son espace, Amélie voit d'abord ce qui l'attend : le prochain rendez-vous de Lina, la semaine qui commence, et où en sont ses deux enfants.",
  },
  {
    id: 'cours',
    text: "Avant d'enseigner, il faut comprendre. Les cours de ParentEd sont écrits pour le parent, pas pour l'enfant.",
  },
  {
    id: 'lecon',
    text: "Trouver son rythme en famille. Trois leçons courtes, un exemple, un exercice, et une petite action à essayer aujourd'hui. La progression se garde : Amélie reprend là où elle s'est arrêtée.",
  },
  {
    id: 'semaine',
    text: "Ma semaine rassemble tout au même endroit. Un plan hebdomadaire écrit, une grille par enfant, et chaque activité rattachée à une matière.",
  },
  {
    id: 'ajout',
    text: "Amélie ajoute une pause au parc, le lundi. Elle est enregistrée tout de suite. La semaine se construit, elle ne se refait pas chaque dimanche soir.",
  },
  {
    id: 'portfolio',
    text: "Les traces restent privées. Les notes, les photos et les fichiers de la famille ne sont jamais publiés dans la communauté.",
  },
  {
    id: 'communaute',
    text: "Et la socialisation ? Des groupes par région et par thème, des discussions entre parents, et une carte des familles proches.",
  },
  {
    id: 'carte',
    text: "Les familles apparaissent au centre de leur ville, jamais à leur adresse.",
  },
  {
    id: 'rencontres',
    text: "Les familles proposent leurs propres rencontres. Le parc du mardi, une matinée au jardin botanique. Amélie s'inscrit en un clic.",
  },
  {
    id: 'tutorat',
    text: "Quand une matière bloque, elle réserve une heure avec une tutrice. Nadia confirme le créneau, puis dépose un compte rendu après la séance. Le parent reste l'enseignant.",
  },
  {
    id: 'fin',
    text: "Se former. S'organiser. Se rencontrer. Se faire aider. ParentEd : enseigner à la maison, ensemble.",
  },
];

const manifest = [];
for (const t of takes) {
  const aiff = `${AUDIO}/${t.id}.aiff`;
  const wav = `${AUDIO}/${t.id}.wav`;
  execFileSync('say', ['-v', VOICE, '-r', RATE, '-o', aiff, t.text]);
  // 48 kHz mono, léger gain, silence de sécurité en fin
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', aiff,
    '-af', 'apad=pad_dur=0.35,loudnorm=I=-18:TP=-2:LRA=11',
    '-ar', '48000', '-ac', '1', wav]);
  fs.unlinkSync(aiff);
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration', '-of', 'default=nw=1:nk=1', wav]).toString().trim());
  manifest.push({ id: t.id, text: t.text, audio: `audio/${t.id}.wav`, duration: dur });
  console.log(`${t.id.padEnd(12)} ${dur.toFixed(2)}s  ${t.text.slice(0, 52)}…`);
}
const total = manifest.reduce((a, m) => a + m.duration, 0);
console.log('\ntotal narration :', total.toFixed(1), 's');
fs.writeFileSync('/Users/shehabalbikbachi/Desktop/ParentEd/video/src/narration.json',
  JSON.stringify(manifest, null, 2));
