import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

export default function ReadingTestEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const isNew = id === 'new';
  // Captured once at mount so it survives any later same-route navigation
  // (e.g. the "new" -> real-id URL swap on autosave) that doesn't itself
  // carry the page number forward.
  const [returnPage] = useState(() => location.state?.page);
  const goBack = () => navigate('/reading-tests', returnPage ? { state: { page: returnPage } } : undefined);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', seriesName: '', testNumber: 1, isActive: true });
  // Passage picker for a FIXED test — one choice per category. Left blank
  // (all three empty) means "random" (readingService.startTest()'s
  // existing $sample behaviour); filling in all three pins the test to
  // those exact passages, in this order, every time.
  const [picks, setPicks] = useState({ passage1: '', passage2: '', passage3: '' });
  const [passagesByCat, setPassagesByCat] = useState({ passage1: [], passage2: [], passage3: [] });

  const set = k => e => setForm(f => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked
       : e.target.type === 'number' ? Number(e.target.value)
       : e.target.value
  }));

  useEffect(() => {
    // Only isActualTest passages are offered — those are the ones vetted
    // as full-test-quality content (same pool the random test already
    // draws from), not one-off practice-only passages.
    Promise.all(['passage1', 'passage2', 'passage3'].map(cat =>
      apiFetch(`/admin/passages?category=${cat}&limit=200`).then(d => (d.passages || []).filter(p => p.isActualTest))
    )).then(([p1, p2, p3]) => setPassagesByCat({ passage1: p1, passage2: p2, passage3: p3 }))
      .catch(() => toast('Không tải được danh sách bài đọc', 'error'));
  }, []);

  useEffect(() => {
    if (isNew) return;
    apiFetch(`/admin/tests/${id}`)
      .then(d => {
        const t = d.test;
        if (t) {
          setForm({ name: t.name || '', seriesName: t.seriesName || '', testNumber: t.testNumber || 1, isActive: t.isActive !== false });
          if ((t.passageIds || []).length === 3) {
            setPicks({ passage1: t.passageIds[0], passage2: t.passageIds[1], passage3: t.passageIds[2] });
          }
        }
        else toast('Không tìm thấy bộ đề', 'error');
      })
      .catch(() => toast('Không tải được bộ đề', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast('Vui lòng nhập tên bộ đề', 'error'); return; }
    const pickedCount = Object.values(picks).filter(Boolean).length;
    if (pickedCount > 0 && pickedCount < 3) {
      toast('Chọn đủ cả 3 passage cho bộ đề cố định, hoặc để trống cả 3 để dùng random', 'error');
      return;
    }
    const body = { ...form, passageIds: pickedCount === 3 ? [picks.passage1, picks.passage2, picks.passage3] : [] };
    setSaving(true);
    try {
      if (isNew) await apiFetch('/admin/tests', { method: 'POST', body: JSON.stringify(body) });
      else await apiFetch(`/admin/tests/${id}`, { method: 'PUT', body: JSON.stringify(body) });
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

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <label className="form-label" style={{ marginBottom: 8 }}>Passage cố định (tùy chọn)</label>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 12px' }}>
              Chọn đủ cả 3 để bộ đề luôn dùng đúng những passage này, theo đúng thứ tự 1 → 2 → 3
              (VD: "Actual Mocktest 1"). Để trống cả 3 để giữ hành vi cũ — hệ thống tự chọn ngẫu nhiên
              mỗi lần học sinh bắt đầu làm bài.
            </p>
            {['passage1', 'passage2', 'passage3'].map((cat, i) => (
              <div className="form-group" key={cat}>
                <label className="form-label">Passage {i + 1}</label>
                <select className="form-select" value={picks[cat]} onChange={e => setPicks(p => ({ ...p, [cat]: e.target.value }))}>
                  <option value="">— Random (mặc định) —</option>
                  {passagesByCat[cat].map(p => (
                    <option key={p._id} value={p._id}>{p.title}{p.tags?.length ? ` · ${p.tags.join(', ')}` : ''}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => goBack()}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>
        <strong>Lưu ý:</strong> Câu hỏi Reading được quản lý trực tiếp tại trang <strong>Bài đọc (Passages)</strong> — nhấn nút <strong>📝 Câu hỏi</strong> trên mỗi bài đọc.<br />
        Nếu không chọn passage cố định ở trên, mỗi lần thi hệ thống sẽ tự chọn ngẫu nhiên 3 passage theo category.
      </div>
    </div>
  );
}
