# Backup & Restore — EnglishWithDan

Covers backup posture and restore procedures for the three things this
system depends on that hold state: MongoDB Atlas (all application data),
Cloudinary (uploaded media), and configuration/secrets (env vars). Also
covers full disaster recovery if the Render service and/or database were
lost entirely.

> Scope note: none of this doc was written with live access to the
> production Atlas or Render dashboards, so tier/plan-specific claims below
> are written as "how to check" rather than asserted facts — see each
> section's flag.

## 1. MongoDB backup strategy

All application data — users, attempts, exercises, tuition records,
everything — lives in MongoDB Atlas via `MONGO_URI`. Atlas's backup
capability is **tier-dependent**:

- **M10 and above (paid, dedicated clusters):** Atlas provides built-in
  continuous backups with point-in-time recovery, configurable retention,
  and on-demand snapshots.
- **M0 (free shared tier) and other shared tiers (M2/M5):** **no automated
  backup is provided by Atlas.** Data loss (accidental mass-delete, a bad
  migration script, corruption) on a shared-tier cluster has no built-in
  recovery path.

**This deployment's current tier is not confirmed in this document** — it
must be checked, not assumed. To check: Atlas dashboard → the project →
the cluster → the cluster's tier is shown on its overview card (M0/M2/M5
vs M10+), and the **Backup** tab will either show snapshot history and a
restore option (paid tier with backup enabled) or explain that backup
isn't available on the current tier.

**Recommendation:** for a production app holding real user accounts,
passwords (hashed), and paid-tuition records, running without any backup
capability is a real operational risk. If the check above shows M0/shared
tier, upgrading to at least M10 (or otherwise enabling backup) should be
treated as a priority infrastructure decision, weighed against cost — this
is a recommendation to evaluate, not a statement that it's already been
decided against.

## 2. MongoDB restore procedure

Generic Atlas point-in-time-restore flow (exact menu wording may differ
slightly by current Atlas UI version — verify against the live dashboard):

1. Atlas dashboard → the project → the cluster → **Backup** tab.
2. Choose either a specific on-demand/scheduled snapshot, or (if
   point-in-time recovery is enabled on the tier) a specific timestamp to
   restore to.
3. Atlas restores either to a **new cluster** (safer — lets you verify data
   before cutting over) or in-place, depending on the option chosen and
   plan. Restoring to a new cluster and then swapping `MONGO_URI` once
   verified is the lower-risk path for anything except a true full-loss
   scenario.
4. Once the restored cluster/data is verified, update `MONGO_URI` in
   Render's Environment settings if the restore target has a new
   connection string, then redeploy.
5. Verify via `GET /health` — `dependencies.database.status: 'ok'`
   confirms the app can reach and ping the restored database. Follow with
   a manual spot-check (log in as a test account, confirm expected data is
   present) since the health check only confirms connectivity, not data
   correctness.

If the current tier has no backup capability (per §1), there is currently
**no restore path** for accidental data loss on this system beyond
whatever manual export/dump discipline the team adopts going forward. This
is a gap, not a documented-but-unused capability — see the Disaster
Recovery section below for how this compounds a full-loss scenario.

## 3. Cloudinary asset recovery considerations

Uploaded media (avatars, listening audio, images, PDFs — see
`backend/routes/admin/_shared.js`'s `uploadImageDataUri`/`uploadPdfBuffer`
and the wider upload code paths) is stored on Cloudinary's own
infrastructure, not duplicated or backed up separately by this app.
Cloudinary is a durable, professionally-operated storage service — the
realistic operational risk here is not "Cloudinary loses your data," it's
**asset deletion via this app**, accidental or malicious:

- `cloudinaryService.destroyAsset` (`backend/services/cloudinaryService.js`)
  has exactly two call sites, both inside `tuitionService.js`'s
  `uploadQr`/`deleteQr` (the tuition QR-code settings image), both
  **`adminOnly`** (not teacher-reachable, and not a bulk-delete path — it
  only ever touches that one singleton image). A compromised admin
  account (see `docs/INCIDENT_RESPONSE.md` §3.4 — currently a real risk
  given the unrotated `JWT_SECRET`) could delete that image, but there is
  no broader "mistaken bulk-delete" surface for Cloudinary assets in this
  app (production-readiness audit finding — corrected from an earlier,
  overstated version of this section).
