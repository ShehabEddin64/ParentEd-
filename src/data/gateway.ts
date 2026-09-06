import type { Data, Profile, Table, Tables } from "../domain";
export interface Gateway {
  mode: "demo" | "supabase";
  session(): Promise<Profile | null>;
  login(email: string, password: string): Promise<Profile>;
  logout(): Promise<void>;
  load(): Promise<Data>;
  save<K extends Table>(table: K, row: Tables[K]): Promise<void>;
  remove(table: Table, id: string): Promise<void>;
  upload(file: File, family: string): Promise<string>;
  download(path: string): Promise<Blob>;
  deleteFile(path: string): Promise<void>;
}
