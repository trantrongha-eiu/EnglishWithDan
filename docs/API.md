# API Reference — Public & Student-Facing Endpoints

Every endpoint documented here (169 total) was written by reading the real route file plus the controller/service functions it calls into — request/response shapes come directly from `req.body` destructuring and `res.json(...)` calls, not guessed from the endpoint name. Admin-only endpoints are documented separately in [`docs/API_ADMIN.md`](API_ADMIN.md) (a different auth/permission model — `teacherOnly`/`adminOnly` rather than plain user auth). For the general auth flow, the AI grading workflow, and the request lifecycle these endpoints sit inside, see [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) rather than looking for it repeated here.

**A note on consistency**: this API was built incrementally over a long engagement, and a few real inconsistencies survive that are worth knowing before you integrate against it — they're called out inline at each affected endpoint rather than silently normalized in this doc, because they're genuine client-visible behavior:
- A handful of endpoints return HTTP `200` with `{success:false, ...}` in the body instead of a 4xx status code (e.g. duplicate-word checks, a below-minimum practice-completion attempt).
- Two `vocab.js` read routes return a bare array/object with no `{success, ...}` envelope at all.
- Error-message verbosity differs by route depending on whether it uses the shared `catchAsync` wrapper (leaks `err.message` to the client) or a hand-rolled `try/catch` (generic `'Lỗi server'` for a 500) — see [`docs/CODING_STANDARDS.md`](CODING_STANDARDS.md) for why both patterns coexist.
- `teacherOnly`-gated `DELETE` routes are, in practice, admin-only — the middleware itself blocks the `teacher` role on any `DELETE` request regardless of what the route declaration implies. Noted per-route where it applies.

---


For the auth/authorization mechanics referenced below (JWT shape, `middleware/auth.js` behavior, role/plan gating, the general request lifecycle) see [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) — this file only documents what's specific to each endpoint: exact request/response shapes and every distinguishable error path found in the real controller/service code.

A few conventions that hold across every endpoint below unless noted otherwise:
- `auth` middleware (`Bearer token required`) returns `401 {success:false, message:'Không có token xác thực'}` if the header is missing/malformed, `401` if the token is invalid/expired/the user no longer exists, and `403 {success:false, message:'Tài khoản của bạn đã bị cấm...'}` if the account is banned — this applies to every "Bearer token required" endpoint below and isn't repeated per-endpoint.
- Response envelopes are `{success: true/false, ...}` almost everywhere, **except** `vocab.js`'s two public read routes (`GET /units`, `GET /unit/:number`), which return the bare array/object with no envelope at all — a genuine inconsistency preserved from the original API contract, not a doc error.
- Any error not explicitly handled by a route's own `try/catch` (or `catchAsync`) falls through to the global `errorHandler` (`middleware/errorHandler.js`) as a generic `500 {success:false, message:'Lỗi server'}`, unless the handler uses `catchAsync`, in which case the response is `{success:false, message: err.message}` at `err.statusCode || 500` (`middleware/catchAsync.js`) — that's a real, deliberate difference in error-message verbosity between routes using `catchAsync` (`user.controller.js`'s profile/stats/avatar handlers, `contact.controller.js`) and routes using hand-rolled `try/catch` (everything else in this file), preserved from before the refactor.

---

## Auth

Base path: `/api/auth`. Full flow narrative (local login, Google OAuth, password reset): [`docs/ARCHITECTURE.md` § Authentication flow](ARCHITECTURE.md#authentication-flow).

All local-auth POST routes are rate-limited by `express-rate-limit`, keyed by **IP + the lowercased `email`/`username` from the request body** (`keyByIpAndIdentifier` in `routes/auth.js`), 15-minute window, so one attacker spraying many accounts from one IP is throttled per-account, not just per-IP. On limit-exceeded: `429 {success:false, message:'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.'}`, and the rejection is logged via `logger.security`.

### POST /api/auth/register
**Auth:** none
**Permissions:** none (creates a new account)
**Rate limit:** 15 min window, max 5 requests (keyed by IP + email/username)

**Request**
- Body:
```json
{ "firstName": "An", "lastName": "Nguyen", "username": "an.nguyen", "email": "an@example.com", "password": "secret123" }
```

**Response** (201)
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "665f1...", "firstName": "An", "lastName": "Nguyen", "username": "an.nguyen",
    "email": "an@example.com", "role": "student", "avatar": "",
    "plan": "free", "planExpiresAt": null, "planStartedAt": null
  }
}
```

**Validation**
- Controller (`auth.controller.js#register`): `username`, `email`, `password` must all be truthy (`firstName`/`lastName` optional).
- Service (`authService.registerUser`): duplicate check via `User.findOne({$or:[{email},{username}]})` before insert; password hashed with `bcrypt.hash(password, 10)`.
- Mongoose schema (`models/User.js`): `username`/`email` both `required, unique` — a race between the manual duplicate check and the DB write is theoretically possible (no transaction) but would surface as an uncaught `E11000` error, not a clean 400.

**Error responses**
- `400` — missing `username`/`email`/`password`.
- `400` — email or username already registered (`{message:'Email hoặc Username đã tồn tại'}`).
- `429` — rate limit exceeded.
- `500` — unhandled error (generic message, real error logged server-side via `console.error`).

---

### POST /api/auth/login
**Auth:** none
**Permissions:** none
**Rate limit:** 15 min window, max 10 requests (keyed by IP + email/username)

**Request**
- Body: `email` is matched against **either** the `email` or `username` field server-side.
```json
{ "email": "an@example.com", "password": "secret123" }
```

**Response** (200)
```json
{ "success": true, "token": "eyJhbGciOi...", "user": { "id": "665f1...", "role": "student", "plan": "free", "...": "..." } }
```

**Validation**
- Service (`authService.loginUser`): looks up by `$or:[{email},{username: email}]`, `bcrypt.compare()`s the password. Deliberate timing-attack mitigation — if the user doesn't exist or has no local password (social-only account), a bcrypt compare against a fixed dummy hash still runs, so a "no such account" response takes the same time as a real wrong-password check.

**Error responses**
- `401` — wrong email/username, wrong password, **or** unknown account — all three return the identical `{message:'Sai email/username hoặc mật khẩu'}` by design (user-enumeration fix; the client cannot distinguish "no such account" from "wrong password").
- `400` — account exists but is social-only (no local password set): `{message:'Tài khoản này đăng nhập bằng Google/Facebook'}`.
- `403` — account is banned: `{message:'Tài khoản của bạn đã bị cấm...'}`.
- `429` — rate limit exceeded.
- `500` — unhandled error.

---

### POST /api/auth/forgot-password
**Auth:** none
**Permissions:** none
**Rate limit:** 15 min window, max 5 requests (keyed by IP + email)

**Request**
```json
{ "email": "an@example.com" }
```

**Response** (200) — identical message whether or not the account exists, by design:
```json
{ "success": true, "message": "Nếu email tồn tại, chúng tôi sẽ gửi mã xác nhận." }
```
If the account does exist and the OTP was actually generated/emailed, the message differs slightly:
```json
{ "success": true, "message": "Mã xác nhận đã được gửi đến email của bạn." }
```

**Validation**
- Service (`authService.requestPasswordReset`): generates a 6-digit OTP with `crypto.randomInt` (CSPRNG, not `Math.random`), stores it with a 15-minute expiry and resets the attempt counter to 0. Email is only actually sent if `EMAIL_USER`/`EMAIL_PASS` (Gmail SMTP via nodemailer) are configured.

**Error responses**
- `500` — email transport (`nodemailer`) not configured at all (`EMAIL_USER`/`EMAIL_PASS` missing): `{message:'Không thể gửi email lúc này. Vui lòng thử lại sau.'}`. Note: if nodemailer *is* configured but the actual send throws, the error is swallowed server-side (logged only) and the endpoint still reports success — only a fully unconfigured mailer produces a client-visible failure here.
- `429` — rate limit exceeded.
- `500` — unhandled error.

---

### POST /api/auth/verify-otp
**Auth:** none
**Permissions:** none
**Rate limit:** 15 min window, max 10 requests (keyed by IP + email)

**Request**
```json
{ "email": "an@example.com", "otp": "482913" }
```

**Response** (200)
```json
{ "success": true, "resetToken": "eyJhbGciOi..." }
```
`resetToken` is a separate, purpose-scoped JWT (`{id, purpose:'reset'}`, 15-minute expiry) — distinct from the normal login token.

**Validation**
- Service (`authService.verifyOTP`): the eligibility check (email matches, OTP non-empty, not expired, attempt count `< 5`) and the attempt-increment happen in a **single atomic `findOneAndUpdate`** — a security-audit fix for a race where concurrent requests could each read the same stale attempt count and all pass the "<5" gate, bypassing the lockout. Max 5 wrong guesses total per OTP.

**Error responses**
- `400` — no matching pending OTP for that email, OTP expired, attempt cap already hit, or the OTP value itself is wrong — all collapse to the same `{message:'Mã không hợp lệ hoặc đã hết hạn'}`.
- `429` — rate limit exceeded.
- `500` — unhandled error.

---

### POST /api/auth/reset-password
**Auth:** none
**Permissions:** none (identity proven via the short-lived `resetToken` from `verify-otp`, not a login session)
**Rate limit:** 15 min window, max 10 requests (keyed by IP + email — note this route has no `email` in its body, so in practice every request from the same IP without an email shares one bucket)

**Request**
```json
{ "resetToken": "eyJhbGciOi...", "newPassword": "newSecret123" }
```

**Response** (200)
```json
{ "success": true, "message": "Mật khẩu đã được đặt lại thành công" }
```

**Validation**
- Controller: `newPassword` required, minimum length 6.
- Service (`authService.resetPassword`): verifies `resetToken` as a JWT signed with `JWT_SECRET`, requires `decoded.purpose === 'reset'` (rejects a normal login token even if otherwise valid), then looks up the user by `decoded.id`. On success, clears `resetOTP`/`resetOTPExpires`/`resetOTPAttempts`.

**Error responses**
- `400` — `newPassword` missing or under 6 characters.
- `400` — token invalid, malformed, or expired (`jwt.verify` throws).
- `400` — token is a valid JWT but not a reset-purpose token (`decoded.purpose !== 'reset'`).
- `404` — token is valid and reset-purpose, but the user it references no longer exists.
- `429` — rate limit exceeded.
- `500` — unhandled error.

---

### GET /api/auth/me
**Auth:** Bearer token required
**Permissions:** any authenticated user
**Rate limit:** none

**Request** — no body/params.

**Response** (200) — fresh user payload, reflecting the plan-auto-expiry `middleware/auth.js` may have just applied:
```json
{ "success": true, "user": { "id": "665f1...", "username": "an.nguyen", "role": "student", "plan": "free", "planExpiresAt": null, "planStartedAt": null, "avatar": "" } }
```

**Validation** — none beyond the `auth` middleware itself.

**Error responses** — only the shared `auth` middleware failures (401/403 — see conventions above).

---

### GET /api/auth/google
**Auth:** none
**Permissions:** none
**Rate limit:** none

**Request**
- Query params: `next` (optional) — a same-site relative path (e.g. `/dashboard.html`) to return the user to after login. Anything that looks like a full URL (contains `://`) or doesn't match the safe-relative-path pattern is silently dropped to `''` (open-redirect defense) rather than erroring.

**Response** — **only if `GOOGLE_CLIENT_ID` is configured and passport initializes successfully**: `302` redirect to Google's OAuth consent screen; a short-lived (`Max-Age=600`), `HttpOnly`, `SameSite=Lax` CSRF-nonce cookie (`g_oauth_nonce`, scoped to `Path=/api/auth/google`) is set alongside it, and the nonce is packed into the OAuth `state` param together with the sanitized `next`.

If Google OAuth is **not configured** (`GOOGLE_CLIENT_ID` unset, or passport failed to initialize), this route is registered as a fallback instead:
```json
{ "success": false, "message": "Google OAuth chưa được cấu hình" }
```
returned with status `503`.

**Validation** — `next` is validated against a same-site relative-path regex and must not contain `://`.

