/* ══════════════════════════════════════════════
   listening-upgrade-modal.js  –  Premium upgrade modal, extracted from
   listening.html's inline script. UPGRADE_PRICES/_upgradeSettings are
   used exclusively by the functions below (verified via project-wide
   grep) — reads the shared authH()/API/_userPlan/toast() from
   listening.html's remaining inline script via the browser's shared
   classic-script top-level scope.
══════════════════════════════════════════════ */
const UPGRADE_PRICES = { 1: 90000, 3: 250000, 6: 500000 };
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
    if (!_upgradeSettings) {
        try {
            const res = await fetch(`${API}/tuition/settings`, { headers: authH() });
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
}
function _renderUpgradeBankInfo() {
    const s = _upgradeSettings || {};
    const el = document.getElementById('up-bank-info');
    if (!el) return;
    const rows = [];
    if (s.bankName)    rows.push(`<div class="up-bank-row"><span class="up-bank-label">🏦 Ngân hàng</span><span class="up-bank-val">${s.bankName}</span></div>`);
    if (s.accountName) rows.push(`<div class="up-bank-row"><span class="up-bank-label">👤 Chủ TK</span><span class="up-bank-val">${s.accountName}</span></div>`);
    if (s.bankAccount) rows.push(`<div class="up-bank-row"><span class="up-bank-label">💳 Số TK</span><span class="up-bank-val up-acc-num">${s.bankAccount}<button onclick="copyUpgradeAccount('${s.bankAccount}')" title="Sao chép"><i class="fas fa-copy"></i></button></span></div>`);
    if (s.paymentNote) rows.push(`<div class="up-bank-row"><span class="up-bank-label">📋 Nội dung CK</span><span class="up-bank-val">${s.paymentNote}</span></div>`);
    el.innerHTML = rows.join('');
    const qrEl = document.getElementById('up-qr-img');
    if (qrEl) { qrEl.src = s.qrImageUrl || ''; qrEl.style.display = s.qrImageUrl ? 'block' : 'none'; }
}
function copyUpgradeAccount(num) {
    if (navigator.clipboard) navigator.clipboard.writeText(num).then(() => toast('Đã sao chép số TK', 'success'));
}
async function submitUpgradeRequest() {
    const activeBtn = document.querySelector('.up-plan-btn.active');
    const months = activeBtn ? parseInt(activeBtn.dataset.months) : 1;
    const submitBtn = document.getElementById('btn-upgrade-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }
    try {
        const res = await fetch(`${API}/upgrade/request`, {
            method: 'POST', headers: authH(),
            body: JSON.stringify({ months })
        });
        const data = await res.json();
        if (data.success) {
            closeUpgradeModal();
            toast('Yêu cầu đã gửi! Admin sẽ xác nhận trong 24 giờ.', 'success');
        } else {
            toast(data.message || 'Lỗi gửi yêu cầu', 'error');
        }
    } catch { toast('Lỗi kết nối server', 'error'); }
    finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Tôi đã thanh toán'; }
    }
}

window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.selectUpgradePlan = selectUpgradePlan;
window.submitUpgradeRequest = submitUpgradeRequest;
window.copyUpgradeAccount = copyUpgradeAccount;
