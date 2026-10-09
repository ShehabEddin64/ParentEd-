# Security and cost boundaries

This repository is a **local-only hackathon demo**, not a production service. Do not enter real family data, credentials or sensitive documents.

## Current edition

- No API keys or environment configuration are required.
- The Supabase connector, Cloudflare deployment configuration, cloud CLIs, account provisioning and paid AI/email functions have been removed.
- The app uses fictional browser-local data. There is no remote authentication or cross-device storage.
- No live weather API, external map tiles, payment integration or real meeting-room link is used.
- The public contact form and commercial pricing have been removed.
- Environment files, key files, builds and rendered videos are ignored.
- `npm run check:safety` checks source and built assets without printing matched credentials.

Public resource links open third-party sites when clicked. Installing dependencies uses the package registry. A host chosen independently by the repository owner may charge for hosting even though the app contains no paid integrations.

## Historical scan

On 8 October 2026, a pattern scan of locally available Git history found a former **Supabase anon JWT** in an older `.env.example`. An anon key is a public client key, not a private service-role credential, but it identifies a project and can permit requests subject to that project’s policies. No matching private provider key was found by that scan; this is not proof that no credential could exist in another format or outside this repository.

Removing a file from the current revision does not erase previous commits, forks, clones, GitHub caches or already-deployed bundles. History rewriting is a separate operation requiring the owner's approval. Rotate or revoke exposed credentials at the provider where possible; disabling the underlying service is what prevents use of old copies.

## Previously deployed services

This cleanup does not claim to have cancelled cloud subscriptions, revoked provider credentials or deleted hosted data. Follow [docs/service-retirement.md](docs/service-retirement.md) from the relevant accounts. Never post API keys in an issue or chat.

## Local privacy

Demo role checks exist to demonstrate the intended behavior. Anyone who can access the browser can inspect or modify localStorage. Exported files should contain fictional information only. Clearing site data permanently removes local demo edits.
