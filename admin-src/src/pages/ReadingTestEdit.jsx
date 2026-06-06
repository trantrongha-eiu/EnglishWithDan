import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

export default function ReadingTestEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = id === 'new';
  const goBack = () => navigate('/reading-tests');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', seriesName: '', testNumber: 1, isActive: true });

  const set = k => e => setForm(f => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked
       : e.target.type === 'number' ? Number(e.target.value)
       : e.target.value
  }));

  useEffect(() => {
    if (isNew) return;
    apiFetch('/admin/tests')
      .then(d => {
        const t = (d.tests || []).find(x => x._id === id);
        if (t) setForm({ name: t.name || '', seriesName: t.seriesName || '', testNumber: t.testNumber || 1, isActive: t.isActive !== false });
        else toast('Không tìm thấy bộ đề', 'error');
      })
      .catch(() => toast('Không tải được bộ đề', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast('Vui lòng nhập tên bộ đề', 'error'); return; }
    setSaving(true);
    try {
      if (isNew) await apiFetch('/admin/tests', { method: 'POST', body: JSON.stringify(form) });
      else await apiFetch(`/admin/tests/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      toast(isNew ? 'Đã tạo bộ đề' : 'Đã cập nhật bộ đề');
      setTimeout(() => goBack(), 600);
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button className="btn btn-ghost" onClick={() => goBack()}>← Đóng</button>
        <h2 style={{ margin: 0, fontSize: 20 }}>{isNew ? 'Thêm bộ đề Reading' : 'Sửa bộ đề Reading'}</h2>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">Tên bộ đề *</label>
            <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Orange Test 20" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tên series</label>
              <input className="form-input" value={form.seriesName} onChange={set('seriesName')} placeholder="Orange Test" />
            </div>
            <div className="form-group">
              <label className="form-label">Số đề</label>
              <input className="form-input" type="number" value={form.testNumber} onChange={set('testNumber')} min={1} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Kích hoạt
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => goBack()}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
        <strong>Lưu ý:</strong> Câu hỏi Reading được quản lý trực tiếp tại trang <strong>Bài đọc (Passages)</strong> — nhấn nút <strong>📝 Câu hỏi</strong> trên mỗi bài đọc.<br />
        Mỗi lần thi, hệ thống tự chọn ngẫu nhiên 3 passage theo category.
      </div>
    </div>
  );
}
