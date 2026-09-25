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

// Pure: map a student's isDefault books to slots. Books created before
// `defaultSlot` existed have none — they're matched by their canonical name
// first ("Sổ 3" -> slot 3), then any renamed leftovers fill the free slots in
// creation (_id) order, which is the order the original insertMany created
// Sổ 1..5 in. More than 5 legacy defaults -> the extras go to `extra` (the
// caller demotes them to ordinary books; their words are kept).
// `books` must be sorted by _id ascending.
function assignDefaultSlots(books) {
  const bySlot = new Map();
  const unslotted = [];
  const extra = [];
  for (const b of books) {
    if (SLOTS.includes(b.defaultSlot) && !bySlot.has(b.defaultSlot)) bySlot.set(b.defaultSlot, b);
    else unslotted.push(b);
  }
  const leftovers = [];
  for (const b of unslotted) {
    const d = DEFAULT_BOOKS.find((x) => x.name === b.name && !bySlot.has(x.slot));
    if (d) bySlot.set(d.slot, b); else leftovers.push(b);
  }
  for (const b of leftovers) {
    const free = SLOTS.find((s) => !bySlot.has(s));
    if (free) bySlot.set(free, b); else extra.push(b);
  }
  return { bySlot, extra, missing: SLOTS.filter((s) => !bySlot.has(s)) };
}

module.exports = { DEFAULT_BOOKS, SLOTS, canonicalName, assignDefaultSlots };
