import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  { value: 'ielts', label: 'Luyện thi IELTS' },
  { value: 'speaking', label: 'Speaking chuyên sâu' },
  { value: 'comm', label: 'Giao tiếp' },
  { value: 'speaking ielts', label: 'Speaking + IELTS' },
];
const LEVEL_COLORS = [
  { value: 'red', label: 'Đỏ (Mất gốc)' },
  { value: 'blue', label: 'Xanh (Cơ bản)' },
  { value: 'green', label: 'Xanh lá (Nâng cao)' },
  { value: 'purple', label: 'Tím (Chuyên sâu)' },
];

const BLANK = {
  title: '', category: 'ielts', levelColor: 'blue', level: '', placeholder: '📚',
  subtitle: '', description: '', duration: '', classSize: '', price: '',
  orderIndex: 0, imageUrl: '', isActive: true,
};

function CourseModal({ course, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) setForm({
      title: course.title || '',
      category: course.category || 'ielts',
      levelColor: course.levelColor || 'blue',
      level: course.level || '',
      placeholder: course.placeholder || '📚',
      subtitle: course.subtitle || '',
      description: course.description || '',
      duration: course.duration || '',
      classSize: course.classSize || '',
      price: course.price || '',
      orderIndex: course.orderIndex ?? 0,
      imageUrl: course.imageUrl || '',
      isActive: course.isActive !== false,
    });
  }, [course]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, orderIndex: Number(form.orderIndex) || 0 };
      if (course?._id) await apiFetch(`/admin/courses/${course._id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await apiFetch('/admin/courses', { method: 'POST', body: JSON.stringify(body) });
      toast(course?._id ? 'Đã cập nhật khóa học' : 'Đã tạo khóa học');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{course?._id ? 'Sửa khóa học' : 'Thêm khóa học'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên khóa học *</label>
            <input className="form-input" value={form.title} onChange={set('title')} required placeholder="IELTS Mất Gốc → 6.0+" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Danh mục *</label>
              <select className="form-input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Màu level</label>
              <select className="form-input" value={form.levelColor} onChange={set('levelColor')}>
                {LEVEL_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Cấp độ / Label</label>
              <input className="form-input" value={form.level} onChange={set('level')} placeholder="Mất gốc / Nâng cao..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Emoji placeholder</label>
              <input className="form-input" value={form.placeholder} onChange={set('placeholder')} placeholder="📚" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dành cho (subtitle)</label>
            <input className="form-input" value={form.subtitle} onChange={set('subtitle')} placeholder="Học viên chưa có nền tảng" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mô tả ngắn</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={set('description')} placeholder="Mô tả nội dung khóa học..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Thời lượng</label>
              <input className="form-input" value={form.duration} onChange={set('duration')} placeholder="6–8 tháng" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Sĩ số lớp</label>
              <input className="form-input" value={form.classSize} onChange={set('classSize')} placeholder="Nhóm ≤ 8 người" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Học phí</label>
              <input className="form-input" value={form.price} onChange={set('price')} placeholder="Liên hệ tư vấn" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Thứ tự hiển thị</label>
              <input className="form-input" type="number" value={form.orderIndex} onChange={set('orderIndex')} min={0} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">URL ảnh đại diện</label>
            <input className="form-input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="img/course-xxx.jpg hoặc URL Cloudinary" />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị trên trang web
          </label>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : '💾 Lưu khóa học'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function catLabel(c) {
  return CATEGORIES.find(x => x.value === c)?.label || c || '–';
}

const LEVEL_COLOR_MAP = { red: '#ef4444', blue: '#3d8bff', green: '#34d399', purple: '#a78bfa' };

export default function Courses() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editCourse, setEditCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => apiFetch('/admin/courses').then(d => setCourses(d.courses || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

  const filtered = courses.filter(c => {
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && c.category !== catFilter) return false;
    return true;
  });

  async function toggleActive(id, isActive) {
    try {
      await apiFetch(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
      toast(isActive ? 'Đã ẩn khóa học' : 'Đã hiện khóa học');
      load();
    } catch (e) { toast(e.message, 'error'); }
  }

  function del(id, title) {
    confirm(`Xóa khóa học "${title}"?`, async () => {
      try { await apiFetch(`/admin/courses/${id}`, { method: 'DELETE' }); toast('Đã xóa'); load(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  return (
    <>
      {(showModal || editCourse) && (
        <CourseModal course={editCourse} onClose={() => { setShowModal(false); setEditCourse(null); }} onSaved={load} />
      )}

      <div className="section-header">
        <h2 className="section-title">Khóa học ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={() => { setEditCourse(null); setShowModal(true); }}>+ Thêm khóa học</button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="form-input search-input" placeholder="Tìm tên khóa học..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <select className="form-input" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 180 }}>
          <option value="">Tất cả danh mục</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>TÊN KHÓA HỌC</th><th>DANH MỤC</th><th>CẤP ĐỘ</th><th>THỜI LƯỢNG</th><th>HỌC PHÍ</th><th>TRẠNG THÁI</th><th>THỨ TỰ</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có khóa học</td></tr>
              : filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.title}</strong>
                    {c.subtitle && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{c.subtitle}</div>}
                  </td>
                  <td style={{ fontSize: 13 }}>{catLabel(c.category)}</td>
                  <td>
                    {c.level && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: LEVEL_COLOR_MAP[c.levelColor] || 'var(--text2)' }}>
                        {c.placeholder} {c.level}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 13 }}>{c.duration || '–'}</td>
                  <td style={{ fontSize: 13 }}>{c.price || 'Liên hệ'}</td>
                  <td>
                    <span className={`badge ${c.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
                      <span className="dot" />{c.isActive !== false ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{c.orderIndex ?? 0}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditCourse(c)} title="Sửa">✏️</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleActive(c._id, c.isActive !== false)} title={c.isActive !== false ? 'Ẩn' : 'Hiện'}>{c.isActive !== false ? '🙈' : '👁'}</button>
                      {isAdmin && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(c._id, c.title)} title="Xóa">🗑</button>}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
