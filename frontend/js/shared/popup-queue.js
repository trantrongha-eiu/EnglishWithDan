/**
 * shared/popup-queue.js — one-at-a-time gate for the full-screen "attention"
 * popups that can all fire on the same page load (especially right after
 * login on dashboard.html):
 *
 *   • learning-popups.js  — goal-setup / today's-plan modal (#lp-overlay)
 *   • review-required-popup.js — "review a pending test first" (#rd-popup-backdrop)
 *   • nav.js — streak-rule announcement + "long time no vocab" nudge
 *   • badge-popup.js — "🎉 Huy hiệu mới!" (#bp-backdrop)
 *   • onboarding-tour.js — first-visit guided tour (#ews-tour-tip)
 *   • writing-rewrite-reminder.js — "you have essays to rewrite" (#wrr-modal-overlay)
 *
 * Each of those used to render the instant its own async data came back, so
 * a fresh login showed several stacked on top of each other with dismiss
 * buttons peeking out from behind. They now call PopupQueue.enqueue(...)
 * instead of showing directly; the queue shows one, waits for it to be
 * dismissed, then shows the next.
 *
 *   window.PopupQueue.enqueue({
 *     id: 'goal-setup',      // optional — dedupe: a live/pending same id is ignored
 *     priority: 20,          // optional — higher runs first within a load burst
 *     show: function (done) { ...open the popup... },
 *     until: '#lp-overlay'   // optional — selector or () => Element; the queue
 *   });                      //   auto-advances once it appears then disappears
 *
 * `show` may finish synchronously by calling done() itself (nothing to show
 * after all). If neither done() nor `until` resolves, a watchdog releases the
 * queue after WATCHDOG_MS so one wedged popup can't block the rest forever.
 *
 * Load this BEFORE any of the consumer scripts. Consumers fall back to
 * showing immediately when window.PopupQueue is absent, so a page that
 * forgets the tag still works (just without ordering).
 */
(function () {
  'use strict';
  if (window.PopupQueue) return;

  var COLLECT_MS  = 500;     // burst-ordering window before the first job runs
  var GAP_MS      = 220;     // breather between two popups
  var APPEAR_MS   = 8000;    // wait this long for `until` to first become visible
  var WATCHDOG_MS = 180000;  // absolute cap on one popup holding the queue

  var queue   = [];
  var running = false;
  var current = null;
  var armed   = false;       // has the collection window elapsed at least once
  var arming  = false;       // collection window scheduled, not yet elapsed

  function enqueue(opts) {
    opts = opts || {};
    if (typeof opts.show !== 'function') return;
    if (opts.id) {
      var dup = (current && current.id === opts.id)
        || queue.some(function (j) { return j.id === opts.id; });
      if (dup) return;
    }
    queue.push({
      id: opts.id || null,
      priority: opts.priority || 0,
      show: opts.show,
      until: opts.until || null
    });
    if (armed) { next(); return; }
    if (arming) return;
    arming = true;
    setTimeout(function () { armed = true; arming = false; next(); }, COLLECT_MS);
  }

  function next() {
    if (running || !armed || !queue.length) return;
    queue.sort(function (a, b) { return b.priority - a.priority; });
    var job = queue.shift();
    current = job;
    running = true;

    var settled = false;
    function done() {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      current = null;
      running = false;
      setTimeout(next, GAP_MS);
    }
    var watchdog = setTimeout(done, WATCHDOG_MS);
    if (job.until) watchVisibility(job.until, done);
    try { job.show(done); } catch (e) { done(); }
  }

  // Resolve `sel` (selector string or function -> Element) and call cb once
  // the element has been visible and then stops being visible (removed from
  // the DOM or display:none / visibility:hidden). If it never becomes visible
  // within APPEAR_MS, call cb anyway — `show` chose not to render anything.
  function watchVisibility(sel, cb) {
    var sawVisible = false;
    var t0 = Date.now();

    function el() {
      try { return typeof sel === 'function' ? sel() : document.querySelector(sel); }
      catch (e) { return null; }
    }
    function visible(e) {
      if (!e || !document.body || !document.body.contains(e)) return false;
      if (e.getClientRects().length === 0) return false; // display:none / detached
      var cs = window.getComputedStyle(e);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
    }
    function tick() {
      if (visible(el())) { sawVisible = true; return; }
      if (sawVisible || Date.now() - t0 > APPEAR_MS) { stop(); cb(); }
    }

    var iv = setInterval(tick, 250);
    var mo = null;
    try {
      mo = new MutationObserver(tick);
      mo.observe(document.body, {
        childList: true, subtree: true,
        attributes: true, attributeFilter: ['class', 'style', 'hidden']
      });
    } catch (e) {}
    function stop() { clearInterval(iv); if (mo) mo.disconnect(); }

    tick();
  }

  window.PopupQueue = { enqueue: enqueue };
})();
