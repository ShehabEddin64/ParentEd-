# ParentEd — Muslim Hacks Montréal hackathon archive

This is the owner's hackathon project, now maintained as a local-only portfolio demo.
The explicit October 2026 decision supersedes earlier plans for a commercial service.

- Keep React/TypeScript/Vite and the supplied parentEd brand.
- All profiles, bookings, messages, exams and events are fictional demo data.
- No API keys, cloud accounts, remote authentication, paid AI, email delivery, payments or deployment automation. Do not reintroduce these without an explicit request.
- The app must work with `npm ci && npm run dev`, without environment variables.
- No automatic external requests. Maps are schematic; weather is a labelled fixture. Official resource links may open external sites when the user clicks them.
- localStorage is not a security boundary. Do not describe it as private production storage.
- Keep SQL migrations as architectural history for local PGlite tests, not deployment instructions.
- Keep secrets, environment files, generated builds and video renders out of Git.
- Run `npm test`, `npm run build`, and `npm run check:safety` after relevant changes.
- Keep README.md, docs/progress.md and SECURITY.md honest about tested behavior and external services that have not been shut down.
- Do not rewrite published history or delete hosted data without explicit authorization.
