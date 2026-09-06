import { chromium } from '/Users/shehabalbikbachi/Desktop/ParentEd/node_modules/playwright/index.mjs';
const OUT='/Users/shehabalbikbachi/Desktop/ParentEd/video/public/shots';
const BASE='http://127.0.0.1:5173';
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,locale:'fr-CA'});
const p=await ctx.newPage();
await p.goto(BASE+'/#connexion',{waitUntil:'networkidle'}); await p.waitForTimeout(700);
await p.getByText('Explorer avec Amélie',{exact:false}).first().click(); await p.waitForTimeout(1600);

// --- semaine : formulaire rempli puis résultat
await p.evaluate(()=>{window.location.hash='semaine';}); await p.waitForTimeout(1600);
await p.getByRole('button',{name:/Ajouter une activité/}).first().click();
await p.waitForTimeout(900);
const champ = p.getByPlaceholder(/Une lecture, une sortie/).first();
await champ.click();
await champ.type('Pause au parc', { delay: 55 });
await p.waitForTimeout(400);
await p.screenshot({path:`${OUT}/semaine-form-rempli.png`});
console.log('✓ semaine-form-rempli');
const save = p.getByRole('button',{name:/Enregistrer l’activité|Enregistrer l'activité/}).first();
const sb = await save.boundingBox();
console.log('bouton enregistrer', sb && {x:Math.round(sb.x+sb.width/2),y:Math.round(sb.y+sb.height/2)});
await save.click(); await p.waitForTimeout(1800);
await p.screenshot({path:`${OUT}/semaine-apres.png`});
console.log('✓ semaine-apres');

// --- portfolio privé
await p.getByRole('button',{name:/Portfolio privé/}).first().click();
await p.waitForTimeout(1600);
await p.screenshot({path:`${OUT}/portfolio.png`});
console.log('✓ portfolio');

// --- résultats / suivi
await p.getByRole('button',{name:/^Résultats/}).first().click().catch(()=>{});
await p.waitForTimeout(1500);
await p.screenshot({path:`${OUT}/resultats.png`});
console.log('✓ resultats');

// --- accueil : recadrage haut de page propre
await p.evaluate(()=>{window.location.hash='accueil';}); await p.waitForTimeout(1800);
await p.screenshot({path:`${OUT}/accueil.png`});
console.log('✓ accueil');
await b.close();
