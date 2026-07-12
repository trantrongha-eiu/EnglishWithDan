# Admin API Reference

Every endpoint under `/api/admin` — mounted in `backend/app.js` via `app.use('/api/admin', require('./routes/admin'))`, which resolves to `backend/routes/admin/index.js`. That file does nothing but `router.use()` 17 sub-routers (see [Router Mounting](#router-mounting) below); every path in this doc is the sub-router's own path **prefixed with `/api/admin`** — e.g. `users.js`'s `router.get('/users', ...)` is `GET /api/admin/users`.

This directory was extracted, route-for-route and behavior-unchanged, from a single 2,700-line `backend/routes/admin.js` (125 routes across 27 hand-marked sections) into one file per domain. Unlike the rest of the backend, these routes do **not** go through the `controllers/`→`services/` layering described in [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) — request handling, validation, and Mongoose queries all live inline in the route handler. That's a known, deliberate exception (extraction preserved behavior; re-layering was out of scope), not an oversight.

For the general auth/authorization model (JWT bearer tokens, `req.user` population, role/plan semantics) see [`docs/ARCHITECTURE.md` § Authentication flow / Authorization flow](ARCHITECTURE.md#authentication-flow). This doc only covers what's specific to the admin surface.

## Permission model specific to this directory

Every route below requires, at minimum, the base `auth` middleware (valid JWT → fresh, non-banned `req.user`). On top of that, `backend/routes/admin/_shared.js` exports two role gates used throughout:

- **`teacherOnly`** — allows `role: 'teacher'` or `role: 'admin'`. **Also blocks `role: 'teacher'` outright for any HTTP `DELETE` request**, regardless of which route it's attached to (`_shared.js` comment: *"Teacher không được xóa nội dung"* — teachers are not allowed to delete content). This is baked into the middleware itself, not decided per-route. **Practical consequence, verified by reading every route in this directory: every `DELETE` route gated by `teacherOnly` is, in effect, admin-only** — a teacher passes the role check but is then rejected by the same middleware's method check. The per-route tables below call this out explicitly on every affected `DELETE`/`PATCH`-as-delete route so it isn't mistaken for a plain "teacherOnly" grant.
- **`adminOnly`** — allows `role: 'admin'` only.

**Findings from an independent re-read of all 125 routes in this directory (this phase, not carried over from a prior audit's claims):**
- **No route under `/api/admin` is missing role gating.** Every single route has at least `auth` plus an explicit role check. There is no endpoint reachable by an authenticated `student`.
- **Two routes deliberately bypass the shared middleware and inline their own role+ownership check instead**, and are worth flagging so they aren't mistaken for a gap: `PATCH /api/admin/keys/:id/deactivate` and `DELETE /api/admin/keys/:id` (both in `accessKeys.js`) use bare `auth` in their middleware chain, then check `req.user.role` by hand inside the handler. This is intentional — `teacherOnly` would either block every teacher from deactivating/deleting a key (via its blanket DELETE-blocks-teacher rule) or require restructuring the shared middleware, and the actual desired rule is finer-grained: a teacher may deactivate/delete a key **they created**, but not one created by someone else; an admin may act on any key. The code comment in `accessKeys.js` states this explicitly. Net effect is still fully gated — no unauthenticated or student access — just via inline logic instead of the shared helper. See the [Access Keys](#access-keys) section for the exact per-route logic.
- **Routes correctly scoped to `adminOnly` beyond the obvious (user delete/ban/role-change)**: `GET /api/admin/db-status` (exposes MongoDB Atlas storage/index size — infra-level detail, not a teaching-workflow need); all four routes in `billing.js` (`PUT /users/:id/plan`, and all three `upgrade-requests` routes) because they directly grant or revoke paid access — a financial action; `POST /api/admin/reseed-task2-week12` and `POST /api/admin/fix-task1-context` in `task2Topics.js` because they are one-off, destructive maintenance scripts (delete-then-reinsert / bulk-mutate content) rather than routine content editing.

No route in this directory is rate-limited except `POST /writing-attempts/:id/ai-grade` (see [Writing Grading (AI)](#writing-grading-ai)) — the one endpoint that calls the Gemini API with the system's largest prompt.

## Table of contents
- [Shared Middleware & Helpers (`_shared.js`)](#shared-middleware--helpers-_sharedjs)
- [Router Mounting (`index.js`)](#router-mounting)
- [Users](#users)
- [Billing / Upgrade Requests](#billing--upgrade-requests)
- [Stats](#stats)
- [Access Keys](#access-keys)
- [Delete Exam Attempts](#delete-exam-attempts)
- [Messages](#messages)
- [Writing Grading (AI)](#writing-grading-ai)
- [Vocab Analytics](#vocab-analytics)
- [Passages / Reading Tests / Listening Tests](#passages--reading-tests--listening-tests)
- [Writing Content](#writing-content)
- [Writing Practice (WP)](#writing-practice-wp)
- [Writing Samples (PDF)](#writing-samples-pdf)
- [Task 1 Exercises](#task-1-exercises)
- [Task 2 Topics](#task-2-topics)
- [Task 2 Templates](#task-2-templates)
- [Speaking](#speaking)
- [Courses](#courses)

---

## Shared Middleware & Helpers (`_shared.js`)

No endpoints — this file exports the building blocks every other file in this directory imports. Documented here once rather than repeated per-route.

- **`teacherOnly(req, res, next)`** — 403s unless `req.user.role` is `teacher` or `admin`; additionally 403s any `teacher` on `req.method === 'DELETE'` (see [Permission model](#permission-model-specific-to-this-directory) above).
- **`adminOnly(req, res, next)`** — 403s unless `req.user.role === 'admin'`.
- **`escapeRegex(s)`** — escapes regex metacharacters before interpolating user search input into a MongoDB `$regex` filter (ReDoS/regex-injection defense for every admin search box).
- **`effectiveStreak(learningStreak, lastActivityDate)`** — recomputes a user's displayed streak (Vietnam UTC+7 day boundary) without writing to the DB; used by `vocab-students`.
- **`uploadImageDataUri(imageBase64, folder)`** / **`uploadPdfBuffer(buffer, folder)`** — Cloudinary upload helpers shared by every route that accepts an inline image or PDF.
- **`uploadPdfMemory`** — a `multer` instance (memory storage, 50MB limit, PDF-mimetype-only `fileFilter`) used by the two `upload-pdf` multipart routes (`speaking/materials/upload-pdf`, `writing/samples/upload-pdf`).

## Router Mounting (`index.js`)

No endpoints — mounts the 17 route-bearing files below onto one router, in this order (comment in the source file preserves the original 27-section order from the pre-split `admin.js`):

```
router.use(require('./passages'));         // Passages, Reading Tests, Listening Tests dropdown
router.use(require('./accessKeys'));       // Access Keys
router.use(require('./stats'));            // Stats, db-status, history, recent-attempts, listening-history
router.use(require('./writingContent'));   // Writing Tests dropdown, Writing Exams, Writing History, Task1/Task2 pools
router.use(require('./speaking'));         // Speaking Questions, Materials, History
router.use(require('./writingSamples'));   // Writing Samples (PDF)
router.use(require('./users'));            // User Management, Online Users
router.use(require('./courses'));          // Courses
router.use(require('./attempts'));         // Delete Exam Attempts
router.use(require('./writingGrading'));   // Writing AI Grading
router.use(require('./vocabAnalytics'));   // Vocab Student Analytics
router.use(require('./writingPracticeWP')); // Writing Practice (WP) Topics/Exercises/Attempts
router.use(require('./task1Exercises'));   // Task 1 Exercises CRUD
router.use(require('./task2Topics'));      // Task 2 Topics CRUD + maintenance endpoints
router.use(require('./task2Templates'));   // Task 2 Templates CRUD
router.use(require('./messages'));         // Messages
router.use(require('./billing'));          // Plan Management, Upgrade Requests
```

Since every file's routes are string-literal paths (no overlapping wildcard segments), mount order has no observable effect on routing here — it's preserved purely for diff-minimality against the pre-split file.

---

## Users

`backend/routes/admin/users.js` — 7 endpoints. `GET`s are `teacherOnly`; every mutation (`POST`, `PUT`, ban, `DELETE`) is `adminOnly` — user management is deliberately admin-only beyond read access, since it includes password resets, role changes, and permanent deletion.

### GET /api/admin/users
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Query params: `search` (matches username/email/firstName/lastName, case-insensitive), `role` (`student`\|`teacher`\|`admin`), `isBanned` (`'true'`\|`'false'`), `page` (default 1), `limit` (default 50)

**Response** (realistic example)
```json
{
  "success": true,
  "users": [
    { "_id": "665f1...", "username": "hoa_nguyen", "email": "hoa@example.com", "role": "student", "isBanned": false, "plan": "free", "createdAt": "2026-01-10T03:00:00.000Z" }
  ],
  "total": 214,
  "page": 1,
  "limit": 50
}
```

**Validation**
- None on query params — invalid `role`/`isBanned` values just fail to match any documents rather than erroring.

**Error responses**
- `401` — missing/invalid/expired token (`auth`)
- `403` — role not `teacher`/`admin`
- `500` — unexpected DB error (`{success:false, message: err.message}`)

---

### GET /api/admin/users/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Path params: `id` — Mongo `_id` of the target user

**Response**
```json
{ "success": true, "user": { "_id": "665f1...", "username": "hoa_nguyen", "email": "hoa@example.com", "role": "student", "plan": "free", "isBanned": false } }
```

**Validation**
- None beyond a valid ObjectId shape (an invalid ObjectId throws a CastError, caught and returned as a 500).

**Error responses**
- `401`, `403` — as above
- `404` — no user with that `_id`
- `500` — includes malformed ObjectId (CastError message leaks into `message`)

---

### POST /api/admin/users
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- Body:
```json
{ "username": "new_teacher", "email": "teacher@example.com", "password": "TempPass123!", "role": "teacher", "firstName": "Minh", "lastName": "Tran" }
```
(`role` defaults to `'student'`, `firstName`/`lastName` default to `''` if omitted)

**Response**
```json
{ "success": true, "user": { "_id": "665f2...", "username": "new_teacher", "email": "teacher@example.com", "role": "teacher" }, "message": "Đã tạo tài khoản thành công." }
```

**Validation**
- `username`, `email`, `password` required (400 if any missing).
- Uniqueness check: rejects if a user with that `email` OR `username` already exists (400, before insert — not just relying on the Mongoose unique index).
- Password is `bcrypt.hash`ed (cost 10) before storage; the response strips `password` from the returned object.
- Creation is logged via `logger.security('Admin created a user account', ...)` (actor + target + role — audit trail).

**Error responses**
- `401`, `403`
- `400` — missing required field, or duplicate username/email
- `500` — unexpected error

---

### PUT /api/admin/users/:id
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- Path params: `id`
- Body:
```json
{ "username": "hoa_nguyen", "email": "hoa@example.com", "firstName": "Hoa", "lastName": "Nguyen", "role": "teacher", "isBanned": false, "newPassword": "NewPass456!" }
```
(`newPassword` optional — only set if the admin wants to force-reset the password; all other fields overwrite unconditionally, including with `undefined` if omitted from the body)

**Response**
```json
{ "success": true, "user": { "_id": "665f1...", "username": "hoa_nguyen", "role": "teacher", "isBanned": false } }
```

**Validation**
- `runValidators: true` on the update — Mongoose schema constraints (e.g. `role` enum) are enforced.
- If `newPassword` is present, it's hashed before write.
- Role changes are logged via `logger.security('Admin changed a user role', ...)` — flagged in the code as privilege-escalation-relevant, added specifically because no audit trail existed for this before a prior production-readiness audit.
- **Note:** since `username`, `email`, `firstName`, `lastName`, `role` are all pulled from `req.body` unconditionally (not defaulted to the existing value), sending a partial body without one of these fields will overwrite it with `undefined`, which Mongoose typically drops rather than nulling out existing data — but callers should send the full editable field set to avoid relying on that.

**Error responses**
- `401`, `403`
- `404` — no user with that `_id`
- `400` — schema validation failure (e.g. invalid `role` enum value) — caught and returned as 400, not 500, unlike most other routes in this directory

---

### PUT /api/admin/users/:id/ban
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- Path params: `id`
- Body:
```json
{ "isBanned": true, "banReason": "Chia sẻ tài khoản cho người khác" }
```

**Response**
```json
{ "success": true, "user": { "_id": "665f1...", "isBanned": true, "banReason": "Chia sẻ tài khoản cho người khác" }, "message": "Đã cấm tài khoản" }
```

**Validation**
- None on `isBanned`'s type (truthy/falsy coercion happens downstream, e.g. in `middleware/auth.js`'s `if (user.isBanned)` check on the user's *next* request).
- Unbanning (`isBanned: false`) clears `banReason` to `''` regardless of what was sent.
- Logged via `logger.security` as `'Admin banned a user'` / `'Admin unbanned a user'`.
- A banned user's **existing, still-unexpired JWT is rejected on their next request** by `middleware/auth.js` (see [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)) — there's no separate token-revocation step needed here.

**Error responses**
- `401`, `403`
- `404` — no user with that `_id`
- `500` — unexpected error

---

### DELETE /api/admin/users/:id
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- Path params: `id`

**Response**
```json
{ "success": true, "message": "Đã xóa tài khoản" }
```

**Validation**
- Self-deletion guard: 400 if `req.params.id === req.user._id.toString()` — an admin cannot delete their own account through this endpoint.
- Hard delete (`findByIdAndDelete`) — no soft-delete/undo. Does **not** cascade-delete the user's attempts/vocab books/messages in other collections.
- Logged via `logger.security('Admin deleted a user account', ...)`.
- No existence check before delete — deleting a nonexistent `id` still returns `200`/success (Mongoose's `findByIdAndDelete` resolves to `null` without throwing, and the route doesn't branch on that).

**Error responses**
- `401`, `403`
- `400` — attempting to delete your own account
- `500` — unexpected error (e.g. malformed ObjectId)

---

### GET /api/admin/online-users
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- None

**Response**
```json
{ "success": true, "count": 3, "users": [ { "username": "hoa_nguyen", "role": "student", "lastSeen": "2026-07-12T07:58:00.000Z" } ] }
```

**Validation**
- "Online" = `lastSeen` within the last 5 minutes. `lastSeen` is updated on every authenticated request by `middleware/auth.js` (fire-and-forget), so this is a rolling window, not a websocket-based presence system.

**Error responses**
- `401`, `403`
- `500` — unexpected error

---

## Billing / Upgrade Requests

`backend/routes/admin/billing.js` — 4 endpoints, **all `adminOnly`**. Every route here either grants premium access directly or approves/rejects a paid-upgrade request — a financial action, so `teacherOnly` was never on the table.

### PUT /api/admin/users/:id/plan
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- Path params: `id`
- Body:
```json
{ "plan": "premium", "months": 3 }
```

**Response**
```json
{ "success": true, "user": { "_id": "665f1...", "username": "hoa_nguyen", "email": "hoa@example.com", "plan": "premium", "planExpiresAt": "2026-10-12T00:00:00.000Z", "role": "student" } }
```

**Validation**
- `plan` must be `'free'` or `'premium'` (400 otherwise).
- Granting premium with `months` extends from the user's **existing** `planExpiresAt` if they already have unexpired premium (via `computePlanExpiry`, `utils/plan.js`), not from "now" — so re-upgrading a still-premium user stacks time rather than resetting it. Granting premium without `months` leaves `planExpiresAt` unchanged.
- Setting `plan: 'free'` always nulls `planExpiresAt`/`planStartedAt`, regardless of `months`.
- Response is field-limited (`.select('username email plan planExpiresAt role')`) — no password hash or other sensitive fields.

**Error responses**
- `401`, `403`
- `400` — invalid `plan` value
- `404` — no user with that `_id`
- `500` — unexpected error

---

### GET /api/admin/upgrade-requests
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- Query params: `status` (`pending`\|`approved`\|`rejected`), `page` (default 1), `limit` (default 30)

**Response**
```json
{
  "success": true,
  "requests": [
    { "_id": "665f3...", "userId": { "_id": "665f1...", "username": "hoa_nguyen", "plan": "free" }, "months": 3, "amount": 450000, "status": "pending", "createdAt": "2026-07-10T02:00:00.000Z" }
  ],
  "total": 12
}
```

**Validation**
- None on `status` beyond matching the schema enum (`pending`\|`approved`\|`rejected`) — an invalid value just matches nothing.

**Error responses**
- `401`, `403`
- `500` — unexpected error

---

### PUT /api/admin/upgrade-requests/:id/approve
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- Path params: `id`
- Body:
```json
{ "adminNote": "Đã xác nhận chuyển khoản" }
```

**Response**
```json
{ "success": true, "message": "Đã nâng cấp Premium cho hoa_nguyen đến 12/10/2026" }
```

**Validation**
- 404 if the request doesn't exist; 400 if `request.status !== 'pending'` (an already-approved/rejected request can't be re-approved — the `UpgradeRequest` model also has a unique partial index enforcing at most one `pending` request per user, but that's a separate DB-level guard, not what this check does).
- On approval: sets the user's `plan: 'premium'`, extends `planExpiresAt` via `computePlanExpiry` (stacks onto existing unexpired premium, same as the direct plan-grant route above), sets `planStartedAt: new Date()`.
- Records `reviewedBy: req.user._id` and `reviewedAt` on the request — an audit trail of which admin approved it.

**Error responses**
- `401`, `403`
- `404` — request not found
- `400` — request already reviewed (not `pending`)
- `500` — unexpected error

---

### PUT /api/admin/upgrade-requests/:id/reject
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- Path params: `id`
- Body:
```json
{ "adminNote": "Chưa nhận được thanh toán" }
```

**Response**
```json
{ "success": true, "message": "Đã từ chối yêu cầu" }
```

**Validation**
- Same `404`/`400`-if-not-pending guard as approve. Rejection does **not** touch the user's plan at all — it only updates the request's own `status`/`adminNote`/`reviewedBy`/`reviewedAt`.

**Error responses**
- `401`, `403`
- `404` — request not found
- `400` — request already reviewed
- `500` — unexpected error

---

## Stats

`backend/routes/admin/stats.js` — 5 endpoints, all read-only. `teacherOnly` except `db-status`, which is `adminOnly` since it exposes MongoDB Atlas infrastructure detail (storage/index byte counts against the M0 free-tier 512MB cap) rather than teaching-relevant data.

### GET /api/admin/stats
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- None

**Response**
```json
{
  "success": true,
  "stats": {
    "totalStudents": 214, "totalTeachers": 3, "bannedUsers": 2, "newUsersThisWeek": 11,
    "totalReadingAttempts": 540, "readingFullCount": 320, "readingPracticeCount": 220,
    "totalListeningAttempts": 410, "listeningFullCount": 210, "listeningPracticeCount": 200,
    "totalWritingAttempts": 180, "writingFullCount": 90, "writingPracticeCount": 90,
    "avgReadingBand": "6.5", "avgListeningBand": "6.0",
    "passageCount": 45, "vocabUnitCount": 12
  }
}
```

**Validation**
- None (aggregate counts only, no user input).

**Error responses**
- `401`, `403`
- `500` — unexpected error

---

### GET /api/admin/db-status
**Auth:** Bearer token required
**Permissions:** adminOnly
**Rate limit:** none

**Request**
- None

**Response**
```json
{
  "success": true,
  "db": { "usedBytes": 214748364, "limitBytes": 536870912, "usedMB": 204.8, "limitMB": 512, "usedPct": 40.0, "dataSize": 180000000, "storageSize": 200000000, "indexSize": 14748364, "collections": 37, "objects": 152300 }
}
```

**Validation**
- None; runs `mongoose.connection.db.command({ dbStats: 1 })` directly against the live connection.

**Error responses**
- `401`, `403`
- `500` — unexpected error (e.g. Mongo connection issue)

---

### GET /api/admin/history
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- None (fixed to the 50 most recent completed Reading attempts)

**Response**
```json
{ "success": true, "history": [ { "_id": "665f4...", "userId": { "_id": "665f1...", "username": "hoa_nguyen", "displayName": "Hoa Nguyen" }, "testId": { "name": "Orange Test 20", "testNumber": 20 }, "bandScore": 6.5, "endTime": "2026-07-11T09:00:00.000Z" } ] }
```

**Validation**
- Excludes `answers`/`passagesUsed` fields from the response (`.select('-answers -passagesUsed')`) — full answer content isn't needed for a summary list.
- `userId.displayName` is computed server-side from `firstName`/`lastName` (falling back to `username`, then `'–'`) so the admin UI doesn't need to duplicate that logic.

**Error responses**
- `401`, `403`
- `500` — unexpected error

---

### GET /api/admin/recent-attempts
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Query params: `limit` (default 80, hard-capped at 300)

**Response**
```json
{ "success": true, "attempts": [ { "_id": "665f5...", "skill": "writing", "testName": "Academic Writing Test 1", "userId": { "displayName": "Hoa Nguyen" }, "date": "2026-07-11T10:00:00.000Z", "bandScore": 6.0, "correctCount": null, "totalQuestions": null, "duration": null } ] }
```

**Validation**
- Merges 8 different attempt collections (Reading, Listening, Writing, Listening-practice, Reading-practice, WP, Task1, Task2) into one unified, date-sorted feed, sliced to `limit * 3` after merging (an intentional overfetch so the sort-then-merge across sources doesn't under-represent any one skill in the final page).
- Every per-collection query is answer-content-excluded (`.select('-answers')`/`-task1Answer -task2Answer`/etc.) and individually wrapped in `.catch(() => [])` so one missing/broken collection doesn't 500 the whole endpoint.

**Error responses**
- `401`, `403`
- `500` — unexpected error (only if something outside the per-collection `.catch()`s throws)

---

### GET /api/admin/listening-history
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- None (fixed to the 100 most recent completed Listening attempts)

**Response**
```json
{ "success": true, "history": [ { "_id": "665f6...", "userId": { "username": "hoa_nguyen" }, "bandScore": 6.5, "submittedAt": "2026-07-11T09:30:00.000Z" } ] }
```

**Validation**
- Wrapped in an inner `try/catch` that swallows errors and returns `history: []` — a defensive holdover from when the `ListeningAttempt` model/collection might not exist yet in a given environment.

**Error responses**
- `401`, `403`
- `500` — only for errors outside the inner swallowed try/catch (effectively unreachable in normal operation)

---

## Access Keys

`backend/routes/admin/accessKeys.js` — 4 endpoints. `GET`/`POST` use `teacherOnly`; the two mutation routes below **deliberately bypass `teacherOnly`/`adminOnly`** in favor of inline role+ownership logic — see the [Permission model](#permission-model-specific-to-this-directory) section above for why. Access keys let a student redeem a one-time code for access to a specific test without a full account/enrollment flow; per `docs/ARCHITECTURE.md`, the `AccessKey` collection is currently generated-but-never-redeemed in practice (flagged there as orphaned functionality).

### GET /api/admin/keys
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- None

**Response**
```json
{
  "success": true,
  "keys": [
    { "_id": "665f7...", "key": "A1B2-C3D4", "testType": "reading", "testId": { "_id": "665f8...", "name": "Orange Test 20" }, "createdBy": { "username": "teacher_minh" }, "maxUses": 1, "currentUses": 0, "isActive": true, "isValid": true, "expiresAt": null }
  ]
}
```

**Validation**
- Scoping: `admin` sees every key; `teacher` only sees keys where `createdBy === req.user._id`.
- `testId` is manually resolved (not a Mongoose `.populate()`) because it uses a dynamic `refPath` virtual that only real (non-virtual) populate can't resolve directly — the route batch-fetches per test-type model instead of one `findById` per key, to avoid N+1 queries.

**Error responses**
- `401`, `403`
- `500` — unexpected error

---

### POST /api/admin/keys/generate
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Body:
```json
{ "count": 5, "testId": "665f8...", "testType": "reading", "expiryDays": 30, "maxUses": 1 }
```
(all fields optional except that `count` defaults to 1, `testType` defaults to `null` meaning "any test", `maxUses` defaults to 1)

**Response**
```json
{ "success": true, "keys": ["A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6", "Q7R8-S9T0"] }
```

**Validation**
- `count` must be between 1 and 100 (400 otherwise).
- `testType` must be one of `'reading'`, `'listening'`, `'writing'`, or `null` (400 otherwise) — note `'speaking'` is a valid schema enum value on the model but is **not** in this route's `validTypes` allowlist, so generating a speaking-scoped key isn't currently possible through this endpoint.
- Each key is `crypto.randomBytes(4)` hex, formatted `XXXX-XXXX` — not sequential/guessable.
- `createdBy` is always `req.user._id` — a teacher can only ever generate keys attributed to themselves.

**Error responses**
- `401`, `403`
- `400` — `count` out of range, or invalid `testType`
- `500` — unexpected error

---

### PATCH /api/admin/keys/:id/deactivate
**Auth:** Bearer token required
**Permissions:** Inline role check (not `teacherOnly`/`adminOnly`) — `teacher` or `admin`, **and** if the caller is a `teacher`, the key's `createdBy` must equal `req.user._id`. Deliberately not using the shared `teacherOnly` middleware: that middleware blocks every `DELETE` for role `teacher`, but a teacher **is** allowed to deactivate a key they created — only cross-teacher/cross-admin key access is blocked, and it's blocked by the ownership check below, not by role alone.
**Rate limit:** none

**Request**
- Path params: `id`

**Response**
```json
{ "success": true, "message": "Đã vô hiệu hoá key" }
```

**Validation**
- 403 if role isn't `teacher`/`admin`. 404 if the key doesn't exist. 403 (distinct message) if a `teacher` targets a key they didn't create. `admin` bypasses the ownership check entirely.

**Error responses**
- `401` — no/invalid token
- `403` — role not teacher/admin, or teacher targeting another user's key
- `404` — key not found
- `500` — unexpected error

---

### DELETE /api/admin/keys/:id
**Auth:** Bearer token required
**Permissions:** Inline role check (not `teacherOnly`/`adminOnly`) — same rule as deactivate above: `teacher` or `admin`, with a `teacher` restricted to keys they created. Same intentional deviation from `teacherOnly` for the same reason (a teacher must be allowed to delete their own keys; `teacherOnly` would block all teachers from any `DELETE`).
**Rate limit:** none

**Request**
- Path params: `id`

**Response**
```json
{ "success": true, "message": "Đã xóa key" }
```

**Validation**
- Same 404/ownership logic as deactivate. This is a hard delete (`findByIdAndDelete`), no soft-delete.

**Error responses**
- `401`, `403` (role or ownership), `404`, `500`

---

## Delete Exam Attempts

`backend/routes/admin/attempts.js` — 8 endpoints, one `DELETE` per attempt-type collection, all `teacherOnly`. **Per the DELETE-blocks-teacher rule in `_shared.js`, every route in this file is effectively admin-only in practice** — a `teacher` account passes the initial role check but is then rejected by the same `teacherOnly` middleware because the method is `DELETE`. All 8 follow an identical pattern: hard-delete by `_id`, 404 if not found, no cascade to related data (e.g. deleting a `TestAttempt` doesn't touch the student's XP/streak that attempt may have contributed to).

### DELETE /api/admin/attempts/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only — see note above; deletes a Reading `TestAttempt`)
**Rate limit:** none

**Request**
- Path params: `id`

**Response**
```json
{ "success": true, "message": "Đã xóa bài thi Reading" }
```

**Validation**
- 404 if no `TestAttempt` with that `_id`.

**Error responses**
- `401`, `403` (non-admin, including teachers — see note above), `404`, `500`

---

### DELETE /api/admin/listening-attempts/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only; deletes a `ListeningAttempt`)
**Rate limit:** none

**Request** / **Response** / **Validation** / **Error responses** — identical shape to `DELETE /attempts/:id` above, targeting `ListeningAttempt`. Response message: `"Đã xóa bài thi Listening"`.

---

### DELETE /api/admin/writing-attempts/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only; deletes a `WritingAttempt`)
**Rate limit:** none

**Request** / **Response** / **Validation** / **Error responses** — same shape, targeting `WritingAttempt`. Response message: `"Đã xóa bài nộp Writing"`. Note this is a different collection/route from the AI-grading endpoints in [Writing Grading (AI)](#writing-grading-ai), which operate on `WritingAttempt` documents too but don't delete them.

---

### DELETE /api/admin/listening-practice-attempts/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only; deletes a `ListeningPracticeAttempt`)
**Rate limit:** none

**Request** / **Response** / **Validation** / **Error responses** — same shape. Response message: `"Đã xóa bài luyện Listening"`.

---

### DELETE /api/admin/reading-practice-attempts/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only; deletes a `ReadingPracticeAttempt`)
**Rate limit:** none

**Request** / **Response** / **Validation** / **Error responses** — same shape. Response message: `"Đã xóa bài luyện Reading"`.

---

### DELETE /api/admin/writing-practice-attempts/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only; deletes a `WritingPracticeAttempt`)
**Rate limit:** none

**Request** / **Response** / **Validation** / **Error responses** — same shape. Response message: `"Đã xóa bài luyện Writing"`. Distinct from the `wp-attempts` delete route in [Writing Practice (WP)](#writing-practice-wp) below — that one also deletes `WritingPracticeAttempt` documents; the two routes are functionally redundant duplicates left over from the pre-split single file (worth flagging as consolidation debt, not a bug).

---

### DELETE /api/admin/task1-attempts/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only; deletes a `Task1Attempt`)
**Rate limit:** none

**Request** / **Response** / **Validation** / **Error responses** — same shape. Response message: `"Đã xóa bài Task 1"`.

---

### DELETE /api/admin/task2-attempts/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only; deletes a `Task2Attempt`)
**Rate limit:** none

**Request** / **Response** / **Validation** / **Error responses** — same shape. Response message: `"Đã xóa bài Task 2"`.

---

## Messages

`backend/routes/admin/messages.js` — 3 endpoints, all `teacherOnly`, all scoped to messages the calling teacher/admin themselves sent (`fromId: req.user._id`) — one teacher cannot read or delete another teacher's sent messages.

### GET /api/admin/messages
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Query params: `page` (default 1), `limit` (default 20)

**Response**
```json
{ "success": true, "messages": [ { "_id": "665fa...", "toId": { "username": "hoa_nguyen" }, "subject": "Nhắc nhở học phí", "body": "...", "isBroadcast": false, "createdAt": "2026-07-11T08:00:00.000Z" } ], "total": 34 }
```

**Validation**
- Hard-scoped server-side to `fromId: req.user._id` — a teacher only ever sees messages they personally sent, never another teacher's.

**Error responses**
- `401`, `403`, `500`

---

### POST /api/admin/messages
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Body:
```json
{ "toId": "665f1...", "subject": "Nhắc nhở học phí", "body": "Em nhớ đóng học phí trước ngày 15 nhé.", "isBroadcast": false }
```
(for a broadcast to all students: `{ "isBroadcast": true, "body": "..." }` — `toId` is ignored/nulled when `isBroadcast` is true)

**Response**
```json
{ "success": true, "message": { "_id": "665fb...", "fromId": "665f0...", "fromName": "teacher_minh", "toId": "665f1...", "subject": "Nhắc nhở học phí", "body": "Em nhớ đóng học phí trước ngày 15 nhé.", "isBroadcast": false } }
```

**Validation**
- `body` required and non-blank (400 if empty/whitespace-only after `.trim()`).
- If not `isBroadcast`, `toId` is required (400 otherwise).
- `subject`/`body` are trimmed before storage.

**Error responses**
- `401`, `403`
- `400` — empty body, or missing recipient for a non-broadcast message
- `500` — unexpected error

---

### DELETE /api/admin/messages/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly. Per the DELETE-blocks-teacher rule, this is effectively admin-only regardless of the sender-scoping below.
**Rate limit:** none

**Request**
- Path params: `id`

**Response**
```json
{ "success": true }
```

**Validation**
- `findOneAndDelete({ _id, fromId: req.user._id })` — scoped so even in a hypothetical world where a teacher reached this handler, they could only delete their own sent messages, never another sender's. No 404 is returned if the id doesn't match or belongs to someone else — the response is unconditionally `{success:true}` either way, which is a minor inconsistency with the rest of the file (worth knowing if building a UI that expects a 404 signal on a bad id).

**Error responses**
- `401`, `403`
- `500` — unexpected error (not 404 — see note above)

---

## Writing Grading (AI)

`backend/routes/admin/writingGrading.js` — 2 endpoints, both `teacherOnly`. This is the only file in the entire `routes/admin/` directory with a rate limiter, because `ai-grade` calls Gemini with the largest prompt in the system (full IELTS band-descriptor rubric, `maxOutputTokens: 8192`).

### POST /api/admin/writing-attempts/:id/ai-grade
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** `aiGradeLimiter` — 60 requests per 15 minutes, keyed by `req.user._id` (falls back to IP if unauthenticated, though `auth` already runs first so that fallback is effectively dead code here). **Skipped entirely for `role === 'admin'`** (`skip: req => req.user?.role === 'admin'`) — admins are not rate-limited on this endpoint.

**Request**
- Path params: `id` — the `WritingAttempt` `_id`
- Body:
```json
{ "taskNum": 1 }
```

**Response** (realistic example)
```json
{
  "success": true,
  "taskNum": 1,
  "result": {
    "bandScore": 6.0,
    "ta": { "score": 6, "comment": "Em đã bao quát các yêu cầu chính..." },
    "cc": { "score": 6, "comment": "..." },
    "lr": { "score": 6, "comment": "..." },
    "gra": { "score": 6, "comment": "..." },
    "overallFeedback": "Bài viết của em đã đáp ứng yêu cầu cơ bản...",
    "sentenceFeedback": [ { "type": "ok", "original": "The chart shows..." }, { "type": "issue", "original": "There is a increase...", "criterion": "GRA", "issue": "Thiếu mạo từ 'an' trước 'increase'.", "better": "There is an increase..." } ]
  }
}
```

**Validation**
- `taskNum` must be `1` or `2` (400 otherwise) — grades one task per call by design, specifically to keep individual requests cheap against the rate limit rather than grading both tasks (and doubling Gemini cost) in one call.
- 404 if the `WritingAttempt` doesn't exist.
- The Gemini prompt embeds **mandatory, server-enforced penalties** that override the AI's own score if it doesn't apply them: Task Achievement/Response capped at Band 5 for under-length essays (< 150 words for Task 1, < 250 for Task 2), capped at Band 4 for an essay that doesn't end in `.`/`!`/`?` (treated as cut off mid-sentence). These are re-applied server-side after the Gemini call (`if (isIncomplete && result.ta.score > 4) result.ta.score = 4`, etc.) as a safety net in case the model ignores the prompt instruction.
- `bandScore` is always recalculated server-side as the average of the 4 criterion scores rounded to the nearest 0.5 — the value Gemini returns for `bandScore` in its JSON is explicitly ignored (prompt says so, and the code recomputes it regardless).
- Result is persisted to `WritingAttempt.aiGrading.task1`/`task2` and `gradingStatus: 'ai_done'` — this is a draft/AI-suggested grade, not yet shown to the student; see `confirm-grade` below for the step that finalizes it.

**Error responses**
- `401`, `403`
- `400` — invalid `taskNum`
- `404` — attempt not found
- `429` — rate limit exceeded (non-admin only) — `{"success":false,"message":"Quá nhiều yêu cầu chấm AI, vui lòng thử lại sau 15 phút."}`, also logged via `logger.security`
- `503` — Gemini reports itself overloaded/at quota (`err.isOverloaded`, from `geminiService.js`'s error classifier) — a friendly "AI is busy" signal distinct from a generic failure
- `500` — any other Gemini/unexpected error

---

### PUT /api/admin/writing-attempts/:id/confirm-grade
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Path params: `id`
- Body:
```json
{ "task1": { "score": 6, "comment": "..." }, "task2": { "score": 6.5, "comment": "..." }, "overallBand": 6.0, "adminNote": "Cố gắng viết dài hơn ở Task 2 nhé." }
```
(the teacher edits/confirms the AI-suggested `task1`/`task2` grading objects from `ai-grade` above, or supplies their own from scratch — this endpoint doesn't require `ai-grade` to have run first)

**Response**
```json
{ "success": true, "message": "Đã xác nhận điểm" }
```

**Validation**
- No structural validation of `task1`/`task2`/`overallBand` shape — whatever is sent is written directly into `WritingAttempt.grading`.
- Sets `gradingStatus: 'confirmed'` and `feedbackRead: false` (so the student sees an unread-feedback notification).
- **Side effect (fire-and-forget, after the response is already sent):** if `EMAIL_USER`/`EMAIL_PASS` are configured, emails the student their band score via Gmail SMTP, wrapped in `setImmediate` specifically so a mail-send failure can never surface as a request error (the response has already gone out by the time this runs) — logged to `console.error` only, not `logger`. User-supplied `displayName`/`adminNote` are HTML-escaped (`escapeHtml`) before interpolation into the email template, closing an XSS-in-email vector.

**Error responses**
- `401`, `403`
- `500` — unexpected error (note: an email-send failure after the response is sent can never produce an HTTP error status, by design — the response has already been returned as success)

---

## Vocab Analytics

`backend/routes/admin/vocabAnalytics.js` — 3 endpoints, all `teacherOnly`, all read-only.

### GET /api/admin/vocab-books/:userId
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Path params: `userId`

**Response**
```json
{ "success": true, "books": [ { "_id": "665fc...", "name": "IELTS Core", "emoji": "📘", "isDefault": true, "totalWords": 120, "daThucCount": 40, "nhoSoSoCount": 30, "chuaThuocCount": 50 } ] }
```

**Validation**
- None on `userId` beyond ObjectId shape (invalid shape → CastError → 500).

**Error responses**
- `401`, `403`, `500`

---

### GET /api/admin/vocab-students
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Query params: `search`, `sort` (`words-desc`\|`views-desc`\|`recent`\|`name`, default `words-desc`), `page`/`limit` (both optional — pagination is opt-in; omitting both returns the full list)

**Response**
```json
{ "success": true, "students": [ { "_id": "665f1...", "username": "hoa_nguyen", "learningStreak": 5, "totalWords": 120, "totalViews": 340, "activeDays": 18, "lastVocabActivity": "2026-07-11T08:00:00.000Z" } ] }
```
(when `page`/`limit` are both provided: `{ "success": true, "students": [...], "total": 214, "page": 1, "totalPages": 5 }`)

**Validation**
- Filters `role: 'student'` only (teachers/admins never appear in this list, regardless of search match).
- `learningStreak` is recomputed via `effectiveStreak()` at request time rather than trusting the possibly-stale stored value.
- Sorting happens **after** the DB aggregation, in application code, because the sort keys (`totalWords`, `totalViews`) are joined/computed from two separate aggregate pipelines rather than being stored fields — this means `page`/`limit` slicing also happens post-sort, in memory, not via a DB-level skip/limit.

**Error responses**
- `401`, `403`, `500`

---

### GET /api/admin/vocab-activity/:userId
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Path params: `userId`
- Query params: `view` (`day`\|`month`\|`year`, default `day`), `year` (default current year), `month` (1–12, default current month; only used when `view=day`)

**Response**
```json
{ "success": true, "view": "day", "data": [ { "label": "1", "viewCount": 3, "wordsAdded": 2, "wordsStudied": 5 }, { "label": "2", "viewCount": 0, "wordsAdded": 0, "wordsStudied": 0 } ] }
```

**Validation**
- None on `userId` shape beyond `new mongoose.Types.ObjectId(userId)` throwing on malformed input (→ 500).
- Always returns a fully-populated array (every day of the month / every month of the year / every year with data), zero-filling gaps — the frontend never has to handle sparse data.

**Error responses**
- `401`, `403`
- `500` — includes malformed `userId`

---

## Passages / Reading Tests / Listening Tests

`backend/routes/admin/passages.js` — 15 endpoints, **all `teacherOnly`**. Every `DELETE` in this file is, per the shared-middleware rule, effectively admin-only in practice.

### GET /api/admin/passages
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Query params: `category` (`passage1`\|`passage2`\|`passage3`), `page` (default 1), `limit` (default 20)

**Response**
```json
{ "success": true, "passages": [ { "_id": "665fd...", "title": "The History of Tea", "category": "passage1", "difficulty": "medium", "isActive": true, "questionCount": 13, "createdAt": "2026-05-01T00:00:00.000Z" } ], "total": 45 }
```

**Validation**
- `questionCount` is computed via aggregation (`questions[]` length + sum of `questionGroups[].questions[]` lengths), not a stored field — reflects either the legacy flat `questions[]` shape or the newer `questionGroups[]` shape transparently.

**Error responses**
- `401`, `403`, `500`

---

### GET /api/admin/passages/stats
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Response**
```json
{ "success": true, "stats": { "passage1": 15, "passage2": 16, "passage3": 14 } }
```

**Validation**
- Only counts `isActive: true` passages. Any category outside the fixed 3-key result object is silently dropped.

**Error responses**
- `401`, `403`, `500`

---

### POST /api/admin/passages/upload-map-image
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Body:
```json
{ "imageBase64": "data:image/png;base64,iVBORw0KGgo..." }
```

**Response**
```json
{ "success": true, "url": "https://res.cloudinary.com/.../reading-maps/abc123.png" }
```

**Validation**
- `imageBase64` required (400 if missing); must pass `isImageDataUri()` (`utils/validation.js`) — rejects anything not a well-formed `data:image/...;base64,...` URI before it's ever sent to Cloudinary.

**Error responses**
- `401`, `403`
- `400` — missing or malformed image data
- `500` — Cloudinary upload failure

---

### POST /api/admin/passages
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Body: full `Passage` document — `title`, `category` (`passage1`\|`passage2`\|`passage3`), `content`, `questionRange: {start, end}`, `difficulty`, `tags`, `questionGroups`/`questions`, `isActualTest`. Example (trimmed):
```json
{ "title": "The History of Tea", "category": "passage1", "content": "Tea has been...", "questionRange": { "start": 1, "end": 13 }, "difficulty": "medium", "tags": ["history"], "questionGroups": [ { "groupType": "table", "instruction": "Complete the table.", "questions": [ { "questionNumber": 1, "type": "fill-blank", "questionText": "...", "correctAnswer": "China" } ] } ] }
```

**Response**
```json
{ "success": true, "passage": { "_id": "665fd...", "title": "The History of Tea", "category": "passage1" } }
```

**Validation**
- Full Mongoose schema validation on save (`title`, `category`, `content`, `questionRange` all required; `category`/`difficulty` enum-constrained) — 400 on any violation.

**Error responses**
- `401`, `403`
- `400` — schema validation failure
- `500` — unexpected error

---

### GET /api/admin/passages/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Path params: `id`

**Response**
```json
{ "success": true, "passage": { "_id": "665fd...", "title": "The History of Tea", "content": "...", "questionGroups": [ /* full detail */ ] } }
```

**Error responses**
- `401`, `403`, `404` (not found), `500`

---

### PUT /api/admin/passages/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Path params: `id`
- Body: any subset of `title`, `category`, `content`, `questionRange`, `difficulty`, `tags`, `questionGroups`, `questions`, `isActive`, `isActualTest` — only fields explicitly present in the body are applied (each checked with `!== undefined`)

**Response**
```json
{ "success": true, "passage": { "_id": "665fd...", "title": "The History of Tea (Updated)" } }
```

**Validation**
- Loads the document first (not `findByIdAndUpdate`) and assigns fields individually, specifically so Mongoose fully replaces array subdocuments (`questionGroups`/`questions`) rather than attempting a partial merge — a comment in the code calls this out explicitly.
- Full schema validation on `.save()`.

**Error responses**
- `401`, `403`, `404` (not found), `400` (validation failure), `500`

---

### DELETE /api/admin/passages/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only — see note above). Soft delete (sets `isActive: false`).
**Rate limit:** none

**Response**
```json
{ "success": true, "message": "Đã ẩn bài đọc" }
```

**Error responses**
- `401`, `403`, `500`

---

### DELETE /api/admin/passages/:id/permanent
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only). Hard delete.
**Rate limit:** none

**Response**
```json
{ "success": true, "message": "Đã xóa vĩnh viễn bài đọc" }
```

**Error responses**
- `401`, `403`, `404` (not found), `500`

---

### GET /api/admin/tests
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Response**
```json
{ "success": true, "tests": [ { "_id": "665fe...", "name": "Orange Test 20", "seriesName": "Orange Test", "testNumber": 20, "isActive": true } ] }
```
(this is `ReadingTest` metadata only — the 3 passages used in a test are randomly assigned when a student starts it, per the model's own comment, not stored on the test document)

**Error responses**
- `401`, `403`, `500`

---

### POST /api/admin/tests
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Body:
```json
{ "name": "Orange Test 21", "seriesName": "Orange Test", "testNumber": 21 }
```

**Response**
```json
{ "success": true, "test": { "_id": "665fe...", "name": "Orange Test 21", "testNumber": 21 } }
```

**Error responses**
- `401`, `403`, `400` (validation, e.g. missing `name`/`testNumber`), `500`

---

### GET /api/admin/tests/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Response**
```json
{ "success": true, "test": { "_id": "665fe...", "name": "Orange Test 20", "testNumber": 20 } }
```

**Error responses**
- `401`, `403`, `404`, `500`

---

### PUT /api/admin/tests/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- Body: any subset of `name`, `seriesName`, `testNumber`, `isActive`

**Response**
```json
{ "success": true, "test": { "_id": "665fe...", "name": "Orange Test 20 (renamed)" } }
```

**Error responses**
- `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/tests/:id
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only). Soft delete (`isActive: false`).
**Rate limit:** none

**Response**
```json
{ "success": true, "message": "Đã ẩn bộ đề" }
```

**Error responses**
- `401`, `403`, `500`

---

### DELETE /api/admin/tests/:id/permanent
**Auth:** Bearer token required
**Permissions:** teacherOnly (in practice admin-only). Hard delete.
**Rate limit:** none

**Response**
```json
{ "success": true, "message": "Đã xóa vĩnh viễn bộ đề" }
```

**Error responses**
- `401`, `403`, `404`, `500`

---

### GET /api/admin/listening-tests
**Auth:** Bearer token required
**Permissions:** teacherOnly
**Rate limit:** none

**Request**
- None (used to populate the Access Key generation dropdown)

**Response**
```json
{ "success": true, "tests": [ { "_id": "665ff...", "name": "Listening Test 12", "testNumber": 12, "seriesName": "Cambridge 18" } ] }
```

**Validation**
- Only returns `isActive: true` tests, field-limited to `name testNumber seriesName`.

**Error responses**
- `401`, `403`, `500`

---

## Writing Content

`backend/routes/admin/writingContent.js` — 21 endpoints, **all `teacherOnly`**, covering Writing Exams (Task 1 + Task 2 paired), Writing History (student submissions), and standalone Writing Task 1/Task 2 practice pools. Every `DELETE` in this file is, per the shared-middleware rule, effectively admin-only in practice.

### GET /api/admin/writing-tests
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** none (dropdown source for Access Key generation)
**Response**
```json
{ "success": true, "exams": [ { "_id": "66600...", "name": "Academic Writing Test 1" } ] }
```
Only `isActive: true` exams, field-limited to `name`.
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/writing-exams
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Response**
```json
{ "success": true, "exams": [ { "_id": "66600...", "name": "Academic Writing Test 1", "task1": { "prompt": "The chart shows..." }, "task2": { "prompt": "Some people believe..." }, "duration": 60, "isActive": true } ] }
```
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/writing-exams/upload-image
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** `{ "imageBase64": "data:image/png;base64,..." }`
**Response:** `{ "success": true, "url": "https://res.cloudinary.com/.../writing-tasks/xyz.png" }`
**Validation:** `imageBase64` required; must pass `isImageDataUri()`.
**Error responses:** `401`, `403`, `400` (missing/invalid image), `500` (Cloudinary failure)

---

### POST /api/admin/writing-exams
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "name": "Academic Writing Test 2", "task1": { "imageUrl": "https://...", "prompt": "The graph illustrates..." }, "task2": { "prompt": "Discuss both views..." }, "duration": 60 }
```
**Response:** `{ "success": true, "exam": { "_id": "66601...", "name": "Academic Writing Test 2" } }`
**Validation:** `name` required by schema; `task1`/`task2` default to `{}` sub-objects with default prompts/instructions if omitted.
**Error responses:** `401`, `403`, `400` (validation), `500`

---

### PUT /api/admin/writing-exams/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** any subset of `name`, `task1`, `task2`, `duration`, `isActive`
**Response:** `{ "success": true, "exam": { "_id": "66601...", "name": "Academic Writing Test 2 (updated)" } }`
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/writing-exams/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Soft delete (`isActive: false`). · **Rate limit:** none

**Response:** `{ "success": true, "message": "Đã ẩn đề writing" }`
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/writing-history
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** none (fixed to 200 most recent submissions)
**Response**
```json
{ "success": true, "attempts": [ { "_id": "66602...", "userId": { "username": "hoa_nguyen" }, "examName": "Academic Writing Test 1", "gradingStatus": "confirmed", "submittedAt": "2026-07-10T08:00:00.000Z" } ] }
```
Excludes full answer text (`.select('-task1Answer -task2Answer -task1Snapshot -task2Snapshot')`) — summary view only; use `writing-attempt/:id` below for full text.
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/writing-attempt/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** path param `id`
**Response:** full `WritingAttempt` document including `task1Answer`/`task2Answer` text, populated `userId` and `examId`.
**Error responses:** `401`, `403`, `404`, `500`

---

### GET /api/admin/writing-task1
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Response:** `{ "success": true, "tasks": [ { "_id": "66603...", "title": "...", "isActive": true } ] }`
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/writing-task1/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Error responses:** `401`, `403`, `404`, `500`

---

### POST /api/admin/writing-task1/upload-image
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
Identical contract to `writing-exams/upload-image` above (folder: `writing-tasks`).
**Error responses:** `401`, `403`, `400`, `500`

---

### POST /api/admin/writing-task1
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** full `WritingTask1` document (image URL, prompt, instructions).
**Error responses:** `401`, `403`, `400`, `500`

---

### PUT /api/admin/writing-task1/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/writing-task1/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Soft delete. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã ẩn câu hỏi Task 1" }`
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/writing-task1/:id/permanent
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã xóa vĩnh viễn Task 1" }`
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/writing-task2
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/writing-task2/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Error responses:** `401`, `403`, `404`, `500`

---

### POST /api/admin/writing-task2
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** full `WritingTask2` document (prompt, instructions).
**Error responses:** `401`, `403`, `400`, `500`

---

### PUT /api/admin/writing-task2/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/writing-task2/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Soft delete. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã ẩn câu hỏi Task 2" }`
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/writing-task2/:id/permanent
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã xóa vĩnh viễn Task 2" }`
**Error responses:** `401`, `403`, `500`

---

## Writing Practice (WP)

`backend/routes/admin/writingPracticeWP.js` — 10 endpoints, all `teacherOnly`, covering `WPTopic` (grammar-drill topic categories), `WPExercise` (individual drill items), and `WritingPracticeAttempt` (student submissions — read/delete only from this file).

### GET /api/admin/wp-topics
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true, "topics": [ { "_id": "66604...", "key": "daily-life", "title": "Daily Life", "levels": ["beginner","elementary"], "isActive": true } ] }`
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/wp-topics
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "key": "environment", "title": "Environment", "titleVi": "Môi trường", "category": "general", "levels": ["intermediate"] }
```
**Response:** `{ "success": true, "topic": { "_id": "66605...", "key": "environment" } }`
**Validation:** `key` (unique) and `title` required by schema.
**Error responses:** `401`, `403`, `500` (schema validation errors also surface as 500 here — this route doesn't use a 400/`try{...}catch(400)` split like most other files)

---

### PUT /api/admin/wp-topics/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** any subset of topic fields
**Response:** `{ "success": true }` (does not echo back the updated document)
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/wp-topics/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Soft delete (`isActive: false`). · **Rate limit:** none
**Response:** `{ "success": true }`
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/wp-exercises
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** query params `level`, `topic` (matches `topicKey`), `type`, `active` (`'true'`\|`'false'`), `limit` (default 50), `skip` (default 0) — `'all'` (the frontend's default select value) is treated as "no filter" for `level`/`topic`/`type`.
**Response:** `{ "success": true, "exercises": [ { "_id": "66606...", "topicKey": "environment", "level": "intermediate", "type": "translation", "question": "...", "isActive": true } ], "total": 88 }`
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/wp-exercises
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "topicKey": "environment", "level": "intermediate", "type": "translation", "question": "Dịch câu sau sang tiếng Anh: ...", "sampleAnswer": "..." }
```
**Response:** `{ "success": true, "exercise": { "_id": "66607...", "topicKey": "environment" } }`
**Validation:** `topicKey`, `level`, `type`, `question`, `sampleAnswer` required by schema.
**Error responses:** `401`, `403`, `500`

---

### PUT /api/admin/wp-exercises/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true }`
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/wp-exercises/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Soft delete. · **Rate limit:** none
**Response:** `{ "success": true }`
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/wp-attempts
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** query params `limit` (default 100), `skip` (default 0)
**Response:** `{ "success": true, "attempts": [ { "_id": "66608...", "studentId": { "username": "hoa_nguyen" }, "topic": "environment", "createdAt": "2026-07-11T08:00:00.000Z" } ], "total": 340 }`
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/wp-attempts/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete. · **Rate limit:** none
**Response:** `{ "success": true }`
**Validation:** Functionally duplicates `DELETE /api/admin/writing-practice-attempts/:id` in [Delete Exam Attempts](#delete-exam-attempts) — both hard-delete `WritingPracticeAttempt` by `_id`; left over from the pre-split single file, not a bug.
**Error responses:** `401`, `403`, `500`

---

## Writing Samples (PDF)

`backend/routes/admin/writingSamples.js` — 6 endpoints, all `teacherOnly`. Manages PDF resources (band-9 sample essays) uploaded to Cloudinary.

### GET /api/admin/writing/samples
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true, "samples": [ { "_id": "66609...", "title": "Band 8 Sample Essays Q1 2026", "quarter": "Q1 2026", "topic": "Environment", "taskType": "task2", "pdfUrl": "https://res.cloudinary.com/...", "isActive": true } ] }`
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/writing/samples/upload-pdf
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** `multipart/form-data`, field name `pdf` (file). Enforced by `uploadPdfMemory` (`_shared.js`): PDF mimetype only, 50MB max.
**Response:** `{ "success": true, "url": "https://res.cloudinary.com/.../writing-samples/xyz.pdf" }`
**Validation:** 400 if no file attached; non-PDF files rejected by multer's `fileFilter` before the handler even runs (surfaces as a 500 from the unhandled multer error, not a clean 400 — see Error responses).
**Error responses:** `401`, `403`, `400` (no file field), `500` (oversized file, non-PDF mimetype, or Cloudinary failure — multer's `fileFilter` error and its `fileSize` limit error both propagate as generic 500s here, not distinct 400/413 responses)

---

### POST /api/admin/writing/samples
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "title": "Band 8 Sample Essays Q1 2026", "quarter": "Q1 2026", "topic": "Environment", "taskType": "task2", "pdfUrl": "https://res.cloudinary.com/.../xyz.pdf" }
```
**Response:** `{ "success": true, "sample": { "_id": "66609...", "title": "Band 8 Sample Essays Q1 2026" } }`
**Validation:** `title`, `quarter`, `topic`, `pdfUrl` required by schema (typically populated by the `upload-pdf` call above, then this call persists the metadata).
**Error responses:** `401`, `403`, `400`, `500`

---

### PUT /api/admin/writing/samples/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true, "sample": { "_id": "66609...", "title": "Updated title" } }`
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/writing/samples/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Soft delete. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã ẩn tài liệu" }`
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/writing/samples/:id/permanent
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete — does not delete the underlying Cloudinary asset, only the DB record. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã xóa vĩnh viễn" }`
**Error responses:** `401`, `403`, `500`

---

## Task 1 Exercises

`backend/routes/admin/task1Exercises.js` — 4 endpoints, all `teacherOnly`. Manages the `Task1Exercise` drill pool (chart/graph-description micro-exercises).

### GET /api/admin/task1/exercises
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** query params `level`, `skillType`, `type` (all default `'all'` = no filter), `page` (default 1), `limit` (default 20), `search` (regex-matches `instruction`, case-insensitive)
**Response:** `{ "success": true, "exercises": [ { "_id": "6660a...", "skillType": "trend_language", "module": 2, "level": "intermediate", "type": "fill_blank", "instruction": "Fill in the blank with the correct trend verb." } ], "total": 64, "page": 1, "totalPages": 4 }`
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/task1/exercises
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "skillType": "trend_language", "module": 2, "level": "intermediate", "type": "fill_blank", "instruction": "Fill in the blank with the correct trend verb.", "sentenceWithBlanks": "Sales ___ sharply in 2020.", "primaryAnswer": "increased" }
```
**Response:** `{ "success": true, "exercise": { "_id": "6660a...", "skillType": "trend_language" } }`
**Validation:** `skillType`, `module` (1–4), `level`, `type`, `instruction` required (all schema-enum-constrained, e.g. `skillType` must be one of 6 fixed values).
**Error responses:** `401`, `403`, `400` (validation), `500`

---

### PUT /api/admin/task1/exercises/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** any subset of exercise fields
**Response:** `{ "success": true, "exercise": { "_id": "6660a...", "instruction": "Updated instruction" } }`
**Validation:** `runValidators: true`.
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/task1/exercises/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete. · **Rate limit:** none
**Response:** `{ "success": true }`
**Error responses:** `401`, `403`, `404`, `500`

---

## Task 2 Topics

`backend/routes/admin/task2Topics.js` — 10 endpoints. The 8 CRUD routes (topics + their embedded `questions[]`) are `teacherOnly`; the 2 maintenance/seed routes at the bottom are `adminOnly` because they bulk-delete-and-reinsert or bulk-mutate content rather than editing a single record.

### GET /api/admin/task2/topics
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** query params `week` (1–12, `'all'` = no filter), `essayType`, `search` (matches `topicName`), `page` (default 1), `limit` (default 20)
**Response:** `{ "success": true, "topics": [ { "_id": "6660b...", "week": 3, "block": "Block A", "topicName": "Technology", "essayType": "cause_effect" } ], "total": 60, "page": 1, "totalPages": 3 }`
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/task2/topics/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** full `Task2Topic` document including embedded `questions[]`.
**Error responses:** `401`, `403`, `404`, `500`

---

### POST /api/admin/task2/topics
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "week": 3, "block": "Block A", "topicName": "Technology", "topicEmoji": "💻", "essayType": "cause_effect", "prompt": "Discuss the causes and effects of..." }
```
**Response:** `{ "success": true, "topic": { "_id": "6660b...", "topicName": "Technology" } }`
**Validation:** `week` (1–12), `block`, `topicName`, `essayType` (enum of 6 values), `prompt` required by schema.
**Error responses:** `401`, `403`, `400`, `500`

---

### PUT /api/admin/task2/topics/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** any subset of topic-level fields; **`questions` is explicitly stripped from the body before update** (`const { questions, ...topicData } = req.body`) — the embedded questions array is managed exclusively through the 3 dedicated sub-routes below, never through this route, even if a caller includes it.
**Response:** `{ "success": true, "topic": { "_id": "6660b...", "topicName": "Technology (updated)" } }`
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/task2/topics/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete — also removes all embedded `questions[]` since they're subdocuments, not a separate collection. · **Rate limit:** none
**Response:** `{ "success": true }`
**Error responses:** `401`, `403`, `404`, `500`

---

### POST /api/admin/task2/topics/:id/questions
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "level": "intermediate", "type": "translation", "questionText": "Dịch câu sau: ...", "correctAnswer": "Technology has transformed..." }
```
**Response:** `{ "success": true, "question": { "_id": "6660c...", "questionText": "Dịch câu sau: ..." } }` (returns just the newly-appended question, not the whole topic)
**Validation:** `level`, `type` (enum of 8 values), `questionText` required (`$push` + `runValidators: true`).
**Error responses:** `401`, `403`, `404` (topic not found), `400`, `500`

---

### PUT /api/admin/task2/topics/:topicId/questions/:qid
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** any subset of question fields — applied via positional `$` operator (`questions.$.<field>`)
**Response:** `{ "success": true, "question": { "_id": "6660c...", "questionText": "Updated text" } }`
**Validation:** 404 if no topic matches `{_id: topicId, 'questions._id': qid}` — a single query that implicitly validates both the topic and the question-within-topic exist together.
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/task2/topics/:topicId/questions/:qid
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Removes the question via `$pull`. · **Rate limit:** none
**Response:** `{ "success": true }`
**Error responses:** `401`, `403`, `404` (topic not found), `500`

---

### POST /api/admin/reseed-task2-week12
**Auth:** Bearer token required
**Permissions:** adminOnly — this deletes existing week-12 topics and bulk-reinserts fresh ones (`scripts/seedTask2Exercises.js`'s `reseedWeek12()`); a one-off maintenance/data-repair script, not routine content editing, hence admin-only rather than teacherOnly.
**Rate limit:** none

**Request:** none
**Response:** `{ "success": true, "message": "Đã re-seed 5 topics tuần 12." }`
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/fix-task1-context
**Auth:** Bearer token required
**Permissions:** adminOnly — runs a one-off bulk-mutation script (`scripts/updateTask1Context.js`'s `run()`) that patches ambiguous questions; not routine content editing, hence admin-only.
**Rate limit:** none

**Request:** none
**Response:** `{ "success": true, "message": "Updated task1 context for Q15 and Q16." }`
**Error responses:** `401`, `403`, `500`

---

## Task 2 Templates

`backend/routes/admin/task2Templates.js` — 6 endpoints, all `teacherOnly`. Manages `Task2Template` documents — structured essay-writing scaffolds (sentence starters with blanks) grouped by essay type. This file is large in raw byte count because it embeds a 7-template `SEED_TEMPLATES` data constant (essay-scaffold content, not logic) used only by the `seed` route.

### GET /api/admin/task2/templates
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** query param `search` (matches `name` or `typeId`, case-insensitive)
**Response:** `{ "success": true, "templates": [ { "_id": "6660d...", "typeId": "type01", "label": "Type 01", "name": "Advantages & Disadvantages", "orderIndex": 0, "isActive": true } ] }`
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/task2/templates/seed
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** `{ "force": false }`
**Response** (already seeded, `force` not set): `{ "success": false, "message": "Đã có 7 template. Gửi force:true để ghi đè." }`
**Response** (seeded fresh, or `force: true`): `{ "success": true, "message": "Đã seed 7 template mặc định." }`
**Validation:** If `existing > 0` and `force` is falsy, returns early with `success: false` but **HTTP 200**, not 400 — a caller checking only the HTTP status rather than the `success` field would miss this. If `force: true`, **all existing templates are deleted first** (`deleteMany({})`) before the 7 seed templates are reinserted — this is a destructive overwrite of any manually-edited templates.
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/task2/templates/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** full template document including `sections[].items[]`.
**Error responses:** `401`, `403`, `404`, `500`

---

### POST /api/admin/task2/templates
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "typeId": "type08", "label": "Type 08", "sub": "Two-Part Question", "name": "Two-Part Question", "orderIndex": 7, "sections": [ { "title": "① Introduction", "items": [ { "en": "This essay will address...", "answer": "address", "vi": "→ Bài viết này sẽ..." } ] } ] }
```
**Response:** `{ "success": true, "template": { "_id": "6660e...", "typeId": "type08" } }`
**Validation:** `typeId` (unique), `label`, `sub`, `name` required by schema — duplicate `typeId` throws a Mongoose duplicate-key error, surfaced as a 400 with the raw Mongo error message.
**Error responses:** `401`, `403`, `400`, `500`

---

### PUT /api/admin/task2/templates/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** any subset of template fields — applied by loading the document and assigning each key in `req.body` directly onto it (`tpl[k] = req.body[k]`), then `.save()`, so array fields like `sections` are fully replaced rather than merged.
**Response:** `{ "success": true, "template": { "_id": "6660e...", "name": "Updated name" } }`
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/task2/templates/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete. · **Rate limit:** none
**Response:** `{ "success": true }`
**Error responses:** `401`, `403`, `404`, `500`

---

## Speaking

`backend/routes/admin/speaking.js` — 12 endpoints, all `teacherOnly`. Covers Speaking Questions (Part 1/2/3 prompts), Speaking Materials (quarterly PDF resources), and read-only Speaking attempt history.

### GET /api/admin/speaking/questions
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true, "questions": [ { "_id": "6660f...", "topic": "Hometown", "part": 1, "question": "Where is your hometown?", "isActive": true } ] }`
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/speaking/questions
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** `{ "topic": "Hometown", "part": 1, "question": "Where is your hometown?" }` (Part 2 items also carry `cueCard`)
**Response:** `{ "success": true, "question": { "_id": "6660f...", "topic": "Hometown" } }`
**Validation:** `topic`, `question` required; `part` must be `1`, `2`, or `3` (default `1`).
**Error responses:** `401`, `403`, `400`, `500`

---

### PUT /api/admin/speaking/questions/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true, "question": { "_id": "6660f...", "question": "Updated question text" } }`
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/speaking/questions/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Soft delete (`isActive: false`). · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã ẩn câu hỏi" }`
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/speaking/questions/:id/permanent
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã xóa vĩnh viễn câu hỏi" }`
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/speaking/materials
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true, "materials": [ { "_id": "66610...", "title": "Speaking Bank Q1 2026", "quarter": "Q1 2026", "topic": "Various", "pdfUrl": "https://...", "isActive": true } ] }` (filters `isActive: { $ne: false }`)
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/speaking/materials/upload-pdf
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** `multipart/form-data`, field `pdf`. Same `uploadPdfMemory` constraints as Writing Samples (PDF-only, 50MB max).
**Response:** `{ "success": true, "url": "https://res.cloudinary.com/.../speaking-materials/xyz.pdf" }`
**Error responses:** `401`, `403`, `400` (no file), `500` (oversized/non-PDF/Cloudinary failure — same non-distinct-413 caveat as writing samples)

---

### POST /api/admin/speaking/materials
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** `{ "title": "Speaking Bank Q1 2026", "quarter": "Q1 2026", "topic": "Various", "pdfUrl": "https://..." }`
**Response:** `{ "success": true, "material": { "_id": "66610...", "title": "Speaking Bank Q1 2026" } }`
**Validation:** `title`, `quarter`, `topic`, `pdfUrl` all required by schema.
**Error responses:** `401`, `403`, `400`, `500`

---

### PUT /api/admin/speaking/materials/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true, "material": { "_id": "66610...", "title": "Updated title" } }`
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/speaking/materials/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Soft delete. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã ẩn tài liệu" }`
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/speaking/materials/:id/permanent
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete. · **Rate limit:** none
**Response:** `{ "success": true, "message": "Đã xóa vĩnh viễn tài liệu" }`
**Error responses:** `401`, `403`, `500`

---

### GET /api/admin/speaking/history
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** query params `page` (default 1), `limit` (default 40), `userId` (optional filter to one student)
**Response:** `{ "success": true, "attempts": [ { "_id": "66611...", "userId": { "username": "hoa_nguyen", "plan": "free" }, "createdAt": "2026-07-11T09:00:00.000Z" } ], "total": 88, "page": 1, "pages": 3 }`
**Error responses:** `401`, `403`, `500`

---

## Courses

`backend/routes/admin/courses.js` — 5 endpoints, all `teacherOnly`. Manages the public-site course catalog (`Course` model).

### GET /api/admin/courses
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none
**Response:** `{ "success": true, "courses": [ { "_id": "66612...", "title": "IELTS Mất Gốc", "category": "ielts", "price": "Liên hệ tư vấn", "isActive": true, "order": 0 } ] }`
**Error responses:** `401`, `403`, `500`

---

### POST /api/admin/courses
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request**
```json
{ "title": "IELTS Mất Gốc", "subtitle": "Dành cho: Người mới bắt đầu", "category": "ielts", "level": "Mất gốc", "levelColor": "red", "duration": "6–8 tháng", "classSize": "Nhóm ≤ 8 người" }
```
**Response:** `{ "success": true, "course": { "_id": "66612...", "title": "IELTS Mất Gốc" } }`
**Validation:** `title` required by schema; `category` (enum: `ielts`\|`speaking`\|`comm`\|`speaking ielts`) and `levelColor` (enum: `red`\|`blue`\|`green`\|`purple`) schema-constrained.
**Error responses:** `401`, `403`, `400` (validation), `500`

---

### PUT /api/admin/courses/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly · **Rate limit:** none

**Request:** any subset of course fields
**Response:** `{ "success": true, "course": { "_id": "66612...", "title": "IELTS Mất Gốc (Updated)" } }`
**Validation:** `runValidators: true`.
**Error responses:** `401`, `403`, `404`, `400`, `500`

---

### DELETE /api/admin/courses/:id
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only — see [Permission model](#permission-model-specific-to-this-directory)). Soft delete (`isActive: false`).
**Rate limit:** none

**Response:** `{ "success": true, "message": "Đã ẩn khóa học" }`
**Error responses:** `401`, `403`, `500`

---

### DELETE /api/admin/courses/:id/permanent
**Auth:** Bearer token required · **Permissions:** teacherOnly (in practice admin-only). Hard delete.
**Rate limit:** none

**Response:** `{ "success": true, "message": "Đã xóa vĩnh viễn khóa học" }`
**Error responses:** `401`, `403`, `500`
