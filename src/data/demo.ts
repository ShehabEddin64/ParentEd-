import { seed, ids } from "./seed";
import {
  tableNames,
  validateFile,
  type Data,
  type Table,
  type Tables,
  type Profile,
} from "../domain";
import type { Gateway } from "./gateway";
const key = "parented-demo-v1";
const sessionKey = "parented-demo-session";
export class DemoGateway implements Gateway {
  mode = "demo" as const;
  constructor(private storage: Storage = localStorage) {}
  private read(): Data {
    const raw = this.storage.getItem(key);
    if (!raw) return structuredClone(seed);
    try {
      const data = JSON.parse(raw);
      if (!tableNames.every((t) => Array.isArray(data[t]))) throw Error();
      return data;
    } catch {
      throw new Error(
        "La sauvegarde de démonstration est illisible. Effacez les données de ce site pour la réinitialiser.",
      );
    }
  }
  private write(data: Data) {
    try {
      this.storage.setItem(key, JSON.stringify(data));
    } catch {
      throw new Error(
        "Le stockage de ce navigateur est plein ou indisponible. Rien n’a été enregistré.",
      );
    }
  }
  async session() {
    return (
      this.read().profiles.find(
        (p) => p.id === this.storage.getItem(sessionKey),
      ) ?? null
    );
  }
  async login(email: string) {
    const id =
      email === "admin@demo.parented.test"
        ? ids.admin
        : email === "sami@demo.parented.test"
          ? ids.other
          : email === "amelie@demo.parented.test"
            ? ids.parent
            : null;
    const p = this.read().profiles.find((p) => p.id === id);
    if (!p) throw new Error("Choisissez un des profils fictifs proposés.");
    this.storage.setItem(sessionKey, p.id);
    return p;
  }
  async logout() {
    this.storage.removeItem(sessionKey);
  }
  private async profile() {
    const p = await this.session();
    if (!p) throw new Error("Reconnectez-vous pour continuer.");
    return p;
  }
  private visible(t: Table, row: Tables[Table], p: Profile) {
    if (t === "profiles") return row.id === p.id;
    if ("family_id" in row) return row.family_id === p.family_id;
    if (["progress", "registrations"].includes(t))
      return "user_id" in row && row.user_id === p.id;
    if (t === "reports")
      return "user_id" in row && (row.user_id === p.id || p.role === "admin");
    if ("published" in row) return row.published || p.role === "admin";
    if (t === "lessons" && "course_id" in row)
      return this.read().courses.some(
        (c) => c.id === row.course_id && (c.published || p.role === "admin"),
      );
    return true;
  }
  async load() {
    const p = await this.profile();
    const data = this.read();
    return Object.fromEntries(
      tableNames.map((t) => [
        t,
        data[t].filter((row) => this.visible(t, row, p)),
      ]),
    ) as Data;
  }
  private permitted(
    t: Table,
    row: Tables[Table],
    p: Profile,
    operation: "save" | "delete",
  ) {
    if (t === "profiles") return false;
    if (["courses", "lessons", "events", "resources"].includes(t))
      return p.role === "admin";
    if ("family_id" in row) return row.family_id === p.family_id;
    if ("user_id" in row)
      return (
        row.user_id === p.id ||
        (operation === "delete" &&
          p.role === "admin" &&
          ["posts", "replies", "reports"].includes(t))
      );
    return false;
  }
  async save<K extends Table>(t: K, row: Tables[K]) {
    const p = await this.profile();
    const data = this.read();
    const old = data[t].find((r) => r.id === row.id);
    if (
      !this.permitted(t, row, p, "save") ||
      (old && !this.permitted(t, old, p, "save"))
    )
      throw new Error("Accès refusé.");
    if (["progress", "registrations", "reports"].includes(t)) {
      const field =
        t === "progress"
          ? "lesson_id"
          : t === "registrations"
            ? "event_id"
            : "post_id";
      const r = row as unknown as Record<string, string>;
      if (
        data[t].some((x) => {
          const a = x as unknown as Record<string, string>;
          return (
            a.id !== r.id && a.user_id === r.user_id && a[field] === r[field]
          );
        })
      )
        return;
    }
    const rows = data[t] as Tables[K][];
    const i = rows.findIndex((r) => r.id === row.id);
    if (i < 0) rows.push(row);
    else rows[i] = row;
    this.write(data);
  }
  async remove(t: Table, id: string) {
    const p = await this.profile();
    const d = this.read();
    const row = d[t].find((r) => r.id === id);
    if (!row || !this.permitted(t, row, p, "delete"))
      throw new Error("Accès refusé.");
    (d[t] as Tables[Table][]) = d[t].filter((r) => r.id !== id);
    if (t === "posts") {
      d.replies = d.replies.filter((r) => r.post_id !== id);
      d.reports = d.reports.filter((r) => r.post_id !== id);
    }
    this.write(d);
  }
  async upload(file: File, family: string) {
    validateFile(file);
    const p = await this.profile();
    if (p.family_id !== family) throw new Error("Accès refusé.");
    if (file.size > 1024 * 1024)
      throw new Error(
        "En démonstration, choisissez un fichier de 1 Mo maximum.",
      );
    const path = family + "/" + crypto.randomUUID();
    const content = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("Lecture du fichier impossible."));
      r.readAsDataURL(file);
    });
    try {
      this.storage.setItem("parented-file:" + path, content);
    } catch {
      throw new Error("Espace local insuffisant pour ce fichier.");
    }
    return path;
  }
  async download(path: string) {
    const p = await this.profile();
    if (!path.startsWith(p.family_id + "/")) throw new Error("Accès refusé.");
    const v = this.storage.getItem("parented-file:" + path);
    if (!v) throw new Error("Fichier introuvable.");
    const [header, encoded] = v.split(",");
    if (!encoded || !header.includes(";base64"))
      throw new Error("Fichier local illisible.");
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    return new Blob([bytes], { type: header.slice(5).split(";")[0] });
  }
  async deleteFile(path: string) {
    const p = await this.profile();
    if (!path.startsWith(p.family_id + "/")) throw new Error("Accès refusé.");
    this.storage.removeItem("parented-file:" + path);
  }
}
