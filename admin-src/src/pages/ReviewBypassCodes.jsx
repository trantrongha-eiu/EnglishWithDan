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
    try {
      await apiFetch(`/admin/review-bypass-codes/${c._id}`, {
        method: 'PATCH', body: JSON.stringify({ active: !c.active }),
      });
      reload();
    } catch (e) { toast(e.message, 'error'); }
  }

  function remove(c) {
    confirm(`Xoá vĩnh viễn mã ${c.code}?`, async () => {
      try {
        await apiFetch(`/admin/review-bypass-codes/${c._id}`, { method: 'DELETE' });
        toast('Đã xoá');
        reload();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  function copy(code) {
    navigator.clipboard?.writeText(code).then(
      () => toast(`Đã copy: ${code}`),
      () => toast('Không copy được', 'error'),
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text2)' }}>
          Mã cho học sinh nhập để <strong>bỏ qua yêu cầu Review</strong> (ép review sau mỗi 3 bài).
          Học sinh nhập ở màn hình bị chặn của Reading / Listening. Mỗi học sinh chỉ dùng được 1 lần / mã.
          Thi thử Full 4 kỹ năng không bị ràng buộc bởi review nên không cần mã.
        </p>
        <form onSubmit={create} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          <label style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            Ghi chú
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="VD: Lớp A2 – tuần 3" style={{ padding: '7px 10px', minWidth: 180 }} />
          </label>
          <label style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            Mã (bỏ trống = tự tạo)
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="TỰ ĐỘNG" maxLength={16} style={{ padding: '7px 10px', width: 130, textTransform: 'uppercase', letterSpacing: 1 }} />
          </label>
          <label style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            Số lượt (0 = không giới hạn)
            <input type="number" min="0" value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              style={{ padding: '7px 10px', width: 90 }} />
          </label>
          <label style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            Hết hạn (tuỳ chọn)
            <input type="date" value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              style={{ padding: '6px 10px' }} />
          </label>
          <button className="btn btn-primary" disabled={creating} style={{ height: 34 }}>
            {creating ? 'Đang tạo…' : '+ Tạo mã'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>Đang tải…</div>
        ) : codes.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)' }}>Chưa có mã nào.</div>
        ) : (
          <table className="table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th>Mã</th><th>Ghi chú</th><th>Lượt dùng</th><th>Hết hạn</th>
                <th>Tạo lúc</th><th>Trạng thái</th><th></th>
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c._id} style={{ opacity: c.active ? 1 : 0.55 }}>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => copy(c.code)} title="Copy"
                      style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>
                      {c.code} 📋
                    </button>
                  </td>
                  <td>{c.label || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                  <td>{c.usedCount}{c.maxUses === 0 ? ' / ∞' : ` / ${c.maxUses}`}</td>
                  <td>{c.expiresAt ? formatDate(c.expiresAt) : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td>
                    {c.redeemable
                      ? <span className="badge badge-green">Dùng được</span>
                      : c.active
                        ? <span className="badge badge-red">Hết lượt/hạn</span>
                        : <span className="badge badge-gray">Đã khoá</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(c)}>
                      {c.active ? 'Khoá' : 'Mở lại'}
                    </button>
                    {isAdmin && (
                      <button className="btn btn-ghost btn-sm" onClick={() => remove(c)}
                        style={{ color: 'var(--danger, #dc2626)' }}>Xoá</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
