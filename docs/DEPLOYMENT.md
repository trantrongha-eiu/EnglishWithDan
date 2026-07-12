# Deployment Guide — EnglishWithDan

How this app gets from a git push to running in production. Written for
whoever next has to deploy, redeploy, or debug a failed deploy — not a
marketing overview.

## 1. Architecture overview

The repo contains three logical pieces, but they resolve to **two Render
deployments**:

| Piece | Source | Deploy unit |
|---|---|---|
| Backend API | `backend/` (entry point `backend/server.js`) | Render **Web Service** |
| Public frontend | `frontend/*.html` — vanilla JS, zero build step | Render **Static Site** (publish dir `frontend/`) |
| Admin SPA | `admin-src/` (React, built with Vite) | **Same** static site — build output lands inside `frontend/admin/` |

The admin SPA is not a separate deploy. `admin-src/vite.config.js` sets
`outDir: '../frontend/admin'` and `base: '/admin/'`, so its built assets
land directly inside the public frontend's own directory tree. `frontend/_redirects`
confirms this: it has routing rules for both the public pages (`/dashboard`,
`/reading`, etc.) and the admin SPA (`/admin/* -> /admin/index.html`) in one
file, which only makes sense if both are served from the same static-site
deploy. **Practical consequence:** if you change something under `admin-src/`,
you must rebuild it into `frontend/admin/` and commit/push that build output
*before* the frontend deploy will pick it up — there is no separate "deploy
the admin panel" step on Render's side.

`frontend/_redirects` uses Netlify/Render static-site redirect syntax
(`SOURCE DESTINATION STATUS`, first match wins). This strongly suggests the
static assets are served via **Render Static Sites** rather than some other
host, since that's the redirect-file convention Render's static site product
uses and there's no other static-hosting config anywhere in the repo. There
is no `render.yaml` in this repo, so this could not be fully confirmed from
source alone — **verify the actual service type against the Render
dashboard** before relying on this doc for a from-scratch environment
rebuild.

The backend is confirmed live at `https://englishwithdan.onrender.com` (this
exact URL is hardcoded into several frontend pages, e.g.
`frontend/login.html`, as the API base — see `backend/routes/admin/writingGrading.js`
and multiple `frontend/js/*.js` files for other references), which is Render's
own subdomain pattern for a Web Service, confirming the backend at least is a
standard Render Web Service.

Render auto-deploys from the connected Git branch on every push — there is
no `render.yaml` (Infrastructure-as-Code) in this repo, so all service
configuration (build command, start command, env vars, health check path,
plan/instance size) lives in the Render dashboard itself, not in version
control. Keep that in mind: a change made in the dashboard is not visible in
a diff or PR review.

## 2. Prerequisites

- Push access to the `main` branch (or whichever branch each Render service
  is configured to auto-deploy from — verify in the dashboard, this doc
  assumes `main` based on `.github/workflows/ci.yml` targeting `main`).
- Access to the Render dashboard for both services (backend Web Service,
  frontend Static Site).
- All required environment variables set on the backend service — see
  `docs/ENVIRONMENT_VARIABLES.md` for the full list and `backend/.env.example`
  for the canonical source. Do not duplicate that list here.
- Node 22 locally if you need to build the admin SPA before pushing (matches
  the Node version pinned in `.github/workflows/ci.yml`).

## 3. Deploying the backend (Render Web Service)

1. Ensure `backend/.env.example` is up to date if you added/removed any
   environment variable this change depends on (see
   `docs/RELEASE_CHECKLIST.md`).
2. Push (or merge a PR) to the branch the Render Web Service is configured
   to track. Render picks up the push automatically and runs its own build
   (`npm install` in `backend/`) and start command (`npm start`, i.e.
   `node server.js`, per `backend/package.json`).
3. **Health Check Path**: confirm the Render service's "Health Check Path"
   setting is `/health/ready` (see `backend/routes/health.js`) — **not**
   `/health/live`. `server.js` starts accepting connections (`app.listen()`)
   without waiting for the initial `mongoose.connect()` to resolve, so a
   totally broken `MONGO_URI` (e.g. a bad copy-paste during secret rotation)
   would still leave `/health/live` reporting healthy forever, and Render
   would never know to hold back or roll back that deploy (production-
   readiness audit finding — corrected after Phase 11's original guidance
   pointed at `/live`, which was wrong). `/health/ready` checks the DB
   connection state and correctly returns 503 in that scenario. Also do
   **not** point Render's health check at `/health` (the detailed endpoint)
   — it makes live outbound calls (MongoDB ping, Cloudinary ping) and
   returns 503 under `degraded`, which would cause Render to consider an
   otherwise-healthy new deploy unready whenever a third-party dependency is
   merely slow.
