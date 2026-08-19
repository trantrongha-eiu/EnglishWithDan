'use strict';

// Schema plugin: refuses a deleteMany/deleteOne/findOneAndDelete QUERY whose
// filter is empty (`{}`) or matches "too many" documents, on models holding
// permanent, per-student data that has no automated backup on this Atlas
// tier (see docs/BACKUP_RESTORE.md) — VocabBook, DifficultWord, User.
//
// Added after an incident (2026-08-19) where a one-off Node script meant to
// clean up a single test account instead ran `VocabBook.deleteMany({})` —
// an empty filter, matching every document — and deleted every student's
// saved vocabulary with no confirmation prompt and no oplog trace to
// recover from cleanly (multi-deletes aren't replicated to the queryable
// oplog on this Atlas tier). Recovery required manually rebuilding data
// from a separate, unrelated collection (DifficultWord) and the oplog's
// per-document update history — not something to rely on a second time.
// See MEMORY.md / feedback notes for the full incident writeup.
//
// This only guards the QUERY forms (Model.deleteMany/deleteOne/
// findOneAndDelete) — a fetched document's own `doc.deleteOne()` is
// inherently scoped to its own `_id` already and is left untouched.
//
// Deliberately code, not just a warning in a doc or a memory file: a memory
// note only protects sessions that happen to load it, and only protects
// against ME making this mistake again — this protects every future
// caller (any script, any admin route, any other agent) against the same
// class of error, permanently, regardless of who's driving.
//
// An unusually large legitimate bulk delete (e.g. a real cross-book
// cleanup) should pass an explicit, non-trivial filter — {} is never a
// legitimate way to express "delete everything in this collection" for
// data with no backup. If a genuine full-collection wipe is ever actually
// needed (e.g. decommissioning), do it by hand directly against Atlas, not
// through the app's models.
function guardAgainstMassDelete(schema, opts = {}) {
  const { maxUnscopedMatch = 0 } = opts; // 0 = empty filter is never allowed

  // Mongoose 9's query middleware is promise-based (throw to reject, return
  // to proceed) — no `next` callback is passed, unlike older Mongoose majors.
  function assertFilterIsScoped() {
    const filter = this.getFilter ? this.getFilter() : {};
    const keys = Object.keys(filter || {});
    if (keys.length > maxUnscopedMatch) return;
    const modelName = this.model?.modelName || 'this model';
    throw new Error(
      `Refusing ${this.op}() on ${modelName} with an empty/unscoped filter — ` +
      `this would delete ALL documents in the collection. This model holds ` +
      `permanent student data with no automated backup. Pass an explicit ` +
      `filter (e.g. { userId } or { _id }). If a genuine full-collection ` +
      `wipe is really intended, do it directly against Atlas, not through ` +
      `this model.`
    );
  }

  schema.pre('deleteMany', assertFilterIsScoped);
  schema.pre('deleteOne', { query: true, document: false }, assertFilterIsScoped);
  schema.pre('findOneAndDelete', assertFilterIsScoped);
}

module.exports = guardAgainstMassDelete;