**Error responses**
- `503` — Google OAuth not configured (fallback route, not an exception path — this is the route's entire behavior in that mode).

---

### GET /api/auth/google/callback
**Auth:** none (this route *establishes* auth)
**Permissions:** none
**Rate limit:** none

**Request**
- Query params: `code`, `state` — both supplied by Google, not the client. `state` carries the CSRF nonce + the `next` destination packed by `GET /google`.

**Response** — always a redirect (never JSON), to one of:
- Success: `302` to `${FRONTEND_URL}/auth-callback.html?token=<jwt>&user=<url-encoded-json>[&next=<path>]`.
- Banned account: `302` to `${FRONTEND_URL}/login.html?error=banned`.
- CSRF nonce mismatch (returned `state`'s nonce doesn't match the `g_oauth_nonce` cookie, or either is missing): `302` to `${FRONTEND_URL}/login.html?error=oauth_state_mismatch` — checked by `verifyOAuthState` middleware **before** Passport exchanges the authorization code, closing a login-CSRF/session-swap attack (see `docs/SECURITY.md`).
- Passport authentication failure (invalid/expired `code`, Google-side error): `302` to `/login.html?error=google_failed` (configured as `failureRedirect` on the `passport.authenticate` middleware itself).
- Any other exception in the handler (e.g. `authService.completeGoogleLogin` throwing): `302` to `${FRONTEND_URL}/login.html?error=social_auth_failed`.
- Not configured (fallback route registered when `GOOGLE_CLIENT_ID` is unset): `302` to `/login.html?error=not_configured`.

**Validation** — `verifyOAuthState` compares the nonce from `state` against the `g_oauth_nonce` cookie; the cookie is cleared (single-use) regardless of outcome.

**Error responses** — this route never returns a JSON error status; every failure path is a redirect with an `?error=` query param as listed above.

---

## User / Profile

Base path: `/api/user`. Every route requires `auth`; every route operates on `req.user` (the token's own account) — there is no route in this file that takes a user ID as a path/query param, so "owner only" here means "always the caller, never expressed as an ID."

### GET /api/user/profile
**Auth:** Bearer token required
**Permissions:** owner only (implicitly — always `req.user`)
**Rate limit:** none

**Request** — no body/params.

**Response** (200)
```json
{ "success": true, "user": { "_id": "665f1...", "username": "an.nguyen", "email": "an@example.com", "bio": "", "studyMotto": "", "targetBand": 7, "plan": "free", "learningStreak": 3 } }
```
`password`, `resetOTP`, `resetOTPExpires` are always excluded; `user.plan` is overridden from `req.user.plan` (the value `auth` middleware already auto-expired) rather than re-read from the fresh DB fetch, to avoid a race with `auth`'s fire-and-forget plan-downgrade write.

**Validation** — none beyond `auth`.

**Error responses**
- `404` — `userService.getProfile` returns `null` (the account was deleted between token issuance and this request).
- Uses `catchAsync`: any other thrown error responds `{success:false, message: err.message}` at `err.statusCode || 500` (verbose message, not the generic "Lỗi server").

---

### PUT /api/user/profile
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
- Body (all fields optional, only present ones are updated):
```json
{ "firstName": "An", "lastName": "Nguyen", "bio": "IELTS learner", "studyMotto": "Never give up", "targetBand": 7.5 }
```

**Response** (200)
```json
{ "success": true, "user": { "_id": "665f1...", "firstName": "An", "bio": "IELTS learner", "targetBand": 7.5, "...": "..." } }
```

**Validation**
- Service (`userService.updateProfile`): `bio` truncated to 200 chars, `studyMotto` to 80 chars (both also `.trim()`med); `targetBand` coerced to `Number` or `null` if empty string/null.
- Mongoose schema: `targetBand` has `min:4, max:9` — an out-of-range value fails schema validation on save (surfaces as a 500 via `catchAsync`, not a clean 400 — there's no controller-level range check).

**Error responses**
- `500` (verbose, via `catchAsync`) — Mongoose validation error (e.g. `targetBand` outside 4–9) or any other unhandled failure.

---

### PUT /api/user/change-password
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
```json
{ "currentPassword": "oldSecret1", "newPassword": "newSecret123" }
```
For a social-only account with no existing password, `currentPassword` can be omitted — see Validation.

**Response** (200) — one of two messages depending on whether a password previously existed:
```json
{ "success": true, "message": "Đã đổi mật khẩu thành công" }
```
or (first time a social-only account sets a local password):
```json
{ "success": true, "message": "Đã đặt mật khẩu thành công" }
```

**Validation**
- Controller: `newPassword` required, minimum 6 characters.
- Service (`userService.changePassword`): if the user has no `password` set **and** no `currentPassword` was supplied, it treats this as "first password set" and skips the compare step entirely — otherwise `bcrypt.compare(currentPassword, user.password)` must succeed.

**Error responses**
- `400` — `newPassword` missing or under 6 characters.
- `400` — `currentPassword` doesn't match (`{message:'Mật khẩu hiện tại không đúng'}`).
- `500` (generic) — unhandled error.

---

### POST /api/user/avatar
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
```json
{ "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." }
```

**Response** (200)
```json
{ "success": true, "avatar": "https://res.cloudinary.com/.../avatars/xyz.png", "user": { "_id": "665f1...", "avatar": "https://res.cloudinary.com/.../avatars/xyz.png" } }
```

**Validation**
- Controller: `imageBase64` required; must match `isImageDataUri` (`utils/validation.js`) — a regex requiring a `data:image/(png|jpe?g|gif|webp|bmp);base64,` prefix with base64-alphabet payload. Anything else (a bare URL, an SVG, malformed base64) is rejected before Cloudinary is ever called.
- Service (`userService.uploadAvatar`): uploads via `cloudinaryService.uploadImage` with a `200x200 face-crop` transformation, folder `avatars`.

**Error responses**
- `400` — `imageBase64` missing.
- `400` — `imageBase64` present but fails the data-URI regex.
- `500` (verbose, via `catchAsync`) — Cloudinary upload failure or any other unhandled error.

---

### GET /api/user/stats
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request** — no body/params.

**Response** (200)
```json
{
  "success": true,
  "stats": {
    "streak": 3, "lastActivity": "2026-07-11T00:00:00.000Z", "totalStudyMinutes": 420,
    "reading": { "total": 4, "avgBand": "6.5", "history": [{"bandScore": 6.5, "createdAt": "..."}] },
    "listening": { "total": 2, "avgBand": "7.0", "history": ["..."] },
    "writing": { "total": 1, "history": ["..."] },
    "speaking": { "total": 0, "history": [] }
  }
}
```
`history` arrays are capped at 10 most-recent completed attempts each (`TestAttempt`/`ListeningAttempt` filtered to `status:'completed'`; `WritingAttempt`/`SpeakingAttempt` unfiltered by status).

**Validation** — none beyond `auth`. Has a side effect worth knowing: this endpoint also resets the caller's `learningStreak` to 0 (fire-and-forget save) if `resetIfStale()` determines they missed 2+ consecutive days — so simply *loading* the stats page can silently zero out a stale streak.

**Error responses**
- `500` (verbose, via `catchAsync`) — unhandled error.

---

### GET /api/user/messages/unread-count
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request** — no body/params.

**Response** (200)
```json
{ "success": true, "count": 2 }
```
`count` sums unread personal messages (`toId` = caller, not soft-deleted) and unread broadcast messages (caller's ID not yet in `readBy`, not soft-deleted for the caller).

**Error responses**
- `500` (generic) — unhandled error (this route deliberately does **not** use `catchAsync` — see file-level note on `messageGuard` in `user.controller.js`, kept so the client-visible message stays the generic `'Lỗi server'` instead of switching to `catchAsync`'s verbose `err.message`).

---

### GET /api/user/messages
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
- Query params: `page` (default `1`), `limit` (default `30`) — both coerced with unary `+`; no upper bound enforced on `limit`.

**Response** (200)
```json
{
  "success": true,
  "messages": [
    { "_id": "...", "fromName": "Teacher Hà", "subject": "Nhắc học phí", "body": "...", "isBroadcast": false, "isRead": false, "createdAt": "..." }
  ],
  "total": 12
}
```
Returns messages addressed personally to the caller **plus** all broadcast messages, minus anything the caller soft-deleted (`deletedBy`). For broadcast messages, `isRead` in the response is computed per-caller from `readBy` rather than the document's own (personal-only) `isRead` field.

**Error responses**
- `500` (generic) — unhandled error.

---

### PATCH /api/user/messages/:id/read
**Auth:** Bearer token required
**Permissions:** owner only (personal messages) — broadcast messages can be marked read by any authenticated user, since "owner" there just means "add myself to `readBy`"
**Rate limit:** none

**Request**
- Path params: `id` — Message ObjectId.

**Response** (200)
```json
{ "success": true }
```

**Validation**
- Service (`userMessageService.markRead`): for a personal message, `msg.toId` must equal the caller — otherwise rejected. For a broadcast message, ownership doesn't apply; the caller is just appended to `readBy` if not already present (idempotent).

**Error responses**
- `404` — message ID doesn't exist.
- `403` — message is personal and addressed to someone else.
- `500` (generic) — unhandled error.

---

### DELETE /api/user/messages/:id
**Auth:** Bearer token required
**Permissions:** owner only (personal) / any authenticated user can soft-delete their own view of a broadcast
**Rate limit:** none

**Request**
- Path params: `id` — Message ObjectId.

**Response** (200)
```json
{ "success": true }
```
This is a **soft delete** — `req.user._id` is appended to the message's `deletedBy` array; the underlying `Message` document is never removed, so it still counts for other recipients and for admin views.

**Error responses**
- `404` — message ID doesn't exist.
- `403` — message is personal and addressed to someone else.
- `500` (generic) — unhandled error.

---

## Vocabulary

Three route files share this heading: `vocab.js` (`/api/vocab` — shared vocabulary units, admin-authored) , `vocabBook.js` (`/api/vocabbook` — each student's personal saved-word notebooks), and `difficultWords.js` (`/api/difficult-words` — auto-tracked words a student keeps getting wrong across practice modules). All three require `auth`; none are rate-limited.

**Vocabulary units — student-facing (`/api/vocab`)**

### GET /api/vocab/units
**Auth:** Bearer token required
**Permissions:** any authenticated user
**Rate limit:** none

**Request** — no body/params.

**Response** (200) — **bare array, no `{success}` envelope** (see the top-of-file note):
```json
[
  { "unitNumber": 1, "title": "Family & Relationships", "description": "", "level": "B1" }
]
```
Only `isActive:true` units are returned, sorted by `unitNumber`. `Cache-Control: private, max-age=120` is set — same content for every user, so short client-side caching is safe.

**Error responses**
- `500` — `{message:'Cannot load units'}` (no `success` field at all on this error path either).

---

### GET /api/vocab/unit/:number
**Auth:** Bearer token required
**Permissions:** any authenticated user
**Rate limit:** none

**Request**
- Path params: `number` — the unit's `unitNumber` (not its `_id`), coerced with `Number()`.

**Response** (200) — bare unit object (full `words` array included), no envelope:
```json
{ "_id": "...", "unitNumber": 1, "title": "Family & Relationships", "words": [{"word": "sibling", "meaning": "anh chị em ruột", "type": "vocab"}] }
```

**Error responses**
- `404` — `{message:'Unit not found'}` (no unit with that number, or it's `isActive:false`).
- `500` — `{message:'Cannot load unit'}`.

---

**Vocabulary units — admin (`/api/vocab/admin/*`)**

All routes below require `auth` **and** the file-local `teacherOnly` middleware (`role` must be `teacher` or `admin`), and additionally block `teacher` from any `DELETE` request (`{message:'Giáo viên không có quyền xóa nội dung'}` — a stricter-than-usual gate defined inline in `routes/vocab.js`, not the shared `routes/admin/_shared.js` middleware).

### GET /api/vocab/admin/units
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Response** (200)
```json
{ "success": true, "units": [{ "_id": "...", "unitNumber": 1, "sortOrder": 0, "title": "...", "level": "B1", "isActive": true, "wordCount": 42, "createdAt": "..." }] }
```
`wordCount` is derived (`words.length`) — the full `words` array isn't sent here, only in the single-unit detail endpoint below.

**Error responses**
- `500` — `{success:false, message: err.message}`.

---

### GET /api/vocab/admin/units/:id
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
- Path params: `id` — Mongo `_id`.

**Response** (200) — full document including the `words` array.
```json
{ "success": true, "unit": { "_id": "...", "unitNumber": 1, "words": ["..."] } }
```

**Error responses**
- `404` — `{success:false, message:'Không tìm thấy'}`.
- `500` — `{success:false, message: err.message}`.

---

### POST /api/vocab/admin/units
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
```json
{ "unitNumber": 12, "title": "Environment", "description": "", "level": "B2", "isActive": true, "words": [] }
```

**Response** (201)
```json
{ "success": true, "unit": { "_id": "...", "unitNumber": 12, "title": "Environment" }, "message": "Đã tạo Unit 12: Environment" }
```

**Validation**
- Service (`vocabService.createUnit`): checks `unitNumber` uniqueness manually before insert. Mongoose schema also enforces `unitNumber unique, required` and `title required` — any other schema violation (e.g. missing `title`) surfaces as a raw Mongoose `ValidationError` message via `err.message`.

**Error responses**
- `400` — `unitNumber` already exists: `{message:'Unit <n> đã tồn tại'}`.
- `400` — any other thrown error (schema validation, cast error), message is the raw `err.message`.

---

### PUT /api/vocab/admin/units/:id
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
```json
{ "unitNumber": 12, "title": "Environment (updated)", "description": "", "level": "B2", "isActive": false }
```
Only `unitNumber`/`title`/`description`/`level`/`isActive` are read from the body — extra fields (e.g. `words`) are silently ignored by this route (use the word-management endpoints below for that).

**Response** (200)
```json
{ "success": true, "unit": { "_id": "...", "title": "Environment (updated)", "isActive": false } }
```

**Error responses**
- `404` — no unit with that `_id`.
- `400` — thrown error (e.g. `unitNumber` collides with another unit's, raising a Mongo duplicate-key error).

---

### DELETE /api/vocab/admin/units/:id
**Auth:** Bearer token required
**Permissions:** admin only (blocked for `teacher` by the route-local `teacherOnly` middleware's DELETE check)
**Rate limit:** none

**Response** (200)
```json
{ "success": true, "message": "Đã xoá unit" }
```
`vocabService.deleteUnit` doesn't check existence first — deleting a nonexistent `_id` still returns success.

**Error responses**
- `403` — caller is `teacher` (not `admin`): `{message:'Giáo viên không có quyền xóa nội dung'}`.
- `500` — unhandled error.

---

### PATCH /api/vocab/admin/units/reorder
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
- Body: array of `{_id, ...}` (only `_id` position/order in the array is used — no `sortOrder` field is read from the body itself).
```json
[{ "_id": "665f1..." }, { "_id": "665f2..." }]
```

**Response** (200)
```json
{ "success": true, "message": "Đã cập nhật thứ tự" }
```

**Validation**
- Controller: body must be an array.
- Service (`vocabService.reorderUnits`): two-phase update — first moves every unit's `unitNumber` into a temporary `10000+` range (to dodge the `unitNumber` unique-index conflict mid-reorder), then assigns final `1`-based `unitNumber`s matching the array's order. `sortOrder` is set to the array index in the same first pass.

**Error responses**
- `400` — body is not an array: `{message:'Body phải là array'}`.
- `500` — unhandled error.

---

### POST /api/vocab/admin/units/:id/words
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
```json
{ "word": "sustainability", "meaning": "tính bền vững", "example": "...", "phonetic": "", "partOfSpeech": "noun", "level": "B2", "difficulty": 3 }
```

**Response** (201)
```json
{ "success": true, "message": "Đã thêm \"sustainability\"", "wordCount": 43 }
```
**Duplicate word** (case-insensitive match against existing words in the unit) is **not** a 4xx — it's a plain `200` with `success:false`:
```json
{ "success": false, "message": "\"sustainability\" đã có trong unit này" }
```

**Error responses**
- `404` — unit not found.
- `200` (not an error status, but a failure result) — duplicate word.
- `400` — any other thrown error (e.g. schema validation on the word subdocument).

---

### PUT /api/vocab/admin/units/:id/words/:wordIndex
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
- Path params: `wordIndex` — a numeric **array index**, not a subdocument ID (`WordSchema` has `_id:false`).
- Body (any subset of): `type, word, meaning, example, phonetic, partOfSpeech, level, difficulty, audioUrl, paraphrase, explanation`.

**Response** (200)
```json
{ "success": true, "word": { "word": "sustainability", "meaning": "tính bền vững, ..." } }
```

**Error responses**
- `404` — unit not found.
- `400` — `wordIndex` isn't a valid in-range index (`{message:'Index không hợp lệ'}`) — a real risk if two admins edit the same unit concurrently, since indices shift on delete.
- `400` — any other thrown error.

---

### DELETE /api/vocab/admin/units/:id/words/:wordIndex
**Auth:** Bearer token required
**Permissions:** admin only (DELETE-blocked for `teacher`)
**Rate limit:** none

**Response** (200)
```json
{ "success": true, "message": "Đã xoá \"sustainability\"" }
```

**Error responses**
- `403` — caller is `teacher`.
- `404` — unit not found.
- `400` — `wordIndex` out of range.
- `500` — unhandled error.

---

### POST /api/vocab/admin/units/:id/words/bulk
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
```json
{ "words": [{ "word": "biodiversity", "meaning": "..." }], "replace": false }
```
`replace:true` overwrites the unit's entire `words` array; `replace:false` (default) appends only words not already present (case-insensitive match).

**Response** (200)
```json
{ "success": true, "message": "Đã import mới từ vào Unit 12", "wordCount": 44 }
```

**Error responses**
- `400` — `words` missing, not an array, or empty.
- `404` — unit not found.
- `400` — any other thrown error.

---

### POST /api/vocab/admin/units/:id/split
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
```json
{ "chunkSize": 100 }
```

**Response** (200)
```json
{ "success": true, "message": "Đã chia \"Environment\" thành 3 phần (tối đa 100 từ/phần)", "parts": 3 }
```
Splits one oversized unit into multiple units of at most `chunkSize` words each; the original unit becomes part `1/n` in place, new units are created for the rest with fresh `unitNumber`s appended after the current max, and every other unit's `sortOrder` is shifted to make room.

**Error responses**
- `404` — unit not found.
- `400` — unit already has `<= chunkSize` words: `{message:'Unit chỉ có <n> từ, không cần chia'}`.
- `500` — unhandled error.

---

### POST /api/vocab/admin/split-all
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request**
```json
{ "chunkSize": 120 }
```

**Response** (200) — if at least one unit exceeded `chunkSize`:
```json
{ "success": true, "message": "Đã tách 2 unit lớn thành 5 unit (mỗi phần ≤120 từ)", "results": [{ "title": "Environment", "parts": 3 }] }
```
If no active unit exceeds `chunkSize`, no splitting happens and `results` is omitted:
```json
{ "success": true, "message": "Không có unit nào vượt quá 120 từ", "parts": 0 }
```
As a final step, this endpoint **renumbers every unit's `unitNumber`** (not just the split ones) to match current `sortOrder` — a batch operation with wider blast radius than the per-unit `split` endpoint above.

**Error responses**
- `500` — unhandled error.

---

### POST /api/vocab/admin/import
**Auth:** Bearer token required
**Permissions:** teacher or admin
**Rate limit:** none

**Request** — a single unit object or an array of them:
```json
[{ "unitNumber": 20, "title": "Technology", "level": "B2", "words": [] }]
```

**Response** (200)
```json
{ "success": true, "message": "Import xong: 1 tạo mới, 0 cập nhật", "results": [{ "unitNumber": 20, "status": "created", "wordCount": 0 }] }
```
Per-item, existing `unitNumber`s are updated in place (only fields present in the payload overwrite; `words` only overwritten if the payload's `words` array is non-empty), new ones are created. Items missing `unitNumber` or `title` are skipped (`status:'skipped'`) rather than aborting the whole batch.

**Error responses**
- `500` — unhandled error (note: a single malformed item doesn't fail the batch — see `skipped` above — so this only fires on an actual exception, e.g. a DB error mid-loop).

---

**Vocabulary books (`/api/vocabbook`)**

Every route requires `auth` and scopes to `req.user._id` — no separate role gate. On first access, `ensureDefaultBooks` transparently creates 5 default notebooks (`Sổ 1`…`Sổ 5`) for any user who has none yet, so `GET /` for a brand-new user is never actually empty.

### GET /api/vocabbook/
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Response** (200)
```json
{ "success": true, "books": [{ "_id": "...", "name": "Sổ 1", "color": "#3d8bff", "emoji": "📘", "isDefault": true, "totalWords": 12, "daThucCount": 5, "nhoSoSoCount": 3, "chuaThuocCount": 4 }] }
```
`daThucCount`/`nhoSoSoCount`/`chuaThuocCount` are derived counts by `words[].status` (`da-thuoc`/`nho-so-so`/`chua-thuoc`). If `req.user.role === 'student'`, this call also fire-and-forget increments a daily `VocabActivity.viewCount`.

**Error responses**
- `500` (generic) — unhandled error.

---

### PUT /api/vocabbook/reorder
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
```json
{ "order": [{ "_id": "665f1...", "sortOrder": 0 }, { "_id": "665f2...", "sortOrder": 1 }] }
```

**Response** (200)
```json
{ "success": true }
```

**Error responses**
- `400` — `order` missing or not an array.
- `500` — unhandled error.

---

### POST /api/vocabbook/practice-complete
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
```json
{ "wordsAnswered": 8 }
```

**Response** (200) — normal case, streak updated:
```json
{ "success": true, "streak": 4 }
```
Non-student caller (teacher/admin): `{success:true}` with no `streak` field — silently a no-op. **Fewer than 5 words answered is not an error** — it's a `200` with `success:false`:
```json
{ "success": false, "message": "Cần ít nhất 5 từ để tính streak" }
```

**Error responses** — none at HTTP level; both "rejection" cases above still return `200`.

---

### GET /api/vocabbook/:id
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Response** (200) — full book document including all words.
```json
{ "success": true, "book": { "_id": "...", "name": "Sổ 1", "words": [{ "_id": "...", "word": "sibling", "status": "chua-thuoc" }] } }
```

**Error responses**
- `404` — no book with that `_id` owned by the caller (covers both "doesn't exist" and "belongs to someone else" — ownership is enforced at the query level, not app-code comparison).
- `500` — unhandled error.

---

### POST /api/vocabbook/
**Auth:** Bearer token required
**Permissions:** owner only (creates a book owned by the caller)
**Rate limit:** none

**Request**
```json
{ "name": "IELTS Speaking Part 2", "emoji": "🎤", "color": "#34d399" }
```

**Response** (201)
```json
{ "success": true, "book": { "_id": "...", "name": "IELTS Speaking Part 2", "emoji": "🎤", "color": "#34d399", "isDefault": false } }
```

**Validation**
- Controller: `name` required (non-empty after trim).
- Service: hard cap of **15 books per user** — the 16th create attempt is rejected regardless of `name` validity.

**Error responses**
- `400` — `name` missing/blank.
- `400` — caller already has 15 books: `{message:'Bạn đã đạt giới hạn 15 sổ từ vựng...'}`.
- `500` — unhandled error.

---

### PUT /api/vocabbook/:id
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request** — any subset of:
```json
{ "name": "Renamed book", "emoji": "📗", "color": "#e53935" }
```

**Response** (200)
```json
{ "success": true, "book": { "_id": "...", "name": "Renamed book" } }
```

**Error responses**
- `404` — book not found / not owned by caller.
- `500` — unhandled error.

---

### POST /api/vocabbook/:id/merge
**Auth:** Bearer token required
**Permissions:** owner only (destination and all sources must belong to the caller)
**Rate limit:** none

**Request**
```json
{ "sourceIds": ["665f2...", "665f3..."] }
```

**Response** (200)
```json
{ "success": true, "addedCount": 18, "mergedCount": 2, "book": { "_id": "...", "words": ["..."] } }
```
Words are merged case-insensitively by `word` text; the merge stops adding once the destination hits the 300-word cap (silently — no error, `addedCount` just ends up lower than the sources' combined total). Default books (`isDefault:true`) can never be used as a merge **source** (they're filtered out of the source query) but can be a merge **destination**. Successfully-merged source books are deleted afterward.

**Error responses**
- `400` — `sourceIds` missing/empty.
- `404` — destination book not found / not owned by caller.
- `400` — none of the `sourceIds` resolved to a valid, owned, non-default book: `{message:'Không có sổ hợp lệ để gộp'}`.

---

### DELETE /api/vocabbook/:id
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Response** (200)
```json
{ "success": true }
```

**Error responses**
- `404` — book not found / not owned by caller.
- `400` — book is a default book (`isDefault:true`) — these can never be deleted: `{message:'Không thể xoá sổ mặc định'}`.

---

### POST /api/vocabbook/:id/words
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
```json
{ "word": "resilient", "meaning": "kiên cường", "example": "...", "phonetic": "", "partOfSpeech": "adj", "source": "reading", "note": "" }
```

**Response** (201)
```json
{ "success": true, "message": "Đã lưu \"resilient\" vào \"Sổ 1\"", "word": { "_id": "...", "word": "resilient", "status": "chua-thuoc" } }
```
Duplicate word (case-insensitive) is, again, a `200` with `success:false`, not a 4xx:
```json
{ "success": false, "message": "\"resilient\" đã có trong sổ này" }
```
If the caller is a `student`, this also fire-and-forget logs a daily `wordsAdded` activity count and updates the learning streak.

**Error responses**
- `400` — `word` missing/blank.
- `404` — book not found / not owned by caller.
- `400` — book already has 300 words: `{message:'Sổ "<name>" đã đạt giới hạn 300 từ...'}`.
- `200` (not an error status) — duplicate word.

---

### PATCH /api/vocabbook/:id/words/:wordId
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request** — any subset of:
```json
{ "status": "da-thuoc", "note": "Reviewed", "wrongCount": 0 }
```

**Response** (200)
```json
{ "success": true, "word": { "_id": "...", "status": "da-thuoc" } }
```
If `status` actually changes (and caller is a `student`), a daily `wordsStudied` activity count is incremented and the learning streak updated — this is the one path in `vocabBook.js` that feeds the streak system from editing a word rather than adding/bulk-importing.

**Error responses**
- `404` — book not found / not owned by caller.
- `404` — book found but no word with that `wordId` inside it.
- `500` — unhandled error.

---

### DELETE /api/vocabbook/:id/words/:wordId
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Response** (200)
```json
{ "success": true }
```
No existence check on the word itself — if `wordId` doesn't match any word, the filter is a no-op and this still returns success.

**Error responses**
- `404` — book not found / not owned by caller.
- `500` — unhandled error.

---

### POST /api/vocabbook/:id/words/bulk
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
```json
{ "words": [{ "word": "ubiquitous", "meaning": "phổ biến khắp nơi" }] }
```

**Response** (200)
```json
{ "success": true, "addedCount": 1, "skippedDup": 0, "skippedLimit": 0, "message": "Đã thêm 1 từ" }
```
`message` is assembled conditionally — skip counts only appear in the message text if non-zero (e.g. `"Đã thêm 3 từ · 2 từ trùng · 1 từ vượt giới hạn 300"`).

**Error responses**
- `400` — `words` missing, not an array, or empty.
- `404` — book not found / not owned by caller.

---

### DELETE /api/vocabbook/:id/words
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
```json
{ "wordIds": ["665f10...", "665f11..."] }
```

**Response** (200)
```json
{ "success": true, "message": "Đã xoá 2 từ" }
```
Note: the reported count is `wordIds.length` from the request, **not** the number of words actually matched/removed — if some IDs didn't exist in the book, the message still claims the requested count.

**Error responses**
- `404` — book not found / not owned by caller.
- `500` — unhandled error.

---

**Difficult words (`/api/difficult-words`)**

Auto-populated by other practice modules reporting wrong answers (`POST /report`), not directly authored by the student. All routes require `auth` and scope to `req.user._id`.

### GET /api/difficult-words/
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request** — no body/params.

**Response** (200)
```json
{ "success": true, "words": [{ "_id": "...", "word": "ubiquitous", "wrongCount": 5, "lastWrongAt": "...", "meaning": "..." }] }
```
Only words with `wrongCount >= 3` are returned — a word wrong once or twice doesn't show up here at all, sorted hardest-first (`wrongCount` desc, then most-recently-wrong).

**Error responses**
- `500` (generic) — unhandled error.

---

### POST /api/difficult-words/report
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
```json
{ "words": [{ "word": "ubiquitous", "meaning": "phổ biến khắp nơi", "phonetic": "", "partOfSpeech": "adj", "example": "" }], "source": "reading-practice" }
```

**Response** (200)
```json
{ "success": true }
```
This is an **upsert with `$inc`**, not a plain insert — reporting the same word again just increments `wrongCount` and refreshes `lastWrongAt`; it never creates duplicate rows for the same `(userId, word)` pair (enforced by a unique compound index at the schema level too). An empty `words` array short-circuits to success without touching the DB.

**Error responses**
- `500` (generic) — unhandled error (e.g. a bulk-write failure).

---

### PATCH /api/difficult-words/:id
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request** — only `meaning`/`phonetic` are honored:
```json
{ "meaning": "phổ biến, có mặt khắp nơi", "phonetic": "/juːˈbɪkwɪtəs/" }
```

**Response** (200)
```json
{ "success": true, "word": { "_id": "...", "meaning": "phổ biến, có mặt khắp nơi" } }
```

**Error responses**
- `404` — no matching word owned by the caller.
- `500` (generic) — unhandled error.

---

### DELETE /api/difficult-words/:id
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Response** (200)
```json
{ "success": true }
```
No existence check — deleting an already-gone or never-existed `id` still returns `200 {success:true}`.

**Error responses**
- `500` (generic) — unhandled error.

---

## Courses

Base path: `/api/courses`.

### GET /api/courses/
**Auth:** none
**Permissions:** none (public marketing content)
**Rate limit:** none

**Request** — no body/params.

**Response** (200)
```json
{
  "success": true,
  "courses": [
    {
      "_id": "...", "title": "IELTS Foundation", "subtitle": "Dành cho: Mất gốc",
      "description": "...", "price": "Liên hệ tư vấn", "imageUrl": "img/course-foundation.jpg",
      "placeholder": "📚", "category": "ielts", "level": "Mất gốc", "levelColor": "blue",
      "duration": "6–8 tháng", "classSize": "Nhóm ≤ 8 người", "isActive": true, "order": 0
    }
  ]
}
```
Only `isActive:true` courses are returned, sorted by `order` then `createdAt`. `Cache-Control: public, max-age=120` is set.

**Validation** — none (read-only, no input).

**Error responses**
- `500` — `{success:false, message:'Lỗi server'}`.

---

## Contact

Base path: `/api/contact`.

### POST /api/contact/
**Auth:** none
**Permissions:** none (public inquiry form)
**Rate limit:** 1 hour window, max 5 requests, keyed by IP (default `express-rate-limit` IP keying, not the custom email/username scheme `auth.js` uses) — added specifically because this endpoint triggers an outbound email per request (inbox-flooding / Resend-quota-abuse defense).

**Request**
```json
{ "name": "Nguyen Van A", "phone": "0901234567", "email": "a@example.com", "course": "IELTS Foundation", "message": "Tôi muốn tư vấn khóa học" }
```
Only `name`/`phone` are required; `email`/`course`/`message` default to `''` if omitted.

**Response** (200) — two possible success messages depending on whether the notification email actually sent:
```json
{ "success": true, "message": "Đã nhận thông tin! Chúng tôi sẽ liên hệ bạn sớm nhất." }
```
or, if `contactService.sendInquiry` throws (e.g. `RESEND_API_KEY` not configured, or the Resend call fails) — **the failure is swallowed and the client still gets a success response**, just with a slightly different message:
```json
{ "success": true, "message": "Đã nhận thông tin! Chúng tôi sẽ liên hệ bạn sớm." }
```
This is deliberate: the inquiry itself (logged server-side via `console.log`) is considered to have "succeeded" independent of whether the notification email went out.

**Validation**
- Controller: `name` and `phone` required.
- Service (`contactService.sendInquiry`): if `RESEND_API_KEY` isn't configured, the function resolves with `{sent:false}` rather than throwing — so a fully-unconfigured mailer still shows the "sớm nhất" (fuller) success message, not the fallback one; only an actual Resend API error triggers the fallback message. All user-supplied fields are HTML-escaped before being interpolated into the outbound email body (a prior HTML-injection fix — see `services/contactService.js` header comment).

**Error responses**
- `400` — `name` or `phone` missing.
- Note there is **no 500 path visible to the client** — mail failures are caught and still return `200 {success:true}` (see Response above). An error thrown before that inner `try` (e.g. inside `catchAsync`'s own wrapping, essentially unreachable given the code) would fall through to `catchAsync`'s generic handler.

---

## Health / Monitoring

`GET /health/live`, `GET /health/ready`, and `GET /health/` (`backend/routes/health.js`) are intentionally documented in only two places, not here: the route file itself carries extensive inline comments explaining exactly what each endpoint checks and why (liveness vs. readiness vs. detailed dependency status, why `/live` must never be Render's configured health-check path, the deliberate cost-control decision to check Gemini by API-key presence only rather than a live call), and [`docs/RUNBOOK.md`](RUNBOOK.md) covers them operationally (which one to poll, what a `degraded`/`503` response means during an incident). All three are unauthenticated and unrated-limited by design — see the route file for the reasoning.


---


For the general auth flow, the AI grading workflow, and the request lifecycle these endpoints sit inside, see [`ARCHITECTURE.md`](ARCHITECTURE.md) rather than looking for it repeated here.

All responses are JSON with a `success` boolean unless noted otherwise. All error bodies below are the actual shape returned by the controller/service — several routes genuinely diverge from the rest of the API (bare `{success:false}` with no `message`, raw `err.message` leaked to the client, `200` responses that carry `success:false`); these are called out explicitly rather than normalized, because they're real client-visible behavior.

## Reading

### GET /api/reading/tests
**Auth:** Bearer token required
**Permissions:** any authenticated user
**Rate limit:** none

**Request**
- No params/body.

**Response** (200)
```json
{
  "success": true,
  "tests": [{ "_id": "...", "name": "Reading Test 1", "testNumber": 1, "isActive": true, "lastAttempt": { "bandScore": 6.5, "correctCount": 26, "endTime": "..." } }],
  "userPlan": "free",
  "planExpiresAt": null
}
```
Response carries `Cache-Control: private, max-age=120`.

**Validation**
- None beyond auth.

**Error responses**
- 500 on unexpected failure (`{ success:false, message:'Lỗi server' }`).

---

### POST /api/reading/start
**Auth:** Bearer token + premium (`requirePremium`, also allows teacher/admin)
**Permissions:** premium / teacher / admin
**Rate limit:** 10 requests / 15 min per user (`skip` for `role==='admin'`), keyed by `req.user._id` else IP → 429 `{ success:false, message:'Quá nhiều yêu cầu, thử lại sau 15 phút.' }`

**Request**
- Body: `{ "testId": "665f..." }`

**Response** (200)
```json
{
  "success": true,
  "attemptId": "...",
  "testName": "Reading Test 1",
  "passages": [ { "_id": "...", "title": "...", "category": "passage1", "content": "...", "questionGroups": [ { "questions": [{ "questionNumber": 1, "type": "true-false-ng", "questionText": "..." }] } ] } ],
  "duration": 3600
}
```
`correctAnswer`/`explanation` are stripped from every question via a Mongo `$project` before the passages are returned — a student can never read the answer key by inspecting the `/start` response.

**Validation**
- `testId` must resolve to an existing `ReadingTest`.
- One random passage is sampled per category (`passage1`/`passage2`/`passage3`); the DB must have at least one active passage in each category.

**Error responses**
- 404 `{ success:false, message:'Không tìm thấy bộ đề' }` — testId not found.
- 400 `{ success:false, message:'Database chưa đủ bài đọc (cần ít nhất 1 bài ở mỗi category)' }` — insufficient content.
- 403 (from `requirePremium`) `{ success:false, message:'Bạn cần nâng cấp lên Premium để làm bài thi này', code:'PLAN_REQUIRED', requiresPremium:true }`.
- 429 rate-limited.
- 500 generic.

---

### POST /api/reading/submit
**Auth:** Bearer token required
**Permissions:** owner only (the in-progress `TestAttempt` must belong to `req.user`)
**Rate limit:** none

**Request**
- Body: `{ "attemptId": "...", "answers": [{ "questionNumber": 1, "userAnswer": "TRUE" }] }`

**Response** (200)
```json
{ "success": true, "result": { "attemptId": "...", "bandScore": 7.0, "correctCount": 30, "wrongCount": 6, "skippedCount": 4, "totalQuestions": 40, "duration": 2130 } }
```

**Validation**
- **Server-side re-grading**: every answer is re-graded against the real passage's `correctAnswer`/`interchangeableAnswers` pool (`gradeGroups()`), server-side. There is no client-supplied `isCorrect`/`bandScore` field accepted at all here — the client only ever sends raw answers, so this endpoint has nothing to "override," it's simply never trusted.
- Attempt must exist, belong to the caller, and be `status: 'in-progress'` (prevents re-submitting a completed attempt).

**Error responses**
- 404 `{ success:false, message:'Không tìm thấy bài thi đang làm' }` — no matching in-progress attempt for this user/id.
- 500 generic.

---

### GET /api/reading/attempt/:id/review
**Auth:** Bearer token required
**Permissions:** owner only
**Rate limit:** none

**Request**
- Path params: `id` — `TestAttempt` id.

**Response** (200)
```json
{ "success": true, "attempt": { "_id": "...", "testName": "Reading Test 1", "bandScore": 7.0, "passages": [ { "questionGroups": [ { "questions": [{ "questionNumber": 1, "correctAnswer": "TRUE", "userAnswer": "TRUE", "isCorrect": true, "explanation": "..." }] } ] } ] } }
```

**Validation**
- Query scopes to `{ _id: attemptId, userId, status:'completed' }` at the Mongoose level — an in-progress or someone else's attempt returns 404, not 403 (ownership is enforced by query filter, not fetch-then-compare).

**Error responses**
- 404 `{ success:false, message:'Không tìm thấy bài thi' }`.
- 500 generic.

---

### GET /api/reading/history
**Auth:** Bearer token required · **Permissions:** any authenticated user · **Rate limit:** none

**Response** (200): `{ "success": true, "history": [ /* up to 50 completed TestAttempt docs, testId populated, answers/passagesUsed excluded */ ] }`

**Error responses:** 500 generic.

---

### GET /api/reading/practice/list
**Auth:** Bearer token required · **Permissions:** any authenticated user · **Rate limit:** none

**Request**
- Query params: `category` — one of `passage1`, `passage2`, `passage3`, `actual-test`.

**Response** (200)
```json
{ "success": true, "passages": [ { "_id": "...", "title": "...", "questionCount": 13, "questionGroups": [{ "groupType": "true-false-ng", "questions": [{ "questionNumber": 1, "type": "true-false-ng" }] }] } ], "doneMap": { "665f...": { "count": 2, "lastScore": 9, "lastTotal": 13 } } }
```
Passage list is answer-stripped (only `questionNumber`/`type` per question). `doneMap` is an aggregate of the caller's own `ReadingPracticeAttempt`s per passage.

**Validation**
- `category` must be one of the four allowed values (route-level list, checked in the controller) — else 400.

**Error responses**
- 400 `{ success:false, message:'Category không hợp lệ' }`.
- 500 generic.

---

### GET /api/reading/practice/by-id/:id
**Auth:** Bearer token required · **Permissions:** any authenticated user · **Rate limit:** none

**Request:** Path params: `id` — Passage id.

**Response** (200): `{ "success": true, "passage": { /* full Passage document, isActive:true only */ } }`

**Validation**
- Note: unlike `/start`, this endpoint does **not** strip `correctAnswer`/`explanation` — `readingService.getPracticePassageById()` returns the raw `Passage` document. Practice mode relies on the frontend not rendering those fields; a client can read the answer key directly from this response's JSON.

**Error responses**
- 404 `{ success:false, message:'Không tìm thấy bài đọc' }`.
- 500 generic.

---

### POST /api/reading/practice/save
**Auth:** Bearer token required · **Permissions:** owner only · **Rate limit:** none

**Request**
- Body: `{ "passageId": "...", "passageTitle": "...", "category": "passage1", "answers": [{ "questionNumber": 1, "userAnswer": "TRUE" }], "timeTaken": 340 }`

**Response** (200): `{ "success": true, "attemptId": "..." }`

**Validation**
- `passageId` required, `answers` must be an array — 400 otherwise.
- **Server-side re-grading**: if `passageId` resolves to a real `Passage`, `correctCount`/`wrongCount`/`skippedCount`/per-question `isCorrect` are all recomputed via `gradeGroups()` against the real answer key — any client-supplied `correctCount`/`wrongCount`/`skippedCount`/`isCorrect` fields in the body are ignored. Only falls back to trusting the client's counts if `passageId` doesn't resolve to a passage at all (shouldn't happen in normal use).

**Error responses**
- 400 `{ success:false, message:'Thiếu dữ liệu' }` — missing `passageId` or non-array `answers`.
- 500 `{ success:false, message:'Lỗi server' }` (logged as `[Reading practice save]`).

---

### GET /api/reading/practice/history
**Auth:** Bearer token required · **Rate limit:** none
**Response:** `{ "success": true, "attempts": [ /* up to 50 ReadingPracticeAttempt, answers excluded */ ] }`
**Error responses:** 500 (`[Reading practice history]`).

---

### GET /api/reading/practice/history/:attemptId
**Auth:** Bearer token required · **Permissions:** owner only · **Rate limit:** none
**Response:** `{ "success": true, "attempt": { /* full ReadingPracticeAttempt incl. answers */ }, "passage": { /* full Passage, incl. correctAnswer */ } }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy' }`; 500 (`[Reading practice history detail]`).

---

### GET /api/reading/practice/:category
**Auth:** Bearer token required · **Rate limit:** none
Route ordering note: this wildcard route is registered last among `/practice/*` GETs in `routes/reading.js` so it can't shadow `/practice/list`, `/practice/history`, `/practice/history/:attemptId`.

**Request:** Path params: `category` — `passage1`/`passage2`/`passage3` only (no `actual-test` here).

**Response:** `{ "success": true, "passage": { /* one random full Passage doc for the category */ } }`

**Validation:** `category` checked against the 3-item allow-list.

**Error responses**
- 400 `{ success:false, message:'Category không hợp lệ' }`.
- 404 `{ success:false, message:'Chưa có bài đọc cho loại này' }` — no active passage in that category.
- 500 generic.

## Listening

### GET /api/listening/admin/tests
**Auth:** Bearer token required · **Permissions:** teacher or admin · **Rate limit:** none
**Response:** `{ "success": true, "tests": [ { "name": "...", "testNumber": 1, "totalQuestions": 40, "totalParts": 4, "sections": [...] } ] }`
**Error responses:** 500 `{ success:false, message: err.message }` (raw Mongoose error text, not a generic message).

---

### GET /api/listening/admin/tests/:id
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Response:** `{ "success": true, "test": { /* full ListeningTest incl. correctAnswer */ } }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy' }` (via `NotFoundError`, `err.statusCode`); 500 on other errors.

---

### POST /api/listening/admin/tests
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** Body — full `ListeningTest` shape (`name`, `sections`, etc.), passed straight into `new ListeningTest(body)`.
**Response** (201): `{ "success": true, "test": { /* created doc */ } }`
**Validation:** entirely Mongoose schema-level — whatever the `ListeningTest` schema requires/rejects.
**Error responses:** 400 `{ success:false, message: err.message }` on any Mongoose validation failure (raw message).

---

### PUT /api/listening/admin/tests/:id
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** Path param `id`; body — partial/full `ListeningTest` fields. Uses `findByIdAndUpdate(..., { new:true, runValidators:true })`.
**Response:** `{ "success": true, "test": { ... } }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy' }`; 400 `{ success:false, message: err.message }` on validation failure.

---

### DELETE /api/listening/admin/tests/:id
**Auth:** Bearer token required · **Permissions:** teacher or admin (soft delete) — **teachers are explicitly blocked from this DELETE** by the route's own `teacherOnly` middleware (`req.method === 'DELETE'` check), so only `admin` can actually reach the controller.
**Response:** `{ "success": true, "message": "Đã ẩn đề nghe" }` — sets `isActive:false`, does not remove the document.
**Error responses:** 403 `{ success:false, message:'Giáo viên không có quyền xóa nội dung' }` for teachers; 500 generic for others.

---

### DELETE /api/listening/admin/tests/:id/permanent
**Auth:** Bearer token required · **Permissions:** admin only (same teacher-DELETE block as above)
**Response:** `{ "success": true, "message": "Đã xóa vĩnh viễn đề nghe" }`
**Error responses:** 403 for teachers; 404 `{ success:false, message:'Không tìm thấy đề nghe' }` (via `NotFoundError`) if the id doesn't exist; 500 generic.

---

### POST /api/listening/admin/tests/:id/audio
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** `multipart/form-data`, field `audio` (multer memory storage, 200MB limit, mimetype must start with `audio/` or be `video/mp4`).
**Response:** `{ "success": true, "message": "Upload audio thành công", "audioUrl": "https://res.cloudinary.com/...", "audioDuration": 1834 }`
**Validation:** multer `fileFilter` rejects non-audio mimetypes at the multipart-parsing layer (throws, caught by error middleware — not a controlled JSON 400 from this handler).
**Error responses:** 400 `{ success:false, message:'Không có file audio' }` if `req.file` missing; 500 `{ success:false, message:'Upload thất bại: '+err.message }` on Cloudinary failure.

---

### POST /api/listening/admin/upload-audio
**Auth:** Bearer token required · **Permissions:** teacher or admin
Same multer constraints as above; standalone (not attached to a test yet).
**Response:** `{ "success": true, "audioUrl": "...", "audioDuration": 1834, "originalName": "part1.mp3" }`
**Error responses:** 400 no file; 500 `'Upload thất bại: '+err.message`.

---

### POST /api/listening/admin/upload-map-image
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** Body: `{ "imageBase64": "data:image/png;base64,..." }`
**Response:** `{ "success": true, "url": "https://res.cloudinary.com/..." }`
**Validation:** `imageBase64` required; must pass `isImageDataUri()` (`utils/validation.js`) — rejects non-data-URI or non-image payloads before ever calling Cloudinary.
**Error responses:** 400 `{ success:false, message:'Thiếu imageBase64' }`; 400 `{ success:false, message:'Dữ liệu ảnh không hợp lệ' }`; 500 `'Upload thất bại: '+err.message`.

---

### PUT /api/listening/admin/tests/:id/transcript
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** Body: `{ "sectionTranscripts": [{ "partNumber": 1, "transcript": "..." }] }`
**Response:** `{ "success": true, "message": "Đã cập nhật transcript" }`
**Validation:** `sectionTranscripts` must be an array; unmatched `partNumber`s are silently skipped (no error).
**Error responses:** 400 `{ success:false, message:'sectionTranscripts phải là array' }`; 404 `{ success:false, message:'Không tìm thấy' }`; 500 generic.

---

### GET /api/listening/admin/attempts
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** Query: `testId`, `userId`, `page` (default 1), `limit` (default 50).
**Response:** `{ "success": true, "attempts": [ /* populated user + test */ ], "total": 214, "page": 1, "limit": 50 }`
**Error responses:** 500 generic.

---

### GET /api/listening/admin/attempts/stats
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** Query: `testId` (optional — omit for all-tests stats).
**Response:** `{ "success": true, "overview": { "totalAttempts": 214, "avgBand": 6.3, ... }, "byTest": [...], "topStudents": [...] }`
**Error responses:** 500 generic.

---

### GET /api/listening/practice/list
**Auth:** Bearer token required · **Permissions:** any authenticated user
**Request:** Query: `part` (1–4) — required unless `actualTest=true`.
**Response:** `{ "success": true, "sections": [ { "_id":"...", "partNumber":1, "questionCount":10, "questionGroups":[{ "groupType":"...", "questions":[{"questionNumber":1,"type":"..."}] }] } ], "doneMap": { "...": { "count":1, "lastScore":8, "lastTotal":10 } } }`
**Validation:** if not `actualTest=true`, `part` must parse to `1|2|3|4`, else a `400`-tagged `Error` is thrown (`err.status = 400`) and surfaced by the controller as `res.status(err.status || 500)`.
**Error responses:** 400 `{ success:false, message:'Part không hợp lệ (1–4)' }`; 500 generic.

---

### GET /api/listening/practice/by-id/:id
**Auth:** Bearer token required
**Response:** `{ "success": true, "section": { /* full ListeningSection incl. correctAnswer, same trust model as reading's practice/by-id */ } }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy section' }`; 500 generic.

---

### GET /api/listening/admin/sections
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Response:** `{ "success": true, "sections": [ /* all ListeningSection docs, active+inactive, sorted by part then newest */ ] }`
**Error responses:** 500 generic.

---

### GET /api/listening/admin/sections/:id
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Response:** `{ "success": true, "section": { ... } }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy' }`; 500 generic.

---

### POST /api/listening/admin/sections
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** Body — full `ListeningSection` shape.
**Response** (200, not 201 — unlike `admin/tests`): `{ "success": true, "section": { ... } }`
**Error responses:** 400 `{ success:false, message: err.message }` (raw Mongoose error).

---

### PUT /api/listening/admin/sections/:id
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** `findByIdAndUpdate(..., { new:true, runValidators:true })` — no explicit not-found check, so an unmatched `id` returns `{ success:true, section: null }`, **not a 404**.
**Response:** `{ "success": true, "section": { ... } | null }`
**Error responses:** 400 `{ success:false, message: err.message }`.

---

### DELETE /api/listening/admin/sections/:id
**Auth:** Bearer token required · **Permissions:** admin only in practice (teacher DELETE is blocked by `teacherOnly`)
**Response:** `{ "success": true }` — soft delete (`isActive:false`); no `message` field, unlike the equivalent test-hide endpoint.
**Error responses:** 403 for teachers; 500 generic.

---

### POST /api/listening/admin/sections/:id/audio
**Auth:** Bearer token required · **Permissions:** teacher or admin
Same multer audio constraints as the test-audio upload.
**Response:** `{ "success": true, "audioUrl": "...", "duration": 128, "section": { ... } }`
**Error responses:** 400 no file; 500 `{ success:false, message: err.message }` (no `'Upload thất bại: '` prefix here, unlike the test/standalone/map-image upload routes — an inconsistency worth knowing if you're matching on message text client-side).

---

### POST /api/listening/admin/assemble
**Auth:** Bearer token required · **Permissions:** teacher or admin
**Request:** Body: `{ "name": "IELTS Listening Test 5", "seriesName": "Cambridge 18", "testNumber": 5, "sectionIds": { "1": "id1", "2": "id2", "3": "id3", "4": "id4" } }` — any subset of parts 1–4 may be supplied; missing parts get an empty placeholder section.
**Response:** `{ "success": true, "test": { ... }, "message": "Đã tạo đề Listening từ bài lẻ. Upload audio tại trang Đề Listening." }`
**Validation:** `name` required (checked in controller); at least one `sectionIds` entry required; every supplied section id must resolve to a real `ListeningSection`.
**Error responses:** 400 `{ success:false, message:'Tên đề không được để trống' }`; 400 `{ success:false, message:'Chọn ít nhất 1 section' }`; 404 `{ success:false, message:'Không tìm thấy section Part N' }` for an invalid id; 500 generic.

---

### GET /api/listening/tests
**Auth:** Bearer token required
**Response:** `{ "success": true, "tests": [ { "name":"...", "testNumber":1, "totalParts":4, "totalQuestions":40, "lastAttempt": {...} } ], "userPlan": "free", "planExpiresAt": null }` — `Cache-Control: private, max-age=120`.
**Error responses:** 500 generic.

---

### POST /api/listening/tests/:id/start
**Auth:** Bearer token + premium
**Response:** `{ "success": true, "test": { "sections": [ { "questionGroups": [ { "questions": [ { "questionNumber":1, "type":"...", "options":[...] } /* correctAnswer intentionally omitted */ ] } ] } ] } }`
**Validation:** test must exist and be `isActive:true`.
**Error responses:** 403 (`requirePremium`) as documented above; 404 `{ success:false, message:'Không tìm thấy đề' }`; 500 generic.

---

### POST /api/listening/tests/:id/submit
**Auth:** Bearer token + premium
**Request:** Body: `{ "answers": { "1": "A", "2": "true" }, "startTime": "2026-07-12T08:00:00.000Z" }` (answers keyed by question number, not an array).
**Response:** `{ "success": true, "result": { "attemptId":"...", "bandScore":7.0, "correctCount":32, "wrongCount":6, "skippedCount":2, "timeTaken":1740, "questions":[...], "sections":[...], "audioUrl":"..." } }`
**Validation:**
- **Server-side re-grading**: `gradeQuestionGroups()` re-derives `isCorrect`/`correctCount`/`wrongCount`/`skippedCount` from the test's real `correctAnswer` fields — the client only ever supplies raw `answers`, nothing gradable is trusted from it.
- `timeTaken` is computed server-side from `startTime` vs. now, clamped to `[0, audioDuration*60]` — a client can't claim an impossibly short/long time.
**Error responses:** 403 premium gate; 404 `{ success:false, message:'Không tìm thấy đề' }`; 500 generic.

---

### GET /api/listening/history
**Auth:** Bearer token required
**Response:** `{ "success": true, "attempts": [ /* up to 50, testId populated */ ] }`
**Error responses:** 500 generic.

---

### GET /api/listening/history/:attemptId
**Auth:** Bearer token required · **Permissions:** owner only
**Response:** `{ "success": true, "result": { "attemptId":"...", "questions":[...], "sections":[...], "audioUrl":"..." } }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy' }` (attempt not found/not owned) or `{ success:false, message:'Đề thi không tồn tại' }` (parent test was since deleted) — two distinct 404 causes, distinguishable only by message text; 500 generic.

---

### POST /api/listening/practice/save
**Auth:** Bearer token required
**Request:** Body: `{ "sectionId":"...", "sectionTitle":"...", "partNumber":2, "answers":[{"questionNumber":11,"userAnswer":"library"}], "timeTaken":210 }`
**Response:** `{ "success": true, "attemptId":"...", "correctCount":8, "totalQuestions":10 }`
**Validation:**
- `sectionId` required, `answers` must be an array — 400 otherwise.
- **Server-side re-grading**: identical `gradeQuestionGroups()` call as `/tests/:id/submit` — no client-supplied score field is even accepted in the request shape, let alone trusted.
**Error responses:** 400 `{ success:false, message:'Thiếu dữ liệu' }`; 404 `{ success:false, message:'Không tìm thấy section' }`; 500 `{ success:false, message:'Lỗi server' }` (logged `[Listening practice save]`).

---

### GET /api/listening/practice/history
**Auth:** Bearer token required
**Response:** `{ "success": true, "attempts": [ /* up to 50, answers excluded */ ] }`
**Error responses:** 500 (`[Listening practice history]`).

---

### GET /api/listening/practice/history/:attemptId
**Auth:** Bearer token required · **Permissions:** owner only
**Response:** `{ "success": true, "attempt": { ... }, "section": { ... } }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy' }`; 500 (`[Listening practice history detail]`).

## Writing

Note: this controller's shared `guard()` wrapper deliberately leaks the raw `err.message` to the client on unhandled 500s (unlike most other files in this doc, which return a generic `'Lỗi server'`) — a preserved-not-fixed inconsistency called out in the controller's own top-of-file comment.

### POST /api/writing/start
**Auth:** Bearer token required · **Permissions:** any authenticated user (no premium gate — writing is explicitly free)

**Response** (200)
```json
{ "success": true, "exam": { "_id": "...", "name": "Writing Practice", "duration": 60, "task1": { /* random active WritingTask1 */ }, "task2": { /* random active WritingTask2 */ } } }
```

**Validation**
- If no active `WritingExam` document exists at all, one is auto-created (`name: 'Writing Practice', duration: 60`) rather than erroring — this endpoint can never 404 for "no exam configured," only for missing task content.

**Error responses**
- 404 `{ success:false, message:'Chưa có câu hỏi Task 1 nào. Vui lòng liên hệ giáo viên.' }` — no active `WritingTask1`.
- 404 `{ success:false, message:'Chưa có câu hỏi Task 2 nào. Vui lòng liên hệ giáo viên.' }`.
- 500 `{ success:false, message: err.message }`.

---

### POST /api/writing/submit
**Auth:** Bearer token required

**Request**
- Body: `{ "examId":"...", "task1Id":"...", "task2Id":"...", "task1Answer":"...", "task2Answer":"...", "wordCount1":180, "wordCount2":320, "timeTaken":3480, "status":"completed" }`

**Response** (201): `{ "success": true, "attemptId": "..." }`

**Validation**
- `examId` required (400). No grading happens here — this endpoint only stores the raw submission; actual essay scoring is a separate AI/teacher-grading path not exposed by any route in this file.
- `wordCount1`/`wordCount2`/`timeTaken` are coerced with `Number()`/`Math.floor()`/`Math.max(0, ...)` but not independently verified against the answer text — this endpoint has nothing to "re-grade" since it produces no score.

**Error responses**
- 400 `{ success:false, message:'Thiếu examId' }`.
- 404 `{ success:false, message:'Không tìm thấy đề' }` — `examId` doesn't resolve.
- 500 `{ success:false, message: err.message }`.

---

### GET /api/writing/practice/tasks
**Auth:** Bearer token required
**Request:** Query: `taskType` — `1` or `2`.
**Response:** `{ "success": true, "tasks": [ /* all active WritingTask1|2 */ ], "taskType": 1 }`
**Error responses:** 400 `{ success:false, message:'taskType phải là 1 hoặc 2' }`; 500 raw `err.message`.

---

### GET /api/writing/practice/task
**Auth:** Bearer token required
**Request:** Query: `taskType` — `1` or `2`.
**Response** (200): `{ "success": true, "task": { ... }, "taskType": 1 }`

**Validation**
- Anti-spam gate: if the caller already has a `practice`-type `WritingAttempt` with `gradingStatus` in `['pending', 'ai_done']` (i.e. submitted but not yet teacher-confirmed), a **new** task cannot be started.

**Error responses**
- 400 `{ success:false, message:'taskType phải là 1 hoặc 2' }`.
- 429 `{ success:false, pendingId:"...", message:'Bạn còn bài đang chờ chấm. Vui lòng đợi giáo viên chấm xong trước khi nộp bài mới.' }`.
- 404 `{ success:false, message:'Chưa có đề bài. Vui lòng liên hệ giáo viên.' }` — no active task of that type.
- 500 raw `err.message`.

---

### POST /api/writing/practice/submit
**Auth:** Bearer token required

**Request**
- Body: `{ "taskType": 1, "taskId": "...", "answer": "The chart shows...", "wordCount": 165 }`

**Response** (201): `{ "success": true, "attemptId": "..." }`

**Validation**
- `taskType` must be `1` or `2`; `answer` must be non-empty after `.trim()`.
- Same pending-attempt 429 gate as `/practice/task`.
- No correctness scoring occurs (essay grading is out of scope for this route file — a teacher/AI grades it later).

**Error responses**
- 400 `{ success:false, message:'taskType phải là 1 hoặc 2' }`.
- 400 `{ success:false, message:'Bài làm không được để trống' }`.
- 429 `{ success:false, message:'Bạn còn bài đang chờ chấm.' }` (note: shorter message than the `/practice/task` 429, no `pendingId` field here).
- 500 raw `err.message`.

---

### GET /api/writing/practice/history
**Auth:** Bearer token required
**Response:** `{ "success": true, "attempts": [ /* up to 20, practice-type only, essay text excluded */ ] }`
**Error responses:** 500 raw `err.message`.

---

### GET /api/writing/practice/draft
**Auth:** Bearer token required
**Response:** `{ "success": true, "draft": { "taskType":1, "task":{...}, "answer":"...", "wordCount":80, "seconds":420, "savedAt":"..." } | null }`
**Error responses:** 500 raw `err.message`.

---

### POST /api/writing/practice/draft
**Auth:** Bearer token required
**Request:** Body: `{ "taskType":1, "task":{...}, "answer":"...", "wordCount":80, "seconds":420 }` — single draft per user, upserted (`findOneAndUpdate` with `upsert:true`).
**Response:** `{ "success": true }`
**Validation:** `task` and `taskType` required — 400 otherwise.
**Error responses:** 400 `{ success:false, message:'Thiếu dữ liệu' }`; 500 raw `err.message`.

---

### DELETE /api/writing/practice/draft
**Auth:** Bearer token required
**Response:** `{ "success": true }` (idempotent — succeeds even if no draft existed).
**Error responses:** 500 raw `err.message`.

---

### GET /api/writing/unread-feedback-count
**Auth:** Bearer token required
**Response:** `{ "success": true, "count": 3 }` — count of `WritingAttempt`s with `gradingStatus:'confirmed'` and `feedbackRead` not `true`.
**Error responses:** 500 `{ success:false, count:0 }` — note: **no `message` field** on this endpoint's error path, distinct from every other route in this file, and it degrades to `count:0` rather than omitting the field.

---

### PATCH /api/writing/attempt/:id/mark-read
**Auth:** Bearer token required · **Permissions:** owner only
**Response:** `{ "success": true }` — only actually flips `feedbackRead` if the attempt's `gradingStatus === 'confirmed'`; called on an attempt still pending grading still returns `success:true` but is a no-op.
**Error responses:** 404 `{ success:false }`; 403 `{ success:false }` — both **omit `message` entirely**; 500 `{ success:false }` (also no `message`).

---

### GET /api/writing/my-history
**Auth:** Bearer token required
**Response:** `{ "success": true, "attempts": [ /* up to 50, all submission types, essay text excluded */ ] }`
**Error responses:** 500 raw `err.message`.

---

### GET /api/writing/attempt/:id
**Auth:** Bearer token required · **Permissions:** owner, or teacher/admin
**Response:** `{ "success": true, "attempt": { /* full WritingAttempt incl. essay text, scores, feedback */ } }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy' }`; 403 `{ success:false, message:'Không có quyền' }` (not the owner and not teacher/admin); 500 raw `err.message`.

---

### GET /api/writing/samples
**Auth:** Bearer token required
**Request:** Query: `quarter`, `topic`, `taskType` — any value `'all'` (or omitted) is treated as no filter.
**Response:** `{ "success": true, "samples": [ /* active WritingSample docs */ ] }`
**Error responses:** 500 raw `err.message`.

---

### GET /api/writing/sample-filters
**Auth:** Bearer token required
**Response:** `{ "success": true, "quarters": ["2026-Q3","2026-Q2",...], "topics": ["Education","Environment",...] }` (quarters sorted descending, topics ascending).
**Error responses:** 500 raw `err.message`.

## Writing Practice

### GET /api/writing-practice/exercises
**Auth:** Bearer token required
**Request:** Query: `level`, `topic`, `type`, `limit` (default 100), `skip` (default 0).
**Response:** `{ "success": true, "exercises": [ /* answer fields stripped: sampleAnswer/blankAnswer/alternativeAnswers removed */ ], "total": 340 }`
**Error responses:** 500 `{ success:false, message:'Lỗi server' }` (logged `[WP] GET /exercises:`).

---

### GET /api/writing-practice/test-questions
**Auth:** Bearer token required
**Request:** Query: `level`, `count` (default 10).
**Response:** `{ "success": true, "exercises": [...], "total": 10 }`
**Validation:** shuffling uses `array.sort(() => Math.random() - 0.5)`, a known statistically-biased shuffle (not Mongo `$sample`) — left as-is per the service file's own comment, since fixing it would change which exercises get selected.
**Error responses:** 500 generic.

---

### GET /api/writing-practice/meta
**Auth:** none (public)
**Response:** `{ "success": true, "levels": ["beginner","elementary","intermediate"], "topics": [...], "counts": { "beginner": { "_total":40, "family":5, ... } }, "totalExercises": 340 }` — `Cache-Control: public, max-age=120`.
**Error responses:** 500 generic.

---

### GET /api/writing-practice/topics
**Auth:** none (public)
**Response:** `{ "success": true, "topics": [ /* active WPTopic, sorted by orderIndex */ ] }` — `Cache-Control: public, max-age=120`.
**Error responses:** 500 generic.

---

### POST /api/writing-practice/check
**Auth:** Bearer token required

**Request:** Body: `{ "exerciseId": "...", "userAnswer": "I don't like it." }`

**Response** (200)
```json
{ "success": true, "feedback": { "checkedBy":"local", "isCorrect":true, "isAcceptable":true, "grammarScore":10, "naturalScore":10, "feedbackVi":"Xuất sắc! ...", "corrections":[], "suggestedAnswer":"...", "upgradeVersion":"..." }, "sampleAnswer":"...", "grammarPoint":"...", "xpEarned":15 }
```

**Validation**
- `exerciseId` required, `userAnswer` must be non-empty after `.trim()` (400 otherwise).
- Grading is **local, rule-based** — normalization (contraction expansion, punctuation/number-word normalization) + exact/fuzzy (Levenshtein, `intermediate` level only) match against `sampleAnswer`/`alternativeAnswers`. No AI call for this endpoint. `type:'expand'` exercises are always `isCorrect:null` (ungraded, XP 8) since they have no single correct answer.
- `xpEarned`: 15 if correct, 8 if ungraded (`expand`), 5 otherwise.

**Error responses**
- 400 `{ success:false, message:'Thiếu exerciseId hoặc câu trả lời' }`.
- 404 `{ success:false, message:'Không tìm thấy bài tập' }`.
- 500 `{ success:false, message:'Lỗi khi chấm bài. Vui lòng thử lại.' }` (logged `[WP] check error:`).

---

### POST /api/writing-practice/check-test
**Auth:** Bearer token required

**Request:** Body: `{ "answers": [{ "exerciseId":"...", "userAnswer":"..." }] }`

**Response**
```json
{ "success": true, "total": 10, "correct": 7, "score": 78, "countable": 9, "results": [ { "exerciseId":"...", "isCorrect":true, "sampleAnswer":"...", ... } ] }
```

**Validation**
- `answers` must be a non-empty array (400 otherwise).
- Same local rule-based grading as `/check`, batched via a single `$in` query. `score` excludes `type:'expand'` items from the denominator (`countable`).
- Unmatched `exerciseId`s produce `{ exerciseId, error:'not found' }` entries rather than failing the whole request.

**Error responses**
- 400 `{ success:false, message:'Không có câu trả lời' }`.
- 500 `{ success:false, message:'Lỗi server' }` (logged `[WP] check-test error:`).

---

### POST /api/writing-practice/save-batch
**Auth:** Bearer token required

**Request:** Body: `{ "attempts": [{ "exerciseId":"...", "userAnswer":"..." }] }`

**Response:** `{ "success": true, "saved": 8 }`

**Validation**
- `attempts` must be a non-empty array (400 otherwise).
- **Server-side re-grading**: `xpEarned` for every saved attempt is recomputed from scratch server-side via `xpFor()` (the same local-grading logic as `/check`) — no client-supplied `xpEarned`/`isCorrect` field is accepted in the request shape at all, so there's nothing to override.
- Attempts referencing an unknown `exerciseId` are silently dropped from the batch (not an error).

**Error responses**
- 400 `{ success:false, message:'Không có dữ liệu' }`.
- 500 `{ success:false, message:'Lỗi server' }` (logged `[WP] save-batch error:`).

---

### POST /api/writing-practice/save
**Auth:** Bearer token required

**Request:** Body: `{ "exerciseId":"...", "userAnswer":"...", "xpEarned": 999 }` — note `xpEarned` is destructured by the controller but the service's `saveSingle(studentId, { exerciseId, userAnswer })` signature only reads `exerciseId`/`userAnswer`; any client-supplied `xpEarned` is silently discarded and recomputed via `xpFor()` server-side.

**Response:** `{ "success": true }`

**Validation:** **Server-side re-grading** as above — the client-supplied `xpEarned` in the request body is accepted syntactically but never reaches the database.

**Error responses**
- 404 `{ success:false, message:'Không tìm thấy bài tập' }`.
- 500 `{ success:false, message:'Lỗi server' }` (logged `[WP] save error:`).

---

### GET /api/writing-practice/history
**Auth:** Bearer token required
**Request:** Query: `limit` (default 200, hard-capped at 500).
**Response:** `{ "success": true, "attempts": [ /* level/type/topic/xpEarned/createdAt only */ ] }`
**Error responses:** 500 generic.

---

### GET /api/writing-practice/my-stats
**Auth:** Bearer token required
**Response:** `{ "success": true, "totalXP": 1240, "totalDone": 96, "byLevel": { "beginner": 40, "elementary": 36, "intermediate": 20 } }`
**Error responses:** 500 generic.

---

### POST /api/writing-practice/admin/exercises
**Auth:** Bearer token required · **Permissions:** teacher or admin (checked inline in the controller, not route-level middleware)

**Request:** Body: `{ "exercises": [{ "topicKey":"family", "level":"beginner", "type":"fill_blank", ... }] }`

**Response:** `{ "success": true, "created": 12 }` — auto-creates a `WPLesson` (grouped by `topicKey:level`) for any combination that doesn't already have one.

**Error responses**
- 403 `{ success:false }` — role check fails (**no `message` field**).
- 400 `{ success:false }` — empty/non-array `exercises` (**no `message` field**).
- 500 `{ success:false, message:'Lỗi server' }`.

---

### DELETE /api/writing-practice/admin/exercises/:id
**Auth:** Bearer token required · **Permissions:** admin only (inline check)

**Response:** `{ "success": true }` — soft delete (`isActive:false`).

**Error responses**
- 403 `{ success:false }` — teacher is rejected here (stricter than the bulk-add endpoint above, which allows teacher) (**no `message` field**).
- 500 `{ success:false, message:'Lỗi server' }`.

## Speaking

### GET /api/speaking/topics
**Auth:** Bearer token + premium (also allows teacher/admin)
**Request:** Query: `part` (optional, `1`–`4`; omit or `'all'` for no filter).
**Response:** `{ "success": true, "topics": ["Family","Work","Hobbies",...] }` (sorted).
**Error responses:** 403 premium gate; 500 (via `catchAsync`).

---

### GET /api/speaking/random
**Auth:** Bearer token + premium
**Request:** Query: `topic`, `part`.
**Response** (success): `{ "success": true, "question": { ... } }`
**Response** (no match — **still HTTP 200**): `{ "success": false, "message": "Không có câu hỏi" }` — worth flagging: this is the one endpoint in this batch where `success:false` is returned with a `200` status rather than a `4xx`, breaking the convention every other endpoint here follows.
**Error responses:** 403 premium gate; 500.

---

### GET /api/speaking/questions
**Auth:** Bearer token + premium
**Request:** Query: `topic`, `part`.
**Response:** `{ "success": true, "questions": [ /* sorted by part, topic */ ] }`
**Error responses:** 403 premium gate; 500.

---

### POST /api/speaking/analyze
**Auth:** Bearer token + premium
**Rate limit:** 20 requests / 15 min per user (`skip` for `role==='admin'`) → 429 `{ success:false, message:'Quá nhiều yêu cầu phân tích, vui lòng thử lại sau 15 phút.' }`

**Request**
- Body: `{ "transcript": "I think that...", "question": "Describe a memorable trip.", "questionId": "...", "topic": "Travel", "part": 2, "duration": 118 }`

**Response** (200)
```json
{ "success": true, "feedback": { "overall_band": 6.5, "fluency": 7, "vocabulary": 6, "grammar": 6, "pronunciation": 7, "corrected": "...", "overall_feedback": "...", "strengths": ["..."], "improvements": ["..."], "errors": [{ "wrong":"...", "right":"...", "tip":"..." }] } }
```

**Validation**
- `transcript` required (non-empty after trim); `part` defaults to `1` if omitted; `question` defaults to `'General speaking practice'` if omitted.
- Prompt-injection defense: the transcript is wrapped in `<<<TRANSCRIPT_START>>>`/`<<<TRANSCRIPT_END>>>` delimiters before being sent to Gemini (see `ARCHITECTURE.md` § AI grading workflow).
- **This is an AI-graded endpoint with genuine real-time grading** (unlike Task 2's `/check`, see below) — a Gemini failure is not silently swallowed.
- Saving the resulting `SpeakingAttempt` is best-effort: if the DB write fails after a successful AI call, the failure is logged and swallowed — the student still receives their `feedback` in the response.

**Error responses**
- 400 `{ success:false, message:'Transcript trống' }`.
- 403 premium gate; 429 rate-limited.
- **503 AI-overload** (Gemini quota/timeout/5xx, detected by `classifyGeminiError`): `{ success:false, message: "AI đang quá tải, vui lòng thử lại sau ít phút." }` (or the timeout-specific message `"AI phản hồi quá lâu, vui lòng thử lại sau ít phút."` if the 30s Gemini call itself timed out) — this is the friendly, retryable shape referenced throughout `ARCHITECTURE.md`.
- 500 `{ success:false, message:'AI không thể phân tích. Vui lòng thử lại.' }` — any other (non-overload) AI failure, e.g. malformed JSON response after retry.

---

### GET /api/speaking/history
**Auth:** Bearer token required (no premium gate — explicitly commented in the route file: "free users vẫn xem được lịch sử cũ", so a downgraded-from-premium user can still see attempts made while premium)
**Response:** `{ "success": true, "attempts": [ /* up to 30 */ ] }`
**Error responses:** 500.

---

### GET /api/speaking/materials
**Auth:** Bearer token + premium
**Request:** Query: `quarter`, `topic`.
**Response:** `{ "success": true, "materials": [...] }`
**Error responses:** 403 premium gate; 500.

---

### GET /api/speaking/material-filters
**Auth:** Bearer token + premium
**Response:** `{ "success": true, "quarters": [...], "topics": [...] }`
**Error responses:** 403 premium gate; 500.

## Task 1 Practice

### GET /api/task1/meta
**Auth:** none (public)
**Response:** `{ "success": true, "counts": { "beginner": { "_total":30, "noun_phrase":10, ... }, "all": { "_total":90, ... } }, "totalExercises": 90 }`
**Error responses:** 500 `{ success:false, message:'Lỗi server' }`.

---

### GET /api/task1/exercises
**Auth:** Bearer token required
**Request:** Query: `level`, `skillType`, `module` (all default `'all'`).
**Response:** `{ "success": true, "exercises": [ /* sampleAnswers/correctOptionIndex stripped */ ], "total": 24 }`
**Error responses:** 500 (logged `[Task1] GET /exercises:`).

---

### POST /api/task1/check
**Auth:** Bearer token required

**Request:** Body: `{ "exerciseId":"...", "userAnswer":"The chart shows a steady increase" }` — note the guard is `userAnswer === undefined`, so an **empty string is accepted** (unlike writing-practice's `/check`, which rejects blank input after `.trim()`).

**Response**
```json
{ "success": true, "isCorrect": true, "score": 100, "xpEarned": 8, "feedbackVi": "✅ Chính xác!", "sampleAnswer": "...", "correctOptionIndex": 2, "grammarPoint": "...", "explanation": "...", "hints": [] }
```

**Validation**
- Local rule-based grading, branching by exercise `type`: `multiple_choice`/`paraphrase_choose` (index match), `fill_blank` (normalize + Levenshtein ≤1 with <20% ratio), `rearrange` (exact normalized match), else substring keyword-overlap (≥75% of significant words ⇒ partial credit, `score:80`).
- `xpEarned` = full `exercise.xpReward` (default 5) if correct, else `max(1, floor(xpReward*0.1))`.

**Error responses**
- 400 `{ success:false, message:'Thiếu exerciseId hoặc câu trả lời' }`.
- 404 `{ success:false, message:'Không tìm thấy bài tập' }`.
- 500 `{ success:false, message:'Lỗi khi chấm bài' }` (logged `[Task1] check error:`).

---

### GET /api/task1/test-questions
**Auth:** Bearer token required
**Request:** Query: `level` (default `'all'`), `count` (default 10).
**Response:** `{ "success": true, "exercises": [ /* answer-stripped */ ] }` — genuinely random via Mongo `$sample` (unlike writing-practice's biased in-memory shuffle).
**Error responses:** 500.

---

### POST /api/task1/check-test
**Auth:** Bearer token required
**Request:** Body: `{ "answers": [{ "exerciseId":"...", "userAnswer":"..." }] }`
**Response:** `{ "success": true, "results": [...], "correct": 6, "total": 10, "score": 60 }`
**Validation:** `answers` must be a non-empty array (400 otherwise); same local grading as `/check`, batched.
**Error responses:** 400 `{ success:false, message:'Không có câu trả lời' }`; 500 (logged `[Task1] check-test error:`).

---

### POST /api/task1/save-batch
**Auth:** Bearer token required — note the route file's own comment says "auth optional — saves if logged in," but `router.post('/save-batch', auth, ...)` actually applies the `auth` middleware unconditionally; an unauthenticated request gets a 401 from the middleware, it never reaches the "optional" behavior the comment implies.

**Request:** Body: `{ "attempts": [{ "exerciseId":"...", "userAnswer":"...", "skillType":"...", "module":1 }], "sessionId": "..." }`

**Response:** `{ "success": true, "saved": 7 }` — note: an empty/non-array `attempts` returns `200 { success:true, saved:0 }`, **not a 400** (differs from the otherwise-identical `writing-practice/save-batch`, which 400s on empty input).

**Validation**
- **Server-side re-grading**: `isCorrect`/`score`/`xpEarned` are all recomputed via `localCheck()` + the same `xpReward` formula as `/check` — any client-supplied grading fields are ignored (explicit security-audit-flagged comment in the service).
- Attempts referencing an unresolved `exerciseId` are still inserted, but with `isCorrect:false, score:0, xpEarned:0` and `skillType`/`module` falling back to whatever the client claimed (rather than being dropped, unlike writing-practice's equivalent).

**Error responses**
- 500 `{ success:false, message:'Lỗi server' }` (logged `[Task1] save-batch error:`).

---

### GET /api/task1/progress
**Auth:** Bearer token required
**Response:** `{ "success": true, "stats": [ { "_id":"noun_phrase", "total":20, "correct":16, "totalXP":95 } ], "totalXP": 340 }`
**Error responses:** 500.

---

### GET /api/task1/history
**Auth:** Bearer token required
**Request:** Query: `limit` (default 200, hard-capped 500).
**Response:** `{ "success": true, "attempts": [ /* isCorrect/score/skillType/module/sessionId/createdAt/xpEarned only */ ] }`
**Error responses:** 500.

## Task 2 Practice

### GET /api/task2/templates
**Auth:** none (public — comment: "cho task2-template.html")
**Response:** `{ "success": true, "templates": [ /* active Task2Template, sorted by orderIndex */ ] }`
**Error responses:** 500 `{ success:false, message:'Lỗi server' }`.

---

### GET /api/task2/weeks
**Auth:** none (public)
**Response:** `{ "success": true, "weeks": [ { "week":1, "topicCount":5, "block":"A" } ] }`
**Error responses:** 500.

---

### GET /api/task2/topics/week/:week
**Auth:** none (public)
**Response:** `{ "success": true, "topics": [ /* questions/vocabularyList excluded */ ] }`
**Error responses:** 500.

---

### GET /api/task2/questions/topic/:topicId
**Auth:** Bearer token required
**Request:** Query: `level` (default `'all'`).
**Response:** `{ "success": true, "questions": [ { /* correctAnswer stripped; sentenceStructure derived server-side from a regex heuristic; baseWords added for rearrange types */ } ], "topicName":"...", "topicEmoji":"🌍", "prompt":"...", "essayType":"opinion" }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy topic' }`; 500.

---

### GET /api/task2/vocabulary/:topicId
**Auth:** Bearer token required
**Response:** `{ "success": true, "vocabularyList": [...], "topicName": "..." }`
**Error responses:** 404 `{ success:false, message:'Không tìm thấy topic' }`; 500.

---

### POST /api/task2/check
**Auth:** Bearer token required
**Rate limit:** 60 requests / 15 min per user (`skip` for `role==='admin'`) → 429 `{ success:false, message:'Quá nhiều yêu cầu chấm bài, vui lòng thử lại sau 15 phút.' }`

**Request:** Body: `{ "topicId":"...", "questionId":"...", "userAnswer":"..." }`

**Response**
```json
{ "success": true, "isCorrect": true, "score": 100, "feedbackVi": "✅ Chính xác! ...", "modelAnswer": "...", "explanationVi": "...", "explanationEn": "...", "aiGraded": true }
```

**Validation**
- `topicId`, `questionId`, `userAnswer` (not `undefined`) all required — 400 otherwise.
- Question types `translation`/`error_correction`/`short_writing`/`paraphrase` (with a trimmed answer ≥3 chars) are graded by Gemini (`gradeT2Question`); all other types are graded deterministically (`autoGrade`/keyword matching, no AI call).
- **Notable divergence from `/speaking/analyze`**: if the Gemini call for an AI-graded type throws for **any** reason — including an overload/quota error that `classifyGeminiError` would flag as retryable — `task2PracticeService.checkAnswer()` catches it internally and **silently falls back to the deterministic `autoGrade()`** instead of propagating a 503. The response's `aiGraded:false` is the only signal that a fallback occurred; the client never sees an AI-overload error from this endpoint, unlike every other Gemini-backed endpoint in this codebase.

**Error responses**
- 400 `{ success:false, message:'Thiếu thông tin' }`.
- 404 `{ success:false, message:'Không tìm thấy topic' }` or `{ success:false, message:'Không tìm thấy câu hỏi' }`.
- 429 rate-limited.
- 500 `{ success:false, message:'Lỗi chấm bài' }` (logged `[Task2] check error:`) — reachable only for a non-AI-related failure (e.g. a DB error), since AI failures are absorbed as described above.

---

### GET /api/task2/exam
**Auth:** Bearer token required
**Request:** Query: `week` (default `'all'`), `level` (default `'all'`), `count` (default 10).
**Response:** `{ "success": true, "questions": [ /* answer-stripped, Fisher-Yates shuffled across all matching topics */ ], "total": 10 }`
**Error responses:** 500.

---

### POST /api/task2/exam/submit
**Auth:** Bearer token required
**Request:** Body: `{ "answers": [{ "topicId":"...", "questionId":"...", "userAnswer":"..." }] }`
**Response:** `{ "success": true, "results": [...], "correct": 7, "total": 10, "score": 70 }`
**Validation:** `answers` must be a non-empty array (400). **All types are graded deterministically here — this endpoint never calls Gemini**, even for `translation`/`error_correction`/etc. (unlike `/check`), so exam-mode scores for those question types are the keyword/`autoGrade` approximation, not an AI judgment.
**Error responses:** 400 `{ success:false, message:'Không có câu trả lời' }`; 500 `{ success:false, message:'Lỗi chấm bài' }` (logged `[Task2] exam/submit error:`).

---

### POST /api/task2/save-attempt
**Auth:** Bearer token required

**Request:** Body: `{ "sessionType":"practice", "week":3, "topicId":"...", "topicName":"...", "level":"intermediate", "questionsAttempted":[{ "questionId":"...", "userAnswer":"...", "isCorrect":true, "score":100, "timeSpentSeconds":45 }], "totalQuestions":10, "correctCount":8 }`

**Response:** `{ "success": true, "attempt": { /* saved Task2Attempt */ } }`

**Validation**
- **Server-side re-grading, with a documented partial exception**: every `questionsAttempted` entry is matched against the real `topic.questions`; entries referencing a non-existent question are dropped entirely (can't inflate `totalQuestions` with fake IDs). For deterministic question types, `isCorrect`/`score` are recomputed via `autoGrade()`, ignoring the client's values. For the four AI-graded types (`translation`/`error_correction`/`short_writing`/`paraphrase`), the client's `isCorrect`/`score` are **coerced to safe types and clamped (`0`–`100`) but not independently re-verified** — Gemini is not re-run here (cost/non-determinism), matching the documented tradeoff in `ARCHITECTURE.md`. `totalQuestions`/`correctCount` are always derived from the verified list, never trusted directly, when a real `topicId` was supplied.

**Error responses**
- 500 `{ success:false, message:'Lỗi lưu kết quả' }` (logged `[Task2] save-attempt error:`).

---

### GET /api/task2/history
**Auth:** Bearer token required
**Request:** Query: `limit` (default 100, hard-capped 500).
**Response:** `{ "success": true, "attempts": [...] }`
**Error responses:** 500.

---

### GET /api/task2/progress
**Auth:** Bearer token required
**Response:** `{ "success": true, "stats": [ { "_id":1, "attempts":4, "avgScore":78.5, "lastAttempt":"..." } ] }`
**Error responses:** 500.

---

### GET /api/task2/wrong-questions/:topicId
**Auth:** Bearer token required
**Response:** `{ "success": true, "wrongIds": ["q1","q4"] }` — computed from the latest recorded result per question across all of the caller's attempts on that topic.
**Error responses:** 500.

---

### POST /api/task2/draft
**Auth:** Bearer token required

**Request:** Body: `{ "topicId":"...", "topicName":"...", "week":3, "level":"intermediate", "mode":"practice", "questionIds":[...], "currentIdx":2, "sessionAttempts":[...], "questionStatus":{...}, "sessionDone":2, "sessionCorrect":1 }`

**Response:** `{ "success": true }`

**Validation**
- Notable: despite `GET /api/task2/drafts` (plural, below) existing and implying multiple concurrent per-topic drafts, `saveDraft()` actually enforces **exactly one draft per user at a time** — it deletes every draft for any *other* topic (`Task2Draft.deleteMany({ userId, topicId: { $ne: topicId } })`) before upserting the current one. Starting a draft on Topic B silently discards an in-progress draft on Topic A.

**Error responses**
- 500 `{ success:false, message:'Lỗi lưu tiến độ' }`.

---

### GET /api/task2/draft/:topicId
**Auth:** Bearer token required
**Response:** `{ "success": true, "draft": { ... } | null }`
**Error responses:** 500 `{ success:false, message:'Lỗi server' }`.

---

### DELETE /api/task2/draft/:topicId
**Auth:** Bearer token required
**Response:** `{ "success": true }` (idempotent).
**Error responses:** 500.

---

### GET /api/task2/drafts
**Auth:** Bearer token required
**Response:** `{ "success": true, "drafts": [ /* topicId/topicName/week/currentIdx/questionIds/savedAt only */ ] }` — in practice this array will contain at most one entry, per the single-draft enforcement described above.
**Error responses:** 500.

## Task 2 Template

### POST /api/task2template/save
**Auth:** Bearer token required

**Request:** Body: `{ "templateType": "linking_words", "templateName": "Cause & Effect", "totalItems": 10, "correctItems": 9 }`

**Response:** `{ "success": true }`

**Validation**
- `templateType` required, `totalItems` and `correctItems` must not be `null`/`undefined` (loose `== null` check — `0` is accepted) — 400 otherwise.
- **No server-side re-grading here** — `totalItems`/`correctItems` are stored exactly as sent (only coerced with `Number()`). This is the one save-style endpoint among all the practice modules in this doc that does **not** re-derive its score server-side; a client can submit any `correctItems`/`totalItems` pair and it will be recorded as-is in the history a teacher may later review. This diverges from the blanket re-grading guarantee described in `ARCHITECTURE.md`'s AI grading workflow section for practice-save endpoints — worth flagging if this endpoint is ever wired into a teacher-facing leaderboard or stat.

**Error responses**
- 400 `{ success:false, message:'Thiếu thông tin' }`.
- 500 `{ success:false, message:'Lỗi server' }` (logged `[Task2Template] error:`).

---

### GET /api/task2template/history
**Auth:** Bearer token required
**Request:** Query: `limit` (default 200, hard-capped 500).
**Response:** `{ "success": true, "attempts": [ /* templateType/templateName/totalItems/correctItems/createdAt */ ] }`
**Error responses:** 500 generic.

## Tuition

### GET /api/tuition/settings
**Auth:** Bearer token required · **Permissions:** any authenticated user (students need this to render the payment QR/bank info, not just admins)
**Response:** `{ "success": true, "settings": { "bankName":"...", "bankAccount":"...", "accountName":"...", "defaultMonthlyFee":1500000, "paymentNote":"...", "qrImageUrl":"...", "autoRemindEnabled":true, "autoRemindDay":10 } }` — singleton document (`TuitionSettings.getSingleton()`).
**Error responses:** 500 `{ success:false, message:'Lỗi server' }`.

---

### PUT /api/tuition/settings
**Auth:** Bearer token required · **Permissions:** admin only

**Request:** Body — any subset of `{ bankName, bankAccount, accountName, defaultMonthlyFee, paymentNote, autoRemindEnabled, autoRemindDay, autoRemindEndMonth, autoRemindEndYear }`; only keys that are `!== undefined` are applied (a true partial update).

**Response:** `{ "success": true, "settings": { ... } }`

**Error responses:** 403 `{ success:false, message:'Chỉ admin' }` (teacher blocked too — this module's `adminOnly` is stricter than listening's `teacherOnly`); 500 generic.

---

### POST /api/tuition/settings/qr
**Auth:** Bearer token required · **Permissions:** admin only
**Request:** `multipart/form-data`, field `qr` (multer memory storage, 5MB limit, mimetype must match `^image/(png|jpe?g|webp)$`).
**Response:** `{ "success": true, "qrImageUrl": "https://res.cloudinary.com/..." }` — the previous QR's Cloudinary asset is destroyed first if one existed.
**Error responses:** 400 `{ success:false, message:'Chưa có file' }`; 403 non-admin; 500 generic.

---

### DELETE /api/tuition/settings/qr
**Auth:** Bearer token required · **Permissions:** admin only
**Response:** `{ "success": true }` — destroys the Cloudinary asset and clears `qrImageUrl`/`qrImagePublicId`.
**Error responses:** 403 non-admin; 500 generic.

---

### GET /api/tuition
**Auth:** Bearer token required · **Permissions:** admin only
**Request:** Query: `studentId`, `month`, `year`, `feeType`, `isPaid` (`'true'`/`'false'` string), `studentNotified` (string), `page` (default 1), `limit` (default 50).
**Response:** `{ "success": true, "fees": [ /* populated studentId */ ], "total": 214, "stats": { "totalAmount": 320000000, "paidAmount": 280000000, "pendingNotify": 6 } }`
**Error responses:** 403 non-admin; 500 generic.

---

### GET /api/tuition/summary
**Auth:** Bearer token required · **Permissions:** admin only
**Request:** Query: `year` (optional — omit for all years).
**Response:** `{ "success": true, "summary": [ /* last 24 year/month buckets, monthly fees only */ ], "courseSummary": [ /* per-course, feeType:'course' only */ ] }`
**Error responses:** 403; 500.

---

### GET /api/tuition/admin-summary
**Auth:** Bearer token required · **Permissions:** admin only
**Response:** `{ "success": true, "unpaidStudentCount": 12 }` — distinct count of students with ≥1 unpaid fee.
**Error responses:** 403; 500.

---

### GET /api/tuition/students-list
**Auth:** Bearer token required · **Permissions:** admin only
**Response:** `{ "success": true, "students": [ { "username":"...", "email":"...", "firstName":"...", "lastName":"..." } ] }` — all `student`+`teacher` role users.
**Error responses:** 403; 500.

---

### POST /api/tuition
**Auth:** Bearer token required · **Permissions:** admin only

**Request:** Body: `{ "studentId":"...", "feeType":"monthly", "month":7, "year":2026, "courseName":"", "amount":1500000, "note":"" }` (`month`/`year` used only when `feeType==='monthly'`; `courseName` only when `feeType==='course'`).

**Response** (201): `{ "success": true, "fee": { /* populated studentId */ } }`

**Validation**
- `studentId`, `feeType`, `amount` required — 400 otherwise.
- Unique-index collision (same student + month + year) is caught explicitly.

**Error responses**
- 400 `{ success:false, message:'Thiếu thông tin bắt buộc' }`.
- 400 `{ success:false, message:'Học phí tháng này đã tồn tại cho học viên này' }` — Mongo duplicate-key error (`code===11000`).
- 403 non-admin; 500 generic (any other error re-thrown from the `11000` catch).

---

### PUT /api/tuition/:id
**Auth:** Bearer token required · **Permissions:** admin only

**Request:** Body — any subset of `{ amount, isPaid, note, courseName, month, year }`.

**Response:** `{ "success": true, "fee": { ... } }`

**Validation**
- Setting `isPaid:true` auto-stamps `paidDate` (if not already set); unsetting clears it.
- If the fee's `amount`/`month`/`year` changes while `studentNotified:true` and the fee is still unpaid, `studentNotified`/`studentNotifiedAt` are automatically reset — prevents a stale "I already paid" confirmation surviving a fee-detail edit.

**Error responses**
- 404 `{ success:false, message:'Không tìm thấy' }`.
- 403 non-admin; 500 generic.

---

### DELETE /api/tuition/:id
**Auth:** Bearer token required · **Permissions:** admin only
**Response:** `{ "success": true }` (hard delete, idempotent — no not-found check).
**Error responses:** 403 non-admin; 500 generic.

---

### POST /api/tuition/:id/remind
**Auth:** Bearer token required · **Permissions:** admin only
**Request:** Body: `{ "customMessage": "..." }` (optional — a default Vietnamese reminder template is used if omitted).
**Response:** `{ "success": true, "message": "Đã gửi nhắc nhở" }` — creates an in-app `Message` to the student (not email/SMS).
**Error responses:** 404 `{ success:false, message:'Không tìm thấy' }`; 403 non-admin; 500 generic.

---

### POST /api/tuition/remind-bulk
**Auth:** Bearer token required · **Permissions:** admin only
**Request:** Body: `{ "month": 7, "year": 2026, "customMessage": "..." }`
**Response:** `{ "success": true, "sent": 14 }` — bulk in-app `Message`s to every student with an unpaid fee for that month/year (`insertMany`); `sent:0` if nobody's unpaid, not an error.
**Validation:** `month`/`year` required and must be numeric — 400 otherwise.
**Error responses:** 400 `{ success:false, message:'Thiếu hoặc sai tháng/năm' }`; 403 non-admin; 500 generic.

---

### GET /api/tuition/my/summary
**Auth:** Bearer token required · **Permissions:** owner (any authenticated user, scoped to `req.user._id`)
**Response:** `{ "success": true, "unpaidCount": 2, "totalUnpaid": 3000000 }`
**Error responses:** 500 generic.

---

### GET /api/tuition/my
**Auth:** Bearer token required
**Response:** `{ "success": true, "fees": [ /* caller's own, all statuses */ ], "settings": { /* for rendering the payment QR/bank info */ } }`
**Error responses:** 500 generic.

---

### POST /api/tuition/:id/notify
**Auth:** Bearer token required · **Permissions:** owner only (fee must belong to `req.user`)

**Response** (200, all three outcomes are 200)
- Success: `{ "success": true, "message": "Đã gửi thông báo đến admin" }` — sets `studentNotified:true` + timestamp, sends an in-app `Message` to every admin.
- Already paid: `{ "success": true, "message": "Học phí đã được xác nhận" }` — no-op, distinguishable only by message text, not status code.

**Error responses**
- 404 `{ success:false, message:'Không tìm thấy' }` — fee doesn't exist or isn't owned by the caller.
- 500 generic.

## Upgrade

### POST /api/upgrade/request
**Auth:** Bearer token required

**Request:** Body: `{ "months": 3, "note": "..." }` — `months` must be one of `[1, 3, 6, 12, 36]` (`VALID_MONTHS`); price is looked up server-side from a fixed map, never accepted from the client:
```json
{ "1": 90000, "3": 250000, "6": 500000, "12": 900000, "36": 2500000 }
```

**Response** (201): `{ "success": true, "message": "Yêu cầu nâng cấp đã được gửi. Admin sẽ xác nhận trong vòng 24 giờ.", "request": { "_id":"...", "months":3, "amount":250000, "status":"pending" } }`

**Validation**
- `months` checked against `VALID_MONTHS` (400 otherwise) — `amount` is always derived server-side from `months`, a client can't submit an arbitrary price.
- Duplicate-pending-request prevention is enforced **twice**: an explicit `findOne({ userId, status:'pending' })` check in the service (race-prone by itself), backstopped by a unique partial index on `{userId, status:'pending'}` at the DB level — a `code:11000` from that index is caught by the controller's `guard()` as a fallback. Both paths return the identical client-facing message, so the redundancy is invisible to callers.

**Error responses**
- 400 `{ success:false, message:'Gói không hợp lệ.' }` — invalid `months`.
- 400 `{ success:false, message:'Bạn đã có yêu cầu đang chờ xử lý. Vui lòng đợi Admin xác nhận.', requestId:"..." }` — explicit pending-check hit (includes `requestId`).
- 400 `{ success:false, message:'Bạn đã có yêu cầu đang chờ xử lý. Vui lòng đợi Admin xác nhận.' }` — DB unique-index race hit instead (same message, no `requestId`).
- 500 `{ success:false, message:'Lỗi server' }`.

---

### GET /api/upgrade/status
**Auth:** Bearer token required
**Response:** `{ "success": true, "request": { "_id":"...", "months":3, "status":"pending", "createdAt":"..." } | null, "userPlan": "free", "planExpiresAt": null }` — the caller's most recent request of *any* status (not just pending), plus their live plan info from `req.user`.
**Error responses:** 500 `{ success:false, message:'Lỗi server' }`.
