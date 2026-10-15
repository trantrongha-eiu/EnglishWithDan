/**
 * inventory.js — "Kho đồ" tab on profile.html (#inventory). Everything a
 * student bought in the Cửa hàng lửa (shop.html) lives here: items with
 * Dùng / Bán, linh thú with Dắt đi dạo / Cất về / Bán — plus the Búa Daniel
 * (earned, not bought) and the current streak next to the wallet. Selling refunds half
 * the price, rounded down (backend shopService.sellItem / sellPet).
 *
 * Needs: AuthService, escHtml (shared/utils.js), showToast (shared/toast.js),
 * Pets (shared/pets.js, injected by nav.js — the cards fall back to a plain
 * name until it has loaded). confirmDialog is used when the page has it.
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
        else if (window.confirm(title + '\n' + msg)) onOk();
    }
    function host() { return document.getElementById('inventory-body'); }

    /* ── Render ─────────────────────────────────────────────────────── */
    function itemCard(i) {
        var hopeOn = i.key === 'hopeHammer' && state.effects && state.effects.hope;
        var use;
        if (i.usage === 'manual') {
            use = '<button type="button" class="btn btn-primary btn-sm" data-inv-use="' + i.key + '"' + (hopeOn ? ' disabled' : '') + '>'
                + (hopeOn ? 'Đang dùng hôm nay' : 'Dùng') + '</button>';
        } else if (i.usage === 'target') {
            use = '<a class="btn btn-primary btn-sm" href="vocab-leaderboard.html">Ném ở BXH</a>';
        } else {
            use = '<span class="inv-passive">🛡️ Tự động bật khi lỡ 1 ngày</span>';
        }
        return '<div class="inv-card">'
            + '<span class="inv-emoji" aria-hidden="true">' + i.emoji + '</span>'
            + '<div class="inv-info"><b>' + escHtml(i.name) + '</b><span class="inv-qty">×' + i.owned + '</span></div>'
            + '<div class="inv-actions">' + use
            + '<button type="button" class="btn btn-ghost btn-sm" data-inv-sell-item="' + i.key + '">Bán · 🔥 ' + i.sellPrice + '</button></div>'
            + '</div>';
    }

    // Búa Daniel — not a shop item (earned from Paraphrase units ≥ 90% or an
    // admin gift), always shown: it restores a streak lost in the last 3 days.
    function danielCard() {
        var h = state.danielHammer || { count: 0, canUse: false };
        var hint = !h.count
            ? 'Nhận búa khi hoàn thành 1 Unit Paraphrase đạt ≥ 90%.'
            : (h.canUse ? 'Khôi phục chuỗi ' + h.previousStreak + ' 🔥 vừa mất!' : 'Dùng được trong 3 ngày sau khi lỡ mất chuỗi.');
        return '<div class="inv-card inv-daniel' + (h.canUse ? ' is-ready' : '') + '">'
            + '<img class="inv-emoji inv-daniel-img" src="/img/buaDaniel.jpg" alt="" aria-hidden="true">'
            + '<div class="inv-info"><b>Búa Daniel</b><span class="inv-qty">×' + h.count + '</span></div>'
            + '<div class="inv-actions">'
            + '<button type="button" class="btn btn-primary btn-sm" data-inv-daniel' + (h.canUse && h.count ? '' : ' disabled') + '>Dùng</button>'
            + '<span class="inv-hint">' + escHtml(hint) + '</span></div>'
            + '</div>';
    }

    function petCard(p) {
        var active = state.activePet === p.id;
        var art = window.Pets ? window.Pets.svg(p.id) : '';
        return '<div class="inv-card inv-pet' + (active ? ' is-active' : '') + '">'
            + '<span class="inv-pet-art" aria-hidden="true">' + art + '</span>'
            + '<div class="inv-info"><b>' + escHtml(p.name) + '</b>'
            + (active ? '<span class="inv-walking">✓ Đang đi dạo</span>' : (p.tails ? '<span class="inv-qty">' + p.tails + ' đuôi</span>' : '')) + '</div>'
            + '<div class="inv-actions">'
            + (active
                ? '<button type="button" class="btn btn-ghost btn-sm" data-inv-pet="">Cất về</button>'
                : '<button type="button" class="btn btn-primary btn-sm" data-inv-pet="' + p.id + '">Dắt đi dạo</button>')
            + '<button type="button" class="btn btn-ghost btn-sm" data-inv-sell-pet="' + p.id + '">Bán · 🔥 ' + p.sellPrice + '</button></div>'
            + '</div>';
    }

    function render() {
        var el = host();
        if (!el) return;
        var items = state.items.filter(function (i) { return i.owned > 0; });
        var pets = state.pets.filter(function (p) { return p.owned; });
        var head = '<div class="inv-wallet">'
            + '<div class="inv-stats">'
            + '<div class="inv-stat"><span>Ví lửa</span><b>🔥 ' + state.wallet + '</b></div>'
            + '<div class="inv-stat inv-stat--streak"><span>Lửa chuỗi hiện có</span><b>🔥 ' + state.streak + '</b></div>'
            + '</div>'
            + '<a class="btn btn-primary btn-sm" href="shop.html"><i class="fas fa-store"></i> Cửa hàng</a></div>'
            + '<p class="inv-note">Ví lửa dùng để mua sắm; lửa chuỗi là thứ hạng trên BXH. Bán lại được một nửa giá mua (làm tròn xuống).</p>';
        el.innerHTML = head
            + '<h4 class="inv-h">⚔️ Vật phẩm</h4><div class="inv-grid">' + danielCard() + items.map(itemCard).join('') + '</div>'
            + (pets.length
                ? '<h4 class="inv-h">🐾 Linh thú</h4><div class="inv-grid">' + pets.map(petCard).join('') + '</div>'
                : '<div class="inv-empty">🐾 Chưa có linh thú — ghé <a href="shop.html">Cửa hàng lửa</a> rước một bé về nhé!</div>');
    }

    /* ── Actions ────────────────────────────────────────────────────── */
    function after(d, okMsg) {
        busy = false;
        if (!d || !d.success) toast((d && d.message) || 'Không thực hiện được, thử lại nhé.', 'error');
        else if (okMsg) toast(okMsg, 'success');
        return load();
    }
    function itemByKey(k) { return state.items.filter(function (i) { return i.key === k; })[0]; }
    function petById(id) { return state.pets.filter(function (p) { return p.id === id; })[0]; }

    var USE_MSG = {
        hopeHammer: 'Từ giờ đến hết hôm nay mọi 🔥 kiếm được đều ×2. Nhưng nếu đến nửa đêm chưa kiếm thêm đủ 3 🔥 thì chuỗi bị trừ 10 🔥. Chơi không?',
        cloak: 'Giấu số 🔥 của bạn trên BXH trong 24 giờ.',
        crown: 'Đội vương miện, tên bạn phát sáng trên BXH trong 7 ngày.',
    };

    function useItem(key) {
        var i = itemByKey(key);
        confirmThen('Dùng ' + i.name + '?', USE_MSG[key] || '', key === 'hopeHammer' ? 'Đập búa! 🔨' : 'Dùng', function () {
            busy = true;
            api('POST', '/shop/use', { key: key }).then(function (d) {
                after(d, key === 'hopeHammer' ? '🔨 Búa đã đập — hôm nay lửa ×2, học ngay thôi!' : i.emoji + ' Đã dùng ' + i.name + '!');
            });
        });
    }
    function sellItem(key) {
        var i = itemByKey(key);
        confirmThen('Bán ' + i.name + '?', 'Bán 1 ' + i.name + ' lấy lại ' + i.sellPrice + ' 🔥 (giá mua ' + i.price + ' 🔥).', 'Bán', function () {
            busy = true;
            api('POST', '/shop/sell', { kind: 'item', key: key }).then(function (d) { after(d, 'Đã bán ' + i.name + ' — +' + i.sellPrice + ' 🔥'); });
        });
    }
    function sellPet(id) {
        var p = petById(id);
        confirmThen('Bán ' + p.name + '?', 'Linh thú sẽ rời khỏi kho, bạn nhận lại ' + p.sellPrice + ' 🔥 (giá mua ' + p.price + ' 🔥).', 'Bán', function () {
            busy = true;
            api('POST', '/shop/sell', { kind: 'pet', key: id }).then(function (d) {
                if (d && d.success && window.Pets) window.Pets.setActive(d.activePet);
                after(d, 'Tạm biệt ' + p.name + ' 👋 — +' + p.sellPrice + ' 🔥');
            });
        });
    }
    function useDaniel() {
        var h = state.danielHammer;
        confirmThen('Dùng Búa Daniel?', 'Khôi phục chuỗi ' + h.previousStreak + ' 🔥 vừa mất (tốn 1 búa).', 'Khôi phục 🔨', function () {
            busy = true;
            api('POST', '/user/streak/use-hammer').then(function (d) {
                after(d, '🔨 Đã khôi phục chuỗi ' + (d && d.streak) + ' 🔥!');
            });
        });
    }
    function setPet(id) {
        busy = true;
        api('PUT', '/shop/pet', { petId: id }).then(function (d) {
            if (d && d.success && window.Pets) window.Pets.setActive(d.activePet);
            after(d, id ? '🐾 ' + petById(id).name + ' ra ngoài đi dạo rồi!' : 'Linh thú đã về nghỉ.');
        });
    }

    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-inv-use],[data-inv-sell-item],[data-inv-sell-pet],[data-inv-pet],[data-inv-daniel]');
        if (!b || b.disabled || busy || !state) return;
        if (b.hasAttribute('data-inv-daniel')) useDaniel();
        else if (b.hasAttribute('data-inv-use')) useItem(b.getAttribute('data-inv-use'));
        else if (b.hasAttribute('data-inv-sell-item')) sellItem(b.getAttribute('data-inv-sell-item'));
        else if (b.hasAttribute('data-inv-sell-pet')) sellPet(b.getAttribute('data-inv-sell-pet'));
        else setPet(b.getAttribute('data-inv-pet'));
    });

    function load() {
        var el = host();
        if (!el) return Promise.resolve();
        return api('GET', '/shop').then(function (d) {
            if (!d || !d.success) throw new Error();
            state = d;
            render();
        }).catch(function () {
            el.innerHTML = '<div class="inv-empty">Không tải được kho đồ. <button type="button" class="btn btn-ghost btn-sm" onclick="location.reload()">Thử lại</button></div>';
        });
    }

    function boot() {
        if (!window.AuthService || !window.AuthService.isLoggedIn()) return;
        var u = window.AuthService.getUser && window.AuthService.getUser();
        var tabBtn = document.querySelector('.tab-btn[data-tab="inventory"]');
        if (u && u.role && u.role !== 'student') { if (tabBtn) tabBtn.style.display = 'none'; return; }
        load();
        // pets.js is injected by nav.js and may land after the first render —
        // repaint once it's there so the pet cards get their art.
        if (!window.Pets) {
            var tries = 0;
            var t = setInterval(function () {
                if (window.Pets || ++tries > 20) { clearInterval(t); if (window.Pets && state) render(); }
            }, 250);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
