import { chromium } from '/Users/shehabalbikbachi/Desktop/ParentEd/node_modules/playwright/index.mjs';

const OUT = '/Users/shehabalbikbachi/Desktop/ParentEd/video/public/shots';
const BASE = 'http://127.0.0.1:5173';
const VP = { width: 1440, height: 900 };

const b = await chromium.launch();

async function login(who = 'Explorer avec Amélie') {
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2, locale: 'fr-CA' });
  const p = await ctx.newPage();
  await p.goto(BASE + '/#connexion', { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  await p.getByText(who, { exact: false }).first().click();
  await p.waitForTimeout(1600);
  return { ctx, p };
}

async function go(p, hash, wait = 1500) {
  await p.evaluate((h) => { window.location.hash = h; }, hash);
  await p.waitForTimeout(wait);
}

const snap = async (p, name) => {
  await p.screenshot({ path: `${OUT}/${name}.png` });
  console.log('  ✓', name);
};

const tryClick = async (p, label, opts = {}) => {
  try {
    const el = p.getByText(label, { exact: false }).first();
    await el.scrollIntoViewIfNeeded({ timeout: 2000 });
    await el.click({ timeout: 3000, ...opts });
    return true;
  } catch (e) {
    console.log('  ! clic manqué:', label, '—', String(e).split('\n')[0].slice(0, 80));
    return false;
  }
};

// helper : renvoie la position à l'écran d'un élément (pour animer le curseur)
const boxOf = async (p, label) => {
  try {
    const el = p.getByText(label, { exact: false }).first();
    const bb = await el.boundingBox({ timeout: 2000 });
    return bb ? { x: Math.round(bb.x + bb.width / 2), y: Math.round(bb.y + bb.height / 2) } : null;
  } catch { return null; }
};

const marks = {};

// ---------------------------------------------------------------- PARENT
{
  const { ctx, p } = await login();

  console.log('accueil');
  await go(p, 'accueil');
  await snap(p, 'accueil');

  console.log('cours');
  await go(p, 'cours');
  await snap(p, 'cours');
  marks.coursCard = await boxOf(p, 'Découvrir le cours');
  if (await tryClick(p, 'Découvrir le cours')) {
    await p.waitForTimeout(1600);
    await snap(p, 'cours-detail');
    marks.lecon = await boxOf(p, 'Observer avant de planifier');
    if (await tryClick(p, 'Observer avant de planifier')) {
      await p.waitForTimeout(1300);
      await snap(p, 'cours-lecon');
    }
  }

  console.log('semaine');
  await go(p, 'semaine');
  await snap(p, 'semaine');
  marks.ajouter = await boxOf(p, 'Ajouter une activité');
  if (await tryClick(p, 'Ajouter une activité')) {
    await p.waitForTimeout(1200);
    await snap(p, 'semaine-form');
  }

  console.log('portfolio');
  await go(p, 'semaine');
  await tryClick(p, 'Portfolio privé');
  await p.waitForTimeout(1400);
  await snap(p, 'portfolio');

  console.log('communaute');
  await go(p, 'communaute');
  await snap(p, 'communaute');
  await go(p, 'communaute/carte', 3500);
  await snap(p, 'carte');
  await go(p, 'communaute/membres', 1800);
  await snap(p, 'membres');

  console.log('rencontres');
  await go(p, 'evenements', 2000);
  await snap(p, 'evenements');
  marks.inscrire = await boxOf(p, 'S’inscrire');
  if (await tryClick(p, 'S’inscrire')) {
    await p.waitForTimeout(1600);
    await snap(p, 'evenements-inscrit');
  }

  console.log('tutorat');
  await go(p, 'tutorat', 2000);
  await snap(p, 'tutorat');

  console.log('ressources');
  await go(p, 'ressources', 1800);
  await snap(p, 'ressources');

  await ctx.close();
}

// ---------------------------------------------------------------- TUTRICE
{
  const { ctx, p } = await login('Tutrice : Nadia');
  await go(p, 'tutorat', 2000);
  await snap(p, 'tutrice');
  await ctx.close();
}

await b.close();
console.log('\nrepères curseur:', JSON.stringify(marks, null, 1));
