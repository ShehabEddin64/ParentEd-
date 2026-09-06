import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
const url = process.env.VITE_SUPABASE_URL;
if (!url || !["127.0.0.1", "localhost"].includes(new URL(url).hostname))
  throw new Error("Ce script est réservé à Supabase local.");
if (
  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
  !process.env.DEMO_PASSWORD ||
  process.env.DEMO_PASSWORD.length < 12
)
  throw new Error(
    "Configurer la clé de service locale et DEMO_PASSWORD (12 caractères minimum) dans .env.local.",
  );
const client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { seed, ids } = await import(
  "data:text/javascript," +
    encodeURIComponent(
      stripTypeScriptTypes(await readFile("src/data/seed.ts", "utf8")),
    )
);
const {
  data: { users },
  error: listError,
} = await client.auth.admin.listUsers();
if (listError) throw listError;
const mapping = {};
for (const [name, email, oldId] of [
  ["Amélie", "amelie@demo.parented.test", ids.parent],
  ["Sami", "sami@demo.parented.test", ids.other],
  ["Camille", "admin@demo.parented.test", ids.admin],
]) {
  let user = users.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await client.auth.admin.createUser({
      email,
      password: process.env.DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: name },
    });
    if (error) throw error;
    user = data.user;
  }
  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  mapping[oldId] = profile;
  if (oldId === ids.admin) {
    const { error } = await client
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);
    if (error) throw error;
  }
  console.log(`${email} : compte local prêt`);
}
for (const table of ["tasks", "posts"])
  for (const source of seed[table]) {
    const row = { ...source };
    if (row.family_id) row.family_id = mapping[ids.parent].family_id;
    if (row.user_id) row.user_id = mapping[row.user_id].id;
    const { error } = await client.from(table).upsert(row);
    if (error) throw error;
  }
console.log("Données fictives chargées. Aucun secret affiché.");
