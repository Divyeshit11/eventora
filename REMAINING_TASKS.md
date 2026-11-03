# Eventora Remaining Tasks

**Last reviewed:** 2026-11-03
**Scope:** Work still needed before the development and production acceptance
gates can be considered fully satisfied.

## Local verification still recommended

1. Expand the existing frontend Vitest suite. It currently has 3 tests across
   routing/auth redirect and favorites-state behavior; search/filter
   combinations, pagination boundaries, CRUD state updates, and CSV
   preview/error states still need automated coverage.
2. Complete the remaining manual acceptance matrix: registration, every direct
   route/refresh, invalid IDs and 404s, network/API errors, image fallback,
   empty datasets, pagination boundaries, grid/list controls, and responsive
   mobile/tablet layouts.
3. Check browser console/network errors during the full acceptance pass and
   perform a measured performance review.
4. Review the browser auth token's localStorage storage against the production
   threat model. An XSS flaw could expose a stored bearer token; retain the
   current approach only with an accepted risk, or select a suitable alternative
   before production.
5. Decide whether concurrent event imports must be prevented from creating
   duplicate identities. Current duplicate checks reject existing/within-import
   duplicates but can race across simultaneous requests; enforce a database
   constraint if strict concurrency-safe uniqueness is required.

The final local recheck on 2026-11-03 passed frontend lint, all 3 frontend tests,
the frontend production build, backend tests and syntax checks, the backend
production dependency audit, and `git diff --check`. These results do not
replace the remaining behavioral, responsive, browser-console, or performance
checks above.

## External production tasks

1. Provision/configure a MongoDB Atlas cluster, least-privilege database user,
   network access, and backup policy.
2. Choose and configure an API hosting provider; add production environment
   variables and a verified proxy-hop setting if applicable.
3. Configure Netlify with the deployed API base URL and production build.
4. Set a unique production JWT secret and provision an administrator password
   through the host's secret manager. Do not copy local/test credentials.
5. Configure the exact HTTPS frontend origin in backend `CLIENT_URL`, test
   CORS/HTTPS, and confirm the host's health endpoint.
6. Deploy only after explicit user approval; no deployment or GitHub push has
   been performed.
7. Run the full deployed acceptance checklist and document the result.

## Existing implementation constraints

- CSV duplicate identity is case-insensitive title, location, date, and price;
  it is not a unique MongoDB index.
- The backend test suite uses mocked Mongoose operations. Local MongoDB/browser
  checks supplement it but do not replace a production-like Atlas check.
- Hosting-provider-specific configuration cannot be finalized until the API
  provider, public API URL, and production frontend origin are known.

## Relevant project files

- [README.md](./README.md) — local and production setup instructions.
- [server/.env.example](./server/.env.example) and [.env.example](./.env.example)
  — environment variable templates.
- [server/server.js](./server/server.js) — production configuration checks,
  CORS, security middleware, rate limits, and API startup.
- [server/test/api.test.js](./server/test/api.test.js) — backend automated API
  tests.
- [src/services/](./src/services/) and [src/features/](./src/features/) —
  frontend/API integration and state.
- [public/_headers](./public/_headers) and [public/_redirects](./public/_redirects)
  — Netlify security headers and SPA routing.
- [Deployment readiness](./DEPLOYMENT_READINESS.md) — explicit release gates.
