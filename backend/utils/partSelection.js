// "Chọn phần làm" for a full Reading/Listening test — the student picks a
// subset of passages (Reading, 1–3) or sections (Listening, 1–4) instead of
// the whole test. A partial attempt stores its picked parts on the attempt
// row (`parts`); a full one leaves the field absent, exactly like every
// attempt made before this existed.

// raw: whatever the client sent. Returns null for "the whole test" (absent,
// malformed, or every part picked) — otherwise the picked part numbers,
// sorted and de-duplicated.
function normalizeParts(raw, count) {
  if (!Array.isArray(raw)) return null;
  const parts = [...new Set(raw.map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= count))].sort((a, b) => a - b);
  if (!parts.length || parts.length === count) return null;
  return parts;
}

// The attempt filter that matches only rows started with the same pick —
// a still-open P1-only attempt must never be resumed as the full test.
function partsFilter(parts) {
  return parts ? { parts } : { parts: { $exists: false } };
}

// Band for a partial attempt: the raw score scaled to the 40-question band
// table (an estimate — the official table only exists for all 40).
function scaledCorrect(correct, total) {
  if (!total) return 0;
  return Math.round((correct * 40) / total);
}

module.exports = { normalizeParts, partsFilter, scaledCorrect };
