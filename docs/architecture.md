# Architecture — hackathon archive

The executable app is a React/TypeScript SPA, bundled with Vite. Its only active data provider is `DemoGateway`, backed by localStorage. The public landing page does not collect contact information, and profile selection does not send credentials anywhere.

Business logic in `src/domain.ts` covers planning, progression, recurring events, booking slots, calendar import/export and weighted results. The UI consumes a gateway contract so the original data design can be understood independently of presentation.

The eight SQL migrations in `supabase/migrations/` document the original relational model, per-family permissions, tutor scheduling and moderation. PGlite runs these locally during tests. No Supabase SDK, CLI, configuration, user provisioning script or deployable Edge Function remains.

The older gateway contract still describes optional methods for authentication, email and assistant responses; the demo implementation refuses account operations and returns unavailable for external services. There is no remote implementation. The visible help panel performs local text search only.

The map is a local schematic grid with interactive markers; Leaflet never fetches map tiles. Weather is a fictional fixture. Photos and logos are bundled. Resource links open official websites only on user action. CSP restricts connections to the same origin on a static host that supports `_headers`; the runtime also contains no fetch, WebSocket or service SDK path.

Historical presentation screenshots/video may show the original online map. They illustrate the hackathon prototype and are not evidence of current connectivity.
