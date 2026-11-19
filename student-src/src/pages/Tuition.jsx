import { Fragment, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { siteToastTitled } from '../utils/shell';

// 💰 Học phí — /app/tuition (was tuition.html). The nav badge and the reminder
// popup count unpaid fees, so "Đã chuyển khoản" doesn't change them: the card
// just moves to "Đang xác nhận" here, no page reload needed.

const fmtVND = (n) => `${Number(n || 0).toLocaleString('vi-VN')} ₫`;
const typeLabel = (fee) => (fee.feeType === 'monthly' ? 'Học phí tháng' : 'Học phí khóa học');
const periodLabel = (fee) => (fee.feeType === 'monthly'
  ? `Tháng ${fee.month}/${fee.year}`
  : fee.courseName || 'Khóa học');

function DebtBanner({ fees, unpaid, paid }) {
  if (!fees.length) {
    return (
      <div className="debt-banner no-debt" id="debtBanner">
        <div className="debt-icon">🎉</div>
        <div className="debt-info">
          <div className="debt-label">Không có thông tin học phí nào</div>
          <div className="debt-amount" style={{ fontSize: 18 }}>Liên hệ giáo viên</div>
        </div>
      </div>
    );
  }
  if (!unpaid.length) {
    return (
      <div className="debt-banner no-debt" id="debtBanner">
        <div className="debt-icon">✅</div>
        <div className="debt-info">
          <div className="debt-label">Tất cả học phí đã được đóng</div>
          <div className="debt-amount">Không nợ học phí</div>
          <div className="debt-sub">{paid.length} khoản đã đóng</div>
        </div>
      </div>
    );
  }
  const total = unpaid.reduce((sum, f) => sum + (f.amount || 0), 0);
  const pending = unpaid.filter((f) => f.studentNotified).length;
  return (
    <div className="debt-banner has-debt" id="debtBanner">
      <div className="debt-icon">⚠️</div>
      <div className="debt-info">
        <div className="debt-label">Tổng học phí cần đóng (cộng dồn {unpaid.length} kỳ chưa thanh toán)</div>
        <div className="debt-amount">{fmtVND(total)}</div>
        <div className="debt-sub">{pending > 0 ? `${pending} kỳ đang chờ xác nhận · ` : ''}Vui lòng chuyển khoản và bấm &quot;Đã chuyển khoản&quot;</div>
      </div>
    </div>
  );
}

function FeeStatus({ fee }) {
  if (fee.isPaid) {
    const day = fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('vi-VN') : '';
    return <span className="status-badge status-paid">✅ Đã đóng{day ? ` · ${day}` : ''}</span>;
  }
  if (fee.studentNotified) return <span className="status-badge status-notified">⏳ Đang xác nhận</span>;
  return <span className="status-badge status-unpaid">❌ Chưa đóng</span>;
}

function FeeCard({ fee, sending, onNotify }) {
  const state = fee.isPaid ? 'paid' : fee.studentNotified ? 'notified' : 'unpaid';
  return (
    <div className={`fee-card ${state}`} id={`fcard-${fee._id}`}>
      <div className="fee-period">
        <div className="fee-type-label">{typeLabel(fee)}</div>
        <div className="fee-period-text">{periodLabel(fee)}</div>
        {fee.note && <div className="fee-note">{fee.note}</div>}
      </div>
      <div className={`fee-amount ${fee.isPaid ? 'paid-color' : 'unpaid'}`}>{fmtVND(fee.amount)}</div>
      <FeeStatus fee={fee} />
      {state === 'unpaid' && (
        <button className="btn-notify" id={`nbtn-${fee._id}`} disabled={sending} onClick={() => onNotify(fee._id)}>
          {sending ? 'Đang gửi...' : '💸 Đã chuyển khoản'}
        </button>
      )}
    </div>
  );
}

function copyAccount(num) {
  navigator.clipboard.writeText(num)
    .then(() => siteToastTitled('success', 'Đã sao chép', 'Số tài khoản đã được sao chép vào clipboard', 2000))
    .catch(() => siteToastTitled('info', 'Số tài khoản', num, 4000));
}

function PaymentCard({ settings: s }) {
  const [qrFailed, setQrFailed] = useState(false);
  if (!s.bankAccount && !s.bankName) return null;
  return (
    <div className="payment-card" id="paymentCard">
      <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}><i className="fas fa-university" /> Thông tin chuyển khoản</h3>
      <div className="payment-layout">
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="bank-info" id="bankInfoBody">
            {s.bankName && <div className="bank-row"><span className="bank-label">🏦 Ngân hàng</span><span className="bank-value">{s.bankName}</span></div>}
            {s.accountName && <div className="bank-row"><span className="bank-label">👤 Chủ tài khoản</span><span className="bank-value">{s.accountName}</span></div>}
            {s.bankAccount && (
              <div className="bank-row">
                <span className="bank-label">💳 Số tài khoản</span>
                <span className="bank-account-num">
                  {s.bankAccount}
                  <button className="copy-btn" title="Sao chép" onClick={() => copyAccount(s.bankAccount)}><i className="fas fa-copy" /></button>
                </span>
              </div>
            )}
            {!!s.defaultMonthlyFee && <div className="bank-row"><span className="bank-label">💰 HP/tháng</span><span className="bank-value" style={{ color: '#16a34a' }}>{fmtVND(s.defaultMonthlyFee)}</span></div>}
          </div>
          {s.paymentNote && (
            <div className="payment-note" id="paymentNoteBody">
              📋 <strong>Hướng dẫn CK:</strong> {s.paymentNote.split('\n').map((line, i) => <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>)}
            </div>
          )}
        </div>
        {s.qrImageUrl && !qrFailed && (
          <div className="qr-wrap" id="qrWrap">
            <img id="qrImg" src={s.qrImageUrl} alt="QR ngân hàng" onError={() => setQrFailed(true)} />
            <div className="qr-caption">Quét mã để chuyển khoản</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tuition() {
  const [state, setState] = useState({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [paidOpen, setPaidOpen] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    let alive = true;
    // 20s: a cold-started backend must not leave the page stuck on "Đang tải"
    apiFetch('/tuition/my', { timeout: 20000 }).then((data) => {
      if (!alive) return;
      if (!data.success) throw new Error(data.message || 'Lỗi tải dữ liệu');
      setState({ status: 'ready', fees: data.fees || [], settings: data.settings || {} });
    }).catch((e) => {
      if (!alive) return;
      // A refresh that fails leaves the fees already on screen
      setState((s) => (s.status === 'ready' ? s : {
        status: 'error',
        message: e.coldStart ? 'Tải quá lâu — server có thể đang khởi động.' : e.message || 'Không tải được dữ liệu. Vui lòng thử lại.',
      }));
    });
    return () => { alive = false; };
  }, [attempt]);

  function retry() {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }

  async function notify(id) {
    setSendingId(id);
    try {
      const data = await apiFetch(`/tuition/${id}/notify`, { method: 'POST' });
      siteToastTitled('success', 'Đã gửi thông báo', data.message || 'Admin sẽ xác nhận thanh toán của bạn sớm nhất!');
      setState((s) => ({ ...s, fees: s.fees.map((f) => (f._id === id ? { ...f, studentNotified: true } : f)) }));
      // The admin may have confirmed this fee meanwhile: show what the server has
      setAttempt((n) => n + 1);
    } catch (e) {
      siteToastTitled('error', 'Lỗi', e.message || 'Không gửi được');
    } finally {
      setSendingId(null);
    }
  }

  const fees = state.fees || [];
  const unpaid = fees.filter((f) => !f.isPaid);
  const paid = fees.filter((f) => f.isPaid);
  const card = (f) => <FeeCard key={f._id} fee={f} sending={sendingId === f._id} onNotify={notify} />;

  return (
    <div className="tuition-layout">
      <div className="tuition-hero pf-hero pf-hero-green" data-mascot="wink">
        <div className="pf-hero-body">
          <h1>Học phí <span className="pf-tag">của bạn</span></h1>
          <p className="pf-hero-sub">Xem các khoản học phí cần đóng, đã đóng và thông tin chuyển khoản.</p>
        </div>
      </div>

      <div className="policy-note">
        <i className="fas fa-circle-info" />
        <span>Học viên vui lòng thanh toán học phí trong tuần đầu tiên (7 ngày) kể từ ngày khai giảng khóa học.</span>
      </div>

      {state.status === 'loading' && (
        <div className="debt-banner loading" id="debtBanner">
          <div className="debt-icon">💰</div>
          <div className="debt-info">
            <div className="debt-label">Đang tải thông tin học phí...</div>
            <div className="debt-amount" style={{ fontSize: 18, opacity: 0.5 }}>–</div>
          </div>
        </div>
      )}
      {state.status === 'error' && (
        <div className="debt-banner loading" id="debtBanner">
          <div className="debt-icon">⚠️</div>
          <div className="debt-info">
            <div className="debt-label" style={{ color: '#dc2626' }}>{state.message}</div>
            <button onClick={retry} style={{ marginTop: 8, background: 'var(--brand,#e53935)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Thử lại</button>
          </div>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <DebtBanner fees={fees} unpaid={unpaid} paid={paid} />

          {unpaid.length > 0 && (
            <div id="unpaidSection" style={{ marginBottom: 28 }}>
              <div className="section-title"><i className="fas fa-exclamation-circle" style={{ color: '#dc2626' }} /> Học phí chưa đóng</div>
              <div id="unpaidList">{unpaid.map(card)}</div>
            </div>
          )}

          {paid.length > 0 && (
            <div id="paidSection">
              <button className="paid-toggle" onClick={() => setPaidOpen((o) => !o)}>
                <i className="fas fa-chevron-right" id="paidToggleIcon" style={paidOpen ? { transform: 'rotate(90deg)' } : undefined} />
                <span id="paidToggleLabel">{paidOpen ? 'Ẩn học phí đã đóng' : `Xem ${paid.length} khoản học phí đã đóng`}</span>
              </button>
              {paidOpen && <div id="paidList">{paid.map(card)}</div>}
            </div>
          )}

          {!fees.length && (
            <div className="empty-state" id="emptyState">
              <i className="fas fa-receipt" />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Chưa có thông tin học phí</div>
              <div style={{ fontSize: 14 }}>Liên hệ giáo viên để được cập nhật thông tin học phí.</div>
            </div>
          )}

          <PaymentCard settings={state.settings} />
        </>
      )}
    </div>
  );
}
