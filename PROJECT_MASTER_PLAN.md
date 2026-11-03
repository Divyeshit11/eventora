# Eventora Project Master Plan

**Status reviewed:** 2026-11-03
**Project:** Eventora, a React/MERN event discovery and management platform

## Vision and technology

Eventora is intended to be a maintainable, responsive, database-driven portfolio
application with public event discovery and administrator-managed events.

- **Frontend:** React 19, Vite, JavaScript, Tailwind CSS v4, Redux Toolkit,
  React Router, Axios, and PapaParse.
- **Backend:** Node.js, Express, REST APIs, Mongoose, Multer, and `csv-parse`.
- **Database:** MongoDB Community Server locally; MongoDB Atlas for production.
- **Deployment target:** Netlify frontend and a separately hosted API.
- **Security:** bcrypt password hashing, JWT authentication, role checks, Helmet,
  CORS allowlisting, rate limiting, and environment-provided secrets.

The source of truth for implementation is the repository. This plan records the
original 13-phase roadmap and the current evidence-based state; it does not
authorize pushing or deployment.

## Phase roadmap and acceptance objectives

| Phase | Objective | Acceptance scope |
|---|---|---|
| 0. Planning and architecture | Define the system and its boundaries. | Technology selection; frontend/backend separation; reusable components; Redux, REST, and database architecture. |
| 1. React, Vite, and Tailwind setup | Establish a working frontend foundation. | React/Vite entry points, Tailwind v4, project structure, scripts, dev server, and production build. |
| 2. Homepage UI and React fundamentals | Build the public landing experience. | Navbar, hero, featured events, cards, footer, reusable composition, state/effects, event handling, conditional rendering, lists, and responsive layout. |
| 3. React Router | Make all application views addressable. | Home, events, details, favorites, manager, not-found route, dynamic IDs, navigation, direct access, and refresh. |
| 4. Redux Toolkit | Centralize event and favorite state. | Store, slices, reducers/actions, selectors, async thunks, loading/error states, dispatch, selection, and localStorage persistence. |
| 5. Event discovery | Support practical browsing and filtering. | Database-backed list, title/location search, category and price filters, sorting, grid/list views, pagination, favorites, empty states, image fallback, and responsive cards. |
| 6. Express and MongoDB | Implement a validated REST API. | Environment configuration, MongoDB connection, Mongoose event model, routes/controllers/middleware, CRUD, ObjectId validation, error handling, API checks, local MongoDB, and Atlas configuration. |
| 7. Frontend/backend integration | Make the UI operate on API data. | Axios service, environment API URL, MongoDB reads and CRUD, Redux synchronization, loading/errors/success, `_id` compatibility, direct detail refresh, and no production demo data. |
| 8. CSV import/export | Provide usable bulk event management. | File validation, preview and row checks, required columns, category/price/date validation, empty rows, backend parsing and bulk import, duplicate handling, row reports, template, export escaping, and import-compatible output. |
| 9. Event management | Complete event lifecycle workflows. | Create/read/update/delete, detail view, manager interface, real persistence, Redux consistency, favorites by MongoDB ID, confirmations, validation, and user feedback. |
| 10. Authentication and security | Protect administrative operations. | Registration/login, password hashing, JWT, protected and role-based routes, administrator provisioning, authenticated management, password change, secret handling, validation, errors, CORS, headers, rate limits, and safe CSV uploads. |
| 11. Testing and optimization | Validate behavior and quality. | Route and discovery checks, admin flows, CRUD, CSV, image fallback, refresh, invalid/error paths, responsiveness, lint/build, backend/API tests, diff checks, dependency audit, console/network/database checks, and performance review. |
| 12. GitHub and deployment | Prepare and verify the hosted system. | Repository hygiene/history, README and setup/API docs, screenshots, Atlas, API host, Netlify, production URL/CORS/secrets/admin/HTTPS/proxy configuration, logging/backups, and production acceptance tests. |

## Completion gates

### Development complete

- Applicable roadmap implementation is complete.
- CRUD, authentication, CSV, and frontend/API integration work.
- Core local acceptance checks pass and no critical known application bug
  remains.
- Local completion does not imply hosted services have been configured.

### Production ready

- Atlas, API hosting, Netlify, production environment variables, CORS, HTTPS,
  and proxy behavior are configured.
- The deployed frontend connects to the hosted API and Atlas.
- Production acceptance checks pass and no critical security or deployment
  blocker remains.

## Current linked records

- [Project status](./PROJECT_STATUS.md)
- [Remaining tasks](./REMAINING_TASKS.md)
- [Deployment readiness](./DEPLOYMENT_READINESS.md)
- [Production acceptance checklist](./PRODUCTION_ACCEPTANCE_CHECKLIST.md)
- [Development progress log](./DEVELOPMENT_PROGRESS_LOG.md)
- [README and local/production setup](./README.md)

**Current decision:** Development work is substantially implemented and locally
validated; production configuration and live verification remain pending. No
push or deployment has been performed.
