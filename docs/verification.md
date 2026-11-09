# Verification

## Automated API and synchronization checks

```sh
npm ci --include=dev
npm run check
```

The API tests start a real HTTP server backed by isolated SQLite databases. They check registration, invalid credentials, token expiry/revocation, persistent CRUD, two-user isolation, related-record ownership, idempotent writes, validation and database readiness failures. Synchronization regression tests execute the actual TypeScript queue implementation; they cover writes added during requests, retries, account switching, superseded updates and unsupported records.

These tests never connect to Supabase or modify the normal `data/crmsales.sqlite` file.

## Browser journey

```sh
npx playwright install chromium
npm run test:e2e
```

This builds the production frontend and starts the real local API with a temporary database. Chromium drives the mobile layout through account creation, clock-in, customer creation, appointment/visit completion, a signed agreement, reload persistence, offline queue recovery, profile editing, logout, invalid credentials and network failure. It also opens every primary screen and checks for uncaught JavaScript exceptions, HTTP 5xx responses and unintended external requests. Test screenshots are written to ignored `test-results/`.

For a preinstalled compatible Chromium binary, set `CRM_CHROMIUM_PATH` to its executable. Otherwise Playwright uses its installed Chromium. Browser automation requires an environment that permits launching Chromium; the API tests can run separately when that capability is unavailable.

GitHub Actions runs API/build checks on Linux and Windows and the browser journey on Linux. A green run demonstrates the tested scenarios, not an unconditional guarantee that every browser, device or deployment is error-free.

## Running instance

```sh
npm run dev
```

In a second terminal in the same machine/environment:

```sh
npm run health
```

The frontend proxies `/api` to the local server. To test the distributable server instead, stop development mode, run `npm run build`, then `npm start`; the frontend and API share port 3001.

The offline queue preserves changes while an already loaded authenticated page loses connectivity. This is not a service-worker/PWA offline installation; reopening the app requires the server to be reachable and the session to be verified. Data is scoped per account, not shared among a team. Email delivery, manager approval and remote Supabase migration are not configured by local startup.
