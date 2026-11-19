// Run set-ups that shuffle — called from clicks, never while rendering.
import { allSentencesOf, buildItem, fadeBlanks, FIX_MAX, shuffle, weakSentences } from '../../utils/task2Template';

// One queue entry, with its random part made here (in the click that starts it)
export function makeItem(s, kind, lvl, tries) {
  const it = { key: s.key, kind, lvl, tries };
  if (kind === 'build') it.build = buildItem(s);
  if (kind === 'fade') it.blanks = fadeBlanks(s, lvl);
  return it;
}
export function stageQueue(p, stage, b7) {
  if (stage === 1) return p.sentences.map((s) => makeItem(s, 'build', 0, 0));
  if (stage === 2) {
    const q = b7 ? [] : p.sentences.map((s) => makeItem(s, 'fade', 1, 0));
    return q.concat(p.sentences.map((s) => makeItem(s, 'fade', 2, 0)));
  }
  return p.sentences.map((s) => makeItem(s, 'recall', 0, 0));
}

// The run for paragraph pIdx (the first unfinished one when null); null when locked.
// Called from clicks only (it shuffles).
export function drillRun(ctx, pIdx, seq) {
  const paras = ctx.tpl.paras;
  const rounds = ctx.row.drillRounds || [];
  let p = pIdx;
  if (p == null) { p = paras.findIndex((_, i) => (rounds[i] || 0) < 3); if (p < 0) p = 0; }
  if (p > 0 && (rounds[p - 1] || 0) < 3) return null;
  const done = rounds[p] || 0;
  const stage = done >= 3 ? 1 : done + 1;
  return { id: seq + 1, p, stage, queue: stageQueue(paras[p], stage, ctx.isB7), pos: 0, pending: {}, between: false, firstOk: 0, answered: false };
}


// ⚡ Ôn nhanh: up to 6 of the weakest sentences
export function reviewItems(row, tpl) {
  const m = row.mastery || {};
  const pool = allSentencesOf(tpl);
  return shuffle(pool).sort((a, b) => (m[a.key] || 0) - (m[b.key] || 0)).slice(0, Math.min(6, pool.length));
}
// 🎯 Luyện câu yếu: the given keys (after ④), else the weakest practised lines
export function fixItems(row, tpl, keys) {
  const all = allSentencesOf(tpl);
  const picked = keys && keys.length ? keys.map((k) => all.find((s) => s.key === k)).filter(Boolean) : weakSentences(row, tpl);
  return picked.slice(0, FIX_MAX);
}
