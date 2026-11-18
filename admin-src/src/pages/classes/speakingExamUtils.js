// Helpers for the class page "🎤 Thi Speaking" tab (ClassSpeakingExamTab).
// Must match backend/controllers/speakingExam.controller.js's slot cutting:
// back-to-back slots of `slotMin` minutes that fit fully inside [from, to].
// Days are "YYYY-MM-DD" keys on the Vietnam calendar, weeks run Monday → Sunday.

export const MODE_LABEL = { online: '💻 Online qua Google Meet', offline: '🏠 Offline tại nhà giáo viên' };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const keyMs = (key) => Date.parse(`${key}T00:00:00Z`);

export function slotCount(from, to, slotMin = 25) {
  if (!TIME_RE.test(from || '') || !TIME_RE.test(to || '')) return 0;
  const span = toMin(to) - toMin(from);
  return span >= slotMin ? Math.floor(span / slotMin) : 0;
}

// "YYYY-MM-DD" of today on the Vietnam calendar (the date picker's min).
export function vnTodayKey(now = Date.now()) {
  return new Date(now + 7 * 3600e3).toISOString().slice(0, 10);
}

export function addDays(key, n) {
  return new Date(keyMs(key) + n * 864e5).toISOString().slice(0, 10);
}

// Monday of the week containing `key`.
export function weekStart(key) {
  return addDays(key, -((new Date(keyMs(key)).getUTCDay() + 6) % 7));
}

export function weekDays(start) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function dayParts(key) {
  return { weekday: WEEKDAY[new Date(keyMs(key)).getUTCDay()], date: `${key.slice(8, 10)}/${key.slice(5, 7)}` };
}

// "16/11 – 22/11"
export function weekLabel(start) {
  return `${dayParts(start).date} – ${dayParts(addDays(start, 6)).date}`;
}

// Every picked day × every complete time window → POST body `ranges`.
export function buildRanges(days, windows) {
  const full = windows.filter((w) => w.from && w.to);
  return [...days].sort().flatMap((date) => full.map((w) => ({ date, from: w.from, to: w.to })));
}
