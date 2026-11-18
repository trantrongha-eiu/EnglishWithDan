// Điền từ (cloze): find the word inside its own example sentence so it can
// be blanked out. Same rules as dashboard.js _findClozeTarget: the exact
// word/phrase first, then common inflections ("analyse" → "analysed",
// "study" → "studies", "stop" → "stopped"); a phrase may be hyphenated in
// the sentence ("up-to-date").
const escR = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function tokenRe(tok) {
  const t = tok.toLowerCase();
  const e = escR(t);
  const alts = [`${e}(?:s|es|d|ed|ing|er|ers|est|ly)?`];
  if (t.length >= 3 && /[a-z]e$/.test(t)) alts.push(`${escR(t.slice(0, -1))}(?:ing|ed|er|ers|est)`);
  if (t.length >= 3 && /[^aeiou]y$/.test(t)) alts.push(`${escR(t.slice(0, -1))}i(?:es|ed|er|ers|est|ly)`);
  if (t.length >= 3 && /[^aeiou][aeiou][bdgklmnprt]$/.test(t)) alts.push(`${e}${escR(t.slice(-1))}(?:ed|ing|er|ers|est)`);
  return `(?:${alts.join('|')})`;
}

// → { before, answer, after } or null
export function findClozeTarget(sentence, word) {
  const s = String(sentence || '');
  const wd = String(word || '').trim();
  if (!s || !wd || !/[A-Za-z]/.test(wd)) return null;
  const toks = wd.split(/\s+/);
  // No lookbehind (older iOS Safari can't parse it) — capture the left edge instead.
  const tryRe = (body) => {
    const m = new RegExp(`(^|[^A-Za-z0-9])(${body})(?![A-Za-z0-9])`, 'i').exec(s);
    if (!m) return null;
    const start = m.index + m[1].length;
    return { before: s.slice(0, start), answer: m[2], after: s.slice(start + m[2].length) };
  };
  const sep = '[\\s-]+';
  return tryRe(toks.map(escR).join(sep)) || tryRe(toks.map(tokenRe).join(sep));
}

const cache = new WeakMap();
export function clozeFor(w) {
  if (!w || typeof w !== 'object') return null;
  const key = `${w.word}\u0000${w.example || ''}`;
  const hit = cache.get(w);
  if (hit && hit.key === key) return hit.res;
  const res = findClozeTarget(w.example, w.word);
  cache.set(w, { key, res });
  return res;
}
