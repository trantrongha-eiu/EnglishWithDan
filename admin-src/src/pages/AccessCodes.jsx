import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

export default function AccessCodes() {
  const toast = useToast();
  const confirm = useConfirm();
  const [keys, setKeys] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ maxUses: 1, expiresAt: '', notes: '', code: '' });
  const [saving, setSaving] = useState(false);

  const load = () => apiFetch('/admin/keys').then(d => setKeys(d.keys || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = keys.filter(k => !search || k.code.toLowerCase().includes(search.toLowerCase()) || (k.notes || '').toLowerCase().includes(search.toLowerCase()));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/keys', { method: 'POST', body: JSON.stringify(form) });
      toast('Đã tạo mã truy cập');
      setShowModal(false);
      setForm({ maxUses: 1, expiresAt: '', notes: '', code: '' });
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  function del(id, code) {
    confirm(`Xóa mã "${code}"?`, async () => {
      try { await apiFetch(`/admin/keys/${id}`, { method: 'DELETE' }); toast('Đã xóa'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Tạo mã truy cập mới</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Mã (để trống = tự động)</label>
                <input className="form-input" value={form.code} onChange={set('code')} placeholder="AUTO-GENERATED" />
              </div>
              <div className="form-group">
                <label className="form-label">Số lượt dùng tối đa</label>
                <input className="form-input" type="number" min={1} value={form.maxUses} onChange={set('maxUses')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Hạn sử dụng (để trống = không hạn)</label>
                <input className="form-input" type="datetime-local" value={form.expiresAt} onChange={set('expiresAt')} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <input className="form-input" value={form.notes} onChange={set('notes')} placeholder="Ghi chú..." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo mã'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">Mã truy cập ({keys.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tạo mã mới</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="form-input search-input" placeholder="Tìm mã..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>MÃ</th><th>LƯỢT DÙNG</th><th>TỐI ĐA</th><th>HẠN DÙNG</th><th>GHI CHÚ</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="table-empty">Không có mã nào</td></tr>
              : filtered.map(k => (
                <tr key={k._id}>
                  <td><code style={{ fontFamily: 'var(--mono)', color: 'var(--blue)' }}>{k.code}</code></td>
                  <td>{k.usedCount ?? 0}</td>
                  <td>{k.maxUses ?? '∞'}</td>
                  <td style={{ fontSize: 12 }}>{k.expiresAt ? formatDate(k.expiresAt) : '–'}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>{k.notes || '–'}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(k.createdAt)}</td>
                  <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => del(k._id, k.code)}>🗑</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
