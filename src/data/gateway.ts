import type { Data, Profile, Table, Tables } from "../domain";
export type AuthEvent = "recovery" | "signed_out";
export interface Gateway {
  mode: "demo" | "supabase";
  session(): Promise<Profile | null>;
  login(email: string, password: string): Promise<Profile>;
  /** Returns the profile when the session opens immediately, or "confirm" when an e-mail confirmation is pending. */
  signup(
    email: string,
    password: string,
    displayName: string,
  ): Promise<Profile | "confirm">;
  resetPassword(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  onAuthEvent(listener: (event: AuthEvent) => void): () => void;
  logout(): Promise<void>;
  load(): Promise<Data>;
  save<K extends Table>(table: K, row: Tables[K]): Promise<void>;
  /** Partial update of an existing row; used where inserts are not allowed (profiles) or to mark items read. */
  patch<K extends Table>(
    table: K,
    id: string,
    changes: Partial<Tables[K]>,
  ): Promise<void>;
  remove(table: Table, id: string): Promise<void>;
  /** Asks the server to e-mail a booking confirmation. Resolves true only when a message was really sent. */
  sendBookingEmail(bookingId: string): Promise<boolean>;
  /** Asks the server-side assistant. Returns null when no AI assistant is configured. */
  askAssistant(
    messages: { role: "user" | "assistant"; content: string }[],
  ): Promise<{ answer: string; remaining?: number } | null>;
  upload(file: File, family: string): Promise<string>;
  download(path: string): Promise<Blob>;
  deleteFile(path: string): Promise<void>;
}
