import { describe, it, expect } from "vitest";
import {
  completion,
  weekDates,
  required,
  validateFile,
  safeUrl,
} from "../src/domain";
import { seed, ids } from "../src/data/seed";
import { DemoGateway } from "../src/data/demo";
class MemoryStorage implements Storage {
  data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}
describe("Parcours familial de démonstration", () => {
  it("persiste la progression après reconnexion et la sépare entre parents", async () => {
    const storage = new MemoryStorage();
    const a = new DemoGateway(storage);
    await a.login("amelie@demo.parented.test");
    const row = {
      id: crypto.randomUUID(),
      user_id: ids.parent,
      lesson_id: seed.lessons[0].id,
      completed_at: new Date().toISOString(),
    };
    await a.save("progress", row);
    await a.logout();
    const b = new DemoGateway(storage);
    await b.login("amelie@demo.parented.test");
    expect((await b.load()).progress).toEqual([row]);
    await b.logout();
    await b.login("sami@demo.parented.test");
    expect((await b.load()).progress).toHaveLength(0);
    await expect(b.save("progress", row)).rejects.toThrow("Accès refusé");
  });
  it("refuse le déplacement et la modification d’une tâche d’une autre famille", async () => {
    const a = new DemoGateway(new MemoryStorage());
    await a.login("sami@demo.parented.test");
    expect((await a.load()).tasks).toHaveLength(0);
    await expect(
      a.save("tasks", { ...seed.tasks[0], family_id: ids.otherFamily }),
    ).rejects.toThrow();
    await expect(a.remove("tasks", seed.tasks[0].id)).rejects.toThrow();
  });
  it("garde les familles privées pour les administrateurs et refuse auto promotion", async () => {
    const a = new DemoGateway(new MemoryStorage());
    await a.login("amelie@demo.parented.test");
    await expect(
      a.save("profiles", { ...seed.profiles[0], role: "admin" }),
    ).rejects.toThrow();
    await expect(a.save("courses", seed.courses[0])).rejects.toThrow();
    await a.logout();
    await a.login("admin@demo.parented.test");
    expect((await a.load()).tasks).toHaveLength(0);
    await a.save("courses", { ...seed.courses[0], title: "Cours révisé" });
    expect((await a.load()).courses[0].title).toBe("Cours révisé");
  });
  it("ne confirme jamais une écriture lorsque le stockage est plein", async () => {
    const s = new MemoryStorage();
    const a = new DemoGateway(s);
    await a.login("amelie@demo.parented.test");
    s.setItem = () => {
      throw Error("quota");
    };
    await expect(a.save("tasks", seed.tasks[0])).rejects.toThrow(
      "Rien n’a été enregistré",
    );
  });
});
it("calcule les semaines locales et la progression sans doubles comptes", () => {
  expect(weekDates("2026-09-06")).toEqual([
    "2026-08-31",
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
    "2026-09-05",
    "2026-09-06",
  ]);
  expect(completion([], [])).toBe(0);
  expect(
    completion(seed.lessons.slice(0, 3), [
      {
        id: "1",
        user_id: ids.parent,
        lesson_id: seed.lessons[0].id,
        completed_at: "",
      },
    ]),
  ).toBe(33);
});
it("valide textes, liens et fichiers", () => {
  expect(() => required("  ")).toThrow();
  expect(safeUrl("javascript:alert(1)")).toBe(false);
  expect(() => validateFile({ size: 10, type: "text/html" })).toThrow();
  expect(() =>
    validateFile({ size: 6 * 1024 * 1024, type: "application/pdf" }),
  ).toThrow();
});

it("télécharge un fichier local sans appel réseau et refuse une autre famille", async () => {
  const storage = new MemoryStorage();
  const api = new DemoGateway(storage);
  await api.login("amelie@demo.parented.test");
  storage.setItem(
    "parented-file:" + ids.family + "/test",
    "data:application/pdf;base64,JVBERi0xLjQ=",
  );
  expect(await (await api.download(ids.family + "/test")).text()).toBe(
    "%PDF-1.4",
  );
  await api.logout();
  await api.login("sami@demo.parented.test");
  await expect(api.download(ids.family + "/test")).rejects.toThrow(
    "Accès refusé",
  );
});
