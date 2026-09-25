'use strict';

// The 5 fixed per-student vocab books ("Sổ 1".."Sổ 5"). Teachers assign
// homework against them by slot (Assignment.resources[].bookSlot), so they
// can't be renamed or deleted, and are recreated if missing
// (vocabBookService.ensureDefaultBooks).

const DEFAULT_BOOKS = [
  { slot: 1, name: 'Sổ 1', emoji: '📘', color: '#3d8bff' },
  { slot: 2, name: 'Sổ 2', emoji: '📗', color: '#34d399' },
  { slot: 3, name: 'Sổ 3', emoji: '📙', color: '#f59e0b' },
  { slot: 4, name: 'Sổ 4', emoji: '📕', color: '#e53935' },
  { slot: 5, name: 'Sổ 5', emoji: '📓', color: '#a78bfa' },
];
const SLOTS = DEFAULT_BOOKS.map((d) => d.slot);

function canonicalName(slot) {
  const d = DEFAULT_BOOKS.find((x) => x.slot === slot);
  return d ? d.name : '';
}

// "Sổ 3", "sổ 3", " SỔ  3 ", "Sổ3" -> 3; anything else -> null.
function slotFromName(name) {
  const m = /^sổ ?([1-5])$/.exec(String(name || '').normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' '));
  return m ? Number(m[1]) : null;
}

// Pure: decide which of a student's books ARE Sổ 1..5. `books` = ALL the
// student's books, sorted by _id ascending, each { _id, name, isDefault,
// defaultSlot, wordCount }. Priority per slot:
//   1. an isDefault book already tagged with that defaultSlot
//   2. an isDefault book (pre-defaultSlot) named "Sổ N"
//   3. an ordinary book named "Sổ N" — the Aug-2026 VocabBook restore (see
//      incident_vocabbook_mass_delete) brought many students' original
//      Sổ 1..5 back with isDefault:false, and some students recreated a
//      deleted one by hand. Most words wins, ties -> oldest.
//   4. a renamed isDefault leftover, in creation (_id) order — the order the
//      original insertMany created Sổ 1..5 in.
// An EMPTY default loses its slot to a non-empty ordinary "Sổ N" (that's
// the student's real book; the empty one was an auto-restore) -> `discard`.
// More than 5 defaults -> `extra` (caller demotes them; words kept).
function assignDefaultSlots(books) {
  const bySlot = new Map();
  const discard = [];
  const extra = [];
  const defaults = books.filter((b) => b.isDefault);
  const unslotted = [];
  for (const b of defaults) {
    if (SLOTS.includes(b.defaultSlot) && !bySlot.has(b.defaultSlot)) bySlot.set(b.defaultSlot, b);
    else unslotted.push(b);
  }
  const renamed = [];
  for (const b of unslotted) {
    const s = slotFromName(b.name);
    if (s && !bySlot.has(s)) bySlot.set(s, b); else renamed.push(b);
  }

  const named = new Map(); // slot -> best ordinary "Sổ N" book
  for (const b of books) {
    if (b.isDefault) continue;
    const s = slotFromName(b.name);
    if (!s) continue;
    const cur = named.get(s);
    if (!cur || (b.wordCount || 0) > (cur.wordCount || 0)) named.set(s, b);
  }
  for (const [s, b] of named) {
    const cur = bySlot.get(s);
    if (!cur) { bySlot.set(s, b); continue; }
    if ((cur.wordCount || 0) === 0 && (b.wordCount || 0) > 0) {
      bySlot.set(s, b);
      discard.push(cur);
    }
  }

  for (const b of renamed) {
    const free = SLOTS.find((s) => !bySlot.has(s));
    if (free) bySlot.set(free, b); else extra.push(b);
  }
  return { bySlot, extra, discard, missing: SLOTS.filter((s) => !bySlot.has(s)) };
}

module.exports = { DEFAULT_BOOKS, SLOTS, canonicalName, slotFromName, assignDefaultSlots };
