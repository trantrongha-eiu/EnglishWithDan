# Architecture

This is the deep-dive companion to the README's high-level overview. It documents how the system actually works — read from real code, not from a design doc — so treat any drift between this file and the code as a bug in the doc, not the code.

## Table of contents
- [Overall architecture](#overall-architecture)
- [Backend architecture](#backend-architecture)
- [Frontend architecture](#frontend-architecture-public-site)
- [Admin architecture](#admin-architecture-react-spa)
- [Authentication flow](#authentication-flow)
- [Authorization flow](#authorization-flow)
- [Request lifecycle](#request-lifecycle)
- [AI grading workflow](#ai-grading-workflow)
- [Database architecture](#database-architecture)
- [Deployment architecture](#deployment-architecture)
- [Dependency overview](#dependency-overview)

## Overall architecture

Three independently deployable pieces, one shared database:

```
┌─────────────────────┐        ┌──────────────────────┐
│  Public frontend      │        │  Admin SPA (React)     │
│  frontend/*.html      │        │  built into              │
│  (static site)          │        │  frontend/admin/         │
└──────────┬───────────┘        └──────────┬────────────┘
           │  fetch() calls, both hardcode the        │
           │  backend's public URL directly                │
           └────────────────┬───────────────────────────┘
                             ▼
                  ┌────────────────────────┐
                  │  Backend API (Express)     │
                  │  backend/                       │
                  └───────────┬────────────┘
                              │
        ┌─────────────────────┼─────────────────────────┐
        ▼                     ▼                         ▼
┌───────────────┐  ┌────────────────────┐   ┌──────────────────────┐
│ MongoDB Atlas    │  │ Cloudinary              │   │ Gemini / Google OAuth  │
│ (all app data) │  │ (file storage)          │   │ / Email (optional)       │
└───────────────┘  └────────────────────┘   └──────────────────────┘
```

The two frontends never talk to each other and never talk to MongoDB/Cloudinary/Gemini directly — every write and read goes through the backend API. This is what makes "the backend is the only thing with a database connection" a load-bearing architectural fact rather than just an implementation detail: authorization, validation, and grading logic all live in exactly one place.

## Backend architecture

**Layering:** `routes/` → `controllers/` → `services/` → `models/`. This is the single most important structural fact about the backend, and it wasn't always true — it's the result of a deliberate refactor (see README's [project history](../README.md#project-history-eleven-phases-of-hardening), phases 1–2).

| Layer | Responsibility | Must NOT contain |
|---|---|---|
| `routes/*.js` | HTTP method + path + middleware chain (auth, role gate, rate limit) + which controller method handles it | Business logic, direct Mongoose calls |
| `controllers/*.controller.js` | Pull fields off `req`, call the matching service, shape the response (status code, JSON body) | Mongoose queries, complex conditional logic |
| `services/*.js` | Everything else — validation, Mongoose queries/aggregations, grading algorithms, third-party API calls | Direct access to `req`/`res` |
| `models/*.js` | Mongoose schemas, indexes, schema-level methods | Request-handling logic |

`routes/admin/*.js` follows the identical pattern for admin-only endpoints, gated by `teacherOnly`/`adminOnly` middleware (`routes/admin/_shared.js`) on top of the base `auth` middleware.

**`app.js` vs `server.js`:** `app.js` builds and exports the fully-configured Express app with zero side effects (no `.listen()`, no Mongo connection, no cron) — this is what lets tests `require('../../app')` and drive it with Supertest against an isolated in-memory database. `server.js` is the thin production entry point: it requires `app.js`, connects to MongoDB, runs auto-seed scripts, starts the cron job, and calls `.listen()`. See `docs/DEVELOPER_GUIDE.md` for running either.

**Cross-cutting infrastructure** (added in the later hardening phases, applies uniformly):
- `utils/logger.js` — structured JSON logging (categories: info/warn/error/security/startup/shutdown/ai/db/auth), with automatic redaction of sensitive-looking keys and credential-shaped values.
- `middleware/errorHandler.js` — the single global error handler; any error without `.isOperational` gets a generic response, never a leaked stack trace to the client.
- `errors/AppError.js` — typed error hierarchy (`NotFoundError`, `ValidationError`, etc.) for the (currently partial, opt-in) cases that use it instead of ad-hoc `try/catch` + `res.json({message: err.message})`.
- `middleware/mongoSanitize.js` — strips `$`-prefixed/dotted keys from `req.body`/`params`/`query` recursively, the app's primary NoSQL-injection defense.
- `middleware/requirePremium.js` — gates premium-only features server-side (never trust a client-sent plan claim).
- Graceful shutdown + `uncaughtException`/`unhandledRejection` handlers in `server.js` — see `docs/RUNBOOK.md` §5 for the exact behavior and the deliberate tradeoff around `unhandledRejection`.

## Frontend architecture (public site)

`frontend/*.html` — one file per page, no bundler, no framework. Each page loads:
1. `js/shared/*.js` — small, dependency-free IIFEs that attach helpers to `window` (`escHtml`, `AuthService`, `apiFetch`, `safe-redirect`, `toast`, `confirm-dialog`, `route-params`). These are the only "shared library" this codebase has, and they're tested in isolation (`frontend/tests/`).
2. A page-specific script (`js/dashboard.js`, `js/writing.js`, `js/reading-v2.js`, etc.) containing that page's own logic.

**Why no build step:** this is a content-heavy, mostly-static public site (course pages, exam practice screens) where a bundler would add tooling cost without a corresponding benefit — there's no code-splitting need, no JSX, no npm-package-heavy dependency graph. `frontend/_redirects` handles clean-URL routing (`/reading/test/:id` → `reading.html`, etc.) at the static-host level.

**State/data flow:** each page fetches what it needs directly from the backend API on load (via `apiFetch`, which attaches the JWT from `localStorage`), no client-side global store. Auth state lives in `localStorage` (`token`, `user`) via `AuthService` (`js/shared/auth-service.js`) and is re-validated server-side on every request — the frontend's copy is a display convenience, never trusted for authorization.

## Admin architecture (React SPA)

`admin-src/` — React 19 + React Router 7 + Vite, builds into `frontend/admin/` (committed to git, not gitignored — the built output IS the deployed artifact for this piece, there's no build step on the server side; see `docs/DEPLOYMENT.md`).

- `src/pages/*.jsx` — one component per admin screen (Users, Passages, ListeningTests, WritingGrades, Tuition, etc.), each independently fetching its own data via `src/utils/api.js`'s `apiFetch`.
- `src/routes/ProtectedRoute.jsx` — wraps every admin route; redirects to the shared public-site login page if unauthenticated, blocks (redirects) if the authenticated user's role doesn't match the route's required role.
- `src/contexts/` — `AuthContext` (current user, login/logout, memoized so the ~23 consumers don't re-render on unrelated changes), `ThemeContext`, `ToastContext`.
- `src/components/` — genuinely shared, reusable pieces (`Pagination`, `ConfirmDialog`, `QuestionGroupBuilder`). Most admin pages build their own tables/forms inline rather than through a shared `Table` component — there isn't one; if you're building a new admin screen with a table, check whether extracting one is now worth it rather than assuming it exists.

The admin SPA and the public frontend **share the same login page and the same `localStorage` token** — a user who logs in on `login.html` and has an admin/teacher role can navigate to `/admin/` and `ProtectedRoute` will recognize them without a second login.

## Authentication flow

JWT bearer-token auth, stateless, no server-side session store.

**Email/password login:**
1. `POST /api/auth/login` → `authService.loginUser()` → looks up the user, `bcrypt.compare()`s the password.
2. On success: `signToken(user._id)` signs a JWT (`{id: userId}`, `HS256`, 7-day expiry, secret from `JWT_SECRET`). No refresh-token mechanism — a token is valid for its full 7 days or until the user logs in again.
3. Response includes the token + a whitelisted user-payload object (`authService.userPayload()` — never the password hash, never internal fields).
4. Frontend stores both in `localStorage` (`AuthService.setToken`/`setUser`).
5. Every subsequent request attaches `Authorization: Bearer <token>` (`apiFetch`).

**Every authenticated request:** `middleware/auth.js` — verifies the JWT signature+expiry, loads the user fresh from the database (never trusts stale claims in the token beyond the user ID), rejects if the account is banned (even with a still-valid, unexpired token), auto-downgrades an expired premium plan, attaches the fresh user document to `req.user`.

**Google OAuth login:**
1. `GET /api/auth/google` — generates a random CSRF nonce, stores it in a short-lived httpOnly cookie scoped to this one path, redirects to Google with the nonce packed into the OAuth `state` param.
2. Google redirects back to `GET /api/auth/google/callback` — `verifyOAuthState` middleware checks the returned `state`'s nonce against the cookie (closes a login-CSRF/session-swap attack) *before* Passport exchanges the authorization code.
3. `authService.findOrCreateGoogleUser()` — links to an existing account by email, or creates a new one.
4. Same `signToken`/`userPayload` as local login, handed to the frontend via a redirect to `auth-callback.html?token=...` (the frontend immediately moves the token into `localStorage` and scrubs it from the URL/browser history).

**Password reset:** `forgot-password` → generates a 6-digit OTP (`crypto.randomInt`, not `Math.random`) → emails it → `verify-otp` (max 5 wrong guesses, atomically enforced to close a race-condition bypass) → `reset-password` with a short-lived (15-min) purpose-scoped reset JWT.

Full detail, including every security-audit finding closed in this flow: `docs/SECURITY.md`.

## Authorization flow

Three roles (`student`/`teacher`/`admin`) plus a separate `plan` field (`free`/`premium`) — role and plan are independent axes.

- **Role gating**: `middleware/auth.js` populates `req.user` → route-level `teacherOnly`/`adminOnly` middleware (`routes/admin/_shared.js`) checks `req.user.role`. `adminOnly` is strictly narrower than `teacherOnly` (e.g. destructive actions, user role/ban management are `adminOnly`).
- **Ownership scoping**: every route that returns or mutates a specific user's data filters by `{_id, userId: req.user._id}` at the query level (not fetch-then-compare-in-application-code) — this was specifically audited across all 36 route files with zero IDOR findings.
- **Premium gating**: `middleware/requirePremium.js`, checked server-side from `req.user.plan` (the DB-loaded, auto-expiry-checked value) — a client can never claim premium access via request body/headers.
- **Never trust the client for role/plan**: confirmed audited — no endpoint reads role or plan from anywhere except `req.user`.

## Request lifecycle

A request to any `/api/*` route passes through, in order (see `app.js`):

1. **Helmet** — security headers (CSP, HSTS, clickjacking protection), with `crossOriginResourcePolicy` deliberately relaxed to `cross-origin` since this API is called from a different origin by design.
2. **CORS** — exact-match origin allowlist (never wildcarded, even with `credentials:true`); rejections are logged (`logger.security`).
3. **compression**
4. **`express.json`/`express.urlencoded`** — body parsing, 20MB limit.
5. **`mongoSanitize`** — strips NoSQL-operator-shaped keys from the now-parsed body/query/params.
6. **passport.initialize()** — only if Google OAuth is configured.
7. **`/health/*`** — mounted before the API routes, unauthenticated, no rate limiting.
8. **The matched `/api/*` router** — its own middleware chain runs next: rate limiter (if the route is rate-limited) → `auth` (if the route requires it) → `teacherOnly`/`adminOnly`/`requirePremium` (if applicable) → controller.
9. **Controller** → **service** → **model/Mongoose** → response shaped and sent.
10. **404 handler** — if nothing matched.
11. **`errorHandler`** — global catch-all, always last.

Errors thrown anywhere in steps 8–9 either get caught locally (most routes' own `try/catch`, responding directly) or propagate to step 11.

## AI grading workflow

Three grading paths, all through `services/geminiService.js`, all wrapping the Gemini call with a timeout (`withTimeout`, 30–45s depending on task) and a shared error classifier (`classifyGeminiError` — detects quota/overload conditions and converts them into a friendly, non-crashing "AI is busy, try again" response instead of a raw error):

1. **Essay grading** (`checkEssay`) — full IELTS Writing Task 1/2 essays, band-descriptor rubric prompt, largest token budget.
2. **Speaking grading** (`checkSpeaking`) — transcript-based (client-side speech-to-text output, not audio — there is no server-side audio-upload-and-transcribe step).
3. **Task 2 sentence grading** (`gradeT2Question`) — per-sentence grading for `translation`/`error_correction`/`short_writing`/`paraphrase` question types; other Task 2 question types are graded deterministically (keyword/answer-key matching, no AI call) — see `docs/DATABASE.md`'s Task2Topic entry.

**Prompt-injection defense**: student-submitted text is wrapped in explicit `<<<START>>>`/`<<<END>>>` delimiters with a system-prompt instruction to treat everything between them as data, never as instructions — this was specifically verified in a security audit.

**Server-side re-grading**: as of a security-audit fix, every practice-save endpoint (reading/listening/writing/Task 1/Task 2) re-derives `isCorrect`/`score`/`xpEarned` from the real answer key server-side rather than trusting client-supplied grading fields — a client can no longer submit a fabricated 100% score. AI-graded question types are the one partial exception (re-running Gemini on every save would be costly and non-deterministic). One endpoint, `task2template/save`, sits outside this fix's scope entirely (different service/model pair) and still trusts client-supplied scores — see `docs/SECURITY.md` for the exact scope of the fix and this known gap.

**Cost control**: rate limiters on every AI-cost-incurring endpoint (`speaking/analyze`, `task2/check`, admin `ai-grade`), and the `/health` monitoring endpoint deliberately never makes a live Gemini call (key-presence check only) to avoid making a monitoring endpoint an unbounded-cost target.

## Database architecture

MongoDB Atlas, one database, 39 collections (Mongoose models). Full per-collection documentation (purpose, relationships, indexes, lifecycle, common queries): `docs/DATABASE.md`.

High-level shape:
- **Identity**: `User` (the only collection every other collection ultimately references via `userId`/`studentId`/etc.)
- **Content** (admin/teacher-authored, read by students): `Passage`, `ReadingTest`, `ListeningTest`, `ListeningSection`, `WritingExam`, `WritingTask1`, `WritingTask2`, `Task1Exercise`, `Task2Topic`, `Task2Template`, `SpeakingQuestion`, `SpeakingMaterial`, `WritingSample`, `WPTopic`/`WPLesson`/`WPExercise`, `Course`
- **Attempts** (student-generated, one per exam/practice session): `TestAttempt`, `ListeningAttempt`, `WritingAttempt`, `SpeakingAttempt`, `Task1Attempt`, `Task2Attempt`, `Task2TemplateAttempt`, `ReadingPracticeAttempt`, `ListeningPracticeAttempt`, `WritingPracticeAttempt` — several of these have TTL indexes (auto-delete after a retention window) rather than growing unbounded forever
- **Vocabulary**: `VocabBook`, `VocabUnit`, `VocabActivity`, `DifficultWord`
- **Operations**: `TuitionFee`, `TuitionSettings`, `UpgradeRequest`, `AccessKey` (currently orphaned — generated but never redeemed, see `docs/MAINTENANCE.md`), `Message` (in-app inbox), `WritingDraft`/`Task2Draft` (autosave)

**No transactions anywhere in the codebase** — every multi-document write either doesn't need cross-document atomicity, or (for the cases that do, like the OTP-attempt-lockout counter) uses a single atomic `findOneAndUpdate` instead of a multi-step transaction. Worth knowing before reaching for `session.startTransaction()` as a first instinct — check whether the simpler atomic-update pattern already covers the case.

## Deployment architecture

Two Render deployments (not three, despite three logical pieces — the admin SPA's build output ships as part of the public frontend's static-site deploy, not separately):

```
GitHub (main branch)
   │  auto-deploy on push
   ├──► Render Web Service  ── backend/ (Node, npm start)
   └──► Render Static Site  ── frontend/  (includes frontend/admin/, the built admin SPA)
```

No `render.yaml` — all service configuration (build/start commands, env vars, health-check path) lives in the Render dashboard, not version control. `.github/workflows/ci.yml` validates every push/PR (install, lint, test, build) but does not deploy anything — Render's own auto-deploy handles that, independently, once code lands on the tracked branch. Full detail, including the Health Check Path setting you need to have correct: `docs/DEPLOYMENT.md`.

## Dependency overview

**Backend runtime dependencies** (`backend/package.json`) and what each is for:

| Package | Purpose |
|---|---|
| `express` | HTTP framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT sign/verify |
| `bcryptjs` | Password hashing |
| `passport` + `passport-google-oauth20` | Google OAuth strategy |
| `cloudinary` + `streamifier` | File upload/storage |
| `@google/genai` | Gemini AI grading |
| `nodemailer` | Gmail SMTP email (password-reset OTP, notifications) — **known open CVEs, see `docs/SECURITY.md`** |
| `resend` | Alternate transactional-email provider |
| `helmet` | Security headers |
| `cors` | Cross-origin request handling |
| `express-rate-limit` | Brute-force/abuse protection |
| `express-mongo-sanitize` | Listed but not actually used — the app has its own hand-rolled `middleware/mongoSanitize.js` instead (see `docs/MAINTENANCE.md`) |
| `compression` | Response gzip |
| `multer` | Multipart file-upload parsing |
| `node-cron` | Scheduled jobs (tuition reminders) |
| `dotenv` | `.env` file loading |

**Backend dev dependencies**: `jest`, `supertest`, `mongodb-memory-server` (test infra), `eslint`/`@eslint/js`/`globals` (linting), `nodemon` (local dev auto-restart).

**Admin SPA dependencies**: `react`, `react-dom`, `react-router-dom`; dev: `vite`, `@vitejs/plugin-react`, `eslint` + plugins, `vitest`, `@testing-library/react`/`jest-dom`/`user-event`.

**Root-level**: `@playwright/test` only — exists solely to host the E2E toolchain; the actual apps live in their own `backend/`/`admin-src/` packages.
