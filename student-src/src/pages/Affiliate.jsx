import { useEffect, useRef, useState } from 'react';
import { API, apiFetch } from '../utils/api';
import { siteConfirm } from '../utils/shell';

// 📢 Giới thiệu bạn bè — /app/affiliate, under "BXH vocab" in the menu
// (backend/services/affiliateService.js): the referral link, what it has
// earned, the people who joined through it, and the withdrawal form.
// It was the Hồ sơ → Affiliate tab; /app/profile?tab=affiliate redirects here.

const SLOW = { timeout: 90000 };
// Each /affiliate/me answer gets a new id: the payout form restarts from it
// (bank fields, QR), never from the answer before a submit.
let loadSeq = 0;
const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}đ`;
const day = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '–');
const toast = (type, title, msg) => window.showToastWithTitle?.(type, title, msg);

const PAYOUT_STATUS = {
  pending: { cls: 'aff-pill--wait', text: '⏳ Chờ chuyển' },
  paid: { cls: 'aff-pill--ok', text: '✅ Đã chuyển' },
  rejected: { cls: 'aff-pill--bad', text: '❌ Từ chối' },
};

function referralLink(code) {
  return `${window.location.origin}/?ref=${encodeURIComponent(code)}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Older browsers / no permission: the hidden-textarea fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } finally { ta.remove(); }
  }
}

function Stat({ icon, label, value, accent }) {
  return (
    <div className={`aff-stat${accent ? ' aff-stat--accent' : ''}`}>
      <div className="aff-stat-label">{icon} {label}</div>
      <div className="aff-stat-value">{value}</div>
    </div>
  );
}

function Guide({ settings: s }) {
  return (
    <details className="aff-guide">
      <summary><i className="fas fa-circle-question" /> Affiliate là gì? Cách kiếm tiền</summary>
      <p><b>Affiliate</b> là chương trình giới thiệu học viên. Bạn chia sẻ <b>link giới thiệu</b>, người khác đăng ký
        tài khoản mới qua link đó, và bạn được thưởng khi họ thanh toán:</p>
      <ul>
        <li><b>Gói Premium:</b> nhận <b>{s.premiumPercent}%</b> giá mỗi gói họ mua — kể cả mọi lần gia hạn sau này.</li>
        <li><b>Đăng ký học:</b> khi họ đóng khoản học phí đầu tiên, bạn chọn 1 trong 2:
          nhận <b>{vnd(s.tuitionCash)}</b> vào ví, hoặc <b>trừ {vnd(s.tuitionCredit)}</b> vào học phí của bạn
          (nếu bạn cũng đăng ký học). Mỗi người bạn giới thiệu được thưởng 1 lần.</li>
      </ul>
      <ol>
        <li>Bấm <b>Sao chép link</b> bên dưới.</li>
        <li>Gửi link cho bạn bè qua Zalo, Facebook, Messenger…</li>
        <li>Bạn bè đăng ký <b>tài khoản mới</b> qua link (trong vòng 30 ngày kể từ lúc bấm link).</li>
        <li>Khi họ thanh toán và được admin xác nhận, thưởng hiện ở trang này.</li>
        <li>Ví đủ <b>{vnd(s.minPayout)}</b> thì gửi yêu cầu rút tiền về ngân hàng.</li>
      </ol>
    </details>
  );
}

