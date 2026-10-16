// tuition.html — Học phí
const API = (window.AuthService && window.AuthService.API && window.AuthService.API.replace(/\/api\/?$/, '')) || 'https://englishwithdan.onrender.com';
function tok() { return window.AuthService.getToken(); }
function hdrs() { return { 'Content-Type': 'application/json', ...window.AuthService.authHeader() }; }

// showToastWithTitle() moved to js/shared/toast.js (single source of
// truth — Phase 3 audit). This page's old #toastContainer element is
// no longer referenced but was left in place.

function fmtVND(n) { return Number(n || 0).toLocaleString('vi-VN') + ' ₫'; }

const MONTHS = ['','Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

function fmtPeriod(fee) {
  return fee.feeType === 'monthly'
    ? (MONTHS[fee.month] || 'Tháng ' + fee.month) + '/' + fee.year
    : (fee.courseName || 'Khóa học');
}
function fmtTypeLabel(fee) {
  return fee.feeType === 'monthly' ? 'Học phí tháng' : 'Học phí khóa học';
}

function renderFeeCard(fee) {
  let stateClass = 'unpaid', statusHtml = '', btnHtml = '';
  if (fee.isPaid) {
    stateClass = 'paid';
    const paidDate = fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('vi-VN') : '';
    statusHtml = `<span class="status-badge status-paid">✅ Đã đóng${paidDate ? ' · ' + paidDate : ''}</span>`;
  } else if (fee.studentNotified) {
    stateClass = 'notified';
    statusHtml = '<span class="status-badge status-notified">⏳ Đang xác nhận</span>';
  } else {
    statusHtml = '<span class="status-badge status-unpaid">❌ Chưa đóng</span>';
    btnHtml = `<button class="btn-notify" id="nbtn-${fee._id}" onclick="notifyPayment('${fee._id}')">💸 Đã chuyển khoản</button>`;
  }
  return `<div class="fee-card ${stateClass}" id="fcard-${fee._id}">
        <div class="fee-period">
          <div class="fee-type-label">${fmtTypeLabel(fee)}</div>
          <div class="fee-period-text">${fmtPeriod(fee)}</div>
          ${fee.note ? `<div class="fee-note">${escHtml(fee.note)}</div>` : ''}
        </div>
        <div class="fee-amount ${fee.isPaid ? 'paid-color' : 'unpaid'}">${fmtVND(fee.amount)}</div>
        ${statusHtml}
        ${btnHtml}
      </div>`;
}

let _paidVisible = false;
function togglePaidSection() {
  _paidVisible = !_paidVisible;
  document.getElementById('paidList').style.display = _paidVisible ? 'block' : 'none';
  document.getElementById('paidToggleIcon').style.transform = _paidVisible ? 'rotate(90deg)' : '';
  document.getElementById('paidToggleLabel').textContent = _paidVisible ? 'Ẩn học phí đã đóng' : 'Xem học phí đã đóng';
}

async function load() {
  // Abort after 20s so a cold-started backend doesn't leave the page
  // stuck on "Đang tải thông tin học phí..." with no way out.
  const _ctrl = new AbortController();
  const _killer = setTimeout(() => _ctrl.abort(), 20000);
  try {
    const res  = await fetch(API + '/api/tuition/my', { headers: hdrs(), signal: _ctrl.signal });
    clearTimeout(_killer);
    const data = await window.ApiClient.handleResponse(res);
    if (!data.success) throw new Error(data.message || 'Lỗi tải dữ liệu');

    const fees    = data.fees    || [];
    const settings = data.settings || {};

    // ── Debt banner ──────────────────────────────────────
    const unpaid = fees.filter(f => !f.isPaid);
    const totalUnpaid = unpaid.reduce((s, f) => s + (f.amount || 0), 0);
    const paid   = fees.filter(f => f.isPaid);
    const banner = document.getElementById('debtBanner');

    if (fees.length === 0) {
      // no fees at all
      banner.className = 'debt-banner no-debt';
      banner.innerHTML = '<div class="debt-icon">🎉</div><div class="debt-info"><div class="debt-label">Không có thông tin học phí nào</div><div class="debt-amount" style="font-size:18px;">Liên hệ giáo viên</div></div>';
      document.getElementById('emptyState').style.display = 'block';
    } else if (unpaid.length === 0) {
      // all paid
      banner.className = 'debt-banner no-debt';
      banner.innerHTML = `<div class="debt-icon">✅</div><div class="debt-info"><div class="debt-label">Tất cả học phí đã được đóng</div><div class="debt-amount">Không nợ học phí</div><div class="debt-sub">${paid.length} khoản đã đóng</div></div>`;
    } else {
      // has unpaid
      const pending = unpaid.filter(f => f.studentNotified).length;
      banner.className = 'debt-banner has-debt';
      banner.innerHTML = `
            <div class="debt-icon">⚠️</div>
            <div class="debt-info">
              <div class="debt-label">Tổng học phí cần đóng (cộng dồn ${unpaid.length} kỳ chưa thanh toán)</div>
              <div class="debt-amount">${fmtVND(totalUnpaid)}</div>
              <div class="debt-sub">${pending > 0 ? pending + ' kỳ đang chờ xác nhận · ' : ''}Vui lòng chuyển khoản và bấm "Đã chuyển khoản"</div>
            </div>`;
    }

    // ── Unpaid section ───────────────────────────────────
    if (unpaid.length > 0) {
      document.getElementById('unpaidSection').style.display = 'block';
      document.getElementById('unpaidList').innerHTML = unpaid.map(renderFeeCard).join('');
    }

    // ── Paid section ─────────────────────────────────────
    if (paid.length > 0) {
      document.getElementById('paidSection').style.display = 'block';
      document.getElementById('paidToggleLabel').textContent = `Xem ${paid.length} khoản học phí đã đóng`;
      document.getElementById('paidList').innerHTML = paid.map(renderFeeCard).join('');
    }

    // ── Payment info ─────────────────────────────────────
    if (settings.bankAccount || settings.bankName) {
      document.getElementById('paymentCard').style.display = 'block';
      const rows = [];
      // Admin-controlled but rendered on every logged-in student's page —
      // must be escaped before reaching innerHTML (security audit finding).
      if (settings.bankName)    rows.push(`<div class="bank-row"><span class="bank-label">🏦 Ngân hàng</span><span class="bank-value">${escHtml(settings.bankName)}</span></div>`);
      if (settings.accountName) rows.push(`<div class="bank-row"><span class="bank-label">👤 Chủ tài khoản</span><span class="bank-value">${escHtml(settings.accountName)}</span></div>`);
      if (settings.bankAccount) rows.push(`<div class="bank-row"><span class="bank-label">💳 Số tài khoản</span><span class="bank-account-num">${escHtml(settings.bankAccount)}<button class="copy-btn" onclick="copyAccount('${escAttr(settings.bankAccount)}')" title="Sao chép"><i class="fas fa-copy"></i></button></span></div>`);
      if (settings.defaultMonthlyFee) rows.push(`<div class="bank-row"><span class="bank-label">💰 HP/tháng</span><span class="bank-value" style="color:#16a34a;">${fmtVND(settings.defaultMonthlyFee)}</span></div>`);
      document.getElementById('bankInfoBody').innerHTML = rows.join('');
      if (settings.paymentNote) {
        const noteEl = document.getElementById('paymentNoteBody');
        noteEl.style.display = 'block';
        noteEl.innerHTML = '📋 <strong>Hướng dẫn CK:</strong> ' + escHtml(settings.paymentNote).replace(/\n/g, '<br>');
      }
      if (settings.qrImageUrl) {
        const qrWrap = document.getElementById('qrWrap');
        const qrImg  = document.getElementById('qrImg');
        qrImg.onerror = () => { qrWrap.style.display = 'none'; };
        qrWrap.style.display = 'block';
        qrImg.src = settings.qrImageUrl;
      }
    }

  } catch (err) {
    clearTimeout(_killer);
    console.error(err);
    const aborted = err && (err.name === 'AbortError' || /abort/i.test(err.message || ''));
    const banner = document.getElementById('debtBanner');
    banner.className = 'debt-banner loading';
    banner.innerHTML = `<div class="debt-icon">⚠️</div><div class="debt-info">`
      + `<div class="debt-label" style="color:#dc2626;">${escHtml(aborted
          ? 'Tải quá lâu — server có thể đang khởi động.'
          : (err.message || 'Không tải được dữ liệu. Vui lòng thử lại.'))}</div>`
      + `<button onclick="load()" style="margin-top:8px;background:var(--brand,#e53935);color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Thử lại</button>`
      + `</div>`;
  }
}

async function notifyPayment(feeId) {
  const btn = document.getElementById('nbtn-' + feeId);
  if (btn) { btn.disabled = true; btn.textContent = 'Đang gửi...'; }
  try {
    const res  = await fetch(API + `/api/tuition/${feeId}/notify`, { method: 'POST', headers: hdrs() });
    const data = await window.ApiClient.handleResponse(res);
    showToastWithTitle('success', 'Đã gửi thông báo', data.message || 'Admin sẽ xác nhận thanh toán của bạn sớm nhất!');
    // reload page after 1.5s
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    showToastWithTitle('error', 'Lỗi', err.message || 'Không gửi được');
    if (btn) { btn.disabled = false; btn.textContent = '💸 Đã chuyển khoản'; }
  }
}

function copyAccount(num) {
  navigator.clipboard.writeText(num).then(() => {
    showToastWithTitle('success', 'Đã sao chép', 'Số tài khoản đã được sao chép vào clipboard', 2000);
  }).catch(() => {
    showToastWithTitle('info', 'Số tài khoản', num, 4000);
  });
}

load();
