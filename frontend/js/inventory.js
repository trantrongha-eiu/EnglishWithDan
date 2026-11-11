/**
 * inventory.js — "Kho đồ" tab on profile.html (#inventory). Everything a
 * student bought in the Cửa hàng lửa (shop.html) lives here: items with
 * Dùng / Bán, linh thú with Dắt đi dạo / Cất về / Bán — plus the Búa Daniel
 * (bought or earned; its own card, can't be sold) and the current streak next to the wallet. Selling refunds half
 * the price, rounded down (backend shopService.sellItem / sellPet).
 * 🎁 Tặng gives an item (any quantity owned) or a linh thú to another
 * student/teacher, picked in a search dialog (shopService.giftItem / giftPet).
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
        if (i.key === 'towel') {
            var caked = state.effects && state.effects.cakedUntil;
            use = '<button type="button" class="btn btn-primary btn-sm" data-inv-use="towel"' + (caked ? '' : ' disabled') + '>'
                + (caked ? '🧽 Lau kem' : 'Ảnh đang sạch ✨') + '</button>';
        } else if (i.usage === 'manual') {
            use = '<button type="button" class="btn btn-primary btn-sm" data-inv-use="' + i.key + '"' + (hopeOn ? ' disabled' : '') + '>'
                + (hopeOn ? 'Đang dùng hôm nay' : 'Dùng') + '</button>';
        } else if (i.usage === 'target') {
            use = '<a class="btn btn-primary btn-sm" href="vocab-leaderboard.html">' + (i.key === 'lens' ? '🔍 Soi ở BXH' : 'Ném ở BXH') + '</a>';
        } else {
            use = '<span class="inv-passive">🛡️ Tự động bật khi lỡ 1 ngày</span>';
        }
        return '<div class="inv-card">'
            + '<span class="inv-emoji" aria-hidden="true">' + i.emoji + '</span>'
            + '<div class="inv-info"><b>' + escHtml(i.name) + '</b><span class="inv-qty">×' + i.owned + '</span></div>'
            + '<div class="inv-actions">' + use
            + '<button type="button" class="btn btn-ghost btn-sm" data-inv-gift-item="' + i.key + '">🎁 Tặng</button>'
            + '<button type="button" class="btn btn-ghost btn-sm" data-inv-sell-item="' + i.key + '">Bán · 🔥 ' + i.sellPrice + '</button></div>'
            + '</div>';
    }

    // Búa Daniel — bought in the shop, or earned from Paraphrase units ≥ 90%
    // / an admin gift; always shown: it restores a streak lost in the last 3 days.
    function danielCard() {
        var h = state.danielHammer || { count: 0, canUse: false };
        var hint = !h.count
            ? 'Mua ở Cửa hàng lửa, hoặc nhận búa khi hoàn thành 1 Unit Paraphrase đạt ≥ 90%.'
            : (h.canUse ? 'Khôi phục chuỗi ' + h.previousStreak + ' 🔥 vừa mất!' : 'Dùng được trong 3 ngày sau khi lỡ mất chuỗi.');
        return '<div class="inv-card inv-daniel' + (h.canUse ? ' is-ready' : '') + '">'
            + '<img class="inv-emoji inv-daniel-img" src="/img/buaDaniel.jpg" alt="" aria-hidden="true">'
            + '<div class="inv-info"><b>Búa Daniel</b><span class="inv-qty">×' + h.count + '</span></div>'
            + '<div class="inv-actions">'
            + '<button type="button" class="btn btn-primary btn-sm" data-inv-daniel' + (h.canUse && h.count ? '' : ' disabled') + '>Dùng</button>'
            + (h.count ? '<button type="button" class="btn btn-ghost btn-sm" data-inv-gift-item="danielHammer">🎁 Tặng</button>' : '')
            + '<span class="inv-hint">' + escHtml(hint) + '</span></div>'
            + '</div>';
    }

    function petCard(p) {
        var active = state.activePet === p.id;
        // "💤 Cho nghỉ hôm nay" (clicked on the walking pet) hides it on this
        // browser until midnight — say so instead of "Đang đi dạo".
        var resting = active && window.Pets && window.Pets.isResting && window.Pets.isResting();
        var art = window.Pets ? window.Pets.svg(p.id) : '';
        return '<div class="inv-card inv-pet' + (active ? ' is-active' : '') + '">'
            + '<span class="inv-pet-art" aria-hidden="true">' + art + '</span>'
            + '<div class="inv-info"><b>' + escHtml(p.name) + '</b>'
            + (resting ? '<span class="inv-resting">💤 Đang nghỉ hôm nay</span>'
                : active ? '<span class="inv-walking">✓ Đang đi dạo</span>'
                : (p.tails ? '<span class="inv-qty">' + p.tails + ' đuôi</span>' : '')) + '</div>'
            + (p.skill ? '<div class="inv-skill"><b>' + p.skill.icon + ' ' + escHtml(p.skill.name) + '</b> ' + escHtml(p.skill.text)
                + (active ? '' : ' <em>Chỉ dùng khi bé đi dạo.</em>') + '</div>' : '')
            + '<div class="inv-actions">'
            + (resting ? '<button type="button" class="btn btn-primary btn-sm" data-inv-wake>Gọi dậy</button>' : '')
            + (active
                ? '<button type="button" class="btn btn-ghost btn-sm" data-inv-pet="">Cất về</button>'
                : '<button type="button" class="btn btn-primary btn-sm" data-inv-pet="' + p.id + '">Dắt đi dạo</button>')
            + '<button type="button" class="btn btn-ghost btn-sm" data-inv-gift-pet="' + p.id + '">🎁 Tặng</button>'
            + '<button type="button" class="btn btn-ghost btn-sm" data-inv-sell-pet="' + p.id + '">Bán · 🔥 ' + p.sellPrice + '</button></div>'
            + '</div>';
    }

    function render() {
        var el = host();
        if (!el) return;
        var items = state.items.filter(function (i) { return i.owned > 0 && i.key !== 'danielHammer'; });
        var pets = state.pets.filter(function (p) { return p.owned; });
        var head = '<div class="inv-wallet">'
            + '<div class="inv-stats">'
            + '<div class="inv-stat"><span>Ví lửa</span><b>🔥 ' + state.wallet + '</b></div>'
            + '<div class="inv-stat inv-stat--streak"><span>Lửa chuỗi hiện có</span><b>🔥 ' + state.streak + '</b></div>'
            + '</div>'
            + '<a class="btn btn-primary btn-sm" href="shop.html"><i class="fas fa-store"></i> Cửa hàng</a></div>'
            + '<p class="inv-note">Ví lửa dùng để mua sắm; lửa chuỗi là thứ hạng trên BXH. Bán lại được một nửa giá mua (làm tròn xuống). Bấm 🎁 Tặng để gửi vật phẩm / linh thú cho bạn bè. Kỹ năng linh thú chỉ có tác dụng với bé đang đi dạo.</p>';
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
        hopeHammer: 'Từ giờ đến hết hôm nay mọi 🔥 kiếm được đều ×2. Nhưng nếu đến nửa đêm chưa kiếm thêm đủ 3 🔥 thì chuỗi bị trừ 10 🔥. (Mỗi ngày chỉ kiếm tối đa 10 🔥 — nên đập búa trước khi học.) Chơi không?',
        cloak: 'Giấu số 🔥 của bạn trên BXH trong 24 giờ.',
        crown: 'Đội vương miện, tên bạn phát sáng trên BXH trong 7 ngày.',
        towel: 'Lau sạch bánh kem trên ảnh đại diện của bạn ngay bây giờ.',
    };

    function useItem(key) {
        var i = itemByKey(key);
        confirmThen('Dùng ' + i.name + '?', USE_MSG[key] || '', key === 'hopeHammer' ? 'Đập búa! 🔨' : 'Dùng', function () {
            busy = true;
            api('POST', '/shop/use', { key: key }).then(function (d) {
                after(d, key === 'hopeHammer' ? '🔨 Búa đã đập — hôm nay lửa ×2, học ngay thôi!'
                    : key === 'towel' ? '🧽 Lau sạch bong! Ảnh đại diện đã hết kem ✨'
                    : i.emoji + ' Đã dùng ' + i.name + '!');
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

    /* ── 🎁 Tặng ────────────────────────────────────────────────────── */
    function initialOf(name) { return escHtml(((name || '?').trim()[0] || '?').toUpperCase()); }
    function recipientRow(u, picked) {
        var av = u.avatar
            ? '<img class="inv-gift-av" src="' + escHtml(u.avatar) + '" alt="">'
            : '<span class="inv-gift-av inv-gift-av--init">' + initialOf(u.name) + '</span>';
        return '<button type="button" class="inv-gift-user' + (picked ? ' is-picked' : '') + '" data-gift-to="' + u._id + '" role="option" aria-selected="' + (picked ? 'true' : 'false') + '">'
            + av + '<span class="inv-gift-name">' + escHtml(u.name)
            + (u.username ? '<small>@' + escHtml(u.username) + '</small>' : '') + '</span>'
            + (u.teacher ? '<span class="inv-gift-chip">Giáo viên</span>' : '')
            + '</button>';
    }

    // kind 'item' | 'pet'. Items get a − [n] + stepper up to what's owned.
    function giftDialog(kind, key) {
        var entry = kind === 'pet' ? petById(key) : itemByKey(key);
        if (!entry) return;
        var owned = kind === 'pet' ? 1 : entry.owned;
        var max = Math.min(99, owned);
        var icon = kind === 'pet'
            ? '<span class="inv-pet-art inv-gift-icon" aria-hidden="true">' + (window.Pets ? window.Pets.svg(entry.id) : '🐾') + '</span>'
            : (entry.image ? '<img class="inv-emoji inv-gift-icon" src="' + entry.image + '" alt="" aria-hidden="true">'
                : '<span class="inv-emoji inv-gift-icon" aria-hidden="true">' + entry.emoji + '</span>');
        var users = [];
        var picked = null;
        var timer = null;
        var seq = 0;

        var wrap = document.createElement('div');
        wrap.className = 'modal-overlay inv-gift-modal';
        wrap.innerHTML = '<div class="modal-box modal-sm" role="dialog" aria-modal="true" aria-labelledby="inv-gift-title">'
            + '<div class="modal-body inv-gift-body">'
            + '<div class="inv-gift-head">' + icon + '<h3 id="inv-gift-title">Tặng ' + escHtml(entry.name) + '</h3></div>'
            + '<input type="search" class="inv-gift-search" placeholder="Tìm theo tên hoặc username…" aria-label="Tìm người nhận" autocomplete="off">'
            + '<div class="inv-gift-list" role="listbox" aria-label="Người nhận"><div class="inv-gift-empty">Đang tải…</div></div>'
            + (max > 1
                ? '<div class="inv-gift-qty"><span>Số lượng</span><div class="inv-gift-step" role="group" aria-label="Số lượng">'
                    + '<button type="button" data-step="-1" aria-label="Bớt 1">−</button>'
                    + '<input type="number" inputmode="numeric" min="1" max="' + max + '" value="1" aria-label="Số lượng">'
                    + '<button type="button" data-step="1" aria-label="Thêm 1">+</button>'
                    + '</div><small>Bạn có ' + owned + '</small></div>'
                : '')
            + '<small class="inv-gift-note">' + (kind === 'pet'
                ? 'Linh thú rời kho của bạn và được gửi vào Hộp thư của người nhận — bạn ấy bấm "Nhận quà" là bé về kho.'
                : 'Vật phẩm rời Kho đồ của bạn và được gửi vào Hộp thư của người nhận — bạn ấy bấm "Nhận quà" là có.') + '</small>'
            + '</div>'
            + '<div class="modal-footer" style="justify-content:center">'
            + '<button type="button" class="btn btn-ghost" data-cancel>Hủy</button>'
            + '<button type="button" class="btn btn-primary" data-ok disabled>🎁 Tặng</button>'
            + '</div></div>';
        document.body.appendChild(wrap);
        var trigger = document.activeElement;
        var search = wrap.querySelector('.inv-gift-search');
        var list = wrap.querySelector('.inv-gift-list');
        var qtyInput = wrap.querySelector('.inv-gift-step input');
        var okBtn = wrap.querySelector('[data-ok]');

        function qty() {
            if (!qtyInput) return 1;
            var n = parseInt(qtyInput.value, 10);
            return Math.min(max, Math.max(1, isNaN(n) ? 1 : n));
        }
        function sync() {
            var q = qty();
            if (qtyInput) {
                wrap.querySelector('[data-step="-1"]').disabled = q <= 1;
                wrap.querySelector('[data-step="1"]').disabled = q >= max;
            }
            okBtn.disabled = !picked;
            okBtn.textContent = picked
                ? '🎁 Tặng ' + (q > 1 ? q + ' ' : '') + 'cho ' + picked.name
                : '🎁 Chọn người nhận';
        }
        function paint() {
            list.innerHTML = users.length
                ? users.map(function (u) { return recipientRow(u, picked && String(picked._id) === String(u._id)); }).join('')
                : '<div class="inv-gift-empty">Không tìm thấy ai — thử tên khác nhé.</div>';
        }
        function find(q) {
            var my = ++seq;
            api('GET', '/shop/gift-recipients?q=' + encodeURIComponent(q || '')).then(function (d) {
                if (my !== seq) return;
                users = (d && d.success && d.users) || [];
                paint();
            }).catch(function () { if (my === seq) list.innerHTML = '<div class="inv-gift-empty">Không tải được danh sách.</div>'; });
        }
        function close() {
            clearTimeout(timer);
            wrap.remove();
            if (trigger && trigger.focus) trigger.focus();
        }
        function send() {
            if (!picked) return;
            var q = qty();
            var to = picked;
            close();
            busy = true;
            api('POST', '/shop/gift', { kind: kind, key: key, toId: to._id, qty: q }).then(function (d) {
                if (kind === 'pet' && d && d.success && window.Pets) window.Pets.setActive(d.activePet);
                after(d, '🎁 Đã gửi ' + (q > 1 ? q + ' ' : '') + entry.name + ' vào Hộp thư của ' + ((d && d.targetName) || to.name) + '!');
            });
        }

        wrap.addEventListener('click', function (e) {
            var t = e.target;
            if (t === wrap || t.hasAttribute('data-cancel')) return close();
            if (t.hasAttribute('data-step')) { qtyInput.value = qty() + Number(t.getAttribute('data-step')); return sync(); }
            if (t.hasAttribute('data-ok')) return send();
            var row = t.closest && t.closest('[data-gift-to]');
            if (row) {
                var id = row.getAttribute('data-gift-to');
                picked = users.filter(function (u) { return String(u._id) === id; })[0] || null;
                paint();
                sync();
            }
        });
        wrap.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
            else if (e.key === 'Enter' && e.target === qtyInput) { e.preventDefault(); send(); }
        });
        search.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () { find(search.value); }, 250);
        });
        if (qtyInput) {
            qtyInput.addEventListener('input', sync);
            qtyInput.addEventListener('blur', function () { qtyInput.value = qty(); sync(); });
        }
        sync();
        find('');
        search.focus();
    }

    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-inv-use],[data-inv-sell-item],[data-inv-sell-pet],[data-inv-gift-item],[data-inv-gift-pet],[data-inv-pet],[data-inv-daniel],[data-inv-wake]');
        if (!b || b.disabled || busy || !state) return;
        if (b.hasAttribute('data-inv-wake')) {
            // Local only: the server still has it as the active pet.
            if (window.Pets) window.Pets.setActive(state.activePet);
            toast('🐾 Linh thú dậy rồi, đi dạo tiếp nè!', 'success');
            render();
        }
        else if (b.hasAttribute('data-inv-daniel')) useDaniel();
        else if (b.hasAttribute('data-inv-gift-item')) giftDialog('item', b.getAttribute('data-inv-gift-item'));
        else if (b.hasAttribute('data-inv-gift-pet')) giftDialog('pet', b.getAttribute('data-inv-gift-pet'));
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

    // Wiped from the shop-feed.js cake popup — refresh the Khăn Lau card.
    document.addEventListener('ews:cake-wiped', function () { if (state) load(); });

    function boot() {
        if (!window.AuthService || !window.AuthService.isLoggedIn()) return;
        var u = window.AuthService.getUser && window.AuthService.getUser();
        var tabBtn = document.querySelector('.tab-btn[data-tab="inventory"]');
        // Students and teachers play the 🔥 game (backend constants/shop.js FLAME_ROLES).
        if (u && u.role && u.role !== 'student' && u.role !== 'teacher') { if (tabBtn) tabBtn.style.display = 'none'; return; }
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
