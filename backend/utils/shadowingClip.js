'use strict';

/**
 * How the Shadowing player (frontend/js/shadowing.js) plays a lesson straight
 * through ("Xem video" / "Phát liên tục"): a silence of SKIP_GAP seconds or
 * more between two sentences is a part cut out of the lesson (a channel ad,
 * the 1-minute Part 2 preparation in a mock test, a writing pause), so the
 * player jumps it — keeping TAIL seconds after the sentence and LEAD seconds
 * before the next one. Keep these numbers in step with shadowing.js.
 */
const SKIP_GAP = 6;
const TAIL = 1;
const LEAD = 0.4;

// Seconds the student actually watches, first sentence to last, cut parts excluded.
function playDuration(segments) {
  if (!segments || !segments.length) return 0;
  let total = 0;
  segments.forEach((s, i) => {
    total += s.end - s.start;
    if (i) {
      const gap = Math.max(0, s.start - segments[i - 1].end);
      total += gap >= SKIP_GAP ? TAIL + LEAD : gap;
    }
  });
  return Math.round(total);
}

module.exports = { SKIP_GAP, TAIL, LEAD, playDuration };
