# Eventora Production Acceptance Checklist

**Last reviewed:** 2026-11-03
**Status:** Not run; no production environment is configured.

Run this checklist only after deployment is explicitly approved. Do not use
real customer data for test records; use an authorized test administrator and
remove test events only when their environment/data owner approves.

| # | Acceptance check | Result |
|---:|---|---|
| 1 | Confirm deployed frontend serves over HTTPS and `/`, `/events`, `/favorites`, `/login`, and `/register` load. | Not run — no deployed frontend |
| 2 | Confirm `/api/health` responds and the backend can connect to Atlas. | Not run — no hosted API/Atlas |
| 3 | Sign in as the provisioned administrator; verify a regular registered user cannot access admin operations. | Not run in production |
| 4 | Sign out and confirm protected manager navigation redirects; verify expired/revoked tokens are rejected. | Not run in production |
| 5 | Change the administrator password, confirm the prior token is invalidated, and sign in again with the new secret. | Not run in production |
| 6 | Create an authorized test event, read it from the public list and detail URL, update it, and delete it with approval. | Not run in production |
| 7 | Verify CSV template download, preview/import, row-level validation/duplicate report, and database persistence. | Not run in production |
| 8 | Verify CSV export download, headers/escaping, and empty-dataset behavior. | Not run in production |
| 9 | Verify search, category/price filters, sorting, pagination, favorites, image fallback, and direct URL refresh. | Not run in production |
| 10 | Check mobile/tablet layouts, browser console/network failures, CORS, security headers, API logs, and backup/restore readiness. | Not run in production |

## Evidence to record after execution

- Test date and environment.
- Frontend and API public URLs (never include credentials).
- Result for each numbered check and concise failure evidence.
- Atlas connectivity and backup confirmation from the responsible operator.
- Browser/device viewport and any console/network errors.
- Approval to remove test records, if cleanup is needed.

Local test results are recorded in [PROJECT_STATUS.md](./PROJECT_STATUS.md);
they are not production acceptance evidence.
