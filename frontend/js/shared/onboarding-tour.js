/* ══════════════════════════════════════════════════════════════════════
   onboarding-tour.js — first-visit feature tour for new students.

   Self-injecting component (same pattern as upgrade-modal.js /
   learning-popups.js): any page that loads this file gets window.EWSTour
   immediately, no per-page markup needed. Auto-starts once per browser
   (localStorage-gated) on dashboard.html only, after a short delay so
   nav.js (which injects the top nav synchronously but is loaded via a
   separate <script> tag) and the sidebar's own async notebook fetch have
   had a moment to settle.

   Every step points at a REAL element already on the page — no invented
   feature (no ELO/battle system exists here) — via a resolver function
   rather than a fixed selector, so a step that resolves to nothing
   currently visible (e.g. the desktop-only vocab sidebar on a phone, or
   the desktop nav-links row collapsed behind the mobile hamburger) is
   skipped automatically instead of spotlighting an invisible element.
══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TOUR_KEY = 'ews_onboarding_tour_v1';

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && !!el.getClientRects().length;
  }

  // ── Step definitions — resolver returns the element to spotlight, or
  // null/undefined to skip this step entirely. ──────────────────────────
  const STEPS = [
    {
      icon: '🧭',
      title: 'Menu chính',
      body: 'Đây là nơi bạn vào từng kỹ năng: Reading, Listening, Writing, Speaking, Luyện viết — mỗi mục đều có bài luyện lẻ và full đề thi thử. Trên điện thoại, bấm biểu tượng ☰ để mở menu.',
      resolve() {
        const links = document.querySelector('.top-nav .nav-links');
        if (isVisible(links)) return links;
        const ham = document.getElementById('globalHamburger');
        return isVisible(ham) ? ham : null;
      }
    },
    {
      icon: '✍️',
      title: 'Luyện viết',
      body: 'Mục "Luyện viết" gồm Task 1 Grammar, Task 2 Writing (luyện theo tuần, tự động lưu tiến độ), Task 2 Templates và Essential Grammar. Bấm vào để mở danh sách.',
      resolve() {
        const link = document.querySelector('.top-nav a[href="writing-practice.html"]');
        const dropdown = link && link.closest('.nav-dropdown');
        return isVisible(dropdown) ? dropdown : null;
      }
    },
    {
      icon: '📚',
      title: 'Sổ từ vựng',
      body: 'Đây là sổ từ vựng cá nhân của bạn. Khi luyện tập ở bất kỳ trang nào, lưu từ mới vào đây rồi quay lại ôn tập bất cứ lúc nào.',
      resolve() {
        const sidebar = document.getElementById('vocabSidebar');
        return isVisible(sidebar) ? sidebar : null;
      }
    },
    {
      icon: '🔔',
      title: 'Thông báo & Trang cá nhân',
      body: 'Bấm chuông để xem thông báo, kính lúp để tìm đề nhanh, và bấm avatar để vào Trang cá nhân — nơi bạn theo dõi streak học liên tục, huy hiệu và điểm số các bài đã làm.',
      resolve() {
        const actions = document.querySelector('.top-nav .nav-actions');
        return isVisible(actions) ? actions : null;
      },
      isLast: true
    }
  ];

  // ── Styles ──────────────────────────────────────────────────────────
  const css = document.createElement('style');
  css.textContent = `
    #ews-tour-tip{position:fixed;z-index:9601;background:#fff;color:#111;border-radius:16px;width:min(360px,calc(100vw - 32px));box-shadow:0 24px 64px rgba(0,0,0,.32);padding:18px 20px;font-family:inherit;}
    [data-theme="dark"] #ews-tour-tip{background:#1a1a1a;color:#f1f5f9;}
    #ews-tour-tip .ews-tour-step{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;}
    #ews-tour-tip .ews-tour-title{font-size:17px;font-weight:800;margin:0 0 8px;display:flex;align-items:center;gap:8px;}
    #ews-tour-tip .ews-tour-body{font-size:13.5px;line-height:1.55;color:var(--text2,#444);margin:0 0 16px;}
    [data-theme="dark"] #ews-tour-tip .ews-tour-body{color:#c3c9d3;}
    #ews-tour-tip .ews-tour-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;}
    #ews-tour-tip .ews-tour-next{background:linear-gradient(135deg,var(--brand,#e53935),var(--brand-dark,#c62828));color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;}
    #ews-tour-tip .ews-tour-next:hover{filter:brightness(1.06);}
    #ews-tour-tip .ews-tour-skip{background:none;border:none;color:#9ca3af;font-size:13px;font-family:inherit;cursor:pointer;padding:8px 4px;}
    #ews-tour-tip .ews-tour-skip:hover{color:#6b7280;text-decoration:underline;}
    .ews-tour-spotlight{position:relative!important;z-index:9600!important;box-shadow:0 0 0 4px #fbbf24,0 0 0 9999px rgba(15,23,42,.62),0 0 28px 6px rgba(251,191,36,.45)!important;border-radius:12px!important;transition:box-shadow .2s ease;}
  `;
  document.head.appendChild(css);

  let currentIdx = -1;
  let currentTarget = null;
  let tipEl = null;

  function clearSpotlight() {
    if (currentTarget) {
      currentTarget.classList.remove('ews-tour-spotlight');
      currentTarget = null;
    }
  }

  function positionTip(target) {
    if (!tipEl) return;
    const r = target.getBoundingClientRect();
    const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
    const margin = 14;
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const spaceRight = window.innerWidth - r.right;
    const spaceLeft = r.left;
    // A tall, narrow target (e.g. the vocab sidebar) needs a side placement —
    // "below"/"above" would either run off-screen or land the tip on top of
    // the very thing being spotlighted, since the target's own height can
    // exceed the tip's. Wide targets (nav bars) keep the below/above default.
    const tall = r.height > r.width * 1.3;
    const candidates = tall
      ? [['right', spaceRight >= tw + margin], ['left', spaceLeft >= tw + margin], ['below', spaceBelow >= th + margin], ['above', spaceAbove >= th + margin]]
      : [['below', spaceBelow >= th + margin], ['above', spaceAbove >= th + margin], ['right', spaceRight >= tw + margin], ['left', spaceLeft >= tw + margin]];
    const placement = (candidates.find(c => c[1]) || candidates[0])[0];

    let top, left;
    if (placement === 'below') { top = r.bottom + margin; left = r.left + r.width / 2 - tw / 2; }
    else if (placement === 'above') { top = r.top - th - margin; left = r.left + r.width / 2 - tw / 2; }
    else if (placement === 'right') { left = r.right + margin; top = r.top + r.height / 2 - th / 2; }
    else { left = r.left - tw - margin; top = r.top + r.height / 2 - th / 2; }

    top = Math.min(Math.max(top, margin), window.innerHeight - th - margin);
    left = Math.min(Math.max(left, margin), window.innerWidth - tw - margin);
    tipEl.style.top = top + 'px';
    tipEl.style.left = left + 'px';
  }

  function endTour() {
    clearSpotlight();
    if (tipEl) { tipEl.remove(); tipEl = null; }
    window.removeEventListener('resize', onReposition);
    window.removeEventListener('scroll', onReposition, true);
    try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) {}
    currentIdx = -1;
  }

  function onReposition() {
    if (currentTarget) positionTip(currentTarget);
  }

  function renderStep(idx) {
    if (idx >= STEPS.length) { endTour(); return; }
    const step = STEPS[idx];
    const target = step.resolve();
    if (!target) { renderStep(idx + 1); return; }

    clearSpotlight();
    currentIdx = idx;
    currentTarget = target;
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    target.classList.add('ews-tour-spotlight');

    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.id = 'ews-tour-tip';
      document.body.appendChild(tipEl);
    }
    const nextLabel = step.isLast ? 'Đã hiểu ✅' : 'Tiếp theo →';
    tipEl.innerHTML =
      '<div class="ews-tour-step">Hướng dẫn · ' + (idx + 1) + ' / ' + STEPS.length + '</div>' +
      '<div class="ews-tour-title">' + step.icon + ' ' + step.title + '</div>' +
      '<div class="ews-tour-body">' + step.body + '</div>' +
      '<div class="ews-tour-foot">' +
        '<button class="ews-tour-next" id="ews-tour-next-btn">' + nextLabel + '</button>' +
        (step.isLast ? '' : '<button class="ews-tour-skip" id="ews-tour-skip-btn">Bỏ qua</button>') +
      '</div>';

    document.getElementById('ews-tour-next-btn').addEventListener('click', function () {
      if (step.isLast) endTour(); else renderStep(idx + 1);
    });
    const skipBtn = document.getElementById('ews-tour-skip-btn');
    if (skipBtn) skipBtn.addEventListener('click', endTour);

    // Wait a frame so the tip has real dimensions before positioning.
    requestAnimationFrame(function () { positionTip(target); });
  }

  function start() {
    endTour(); // reset any stale state before a fresh run
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    renderStep(0);
  }

  function reset() {
    try { localStorage.removeItem(TOUR_KEY); } catch (e) {}
  }

  window.EWSTour = { start, reset };

  // ── Auto-start: dashboard.html only, once per browser, logged-in users ──
  document.addEventListener('DOMContentLoaded', function () {
    const page = location.pathname.split('/').pop() || 'dashboard.html';
    if (page !== 'dashboard.html') return;
    let seen = false;
    try { seen = localStorage.getItem(TOUR_KEY) === '1'; } catch (e) {}
    if (seen) return;
    const loggedIn = window.AuthService && window.AuthService.isLoggedIn && window.AuthService.isLoggedIn();
    if (!loggedIn) return;
    setTimeout(start, 900);
  });
})();
