/* ══════════════════════════════════════════════════════════════════════
   upgrade-modal.js  –  Shared, site-wide "Nâng cấp Premium" modal.

   Self-injecting component (same pattern as consult-modal.js) so any page
   that loads this file can call window.openUpgradeModal() immediately —
   no per-page modal markup or per-page copy of this logic needed. This
   replaces the old listening-upgrade-modal.js / reading-upgrade-modal.js /
   speaking.js's inline sp-* versions, which were 3 near-identical copies
   that only existed on their own pages (so clicking "Upgrade" anywhere
   else had to navigate to one of those pages first).

   Keeps the original global function names (openUpgradeModal,
   closeUpgradeModal, selectUpgradePlan, submitUpgradeRequest,
   copyUpgradeAccount) so existing onclick="openUpgradeModal()" call sites
   across the app keep working unchanged.
══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var UPGRADE_PRICES = { 1: 90000, 3: 250000, 6: 500000, 12: 900000, 36: 2500000 };
  var _upgradeSettings = null;

  function api()     { return (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api'; }
  function authHdr()  { return (window.AuthService && window.AuthService.authHeader()) || {}; }
  function notify(msg, type) {
    if (window.showToast) window.showToast(msg, type);
    else if (window.toast) window.toast(msg, type);
  }
  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escAttr(s) { return escHtml(s).replace(/`/g, '&#96;'); }

  var css = document.createElement('style');
  css.textContent = `
    #um-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9500;align-items:center;justify-content:center;padding:16px;}
    #um-overlay.open{display:flex;}
    #um-card{background:var(--card,#fff);border-radius:20px;width:100%;max-width:520px;box-shadow:0 24px 64px rgba(0,0,0,.25);max-height:90vh;display:flex;flex-direction:column;overflow:hidden;}
    #um-card-header{flex-shrink:0;background:linear-gradient(135deg,var(--brand,#e53935),var(--brand-dark,#c62828));padding:24px 28px 20px;color:#fff;position:relative;}
    #um-close{position:absolute;top:14px;right:16px;background:rgba(255,255,255,.15);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
    #um-card-body{flex:1;min-height:0;overflow-y:auto;padding:20px 28px 0;}
    #um-plan-grid-1{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px;}
    #um-plan-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;}
    .um-plan-btn{border:2px solid var(--border,#e5e7eb);border-radius:12px;padding:12px 8px;cursor:pointer;background:var(--card,#fff);transition:.15s;text-align:center;position:relative;font-family:inherit;}
    .um-plan-btn.active{border-color:var(--brand,#e53935) !important;background:var(--brand-light,rgba(229,57,53,.12)) !important;}
    .um-plan-name{font-size:15px;font-weight:700;color:var(--text,#111);}
    .um-plan-price{font-size:13px;color:var(--brand,#e53935);font-weight:600;margin-top:4px;}
    .um-plan-sub{font-size:11px;color:var(--text3,#888);margin-top:2px;}
    .um-plan-badge{position:absolute;top:-8px;left:50%;transform:translateX(-50%);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap;}
    #um-total-box{background:var(--bg,#f9fafb);border-radius:12px;padding:14px 16px;margin-bottom:16px;text-align:center;}
    #um-bank-info{font-size:13px;line-height:2;margin-bottom:10px;}
    .um-bank-row{display:flex;align-items:center;gap:10px;}
    .um-bank-label{color:var(--text3,#888);min-width:110px;font-size:12px;}
    .um-bank-val{font-weight:700;color:var(--text,#111);}
    .um-acc-num{font-family:monospace;font-size:16px;color:#1d4ed8;}
    .um-acc-num button{background:none;border:none;cursor:pointer;color:#64748b;margin-left:6px;}
    #um-qr-wrap{text-align:center;margin-bottom:12px;}
    #um-qr-img{max-width:180px;border-radius:10px;border:1px solid var(--border,#e5e7eb);display:none;}
    #um-card-footer{flex-shrink:0;padding:16px 28px 24px;display:flex;flex-direction:column;gap:10px;}
    #um-submit-btn{width:100%;padding:14px;background:linear-gradient(135deg,var(--brand,#e53935),var(--brand-dark,#c62828));color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;}
    #um-submit-btn:disabled{opacity:.6;cursor:default;}

    #um-success-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9600;align-items:center;justify-content:center;padding:16px;}
    #um-success-overlay.open{display:flex;}
    #um-success-card{background:var(--card,#fff);border-radius:20px;width:100%;max-width:400px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.25);padding:32px 28px;text-align:center;}
    #um-success-icon{font-size:52px;margin-bottom:14px;}
    #um-success-card h3{margin:0 0 8px;font-size:19px;font-weight:800;color:var(--text,#111);}
    #um-success-card p{margin:0 0 22px;font-size:13.5px;line-height:1.6;color:var(--text2,#555);}
    #um-success-ok{width:100%;padding:12px;background:linear-gradient(135deg,var(--brand,#e53935),var(--brand-dark,#c62828));color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;}

    @media (max-width:480px){
      #um-plan-grid-1{grid-template-columns:repeat(3,1fr);gap:7px;}
      #um-card-header,#um-card-body,#um-card-footer{padding-left:18px;padding-right:18px;}
    }
  `;
  document.head.appendChild(css);

  var overlay = document.createElement('div');
  overlay.id = 'um-overlay';
  overlay.innerHTML =
    '<div id="um-card">' +
      '<div id="um-card-header">' +
        '<button id="um-close" title="Đóng">✕</button>' +
        '<div style="font-size:28px;margin-bottom:6px">⭐</div>' +
        '<h3 id="um-title" style="margin:0 0 4px;font-size:20px;font-weight:700">Nâng cấp Premium</h3>' +
        '<p id="um-desc" style="margin:0;font-size:13px;opacity:.85">Truy cập đầy đủ ngân hàng đề thi IELTS thật — Reading · Listening · Writing · Speaking · Vocabulary</p>' +
      '</div>' +
      '<div id="um-card-body">' +
        '<p style="margin:0 0 12px;font-size:13px;font-weight:600;color:var(--text2,#555)">Chọn gói:</p>' +
        '<div id="um-plan-grid-1">' +
          '<button class="um-plan-btn" data-months="1"><div class="um-plan-name">1 tháng</div><div class="um-plan-price">90.000 ₫</div></button>' +
          '<button class="um-plan-btn" data-months="3"><div class="um-plan-name">3 tháng</div><div class="um-plan-price">250.000 ₫</div></button>' +
          '<button class="um-plan-btn" data-months="6"><div class="um-plan-name">6 tháng</div><div class="um-plan-price">500.000 ₫</div></button>' +
        '</div>' +
        '<div id="um-plan-grid-2">' +
          '<button class="um-plan-btn" data-months="12"><div class="um-plan-badge" style="background:#22c55e">Tiết kiệm</div><div class="um-plan-name">1 năm</div><div class="um-plan-price">900.000 ₫</div><div class="um-plan-sub">75.000/tháng</div></button>' +
          '<button class="um-plan-btn" data-months="36"><div class="um-plan-badge" style="background:#f59e0b">Tiết kiệm nhất</div><div class="um-plan-name">3 năm</div><div class="um-plan-price">2.500.000 ₫</div><div class="um-plan-sub">~69.000/tháng</div></button>' +
        '</div>' +
        '<div id="um-total-box"><span style="font-size:13px;color:var(--text2,#555)">Tổng thanh toán:</span> <span id="um-total-price" style="font-size:22px;font-weight:800;color:var(--brand,#e53935);margin-left:10px">90.000 ₫</span></div>' +
        '<div id="um-bank-info"></div>' +
        '<div id="um-qr-wrap"><img id="um-qr-img" alt="QR chuyển khoản"></div>' +
      '</div>' +
      '<div id="um-card-footer">' +
        '<button id="um-submit-btn">Tôi đã thanh toán</button>' +
        '<p style="margin:0;font-size:12px;color:var(--text3,#888);text-align:center">Sau khi thanh toán, Admin sẽ xác nhận và nâng cấp tài khoản của bạn trong vòng 24 giờ.</p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var successOverlay = document.createElement('div');
  successOverlay.id = 'um-success-overlay';
  successOverlay.innerHTML =
    '<div id="um-success-card">' +
      '<div id="um-success-icon">🎉</div>' +
      '<h3>Đăng ký gói thành công!</h3>' +
      '<p>Yêu cầu nâng cấp của bạn đã được ghi nhận. Admin sẽ kiểm tra và kích hoạt Premium cho tài khoản của bạn trong vòng 24 giờ.</p>' +
      '<button id="um-success-ok">Đã hiểu</button>' +
    '</div>';
  document.body.appendChild(successOverlay);

  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeUpgradeModal(); });
  successOverlay.addEventListener('click', function (e) { if (e.target === successOverlay) closeUpgradeSuccessModal(); });
  document.getElementById('um-close').addEventListener('click', closeUpgradeModal);
  document.getElementById('um-success-ok').addEventListener('click', closeUpgradeSuccessModal);
  document.getElementById('um-submit-btn').addEventListener('click', submitUpgradeRequest);
  overlay.querySelectorAll('.um-plan-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { selectUpgradePlan(parseInt(btn.dataset.months, 10)); });
  });

  async function openUpgradeModal() {
    overlay.classList.add('open');
    var user = window.AuthService ? window.AuthService.getUser() : null;
    var isPremium = user && user.plan === 'premium';
    var titleEl = document.getElementById('um-title');
    var descEl  = document.getElementById('um-desc');
    if (isPremium) {
      titleEl.textContent = 'Gia hạn Premium';
      descEl.textContent  = 'Gia hạn thêm thời gian Premium — ngày sẽ được cộng dồn vào thời hạn hiện tại của bạn';
    } else {
      titleEl.textContent = 'Nâng cấp Premium';
      descEl.textContent  = 'Truy cập đầy đủ ngân hàng đề thi IELTS thật — Reading · Listening · Writing · Speaking · Vocabulary';
    }
    if (!_upgradeSettings) {
      try {
        var res = await fetch(api() + '/tuition/settings', { headers: authHdr() });
        var data = await res.json();
        _upgradeSettings = data.settings || {};
      } catch (e) { _upgradeSettings = {}; }
      renderBankInfo();
    }
    selectUpgradePlan(1);
  }

  function closeUpgradeModal() { overlay.classList.remove('open'); }
  function closeUpgradeSuccessModal() { successOverlay.classList.remove('open'); }

  function selectUpgradePlan(months) {
    overlay.querySelectorAll('.um-plan-btn').forEach(function (b) { b.classList.remove('active'); });
    var btn = overlay.querySelector('.um-plan-btn[data-months="' + months + '"]');
    if (btn) btn.classList.add('active');
    var amount = UPGRADE_PRICES[months] || 0;
    document.getElementById('um-total-price').textContent = amount.toLocaleString('vi-VN') + ' ₫';
  }

  function renderBankInfo() {
    var s = _upgradeSettings || {};
    var el = document.getElementById('um-bank-info');
    var rows = [];
    if (s.bankName)    rows.push('<div class="um-bank-row"><span class="um-bank-label">🏦 Ngân hàng</span><span class="um-bank-val">' + escHtml(s.bankName) + '</span></div>');
    if (s.accountName) rows.push('<div class="um-bank-row"><span class="um-bank-label">👤 Chủ TK</span><span class="um-bank-val">' + escHtml(s.accountName) + '</span></div>');
    if (s.bankAccount) rows.push('<div class="um-bank-row"><span class="um-bank-label">💳 Số TK</span><span class="um-bank-val um-acc-num">' + escHtml(s.bankAccount) + '<button type="button" data-acc="' + escAttr(s.bankAccount) + '" title="Sao chép"><i class="fas fa-copy"></i></button></span></div>');
    if (s.paymentNote) rows.push('<div class="um-bank-row"><span class="um-bank-label">📋 Nội dung CK</span><span class="um-bank-val">' + escHtml(s.paymentNote) + '</span></div>');
    el.innerHTML = rows.join('');
    var copyBtn = el.querySelector('.um-acc-num button');
    if (copyBtn) copyBtn.addEventListener('click', function () { copyUpgradeAccount(copyBtn.dataset.acc); });
    var qrEl = document.getElementById('um-qr-img');
    qrEl.src = s.qrImageUrl || '';
    qrEl.style.display = s.qrImageUrl ? 'block' : 'none';
  }

  function copyUpgradeAccount(num) {
    if (navigator.clipboard) navigator.clipboard.writeText(num).then(function () { notify('Đã sao chép số tài khoản', 'success'); });
  }

  async function submitUpgradeRequest() {
    var activeBtn = overlay.querySelector('.um-plan-btn.active');
    var months = activeBtn ? parseInt(activeBtn.dataset.months, 10) : 1;
    var submitBtn = document.getElementById('um-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';
    try {
      var res = await fetch(api() + '/upgrade/request', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHdr()),
        body: JSON.stringify({ months: months })
      });
      var data = await res.json();
      if (data.success) {
        closeUpgradeModal();
        successOverlay.classList.add('open');
      } else {
        notify(data.message || 'Lỗi gửi yêu cầu', 'error');
      }
    } catch (e) {
      notify('Lỗi kết nối server', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Tôi đã thanh toán';
    }
  }

  window.openUpgradeModal = openUpgradeModal;
  window.closeUpgradeModal = closeUpgradeModal;
  window.closeUpgradeSuccessModal = closeUpgradeSuccessModal;
  window.selectUpgradePlan = selectUpgradePlan;
  window.submitUpgradeRequest = submitUpgradeRequest;
  window.copyUpgradeAccount = copyUpgradeAccount;
})();
