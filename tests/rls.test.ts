import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
let db: PGlite;
const a = "10000000-0000-4000-8000-000000000001",
  b = "10000000-0000-4000-8000-000000000002",
  admin = "10000000-0000-4000-8000-000000000003";
let fa: string, fb: string;
const lesson = "40000000-0000-4000-8000-000000000001";
async function actor(id: string | null) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
    id || "",
  ]);
  await db.exec(`set role ${id ? "authenticated" : "anon"}`);
}
async function rows(sql: string) {
  return (await db.query(sql)).rows as Record<string, unknown>[];
}
beforeAll(async () => {
  db = new PGlite();
  // PostgreSQL execution of the real migration. Supabase Auth/Storage plumbing is represented minimally.
  await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb not null default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth,storage to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant select,insert,update,delete on storage.objects to authenticated;
 create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name,'/') $$;`);
  for (const file of readdirSync("supabase/migrations").sort())
    await db.exec(readFileSync("supabase/migrations/" + file, "utf8"));
  await db.exec(readFileSync("supabase/seed.sql", "utf8"));
  await db.query(
    `insert into auth.users values ($1,'{"display_name":"Amélie","role":"admin","family_id":"forged"}'),($2,'{"display_name":"Sami"}'),($3,'{"display_name":"Camille"}')`,
    [a, b, admin],
  );
  await db.query("update profiles set role='admin' where id=$1", [admin]);
  fa = String(
    (await rows(`select family_id from profiles where id='${a}'`))[0].family_id,
  );
  fb = String(
    (await rows(`select family_id from profiles where id='${b}'`))[0].family_id,
  );
  await db.query(
    "insert into tasks (family_id,title,child,date,time) values ($1,'Privé A','Lina','2026-09-08','09:00'),($2,'Privé B','Yanis','2026-09-08','10:00')",
    [fa, fb],
  );
  await db.query(
    "insert into storage.objects(bucket_id,name) values ('family-documents',$1),('family-documents',$2)",
    [fa + "/a.pdf", fb + "/b.pdf"],
  );
  await db.query(
    "insert into documents(family_id,title,path) values ($1,'Document A',$2),($3,'Document B',$4)",
    [fa, fa + "/a.pdf", fb, fb + "/b.pdf"],
  );
});
afterAll(async () => {
  await db.close();
});
describe.sequential("Migration PostgreSQL et règles RLS", () => {
  it("ignore role et famille fournis à l’inscription", async () => {
    await actor(a);
    expect((await rows("select * from profiles"))[0].role).toBe("parent");
    expect(fa).not.toBe(fb);
  });
  it("refuse une lecture anonyme", async () => {
    await actor(null);
    await expect(rows("select * from courses")).rejects.toThrow(
      /permission denied/,
    );
    await expect(rows("select * from tasks")).rejects.toThrow(
      /permission denied/,
    );
  });
  it("isole les tâches et documents de deux familles", async () => {
    await actor(a);
    expect((await rows("select title from tasks")).map((r) => r.title)).toEqual(
      ["Privé A"],
    );
    expect(
      (await rows("select title from documents")).map((r) => r.title),
    ).toEqual(["Document A"]);
    await actor(b);
    expect((await rows("select title from tasks")).map((r) => r.title)).toEqual(
      ["Privé B"],
    );
  });
  it("refuse création, modification et suppression inter-familles", async () => {
    await actor(a);
    await expect(
      db.query(
        "insert into tasks(family_id,title,child,date,time) values ($1,'Intrusion','X','2026-09-08','10:00')",
        [fb],
      ),
    ).rejects.toThrow(/row-level security/);
    expect(
      (await db.query("delete from tasks where family_id=$1 returning *", [fb]))
        .rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          "update tasks set title='Intrusion' where family_id=$1 returning *",
          [fb],
        )
      ).rows,
    ).toHaveLength(0);
    await expect(
      db.query("update tasks set family_id=$1 where family_id=$2", [fb, fa]),
    ).rejects.toThrow(/row-level security/);
  });
  it("interdit auto attribution admin et changement de famille", async () => {
    await actor(a);
    await expect(db.exec("update profiles set role='admin'")).rejects.toThrow(
      /permission denied/,
    );
    await expect(
      db.query("update profiles set family_id=$1", [fb]),
    ).rejects.toThrow(/permission denied/);
  });
  it("persiste une progression personnelle et empêche celle d’un autre parent", async () => {
    await actor(a);
    await db.query("insert into progress(lesson_id) values ($1)", [lesson]);
    await actor(b);
    expect(await rows("select * from progress")).toHaveLength(0);
    await expect(
      db.query("insert into progress(user_id,lesson_id) values ($1,$2)", [
        a,
        lesson,
      ]),
    ).rejects.toThrow(/row-level security/);
    await actor(a);
    expect(await rows("select * from progress")).toHaveLength(1);
    await expect(
      db.query("insert into progress(lesson_id) values ($1)", [lesson]),
    ).rejects.toThrow(/unique/);
  });
  it("réserve les contenus à l’administration et masque les brouillons", async () => {
    await actor(a);
    await expect(
      db.exec(
        "insert into courses(title,description,category) values ('X','X','X')",
      ),
    ).rejects.toThrow(/row-level security/);
    await actor(admin);
    await db.exec(
      "insert into courses(id,title,description,category,published) values ('30000000-0000-4000-8000-000000000099','Brouillon','X','X',false)",
    );
    expect(
      await rows("select * from courses where title='Brouillon'"),
    ).toHaveLength(1);
    expect(await rows("select * from tasks")).toHaveLength(0);
    expect(await rows("select * from documents")).toHaveLength(0);
    expect(await rows("select * from progress")).toHaveLength(0);
    await actor(a);
    expect(
      await rows("select * from courses where title='Brouillon'"),
    ).toHaveLength(0);
  });
  it("isole les fichiers privés, même des administrateurs", async () => {
    await actor(a);
    expect(
      (await rows("select name from storage.objects")).map((r) => r.name),
    ).toEqual([fa + "/a.pdf"]);
    await expect(
      db.query(
        "insert into storage.objects(bucket_id,name) values ('family-documents',$1)",
        [fb + "/attack.pdf"],
      ),
    ).rejects.toThrow(/row-level security/);
    expect(
      (
        await db.query(
          "delete from storage.objects where name=$1 returning *",
          [fb + "/b.pdf"],
        )
      ).rows,
    ).toHaveLength(0);
    await actor(admin);
    expect(await rows("select * from storage.objects")).toHaveLength(0);
  });
  it("empêche les faux chemins de documents", async () => {
    await actor(a);
    await expect(
      db.query("insert into documents(title,path) values ($1,$2)", [
        "wrong",
        fb + "/b.pdf",
      ]),
    ).rejects.toThrow();
  });
  it("permet dépôt et suppression dans sa propre famille", async () => {
    await actor(a);
    await db.query(
      "insert into storage.objects(bucket_id,name) values ('family-documents',$1)",
      [fa + "/new.pdf"],
    );
    expect(
      (
        await db.query(
          "delete from storage.objects where name=$1 returning *",
          [fa + "/new.pdf"],
        )
      ).rows,
    ).toHaveLength(1);
  });
  it("permet les échanges et dérive l’auteur du compte", async () => {
    await actor(a);
    await db.query(
      "insert into posts(id,user_id,author,title,body,category) values ('60000000-0000-4000-8000-000000000099',$1,'Faux auteur','Question','Bonjour','Entraide')",
      [admin],
    );
    await actor(b);
    const p = (await rows("select * from posts"))[0];
    expect(p.author).toBe("Amélie");
    expect(p.user_id).toBe(a);
    expect((await db.query("delete from posts returning *")).rows).toHaveLength(
      0,
    );
  });
  it("garde les inscriptions personnelles et permet leur annulation", async () => {
    const e = "70000000-0000-4000-8000-000000000001";
    await actor(a);
    await db.query("insert into registrations(event_id) values ($1)", [e]);
    await actor(b);
    expect(await rows("select * from registrations")).toHaveLength(0);
    await actor(a);
    expect(
      (await db.query("delete from registrations returning *")).rows,
    ).toHaveLength(1);
  });
  it("permet signalement et modération sans accès familial", async () => {
    await actor(b);
    await db.exec(
      "insert into reports(post_id,reason) values ('60000000-0000-4000-8000-000000000099','À examiner')",
    );
    await actor(a);
    expect(await rows("select * from reports")).toHaveLength(0);
    await actor(admin);
    expect(await rows("select * from reports")).toHaveLength(1);
    await db.exec(
      "delete from posts where id='60000000-0000-4000-8000-000000000099'",
    );
    expect(await rows("select * from reports")).toHaveLength(0);
  });
  it("restaure les données exportées dans une transaction PostgreSQL", async () => {
    await actor(a);
    const tasks = await rows("select * from tasks");
    await db.exec("begin");
    await db.exec("delete from tasks");
    for (const t of tasks)
      await db.query(
        "insert into tasks(id,family_id,title,child,date,time,done) values ($1,$2,$3,$4,$5,$6,$7)",
        [t.id, t.family_id, t.title, t.child, t.date, t.time, t.done],
      );
    expect(await rows("select * from tasks")).toEqual(tasks);
    await db.exec("rollback");
  });
});
describe.sequential("Migration V2 : tutorat, groupes, favoris, famille", () => {
  const tutorId = "90000000-0000-4000-8000-000000000001";
  const tutorAccount = "10000000-0000-4000-8000-000000000004";
  let booking: string;
  it("ne permet ni de se déclarer tuteur ni de modifier un profil de tuteur sans lien", async () => {
    await db.exec("reset role");
    await db.query(
      'insert into auth.users values ($1,\'{"display_name":"Nadia"}\')',
      [tutorAccount],
    );
    await actor(a);
    await expect(db.exec("update profiles set role='tutor'")).rejects.toThrow(
      /permission denied/,
    );
    expect(
      (
        await db.query(
          "update tutors set published=false where id=$1 returning *",
          [tutorId],
        )
      ).rows,
    ).toHaveLength(0);
    await db.exec("reset role");
    await db.query("update profiles set role='tutor' where id=$1", [
      tutorAccount,
    ]);
    await db.query("update tutors set profile_id=$1 where id=$2", [
      tutorAccount,
      tutorId,
    ]);
  });
  it("laisse une famille demander une séance et la tutrice la confirmer, sans fuite vers une autre famille", async () => {
    await actor(a);
    await expect(
      db.query(
        "insert into bookings(tutor_id,child,subject,date,time,status) values ($1,'Lina','Maths','2026-09-10','09:00','terminée')",
        [tutorId],
      ),
    ).rejects.toThrow(/row-level security/);
    await expect(
      db.query(
        "insert into bookings(tutor_id,child,subject,date,time) values ('90000000-0000-4000-8000-000000000003','Lina','Musique','2026-09-10','09:00')",
      ),
    ).rejects.toThrow(/row-level security|disponibilités/);
    booking = String(
      (
        await db.query(
          "insert into bookings(tutor_id,child,subject,date,time) values ($1,'Lina','Maths','2026-09-10','09:00') returning id",
          [tutorId],
        )
      ).rows[0].id,
    );
    await expect(
      db.query("update bookings set status='confirmée' where id=$1", [booking]),
    ).rejects.toThrow(/row-level security/);
    await actor(b);
    expect(await rows("select * from bookings")).toHaveLength(0);
    await actor(tutorAccount);
    expect(await rows("select * from bookings")).toHaveLength(1);
    expect(
      (
        await db.query(
          "update bookings set status='confirmée' where id=$1 returning *",
          [booking],
        )
      ).rows,
    ).toHaveLength(1);
    await db.query(
      "insert into tutor_reports(booking_id,tutor_id,body) values ($1,$2,'Observation')",
      [booking, tutorId],
    );
    await actor(a);
    expect(await rows("select * from tutor_reports")).toHaveLength(1);
    await expect(
      db.query(
        "insert into tutor_reports(booking_id,tutor_id,body) values ($1,$2,'Faux')",
        [booking, tutorId],
      ),
    ).rejects.toThrow(/row-level security/);
    await actor(b);
    expect(await rows("select * from tutor_reports")).toHaveLength(0);
    await actor(admin);
    expect(await rows("select * from bookings")).toHaveLength(1);
  });
  it("garde enfants, plan hebdomadaire, bibliothèque et notes dans la famille, même pour l’administration", async () => {
    await actor(a);
    await db.exec("insert into children(name) values ('Lina')");
    await db.exec(
      "insert into week_plans(week_start,intentions) values ('2026-09-07','Lire')",
    );
    await db.exec(
      "insert into library_items(title,kind) values ('Livre A','livre')",
    );
    await db.exec("insert into notes(title,body) values ('Trace A','Texte')");
    await expect(
      db.query("insert into children(family_id,name) values ($1,'Intrus')", [
        fb,
      ]),
    ).rejects.toThrow(/row-level security/);
    await expect(
      db.exec(
        "insert into library_items(title,kind,url) values ('X','lien','http://insecure')",
      ),
    ).rejects.toThrow();
    await actor(b);
    expect(await rows("select * from children")).toHaveLength(0);
    expect(await rows("select * from notes")).toHaveLength(0);
    await actor(admin);
    expect(await rows("select * from children")).toHaveLength(0);
    expect(await rows("select * from week_plans")).toHaveLength(0);
    expect(await rows("select * from library_items")).toHaveLength(0);
  });
  it("gère favoris personnels, adhésion aux groupes et questions répondues par l’équipe", async () => {
    await actor(a);
    await db.exec(
      "insert into favorites(resource_id) values ('80000000-0000-4000-8000-000000000001')",
    );
    await expect(
      db.exec(
        "insert into favorites(resource_id) values ('80000000-0000-4000-8000-000000000001')",
      ),
    ).rejects.toThrow(/unique/);
    await db.exec(
      "insert into group_members(group_id) values ('a0000000-0000-4000-8000-000000000001')",
    );
    await expect(
      db.exec("insert into groups(name) values ('Pirate')"),
    ).rejects.toThrow(/row-level security/);
    await db.exec(
      "insert into lesson_questions(lesson_id,body) values ('40000000-0000-4000-8000-000000000001','Question ?')",
    );
    expect(
      (await db.query("update lesson_questions set answer='Faux' returning *"))
        .rows,
    ).toHaveLength(0);
    await expect(
      db.exec(
        "insert into lesson_questions(lesson_id,body,answer) values ('40000000-0000-4000-8000-000000000001','Q','Auto-réponse')",
      ),
    ).rejects.toThrow(/row-level security/);
    await actor(b);
    expect(await rows("select * from favorites")).toHaveLength(0);
    expect((await rows("select * from lesson_questions"))[0].author).toBe(
      "Amélie",
    );
    await actor(admin);
    expect(
      (
        await db.query(
          "update lesson_questions set answer='Réponse', answered_at=now() returning *",
        )
      ).rows,
    ).toHaveLength(1);
  });
  it("laisse un membre proposer une rencontre non publiée, visible de lui et de l’équipe seulement", async () => {
    await actor(b);
    await expect(
      db.exec(
        "insert into events(title,description,date,time,location,organizer,age,published) values ('Pirate','x','2026-10-01','10:00','Parc','Sami — membre','Tous',true)",
      ),
    ).rejects.toThrow(/row-level security/);
    await db.exec(
      "insert into events(id,title,description,date,time,location,organizer,age) values ('70000000-0000-4000-8000-000000000099','Proposition','x','2026-10-01','10:00','Parc','Sami — membre','Tous')",
    );
    expect(
      await rows("select * from events where title='Proposition'"),
    ).toHaveLength(1);
    await expect(
      db.exec("update events set published=true where title='Proposition'"),
    ).rejects.toThrow(/row-level security/);
    await actor(a);
    expect(
      await rows("select * from events where title='Proposition'"),
    ).toHaveLength(0);
    await expect(
      db.exec(
        "insert into registrations(event_id) values ('70000000-0000-4000-8000-000000000099')",
      ),
    ).rejects.toThrow(/row-level security/);
    await actor(admin);
    expect(
      (
        await db.query(
          "update events set published=true where title='Proposition' returning *",
        )
      ).rows,
    ).toHaveLength(1);
    await actor(a);
    expect(
      await rows("select * from events where title='Proposition'"),
    ).toHaveLength(1);
  });
});
describe.sequential(
  "Migration V3 : profils, annuaire, messages, notifications, avis",
  () => {
    it("laisse chacun modifier son profil public, jamais son rôle ni sa famille", async () => {
      await actor(a);
      expect(
        (
          await db.query(
            "update profiles set city='Montréal', lat=45.5, lng=-73.5, bio='Bonjour', interests=array['Lecture'], show_on_map=true where id=$1 returning city",
            [a],
          )
        ).rows,
      ).toHaveLength(1);
      await expect(
        db.query("update profiles set role='admin' where id=$1", [a]),
      ).rejects.toThrow(/permission denied/);
      await expect(
        db.query("update profiles set family_id=$1 where id=$2", [fb, a]),
      ).rejects.toThrow(/permission denied/);
      expect(
        (
          await db.query(
            "update profiles set city='Intrus' where id=$1 returning *",
            [b],
          )
        ).rows,
      ).toHaveLength(0);
    });
    it("expose l’annuaire sans family_id et à tous les membres", async () => {
      await actor(b);
      const members = await rows("select * from members order by display_name");
      expect(members.length).toBeGreaterThanOrEqual(3);
      expect(Object.keys(members[0])).not.toContain("family_id");
      expect(members.find((m) => m.id === a)?.city).toBe("Montréal");
      expect(await rows("select * from profiles")).toHaveLength(1);
    });
    it("réserve les messages aux deux personnes et notifie le destinataire", async () => {
      await actor(a);
      await expect(
        db.query(
          "insert into messages(recipient_id,body) values ($1,'à moi-même')",
          [a],
        ),
      ).rejects.toThrow();
      await db.query(
        "insert into messages(recipient_id,body) values ($1,'Bonjour Sami')",
        [b],
      );
      await actor(admin);
      expect(await rows("select * from messages")).toHaveLength(0);
      await actor(b);
      const inbox = await rows("select * from messages");
      expect(inbox).toHaveLength(1);
      expect(
        (await db.query("update messages set read_at=now() returning *")).rows,
      ).toHaveLength(1);
      const notes = await rows(
        "select * from notifications where kind='message'",
      );
      expect(notes).toHaveLength(1);
      expect(String(notes[0].title)).toContain("Amélie");
      await actor(a);
      expect(
        await rows("select * from notifications where kind='message'"),
      ).toHaveLength(0);
      await expect(
        db.exec(
          "insert into notifications(user_id,kind,title) values ('" +
            a +
            "','x','forgé')",
        ),
      ).rejects.toThrow(/permission denied|row-level security/);
    });
    it("notifie l’auteur d’une discussion, permet les j’aime uniques et interdit l’auto-épinglage", async () => {
      await actor(a);
      await db.exec(
        "insert into posts(id,title,body,category) values ('60000000-0000-4000-8000-000000000098','Sortie','Qui vient ?','Rencontres et sorties')",
      );
      await actor(b);
      await db.exec(
        "insert into replies(post_id,body) values ('60000000-0000-4000-8000-000000000098','Moi !')",
      );
      await db.exec(
        "insert into post_likes(post_id) values ('60000000-0000-4000-8000-000000000098')",
      );
      await expect(
        db.exec(
          "insert into post_likes(post_id) values ('60000000-0000-4000-8000-000000000098')",
        ),
      ).rejects.toThrow(/unique/);
      expect(
        (
          await db.query(
            "update posts set pinned=true where id='60000000-0000-4000-8000-000000000098' returning *",
          )
        ).rows,
      ).toHaveLength(0);
      await actor(a);
      const notes = await rows(
        "select kind from notifications order by created_at",
      );
      expect(notes.map((n) => n.kind)).toEqual(
        expect.arrayContaining(["reply", "like"]),
      );
      expect(
        (
          await db.query(
            "update posts set body='Qui vient samedi ?' where id='60000000-0000-4000-8000-000000000098' returning *",
          )
        ).rows,
      ).toHaveLength(1);
      await expect(
        db.exec(
          "update posts set pinned=true where id='60000000-0000-4000-8000-000000000098'",
        ),
      ).rejects.toThrow(/row-level security/);
      await actor(admin);
      expect(
        (
          await db.query(
            "update posts set pinned=true where id='60000000-0000-4000-8000-000000000098' returning *",
          )
        ).rows,
      ).toHaveLength(1);
    });
    it("n’accepte un avis qu’après une séance terminée et compte les inscrits", async () => {
      const tutorId = "90000000-0000-4000-8000-000000000001";
      await actor(a);
      const booking = String(
        (
          await db.query(
            "insert into bookings(tutor_id,child,subject,date,time) values ($1,'Lina','Maths','2026-09-24','09:00') returning id",
            [tutorId],
          )
        ).rows[0].id,
      );
      await expect(
        db.query(
          "insert into tutor_reviews(tutor_id,booking_id,rating,body) values ($1,$2,5,'Top')",
          [tutorId, booking],
        ),
      ).rejects.toThrow(/row-level security/);
      await actor("10000000-0000-4000-8000-000000000004");
      await db.query("update bookings set status='terminée' where id=$1", [
        booking,
      ]);
      await actor(a);
      await db.query(
        "insert into tutor_reviews(tutor_id,booking_id,rating,body) values ($1,$2,5,'Top')",
        [tutorId, booking],
      );
      await actor(b);
      const review = (await rows("select * from tutor_reviews"))[0];
      expect(review.author).toBe("Amélie");
      await db.exec(
        "insert into registrations(event_id) values ('70000000-0000-4000-8000-000000000001')",
      );
      await actor(admin);
      expect(await rows("select * from registrations")).toHaveLength(0);
      expect(
        (
          await rows(
            "select * from event_counts where event_id='70000000-0000-4000-8000-000000000001'",
          )
        )[0].count,
      ).toBe(1);
    });
  },
);

describe.sequential(
  "Migration V4 : créneaux réels, examens, programme et notes",
  () => {
    const tutorId = "90000000-0000-4000-8000-000000000001";
    it("confirme une réservation sur un créneau libre et refuse hors disponibilité ou déjà pris", async () => {
      await actor(b);
      await expect(
        db.query(
          "insert into bookings(tutor_id,child,subject,date,time,status) values ($1,'Yanis','Maths','2026-10-05','13:00','confirmée')",
          [tutorId],
        ),
      ).rejects.toThrow(/disponibilités/);
      await db.query(
        "insert into bookings(tutor_id,child,subject,date,time,status) values ($1,'Yanis','Maths','2026-10-06','13:00','confirmée')",
        [tutorId],
      );
      await actor(a);
      await expect(
        db.query(
          "insert into bookings(tutor_id,child,subject,date,time,status) values ($1,'Lina','Maths','2026-10-06','13:00','confirmée')",
          [tutorId],
        ),
      ).rejects.toThrow(/réservé/);
      await db.query(
        "insert into bookings(tutor_id,child,subject,date,time,status,weekly) values ($1,'Lina','Maths','2026-10-06','14:00','confirmée',true)",
        [tutorId],
      );
      await actor(b);
      await expect(
        db.query(
          "insert into bookings(tutor_id,child,subject,date,time,status) values ($1,'Yanis','Maths','2026-10-20','14:00','confirmée')",
          [tutorId],
        ),
      ).rejects.toThrow(/réservé/);
    });
    it("publie les examens d’entraînement et garde tentatives, programme et notes dans la famille", async () => {
      await actor(admin);
      await db.exec(
        "insert into exams(id,title,subject,published) values ('c0000000-0000-4000-8000-000000000099','Brouillon','Maths',false)",
      );
      await actor(a);
      expect(
        await rows("select * from exams where title='Brouillon'"),
      ).toHaveLength(0);
      expect((await rows("select * from exams")).length).toBeGreaterThanOrEqual(
        3,
      );
      expect(
        (await rows("select * from exam_questions")).length,
      ).toBeGreaterThanOrEqual(10);
      await expect(
        db.exec("insert into exams(title,subject) values ('Pirate','X')"),
      ).rejects.toThrow(/row-level security/);
      await db.exec(
        "insert into exam_attempts(exam_id,child,score,total,answers) values ('c0000000-0000-4000-8000-000000000001','Lina',5,6,'{1,2,1,1,0,0}')",
      );
      const cid = String(
        (
          await rows(
            "insert into curricula(child,title) values ('Lina','Programme') returning id",
          )
        )[0].id,
      );
      await db.query(
        "insert into curriculum_items(curriculum_id,subject,title,planned_date) values ($1,'Maths','Fractions','2026-09-08')",
        [cid],
      );
      await db.exec(
        "insert into grades(child,subject,title,score,max) values ('Lina','Maths','Quiz',8,10)",
      );
      await expect(
        db.exec(
          "insert into grades(child,subject,title,score,max) values ('Lina','Maths','Faux',12,10)",
        ),
      ).rejects.toThrow();
      await actor(b);
      expect(await rows("select * from exam_attempts")).toHaveLength(0);
      expect(await rows("select * from curriculum_items")).toHaveLength(0);
      expect(await rows("select * from grades")).toHaveLength(0);
      await expect(
        db.query(
          "insert into curriculum_items(curriculum_id,subject,title) values ($1,'Maths','Intrus')",
          [cid],
        ),
      ).rejects.toThrow(/row-level security/);
      await actor(admin);
      expect(await rows("select * from grades")).toHaveLength(0);
    });
  },
);
describe.sequential(
  "Migration V5 : pondération et import de calendrier",
  () => {
    it("accepte une pondération valide, refuse une pondération nulle, et conserve la source d’import", async () => {
      await actor(a);
      await db.exec(
        "insert into grades(child,subject,title,score,max,weight) values ('Lina','Maths','Projet',9,10,2)",
      );
      await expect(
        db.exec(
          "insert into grades(child,subject,title,score,max,weight) values ('Lina','Maths','Faux',9,10,0)",
        ),
      ).rejects.toThrow();
      await db.exec(
        "insert into tasks(title,child,date,time,source) values ('Cours de piano','Lina','2026-09-16','16:00','abc@google.com@2026-09-16')",
      );
      expect(
        (await rows("select weight from grades where title='Projet'"))[0]
          .weight,
      ).toBe("2");
      await actor(b);
      expect(await rows("select * from tasks where source<>''")).toHaveLength(
        0,
      );
    });
  },
);
describe.sequential("Migration V6 : quotas de l’assistant", () => {
  it("réserve une question par appel, refuse au-delà du quota et n’expose l’usage qu’au membre et à l’équipe", async () => {
    await actor(a);
    const first = (await rows("select public.assistant_allow(2, 100) as r"))[0]
      .r as { allowed: boolean; used: number };
    expect(first).toMatchObject({ allowed: true, used: 1 });
    await db.exec("select public.assistant_record(120, 40)");
    expect(
      (await rows("select public.assistant_allow(2, 100) as r"))[0].r,
    ).toMatchObject({ allowed: true, used: 2 });
    expect(
      (await rows("select public.assistant_allow(2, 100) as r"))[0].r,
    ).toMatchObject({ allowed: false, reason: "user" });
    await actor(b);
    expect(
      (await rows("select public.assistant_allow(5, 2) as r"))[0].r,
    ).toMatchObject({ allowed: false, reason: "global" });
    expect(await rows("select * from assistant_usage")).toHaveLength(1);
    await expect(
      db.exec("insert into assistant_usage(user_id) values ('" + b + "')"),
    ).rejects.toThrow(/permission denied/);
    await actor(admin);
    const all = await rows(
      "select * from assistant_usage order by questions desc",
    );
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all[0].input_tokens).toBe(120);
  });
});
describe.sequential(
  "Migration V7 : cadence et interrupteur de l’assistant",
  () => {
    it("impose un délai entre deux questions et laisse l’équipe couper l’assistant", async () => {
      await actor(b);
      const first = (
        await rows("select public.assistant_allow(10, 100) as r")
      )[0].r as { allowed: boolean; reason?: string };
      expect(first.allowed || first.reason === "pace").toBe(true);
      const second = (
        await rows("select public.assistant_allow(10, 100) as r")
      )[0].r as { allowed: boolean; reason?: string };
      expect(second).toMatchObject({ allowed: false, reason: "pace" });
      await expect(
        db.exec(
          "update app_settings set value='false' where key='assistant_enabled'",
        ),
      ).resolves.toBeDefined();
      expect(
        await rows("select * from app_settings where value='false'"),
      ).toHaveLength(0);
      await actor(admin);
      await db.exec(
        "update app_settings set value='false' where key='assistant_enabled'",
      );
      await actor(a);
      expect(
        (await rows("select public.assistant_allow(10, 100) as r"))[0].r,
      ).toMatchObject({ allowed: false, reason: "disabled" });
      await actor(admin);
      await db.exec(
        "update app_settings set value='true' where key='assistant_enabled'",
      );
    });
  },
);
