# Eventora Project Status

**Last reviewed:** 2026-11-03
**Repository:** `eventora` (nested project repository)

## Executive status

Core discovery, management, authentication, and CSV workflows are implemented.
Frontend lint/build, backend tests, backend syntax checks, a production
dependency audit, and local browser/API acceptance checks have passed as noted
below. This is not a production-readiness claim: Atlas, API hosting, Netlify
hosting, production environment values, and production smoke tests are not
configured or verified.

**Final readiness decision:** **DEVELOPMENT COMPLETE — PRODUCTION CONFIGURATION
PENDING.** This means the core application is implemented and its available
local checks pass; it does not mean every manual/optimization check or hosted
deployment requirement has been verified.

## Roadmap tally

The denominator counts the original roadmap list entries under each phase,
including nested list entries, as recorded in the supplied project plan. Each
entry receives exactly one status:

- **Verified complete:** implementation or behavior was directly confirmed by
  source inspection and/or an executed check.
- **Implemented, not tested:** implementation is present but its acceptance
  behavior was not separately exercised.
- **Partially complete:** some of the stated requirement is implemented, with a
  known gap or limitation.
- **Pending:** work remains and is actionable without external access.
- **Blocked:** work depends on external service/account configuration or explicit
  deployment authorization.

| Phase | Requirements | Verified complete | Implemented, not tested | Partially complete | Pending | Blocked |
|---|---:|---:|---:|---:|---:|---:|
| 0. Planning and architecture | 9 | 9 | 0 | 0 | 0 | 0 |
| 1. React/Vite/Tailwind setup | 11 | 11 | 0 | 0 | 0 | 0 |
| 2. Homepage and React fundamentals | 14 | 12 | 2 | 0 | 0 | 0 |
| 3. React Router | 11 | 10 | 1 | 0 | 0 | 0 |
| 4. Redux Toolkit | 13 | 10 | 3 | 0 | 0 | 0 |
| 5. Event discovery | 17 | 12 | 5 | 0 | 0 | 0 |
| 6. Express and MongoDB | 16 | 13 | 2 | 1 | 0 | 0 |
| 7. Frontend/backend integration | 16 | 13 | 3 | 0 | 0 | 0 |
| 8. CSV import/export | 30 | 24 | 4 | 2 | 0 | 0 |
| 9. Event management | 14 | 12 | 2 | 0 | 0 | 0 |
| 10. Authentication and security | 21 | 18 | 2 | 1 | 0 | 0 |
| 11. Testing and optimization | 37 | 23 | 10 | 4 | 0 | 0 |
| 12. GitHub and deployment | 35 | 8 | 4 | 8 | 10 | 5 |
| **Total** | **244** | **175** | **38** | **16** | **10** | **5** |

The tally is a roadmap triage, not a claim that every nested behavior has its
own automated test. Status evidence and remaining gaps below take precedence
over the arithmetic summary.

## Completion percentages

- **Development implementation:** 168 of 172 requirements in phases 0–10 are
  verified or implemented (97.7%). Four items in these phases remain partial:
  Atlas configuration, concurrency-safe CSV duplicate enforcement, a related
  CSV edge limitation, and the production threat-model decision for browser
  token storage. Local implementation should not be confused with production
  setup.
- **Local testing:** 23 of 37 phase-11 checklist items are recorded as verified
  (62.2%). The final local recheck below also confirms the current frontend
  suite, backend suite, build, and dependency audit; broader manual acceptance
  remains incomplete and is listed in [Remaining tasks](./REMAINING_TASKS.md).
- **Production configuration:** 8 of 35 phase-12 items are verified in the
  repository. Hosting-dependent items remain pending or blocked; see
  [Deployment readiness](./DEPLOYMENT_READINESS.md).
- **Production verification:** 0 of 10 production acceptance categories have
  been verified against a deployed application.

## Phase evidence

