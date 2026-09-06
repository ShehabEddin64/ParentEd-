import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
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
  await db.exec(
    readFileSync("supabase/migrations/202609060001_parented.sql", "utf8"),
  );
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
