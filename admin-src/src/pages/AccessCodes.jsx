import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

const TEST_TYPES = [
  { value: '', label: 'Tất cả kỹ năng' },
  { value: 'reading', label: '📖 Reading' },
  { value: 'listening', label: '🎧 Listening' },
  { value: 'writing', label: '✏️ Writing' },
];

function keyStatus(k) {
  const expired = k.expiresAt && new Date() > new Date(k.expiresAt);
  const used = k.currentUses >= k.maxUses;
  if (!k.isActive) return { label: 'Vô hiệu', cls: 'badge-gray' };
  if (expired)     return { label: 'Hết hạn', cls: 'badge-gray' };
  if (used)        return { label: 'Hết lượt', cls: 'badge-gray' };
  return { label: 'Còn dùng', cls: 'badge-green' };
}

function typeLabel(t) {
  const map = { reading: '📖 Reading', listening: '🎧 Listening', writing: '✏️ Writing' };
  return map[t] || (t ? t : <span style={{ color: 'var(--text3)' }}>Tất cả</span>);
}

export default function AccessCodes() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [keys, setKeys] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ count: 1, maxUses: 1, expiryDays: '', testType: '' });
  const [saving, setSaving] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState([]);

  const load = () => apiFetch('/admin/keys').then(d => setKeys(d.keys || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = keys.filter(k => {
    if (search && !(k.key || '').toLowerCase().includes(search.toLowerCase()) && !(k.testId?.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && (k.testType || '') !== typeFilter) return false;
    if (statusFilter === 'active') {
      const expired = k.expiresAt && new Date() > new Date(k.expiresAt);
      if (!k.isActive || k.currentUses >= k.maxUses || expired) return false;
    }
    if (statusFilter === 'inactive') {
      const expired = k.expiresAt && new Date() > new Date(k.expiresAt);
      if (k.isActive && k.currentUses < k.maxUses && !expired) return false;
    }
    return true;
  });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        count: Number(form.count) || 1,
        maxUses: Number(form.maxUses) || 1,
        testType: form.testType || null,
        expiryDays: form.expiryDays ? Number(form.expiryDays) : null,
      };
      const d = await apiFetch('/admin/keys/generate', { method: 'POST', body: JSON.stringify(body) });
      toast(`Đã tạo ${d.keys?.length || 0} mã`);
      setGeneratedKeys(d.keys || []);
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  function closeModal() {
    setShowModal(false);
    setGeneratedKeys([]);
    setForm({ count: 1, maxUses: 1, expiryDays: '', testType: '' });
  }

  function del(id, key) {
    confirm(`Vô hiệu hoá mã "${key}"?`, async () => {
      try { await apiFetch(`/admin/keys/${id}`, { method: 'DELETE' }); toast('Đã vô hiệu hoá'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function copyAll() {
    navigator.clipboard.writeText(generatedKeys.join('\n'))
      .then(() => toast('Đã copy tất cả mã'))
      .catch(() => toast('Không thể copy', 'error'));
  }

  function copyKey(key) {
    navigator.clipboard.writeText(key)
      .then(() => toast(`Đã copy: ${key}`))
      .catch(() => {});
  }

  return (
    <>
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Tạo mã truy cập mới</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {generatedKeys.length > 0 ? (
              <div style={{ padding: '20px 24px' }}>
                <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--green)' }}>✓ Đã tạo {generatedKeys.length} mã:</div>
                <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 2, maxHeight: 240, overflowY: 'auto' }}>
                  {generatedKeys.map((k, i) => (
                    <div key={i} style={{ color: 'var(--blue)', letterSpacing: 1, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onClick={() => copyKey(k)} title="Click để copy">
                      {k}
                      <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>copy</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={copyAll}>📋 Copy tất cả</button>
                  <button className="btn btn-primary" onClick={closeModal}>Đóng</button>
                </div>
              </div>
            ) : (
              <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Số lượng mã</label>
                    <input className="form-input" type="number" min={1} max={100} value={form.count} onChange={set('count')} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Lượt dùng / mã</label>
                    <input className="form-input" type="number" min={1} value={form.maxUses} onChange={set('maxUses')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Kỹ năng</label>
                  <select className="form-input" value={form.testType} onChange={set('testType')}>
                    {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hạn sử dụng (số ngày, để trống = không hạn)</label>
                  <input className="form-input" type="number" min={1} value={form.expiryDays} onChange={set('expiryDays')} placeholder="VD: 30" />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={closeModal}>Huỷ</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo mã'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">Mã truy cập ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tạo mã mới</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="form-input search-input" placeholder="Tìm mã, tên đề..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 160 }}>
          {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Còn dùng</option>
          <option value="inactive">Hết lượt / Vô hiệu</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>MÃ</th><th>KỸ NĂNG / ĐỀ THI</th><th>LƯỢT DÙNG</th><th>TRẠNG THÁI</th><th>HẠN DÙNG</th><th>NGÀY TẠO</th>{isAdmin && <th>TẠO BỞI</th>}<th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="table-empty">Không có mã nào</td></tr>
              : filtered.map(k => {
                const pct = k.maxUses ? Math.min(100, Math.round((k.currentUses / k.maxUses) * 100)) : 0;
                const { label: stLabel, cls: stCls } = keyStatus(k);
                return (
                  <tr key={k._id}>
                    <td>
                      <code style={{ fontFamily: 'var(--mono)', color: 'var(--blue)', fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}
                        onClick={() => copyKey(k.key)} title="Click để copy">
                        {k.key}
                      </code>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <div>{typeLabel(k.testType)}</div>
                      {k.testId?.name && <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 2 }}>{k.testId.name}</div>}
                    </td>
                    <td style={{ minWidth: 110 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{k.currentUses ?? 0} / {k.maxUses ?? '∞'}</div>
                      {k.maxUses > 0 && (
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--accent)' : 'var(--green)', borderRadius: 2, transition: 'width .3s' }} />
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${stCls}`}>
                        <span className="dot" />{stLabel}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{k.expiresAt ? formatDate(k.expiresAt).split(' ')[0] : '–'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(k.createdAt).split(' ')[0]}</td>
                    {isAdmin && <td style={{ fontSize: 12, color: 'var(--text3)' }}>{k.createdBy?.username || '–'}</td>}
                    <td>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(k._id, k.key)} title="Vô hiệu hoá">🗑</button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}
