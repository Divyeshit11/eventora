# Eventora

Eventora is a React/Vite event discovery and management application backed by an
Express API and MongoDB.

## Local development

1. Install frontend dependencies with `npm install` in this directory.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to your
  MongoDB connection string. The API uses the `MONGODB_DB` database name,
  defaulting to `eventora`. Also set a unique `JWT_SECRET` (at least 32
  characters), `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 12
  characters).
3. Copy `.env.example` to `.env` if the API is not at the default
   `http://localhost:5000/api`.
4. Start the API with `cd server && npm install && npm run dev`.
5. Start the frontend in a second terminal with `npm run dev`.

The API defaults to port `5000`; `CLIENT_URL` accepts a comma-separated list of
allowed browser origins. The first configured administrator is created on server
startup if the account does not exist; its password is not reset on later
starts. The landing page and account creation/sign-in pages are public; event
browsing, event details, and favorites require a valid sign-in. Registration
creates ordinary users, requires a password of at least six characters, and
signs the new user in immediately. Administrator credentials still require at
least 12 characters. Only administrators may create, update, delete, import, or
export events. Do not commit environment files or credentials.

## Event API

- `GET /api/events` and `GET /api/events/:id` require a valid bearer token.
  Listing supports `page`, `limit` (maximum 100), `search`, `category`,
  `maxPrice`, and `sort`.
- Event discovery requests one database-paginated page at a time; search,
  category, price, and sort filters are applied by the API rather than by
  downloading the entire event collection.
- API requests are limited to 1,000 per IP in each 15-minute window.
  Authentication attempts have a separate, stricter limit.
- `GET /api/events/:id`, `POST /api/events`, `PUT /api/events/:id`, and
  `DELETE /api/events/:id` provide event CRUD.
- `POST /api/events/import-csv` accepts CSV files in the `files` multipart field.
  Each file is limited to 10 MB, and up to ten files can be submitted at once.
- `GET /api/events/export-csv` downloads the supported import columns.

CSV imports accept the required `title`, `category`, `location`, `date`, and
`price` headers. `image` and `description` are optional. Rows with invalid data
or duplicate event identity (case-insensitive title, location, date, and price)
are reported; valid rows in the same file are still imported. Duplicate checks
compare against the current collection and each active import. They are not a
database uniqueness constraint, so simultaneous imports can still race; the
identity also intentionally permits events that differ in any of those four
fields.

## Production setup

### Vercel (frontend and API on one domain)

The repository includes [vercel.json](./vercel.json), which installs the
frontend and nested server dependencies, builds the Vite application, and
routes every `/api/*` request to the existing Express API as a single Vercel
Function. Import this repository into Vercel with the project root set to this
directory; do not set the root directory to `server`.

Set these Vercel environment variables for **Production**, and use the same
values for Preview only when that deployment should connect to the production
database:

- `MONGODB_URI` — Atlas connection string; keep it secret.
- `MONGODB_DB` — normally `eventora`.
- `CLIENT_URL` — the exact production Vercel origin, for example
  `https://eventora.vercel.app` (no trailing slash).
- `JWT_SECRET` — a new random value of at least 32 characters.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — credentials used only to create the
  initial administrator when the account does not already exist.
- `TRUST_PROXY=true` and `TRUST_PROXY_HOPS=1`.

Vercel provides `NODE_ENV=production`; do not set `VITE_API_URL` for this
same-origin deployment. After deployment, verify
`https://<your-domain>/api/health`, sign in, and test a read-only event request.
Atlas must allow Vercel network access and have sufficient available storage;
the current Atlas storage quota block must be resolved before any event writes
or CSV imports can succeed.

- Deploy the `server` directory before deploying the frontend. A Render Blueprint

- Deploy the `server` directory before deploying the frontend. A Render Blueprint
  is included in [render.yaml](./render.yaml): in Render, choose **New +** →
  **Blueprint**, select this repository, and enter the required values for
  `MONGODB_URI`, `MONGODB_DB` (defaults to `eventora`), `CLIENT_URL`,
  `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Set
  `CLIENT_URL` to the exact Netlify URL, for example
  `https://your-site.netlify.app`. After it deploys, open
  `https://<your-render-service>.onrender.com/api/health`; it must return JSON
  before proceeding.
- Netlify is configured by [netlify.toml](./netlify.toml) to build with
  `npm run build` and publish `dist`. Connect the repository at its project
  root, then trigger a fresh deployment (clear the build cache if an older
  deployment published the wrong files).
- Configure `VITE_API_URL` in Netlify's frontend environment variables to the
  deployed Render API URL ending in `/api`, for example
  `https://<your-render-service>.onrender.com/api`; do not use a localhost URL
  for a deployed site. Save it, then trigger a new Netlify deployment so Vite
  embeds the value in the production bundle. Backend secrets and `MONGODB_URI` belong only in the API
  host's environment variables, never in the frontend.
- The included `public/_redirects` routes Netlify page requests to the React
  entry point so event detail URLs can be refreshed directly.
- Configure the backend host with `PORT`, `MONGODB_URI` (MongoDB Atlas),
  `MONGODB_DB=eventora`, and
  `CLIENT_URL` (the deployed frontend origin), `JWT_SECRET`, `ADMIN_EMAIL`, and
  `ADMIN_PASSWORD`. Set `TRUST_PROXY=true` only if the host sits behind its
  documented trusted reverse proxy and set `TRUST_PROXY_HOPS` to the verified
  proxy hop count (1–5). Production `CLIENT_URL` entries must be HTTPS origins.
  Ensure the MongoDB `events` collection has a descending `createdAt` index for
  paginated event browsing (`db.events.createIndex({ createdAt: -1 })`).
  Restrict Atlas network access to the backend host and use a least-privilege
  database user.
- Deployment is not automatic. Configure the hosting dashboards and verify the
  live integration before considering the application production-ready.

## Project planning and release status

- [PROJECT_MASTER_PLAN.md](./PROJECT_MASTER_PLAN.md) — original 13-phase scope.
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — implementation and executed-check
  evidence.
- [REMAINING_TASKS.md](./REMAINING_TASKS.md) — local verification and external
  setup still required.
- [DEPLOYMENT_READINESS.md](./DEPLOYMENT_READINESS.md) — production setup gates
  and deployment sequence.
- [PRODUCTION_ACCEPTANCE_CHECKLIST.md](./PRODUCTION_ACCEPTANCE_CHECKLIST.md) —
  checks to run against the deployed services.
- [DEVELOPMENT_PROGRESS_LOG.md](./DEVELOPMENT_PROGRESS_LOG.md) — dated
  consolidated progress.
