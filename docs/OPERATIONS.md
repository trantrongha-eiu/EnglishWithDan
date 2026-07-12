# Operations

This is an index, not a duplicate. Every topic below already has a dedicated, detailed doc from the production-readiness phase of this engagement — this page exists so "where do I look for X" has one obvious answer, without re-explaining what those docs already say (a maintenance liability, not a convenience — two places describing the same procedure will eventually disagree).

| Topic | Doc | What's there |
|---|---|---|
| **Health checks** | [`backend/routes/health.js`](../backend/routes/health.js) (code) + [`docs/RUNBOOK.md` §2](RUNBOOK.md#2-how-to-check-system-health) | Three endpoints (`/health/live`, `/health/ready`, `/health`), what each checks, what to do when one reports unhealthy |
| **Monitoring** | [`docs/RUNBOOK.md` §2](RUNBOOK.md#2-how-to-check-system-health) | Health-check interpretation, uptime/memory reporting, dependency connectivity |
| **Logging** | [`docs/RUNBOOK.md` §3](RUNBOOK.md#3-how-to-read-logs) | Structured JSON log format, every category and what emits it, where to find logs on Render |
| **Deployment** | [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) | How a push becomes a live deploy, the two Render services, the Health Check Path setting |
| **Rollback** | [`docs/DEPLOYMENT.md` §5](DEPLOYMENT.md#5-zero-downtime-and-rollback) | Git-revert-and-push as the safe default, when a dashboard rollback might be faster |
| **Backup** | [`docs/BACKUP_RESTORE.md` §1](BACKUP_RESTORE.md#1-mongodb-backup-strategy) | MongoDB Atlas backup posture (tier-dependent — needs a manual check), Cloudinary's own durability |
| **Recovery** | [`docs/BACKUP_RESTORE.md` §2 and §5](BACKUP_RESTORE.md#2-mongodb-restore-procedure) | Database restore procedure, full disaster-recovery sequence if the service and/or database are lost entirely |
| **Incident response** | [`docs/INCIDENT_RESPONSE.md`](INCIDENT_RESPONSE.md) | Severity classification, general response process, and specific playbooks for the incidents this app can actually have |
| **Common operational tasks** | [`docs/RUNBOOK.md` §4](RUNBOOK.md#4-common-operational-tasks) | Restart the service, ban/unban a user, promote/demote a role, check dependency vulnerabilities |
| **Release process** | [`docs/RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) | Pre-release, release, and post-release checklist |
| **Environment variables** | [`docs/ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md) | Every variable, what breaks without it, current secret-rotation status |
| **Secret rotation** | [`docs/RUNBOOK.md` §6](RUNBOOK.md#6-secret-rotation-procedure--read-this-section-first) | Step-by-step, per-secret rotation procedure — **currently overdue, see [`docs/SECURITY.md`](SECURITY.md)** |

## If you only read one thing

Whatever incident you're responding to, start at [`docs/INCIDENT_RESPONSE.md`](INCIDENT_RESPONSE.md) §2 (General response process) and follow its pointers — it's written to route you to the right specific doc from there, so you don't need to know in advance which of the above applies.
