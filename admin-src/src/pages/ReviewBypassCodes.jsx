import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/ConfirmDialog';

// Codes a teacher hands a student to skip the mandatory post-test Review
// gate. Redeeming one (public POST /api/review/bypass) marks all that
// student's pending reviews 'bypassed'. Full mock test is unaffected.
export default function ReviewBypassCodes() {
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [tick, setTick] = useState(0);
  const [form, setForm] = useState({ label: '', code: '', maxUses: '1', expiresAt: '' });

  const reload = () => setTick(t => t + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await apiFetch('/admin/review-bypass-codes');
        if (!cancelled) setCodes(d.codes || []);
      } catch (e) {
        if (!cancelled) toast(e.message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  async function create(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const body = {
        label: form.label.trim(),
        maxUses: form.maxUses === '' ? 1 : Number(form.maxUses),
        expiresAt: form.expiresAt || null,
      };
      if (form.code.trim()) body.code = form.code.trim();
      const d = await apiFetch('/admin/review-bypass-codes', { method: 'POST', body: JSON.stringify(body) });
      toast(`Đã tạo mã ${d.code.code}`);
      setForm({ label: '', code: '', maxUses: '1', expiresAt: '' });
      reload();
    } catch (e) { toast(e.message, 'error'); }
    finally { setCreating(false); }
  }

  async function toggleActive(c) {
    setCodes(prev => prev.map(x => (x._id === c._id ? { ...x, active: !c.active } : x)));
    try {
      await apiFetch(`/admin/review-bypass-codes/${c._id}`, {
        method: 'PATCH', body: JSON.stringify({ active: !c.active }),
      });
    } catch (e) {
      setCodes(prev => prev.map(x => (x._id === c._id ? { ...x, active: c.active } : x)));
      toast(e.message, 'error');
    }
  }

  function remove(c) {
    confirm(`Xoá vĩnh viễn mã ${c.code}?`, async () => {
      try {
        await apiFetch(`/admin/review-bypass-codes/${c._id}`, { method: 'DELETE' });
        setCodes(prev => prev.filter(x => x._id !== c._id));
        toast('Đã xoá');
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function copy(code) {
    navigator.clipboard?.writeText(code).then(
      () => toast(`Đã copy: ${code}`),
      () => toast('Không copy được', 'error'),
    );
  }

  const activeCount = codes.filter(c => c.redeemable).length;
  const PANEL = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ── Intro callout ── */}
      <div style={{
        ...PANEL, display: 'flex', gap: 12, padding: '14px 16px',
        borderLeft: '3px solid var(--blue)', fontSize: 13, lineHeight: 1.6, color: 'var(--text2)',
      }}>
        <span style={{ fontSize: 18, lineHeight: 1.3 }}>🎫</span>
        <div>
          Mã cho học sinh nhập để <strong style={{ color: 'var(--text)' }}>bỏ qua yêu cầu Review</strong> (ép
          review sau mỗi 3 bài). Học sinh nhập ở màn hình bị chặn của Reading / Listening.
          Mỗi học sinh chỉ dùng được <strong style={{ color: 'var(--text)' }}>1 lần / mã</strong>.
          <br />
          Thi thử Full 4 kỹ năng không bị ràng buộc bởi review nên không cần mã.
        </div>
      </div>

      {/* ── Create form ── */}
      <form onSubmit={create} style={{ ...PANEL, padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text3)', marginBottom: 14 }}>
          Tạo mã mới
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, alignItems: 'end' }}>
          <Field label="Ghi chú">
            <input className="form-input" value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="VD: Lớp A2 – tuần 3" />
          </Field>
          <Field label="Mã" hint="Bỏ trống = tự tạo">
            <input className="form-input" value={form.code} maxLength={16}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="TỰ ĐỘNG"
              style={{ fontFamily: 'var(--mono)', letterSpacing: '1.5px', textTransform: 'uppercase' }} />
          </Field>
          <Field label="Số lượt" hint="0 = không giới hạn">
            <input className="form-input" type="number" min="0" value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
          </Field>
          <Field label="Hết hạn" hint="Tuỳ chọn">
            <input className="form-input" type="date" value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
          </Field>
          <button className="btn btn-primary" disabled={creating}>
            {creating ? 'Đang tạo…' : '+ Tạo mã'}
          </button>
        </div>
      </form>

      {/* ── Codes table ── */}
      <div>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Danh sách mã
            {!loading && (
              <span style={{ color: 'var(--text3)', fontWeight: 500, marginLeft: 8 }}>
                {codes.length} mã · {activeCount} dùng được
              </span>
            )}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Ghi chú</th>
                <th>Lượt dùng</th>
                <th>Hết hạn</th>
                <th>Tạo lúc</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="table-empty">Đang tải…</td></tr>
              ) : codes.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">Chưa có mã nào. Tạo mã đầu tiên ở trên.</td></tr>
              ) : codes.map(c => (
                <tr key={c._id} style={{ opacity: c.active ? 1 : 0.5 }}>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => copy(c.code)}
                      title="Copy mã"
                      style={{ fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '1.5px', gap: 8 }}
                    >
                      {c.code}<span style={{ opacity: 0.6 }}>📋</span>
                    </button>
                  </td>
                  <td>{c.label || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <strong>{c.usedCount}</strong>
                    <span style={{ color: 'var(--text3)' }}>{c.maxUses === 0 ? ' / ∞' : ` / ${c.maxUses}`}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {c.expiresAt ? formatDate(c.expiresAt) : <span style={{ color: 'var(--text3)' }}>—</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text2)' }}>{formatDate(c.createdAt)}</td>
                  <td>
                    {!c.active
                      ? <span className="badge badge-gray"><span className="dot" />Đã khoá</span>
                      : c.redeemable
                        ? <span className="badge badge-green"><span className="dot" />Dùng được</span>
                        : <span className="badge badge-yellow"><span className="dot" />Hết lượt / hạn</span>}
                  </td>
                  <td>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className={`btn btn-sm ${c.active ? 'btn-ghost' : 'btn-success'}`}
                        onClick={() => toggleActive(c)}
                      >
                        {c.active ? 'Khoá' : 'Mở lại'}
                      </button>
                      {isAdmin && (
                        <button className="btn btn-sm btn-danger" onClick={() => remove(c)}>Xoá</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text)' }}>
        {label}
        {hint && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text3)', marginLeft: 6 }}>{hint}</span>}
      </span>
      {children}
    </label>
  );
}