4. On startup the app logs which optional integrations are configured
   (`backend/server.js`'s `logger.startup('Integration config loaded', ...)`)
   and runs its auto-seed scripts (writing practice, Task 1, Task 2 content)
   if the relevant collections are under their expected count — this is
   normal and expected on every boot, not just first deploy.
5. Render sends `SIGTERM` to the old instance during a deploy; the app's
   graceful-shutdown handler (`backend/server.js`) drains in-flight
   requests, stops the tuition-reminder cron, and closes the MongoDB
   connection before exiting, with a 10-second force-exit safety net. This
   means a normal deploy should not drop in-flight requests, but it is not a
   guarantee of true zero-downtime — see §5.

## 4. Deploying the frontend + admin SPA (Render Static Site)

1. **Build the admin SPA first if `admin-src/` changed:**
   ```
   cd admin-src
   npm install
   npm run build
   ```
   This runs `vite build`, which (per `admin-src/vite.config.js`) outputs to
   `../frontend/admin` (i.e. `frontend/admin/` relative to repo root),
   `emptyOutDir: true` (the directory is wiped and fully regenerated each
   build — don't hand-edit anything under `frontend/admin/`).
2. **Commit the build output.** `frontend/admin/` is tracked in git — it is
   not covered by `.gitignore` (only `admin-src/dist/`, the Vite default
   output path this project doesn't actually use, and generic `dist/`/`build/`
   are ignored). This means the built admin bundle must be committed and
   pushed like any other file for the static site to pick it up; a static
   site deploy does not run a build step against `admin-src/` on Render's
   side.
3. Push (or merge a PR) to the tracked branch. Render's static-site deploy
   serves the `frontend/` directory as-is, applying `frontend/_redirects`
   for routing/rewrites (see that file's own header comment for the
   precedence rules — most specific rule first, `/* /404.html 404` catch-all
   last).
4. No environment variables are needed for the static deploy itself — the
   public frontend and admin SPA call the backend's public URL directly
   (hardcoded per-page, e.g. `https://englishwithdan.onrender.com/api` in
   `frontend/login.html`; `admin-src/src/utils/api.js` for the admin SPA's
   equivalent). If the backend's public URL ever changes, every one of these
   call sites needs updating — there is currently no single shared config
   point for it in the public frontend.

## 5. Zero-downtime and rollback

This project has no documented Render-specific rollback procedure verified
against the live dashboard, and Render's exact rollback UI/behavior is not
independently confirmed here — treat the following as the safe, generic
fallback rather than a platform-specific guarantee:

- **Roll forward, don't rely on dashboard rollback as the primary tool.**
  Since Render auto-deploys from the branch, the most predictable and
  auditable way to undo a bad deploy is `git revert <bad-commit>` and push —
  this produces a new commit, triggers a normal auto-deploy of the reverted
  state, and leaves a clear record in history of what happened and why.
  Avoid `git reset --hard` + force-push on a shared branch for this purpose.
- If Render's dashboard offers a "redeploy a previous build" action, that
  can be faster for a pure-backend issue with no accompanying data/schema
  change, but confirm it targets the correct previous commit before using
  it, and prefer the git-revert approach whenever a database migration or
  seed-script change was part of the bad deploy (rolling back code without
  rolling back data state can leave things inconsistent).
- **Downtime during a backend deploy** is minimized but not eliminated by
  the graceful-shutdown handling described in §3 step 5 — how much actual
  downtime occurs depends on Render's own deploy strategy (e.g. whether it
  starts the new instance before killing the old one) for the plan/tier in
  use, which is dashboard configuration this doc cannot verify from source.
- **Static site deploys** are effectively atomic from the visitor's
  perspective (new files swap in), so rollback there is just re-pushing the
  previous good commit's state.

## 6. How CI fits in

`.github/workflows/ci.yml` runs on every push and PR to `main` with four
jobs: `backend` (install, non-blocking lint, `test:ci` with coverage),
`frontend` (install, test), `admin` (install, lint, test, **and** `npm run
build` — this validates the admin SPA still builds cleanly, it does not
publish that build anywhere), and `deployment-validation` (boots `app.js`
via Supertest — a fast smoke check that Express constructs and responds,
not a real server/database boot).

**CI does not deploy anything.** It exists purely as a pre-merge gate — to
catch regressions before they reach `main`, and as a required-status-check
target for branch protection if that's enabled on the GitHub repo. The
actual deploy is Render's own auto-deploy-on-push, which runs independently
of GitHub Actions once code lands on the tracked branch. A green CI run does
not guarantee a successful Render deploy (e.g. a missing production env var
would only surface at Render's own build/boot time, since CI's in-memory
test DB and mocked externals never exercise real production configuration).

## 7. Post-deploy verification

See `docs/RELEASE_CHECKLIST.md` for the full checklist. At minimum: hit
`GET /health` on the live backend URL and confirm `status: 'ok'` with every
checked dependency reporting `ok`/`configured`, and manually exercise one or
two critical flows (login, one core practice feature) against the live
frontend.
