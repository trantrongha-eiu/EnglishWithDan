'use strict';
// shared/tips-practice-shell.js — the part of a Tips "Luyện tập" section
// that Listening (js/listening-tips-practice.js, .ltp-*) and Reading
// (js/reading-tips-practice.js, .rtp-*) share: the entry card, loading a
// practice (login / Premium / slow server / errors), start · resume ·
// "Làm lại từ đầu", the panel header, browser-only persistence and scores,
// request error messages and scrolling. Each page keeps its own question
// screens, grading and extras (audio, highlighting) and passes them in.
//
// TipsPracticeShell.create(cfg) — cfg:
//   prefix ('ltp' | 'rtp'), icon, copy (lessonKey → { name, desc }),
//   storePrefix (localStorage key prefix, one entry per account)
//   getSt() / setSt(v)      the page's current practice state (null = entry card only)
//   nextSeq() / curSeq()    the page's load counter (a late response for an
//                           earlier request is dropped)
//   stopTimer(), halt()     stop the page's timers / anything playing
//   onMount()               extra reset when a tip is (re)mounted
//   fetchPractice(lessonKey), slowNoticeMs
//   itemsOf(practice), savedAnswer(a)
//   freshState(practice, items) / restoreState(rec, items)  the page's own st fields
//   snapshot(st)            the page's own persisted fields
//   isBusy(stOrRecord)      would "Làm lại từ đầu" throw away work?
//   resumeWhere(rec, items) " (Câu i/n)" on the resume button
//   isDone(i), closeClass, enterSel, onInput(e), onClick(e, lesson),
//   checkCurrent(), renderQuestion(), renderResult(), afterPanelState()
(function () {
  const STALE_MS = 30 * 24 * 60 * 60 * 1000; // a month-old unfinished practice is dropped

  function create(cfg) {
    const P = cfg.prefix;
    const esc = (s) => escHtml(s == null ? '' : String(s));
    const escNl = (s) => esc(s).replace(/\n/g, '<br>');
    // Options, tokens and clickable paragraphs aren't buttons; make them
    // reachable and usable from the keyboard.
    const KEY_ATTRS = 'tabindex="0" role="button"';
    const st = () => cfg.getSt();
    const halt = () => { if (cfg.halt) cfg.halt(); };

    // What to tell the student when a request fails. Our own 4xx messages
    // are already Vietnamese; anything else gets a plain explanation.
    function errorMessage(err, fallback) {
      if (err && err.name === 'AbortError') return 'Máy chủ phản hồi quá lâu (có thể đang khởi động). Vui lòng thử lại sau vài giây.';
      if (err && err.coldStart) return 'Máy chủ đang khởi động, vui lòng thử lại sau vài giây.';
      if (err && err.status >= 400 && err.status < 500 && err.body && err.body.message) return err.body.message;
      if (err && err.status >= 500) return 'Máy chủ đang gặp sự cố, vui lòng thử lại sau ít phút.';
      if (err && !err.status && (err instanceof TypeError || navigator.onLine === false)) return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
      return fallback;
    }

    // Screen-reader announcement (the panel itself is re-rendered wholesale).
    function announce(msg) {
      const el = document.getElementById(P + '-live');
      if (el) el.textContent = msg;
    }

    // ── Scrolling (the page is long on phones) ──────────────────────────

    // Height covered by the sticky navbar and the site's fixed banners.
    function topOffset() {
      const css = getComputedStyle(document.documentElement);
      const px = (name, dflt) => { const v = parseInt(css.getPropertyValue(name), 10); return Number.isFinite(v) ? v : dflt; };
      return px('--nav-height', 64) + px('--expiry-banner-height', 0);
    }

    // After moving to another screen: bring the panel header back into view
    // when it has scrolled off.
    function revealPanel() {
      const panel = panelEl();
      if (!panel || panel.hidden) return;
      const top = panel.getBoundingClientRect().top;
      if (top < topOffset() || top > window.innerHeight * 0.6) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Scrolls just enough to show an element that appeared below the fold
    // (feedback after "Kiểm tra"), never pushing its top under the navbar.
    function revealEl(el) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const over = r.bottom - window.innerHeight + 16;
      const room = r.top - topOffset() - 12;
      if (over > 0 && room > 0) window.scrollBy({ top: Math.min(over, room), behavior: 'smooth' });
    }

    // ── Browser-only persistence ────────────────────────────────────────
    // One localStorage entry per account: { [lessonKey]: { practice,
    // answers, idx, …the page's own fields, savedAt, last, best, attempts } }.
    // Every access is guarded — storage can be unavailable (private mode,
    // quota) and the practice must still work without it.
    let persistTimer = null;

    function storeKey() {
      const u = window.AuthService && typeof window.AuthService.getUser === 'function' ? window.AuthService.getUser() : null;
      return cfg.storePrefix + ((u && (u._id || u.id || u.username)) || 'anon');
    }
    function readStore() {
      try {
        const v = JSON.parse(localStorage.getItem(storeKey()) || '{}');
        return v && typeof v === 'object' ? v : {};
      } catch (e) { return {}; }
    }
    function writeStore(all) {
      try { localStorage.setItem(storeKey(), JSON.stringify(all)); } catch (e) { /* unavailable or full */ }
    }

    // The saved record for a tip, with its practice dropped if it's stale or
    // malformed (scores are kept either way).
    function loadRecord(key) {
      const rec = readStore()[key];
      if (!rec || typeof rec !== 'object') return null;
      const items = cfg.itemsOf(rec.practice);
      // (practices saved before every tip got its one fixed practice are dropped)
      const usable = Array.isArray(items) && items.length && rec.practice.fixed && Array.isArray(rec.answers)
        && rec.answers.length === items.length && Date.now() - (rec.savedAt || 0) < STALE_MS;
      if (!usable) { rec.practice = null; rec.answers = null; }
      return rec;
    }

    function persist() {
      clearTimeout(persistTimer);
      const s = st();
      if (!s) return;
      const all = readStore();
      all[s.lesson.lessonKey] = Object.assign({}, all[s.lesson.lessonKey] || {}, { // keeps last / best / attempts
        savedAt: Date.now(),
        practice: s.practice,
        answers: s.answers.map(cfg.savedAnswer),
        idx: s.idx,
      }, cfg.snapshot(s));
      writeStore(all);
    }
    function persistSoon() {
      clearTimeout(persistTimer);
      persistTimer = setTimeout(persist, 400);
    }

    // Once per completed practice (a "Làm lại" or a new practice counts again).
    function recordScore(score, total) {
      const all = readStore();
      const key = st().lesson.lessonKey;
      const rec = all[key] || {};
      const now = Date.now();
      rec.last = { score, total, at: now };
      if (!rec.best || score / total > rec.best.score / rec.best.total) rec.best = { score, total, at: now };
      rec.attempts = (rec.attempts || 0) + 1;
      all[key] = rec;
      writeStore(all);
    }

    // ── Entry card + lifecycle ──────────────────────────────────────────

    function supports(lesson) { return !!(lesson && lesson.hasPractice && cfg.copy[lesson.lessonKey]); }

    // Called by the Tips page after it renders a tip. Resets any practice
    // from a previously opened tip (its progress is already saved).
    function mount(lesson, slot) {
      cfg.stopTimer();
      halt();
      if (st()) persist();
      cfg.setSt(null);
      cfg.nextSeq();
      if (cfg.onMount) cfg.onMount();
      if (!slot || !supports(lesson)) return;
      slot.innerHTML = `<section class="${P}-section" id="${P}-section">
      <div id="${P}-entry-wrap"></div>
      <div class="${P}-panel" id="${P}-panel" hidden></div>
      <div class="${P}-sr" id="${P}-live" aria-live="polite"></div>
    </section>`;
      renderEntry(lesson);
      const section = slot.querySelector('#' + P + '-section');
      section.addEventListener('click', (e) => cfg.onClick(e, lesson));
      section.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.matches(cfg.enterSel)) { e.preventDefault(); cfg.checkCurrent(); return; }
        // Enter / Space on an option, a word or a paragraph (see KEY_ATTRS)
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-act][role="button"]')) {
          e.preventDefault();
          e.target.click();
        }
      });
      section.addEventListener('input', (e) => {
        if (!st()) return;
        cfg.onInput(e);
      });
    }

    // Entry card: start / resume buttons + the scores saved in this browser.
    function renderEntry(lesson) {
      const wrap = document.getElementById(P + '-entry-wrap');
      if (!wrap) return;
      const c = cfg.copy[lesson.lessonKey];
      const rec = loadRecord(lesson.lessonKey);
      const items = rec && cfg.itemsOf(rec.practice);
      const s = st();
      let buttons;
      if (s && s.lesson.lessonKey === lesson.lessonKey) {
        buttons = `<button type="button" class="${P}-btn" data-act="start">↻ Làm lại từ đầu</button>`;
      } else if (items && !rec.finished) {
        buttons = `<button type="button" class="${P}-btn ${P}-btn-primary" data-act="resume">▶ Tiếp tục bài đang làm${cfg.resumeWhere(rec, items)}</button>
        <button type="button" class="${P}-btn" data-act="start">↻ Làm lại từ đầu</button>`;
      } else if (items) {
        buttons = `<button type="button" class="${P}-btn ${P}-btn-primary" data-act="start">↻ Luyện lại</button>
        <button type="button" class="${P}-btn" data-act="resume">📖 Xem lại kết quả</button>`;
      } else {
        buttons = `<button type="button" class="${P}-btn ${P}-btn-primary" data-act="start">${cfg.icon} Bắt đầu luyện tập</button>`;
      }
      const stats = rec && rec.last
        ? `<div class="${P}-entry-stats">Lần gần nhất: <b>${rec.last.score}/${rec.last.total}</b>`
          + (rec.best ? ` · Cao nhất: <b>${rec.best.score}/${rec.best.total}</b>` : '')
          + ` · Đã luyện ${rec.attempts || 1} lần <span class="${P}-entry-note">(lưu trên trình duyệt này)</span></div>`
        : '';
      wrap.innerHTML = `<div class="${P}-entry">
      <div class="${P}-entry-icon">${cfg.icon}</div>
      <div class="${P}-entry-text">
        <div class="${P}-entry-title">Luyện tập ${esc(c.name)}</div>
        <div class="${P}-entry-desc">${esc(c.desc)}</div>
        ${stats}
      </div>
      <div class="${P}-entry-actions">${buttons}</div>
    </div>`;
    }

    function panelEl() { return document.getElementById(P + '-panel'); }

    function showPanelState(html) {
      const panel = panelEl();
      if (!panel) return;
      panel.hidden = false;
      panel.innerHTML = html;
      if (cfg.afterPanelState) cfg.afterPanelState();
    }

    async function start(lesson) {
      cfg.stopTimer();
      halt();
      if (st()) persist();
      cfg.setSt(null);
      const seq = cfg.nextSeq();
      const panel = panelEl();
      if (!panel) return;
      const entryBtn = document.querySelector(`#${P}-entry-wrap [data-act="start"]`);
      if (!(window.AuthService && window.AuthService.isLoggedIn())) {
        const next = location.pathname + location.search;
        const loginUrl = window.AuthService && window.AuthService.buildLoginUrl
          ? window.AuthService.buildLoginUrl(next) : '/login.html?next=' + encodeURIComponent(next);
        showPanelState(`<div class="${P}-state"><div class="${P}-state-icon">🔐</div>
        <div>Bạn cần đăng nhập để luyện tập.</div>
        <a class="${P}-btn ${P}-btn-primary" href="${esc(loginUrl)}">Đăng nhập</a></div>`);
        return;
      }
      if (entryBtn) entryBtn.disabled = true;
      showPanelState(`<div class="${P}-state" role="status"><div class="${P}-state-icon"><i class="fas fa-spinner fa-spin"></i></div>
      <div>Đang tải bài luyện tập...</div>
      <div class="${P}-state-slow" hidden>Máy chủ có thể đang khởi động — chờ thêm chút nhé…</div></div>`);
      const slow = setTimeout(() => {
        const el = seq === cfg.curSeq() && document.querySelector(`#${P}-panel .${P}-state-slow`);
        if (el) el.hidden = false;
      }, cfg.slowNoticeMs);
      try {
        const data = await cfg.fetchPractice(lesson.lessonKey);
        if (seq !== cfg.curSeq()) return; // another tip / request took over meanwhile
        if (!data.practice) {
          renderEntry(lesson);
          showPanelState(`<div class="${P}-state"><div class="${P}-state-icon">📭</div>
          <div>${esc(data.message || 'Chưa tìm thấy bài luyện tập phù hợp.')}</div>
          <button type="button" class="${P}-btn" data-act="dismiss">Đóng</button></div>`);
          return;
        }
        begin(lesson, data.practice);
      } catch (err) {
        if (seq !== cfg.curSeq()) return;
        renderEntry(lesson); // a practice saved earlier can still be resumed
        if (err && err.body && err.body.requiresPremium) {
          showPanelState(`<div class="${P}-state"><div class="${P}-state-icon">⭐</div>
          <div>${esc(err.body.message || 'Bạn cần nâng cấp lên Premium để luyện tập.')}</div>
          <button type="button" class="${P}-btn ${P}-btn-primary" data-act="upgrade">Nâng cấp Premium</button></div>`);
          return;
        }
        showPanelState(`<div class="${P}-state ${P}-state-error" role="alert"><div class="${P}-state-icon">⚠️</div>
        <div>${esc(errorMessage(err, 'Không tải được bài luyện tập. Vui lòng thử lại.'))}</div>
        <button type="button" class="${P}-btn" data-act="start" data-force="1">Thử lại</button></div>`);
      } finally {
        clearTimeout(slow);
        if (entryBtn) entryBtn.disabled = false;
      }
    }

    // "Làm lại từ đầu" replaces the practice in progress (and its saved
    // answers) — ask first when the student has already done something in it.
    function confirmNewPractice(lesson, go) {
      let busy;
      const s = st();
      if (s) busy = !s.finished && cfg.isBusy(s);
      else {
        const rec = loadRecord(lesson.lessonKey);
        busy = !!(rec && rec.practice && !rec.finished && cfg.isBusy(rec));
      }
      if (!busy) { go(); return; }
      const msg = 'Các câu bạn đã làm trong bài này sẽ bị xoá để làm lại từ đầu. Bạn chắc chứ?';
      if (typeof window.confirmDialog === 'function') {
        window.confirmDialog('Làm lại từ đầu?', msg, go, { confirmLabel: 'Làm lại', confirmClass: 'btn-primary' });
      } else if (window.confirm(msg)) go();
    }

    function begin(lesson, practice) {
      const items = cfg.itemsOf(practice);
      cfg.setSt(Object.assign({ lesson, practice, kind: practice.kind, items, idx: 0 }, cfg.freshState(practice, items)));
      persist();
      renderEntry(lesson);
      cfg.renderQuestion();
      revealPanel();
    }

    // Re-opens the practice saved in this browser.
    function resume(lesson) {
      const rec = loadRecord(lesson.lessonKey);
      const items = rec && cfg.itemsOf(rec.practice);
      if (!items) { renderEntry(lesson); return; }
      cfg.stopTimer();
      halt();
      cfg.nextSeq();
      cfg.setSt(Object.assign({
        lesson, practice: rec.practice, kind: rec.practice.kind, items,
        idx: Math.min(Math.max(Number(rec.idx) || 0, 0), items.length - 1),
      }, cfg.restoreState(rec, items)));
      renderEntry(lesson);
      if (st().finished) cfg.renderResult(); else cfg.renderQuestion();
      revealPanel();
    }

    function headerHtml(sourceLine) {
      const s = st();
      const n = s.items.length;
      const done = s.answers.filter((a, i) => cfg.isDone(i)).length;
      return `<div class="${P}-head">
      <div class="${P}-head-top">
        <div class="${P}-title">${cfg.icon} Luyện tập: ${esc(cfg.copy[s.lesson.lessonKey].name)}</div>
        <button type="button" class="${P}-link${cfg.closeClass || ''}" data-act="close" title="Đóng bài luyện tập">✕ Đóng</button>
      </div>
      ${sourceLine ? `<div class="${P}-source">Nguồn: ${sourceLine}</div>` : ''}
      <div class="${P}-progress">
        <span>Câu ${s.idx + 1} / ${n}</span>
        <div class="${P}-bar"><i style="width:${Math.round(done / n * 100)}%"></i></div>
        <span class="${P}-done">${done}/${n} đã làm</span>
      </div>
    </div>`;
    }

    return {
      esc, escNl, KEY_ATTRS, errorMessage, announce, topOffset, revealPanel, revealEl,
      loadRecord, persist, persistSoon, recordScore,
      supports, mount, renderEntry, panelEl, showPanelState, start, confirmNewPractice, begin, resume, headerHtml,
    };
  }

  window.TipsPracticeShell = { create };
})();
