# Developer Guide

Getting a working local environment, running the app, running its tests, and debugging it. For *why* the system is built this way, see [`docs/ARCHITECTURE.md`](ARCHITECTURE.md); for the exact meaning of every environment variable, see [`docs/ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md); for deploying to production, see [`docs/DEPLOYMENT.md`](DEPLOYMENT.md). This doc is deliberately just the "how," not the "why" — those other docs are the source of truth for their topics.

## Prerequisites

- Node.js 22 (matches the version pinned in `.github/workflows/ci.yml`)
- A MongoDB connection — either a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or a local `mongod` instance. You do **not** need this to run the test suite (tests use an isolated in-memory MongoDB automatically) — only for actually running the app locally.
- Optional, only if you're touching that specific feature: a Cloudinary account (file uploads), a Google Gemini API key (AI grading), Google OAuth credentials (social login), Gmail/Resend credentials (email). Every one of these degrades gracefully when unset — the app boots and runs fine without any of them, the corresponding feature just quietly disables itself.

## Local setup

The three pieces (backend, admin SPA, public frontend) each have their own dependencies and are set up independently.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
# Edit .env — at minimum set MONGO_URI and JWT_SECRET.
# Generate a strong JWT_SECRET locally with:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Admin SPA (separate terminal/directory)
cd admin-src
npm install

# 3. Public frontend needs no install — it's static files.
```

Full description of every environment variable, what breaks without it: [`docs/ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md).

## Running locally

```bash
# Backend API — http://localhost:5000
cd backend
npm run dev        # nodemon, auto-restarts on file change
# or: npm start     # plain node, no auto-restart

# Admin SPA — Vite dev server, http://localhost:5173, proxies API calls
# to whatever backend URL admin-src/src/utils/api.js is configured for
cd admin-src
npm run dev

# Public frontend — any static file server. http-server matches how
# Playwright's E2E specs expect it to be served (see e2e/README.md):
npx http-server frontend -p 3000
```

With all three running: public site at `http://localhost:3000`, admin at `http://localhost:5173` (or `http://localhost:3000/admin/` if you build it first — see below), API at `http://localhost:5000`. Note `login.html`/`register.html` currently hardcode the production API URL (`https://englishwithdan.onrender.com`) rather than reading it from local config — see `docs/MAINTENANCE.md` for this as a known limitation if you need to test the login flow fully locally; most other pages call whatever the frontend's own `apiFetch`/admin's `api.js` resolve to, which likewise point at production by default today.

## Running tests

Every test suite is isolated — no real database, no real third-party API calls, no manual setup beyond `npm install`.

```bash
# From the repo root — runs backend + frontend + admin, in that order
npm test

# Individually
cd backend && npm test              # ~370 tests: Jest + Supertest + in-memory MongoDB
cd frontend && npm test             # ~93 tests: Jest + jsdom, for js/shared/*.js
cd admin-src && npm test            # ~43 tests: Vitest + React Testing Library

# Coverage
cd backend && npm run test:coverage
cd backend && npm run test:ci       # CI mode: --ci --coverage --maxWorkers=2

# Watch mode (backend)
cd backend && npm run test:watch

# End-to-end (Playwright) — needs the frontend served first, see e2e/README.md
npx http-server frontend -p 3000 &
npx playwright install chromium     # first time only
npx playwright test
```

Backend tests never touch your real `MONGO_URI` — `backend/tests/support/globalSetup.js` spins up a throwaway in-memory MongoDB instance and every test file gets its own isolated database within it. AI/Cloudinary calls are mocked at the SDK level (`backend/tests/unit/services/geminiService.test.js`/`cloudinaryService.test.js`) — no API key needed, no real network calls, no cost.

## Building

```bash
# Admin SPA — the only piece with a real build step
cd admin-src
npm run build
# Output goes to frontend/admin/ (per admin-src/vite.config.js's outDir).
# This directory is committed to git — it IS the deployed artifact, there's
# no build step on the server side. Rebuild and commit whenever admin-src/
# changes before pushing (see docs/RELEASE_CHECKLIST.md).
```

Backend and the public frontend have no build step — plain CommonJS Node and static HTML/JS respectively.

## Deploying

Covered in full in [`docs/DEPLOYMENT.md`](DEPLOYMENT.md). Short version: push to `main`, Render auto-deploys the backend and static site independently. There's no manual deploy command.

## Debugging

- **Structured logs**: every operationally-significant event (startup, shutdown, security, auth, database, AI failures) goes through `backend/utils/logger.js` as one JSON line per event. Locally these print to your terminal; in production they're in Render's Logs tab. See [`docs/RUNBOOK.md`](RUNBOOK.md) §3 for the full category list and how to filter them.
- **Health endpoints**: `GET /health/live`, `/health/ready`, `/health` (add your local port) — the detailed one reports live DB/Cloudinary connectivity and config-presence for every optional integration. Useful for confirming your local `.env` is actually being picked up correctly.
- **A failing test that passes when run alone**: check for test-isolation issues first — each backend test *file* gets its own database (see `backend/tests/support/setupTestDb.js`), so this is rare, but a test relying on `process.env` mutation (a few of the health-endpoint tests intentionally do this, and clean up in a `finally` block) is the most likely culprit if you add a new one.
- **"Why is this response shaped like that"**: check `docs/API.md`/`docs/API_ADMIN.md` first — every documented endpoint's response shape was read directly from the controller's actual `res.json(...)` call, not inferred.
- **CORS errors in the browser console during local dev**: `backend/app.js`'s allowed-origins list includes `http://localhost:3000` and `http://localhost:5173` by default — if you're serving the frontend on a different port, either match one of those or set `FRONTEND_URL` in `backend/.env` to add yours (see `docs/ENVIRONMENT_VARIABLES.md`).
- **A rate-limit 429 during local testing**: every rate limiter in this app is keyed by IP + (for auth routes) the targeted account identifier — hitting the same endpoint repeatedly during manual testing can trip it. Limits are documented per-endpoint in `docs/API.md`; they reset on their configured window (usually 15 minutes) or by restarting the backend process (in-memory store, not persisted).
