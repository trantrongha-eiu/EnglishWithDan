# EnglishWithDan

An IELTS exam-preparation platform: full Reading/Listening/Writing/Speaking practice and mock-exam modules, AI-assisted grading, a teacher/admin back office, and a tuition-tracking system for a real English-teaching business (ieltsthayha.com).

This README is the front door. For anything deeper than "what is this and how do I run it," follow the links in [Documentation map](#documentation-map) below rather than looking for it here — each doc is the single source of truth for its topic, and duplicating them here would just create two places to go stale.

## Project philosophy

A few decisions run through the whole codebase and are worth knowing before you read anything else:

- **Layered backend, on purpose.** Routes are thin (HTTP concerns only), controllers shape requests/responses, services own all business logic and database access. This wasn't the original shape of the code — it was refactored into this form specifically so business logic could be unit-tested without spinning up Express, and so "where does X live" always has one answer. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- **No framework for the public frontend.** `frontend/` is plain HTML/CSS/JS with zero build step, on purpose — it's a content-heavy, SEO-relevant public site where a build pipeline would add cost without adding value. The admin back office (`admin-src/`), which *is* an interactive app with real state management needs, is React instead. Different tools for different jobs, not an accident of history.
- **Preserve behavior over cleanliness.** This codebase went through eleven prior hardening phases (testing, security, performance, production-readiness — see [History](#project-history-eleven-phases-of-hardening) below). The standing rule throughout was: never redesign UI/UX or change business logic without being asked, fix root causes not symptoms, verify every change against real behavior before calling it done. That discipline is why the app has ~500 automated tests and a real security posture today. Keep applying it.
- **Documentation must reflect the actual implementation.** Every doc in this repo was written by reading the real code, not from a spec or from memory of what it's "supposed" to do. If you change behavior, update the doc that describes it in the same PR — a wrong doc is worse than no doc.

## Technology stack

| Layer | Stack | Why |
|---|---|---|
| Backend API | Node.js, Express 5, Mongoose 9 (MongoDB) | Standard, well-understood, matches the team's existing skill set |
| Public frontend | Vanilla HTML/CSS/JS, no build step | Content-heavy public site; a build pipeline isn't earning its keep here |
| Admin back office | React 19, React Router 7, Vite | Genuinely interactive app (tables, forms, live data) — React's the right tool here, unlike the public site |
| Database | MongoDB Atlas | Document model fits the app's varied content shapes (exam questions, question groups, attempts) well |
| File storage | Cloudinary | Avatars, listening audio, images, PDFs |
| AI grading | Google Gemini | Essay, speaking, and Task 2 sentence-level grading |
| Auth | JWT (bearer token) + optional Google OAuth | Stateless, works cleanly across the separately-deployed frontend/backend |
| Email | Gmail SMTP (nodemailer) or Resend | Password-reset OTP, grading notifications |
| Testing | Jest + Supertest + mongodb-memory-server (backend), Jest + jsdom (frontend), Vitest + React Testing Library (admin), Playwright (E2E) | See [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) |
| CI | GitHub Actions | See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |
| Hosting | Render (API + static sites), MongoDB Atlas, Cloudinary | See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |

Full dependency-by-dependency breakdown (what each package is for, not just that it's installed): [`docs/ARCHITECTURE.md` § Dependency Overview](docs/ARCHITECTURE.md#dependency-overview).

## Folder structure

```
EnglishWithDan/
├── backend/          Node/Express API — the only thing with a database connection
│   ├── app.js         Express app construction (no side effects — safe to import in tests)
│   ├── server.js       Production entry point (Mongo connect, seed, cron, listen)
│   ├── routes/          Thin HTTP-layer routers (routes/admin/ = admin-only sub-routes)
│   ├── controllers/    Request/response shaping, calls into services
│   ├── services/         All business logic + Mongoose queries live here
│   ├── models/            Mongoose schemas (see docs/DATABASE.md)
│   ├── middleware/     auth, error handling, rate limiting, input sanitization
│   ├── utils/                Shared helpers (logger, validation, band-score math, etc.)
│   ├── config/              Centralized environment-variable access
│   ├── errors/              Typed error hierarchy (AppError and subclasses)
│   ├── cron/                Scheduled jobs (tuition payment reminders)
│   ├── scripts/            One-off/seed scripts
│   └── tests/               Jest unit + integration + security test suites
├── frontend/         Public site — static HTML/CSS/JS, no build step
│   ├── *.html            One file per page
│   ├── js/                  Page-specific and shared (js/shared/) vanilla-JS modules
│   ├── css/                Stylesheets
│   ├── admin/              Built output of admin-src/ (generated, committed — see below)
│   └── tests/               Jest + jsdom tests for js/shared/
├── admin-src/        React admin SPA source (builds into frontend/admin/)
│   └── src/
│       ├── pages/            One component per admin screen
│       ├── components/    Shared/reusable UI (Pagination, ConfirmDialog, etc.)
│       ├── contexts/       Auth/Theme/Toast React contexts
│       ├── routes/          ProtectedRoute (auth+role gating)
│       └── utils/            api.js — the fetch wrapper every page uses
├── e2e/              Playwright end-to-end specs (run against a served build, not CI)
├── docs/             Everything in the documentation map below
└── .github/workflows/ci.yml   Install/lint/test/build on every push and PR
```

## Documentation map

**Understanding the system**
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — overall/frontend/backend/admin architecture, auth & authorization flow, request lifecycle, AI grading workflow, database architecture, deployment architecture
- [`docs/DATABASE.md`](docs/DATABASE.md) — every collection: purpose, relationships, indexes, lifecycle, common queries
- [`docs/API.md`](docs/API.md) and [`docs/API_ADMIN.md`](docs/API_ADMIN.md) — every backend endpoint: request, response, auth, permissions, validation, error responses

**Working on the code**
- [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) — local setup, environment variables, running/testing/building/deploying/debugging
- [`docs/CODING_STANDARDS.md`](docs/CODING_STANDARDS.md) — naming, folder conventions, service/controller responsibilities, error handling, logging, testing conventions
- [`docs/FEATURE_GUIDE.md`](docs/FEATURE_GUIDE.md) — step-by-step: adding a new API endpoint, page, React component, database model, AI feature, admin feature

**Operating the system**
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — how a push becomes a live deploy, rollback
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — health checks, logs, common operational tasks, secret rotation procedure
- [`docs/INCIDENT_RESPONSE.md`](docs/INCIDENT_RESPONSE.md) — severity classification and playbooks for the incidents most likely to actually happen here
- [`docs/BACKUP_RESTORE.md`](docs/BACKUP_RESTORE.md) — database/asset backup posture and disaster recovery
- [`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md) — every env var, what breaks without it
- [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md) — pre/post-release checklist
- [`docs/SECURITY.md`](docs/SECURITY.md) — authentication/authorization model, secret management, OWASP considerations, security checklist
- [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md) — versioning, dependency-update policy, known technical debt, roadmap

## Quick start

Full instructions with troubleshooting: [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md). The short version:

```bash
# Backend
cd backend && npm install && cp .env.example .env   # fill in real values
npm run dev

# Admin SPA (separate terminal)
cd admin-src && npm install && npm run dev

# Public frontend — any static file server, e.g.
npx http-server frontend -p 3000

# Run everything's tests from the repo root (no setup needed — isolated in-memory DB, mocked externals)
npm test
```

## Project history: eleven phases of hardening

This codebase didn't arrive in its current state by accident. It went through a structured, incremental hardening engagement:

1. **Backend architecture refactor** — routes→controllers→services layering, error-handling standardization
2. **Backend architecture audit** — verified the refactor, closed gaps
3. **Performance optimization** — query batching, indexing, `.lean()`, caching, N+1 elimination
4. **Performance audit** — verified the optimizations, found and fixed remaining hot paths
5. **Security hardening** — auth/authz, injection, XSS, secrets, rate limiting
6. **Security audit round 2** — deeper pass, found and fixed a critical business-logic-trust gap (client-supplied grading data)
7. **Security audit round 3** — OWASP-mapped verification pass on everything built so far
8. **Security audit round 4** — final verification; identified a still-unresolved credential leak requiring manual rotation (see [`docs/SECURITY.md`](docs/SECURITY.md))
9. **Automated testing architecture** — ~500 tests across backend/frontend/admin/E2E, CI-ready
10. **Production readiness** — structured logging, health checks, graceful shutdown, CI/CD, operational docs
11. **Production readiness audit** — verified the above, closed remaining gaps
12. **This phase** — documentation and developer experience

Each phase's findings were classified Critical/High/Medium/Low and verified against real behavior (live tests, not just code review) before being marked done. That verification discipline is worth preserving as the project grows.
