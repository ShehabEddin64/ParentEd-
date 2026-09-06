// ParentEd assistant: answers member questions from ParentEd's own courses and resources through the Claude API.
// Deploy: supabase functions deploy assistant
// Secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Without the key the function answers { available: false } and the app keeps its built-in search assistant.
import Anthropic from "npm:@anthropic-ai/sdk@0.90.0";
import { createClient } from "npm:@supabase/supabase-js@2";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const guide = `Tu es l’assistant de ParentEd, un espace membre en français pour les parents-éducateurs du Québec (école à la maison).
Règles :
- Réponds en français, avec chaleur et concision (au plus 180 mots), en tutoyant seulement si le parent le fait.
- Appuie-toi d’abord sur les cours, ressources et fonctions de ParentEd fournis ci-dessous; cite le cours ou la ressource utile et indique où cliquer dans l’application (Mes cours, Ma semaine, Rendez-vous, Examens, Ressources, Communauté, Rencontres).
- Pour toute démarche officielle (avis, projet d’apprentissage, bilans, évaluations ministérielles), renvoie vers la source gouvernementale listée et précise que ParentEd n’est ni une école ni une garantie de conformité; ne donne pas de conseil juridique.
- Ne réclame et ne répète jamais de renseignements personnels sur les enfants.
- Si la question dépasse ParentEd, dis-le simplement et propose un conseiller (page Rendez-vous) ou la communauté.`;
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ available: false });
  const auth = req.headers.get("Authorization") ?? "";
  const user = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: me } = await user.auth.getUser();
  if (!me.user) return json({ available: true, error: "non authentifié" }, 401);
  const body = (await req.json().catch(() => ({}))) as { messages?: { role: "user" | "assistant"; content: string }[] };
  const history = (body.messages ?? []).filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-10);
  if (!history.length || history[history.length - 1].role !== "user") return json({ available: true, error: "message manquant" }, 400);
  // Public content only (RLS applies through the caller's session): courses, lessons, resources, exams.
  const [courses, lessons, resources, exams] = await Promise.all([
    user.from("courses").select("id,title,description,category").eq("published", true),
    user.from("lessons").select("course_id,title,exercise"),
    user.from("resources").select("title,description,category,url,source"),
    user.from("exams").select("title,subject,level").eq("published", true),
  ]);
  const context = [
    "COURS POUR PARENTS :",
    ...(courses.data ?? []).map((c) => `- ${c.title} (${c.category}) : ${c.description} Leçons : ${(lessons.data ?? []).filter((l) => l.course_id === c.id).map((l) => l.title).join("; ")}`),
    "RESSOURCES OFFICIELLES :",
    ...(resources.data ?? []).map((r) => `- ${r.title} (${r.category}, ${r.source}) : ${r.description} ${r.url}`),
    "EXAMENS D’ENTRAÎNEMENT :",
    ...(exams.data ?? []).map((e) => `- ${e.title} (${e.subject}, ${e.level})`),
    "FONCTIONS : Ma semaine (planning par enfant, programme importable, portfolio, résultats pondérés), Rendez-vous (tuteurs, conseillers, coachs, créneaux réels), Examens, Ressources (favoris), Communauté (groupes, annuaire, carte, messages), Rencontres (liste, calendrier, carte, propositions).",
  ].join("\n");
  const client = new Anthropic({ apiKey: key });
  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      output_config: { effort: "low" },
      system: [
        { type: "text", text: guide, cache_control: { type: "ephemeral" } },
        { type: "text", text: context, cache_control: { type: "ephemeral" } },
      ],
      messages: history.map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
    });
    if (response.stop_reason === "refusal")
      return json({ available: true, answer: "Je ne peux pas répondre à cette demande. Un conseiller ParentEd pourra vous aider depuis la page Rendez-vous." });
    const answer = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return json({ available: true, answer });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ available: true, error: "L’assistant est très sollicité. Réessayez dans une minute." }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ available: false, error: "clé invalide" });
    if (e instanceof Anthropic.APIError) return json({ available: true, error: "L’assistant est indisponible pour le moment." }, 502);
    return json({ available: true, error: "Erreur inattendue." }, 500);
  }
});
