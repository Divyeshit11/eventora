# Eventora Deployment Readiness

**Last reviewed:** 2026-11-03
**Deployment performed:** No
**GitHub push performed:** No

## Decision

**Not ready for production deployment verification.** The app is locally
buildable and its core features have local test evidence, but production hosting
and database configuration are not established. Do not interpret example
values as production credentials.

Final local validation on 2026-11-03 passed frontend lint/tests/build, backend
tests/syntax checks, the backend production dependency audit (0 vulnerabilities),
and diff whitespace checks. This did not contact or change any external service.

## Readiness by component

| Component | State | Evidence or action |
|---|---|---|
| Frontend production build | Ready locally | `npm run build` passes. [vercel.json](./vercel.json) publishes `dist`, routes the SPA, and routes `/api/*` to the API function. |
| Vercel routing and security headers | Configured, not production-verified | [vercel.json](./vercel.json) contains SPA/API rewrites and the security policy needed by Razorpay Checkout. Verify direct-route refresh and response headers after deployment. |
| Backend production configuration | Implemented, not hosted | [server/server.js](./server/server.js) checks production HTTPS CORS origins, JWT configuration, and proxy hop configuration. |
| MongoDB Atlas | Not configured/verified | Set `MONGODB_URI` in the API host; create least-privilege access, restrict network access, and establish backups. No Atlas connection has been tested. |
| API hosting | Configured for Vercel, not production-verified | Configure the Vercel project with required secrets and verify the serverless API health endpoint. |
| CORS and HTTPS | Locally configured only | Set `CLIENT_URL` to the exact HTTPS Vercel origin. Verify browser preflight and API calls on the deployed domain. |
| JWT/admin secrets | Examples only | Set a unique secret of at least 32 characters and bootstrap an administrator with a unique password of at least 12 characters in a secret manager. |
| Proxy trust | Off by default | Enable only for a documented trusted proxy; set the verified `TRUST_PROXY_HOPS` value. |
| Error logging and backups | Not production-verified | Confirm host logs, alerting/retention, and recoverable database backups before launch. |
| Production acceptance | Not run | See [PRODUCTION_ACCEPTANCE_CHECKLIST.md](./PRODUCTION_ACCEPTANCE_CHECKLIST.md). |

## Environment configuration

Use the templates, never commit real environment files:

- Backend: [server/.env.example](./server/.env.example), variables `PORT`,
  `MONGODB_URI`, `CLIENT_URL`, `JWT_SECRET`, `ADMIN_EMAIL`,
  `ADMIN_PASSWORD`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
  `RAZORPAY_WEBHOOK_SECRET`, `TRUST_PROXY`, and `TRUST_PROXY_HOPS`.

The checked credential/environment files are ignored and untracked. Their
contents were not read or recorded in this document. Production secrets must be
generated and entered directly in the hosting provider's secret manager, not
shared in chat or committed.

## Deployment sequence (after approval)

1. Confirm the Vercel production domain and Atlas account.
2. Provision Atlas, restrict network access, create a least-privilege database
   user, and configure backups.
3. Configure Vercel with the required secrets, HTTPS client origin, and only
   the verified proxy settings.
4. Deploy the Vercel application and verify `/api/health` and the API-to-Atlas connection without exposing
   credentials.
5. Verify security headers, CORS, login, ticket purchase, and direct-route
   refresh using the production acceptance checklist.
6. Record deployment URLs and test evidence without recording secrets.

No deploy, push, production credential change, or production data operation is
authorized by this status document. Wait for explicit user approval before any
external release action.
