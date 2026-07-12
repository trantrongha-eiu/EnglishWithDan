/* ══════════════════════════════════════════════════════════════════════
   reading-upgrade-modal.js  –  Premium upgrade modal, extracted from
   reading-v2.js. Reads the shared `_userPlan` variable (read-only here)
   and the global API/AuthService/showVocabToast — safe to isolate since
   nothing else in reading-v2.js touches UPGRADE_PRICES/_upgradeSettings.
══════════════════════════════════════════════════════════════════════ */
const UPGRADE_PRICES = { 1: 90000, 3: 250000, 6: 500000, 12: 900000, 36: 2500000 };
let _upgradeSettings = null;

async function openUpgradeModal() {
  const modal = document.getElementById('modal-upgrade');
  if (!modal) return;
  modal.classList.remove('hidden');
  const titleEl = document.getElementById('up-modal-title');
  const descEl  = document.getElementById('up-modal-desc');
  if (_userPlan === 'premium') {
    if (titleEl) titleEl.textContent = 'Gia hạn Premium';
    if (descEl)  descEl.textContent  = 'Gia hạn thêm thời gian Premium — ngày sẽ được cộng dồn vào thời hạn hiện tại của bạn';
  } else {
    if (titleEl) titleEl.textContent = 'Nâng cấp Premium';
    if (descEl)  descEl.textContent  = 'Truy cập đầy đủ ngân hàng đề thi IELTS thật — Reading · Listening · Writing · Vocabulary';
  }
  // Fetch bank info & QR once
  if (!_upgradeSettings) {
    try {
      const res = await fetch(`${API}/tuition/settings`, {
        headers: window.AuthService.authHeader()
      });
      const data = await res.json();
      _upgradeSettings = data.settings || {};
    } catch { _upgradeSettings = {}; }
    _renderUpgradeBankInfo();
  }
  selectUpgradePlan(1);
}

function closeUpgradeModal() {
  const modal = document.getElementById('modal-upgrade');
  if (modal) modal.classList.add('hidden');
}

function selectUpgradePlan(months) {
  document.querySelectorAll('.up-plan-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.up-plan-btn[data-months="${months}"]`);
  if (btn) btn.classList.add('active');
  const amount = UPGRADE_PRICES[months] || 0;
  const el = document.getElementById('up-total-price');
  if (el) el.textContent = amount.toLocaleString('vi-VN') + ' ₫';
  const el2 = document.getElementById('up-selected-months');
  if (el2) el2.textContent = months;
  // Update transfer content
  const s = _upgradeSettings || {};
  const contentEl = document.getElementById('up-transfer-content');
  if (contentEl && s.paymentNote) {
    contentEl.textContent = s.paymentNote;
  }
}

function _renderUpgradeBankInfo() {
  const s = _upgradeSettings || {};
  const el = document.getElementById('up-bank-info');
  if (!el) return;
  const rows = [];
  if (s.bankName)    rows.push(`<div class="up-bank-row"><span class="up-bank-label">🏦 Ngân hàng</span><span class="up-bank-val">${s.bankName}</span></div>`);
  if (s.accountName) rows.push(`<div class="up-bank-row"><span class="up-bank-label">👤 Chủ TK</span><span class="up-bank-val">${s.accountName}</span></div>`);
  if (s.bankAccount) rows.push(`<div class="up-bank-row"><span class="up-bank-label">💳 Số TK</span><span class="up-bank-val up-acc-num">${s.bankAccount}<button onclick="copyUpgradeAccount('${s.bankAccount}')" title="Sao chép"><i class="fas fa-copy"></i></button></span></div>`);
  if (s.paymentNote) rows.push(`<div class="up-bank-row"><span class="up-bank-label">📋 Nội dung CK</span><span class="up-bank-val" id="up-transfer-content">${s.paymentNote}</span></div>`);
  el.innerHTML = rows.join('');
  const qrEl = document.getElementById('up-qr-img');
  if (qrEl) { qrEl.src = s.qrImageUrl || ''; qrEl.style.display = s.qrImageUrl ? 'block' : 'none'; }
}

function copyUpgradeAccount(num) {
  if (navigator.clipboard) navigator.clipboard.writeText(num).then(() => showVocabToast('Đã sao chép số tài khoản', 'success'));
}

async function submitUpgradeRequest() {
  const activeBtn = document.querySelector('.up-plan-btn.active');
  const months = activeBtn ? parseInt(activeBtn.dataset.months) : 1;
  const submitBtn = document.getElementById('btn-upgrade-submit');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }
  try {
    const res = await fetch(`${API}/upgrade/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...window.AuthService.authHeader() },
      body: JSON.stringify({ months })
    });
    const data = await res.json();
    if (data.success) {
      closeUpgradeModal();
      showVocabToast('Yêu cầu đã gửi! Admin sẽ xác nhận trong 24 giờ.', 'success');
    } else {
      showVocabToast(data.message || 'Lỗi gửi yêu cầu', 'error');
    }
  } catch {
    showVocabToast('Lỗi kết nối server', 'error');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Tôi đã thanh toán'; }
  }
}

window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.selectUpgradePlan = selectUpgradePlan;
window.submitUpgradeRequest = submitUpgradeRequest;
window.copyUpgradeAccount = copyUpgradeAccount;
