// Sends a booking confirmation e-mail to the parent (and the tutor when an address is known) through Resend.
// Deploy: supabase functions deploy booking-email --no-verify-jwt=false
// Secrets: supabase secrets set RESEND_API_KEY=re_xxx EMAIL_FROM="ParentEd <bonjour@votre-domaine>"
// Without RESEND_API_KEY the function answers { sent: false } and the app simply shows no e-mail confirmation.
import { createClient } from "npm:@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM") ?? "ParentEd <onboarding@resend.dev>";
  if (!key) return json({ sent: false, reason: "RESEND_API_KEY manquante" });
  const auth = req.headers.get("Authorization") ?? "";
  const user = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: me } = await user.auth.getUser();
  if (!me.user) return json({ sent: false, reason: "non authentifié" }, 401);
  const { booking_id } = await req.json().catch(() => ({}));
  if (typeof booking_id !== "string") return json({ sent: false, reason: "booking_id manquant" }, 400);
  // The caller must be able to see the booking (RLS); details are then read with the service role.
  const { data: visible } = await user.from("bookings").select("id").eq("id", booking_id).maybeSingle();
  if (!visible) return json({ sent: false, reason: "réservation introuvable" }, 404);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: b } = await admin
    .from("bookings")
    .select("id, child, subject, date, time, weekly, status, user_id, tutors(display_name, kind, meeting_url, contact_email)")
    .eq("id", booking_id)
    .single();
  if (!b) return json({ sent: false, reason: "réservation introuvable" }, 404);
  const { data: parent } = await admin.auth.admin.getUserById(b.user_id);
  const tutor = Array.isArray(b.tutors) ? b.tutors[0] : b.tutors;
  const when = `${b.date} à ${b.time}${b.weekly ? ", puis chaque semaine" : ""}`;
  const subject = `ParentEd · Rendez-vous ${b.status} · ${b.subject} avec ${tutor?.display_name ?? ""}`;
  const html = `<p>Bonjour,</p><p>Votre rendez-vous <strong>${b.subject}</strong> avec <strong>${tutor?.display_name ?? ""}</strong> pour <strong>${b.child}</strong> est <strong>${b.status}</strong>.</p><p>Quand : ${when}</p>${
    tutor?.meeting_url ? `<p>Lien de rencontre : <a href="${tutor.meeting_url}">${tutor.meeting_url}</a></p>` : ""
  }<p>Le tuteur facture directement la famille. Un compte rendu pédagogique vous sera transmis dans ParentEd après la séance.</p><p>— ParentEd</p>`;
  const to = [parent?.user?.email, tutor?.contact_email].filter(Boolean) as string[];
  if (!to.length) return json({ sent: false, reason: "aucune adresse" });
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  return json({ sent: res.ok, recipients: to.length, status: res.status });
});
