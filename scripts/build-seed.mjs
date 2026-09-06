import { readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
const text = await readFile("src/data/seed.ts", "utf8");
const { seed } = await import(
  "data:text/javascript," + encodeURIComponent(stripTypeScriptTypes(text))
);
const quote = (x) => "'" + String(x).replaceAll("'", "''") + "'";
const literal = (x) =>
  x === null || x === undefined
    ? "null"
    : typeof x === "boolean" || typeof x === "number"
      ? String(x)
      : Array.isArray(x)
        ? "array[" + x.map(quote).join(",") + "]::text[]"
        : quote(x);
// Shared content only. Rows that reference accounts (created_by, profile_id) are neutralised:
// the accounts are created separately and linked by scripts/seed-users.mjs or by an operator.
const contentTables = [
  "courses",
  "lessons",
  "resources",
  "groups",
  "events",
  "tutors",
  "tutor_availability",
];
let sql =
  "-- Fictitious learning content for local demonstration. Not production content.\n";
for (const table of contentTables)
  for (const source of seed[table]) {
    const row = { ...source };
    if ("created_by" in row) row.created_by = null;
    if ("profile_id" in row) row.profile_id = null;
    sql += `insert into public.${table} (${Object.keys(row).join(",")}) values (${Object.values(row).map(literal).join(",")}) on conflict(id) do nothing;\n`;
  }
await writeFile("supabase/seed.sql", sql);
console.log("supabase/seed.sql régénéré.");
