// Vocab Topics (vocabulary lessons) + Paraphrase units — shared helpers.
// Port of dashboard-lesson.js / dashboard-browse.js bits.

// Deterministic "lesson of the day": stable pseudo-random pick keyed to the
// LOCAL date (every student sees the same lesson all day).
export function todaysLessonIndex(count) {
  if (count <= 1) return 0;
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  let x = (seed ^ 0x9e3779b9) >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return (x >>> 0) % count;
}

// Grouped by targetClass: named classes first (natural order), "Chung" last
export function groupByClass(lessons) {
  const groups = new Map();
  for (const l of lessons) {
    const key = l.targetClass || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(l);
  }
  return [...groups.keys()]
    .sort((a, b) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b, 'vi', { numeric: true })))
    .map(key => ({ key, label: key ? `Lớp ${key}` : 'Chung (mọi lớp)', items: groups.get(key) }));
}

// from: the list Back should return to ('topics' / 'paraphrase')
const fromQs = (from) => (from ? `?from=${from}` : '');
export const lessonHref = (id, from) => `/app/#/dashboard/lesson/${encodeURIComponent(id)}${fromQs(from)}`;
export const unitHref = (n, from) => `/app/#/dashboard/unit/${encodeURIComponent(n)}${fromQs(from)}`;
export const PARA_REVIEW_HREF = '/app/#/dashboard/practice?src=paraphrase&from=paraphrase';

// "Học tiếp" memory — same keys as dashboard-browse.js
export const LAST_KEY = { paraphrase: 'ews_pb_last_unit', topics: 'ews_pb_last_lesson' };
export function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
export function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
