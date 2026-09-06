import { readFile, readdir, writeFile } from "node:fs/promises";
// Builds one SQL file to paste into the Supabase SQL editor: all migrations, then the fictitious content seed.
const files = (await readdir("supabase/migrations"))
  .filter((f) => f.endsWith(".sql"))
  .sort();
let out = `-- ParentEd — script complet pour un projet Supabase neuf.
-- Généré par scripts/bundle-sql.mjs le ${new Date().toISOString().slice(0, 10)}. Ne pas modifier à la main : éditer les migrations puis relancer \`npm run sql:bundle\`.
-- À exécuter UNE seule fois dans SQL Editor. Pour une base déjà migrée, appliquer uniquement la nouvelle migration.
begin;
`;
for (const f of files) {
  out +=
    `\n-- ===== Migration ${f} =====\n` +
    (await readFile("supabase/migrations/" + f, "utf8")).trim() +
    "\n";
}
out +=
  "\n-- ===== Contenus de démonstration fictifs (facultatif : supprimer cette section pour une base vide) =====\n";
out += (await readFile("supabase/seed.sql", "utf8")).trim() + "\n";
out += "commit;\n";
await writeFile("supabase/parented-complet.sql", out);
console.log(
  `supabase/parented-complet.sql : ${files.length} migration(s) + seed.`,
);
