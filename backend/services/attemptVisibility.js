'use strict';

/**
 * Which attempt rows are real attempts. Test Simulation writes a placeholder
 * row the moment a student STARTS (so a strike has something to attach to):
 *   'in-progress' — started, not submitted yet (or the tab was closed)
 *   'abandoned'   — an in-progress placeholder swept by cron/attemptTimeoutSweep.js
 *   'cancelled'   — Writing only: the student exited without submitting
 * None of those has answers or a score, so every list/count that means
 * "attempts the student did" must leave them out — otherwise the admin feed
 * shows a 0/0, 0m00s row for every test a student merely opened (reported
 * 2026-10-01). Practice-mode rows never use these statuses; legacy rows with
 * no status field still match the $nin filters below.
 */
const PLACEHOLDER_STATUSES = ['in-progress', 'abandoned', 'cancelled'];

// Submitted or voided — what history and admin feeds show.
const REAL_ATTEMPT = { status: { $nin: PLACEHOLDER_STATUSES } };

// Submitted and not voided — what counts as "done" (homework completion,
// the "đã làm" marks on practice lists, weakness analysis).
const COUNTABLE_ATTEMPT = { status: { $nin: [...PLACEHOLDER_STATUSES, 'disqualified'] } };

module.exports = { PLACEHOLDER_STATUSES, REAL_ATTEMPT, COUNTABLE_ATTEMPT };
