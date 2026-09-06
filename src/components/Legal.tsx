import { ArrowLeft, Scale } from "lucide-react";
import { legalDocs, termsVersion } from "../legal";
export function Legal({ slug, back }: { slug: string; back: string }) {
  const doc = legalDocs.find((d) => d.slug === slug) ?? legalDocs[0];
  return (
    <div className="legal">
      <a href={back} className="back-link">
        <ArrowLeft size={17} /> Retour
      </a>
      <header className="page-title">
        <div>
          <span className="eyebrow">
            Mentions légales · version du {doc.updated}
          </span>
          <h1>{doc.title}</h1>
          <p>{doc.summary}</p>
        </div>
      </header>
      <nav className="legal-nav" aria-label="Documents légaux">
        {legalDocs.map((d) => (
          <a
            key={d.slug}
            href={"#legal/" + d.slug}
            className={d.slug === doc.slug ? "active" : ""}
          >
            {d.title}
          </a>
        ))}
      </nav>
      <article className="legal-body">
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((p, i) => (
              <p key={i} className={p.includes("[À COMPLÉTER") ? "todo" : ""}>
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="small muted legal-note">
          <Scale size={14} /> Projet de document préparé pour ParentEd (Québec)
          le {termsVersion}. Les passages « À COMPLÉTER » doivent être
          renseignés et l’ensemble revu par un juriste avant la mise en service
          publique.
        </p>
      </article>
    </div>
  );
}
