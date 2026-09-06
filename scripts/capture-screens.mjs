// Captures real screenshots of the demo space for the public landing page. Run with the dev server up: node scripts/capture-screens.mjs
import { chromium } from "@playwright/test";
const base = process.env.CAPTURE_URL ?? "http://localhost:5173";
const shots = [
  ["accueil", "#accueil", "Accueil"],
  ["semaine", "#semaine", "Ma semaine"],
  ["carte", "#communaute/carte", "Carte"],
  ["rendezvous", "#tutorat", "Rendez-vous"],
  ["examens", "#examens", "Examens"],
  ["resultats", "#semaine", "Résultats"],
];
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 820 },
  deviceScaleFactor: 1.5,
});
await page.goto(base + "/#connexion");
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
await page.reload();
await page.getByRole("button", { name: /Explorer avec Amélie/ }).click();
await page.waitForSelector(".app-shell");
await page.addStyleTag({
  content:
    "*,*::before,*::after{animation:none!important;transition:none!important} .assistant-fab{display:none!important}",
});
for (const [name, hash, label] of shots) {
  await page.evaluate((h) => {
    location.hash = h;
  }, hash);
  await page.waitForTimeout(600);
  if (name === "resultats") {
    await page.getByRole("button", { name: /Résultats/ }).click();
    await page.waitForTimeout(400);
  }
  if (name === "carte") await page.waitForTimeout(2500);
  if (name === "accueil") await page.waitForTimeout(3500);
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important} .assistant-fab{display:none!important}",
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `public/images/app-${name}.jpg`,
    type: "jpeg",
    quality: 82,
    clip: { x: 0, y: 0, width: 1280, height: 820 },
  });
  console.log("captured", label);
}
await browser.close();
