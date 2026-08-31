/* ══════════════════════════════════════════════════════════════════════
   onboarding-tour.js — first-visit feature tour, per page.

   Self-injecting component (same pattern as upgrade-modal.js /
   learning-popups.js): any page that loads this file gets window.EWSTour
   immediately, no per-page markup needed beyond the <script> tag. Each
   page below gets its OWN tour (own step list, own localStorage key —
   ews_onboarding_tour_v1_<page> — so finishing the dashboard tour doesn't
   silently skip the reading tour, etc.) and auto-starts once per browser
   for logged-in users on that specific page.

   Every step points at a REAL element already on that page — no invented
   feature — via a resolver function rather than a fixed selector, so a
   step whose target isn't currently visible (desktop-only sidebar on a
   phone, desktop nav row collapsed behind the mobile hamburger, a banner
   that's only shown conditionally) is skipped automatically instead of
   spotlighting nothing.
══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && !!el.getClientRects().length;
  }

  // Shared resolver: desktop nav-links row, falling back to the mobile
  // hamburger when the row itself is collapsed away. Reused by every
  // page's first step below.
  function resolveNavMenu() {
    const links = document.querySelector('.top-nav .nav-links');
    if (isVisible(links)) return links;
    const ham = document.getElementById('globalHamburger');
    return isVisible(ham) ? ham : null;
  }

  // ── Per-page step definitions — resolver returns the element to
  // spotlight, or null/undefined to skip that step entirely. ────────────
  const PAGE_TOURS = {
    'dashboard.html': [
      {
        icon: '🧭',
        title: 'Menu chính',
        body: 'Đây là nơi bạn vào từng kỹ năng: Reading, Listening, Writing, Speaking, Luyện viết — mỗi mục đều có bài luyện lẻ và full đề thi thử. Trên điện thoại, bấm biểu tượng ☰ để mở menu.',
        resolve: resolveNavMenu
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
    ],

    'reading.html': [
      {
        icon: '📖',
        title: 'Chọn chế độ',
        body: 'Full đề: làm bài đầy đủ 3 passages trong 60 phút, tính band điểm như thi thật. Bài lẻ: luyện từng passage riêng theo chủ đề. Reading Tips: chiến lược làm từng dạng câu hỏi.',
        resolve() {
          const bar = document.querySelector('.rmode-tabs-bar');
          return isVisible(bar) ? bar : null;
        }
      },
      {
        icon: '📄',
        title: 'Danh sách đề',
        body: 'Đây là danh sách đề Full test — mỗi đề có 3 passages và 40 câu hỏi. Gõ tên đề vào ô tìm kiếm ở trên để tìm nhanh, hoặc bấm vào một đề để bắt đầu làm bài có tính giờ.',
        resolve() {
          const wrap = document.getElementById('tests-wrapper');
          return isVisible(wrap) ? wrap : null;
        },
        isLast: true
      }
    ],

    'listening.html': [
      {
        icon: '🎧',
        title: 'Chọn chế độ',
        body: 'Full đề: làm bài đầy đủ 4 sections trong 30 phút, tính band điểm như thi thật. Bài lẻ: luyện từng section riêng. Listening Tips: chiến lược nghe theo từng dạng câu hỏi.',
        resolve() {
          const bar = document.querySelector('.rmode-tabs-bar');
          return isVisible(bar) ? bar : null;
        }
      },
      {
        icon: '🎵',
        title: 'Danh sách đề',
        body: 'Đây là danh sách đề Full test Listening. Gõ tên đề vào ô tìm kiếm ở trên để tìm nhanh, hoặc bấm vào một đề để bắt đầu làm bài có tính giờ và phát audio.',
        resolve() {
          const wrap = document.getElementById('tests-wrapper');
          return isVisible(wrap) ? wrap : null;
        }
      },
      {
        icon: '⌨️',
        title: 'Dictation',
        body: 'Ngoài Listening, mục "Dictation" trong menu Listening giúp bạn luyện nghe — chép chính tả từng câu để rèn khả năng nghe chi tiết.',
        resolve() {
          const link = document.querySelector('.top-nav a[href="dictation.html"]');
          const dropdown = link && link.closest('.nav-dropdown');
          return isVisible(dropdown) ? dropdown : resolveNavMenu();
        },
        isLast: true
      }
    ],

    'speaking.html': [
      {
        icon: '🎙',
        title: 'Các lựa chọn luyện Speaking',
        body: 'Luyện tập: chọn đề Part 1, 2, 3 và ghi âm để nhận AI feedback ngay. Thi thử đầy đủ: mô phỏng bài thi hoàn chỉnh. Lịch sử, Tài liệu và Speaking Tips cũng nằm ở đây.',
        resolve() {
          const cards = document.querySelector('.sp-home-cards');
          return isVisible(cards) ? cards : null;
        }
      },
      {
        icon: '🎓',
        title: 'Thi thử đầy đủ',
        body: 'Mô phỏng bài thi Speaking hoàn chỉnh — Part 1, 2, 3 với đề ngẫu nhiên, AI chấm điểm toàn bài giống giám khảo thật.',
        resolve() {
          const el = document.getElementById('btn-full-mock');
          return isVisible(el) ? el : null;
        },
        isLast: true
      }
    ],

    'writing.html': [
      {
        icon: '⏱️',
        title: 'Thi thử Writing',
        body: 'Bấm để làm bài thi Writing đầy đủ — Task 1 + Task 2 với đề ngẫu nhiên, có tính giờ 60 phút, giống thi thật.',
        resolve() {
          const btn = document.getElementById('btn-start');
          return isVisible(btn) ? btn : null;
        }
      },
      {
        icon: '📋',
        title: 'Các lựa chọn khác',
        body: 'Luyện tập lẻ để làm từng Task riêng không tính giờ, xem lại Lịch sử các bài đã nộp, đọc Tài liệu mẫu, hoặc xem Writing Tips theo từng dạng đề.',
        resolve() {
          const el = document.querySelector('.key-card-actions');
          return isVisible(el) ? el : null;
        },
        isLast: true
      }
    ],

    'writing-practice.html': [
      {
        icon: '📝',
        title: 'Luyện tập hay Thi thử',
        body: 'Luyện tập: làm từng câu, có gợi ý và nhận phản hồi ngay sau mỗi câu — tích lũy XP và combo. Thi thử: làm một bộ đề ngẫu nhiên không có gợi ý, giống thi thật, xem đáp án sau khi nộp.',
        resolve() {
          const el = document.querySelector('.wp-mode-toggle');
          return isVisible(el) ? el : null;
        }
      },
      {
        icon: '🎯',
        title: 'Cấp độ & chủ đề',
        body: 'Chọn cấp độ (Beginner → Intermediate), chủ đề và dạng bài (dịch câu, sắp xếp từ, điền chỗ trống...) ở đây trước khi bắt đầu luyện tập.',
        resolve() {
          const el = document.getElementById('practice-filters');
          return isVisible(el) ? el : null;
        }
      },
      {
        icon: '🚀',
        title: 'Bắt đầu luyện tập',
        body: 'Sau khi chọn xong ở thanh bên, bấm đây để bắt đầu. Trả lời đúng liên tiếp 3–10 câu sẽ kích hoạt combo thưởng XP — duy trì học mỗi ngày để giữ streak.',
        resolve() {
          const el = document.querySelector('.wp-welcome-start');
          return isVisible(el) ? el : null;
        },
        isLast: true
      }
    ],

    'task1-practice.html': [
      {
        icon: '📝',
        title: 'Luyện tập hay Thi thử',
        body: 'Luyện tập: làm từng câu về ngữ pháp Task 1 (Noun Phrase, mô tả dữ liệu, so sánh, xu hướng...), có gợi ý và phản hồi ngay. Thi thử: làm một bộ đề ngẫu nhiên không gợi ý, giống thi thật.',
        resolve() {
          const el = document.querySelector('.wp-mode-toggle');
          return isVisible(el) ? el : null;
        }
      },
      {
        icon: '🎯',
        title: 'Kỹ năng & cấp độ',
        body: 'Chọn kỹ năng cụ thể muốn luyện (Noun Phrase, Data Description, Comparison...) hoặc "Tất cả" để luyện ngẫu nhiên.',
        resolve() {
          const el = document.getElementById('practice-filters');
          return isVisible(el) ? el : null;
        }
      },
      {
        icon: '🚀',
        title: 'Bắt đầu luyện tập',
        body: 'Sau khi chọn xong ở thanh bên, bấm đây để bắt đầu. Duy trì học mỗi ngày để giữ streak và tích lũy XP.',
        resolve() {
          const el = document.querySelector('.wp-welcome-start');
          return isVisible(el) ? el : null;
        },
        isLast: true
      }
    ],

    'task2-practice.html': [
      {
        icon: '📝',
        title: 'Chọn tuần luyện tập',
        body: 'Mỗi tuần gồm các câu hỏi Task 2 theo một chủ đề + dạng bài cụ thể (Advantages/Disadvantages, Cause & Effect, Discuss Both...). Bấm vào một tuần để bắt đầu — tiến độ được tự động lưu lại.',
        resolve() {
          const el = document.querySelector('.t2-week-grid');
          return isVisible(el) ? el : null;
        }
      },
      {
        icon: '📊',
        title: 'Lịch sử làm bài',
        body: 'Xem lại các tuần đã hoàn thành và tiến độ của từng tuần ở đây.',
        resolve() {
          const el = document.querySelector('.t2-back-btn');
          return isVisible(el) ? el : null;
        },
        isLast: true
      }
    ],

    'task2-template.html': [
      {
        icon: '📚',
        title: 'Chọn dạng bài',
        body: '7 dạng bài Task 2 phổ biến (Discuss Both, Advantage/Disadvantage, Problem/Solution...). Mỗi dạng có sẵn mẫu câu (template) chuẩn giúp bạn viết nhanh và đúng cấu trúc hơn.',
        resolve() {
          const el = document.getElementById('tpl-type-tabs');
          return isVisible(el) ? el : null;
        }
      },
      {
        icon: '🎚️',
        title: 'Trình độ & chế độ học',
        body: 'Chọn Band 6+ hoặc Band 7+ rồi điền từ vào chỗ trống để ghi nhớ mẫu câu. Bấm "Thi thử" để tự kiểm tra không có gợi ý.',
        resolve() {
          const el = document.getElementById('tpl-level-toggle');
          return isVisible(el) ? el : null;
        }
      },
      {
        icon: '📄',
        title: 'Xem đầy đủ mẫu câu',
        body: 'Bấm để đọc toàn bộ mẫu câu của dạng bài này (cả Band 6+ và Band 7+) — tiện tham khảo khi viết bài thật.',
        resolve() {
          const c1 = document.querySelector('#tpl-toolbar-cloze button[onclick="openTplFullView()"]');
          if (isVisible(c1)) return c1;
          const c2 = document.querySelector('#tpl-toolbar-other button[onclick="openTplFullView()"]');
          return isVisible(c2) ? c2 : null;
        },
        isLast: true
      }
    ],

    'essential-grammar.html': [
      {
        icon: '📘',
        title: 'Danh sách bài học',
        body: 'Các bài ngữ pháp thiết yếu cho IELTS, chia theo chủ đề. Gõ vào ô tìm kiếm để tìm nhanh, hoặc bấm vào một bài để bắt đầu học. Trên điện thoại, bấm nút danh sách ở góc dưới màn hình.',
        resolve() {
          const sidebar = document.getElementById('eg-sidebar');
          if (isVisible(sidebar)) return sidebar;
          const fab = document.getElementById('eg-mob-fab');
          return isVisible(fab) ? fab : null;
        },
        isLast: true
      }
    ]
  };

  function tourKeyFor(page) { return 'ews_onboarding_tour_v1_' + page; }

  // ── Styles (shared across every page's tour) ───────────────────────────
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
    #ews-tour-hole{position:fixed;z-index:9598;pointer-events:none;border-radius:12px;box-shadow:0 0 0 4px #fbbf24,0 0 0 9999px rgba(15,23,42,.62),0 0 28px 6px rgba(251,191,36,.45);transition:top .2s ease,left .2s ease,width .2s ease,height .2s ease;}
  `;
  document.head.appendChild(css);

  let currentSteps = null;
  let currentPage = null;
  let currentTarget = null;
  let tipEl = null;
  let holeEl = null;

  function clearSpotlight() {
    currentTarget = null;
    if (holeEl) { holeEl.remove(); holeEl = null; }
  }

  // The dark "everything but the target" dimming used to be a giant
  // box-shadow on the target element itself — but that promotes the
  // target into its own stacking context, which drags its DOM siblings
  // (a card's title/banner sitting next to the button being spotlighted)
  // behind the shadow too, since they're no longer above it in the new
  // context. A separate overlay element, positioned to match the target's
  // rect but never touching the target's own styles, doesn't have that
  // problem — found by screenshotting writing.html's "Bắt đầu làm bài"
  // step in a real browser and seeing the whole card dim, not just the
  // area outside the button.
  function positionHole(target) {
    if (!holeEl) return;
    const r = target.getBoundingClientRect();
    const pad = 6;
    holeEl.style.top = (r.top - pad) + 'px';
    holeEl.style.left = (r.left - pad) + 'px';
    holeEl.style.width = (r.width + pad * 2) + 'px';
    holeEl.style.height = (r.height + pad * 2) + 'px';
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
    // A tall, narrow target (e.g. a sidebar) needs a side placement —
    // "below"/"above" would either run off-screen or land the tip on top
    // of the very thing being spotlighted, since the target's own height
    // can exceed the tip's. Wide targets (nav/toolbars) keep below/above.
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
    if (currentPage) { try { localStorage.setItem(tourKeyFor(currentPage), '1'); } catch (e) {} }
    currentSteps = null;
    currentPage = null;
  }

  function onReposition() {
    if (currentTarget) { positionTip(currentTarget); positionHole(currentTarget); }
  }

  function renderStep(idx) {
    if (!currentSteps || idx >= currentSteps.length) { endTour(); return; }
    const step = currentSteps[idx];
    const target = step.resolve();
    if (!target) { renderStep(idx + 1); return; }

    clearSpotlight();
    currentTarget = target;
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });

    if (!holeEl) {
      holeEl = document.createElement('div');
      holeEl.id = 'ews-tour-hole';
      document.body.appendChild(holeEl);
    }
    positionHole(target);

    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.id = 'ews-tour-tip';
      document.body.appendChild(tipEl);
    }
    const nextLabel = step.isLast ? 'Đã hiểu ✅' : 'Tiếp theo →';
    tipEl.innerHTML =
      '<div class="ews-tour-step">Hướng dẫn · ' + (idx + 1) + ' / ' + currentSteps.length + '</div>' +
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
    requestAnimationFrame(function () { positionTip(target); positionHole(target); });
  }

  // Starts the tour for the CURRENT page (or a given page override, mostly
  // useful for testing/replay from elsewhere). No-op if that page has no
  // tour defined.
  function start(pageOverride) {
    const page = pageOverride || (location.pathname.split('/').pop() || 'dashboard.html');
    const steps = PAGE_TOURS[page];
    if (!steps) return;
    endTour(); // reset any stale state before a fresh run
    currentSteps = steps;
    currentPage = page;
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    renderStep(0);
  }

  function reset(pageOverride) {
    const page = pageOverride || (location.pathname.split('/').pop() || 'dashboard.html');
    try { localStorage.removeItem(tourKeyFor(page)); } catch (e) {}
  }

  window.EWSTour = { start, reset };

  // ── Auto-start (once per browser per page, logged-in users only) + the
  // always-available "replay" button nav.js injects hidden by default —
  // revealed here only on pages that actually have a tour, independent of
  // whether this browser already auto-saw it once. ───────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    const page = location.pathname.split('/').pop() || 'dashboard.html';
    const steps = PAGE_TOURS[page];
    if (!steps) return;

    const btn = document.getElementById('globalTourBtn');
    if (btn) {
      btn.style.display = '';
      btn.addEventListener('click', function () { start(page); });
    }

    let seen = false;
    try { seen = localStorage.getItem(tourKeyFor(page)) === '1'; } catch (e) {}
    const loggedIn = window.AuthService && window.AuthService.isLoggedIn && window.AuthService.isLoggedIn();
    if (seen || !loggedIn) return;
    // The tour goes first in the shared login-popup queue (highest priority)
    // so a brand-new student walks the tour before any goal-setup / badge /
    // review modal appears. #ews-tour-tip is removed by endTour(), which is
    // what releases the queue slot.
    setTimeout(function () {
      if (window.PopupQueue) {
        window.PopupQueue.enqueue({
          id: 'onboarding-tour', priority: 60, until: '#ews-tour-tip',
          show: function () { start(page); }
        });
      } else {
        start(page);
      }
    }, 900);
  });
})();
