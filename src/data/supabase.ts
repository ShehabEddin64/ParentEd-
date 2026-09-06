import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  tableNames,
  validateFile,
  type Data,
  type Profile,
  type Table,
  type Tables,
} from "../domain";
import type { Gateway } from "./gateway";
export const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);
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
        "Connexion impossible. Vérifiez votre courriel et votre mot de passe.",
      );
    return this.profile(data.user.id);
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
            "Chargement impossible. Vérifiez votre connexion et la configuration de la base.",
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
        error.code === "23505"
          ? "Cet élément est déjà enregistré."
          : error.code === "42501"
            ? "Vous n’avez pas accès à cette action."
            : "Enregistrement impossible. Réessayez après avoir vérifié votre connexion.",
      );
  }
  async remove(t: Table, id: string) {
    const { error } = await this.client.from(t).delete().eq("id", id);
    if (error) throw new Error("Suppression impossible. Réessayez.");
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
