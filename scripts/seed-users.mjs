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
const accounts = [
  ["Amélie", "amelie@demo.parented.test", ids.parent, "parent"],
  ["Sami", "sami@demo.parented.test", ids.other, "parent"],
  ["Camille", "admin@demo.parented.test", ids.admin, "admin"],
  ["Nadia", "nadia@demo.parented.test", ids.tutor, "tutor"],
  [
    "Fatima",
    "fatima@demo.parented.test",
    "10000000-0000-4000-8000-000000000005",
    "parent",
  ],
  [
    "Marc",
    "marc@demo.parented.test",
    "10000000-0000-4000-8000-000000000006",
    "parent",
  ],
];
const userMap = {};
const familyMap = {};
for (const [name, email, oldId, role] of accounts) {
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
  userMap[oldId] = profile.id;
  familyMap[seed.profiles.find((p) => p.id === oldId).family_id] =
    profile.family_id;
  const source = seed.profiles.find((p) => p.id === oldId);
  {
    const { error } = await client
      .from("profiles")
      .update({
        role,
        city: source.city,
        lat: source.lat,
        lng: source.lng,
        bio: source.bio,
        children_ages: source.children_ages,
        interests: source.interests,
        show_on_map: source.show_on_map,
      })
      .eq("id", user.id);
    if (error) throw error;
  }
  console.log(`${email} : compte local prêt (${role})`);
}
// Link the demo tutor account to its published tutor profile.
{
  const { error } = await client
    .from("tutors")
    .update({ profile_id: userMap[ids.tutor] })
    .eq("id", ids.tutorNadia);
  if (error) throw error;
}
// Family and personal rows, re-attributed to the local accounts.
const personal = [
  "children",
  "week_plans",
  "library_items",
  "notes",
  "tasks",
  "group_members",
  "posts",
  "lesson_questions",
  "bookings",
  "tutor_reports",
  "registrations",
  "post_likes",
  "messages",
  "tutor_reviews",
];
for (const table of personal)
  for (const source of seed[table]) {
    const row = { ...source };
    if (row.family_id) row.family_id = familyMap[row.family_id];
    if (row.user_id) row.user_id = userMap[row.user_id];
    if (row.sender_id) row.sender_id = userMap[row.sender_id];
    if (row.recipient_id) row.recipient_id = userMap[row.recipient_id];
    const { error } = await client.from(table).upsert(row);
    if (error) throw error;
  }
{
  const { error } = await client
    .from("events")
    .update({ created_by: userMap[ids.admin] })
    .is("created_by", null);
  if (error) throw error;
}
console.log("Données fictives chargées. Aucun secret affiché.");
