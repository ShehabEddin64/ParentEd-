import { readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
const text = await readFile("src/data/seed.ts", "utf8");
const { seed } = await import(
  "data:text/javascript," + encodeURIComponent(stripTypeScriptTypes(text))
);
const literal = (x) =>
  typeof x === "boolean"
    ? String(x)
    : typeof x === "number"
      ? String(x)
      : "'" + String(x).replaceAll("'", "''") + "'";
let sql =
  "-- Fictitious learning content for local demonstration. Not production content.\n";
for (const table of ["courses", "lessons", "resources", "events"])
  for (const row of seed[table])
    sql += `insert into public.${table} (${Object.keys(row).join(",")}) values (${Object.values(row).map(literal).join(",")}) on conflict(id) do nothing;\n`;
await writeFile("supabase/seed.sql", sql);
