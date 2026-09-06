import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  tableNames,
  validateFile,
  validatePassword,
  required,
  type Data,
  type Profile,
  type Table,
  type Tables,
} from "../domain";
import type { AuthEvent, Gateway } from "./gateway";
import { termsVersion } from "../legal";
export const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);
const messages: Record<string, string> = {
  "23505": "Cet élément est déjà enregistré.",
  "42501": "Vous n’avez pas accès à cette action.",
  "23514": "Une valeur saisie n’est pas acceptée. Vérifiez le formulaire.",
  "23503": "Cet élément fait référence à un contenu qui n’existe plus.",
};
export class SupabaseGateway implements Gateway {
  mode = "supabase" as const;
  client: SupabaseClient;
  constructor() {
    if (!configured)
      throw new Error("La connexion Supabase doit être configurée.");
    this.client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
  }
  private async profile(id: string): Promise<Profile> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (error)
      throw new Error(
        "Votre profil est indisponible. Vérifiez les migrations Supabase et reconnectez-vous.",
      );
    return data;
  }
  async session() {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();
    if (error) throw error;
    return session ? this.profile(session.user.id) : null;
  }
  async login(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      throw new Error(
        error.message.toLowerCase().includes("confirm")
          ? "Confirmez d’abord votre adresse courriel grâce au message reçu."
          : "Connexion impossible. Vérifiez votre courriel et votre mot de passe.",
      );
    return this.profile(data.user.id);
  }
  async signup(email: string, password: string, displayName: string) {
    validatePassword(password);
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: required(displayName, 80),
          accepted_terms: termsVersion,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error)
      throw new Error(
        error.message.toLowerCase().includes("already")
          ? "Un compte existe déjà avec ce courriel. Connectez-vous ou réinitialisez votre mot de passe."
          : "La création du compte a échoué. Vérifiez le courriel et réessayez.",
      );
    if (data.session && data.user) return this.profile(data.user.id);
    return "confirm";
  }
  async resetPassword(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error)
      throw new Error(
        "L’envoi du courriel de réinitialisation a échoué. Réessayez dans quelques minutes.",
      );
  }
  async updatePassword(password: string) {
    validatePassword(password);
    const { error } = await this.client.auth.updateUser({ password });
    if (error)
      throw new Error(
        "Le mot de passe n’a pas pu être modifié. Ouvrez de nouveau le lien reçu par courriel.",
      );
  }
  onAuthEvent(listener: (event: AuthEvent) => void) {
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") listener("recovery");
      if (event === "SIGNED_OUT") listener("signed_out");
    });
    return () => subscription.unsubscribe();
  }
  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }
  async load() {
    const entries = await Promise.all(
      tableNames.map(async (t) => {
        const { data, error } = await this.client
          .from(t)
          .select("*")
          .limit(1000);
        if (error)
          throw new Error(
            "Chargement impossible. Vérifiez votre connexion et que les migrations SQL sont appliquées.",
          );
        return [t, data];
      }),
    );
    return Object.fromEntries(entries) as Data;
  }
  async save<K extends Table>(t: K, row: Tables[K]) {
    const { error } = await this.client.from(t).upsert(row);
    if (error)
      throw new Error(
        messages[error.code] ??
          "Enregistrement impossible. Réessayez après avoir vérifié votre connexion.",
      );
  }
  async patch<K extends Table>(t: K, id: string, changes: Partial<Tables[K]>) {
    const { error } = await this.client
      .from(t)
      .update(changes as Record<string, unknown>)
      .eq("id", id);
    if (error)
      throw new Error(
        messages[error.code] ??
          "Modification impossible. Réessayez après avoir vérifié votre connexion.",
      );
  }
  async remove(t: Table, id: string) {
    const { error } = await this.client.from(t).delete().eq("id", id);
    if (error) throw new Error("Suppression impossible. Réessayez.");
  }
  async sendBookingEmail(bookingId: string) {
    try {
      const { data, error } = await this.client.functions.invoke(
        "booking-email",
        { body: { booking_id: bookingId } },
      );
      return !error && Boolean((data as { sent?: boolean } | null)?.sent);
    } catch {
      return false;
    }
  }
  async askAssistant(
    messages: { role: "user" | "assistant"; content: string }[],
  ) {
    const { data, error } = await this.client.functions.invoke("assistant", {
      body: { messages },
    });
    type Reply = {
      available?: boolean;
      answer?: string;
      error?: string;
      remaining?: number;
    };
    let r = data as Reply | null;
    if (error) {
      // Non-2xx answers carry their JSON body on the error context.
      const ctx = (error as { context?: Response }).context;
      r = ctx
        ? await ctx
            .clone()
            .json()
            .then((j: Reply) => j)
            .catch(() => null)
        : null;
    }
    if (r && r.available === false) return null;
    if (!r?.answer)
      throw new Error(
        r?.error ?? "L’assistant est indisponible pour le moment.",
      );
    return { answer: r.answer, remaining: r.remaining };
  }
  async upload(file: File, family: string) {
    validateFile(file);
    const path = family + "/" + crypto.randomUUID();
    const { error } = await this.client.storage
      .from("family-documents")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error)
      throw new Error(
        "Le fichier n’a pas pu être enregistré. Vérifiez votre connexion et sa taille.",
      );
    return path;
  }
  async download(path: string) {
    const { data, error } = await this.client.storage
      .from("family-documents")
      .download(path);
    if (error)
      throw new Error(
        "Ce fichier est indisponible ou vous n’y avez pas accès.",
      );
    return data;
  }
  async deleteFile(path: string) {
    const { error } = await this.client.storage
      .from("family-documents")
      .remove([path]);
    if (error) throw new Error("Suppression du fichier impossible.");
  }
}
