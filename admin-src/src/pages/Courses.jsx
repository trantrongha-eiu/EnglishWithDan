import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

function CourseModal({ course, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', price: 0, orderIndex: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) setForm({ title: course.title || '', description: course.description || '', imageUrl: course.imageUrl || '', price: course.price || 0, orderIndex: course.orderIndex || 0, isActive: course.isActive !== false });
  }, [course]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (course?._id) await apiFetch(`/admin/courses/${course._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/courses', { method: 'POST', body: JSON.stringify(form) });
      toast(course?._id ? 'Đã cập nhật' : 'Đã tạo khóa học');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{course?._id ? 'Sửa khóa học' : 'Thêm khóa học'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label className="form-label">Tiêu đề</label><input className="form-input" value={form.title} onChange={set('title')} required /></div>
          <div className="form-group"><label className="form-label">Mô tả</label><textarea className="form-input" rows={3} value={form.description} onChange={set('description')} /></div>
          <div className="form-group"><label className="form-label">URL ảnh</label><input className="form-input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Giá (VND)</label><input className="form-input" type="number" value={form.price} onChange={set('price')} /></div>
            <div className="form-group"><label className="form-label">Thứ tự</label><input className="form-input" type="number" value={form.orderIndex} onChange={set('orderIndex')} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị khóa học
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Courses() {
  const toast = useToast();
  const confirm = useConfirm();
  const [courses, setCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => apiFetch('/admin/courses').then(d => setCourses(d.courses || [])).catch(e => toast(e.message, 'error'));
  useEffect(() => { load(); }, []);

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
        <h2 className="section-title">Khóa học ({courses.length})</h2>
        <button className="btn btn-primary" onClick={() => { setEditCourse(null); setShowModal(true); }}>+ Thêm khóa học</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>ẢNH</th><th>TIÊU ĐỀ</th><th>GIÁ</th><th>THỨ TỰ</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th></th></tr></thead>
          <tbody>
            {courses.length === 0
              ? <tr><td colSpan={7} className="table-empty">Không có khóa học</td></tr>
              : courses.map(c => (
                <tr key={c._id}>
                  <td>{c.imageUrl ? <a href={c.imageUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', fontSize: 12 }}>🖼 Xem</a> : '–'}</td>
                  <td><strong>{c.title}</strong><br /><span style={{ fontSize: 11, color: 'var(--text3)' }}>{(c.description || '').slice(0, 60)}</span></td>
                  <td>{c.price ? c.price.toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}</td>
                  <td>{c.orderIndex}</td>
                  <td><span className={`badge ${c.isActive !== false ? 'badge-green' : 'badge-gray'}`}><span className="dot" />{c.isActive !== false ? 'Hiện' : 'Ẩn'}</span></td>
                  <td style={{ fontSize: 12 }}>{formatDate(c.createdAt).split(' ')[0]}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditCourse(c)}>✏️</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(c._id, c.title)}>🗑</button>
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