| Phase | Status and evidence |
|---|---|
| 0 | Architecture is reflected in the separate Vite client, Express API, Redux state, REST service layer, and Mongoose models; this plan documents the intended boundaries. See [src/](./src/), [server/](./server/), and [README](./README.md). |
| 1 | React/Vite/Tailwind project files and scripts are present. `npm run lint` and `npm run build` passed; `dist/_redirects` and `dist/_headers` were confirmed. |
| 2 | Homepage and reusable UI components exist. Browser navigation and event cards were exercised; mobile viewport and every React fundamentals behavior were not individually tested. |
| 3 | Home, events, event detail, favorites, manager, login, register, and not-found routes are wired. Detail deep-link and refresh were exercised; every direct URL was not independently retested in the final pass. |
| 4 | Redux Toolkit store, async event operations, selectors, status/error state, and favorites persistence exist. Favorites toggling was browser-verified; every reducer/error/persistence edge is not separately covered by a frontend automated suite. |
| 5 | Search, category/price filtering, sorting, grid/list view, pagination, favorites, and image fallback are implemented. Discovery, pagination, and favorites were exercised in prior browser checks; mobile and all boundary cases remain unverified. |
| 6 | Mongoose event/user models, MongoDB connection, Express routes/controllers, validation, ObjectId checks, and error middleware exist. Local MongoDB connectivity and API operations were exercised earlier; production Atlas is not configured. |
| 7 | Axios service, `VITE_API_URL`, API-backed Redux operations, `_id` support, loading/error handling, and detail fetching are implemented. Local API and browser detail refresh were exercised; all network-failure paths were not tested. |
| 8 | PapaParse preview, validation, template/export, backend parsing, row-level report, duplicate rejection, and MongoDB import are implemented. Real local browser import/export and mocked API CSV tests passed. Simultaneous duplicate imports can race because identity is not backed by a database uniqueness constraint. |
| 9 | Admin manager uses authenticated API-backed create/edit/delete, with direct detail access and Redux refresh. Create/edit were browser-verified against local MongoDB; earlier local API CRUD and automated mocked CRUD checks passed. |
| 10 | Registration/login, bcrypt, JWT, admin bootstrap, authorization, password change/token revocation, Helmet, CORS, limits, and headers are implemented. Automated auth tests and browser password change/re-login passed. Browser bearer tokens use localStorage, which is an XSS exposure to consider before production. |
| 11 | Backend automated tests, a limited frontend unit suite, lint/build, syntax, audit, diff, and selected manual acceptance checks ran successfully. Comprehensive frontend coverage, mobile/browser-console checks, and performance review are not complete. |
| 12 | README, environment examples, Netlify SPA redirects/security headers, and setup instructions exist. Git working-tree changes are present and have not been committed or pushed. Atlas/host accounts, production secrets, hosted connectivity, and production acceptance remain unconfigured/unverified. |

## Executed checks

- `npm run lint` — passed.
- `npm run build` — passed; generated Netlify `_redirects` and `_headers`
  verified.
- `cd server && npm test` — passed (1 Node test covering authentication,
  authorization, event validation/CRUD, pagination, and CSV import/export using
  mocked persistence).
- Backend `node --check` checks — passed for server, routes, controllers, and
  auth middleware.
- `cd server && npm audit --omit=dev` — passed, 0 reported vulnerabilities.
- `git diff --check` — passed.
- **Final local recheck, 2026-11-03:** `npm run lint` passed; `npm run test
  -- --reporter=default` passed (2 files, 3 tests); `npm run build` passed.
  Backend `npm test` passed (1 test); `node --check` passed for the server,
  routes, controllers, middleware, models, and config; `npm audit --omit=dev`
  reported 0 vulnerabilities; `git diff --check` passed.
- The final build contains both `dist/_redirects` and `dist/_headers`. Backend
  health route is implemented, but no hosted endpoint or Atlas connection was
  tested. Environment files remain ignored and untracked; their contents were
  not read.
- Manual browser acceptance with temporary local MongoDB: authenticated event
  create/edit/details/refresh, favorites, CSV preview/import/export,
  password-change token invalidation, and re-login were exercised.
- Temporary browser database was dropped by its test process shutdown handler.
  No production database was touched.
- Environment and credential files were checked as ignored/untracked without
  reading their contents.

See [Remaining tasks](./REMAINING_TASKS.md) for what was not verified and
[Production acceptance checklist](./PRODUCTION_ACCEPTANCE_CHECKLIST.md) for the
deployed checks still required.