// A referred student's first tuition payment: money or a discount, once
function RewardChoices({ rewards, onDone }) {
  const [busy, setBusy] = useState('');
  if (!rewards.length) return null;

  function choose(r, choice) {
    const title = choice === 'cash' ? `Nhận ${vnd(r.cashAmount)} vào ví?` : `Trừ ${vnd(r.creditAmount)} vào học phí?`;
    const msg = choice === 'cash'
      ? 'Tiền vào ví Affiliate, đủ mức tối thiểu thì rút về ngân hàng. Chọn rồi thì không đổi được.'
      : 'Số tiền được trừ vào khoản học phí chưa đóng của bạn (hoặc khoản tiếp theo admin nhập). Chọn rồi thì không đổi được.';
    siteConfirm(title, msg, 'Chọn', () => send(r, choice));
  }

  async function send(r, choice) {
    setBusy(`${r.id}:${choice}`);
    try {
      await apiFetch(`/affiliate/rewards/${r.id}/choose`, { method: 'POST', body: JSON.stringify({ choice }) });
      toast('success', 'Đã chọn', choice === 'cash' ? `+${vnd(r.cashAmount)} đã vào ví của bạn` : `Đã ghi giảm ${vnd(r.creditAmount)} vào học phí của bạn`);
      onDone();
    } catch (e) {
      toast('error', 'Lỗi', e.message || 'Không chọn được, thử lại nhé');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="card mt-16 aff-rewards" id="affRewards">
      <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-gift" /> Chọn phần thưởng ({rewards.length})</span></div>
      <div className="card-body">
        {rewards.map((r) => (
          <div className="aff-reward" key={r.id}>
            <div className="aff-reward-info">
              <b>{r.buyer}</b> đã đăng ký học và đóng {r.description}.
              <div className="aff-sub">Chọn 1 trong 2 — chọn rồi thì không đổi được.</div>
            </div>
            <div className="aff-reward-actions">
              {r.cashAmount > 0 && (
                <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => choose(r, 'cash')}>
                  <i className="fas fa-wallet" /> Nhận {vnd(r.cashAmount)} vào ví
                </button>
              )}
              {r.creditAmount > 0 && (
                <button type="button" className="btn btn-ghost aff-reward-credit" disabled={!!busy} onClick={() => choose(r, 'credit')}>
                  <i className="fas fa-graduation-cap" /> Trừ {vnd(r.creditAmount)} học phí
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// "Đơn hàng" + "Hoa hồng" cells of one history row
function rewardCells(c) {
  if (c.kind !== 'tuition_flat') {
    return [<>{c.description}<div className="aff-sub">{vnd(c.baseAmount)} × {c.percent}%</div></>, <b>+{vnd(c.amount)}</b>];
  }
  const what = <>Đăng ký học · {c.description}</>;
  if (c.status === 'awaiting_choice') return [what, <span className="aff-pill aff-pill--wait">🎁 Chờ bạn chọn</span>];
  if (c.rewardChoice === 'credit') {
    return [what, <>
      <b>−{vnd(c.creditAmount)} học phí</b>
      <div className="aff-sub">{c.creditFee ? `Đã trừ vào ${c.creditFee}` : 'Sẽ trừ vào khoản học phí tiếp theo của bạn'}</div>
    </>];
  }
  return [what, <b>+{vnd(c.amount || c.cashAmount)}</b>];
}

// A server from before the Premium / học phí split only sends `percent`
function withDefaults(s = {}) {
  return { tuitionCash: 200000, tuitionCredit: 300000, ...s, premiumPercent: s.premiumPercent ?? s.percent ?? 20 };
}

const MAX_QR_BYTES = 5 * 1024 * 1024;

// Scan-to-pay QR from the student's bank app: the admin scans it to transfer,
// so the typed bank fields become optional. Saved on the account (not per
// request), so it can be set up before there is anything to withdraw.
function BankQr({ url, onChange }) {
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  async function upload(e) {
    const file = e.target.files[0];
    e.target.value = ''; // the same file can be picked again
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) { toast('warning', 'Sai định dạng', 'Chỉ nhận ảnh PNG, JPG hoặc WebP'); return; }
    if (file.size > MAX_QR_BYTES) { toast('warning', 'Ảnh quá lớn', 'Ảnh QR tối đa 5MB'); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('qr', file);
      // multipart: no JSON Content-Type, so not apiFetch
      const res = await fetch(`${API}/affiliate/bank-qr`, {
        method: 'POST', body: fd, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.success) throw new Error(d.message || `HTTP ${res.status}`);
      onChange(d.qrImageUrl);
      toast('success', 'Đã lưu mã QR', 'Admin sẽ quét mã này để chuyển tiền cho bạn');
    } catch (err) {
      toast('error', 'Chưa tải được ảnh', err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await apiFetch('/affiliate/bank-qr', { method: 'DELETE' });
      onChange('');
    } catch (err) {
      toast('error', 'Chưa xóa được', err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="aff-qr">
      {url
        ? <a href={url} target="_blank" rel="noopener noreferrer" className="aff-qr-img"><img src={url} alt="Mã QR ngân hàng của bạn" /></a>
        : <div className="aff-qr-img aff-qr-empty"><i className="fas fa-qrcode" /></div>}
      <div className="aff-qr-body">
        <b>Mã QR nhận tiền</b>
        <div className="aff-sub">Chụp màn hình mã QR trong app ngân hàng (mục "Nhận tiền") rồi tải lên. Có QR thì không cần nhập số tài khoản.</div>
        <div className="aff-qr-actions">
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={upload} />
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => input.current?.click()}>
            <i className="fas fa-upload" /> {busy ? 'Đang tải…' : url ? 'Đổi ảnh QR' : 'Tải ảnh QR lên'}
          </button>
          {url && <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={remove}><i className="fas fa-trash" /> Xóa</button>}
        </div>
      </div>
    </div>
  );
}

function PayoutForm({ data, onDone }) {
  const { stats, settings, bank } = data;
  const pending = data.payouts.some((p) => p.status === 'pending');
  const [form, setForm] = useState(() => ({ ...bank, amount: String(Math.max(0, stats.balance)) }));
  const [busy, setBusy] = useState(false);
  const [qr, setQr] = useState(bank.qrImageUrl || '');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canAsk = !pending && stats.balance >= settings.minPayout;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await apiFetch('/affiliate/payouts', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }), ...SLOW });
      toast('success', 'Đã gửi yêu cầu', r.message);
      onDone();
    } catch (err) {
      toast('error', 'Chưa gửi được', err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-16">
      <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-money-bill-transfer" /> Rút tiền về ngân hàng</span></div>
      <div className="card-body">
        {pending && <p className="aff-note">Bạn đang có một yêu cầu rút tiền chờ admin chuyển khoản.</p>}
        {!pending && stats.balance < settings.minPayout && (
          <p className="aff-note">Số dư cần đạt tối thiểu <b>{vnd(settings.minPayout)}</b> để rút (hiện có {vnd(stats.balance)}).</p>
        )}
        <BankQr url={qr} onChange={setQr} />
        <form onSubmit={submit}>
          <div className="aff-sub" style={{ margin: '4px 0 10px' }}>{qr ? 'Thông tin ngân hàng (không bắt buộc khi đã có QR):' : 'Hoặc nhập thông tin ngân hàng:'}</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="affBank">Ngân hàng</label>
              <input className="form-control" id="affBank" placeholder="VD: Vietcombank" maxLength={80} value={form.bankName} onChange={set('bankName')} disabled={!canAsk} required={!qr} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="affAcc">Số tài khoản</label>
              <input className="form-control" id="affAcc" inputMode="numeric" maxLength={40} value={form.bankAccount} onChange={set('bankAccount')} disabled={!canAsk} required={!qr} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="affName">Tên chủ tài khoản</label>
              <input className="form-control" id="affName" placeholder="NGUYEN VAN A" maxLength={80} value={form.accountName} onChange={set('accountName')} disabled={!canAsk} required={!qr} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="affAmount">Số tiền rút (đ)</label>
              <input className="form-control" id="affAmount" type="number" min={settings.minPayout} max={stats.balance} step={1000} value={form.amount} onChange={set('amount')} disabled={!canAsk} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={!canAsk || busy}>
            <i className="fas fa-paper-plane" /> {busy ? 'Đang gửi…' : 'Gửi yêu cầu rút tiền'}
          </button>
        </form>

        {data.payouts.length > 0 && (
          <div className="aff-table-wrap mt-16">
            <table className="aff-table">
              <thead><tr><th>Ngày</th><th>Số tiền</th><th>Tài khoản</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {data.payouts.map((p) => {
                  const st = PAYOUT_STATUS[p.status] || PAYOUT_STATUS.pending;
                  return (
                    <tr key={p.id}>
                      <td>{day(p.createdAt)}</td>
                      <td><b>{vnd(p.amount)}</b></td>
                      <td>
                        {[p.bankName, p.bankAccount].filter(Boolean).join(' · ') || (p.qrImageUrl ? '' : '–')}
                        {p.qrImageUrl && <div><a href={p.qrImageUrl} target="_blank" rel="noopener noreferrer"><i className="fas fa-qrcode" /> Mã QR</a></div>}
                      </td>
                      <td>
                        <span className={`aff-pill ${st.cls}`}>{st.text}</span>
                        {p.adminNote && <div className="aff-sub">{p.adminNote}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Affiliate() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    apiFetch('/affiliate/me', SLOW)
      .then((d) => { if (alive) { setData({ ...d, settings: withDefaults(d.settings), loadId: (loadSeq += 1) }); setError(''); } })
      .catch((e) => { if (alive) setError(e.message || 'Không tải được dữ liệu Affiliate'); });
    return () => { alive = false; };
  }, [version]);

  const link = data ? referralLink(data.code) : '';

  async function copy() {
    await copyText(link);
    setCopied(true);
    toast('success', 'Đã sao chép', 'Gửi link này cho bạn bè nhé!');
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: 'English with Dan', text: 'Học IELTS cùng English with Dan — đăng ký qua link của mình nhé:', url: link }); } catch { /* cancelled */ }
    } else copy();
  }

  return (
    <div className="aff-layout" id="affiliatePage">
      <div className="pf-hero pf-hero-orange" data-mascot="excited">
        <div className="pf-hero-body">
          <h1>Giới thiệu <span className="pf-tag">bạn bè</span></h1>
          <p className="pf-hero-sub">Gửi link giới thiệu cho bạn bè — khi họ đăng ký và thanh toán, bạn nhận hoa hồng vào ví rồi rút về ngân hàng.</p>
        </div>
      </div>

      {error && !data && (
        <div className="card"><div className="card-body">
          <p className="aff-note">{error}</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setVersion((v) => v + 1)}>Thử lại</button>
        </div></div>
      )}
      {!data && !error && <div className="card"><div className="card-body">Đang tải…</div></div>}

      {data && (
        <>
          {!data.settings.enabled && <p className="aff-note">Chương trình Affiliate đang tạm dừng — link vẫn giữ nguyên, hoa hồng mới sẽ được tính khi chương trình mở lại.</p>}

          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 700 }}><i className="fas fa-bullhorn" /> Giới thiệu bạn bè — Premium {data.settings.premiumPercent}% · Đăng ký học {vnd(data.settings.tuitionCash)}/người</span>
            </div>
            <div className="card-body">
              <Guide settings={data.settings} />
              <label className="form-label" htmlFor="affLink">Link giới thiệu của bạn</label>
              <div className="aff-link-row">
                <input className="form-control" id="affLink" readOnly value={link} onFocus={(e) => e.target.select()} />
                <button type="button" className="btn btn-primary" onClick={copy}>
                  <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} /> {copied ? 'Đã chép' : 'Sao chép link'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={share}><i className="fas fa-share-nodes" /> Chia sẻ</button>
              </div>
              <div className="aff-sub">Mã giới thiệu: <b>{data.code}</b></div>
            </div>
          </div>

          <RewardChoices rewards={data.commissions.filter((c) => c.status === 'awaiting_choice')} onDone={() => setVersion((v) => v + 1)} />

          <div className="aff-stats mt-16">
            <Stat icon="👆" label="Lượt bấm link" value={data.stats.clicks} />
            <Stat icon="🙋" label="Đăng ký qua link" value={data.stats.signups} />
            <Stat icon="🛒" label="Đã thanh toán" value={`${data.stats.buyers} người`} />
            <Stat icon="💰" label="Tổng hoa hồng" value={vnd(data.stats.earned)} />
            <Stat icon="🏦" label="Đã rút" value={vnd(data.stats.paid)} />
            <Stat icon="👛" label="Số dư khả dụng" value={vnd(data.stats.balance)} accent />
          </div>
          {data.stats.credited > 0 && <p className="aff-sub mt-16">🎓 Đã chọn trừ học phí: <b>{vnd(data.stats.credited)}</b> (xem cột Hoa hồng bên dưới).</p>}

          <PayoutForm key={data.loadId} data={data} onDone={() => setVersion((v) => v + 1)} />

          <div className="card mt-16">
            <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-coins" /> Lịch sử hoa hồng</span></div>
            <div className="card-body">
              {data.commissions.length === 0
                ? <p className="aff-empty">Chưa có hoa hồng nào. Chia sẻ link để bắt đầu nhé!</p>
                : (
                  <div className="aff-table-wrap">
                    <table className="aff-table">
                      <thead><tr><th>Ngày</th><th>Người mua</th><th>Đơn hàng</th><th>Hoa hồng</th></tr></thead>
                      <tbody>
                        {data.commissions.map((c) => (
                          <tr key={c.id} className={c.status === 'cancelled' ? 'aff-row-cancelled' : ''}>
                            <td>{day(c.createdAt)}</td>
                            <td>{c.buyer}</td>
                            <td>{rewardCells(c)[0]}</td>
                            <td>
                              {rewardCells(c)[1]}
                              {c.status === 'cancelled' && <div className="aff-sub">Đã hủy{c.cancelReason ? `: ${c.cancelReason}` : ''}</div>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>

          <div className="card mt-16">
            <div className="card-header"><span style={{ fontWeight: 700 }}><i className="fas fa-users" /> Người bạn đã giới thiệu ({data.referrals.length})</span></div>
            <div className="card-body">
              {data.referrals.length === 0
                ? <p className="aff-empty">Chưa có ai đăng ký qua link của bạn.</p>
                : (
                  <div className="aff-table-wrap">
                    <table className="aff-table">
                      <thead><tr><th>Tên</th><th>Ngày tham gia</th><th>Đã thanh toán</th><th>Hoa hồng</th></tr></thead>
                      <tbody>
                        {data.referrals.map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            <td>{day(r.joinedAt)}</td>
                            <td>{r.orders ? `${vnd(r.paid)} (${r.orders} đơn)` : 'Chưa mua'}</td>
                            <td>{vnd(r.commission)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
