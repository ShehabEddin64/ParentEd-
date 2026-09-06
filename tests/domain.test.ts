import { describe, it, expect } from "vitest";
import {
  completion,
  weekDates,
  required,
  validateFile,
  safeUrl,
  occurrences,
  icsFor,
  isWeekend,
  shiftMonth,
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

describe("Rencontres récurrentes et rappels", () => {
  it("développe les occurrences hebdomadaires jusqu’à la date de fin, sans dépasser la fenêtre", () => {
    const weekly = seed.events.find((e) => e.recurrence === "weekly")!;
    const all = occurrences([weekly], "2026-09-07", "2026-09-30");
    expect(all.map((o) => o.date)).toEqual([
      "2026-09-08",
      "2026-09-15",
      "2026-09-22",
      "2026-09-29",
    ]);
    expect(occurrences([weekly], "2026-12-01", "2026-12-31")).toHaveLength(0);
    const once = seed.events.find((e) => e.recurrence === "none")!;
    expect(occurrences([once], "2026-09-01", "2026-12-31")).toHaveLength(1);
    expect(occurrences([once], "2026-10-01", "2026-12-31")).toHaveLength(0);
    expect(isWeekend("2026-09-19")).toBe(true);
    expect(isWeekend("2026-09-15")).toBe(false);
    expect(shiftMonth("2026-01-31", 1)).toBe("2026-02-28");
  });
  it("produit un fichier iCalendar avec règle de récurrence et alarme", () => {
    const weekly = seed.events.find((e) => e.recurrence === "weekly")!;
    const ics = icsFor(weekly, "2026-09-15");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;TZID=America/Toronto:20260915T143000");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;UNTIL=20261124T235959");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).not.toContain("undefined");
  });
});
describe("Tutorat, groupes et portfolio en démonstration", () => {
  it("laisse la famille demander une séance, la tutrice la confirmer et rédiger un compte rendu lisible par la famille seule", async () => {
    const storage = new MemoryStorage();
    const api = new DemoGateway(storage);
    await api.login("amelie@demo.parented.test");
    const booking = {
      id: crypto.randomUUID(),
      tutor_id: ids.tutorNadia,
      family_id: ids.family,
      user_id: ids.parent,
      child: "Adam",
      subject: "Sciences",
      date: "2026-09-10",
      time: "09:00",
      weekly: false,
      status: "demandée" as const,
      note: "",
      created_at: new Date().toISOString(),
    };
    await api.save("bookings", booking);
    await expect(
      api.save("bookings", {
        ...booking,
        id: crypto.randomUUID(),
        status: "confirmée",
      }),
    ).rejects.toThrow("Accès refusé");
    await api.logout();
    await api.login("nadia@demo.parented.test");
    expect((await api.load()).bookings.map((b) => b.id)).toContain(booking.id);
    await api.save("bookings", { ...booking, status: "confirmée" });
    const report = {
      id: crypto.randomUUID(),
      booking_id: booking.id,
      tutor_id: ids.tutorNadia,
      body: "Observation fictive.",
      created_at: new Date().toISOString(),
    };
    await api.save("tutor_reports", report);
    await api.logout();
    await api.login("sami@demo.parented.test");
    const sami = await api.load();
    expect(sami.bookings).toHaveLength(0);
    expect(sami.tutor_reports).toHaveLength(0);
    await expect(
      api.save("tutor_reports", { ...report, id: crypto.randomUUID() }),
    ).rejects.toThrow();
    await api.logout();
    await api.login("amelie@demo.parented.test");
    const amelie = await api.load();
    expect(amelie.bookings.find((b) => b.id === booking.id)?.status).toBe(
      "confirmée",
    );
    expect(amelie.tutor_reports.map((r) => r.id)).toContain(report.id);
  });
  it("garde les enfants, notes et propositions de rencontre dans leur périmètre", async () => {
    const api = new DemoGateway(new MemoryStorage());
    await api.login("sami@demo.parented.test");
    expect((await api.load()).children.map((c) => c.name)).toEqual(["Yanis"]);
    await expect(
      api.save("notes", { ...seed.notes[0], id: crypto.randomUUID() }),
    ).rejects.toThrow("Accès refusé");
    const draft = {
      ...seed.events[0],
      id: crypto.randomUUID(),
      published: false,
      featured: false,
      created_by: ids.other,
    };
    await api.save("events", draft);
    await expect(
      api.save("events", { ...draft, published: true }),
    ).rejects.toThrow("Accès refusé");
    await api.logout();
    await api.login("amelie@demo.parented.test");
    expect((await api.load()).events.map((e) => e.id)).not.toContain(draft.id);
    await api.logout();
    await api.login("admin@demo.parented.test");
    expect((await api.load()).events.map((e) => e.id)).toContain(draft.id);
    await api.save("events", { ...draft, published: true });
    await api.logout();
    await api.login("amelie@demo.parented.test");
    expect((await api.load()).events.map((e) => e.id)).toContain(draft.id);
  });
});
describe("Communauté en démonstration : messages, notifications, profil", () => {
  it("échange des messages privés, notifie et marque comme lu; l’annuaire ne contient pas family_id", async () => {
    const storage = new MemoryStorage();
    const api = new DemoGateway(storage);
    await api.login("sami@demo.parented.test");
    await api.save("messages", {
      id: "m1",
      sender_id: ids.other,
      recipient_id: ids.parent,
      body: "Bonjour !",
      created_at: new Date().toISOString(),
      read_at: null,
    });
    await expect(
      api.save("messages", {
        id: "m2",
        sender_id: ids.parent,
        recipient_id: ids.other,
        body: "Usurpé",
        created_at: "",
        read_at: null,
      }),
    ).rejects.toThrow("Accès refusé");
    await api.logout();
    await api.login("amelie@demo.parented.test");
    const mine = await api.load();
    expect(mine.messages.map((m) => m.id)).toContain("m1");
    expect(
      mine.notifications.filter((n) => n.kind === "message" && !n.read_at)
        .length,
    ).toBeGreaterThanOrEqual(1);
    expect(mine.members.length).toBeGreaterThanOrEqual(4);
    expect(Object.keys(mine.members[0])).not.toContain("family_id");
    await api.patch("messages", "m1", { read_at: new Date().toISOString() });
    await api.patch("profiles", ids.parent, {
      city: "Laval",
      lat: 45.6,
      lng: -73.7,
    });
    await expect(
      api.patch("profiles", ids.parent, { role: "admin" } as never),
    ).rejects.toThrow("Accès refusé");
    await expect(
      api.patch("profiles", ids.other, { city: "X" }),
    ).rejects.toThrow("Accès refusé");
    await api.logout();
    await api.login("admin@demo.parented.test");
    expect((await api.load()).messages).toHaveLength(0);
    expect(
      (await api.load()).members.find((m) => m.id === ids.parent)?.city,
    ).toBe("Laval");
  });
  it("aime une discussion une seule fois, notifie l’auteur et refuse l’auto-épinglage", async () => {
    const api = new DemoGateway(new MemoryStorage());
    await api.login("amelie@demo.parented.test");
    const post = seed.posts.find((p) => p.user_id === ids.other)!;
    await api.save("post_likes", {
      id: "l1",
      post_id: post.id,
      user_id: ids.parent,
    });
    await api.save("post_likes", {
      id: "l2",
      post_id: post.id,
      user_id: ids.parent,
    });
    expect(
      (await api.load()).post_likes.filter(
        (l) => l.user_id === ids.parent && l.post_id === post.id,
      ),
    ).toHaveLength(1);
    await expect(api.patch("posts", post.id, { pinned: true })).rejects.toThrow(
      "Accès refusé",
    );
    await api.logout();
    await api.login("sami@demo.parented.test");
    expect(
      (await api.load()).notifications.some((n) => n.kind === "like"),
    ).toBe(true);
    await api.patch("posts", post.id, { body: "Modifié" });
    await expect(api.patch("posts", post.id, { pinned: true })).rejects.toThrow(
      "Accès refusé",
    );
  });
});
