/**
 * shop.js — Cửa hàng lửa (shop.html). Reads GET /api/shop, renders the
 * wallet, the active effects, the item cards and the linh thú cards, and
 * posts purchases. Using / walking / selling happens in the Kho đồ tab
 * (js/inventory.js on profile.html). The catalog (names, prices, descriptions)
 * comes from the server (backend/constants/shop.js); only the pet art lives
 * here, in js/shared/pets.js.
 *
 * Needs: AuthService, escHtml (shared/utils.js), showToast (shared/toast.js),
 * confirmDialog (shared/confirm-dialog.js), Pets (shared/pets.js).
 */
(function () {
    'use strict';

    var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
    var state = null;
    var busy = false;

    function authH() {
        return Object.assign({ 'Content-Type': 'application/json' },
            window.AuthService ? window.AuthService.authHeader() : {});
    }
    function api(method, url, body) {
        return fetch(API + url, { method: method, headers: authH(), body: body ? JSON.stringify(body) : undefined })
            .then(function (r) { return r.json().catch(function () { return { success: false }; }); });
    }
    function toast(msg, type) { if (window.showToast) window.showToast(msg, type || 'info'); }
    function confirmThen(title, msg, label, onOk) {
        if (window.confirmDialog) window.confirmDialog(title, msg, onOk, { confirmLabel: label, confirmClass: 'btn-primary' });
        else if (window.confirm(msg)) onOk();
    }
    function fmtUntil(iso) {
        var d = new Date(iso);
        var ms = d - Date.now();
        if (ms <= 0) return 'sắp hết';
        var h = Math.floor(ms / 3600000);
        if (h >= 24) return 'còn ' + Math.ceil(h / 24) + ' ngày';
        if (h >= 1) return 'còn ' + h + ' giờ';
        return 'còn ' + Math.max(1, Math.round(ms / 60000)) + ' phút';
    }

    /* ── Render ─────────────────────────────────────────────────────── */
    function render() {
        document.getElementById('shop-wallet-value').textContent = state.wallet;
        document.getElementById('shop-streak').textContent = state.streak;
        renderEffects();
        renderItems();
        renderPets();
    }

    function renderEffects() {
        var el = document.getElementById('shop-effects');
        var e = state.effects || {};
        var towel = itemByKey('towel');
        var towels = towel ? towel.owned : 0;
        var rows = [];
        if (e.hope) {
            var done = Math.min(e.hope.base, e.hope.quota);
            var pct = Math.round(done / e.hope.quota * 100);
            rows.push('<div class="shop-effect shop-effect--hope">'
                + '<span class="shop-effect-emoji">🔨</span>'
                + '<div class="shop-effect-body"><b>Búa Hi Vọng đang chạy — 🔥 hôm nay ×2!</b>'
                + '<div class="shop-progress"><span style="width:' + pct + '%"></span></div>'
                + '<small>' + (done >= e.hope.quota
                    ? 'Đã đạt chỉ tiêu ' + e.hope.quota + ' 🔥 — an toàn rồi, học thêm để nhân đôi tiếp nhé!'
                    : 'Đã kiếm ' + done + '/' + e.hope.quota + ' 🔥 sau khi đập búa. Chưa đủ trước nửa đêm sẽ bị trừ ' + e.hope.penalty + ' 🔥!')
                + '</small></div></div>');
        }
        if (e.hopeLast && e.hopeLast.day && !e.hope) {
            var key = 'ews-hope-seen-' + e.hopeLast.day;
            var seen = false;
            try { seen = localStorage.getItem(key) === '1'; localStorage.setItem(key, '1'); } catch (x) {}
            if (!seen) {
                rows.push(e.hopeLast.success
                    ? '<div class="shop-effect shop-effect--win"><span class="shop-effect-emoji">🎉</span><div class="shop-effect-body"><b>Búa Hi Vọng thắng cược!</b><small>Bạn kiếm được ' + e.hopeLast.base + ' 🔥 gốc và đã nhận gấp đôi.</small></div></div>'
                    : '<div class="shop-effect shop-effect--lose"><span class="shop-effect-emoji">💥</span><div class="shop-effect-body"><b>Búa Hi Vọng thua cược…</b><small>Chỉ kiếm được ' + e.hopeLast.base + ' 🔥 — chuỗi bị trừ ' + e.hopeLast.penalty + ' 🔥. Lần sau cố lên nhé!</small></div></div>');
            }
        }
        if (e.crownUntil) rows.push('<div class="shop-effect"><span class="shop-effect-emoji">👑</span><div class="shop-effect-body"><b>Vương Miện Lửa</b><small>Tên bạn đang phát sáng trên BXH — ' + fmtUntil(e.crownUntil) + '.</small></div></div>');
        if (e.invisibleUntil) rows.push('<div class="shop-effect"><span class="shop-effect-emoji">👻</span><div class="shop-effect-body"><b>Áo Tàng Hình</b><small>Người khác chỉ thấy "???" — ' + fmtUntil(e.invisibleUntil) + '.</small></div></div>');
        if (e.cakedUntil) rows.push('<div class="shop-effect shop-effect--cake"><span class="shop-effect-emoji">🎂</span><div class="shop-effect-body"><b>Bạn bị ' + escHtml(e.cakedBy || 'ai đó') + ' úp bánh kem!</b><small>Kem dính trên ảnh đại diện — ' + fmtUntil(e.cakedUntil) + '. '
            + (towels ? 'Bạn có ' + towels + ' 🧽 Khăn Lau Diệu Kì — <a href="' + KHO + '">lau ngay</a>!' : 'Mua 🧽 Khăn Lau Diệu Kì để lau sạch, hoặc mua bánh ném trả đũa 😆')
            + '</small></div></div>');
        el.innerHTML = rows.join('');
        el.hidden = !rows.length;
    }

    // The shop only sells — using, walking a pet and selling back all live
    // in the Kho đồ tab on profile.html (js/inventory.js).
    var KHO = 'profile.html#inventory';
    function itemAction(i) {
        var canBuy = state.wallet >= i.price && !(i.maxOwned && i.owned >= i.maxOwned);
        return '<button type="button" class="btn btn-primary btn-sm" data-buy="' + i.key + '"' + (canBuy ? '' : ' disabled') + '>'
            + (i.maxOwned && i.owned >= i.maxOwned ? 'Đã đầy' : 'Mua · 🔥 ' + i.price) + '</button>'
            + (i.owned ? '<a class="btn btn-ghost btn-sm" href="' + KHO + '">🎒 Mở kho</a>' : '');
    }

    function itemIcon(i) {
        return i.image
            ? '<img class="shop-emoji shop-emoji-img" src="' + escHtml(i.image) + '" alt="" aria-hidden="true">'
            : '<span class="shop-emoji" aria-hidden="true">' + i.emoji + '</span>';
    }

    function renderItems() {
        var el = document.getElementById('shop-items');
        el.removeAttribute('aria-busy');
        el.innerHTML = state.items.map(function (i) {
            return '<article class="shop-card shop-card--' + i.key + '">'
                + '<div class="shop-card-top">' + itemIcon(i)
                + '<span class="shop-owned' + (i.owned ? ' has' : '') + '">Đang có: <b>' + i.owned + '</b>' + (i.maxOwned ? '/' + i.maxOwned : '') + '</span></div>'
                + '<h3>' + escHtml(i.name) + '</h3>'
                + '<p>' + escHtml(i.description) + '</p>'
                + '<div class="shop-card-actions">' + itemAction(i) + '</div>'
                + '</article>';
        }).join('');
    }

    function renderPets() {
        renderPetGrid('shop-pets', state.pets.filter(function (p) { return p.tier !== 'vi'; }));
        renderPetGrid('shop-beasts', state.pets.filter(function (p) { return p.tier === 'vi'; }));
    }

    function renderPetGrid(id, pets) {
        var el = document.getElementById(id);
        if (!el) return;
        el.removeAttribute('aria-busy');
        el.innerHTML = pets.map(function (p) {
            var active = state.activePet === p.id;
            var action;
            if (!p.owned) {
                action = '<button type="button" class="btn btn-primary btn-sm" data-buy-pet="' + p.id + '"' + (state.wallet >= p.price ? '' : ' disabled') + '>Mua · 🔥 ' + p.price + '</button>';
            } else {
                action = (active ? '<span class="shop-walking">✓ Đang đi dạo</span>' : '')
                    + '<a class="btn btn-ghost btn-sm" href="' + KHO + '">🎒 Trong kho</a>';
            }
            return '<article class="shop-card shop-pet' + (p.tier === 'vi' ? ' shop-pet--vi' : '') + (p.legendary ? ' shop-pet--legend' : '') + (active ? ' is-active' : '') + (p.owned ? ' is-owned' : '') + '">'
                + (p.tails ? '<span class="shop-tails" title="' + p.tails + ' đuôi">' + p.tails + ' đuôi</span>' : '')
                + '<div class="shop-pet-stage"><div class="ews-pet is-walking shop-pet-preview">' + (window.Pets ? window.Pets.svg(p.id) : '') + '</div></div>'
                + '<h3>' + escHtml(p.name) + (p.legendary ? ' <span class="shop-legend-tag">Huyền thoại</span>' : '') + (p.owned ? ' <span class="shop-tag">Của bạn</span>' : '') + '</h3>'
                + '<p>' + escHtml(p.description) + '</p>'
                + '<div class="shop-card-actions">' + action + '</div>'
                + '</article>';
        }).join('');
    }

    /* ── Actions ────────────────────────────────────────────────────── */
    function after(d, okMsg) {
        busy = false;
        if (!d || !d.success) { toast((d && d.message) || 'Không thực hiện được, thử lại nhé.', 'error'); return load(); }
        if (okMsg) toast(okMsg, 'success');
        if (window.Mascot && window.Mascot.hop) try { window.Mascot.hop('cheer'); } catch (e) {}
        return load();
    }
    function itemByKey(k) { return state.items.filter(function (i) { return i.key === k; })[0]; }
    function petById(id) { return state.pets.filter(function (p) { return p.id === id; })[0]; }

    // Most the student can take home right now: what the wallet covers,
    // what a capped item still has room for, and the server's MAX_BUY_QTY.
    var MAX_QTY = 99;
    function maxQty(i) {
        var n = Math.min(MAX_QTY, Math.floor(state.wallet / i.price));
        if (i.maxOwned) n = Math.min(n, i.maxOwned - i.owned);
        return Math.max(0, n);
    }

    // Buy dialog with a − [n] + stepper; the total updates as n changes.
    function qtyDialog(i, onOk) {
        var max = maxQty(i);
        var wrap = document.createElement('div');
        wrap.className = 'modal-overlay shop-qty-modal';
        wrap.innerHTML = '<div class="modal-box modal-sm" role="dialog" aria-modal="true" aria-labelledby="shop-qty-title">'
            + '<div class="modal-body shop-qty-body">'
            + itemIcon(i)
            + '<h3 id="shop-qty-title">Mua ' + escHtml(i.name) + '</h3>'
            + '<div class="shop-qty" role="group" aria-label="Số lượng">'
            + '<button type="button" class="shop-qty-btn" data-step="-1" aria-label="Bớt 1">−</button>'
            + '<input type="number" class="shop-qty-input" inputmode="numeric" min="1" max="' + max + '" value="1" aria-label="Số lượng">'
            + '<button type="button" class="shop-qty-btn" data-step="1" aria-label="Thêm 1">+</button>'
            + '</div>'
            + '<div class="shop-qty-presets">'
            + [5, 10].filter(function (n) { return n < max; }).map(function (n) { return '<button type="button" class="btn btn-ghost btn-sm" data-set="' + n + '">' + n + '</button>'; }).join('')
            + (max > 1 ? '<button type="button" class="btn btn-ghost btn-sm" data-set="' + max + '">Tối đa (' + max + ')</button>' : '')
            + '</div>'
            + '<p class="shop-qty-total"></p>'
            + '<small class="shop-qty-note">Tối đa ' + max + (i.maxOwned ? ' (giữ tối đa ' + i.maxOwned + ')' : '') + ' · chuỗi không bị trừ.</small>'
            + '</div>'
            + '<div class="modal-footer" style="justify-content:center">'
            + '<button type="button" class="btn btn-ghost" data-cancel>Hủy</button>'
            + '<button type="button" class="btn btn-primary" data-ok>Mua</button>'
            + '</div></div>';
        document.body.appendChild(wrap);
        var input = wrap.querySelector('.shop-qty-input');
        var trigger = document.activeElement;

        function val() {
            var n = parseInt(input.value, 10);
            return Math.min(max, Math.max(1, isNaN(n) ? 1 : n));
        }
        function sync(n) {
            if (n !== undefined) input.value = n;
            var q = val();
            wrap.querySelector('[data-step="-1"]').disabled = q <= 1;
            wrap.querySelector('[data-step="1"]').disabled = q >= max;
            wrap.querySelector('.shop-qty-total').innerHTML = q + ' × 🔥 ' + i.price + ' = <b>🔥 ' + (q * i.price) + '</b>'
                + '<span>Ví còn lại: 🔥 ' + (state.wallet - q * i.price) + '</span>';
            wrap.querySelector('[data-ok]').textContent = 'Mua ' + q + ' · 🔥 ' + (q * i.price);
        }
        function close() {
            wrap.remove();
            if (trigger && trigger.focus) trigger.focus();
        }
        wrap.addEventListener('click', function (e) {
            var t = e.target;
            if (t === wrap || t.hasAttribute('data-cancel')) return close();
            if (t.hasAttribute('data-step')) return sync(val() + Number(t.getAttribute('data-step')));
            if (t.hasAttribute('data-set')) return sync(Number(t.getAttribute('data-set')));
            if (t.hasAttribute('data-ok')) { var q = val(); close(); onOk(q); }
        });
        wrap.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
            else if (e.key === 'Enter' && e.target === input) { e.preventDefault(); wrap.querySelector('[data-ok]').click(); }
        });
        input.addEventListener('input', function () { sync(); });
        input.addEventListener('blur', function () { sync(val()); });
        sync();
        input.focus();
        input.select();
    }

    function buyItem(key) {
        var i = itemByKey(key);
        qtyDialog(i, function (qty) {
            busy = true;
            api('POST', '/shop/buy', { kind: 'item', key: key, qty: qty }).then(function (d) {
                after(d, i.emoji + ' Đã mua ' + (qty > 1 ? qty + ' ' : '') + i.name + ' — cất trong Kho đồ (trang cá nhân).');
            });
        });
    }
    function buyPet(id) {
        var p = petById(id);
        var note = p.legendary ? ' Cả hệ thống sẽ được thông báo khi bạn rước linh thú huyền thoại này 🔥' : '';
        confirmThen('Rước ' + p.name + ' về?', 'Trừ ' + p.price + ' 🔥 trong ví lửa (chuỗi không bị trừ).' + note, 'Mua', function () {
            busy = true;
            api('POST', '/shop/buy', { kind: 'pet', key: id }).then(function (d) {
                if (d && d.success && window.Pets) window.Pets.setActive(d.activePet);
                // Everyone else gets it from the feed poll; the buyer sees it now.
                if (d && d.success && p.legendary && window.ShopFeed) window.ShopFeed.legend({ type: 'buy', self: true, petId: p.id });
                after(d, '🐾 ' + p.name + ' đã về nhà với bạn!');
            });
        });
    }
    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('button[data-buy],button[data-buy-pet]');
        if (!b || b.disabled || busy || !state) return;
        if (b.hasAttribute('data-buy')) buyItem(b.getAttribute('data-buy'));
        else buyPet(b.getAttribute('data-buy-pet'));
    });

    // Wiped from the shop-feed.js cake popup — drop the 🎂 effect row.
    document.addEventListener('ews:cake-wiped', function () { if (state) load(); });

    function load() {
        return api('GET', '/shop').then(function (d) {
            if (!d || !d.success) throw new Error(d && d.message);
            state = d;
            render();
        }).catch(function (err) {
            if (window.console) console.warn('[shop] load failed', err);
            ['shop-items', 'shop-pets', 'shop-beasts'].forEach(function (id) {
                var el = document.getElementById(id);
                el.removeAttribute('aria-busy');
                el.innerHTML = '<div class="shop-empty">Không tải được cửa hàng. <button type="button" class="btn btn-ghost btn-sm" onclick="location.reload()">Thử lại</button></div>';
            });
        });
    }

    function boot() {
        if (!window.AuthService || !window.AuthService.isLoggedIn()) {
            var next = 'shop.html';
            location.href = (window.AuthService && window.AuthService.buildLoginUrl) ? window.AuthService.buildLoginUrl(next) : 'login.html?next=' + encodeURIComponent(next);
            return;
        }
        load();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
