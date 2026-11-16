// Helpers for the class page "🎤 Thi Speaking" tab (ClassSpeakingExamTab).
// Must match backend/controllers/speakingExam.controller.js's slot cutting:
// back-to-back slots of `slotMin` minutes that fit fully inside [from, to].

export const MODE_LABEL = { online: '💻 Online qua Google Meet', offline: '🏠 Offline tại nhà giáo viên' };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

export function slotCount(from, to, slotMin = 25) {
  if (!TIME_RE.test(from || '') || !TIME_RE.test(to || '')) return 0;
  const span = toMin(to) - toMin(from);
  return span >= slotMin ? Math.floor(span / slotMin) : 0;
}

// "YYYY-MM-DD" of today on the Vietnam calendar (the date picker's min).
export function vnTodayKey(now = Date.now()) {
  return new Date(now + 7 * 3600e3).toISOString().slice(0, 10);
}
