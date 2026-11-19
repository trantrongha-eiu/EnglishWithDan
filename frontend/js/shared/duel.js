/**
 * js/shared/duel.js — ⚔️ Thách đấu (backend services/duelService.js).
 *
 *   • Duel.mount(el, opts)  — the duel board on shop.html: incoming /
 *                             outgoing challenges with Nhận lời / Từ chối /
 *                             Hủy, running duels with live 🔥 bars and a
 *                             countdown, and the last few results.
 *   • Duel.unmount()        — stop the board (the React shop leaves its route
 *                             without a page load).
 *   • Duel.challenge(target, opts) — the challenge dialog: pick a rival
 *                             (search, unless `target` {id, name} is given —
 *                             the ⚔️ button on a BXH row) and a stake.
 *
 * opts.wallet — the viewer's ví lửa, to cap the stake stepper;
 * opts.onChange() — called after anything moved 🔥 (refresh the wallet).
 *
 * Needs: AuthService, showToast (shared/toast.js); confirmDialog if loaded.
 * Styles: css/duel.css.
 */
(function () {
  'use strict';
  if (window.Duel) return;

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  var RULES = { min: 5, max: 100, maxOpen: 3, pendingHours: 24 };

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function api(method, url, body) {
    return fetch(API + url, {
      method: method,
      headers: Object.assign({ 'Content-Type': 'application/json' }, window.AuthService ? window.AuthService.authHeader() : {}),
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (r) { return r.json().catch(function () { return { success: false }; }); })
      // Offline: resolve with an error so the button / dialog recovers
      // instead of staying disabled forever.
      .catch(function () { return { success: false, message: 'Không kết nối được máy chủ, thử lại nhé.' }; });
  }
  function toast(msg, type) { if (window.showToast) window.showToast(msg, type || 'info'); }
  function confirmThen(title, msg, label, onOk) {
    if (window.confirmDialog) window.confirmDialog(title, msg, onOk, { confirmLabel: label, confirmClass: 'btn-primary' });
    else if (window.confirm(title + '\n' + msg)) onOk();
  }
  function left(iso) {
    var ms = new Date(iso) - Date.now();
    if (!(ms > 0)) return 'sắp hết giờ';
    var h = Math.floor(ms / 3600000);
    if (h >= 1) return 'còn ' + h + ' giờ ' + Math.floor((ms % 3600000) / 60000) + ' phút';
    return 'còn ' + Math.max(1, Math.round(ms / 60000)) + ' phút';
  }

  /* ── Linh thú arena ─────────────────────────────────────────────────
     Each side's walking pet (myPet / rival.pet from GET /shop/duels):
     on a live card they face off and the leader holds its bom vĩ thú,
     charged; when a duel ends, finale() plays the winner's pet firing at
     the loser's (Pets.bombHtml — bigger with every tail). No pet → a 🔥
     spirit fires a plain cầu lửa. Needs js/shared/pets.js; without it the
     board just shows no pets. */
  function P() { return window.Pets && window.Pets.bombHtml ? window.Pets : null; }
  function petArt(id) {
    var p = P();
    return p && id && p.svg(id) ? p.svg(id, 'pt-static') : '<span class="duel-nopet" aria-hidden="true">🔥</span>';
  }
  function petName(id) { var p = P(); return (p && id && p.names[id]) || ''; }
  // A pet box; the right-hand one is mirrored so the two face each other.
  // hold = it holds its charged sphere (sized for a `size`px box).
  function fighter(id, size, right, hold) {
    var p = P(), bomb = '';
    // Held on the card at ~half size, so the pet stays visible behind it.
    if (hold && p) bomb = p.bombHtml(id || null, p.bombSpec(id || null).px * size / 58 * 0.5, 'is-hold');
    return '<span class="duel-pet' + (right ? ' is-right' : '') + '" style="--ps:' + size + 'px">'
      + '<span class="duel-pet-flip">' + petArt(id) + bomb + '</span></span>';
  }
  function arena(d, myPet) {
    if (!P()) return '';
    var diff = d.myScore - d.rivalScore;
    return '<div class="duel-arena" aria-hidden="true">'
      + fighter(myPet, 68, false, diff > 0)
      + '<span class="duel-arena-vs">VS</span>'
      + fighter(d.rival.pet, 68, true, diff < 0)
      + '</div>';
  }

  // Results already played, per browser (ids, newest last).
  var SEEN_KEY = 'ews-duel-fx-seen';
  function seenList() { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') || []; } catch (e) { return []; } }
  function markSeen(ids) {
    try {
      var s = seenList();
      ids.forEach(function (id) { if (s.indexOf(id) < 0) s.push(id); });
      localStorage.setItem(SEEN_KEY, JSON.stringify(s.slice(-60)));
    } catch (e) {}
  }
  // The newest result from the last 2 days this browser hasn't played yet.
  function autoFinale(recent, myPet) {
    var seen = seenList(), fresh = [];
    recent.forEach(function (d) {
      if (d.status !== 'done' || seen.indexOf(d.id) >= 0) return;
      if (d.endsAt && Date.now() - new Date(d.endsAt).getTime() > 2 * 86400000) return;
      fresh.push(d);
    });
    if (!fresh.length) return;
    markSeen(fresh.map(function (d) { return d.id; }));
    finale(fresh[0], myPet);
  }

  var FX_CHARGE = 1300, FX_FLY = 650;
  function finale(d, myPet) {
    var p = P();
    if (!p || document.querySelector('.duel-fx')) return;
    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var size = Math.min(150, Math.round((window.innerWidth || 400) * 0.3));
    var tie = d.result === 'tie', iWon = d.result === 'win';
    var me = { pet: myPet, name: 'Bạn', score: d.myScore };
    var rv = { pet: d.rival.pet, name: d.rival.name, score: d.rivalScore };
    var title = tie ? '🤝 Hòa rồi!' : iWon ? '🏆 Bạn thắng!' : '💥 ' + esc(rv.name) + ' thắng!';
    var sub = d.myScore + ' – ' + d.rivalScore + ' 🔥 · '
      + (tie ? 'mỗi bên nhận lại ' + d.stake + ' 🔥' : iWon ? '+' + d.pot + ' 🔥 vào ví lửa' : 'mất ' + d.stake + ' 🔥 — phục thù thôi!');
    var shooter = function (side) {
      var t = p.tails(side.pet);
      return t ? esc(petName(side.pet)) + ' tung bom vĩ thú ' + t + ' đuôi!' : (side.pet ? esc(petName(side.pet)) : 'Lửa') + ' phóng cầu lửa!';
    };
    var wrap = document.createElement('div');
    wrap.className = 'duel-fx' + (reduced ? ' is-reduced' : '');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Kết quả thách đấu với ' + d.rival.name);
    wrap.innerHTML = '<div class="duel-fx-box">'
      + '<p class="duel-fx-kicker">⚔️ Kết quả thách đấu · cược ' + d.stake + ' 🔥</p>'
      + '<div class="duel-fx-stage">'
      + '<div class="duel-fx-side' + (tie ? '' : iWon ? ' is-winner' : ' is-loser') + '">' + fighter(me.pet, size, false, false)
      + '<b>' + me.name + '</b><span>' + me.score + ' 🔥</span></div>'
      + '<div class="duel-fx-side' + (tie ? '' : iWon ? ' is-loser' : ' is-winner') + '">' + fighter(rv.pet, size, true, false)
      + '<b>' + esc(rv.name) + '</b><span>' + rv.score + ' 🔥</span></div>'
      + '</div>'
      + '<p class="duel-fx-call">' + (tie ? 'Hai bom va nhau giữa trời!' : shooter(iWon ? me : rv)) + '</p>'
      + '<div class="duel-fx-result"><h3>' + title + '</h3><p>' + sub + '</p>'
      + '<button type="button" class="btn btn-primary" data-fx-close>' + (iWon || tie ? 'Tuyệt!' : 'Phục thù ⚔️') + '</button></div>'
      + '</div>';
    document.body.appendChild(wrap);
    var trigger = document.activeElement;
    function close() {
      wrap.remove();
      if (trigger && trigger.focus) try { trigger.focus(); } catch (e) {}
    }
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || (e.target.closest && e.target.closest('[data-fx-close]'))) close();
    });
    wrap.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    requestAnimationFrame(function () { wrap.classList.add('is-in'); });
    var btn = wrap.querySelector('[data-fx-close]');
    if (reduced) { wrap.classList.add('is-done'); btn.focus(); return; }

    // Who fires: the winner, or both on a tie (the spheres meet mid-air).
    var sides = wrap.querySelectorAll('.duel-fx-side');
    var shots = tie ? [0, 1] : [iWon ? 0 : 1];
    var bombs = shots.map(function (i) {
      var side = i ? rv : me, flip = sides[i].querySelector('.duel-pet-flip');
      flip.insertAdjacentHTML('beforeend', p.bombHtml(side.pet || null, p.bombSpec(side.pet || null).px * size / 58));
      sides[i].classList.add('is-charging');
      return { el: flip.lastChild, from: sides[i], to: sides[1 - i] };
    });
    setTimeout(function () {
      bombs.forEach(function (b) {
        b.from.classList.remove('is-charging');
        var a = b.el.getBoundingClientRect(), t = b.to.querySelector('.duel-pet').getBoundingClientRect();
        var dist = Math.abs((t.left + t.width / 2) - (a.left + a.width / 2));
        b.el.style.setProperty('--dist', Math.round(tie ? dist / 2 : dist) + 'px');
        b.el.classList.add('is-fired');
      });
    }, FX_CHARGE);
    setTimeout(function () {
      bombs.forEach(function (b) { b.el.classList.add('is-boom'); });
      wrap.classList.add('is-boom');
      if (!tie) bombs[0].to.classList.add('is-hit');
    }, FX_CHARGE + FX_FLY);
    setTimeout(function () { wrap.classList.add('is-done'); btn.focus(); }, FX_CHARGE + FX_FLY + 700);
  }

  /* ── Board ─────────────────────────────────────────────────────── */
  var board = null;   // { el, opts, data }
  var boardTimer = null;

  function openCard(d) {
    var rival = '<b>' + esc(d.rival.name) + '</b>';
    if (d.status === 'pending' && d.role === 'opponent') {
      return '<article class="duel-card duel-card--incoming">'
        + '<div class="duel-card-head"><span class="duel-swords" aria-hidden="true">⚔️</span><div>'
        + rival + ' thách đấu bạn! <span class="duel-stake">Cược 🔥 ' + d.stake + '</span>'
        + '<small>Thắng nhận cả <b>🔥 ' + d.pot + '</b> · ' + left(d.expiresAt) + ' để trả lời</small></div></div>'
        + '<div class="duel-actions">'
        + '<button type="button" class="btn btn-primary btn-sm" data-duel-accept="' + d.id + '" data-stake="' + d.stake + '" data-name="' + esc(d.rival.name) + '">Nhận lời · 🔥 ' + d.stake + '</button>'
        + '<button type="button" class="btn btn-ghost btn-sm" data-duel-decline="' + d.id + '">Từ chối</button>'
        + '</div></article>';
    }
    if (d.status === 'pending') {
      return '<article class="duel-card duel-card--waiting">'
        + '<div class="duel-card-head"><span class="duel-swords" aria-hidden="true">⏳</span><div>'
        + 'Đang chờ ' + rival + ' nhận lời <span class="duel-stake">Cược 🔥 ' + d.stake + '</span>'
        + '<small>Lời thách ' + left(d.expiresAt).replace('còn', 'hết hạn sau') + ' — chưa nhận thì 🔥 tự về ví.</small></div></div>'
        + '<div class="duel-actions"><button type="button" class="btn btn-ghost btn-sm" data-duel-cancel="' + d.id + '">Hủy & lấy lại 🔥</button></div>'
        + '</article>';
    }
    var total = Math.max(1, d.myScore + d.rivalScore);
    var diff = d.myScore - d.rivalScore;
    var mood = diff > 0 ? '🔥 Bạn đang dẫn trước ' + diff + ' 🔥 — giữ vững nhé!'
      : diff < 0 ? '😤 Đang bị dẫn ' + (-diff) + ' 🔥 — làm thêm một bài là gỡ lại!'
        : (d.myScore ? '🤝 Đang hòa — ai học tiếp sẽ vượt lên!' : 'Trận đã bắt đầu — làm bài để ghi 🔥 đầu tiên!');
    return '<article class="duel-card duel-card--live' + (diff > 0 ? ' is-lead' : diff < 0 ? ' is-behind' : '') + '">'
      + '<div class="duel-card-head"><span class="duel-swords" aria-hidden="true">⚔️</span><div>'
      + 'Đang đấu với ' + rival + ' <span class="duel-stake">Thắng nhận 🔥 ' + d.pot + '</span>'
      + '<small>Kết thúc ' + left(d.endsAt).replace('còn', 'sau') + '</small></div></div>'
      + arena(d, board && board.data && board.data.myPet)
      + '<div class="duel-vs" role="img" aria-label="Bạn ' + d.myScore + ' 🔥, ' + esc(d.rival.name) + ' ' + d.rivalScore + ' 🔥">'
      + '<span class="duel-vs-me">Bạn <b>' + d.myScore + '</b></span>'
      + '<span class="duel-bar"><span class="duel-bar-me" style="width:' + Math.round(d.myScore / total * 100) + '%"></span></span>'
      + '<span class="duel-vs-rival"><b>' + d.rivalScore + '</b> ' + esc(d.rival.name) + '</span>'
      + '</div>'
      + '<p class="duel-mood">' + mood + '</p>'
      + '</article>';
  }

  var RECENT = {
    win: ['🏆', 'Thắng'], lose: ['💀', 'Thua'], tie: ['🤝', 'Hòa'],
    declined: ['🙅', 'Bị từ chối'], declinedByMe: ['🙅', 'Bạn đã từ chối'], cancelled: ['↩️', 'Đã hủy'], expired: ['⌛', 'Hết hạn'],
  };
  function recentRow(d) {
    var key = d.status === 'done' ? d.result : d.status;
    if (d.status === 'declined' && d.role === 'opponent') key = 'declinedByMe';
    var r = RECENT[key] || ['⚔️', ''];
    var detail = d.status === 'done'
      ? d.myScore + ' – ' + d.rivalScore + ' 🔥' + (d.result === 'win' ? ' · +' + d.pot + ' 🔥' : d.result === 'lose' ? ' · −' + d.stake + ' 🔥' : ' · hoàn cược')
      : 'cược ' + d.stake + ' 🔥';
    return '<li class="duel-recent duel-recent--' + esc(key) + '"><span aria-hidden="true">' + r[0] + '</span>'
      + '<b>' + r[1] + '</b> với ' + esc(d.rival.name) + '<small>' + detail + '</small>'
      + (d.status === 'done' && P() ? '<button type="button" class="duel-replay" data-duel-replay="' + esc(d.id) + '">▶ Xem lại</button>' : '')
      + '</li>';
  }

  function render() {
    var data = board.data;
    var open = data.open || [];
    var recent = data.recent || [];
    board.el.removeAttribute('aria-busy');
    board.el.innerHTML = '<div class="duel-intro">'
      + '<p>Cược 🔥 với một bạn: từ lúc nhận lời đến <b>hết ngày mai</b>, ai kiếm được nhiều 🔥 từ bài học hơn sẽ ẵm trọn tiền cược của cả hai. Hòa thì mỗi người nhận lại phần mình.</p>'
      + '<button type="button" class="btn btn-primary" data-duel-new' + (open.length >= RULES.maxOpen ? ' disabled title="Tối đa ' + RULES.maxOpen + ' trận cùng lúc"' : '') + '>⚔️ Thách đấu một bạn</button>'
      + '</div>'
      + (open.length ? '<div class="duel-grid">' + open.map(openCard).join('') + '</div>'
        : '<div class="duel-empty">Chưa có trận nào. Thách một bạn trên BXH đi — người thua mất 🔥 đó! 😏</div>')
      + (recent.length ? '<details class="duel-history"><summary>Kết quả gần đây (' + recent.length + ')</summary><ul>'
        + recent.map(recentRow).join('') + '</ul></details>' : '');
  }

  function load() {
    if (!board) return Promise.resolve();
    return api('GET', '/shop/duels').then(function (d) {
      if (!d || !d.success) throw new Error('load');
      if (d.rules) RULES = d.rules;
      if (!board) return; // left the shop while this was loading
      board.data = d;
      render();
      autoFinale(d.recent || [], d.myPet);
    }).catch(function () {
      if (!board) return;
      board.el.removeAttribute('aria-busy');
      board.el.innerHTML = '<div class="duel-empty">Không tải được các trận thách đấu.</div>';
    });
  }

  function changed() {
    load();
    if (board && board.opts.onChange) try { board.opts.onChange(); } catch (e) {}
  }

  function act(d, okMsg) {
    if (!d || !d.success) { toast((d && d.message) || 'Không thực hiện được, thử lại nhé.', 'error'); return load(); }
    if (okMsg) toast(okMsg, 'success');
    changed();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-duel-new],[data-duel-accept],[data-duel-decline],[data-duel-cancel],[data-duel-replay]');
    if (!b || b.disabled || !board || !board.el.contains(b)) return;
    if (b.hasAttribute('data-duel-new')) return challenge(null, board.opts);
    var id;
    if ((id = b.getAttribute('data-duel-replay'))) {
      var hit = (board.data && board.data.recent || []).filter(function (x) { return x.id === id; })[0];
      if (hit) finale(hit, board.data.myPet);
      return;
    }
    if ((id = b.getAttribute('data-duel-accept'))) {
      var stake = b.getAttribute('data-stake');
      confirmThen('Nhận lời thách đấu?', 'Bạn đặt ' + stake + ' 🔥 vào trận với ' + b.getAttribute('data-name') + '. Đến hết ngày mai, ai kiếm nhiều 🔥 từ bài học hơn sẽ thắng ' + (stake * 2) + ' 🔥.', 'Chiến! ⚔️', function () {
        b.disabled = true;
        api('POST', '/shop/duels/' + id + '/accept').then(function (d) { act(d, '⚔️ Trận đấu bắt đầu! Học ngay để ghi 🔥 nào!'); });
      });
    } else if ((id = b.getAttribute('data-duel-decline'))) {
      b.disabled = true;
      api('POST', '/shop/duels/' + id + '/decline').then(function (d) { act(d, 'Đã từ chối — 🔥 của bạn ấy được hoàn lại.'); });
    } else if ((id = b.getAttribute('data-duel-cancel'))) {
      b.disabled = true;
      api('POST', '/shop/duels/' + id + '/cancel').then(function (d) { act(d, '↩️ Đã hủy lời thách — 🔥 về lại ví.'); });
    }
  });

  function mount(el, opts) {
    if (!el) return;
    unmount();
    board = { el: el, opts: opts || {}, data: null };
    load();
    // Live bars tick over while the shop stays open.
    boardTimer = setInterval(function () { if (!document.hidden) load(); }, 60 * 1000);
  }

  function unmount() {
    clearInterval(boardTimer);
    boardTimer = null;
    board = null;
    var fx = document.querySelectorAll('.duel-fx');
    for (var i = 0; i < fx.length; i++) fx[i].remove();
  }

  /* ── Challenge dialog ──────────────────────────────────────────── */
  function userRow(u, picked) {
    var av = u.avatar
      ? '<img class="duel-pick-av" src="' + esc(u.avatar) + '" alt="">'
      : '<span class="duel-pick-av duel-pick-av--init">' + esc((u.name || '?')[0].toUpperCase()) + '</span>';
    return '<button type="button" class="duel-pick-user' + (picked ? ' is-picked' : '') + '" data-pick="' + esc(String(u._id)) + '" role="option" aria-selected="' + (picked ? 'true' : 'false') + '">'
      + av + '<span class="duel-pick-name">' + esc(u.name) + (u.username ? '<small>@' + esc(u.username) + '</small>' : '') + '</span></button>';
  }

  function challenge(target, opts) {
    opts = opts || {};
    var wallet = typeof opts.wallet === 'number' ? opts.wallet : null;
    var max = wallet == null ? RULES.max : Math.min(RULES.max, wallet);
    if (wallet != null && wallet < RULES.min) {
      toast('Cần ít nhất ' + RULES.min + ' 🔥 trong ví lửa để thách đấu — học thêm chút nhé!', 'error');
      return;
    }
    var picked = target ? { _id: target.id, name: target.name } : null;
    var users = [];
    var seq = 0;
    var timer = null;
    var wrap = document.createElement('div');
    wrap.className = 'modal-overlay duel-modal';
    wrap.innerHTML = '<div class="modal-box modal-sm" role="dialog" aria-modal="true" aria-labelledby="duel-title">'
      + '<div class="modal-body duel-dlg">'
      + '<h3 id="duel-title">⚔️ ' + (target ? 'Thách đấu ' + esc(target.name) : 'Thách đấu một bạn') + '</h3>'
      + (target ? '' : '<input type="search" class="duel-search" placeholder="Tìm theo tên hoặc username…" aria-label="Tìm đối thủ" autocomplete="off">'
        + '<div class="duel-pick-list" role="listbox" aria-label="Đối thủ"><div class="duel-empty">Đang tải…</div></div>')
      + '<div class="duel-stake-row"><span>Tiền cược</span><div class="duel-step" role="group" aria-label="Tiền cược">'
      + '<button type="button" data-step="-5" aria-label="Bớt 5">−</button>'
      + '<input type="number" inputmode="numeric" min="' + RULES.min + '" max="' + max + '" value="' + Math.min(10, max) + '" aria-label="Tiền cược">'
      + '<button type="button" data-step="5" aria-label="Thêm 5">+</button></div>'
      + '<span class="duel-presets">' + [10, 20, 50].filter(function (n) { return n <= max; }).map(function (n) {
        return '<button type="button" class="btn btn-ghost btn-sm" data-set="' + n + '">' + n + '</button>';
      }).join('') + '</span></div>'
      + '<p class="duel-pot"></p>'
      + '<small class="duel-note">Bạn ấy có ' + RULES.pendingHours + ' giờ để nhận lời (cũng cược ngang bạn). Đến hết ngày mai, ai kiếm nhiều 🔥 từ bài học hơn sẽ thắng — 🔥 nhân đôi của Búa Hi Vọng không tính.</small>'
      + '</div>'
      + '<div class="modal-footer" style="justify-content:center">'
      + '<button type="button" class="btn btn-ghost" data-cancel>Hủy</button>'
      + '<button type="button" class="btn btn-primary" data-ok>⚔️ Gửi lời thách</button>'
      + '</div></div>';
    document.body.appendChild(wrap);
    var trigger = document.activeElement;
    var input = wrap.querySelector('.duel-step input');
    var search = wrap.querySelector('.duel-search');
    var list = wrap.querySelector('.duel-pick-list');
    var ok = wrap.querySelector('[data-ok]');

    function stake() {
      var n = parseInt(input.value, 10);
      return Math.min(max, Math.max(RULES.min, isNaN(n) ? RULES.min : n));
    }
    function sync() {
      var s = stake();
      wrap.querySelector('[data-step="-5"]').disabled = s <= RULES.min;
      wrap.querySelector('[data-step="5"]').disabled = s >= max;
      wrap.querySelector('.duel-pot').innerHTML = 'Thắng nhận <b>🔥 ' + (s * 2) + '</b> · thua mất 🔥 ' + s
        + (wallet != null ? '<span>Ví còn lại khi gửi: 🔥 ' + (wallet - s) + '</span>' : '');
      ok.disabled = !picked;
      ok.textContent = picked ? '⚔️ Thách ' + picked.name + ' · 🔥 ' + s : '⚔️ Chọn đối thủ';
    }
    function paint() {
      list.innerHTML = users.length
        ? users.map(function (u) { return userRow(u, picked && String(picked._id) === String(u._id)); }).join('')
        : '<div class="duel-empty">Không tìm thấy ai — thử tên khác nhé.</div>';
    }
    function find(q) {
      var my = ++seq;
      api('GET', '/shop/gift-recipients?q=' + encodeURIComponent(q || '')).then(function (d) {
        if (my !== seq) return;
        users = (d && d.success && d.users) || [];
        paint();
      });
    }
    function close() {
      clearTimeout(timer);
      wrap.remove();
      if (trigger && trigger.focus) trigger.focus();
    }
    function send() {
      if (!picked) return;
      var s = stake();
      var who = picked;
      ok.disabled = true;
      api('POST', '/shop/duels', { toId: who._id, stake: s }).then(function (d) {
        if (!d || !d.success) { ok.disabled = false; toast((d && d.message) || 'Không gửi được lời thách.', 'error'); return; }
        close();
        toast('⚔️ Đã gửi lời thách ' + s + ' 🔥 tới ' + who.name + '! Chờ bạn ấy nhận lời nhé.', 'success');
        if (board) changed();
        else if (opts.onChange) try { opts.onChange(); } catch (e) {}
      });
    }

    wrap.addEventListener('click', function (e) {
      var t = e.target;
      if (t === wrap || t.hasAttribute('data-cancel')) return close();
      if (t.hasAttribute('data-step')) { input.value = stake() + Number(t.getAttribute('data-step')); return sync(); }
      if (t.hasAttribute('data-set')) { input.value = t.getAttribute('data-set'); return sync(); }
      if (t.hasAttribute('data-ok')) return send();
      var row = t.closest && t.closest('[data-pick]');
      if (row) {
        var id = row.getAttribute('data-pick');
        picked = users.filter(function (u) { return String(u._id) === id; })[0] || null;
        paint();
        sync();
      }
    });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'Enter' && e.target === input) { e.preventDefault(); send(); }
    });
    input.addEventListener('input', sync);
    input.addEventListener('blur', function () { input.value = stake(); sync(); });
    if (search) {
      search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { find(search.value.trim()); }, 250);
      });
      find('');
      search.focus();
    } else {
      input.focus();
      input.select();
    }
    sync();
  }

  window.Duel = { mount: mount, unmount: unmount, challenge: challenge, reload: load, finale: finale };
})();
