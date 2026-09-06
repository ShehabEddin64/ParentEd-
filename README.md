<p align="center">
  <img src="public/parented-logo.png" alt="ParentEd" width="220">
</p>

<h1 align="center">ParentEd</h1>

<p align="center"><strong>Homeschooling, without going it alone.</strong><br>
A member platform for Québec homeschooling parents: courses for parents, explained official resources, family organization, a local community, meetups, real-slot booking with tutors, and practice exams — all in one space.</p>

<p align="center">
  <a href="https://parented.parented.workers.dev">Live site</a> ·
  <a href="#-demo">Demo</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="docs/demo-jury.md">Jury walkthrough (FR)</a>
</p>

<p align="center">
  <img src="public/images/app-accueil.jpg" alt="ParentEd dashboard" width="860">
</p>

> **Note on language.** The product itself is in French (its users are Québec families); the public landing page has an FR/EN switch. This README and the code are in English; the project documents in `docs/` are in French.

---

## Contents

1. [The problem](#-the-problem)
2. [The solution](#-the-solution)
3. [Features](#-features)
4. [Screenshots](#-screenshots)
5. [Demo](#-demo)
6. [Architecture](#-architecture)
7. [Security and privacy](#-security-and-privacy)
8. [Business model](#-business-model)
9. [Setup and deployment](#-setup-and-deployment)
10. [Tests and quality](#-tests-and-quality)
11. [Status, limits and roadmap](#-status-limits-and-roadmap)
12. [Documentation](#-documentation)
13. [Credits](#-credits)

---

## The problem

Homeschooling is a beautiful choice. Doing it alone is exhausting. Québec families describe the same five difficulties, over and over:

| Difficulty | What parents live |
| --- | --- |
| **"What about socialization?"** | Finding nearby families, regular outings and friends for the children depends on luck and scattered Facebook groups. |
| **Uncertainty about the official steps** | Annual notice, learning project, progress reports, ministry exams: the framework is precise but scattered; you move forward fearing you missed something. |
| **Resources everywhere, and nowhere** | Government PDFs, blogs, forums: hours of searching without knowing what is reliable or current. |
| **A subject that gets stuck** | Sometimes outside help is needed, without giving up teaching yourself. |
| **Time and mental load** | Planning, keeping records, preparing reports — all while living, with no tool designed for a family. |

The challenge brief also asked business questions: who pays, how much, viability after year 1, who teaches, how many children together, a typical Tuesday, and adaptation to other environments. Answers live in [docs/demo-jury.md](docs/demo-jury.md) and are summarized below.

## The solution

**One space** connecting six areas, while the parent keeps full educational responsibility. ParentEd is not a school, not a childcare service, and not a compliance guarantee: the Ministry's official sources prevail, and the platform makes them readable.

| Area | What ParentEd provides |
| --- | --- |
| Parent training | Original short courses with examples, exercises, reusable templates, personal notes and questions answered by the team |
| Explained official resources | Government links with our guidance, dated, sorted by stage, with favourites |
| Family organization | Week per child, curriculum imported and spread over school days, private portfolio, weighted grades, calendar import |
| Community | Regional and thematic groups, member directory, interactive map, private messages, notifications |
| Meetups | List, calendar and map, filters, recurrence, member proposals reviewed by the team, reminders |
| Tutoring and appointments | Tutors, advisors and coaches with real time slots, instant confirmation, pedagogical report, reviews |
| Practice exams | Timed, corrected exams with results tracked per child |
| Assistant | Searches ParentEd's own content; natural-language answers via Claude when configured, under quotas |

## Features

### For parents
- **Widget dashboard**, customizable: next appointment with countdown, weekly agenda, local weather, children's progress (rings and sparklines), curriculum by subject, current course, next meetup, community, portfolio, shortcuts.
- **Courses**: modules, exercises, copy/downloadable templates, optional video link, a personal note per lesson, questions with public answers from the team, persistent progress.
- **My week**: activities per child, weekly intentions, child profiles, books and resources, **curriculum** (CSV/text import, automatic scheduling, % covered per subject), **results** (weighted grades, averages, trend charts, exam results folded in), **private portfolio** (dated notes and files with context), **.ics calendar import** (Google, Apple, Outlook), JSON export.
- **Appointments**: directory of verified tutors, advisors and coaches; a calendar of real slots computed from availability; booking confirmed instantly (the database refuses a taken or out-of-availability slot); meeting link; report; reviews; optional confirmation email.
- **Exams**: timed practice exams, correction with explanations, result saved per child and turned into a grade.
- **Resources**: search, stages, favourites, source and verification date.
- **Community**: discussions with likes and pinning, groups, **directory** searchable by city and interest, **interactive map** (families by city, opt-in only; meetups; tutors), **private messages**, in-app notifications.
- **Meetups**: list, calendar, map, filters (region, weekday/weekend, free, my registrations), featured announcements, recurrence, participant counts, member proposals with map location picking, iCalendar reminder.
- **Profile**: first name, city, children's age ranges without names, interests, map visibility.
- **Accounts**: sign-up, email confirmation, password reset, terms acceptance.

### For the team (admin)
- Dashboard: to-do list (reports, proposals, questions, profiles), 8-week activity chart, KPIs, families by city, assistant usage and cost with a kill switch.
- Management of courses, lessons, resources, groups, meetups (including publishing member proposals), tutors and availability, exams and questions, sessions, moderation reports, and contact requests from the public page.

### Public landing page
- Animated layered hero with parallax, problem, solution, real product screenshots, offer and pricing, FAQ, call booking and founding-family list, legal pages, FR/EN switch.

## Screenshots

| My week | Community map |
| --- | --- |
| ![My week](public/images/app-semaine.jpg) | ![Map](public/images/app-carte.jpg) |

| Appointments | Results |
| --- | --- |
| ![Appointments](public/images/app-rendezvous.jpg) | ![Results](public/images/app-resultats.jpg) |

## Demo

**Live site:** https://parented.parented.workers.dev

On the landing page, "Voir la démonstration" (or `#connexion`) opens four fictional profiles, no account needed. Demo data stays in the browser.

| Profile | Role | What it shows |
| --- | --- | --- |
| **Amélie** | Parent (Lina, 8; Adam, 6) | Week, curriculum, results, portfolio, tutoring session, community |
| **Sami** | Parent of another family | Data isolation between families |
| **Nadia** | Tutor | Tutor space: requests, confirmation, reports |
| **Camille** | Admin | Team dashboard, content management, moderation |

Full walkthrough and brief answers: [docs/demo-jury.md](docs/demo-jury.md).

**Locally:**

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://127.0.0.1:5173. Without Supabase configured, only the demo mode is active.

## Architecture

```
React 19 + TypeScript + Vite  ──►  Cloudflare Workers (Static Assets, SPA)
        │
        ├── Supabase Auth (email/password, confirmation, reset)
        ├── Supabase PostgreSQL (versioned schema, per-family RLS, views, triggers)
        ├── Supabase Storage (private bucket "family-documents", 5 MB, PDF/PNG/JPEG)
        └── Supabase Edge Functions
              ├── booking-email  (confirmation email via Resend, optional)
              └── assistant      (Claude API with quotas and usage log, optional)

Key-less external services: OpenStreetMap (map tiles), Open-Meteo (weather).
```

**Repository structure**

| Path | Contents |
| --- | --- |
| `src/domain.ts` | Provider-independent types and business rules (recurrence, slots, weighting, .ics parsing, iCalendar output) |
| `src/data/` | `gateway.ts` data contract, `supabase.ts` the only Supabase calls, `demo.ts` local simulator with the same access rules, `seed.ts` fictional data |
| `src/components/` | Dashboard, Courses, Family, Social (resources, meetups), Community, MapView, Tutoring, Exams, Profile, Assistant, Admin, Landing, Legal |
| `src/legal.ts`, `src/landing-text.ts` | Legal documents (drafts), FR/EN landing copy |
| `supabase/migrations/` | Eight versioned migrations; `supabase/parented-complet.sql` generated by `npm run sql:bundle` |
| `supabase/functions/` | Edge functions `booking-email` and `assistant` |
| `tests/` | Business tests (Vitest) and SQL tests running the real migrations in PostgreSQL (PGlite) |
| `scripts/` | Seed generation, local accounts, SQL bundle, screenshots (Playwright) |
| `docs/` | Service idea, decisions, business model, legal framework, deployment, QA protocol, jury guide (FR) |

**Data model (main tables):** families and profiles (parent / tutor / admin roles), courses and lessons, progress, lesson notes and questions, tasks, children, weekly plans, curricula and items, portfolio notes, documents, weighted grades, resources and favourites, posts, replies, likes, groups and memberships, private messages, notifications, events and registrations, tutors, availability, bookings, reports, reviews, exams, questions and attempts, assistant usage, settings, contact leads.

## Security and privacy

- **Per-family isolation in the database**: PostgreSQL row-level security on every table; admins see published content and coordination data, never the family space (children, planning, portfolio, grades).
- **Roles granted in the database** by an operator, never from the client (column grants keep role and family immutable).
- **Private files** with no public URL; author identity derived from the account by trigger.
- **Bookings** validated by trigger: no double booking, no slot outside announced availability.
- **Assistant**: key stays server-side; per-member and global daily quotas, minimum pacing, team kill switch, refusal of sensitive input, no tools, no family data sent; terms state it does not bind ParentEd.
- **Public requests** throttled per email and per day; honeypot field against bots.
- **Browser**: security headers and a strict CSP (`public/_headers`).
- **Legal pages** in the app: privacy (Québec Law 25), cookies, terms, payment and refunds; acceptance at sign-up. Checklist: [docs/juridique.md](docs/juridique.md).

## Business model

Working assumptions, detailed in [docs/ParentEd-modele-operationnel-et-financier.md](docs/ParentEd-modele-operationnel-et-financier.md) and [docs/ParentEd-couts-techniques-et-equipe.md](docs/ParentEd-couts-techniques-et-equipe.md).

- **Who pays:** families, monthly, no commitment; planned launch price CAD 49/month. Free pilot for 50 founding families. No payment in the app today.
- **Tutoring:** independent professionals bill families directly (CAD 45–65/hour); ParentEd verifies, schedules and collects reports, with no commission at launch.
- **Recurring annual cost:** about CAD 78,000 (coordination, pedagogy, technical, legal, acquisition, reserve); break-even around 139 average paying families.
- **Who teaches:** the parent; the pedagogical team writes the parent courses; tutors help on specific subjects, one-on-one.
- **Adaptation:** the core is reusable; content, official steps, language and staff must be adapted territory by territory.

## Setup and deployment

Full step-by-step guide (FR): [docs/deploiement.md](docs/deploiement.md).

1. Create a Supabase project and run `supabase/parented-complet.sql` in the SQL Editor (migrations plus fictional content; the seed section can be removed).
2. Configure Authentication (Site URL, Redirect URLs, 12-character minimum password).
3. Fill `.env.production` with the project URL and the publishable key (public by design; security relies on Auth and RLS).
4. `npx wrangler login`, then `npm run deploy`.
5. Grant admin and tutor roles in the database. Optional: deploy the `booking-email` (Resend) and `assistant` (Claude) functions with their secrets.

Useful commands:

```sh
npm run dev              # development server
npm run build            # TypeScript + Vite build
npm test                 # business and SQL tests
npm run check:cloudflare # build + wrangler deploy --dry-run
npm run sql:bundle       # regenerate seed.sql and parented-complet.sql
node scripts/capture-screens.mjs   # refresh product screenshots (dev server running)
```

## Tests and quality

- **45 tests**: 15 business/simulator tests (persistence, isolation, tutoring, recurrence, iCalendar, weighting, calendar import, messages, notifications, profile) and **30 PostgreSQL tests** that run the eight real migrations in PGlite and check access rules (families, files, bookings, reports, favourites, groups, questions, proposals, directory, messages, reviews, exams, curriculum, quotas, leads).
- Strict TypeScript, Prettier, Vite build and Cloudflare dry-run.
- Flows verified in the browser on desktop and mobile; animations disabled under `prefers-reduced-motion`.
- Limit: SQL tests represent Auth and Storage with minimal schemas; the connected QA protocol is in [docs/recette.md](docs/recette.md).

## Status, limits and roadmap

**Working:** everything described above, in local demo mode and on the deployed site connected to Supabase.

**Accepted limits for this phase:**
- no payment in the app; demo pedagogical content and provider profiles to be replaced;
- confirmation emails and the AI assistant depend on optional keys (Resend, Anthropic);
- loading capped at 1,000 rows per table, no pagination; one family per account;
- member area and legal pages in French only (landing page is FR/EN);
- legal documents contain placeholders and need a lawyer's review before public launch.

**Roadmap:** pilot with 50 founding families, validated pedagogical content, real providers, dedicated SMTP, self-serve account deletion, subscription payments, pagination and realtime, then adaptation to other territories.

Detailed history: [docs/progress.md](docs/progress.md).

## Documentation

| Document | Contents |
| --- | --- |
| [docs/idee-du-service.md](docs/idee-du-service.md) | Mission and scope |
| [docs/demo-jury.md](docs/demo-jury.md) | Demo walkthrough and answers to the brief |
| [docs/ParentEd-modele-operationnel-et-financier.md](docs/ParentEd-modele-operationnel-et-financier.md) | Operational and financial model |
| [docs/ParentEd-couts-techniques-et-equipe.md](docs/ParentEd-couts-techniques-et-equipe.md) | Technical costs, team, tutors |
| [docs/ParentEd-decisions-et-concessions.md](docs/ParentEd-decisions-et-concessions.md) | Architecture decisions |
| [docs/references-et-cadre-du-service.md](docs/references-et-cadre-du-service.md) | Government references and legal framework |
| [docs/juridique.md](docs/juridique.md) | Legal checklist (Law 25, consumer protection) |
| [docs/deploiement.md](docs/deploiement.md) | Supabase and Cloudflare deployment |
| [docs/recette.md](docs/recette.md) | QA protocol |
| [docs/sauvegarde-et-restauration.md](docs/sauvegarde-et-restauration.md) | Backup and restore |
| [docs/direction-marque-et-produit.md](docs/direction-marque-et-produit.md) | Brand and product direction |
| [docs/credits-photos.md](docs/credits-photos.md) | Photo credits |

## Credits

- ParentEd logotype and identity: provided by the project owner (`brand/`).
- Photographs: Unsplash licence via Lorem Picsum; authors listed in [docs/credits-photos.md](docs/credits-photos.md).
- Maps: © OpenStreetMap contributors. Weather: Open-Meteo.
- Icons: Lucide. Maps: Leaflet.
- All demo profiles, families, tutors, meetups and content are fictional and labelled as such.

Code licence: to be chosen by the project owner before public release.