- **Separate, real gap this app does have: orphaned Cloudinary storage.**
  Deleting content elsewhere — passages, reading tests, listening tests
  (`Passage.findByIdAndDelete`, `ReadingTest.findByIdAndDelete`,
  `ListeningTest.findByIdAndDelete`) — does **not** call `destroyAsset`,
  so the associated Cloudinary media (images, audio) is left behind,
  unreferenced, accumulating indefinitely. This isn't a security risk,
  but it is an unbounded storage-cost/hygiene gap worth knowing about —
  there is currently no cleanup job for it.
- **Recovery path, if needed, is Cloudinary-side, not app-side:**
  Cloudinary's own trash/versioning features, if enabled on the account's
  plan tier, are what would let a deleted asset be recovered. Check the
  Cloudinary dashboard → **Settings** → **Manage** or **Assets** area for
  whether trash/backup retention is enabled on the current plan. This app
  does not implement its own asset-recovery mechanism.
- Recommendation: if Cloudinary's trash/versioning isn't already enabled
  and the plan tier supports it, enabling it is a low-effort mitigation
  against accidental deletion specifically.

## 4. Configuration / secrets backup

**Current gap, not a solved problem:** there is no systematic backup of
environment variables beyond whatever is currently live in Render's
Environment tab. If the Render service configuration were lost or
misconfigured, the only source of truth for values like `MONGO_URI`,
`JWT_SECRET`, `CLOUDINARY_API_SECRET`, etc. would be whatever any team
member happens to have saved locally — which is not guaranteed to be
complete, current, or securely stored.

**Recommendation:** store the full current set of production environment
values in a proper password manager or secrets vault (e.g. 1Password,
Bitwarden, or a dedicated secrets manager) as a documented team practice,
updated whenever a value changes (including as part of the secret-rotation
work described in `docs/RUNBOOK.md` §6 — that section explicitly calls
out this gap as a reason to start such a record during rotation if one
doesn't exist). `backend/.env.example` documents every variable name and
what it's for (see `docs/ENVIRONMENT_VARIABLES.md`), but intentionally
contains no real values — it's a template, not a backup.

## 5. Disaster recovery — full loss of Render service and/or database

If the Render service and the MongoDB cluster were both lost entirely
(account issue, accidental deletion, catastrophic failure), recovery
sequence:

1. **Recreate the data layer.** If a MongoDB Atlas backup exists (§1/§2),
   restore from it into a new cluster. If no backup exists (the current
   likely state on a free/shared tier per §1), a new empty cluster must be
   created and the application will start from zero data — **this is the
   single biggest disaster-recovery weakness in the current setup**, and
   is a direct consequence of the backup gap flagged in §1. There is no
   way to recover user accounts, attempt history, or tuition records
   without a prior backup.
2. **Recreate the Render service.** Create a new Web Service on Render,
   pointed at the GitHub repository. **The GitHub repo is a durable,
   independent copy of all application code** — this part of recovery is
   solid regardless of what happened to the Render service itself.
3. **Set all environment variables.** This is the step most exposed by
   the gap in §4: if no secure backup of production env values exists
   outside of the lost Render service, every secret (`MONGO_URI` for the
   newly (re)created cluster, `JWT_SECRET`, `CLOUDINARY_API_SECRET`,
   `GEMINI_API_KEY`, etc.) has to be regenerated/re-sourced from each
   underlying provider from scratch — which is also, incidentally, exactly
   what the overdue rotation in `docs/RUNBOOK.md` §6 already needs to
   happen for three of them anyway. Use `backend/.env.example` /
   `docs/ENVIRONMENT_VARIABLES.md` as the checklist of every variable that
   needs a value.
4. **Redeploy** from the GitHub repo (Render's normal git-triggered
   deploy).
5. **Verify** via `GET /health` — confirm `status: 'ok'` and that database
   and (if configured) Cloudinary both show `status: 'ok'` before
   considering the service restored. Then do a manual functional pass
   (register/login, one AI-graded flow if `GEMINI_API_KEY` is set, one
   upload flow if Cloudinary is set) since `/health` confirms connectivity,
   not full functional correctness.
6. **Cloudinary assets** (§3) are unaffected by a Render/MongoDB loss —
   they live independently on Cloudinary's own infrastructure and don't
   need separate recovery in this scenario, only re-linking if any asset
   URLs were stored in a way that depended on lost database records (in
   which case those links are only as recoverable as the database restore
   in step 1 allows).

**Bottom line:** application code recovery is solid (GitHub). Database
recovery is only as good as whatever Atlas tier/backup is actually enabled
(unconfirmed — see §1, needs checking). Configuration/secrets recovery
currently has no backup at all (§4) and is the weakest link in this
sequence — closing that gap (password manager / vault, kept current) is
the single highest-leverage improvement to this DR posture.
