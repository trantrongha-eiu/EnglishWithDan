import { useState, useEffect, useCallback, Fragment } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

// ── Helpers ───────────────────────────────────────────────────────────────
function totalItems(tpl) {
  return (tpl.sections || []).reduce((s, sec) => s + (sec.items || []).length, 0);
}

// ── Template meta modal ───────────────────────────────────────────────────
function TplMetaModal({ template, onClose, onSaved }) {
  const isEdit = !!template?._id;
  const [form, setForm] = useState(template ? {
    typeId: template.typeId, label: template.label, sub: template.sub,
    name: template.name, orderIndex: template.orderIndex ?? 0, isActive: template.isActive !== false
  } : { typeId: '', label: '', sub: '', name: '', orderIndex: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.typeId.trim() || !form.name.trim()) return showToast('Điền typeId và tên template', 'error');
    setSaving(true);
    try {
      if (isEdit) {
        await apiFetch(`/admin/task2/templates/${template._id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch('/admin/task2/templates', { method: 'POST', body: JSON.stringify({ ...form, sections: [] }) });
      }
      showToast(isEdit ? 'Đã cập nhật template' : 'Đã thêm template mới', 'success');
      onSaved();
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Sửa Template' : 'Thêm Template mới'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
            <div>
              <label className="form-label">Type ID *</label>
              <input className="form-input" value={form.typeId} onChange={e => set('typeId', e.target.value)} placeholder="type07" disabled={isEdit} />
              {isEdit && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Không đổi được typeId</div>}
            </div>
            <div>
              <label className="form-label">Tên đầy đủ *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Advantages & Disadvantages" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 10 }}>
            <div>
              <label className="form-label">Label (tab)</label>
              <input className="form-input" value={form.label} onChange={e => set('label', e.target.value)} placeholder="Type 07" />
            </div>
            <div>
              <label className="form-label">Sub (mô tả ngắn)</label>
              <input className="form-input" value={form.sub} onChange={e => set('sub', e.target.value)} placeholder="Adv & Disadv" />
            </div>
            <div>
              <label className="form-label">Thứ tự</label>
              <input className="form-input" type="number" value={form.orderIndex} onChange={e => set('orderIndex', parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="form-label">Trạng thái</label>
            <select className="form-input" value={form.isActive ? 'true' : 'false'} onChange={e => set('isActive', e.target.value === 'true')}>
              <option value="true">Hiển thị</option>
              <option value="false">Ẩn</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm Template')}</button>
        </div>
      </div>
    </div>
  );
}

// ── Section modal ─────────────────────────────────────────────────────────
function SectionModal({ section, onClose, onSaved }) {
  const [title, setTitle] = useState(section?.title || '');
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  async function save() {
    if (!title.trim()) return showToast('Điền tiêu đề section', 'error');
    setSaving(true);
    try {
      onSaved(title.trim());
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{section ? 'Sửa tiêu đề Section' : 'Thêm Section mới'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="form-label">Tiêu đề Section *</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="① Introduction – Mở bài" autoFocus
            onKeyDown={e => e.key === 'Enter' && save()} />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Ví dụ: ① Introduction – Mở bài, ② Body 1 – Advantages · Ưu điểm</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? '...' : (section ? 'Cập nhật' : 'Thêm Section')}</button>
        </div>
      </div>
    </div>
  );
}

// ── Item modal ────────────────────────────────────────────────────────────
function ItemModal({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState(item || { en: '', answer: '', vi: '' });
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.en.trim() || !form.answer.trim()) return showToast('Điền câu và đáp án', 'error');
    setSaving(true);
    try {
      onSaved({ en: form.en.trim(), answer: form.answer.trim(), vi: form.vi.trim() });
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Sửa câu luyện' : 'Thêm câu luyện'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="form-label">Câu tiếng Anh (dùng ___ cho chỗ trống) *</label>
            <textarea className="form-input" rows={3} value={form.en}
              onChange={e => set('en', e.target.value)}
              placeholder="In recent years, (noun phrase) has become an increasingly ___ feature of modern life." />
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Dùng ___ (ba dấu gạch) để đánh dấu chỗ trống</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="form-label">Đáp án đúng *</label>
              <input className="form-input" value={form.answer} onChange={e => set('answer', e.target.value)} placeholder="prominent" />
            </div>
            <div>
              <label className="form-label">Dịch nghĩa tiếng Việt</label>
              <input className="form-input" value={form.vi} onChange={e => set('vi', e.target.value)} placeholder="→ Trong những năm gần đây, ..." />
            </div>
          </div>
          {form.en && !form.en.includes('___') && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#856404' }}>
              ⚠ Câu chưa có chỗ trống (___)
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? '...' : (isEdit ? 'Cập nhật' : 'Thêm câu')}</button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Task2Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [tick, setTick]           = useState(0);
  const [activeId, setActiveId]   = useState(null);
  const [activeTpl, setActiveTpl] = useState(null);
  const [savingTpl, setSavingTpl] = useState(false);

  // Modals
  const [showTplMeta, setShowTplMeta]   = useState(false);
  const [editingMeta, setEditingMeta]   = useState(null);
  const [showSection, setShowSection]   = useState(false);
  const [editingSecIdx, setEditingSecIdx] = useState(null);
  const [showItem, setShowItem]         = useState(false);
  const [editingItem, setEditingItem]   = useState(null); // {secIdx, itemIdx, item}

  const showToast = useToast();
  const confirm   = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/admin/task2/templates${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setTemplates(data.templates || []);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [search, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);
  function reload() { setTick(t => t + 1); }

  // ── Expand a template ──────────────────────────────────────────────────
  async function expandTpl(tpl) {
    if (activeId === tpl._id) { setActiveId(null); setActiveTpl(null); return; }
    setActiveId(tpl._id);
    try {
      const data = await apiFetch(`/admin/task2/templates/${tpl._id}`);
      setActiveTpl(JSON.parse(JSON.stringify(data.template)));
    } catch (e) { showToast(e.message, 'error'); }
  }

  // ── Save full activeTpl to server ──────────────────────────────────────
  async function flushTpl(updatedTpl) {
    if (!updatedTpl) return;
    setSavingTpl(true);
    try {
      await apiFetch(`/admin/task2/templates/${updatedTpl._id}`, { method: 'PUT', body: JSON.stringify({ sections: updatedTpl.sections }) });
      showToast('Đã lưu thay đổi', 'success');
      reload();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSavingTpl(false); }
  }

  // ── Toggle active ──────────────────────────────────────────────────────
  async function toggleActive(tpl) {
    try {
      await apiFetch(`/admin/task2/templates/${tpl._id}`, { method: 'PUT', body: JSON.stringify({ isActive: !tpl.isActive }) });
      showToast(tpl.isActive ? 'Đã ẩn template' : 'Đã hiện template', 'success');
      reload();
    } catch (e) { showToast(e.message, 'error'); }
  }

  // ── Delete template ────────────────────────────────────────────────────
  function deleteTpl(tpl) {
    confirm(`Xóa template "${tpl.name}"? Không thể hoàn tác.`, async () => {
      try {
        await apiFetch(`/admin/task2/templates/${tpl._id}`, { method: 'DELETE' });
        showToast('Đã xóa template', 'success');
        if (activeId === tpl._id) { setActiveId(null); setActiveTpl(null); }
        reload();
      } catch (e) { showToast(e.message, 'error'); }
    });
  }

  // ── Seed ──────────────────────────────────────────────────────────────
  async function seedTemplates(force) {
    try {
      const data = await apiFetch('/admin/task2/templates/seed', { method: 'POST', body: JSON.stringify({ force }) });
      showToast(data.message, data.success ? 'success' : 'error');
      if (data.success) reload();
    } catch (e) { showToast(e.message, 'error'); }
  }

  // ── Section handlers (local state) ────────────────────────────────────
  function handleAddSection(title) {
    const updated = { ...activeTpl, sections: [...(activeTpl.sections || []), { title, items: [] }] };
    setActiveTpl(updated);
    flushTpl(updated);
  }

  function handleEditSection(idx, title) {
    const secs = [...activeTpl.sections];
    secs[idx] = { ...secs[idx], title };
    const updated = { ...activeTpl, sections: secs };
    setActiveTpl(updated);
    flushTpl(updated);
  }

  function handleDeleteSection(idx) {
    confirm(`Xóa section "${activeTpl.sections[idx].title}" và tất cả câu bên trong?`, () => {
      const secs = activeTpl.sections.filter((_, i) => i !== idx);
      const updated = { ...activeTpl, sections: secs };
      setActiveTpl(updated);
      flushTpl(updated);
    });
  }

  // ── Item handlers (local state) ────────────────────────────────────────
  function handleAddItem(secIdx, item) {
    const secs = activeTpl.sections.map((sec, i) =>
      i === secIdx ? { ...sec, items: [...(sec.items || []), item] } : sec
    );
    const updated = { ...activeTpl, sections: secs };
    setActiveTpl(updated);
    flushTpl(updated);
  }

  function handleEditItem(secIdx, itemIdx, item) {
    const secs = activeTpl.sections.map((sec, i) => {
      if (i !== secIdx) return sec;
      const items = sec.items.map((it, j) => j === itemIdx ? item : it);
      return { ...sec, items };
    });
    const updated = { ...activeTpl, sections: secs };
    setActiveTpl(updated);
    flushTpl(updated);
  }

  function handleDeleteItem(secIdx, itemIdx) {
    const secs = activeTpl.sections.map((sec, i) => {
      if (i !== secIdx) return sec;
      return { ...sec, items: sec.items.filter((_, j) => j !== itemIdx) };
    });
    const updated = { ...activeTpl, sections: secs };
    setActiveTpl(updated);
    flushTpl(updated);
  }

  function moveSectionUp(idx) {
    if (idx === 0) return;
    const secs = [...activeTpl.sections];
    [secs[idx - 1], secs[idx]] = [secs[idx], secs[idx - 1]];
    const updated = { ...activeTpl, sections: secs };
    setActiveTpl(updated);
    flushTpl(updated);
  }

  function moveSectionDown(idx) {
    if (idx >= activeTpl.sections.length - 1) return;
    const secs = [...activeTpl.sections];
    [secs[idx], secs[idx + 1]] = [secs[idx + 1], secs[idx]];
    const updated = { ...activeTpl, sections: secs };
    setActiveTpl(updated);
    flushTpl(updated);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task 2 Templates</h1>
          <p className="page-subtitle">{templates.length} template — câu luyện điền từ theo dạng bài IELTS Task 2</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => confirm('Seed lại toàn bộ 6 template mặc định? Dữ liệu hiện tại sẽ bị ghi đè.', () => seedTemplates(true))}>
            🔄 Seed lại
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => seedTemplates(false)}>
            📥 Seed lần đầu
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingMeta(null); setShowTplMeta(true); }}>+ Thêm Template</button>
        </div>
      </div>

      {/* Search */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input className="filter-search" placeholder="Tìm template..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={reload}>Tìm</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Đang tải...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Type ID</th>
                <th>Tên Template</th>
                <th style={{ width: 100 }}>Tab Label</th>
                <th style={{ textAlign: 'center', width: 80 }}>Sections</th>
                <th style={{ textAlign: 'center', width: 80 }}>Câu</th>
                <th style={{ textAlign: 'center', width: 80 }}>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
                    Chưa có template nào.{' '}
                    <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={() => seedTemplates(false)}>📥 Seed 6 template mặc định</button>
                  </td>
                </tr>
              )}
              {templates.map(tpl => (
                <Fragment key={tpl._id}>
                  <tr style={{ background: activeId === tpl._id ? 'rgba(99,102,241,.07)' : undefined, opacity: tpl.isActive ? 1 : 0.55 }}>
                    <td><span style={{ fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>{tpl.typeId}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tpl.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{tpl.sub}</div>
                    </td>
                    <td><span style={{ fontSize: 12, color: '#6b7280' }}>{tpl.label}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#6366f1' }}>{(tpl.sections || []).length}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#059669' }}>{totalItems(tpl)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: tpl.isActive ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{tpl.isActive ? '✓' : '✗'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Quản lý sections & items"
                          onClick={() => expandTpl(tpl)}
                          style={{ background: activeId === tpl._id ? '#6366f1' : undefined, color: activeId === tpl._id ? '#fff' : undefined, borderColor: activeId === tpl._id ? '#6366f1' : undefined }}>
                          📋
                        </button>
                        <button className={`btn btn-sm ${tpl.isActive ? 'btn-warning' : 'btn-success'}`}
                          title={tpl.isActive ? 'Ẩn' : 'Hiện'} onClick={() => toggleActive(tpl)}>
                          {tpl.isActive ? '🙈' : '👁'}
                        </button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Sửa thông tin"
                          onClick={() => { setEditingMeta(tpl); setShowTplMeta(true); }}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" title="Xóa" onClick={() => deleteTpl(tpl)}>🗑️</button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded panel */}
                  {activeId === tpl._id && activeTpl && (
                    <tr>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <div style={{ background: 'var(--surface2)', borderTop: '2px solid #6366f1', padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ fontWeight: 700, color: '#6366f1', fontSize: 15 }}>
                              📋 {activeTpl.typeId} — {activeTpl.name}
                              {savingTpl && <span style={{ marginLeft: 10, fontSize: 12, color: '#9ca3af' }}>Đang lưu...</span>}
                            </div>
                            <button className="btn btn-primary" style={{ fontSize: 13, padding: '6px 14px' }}
                              onClick={() => { setEditingSecIdx(null); setShowSection(true); }}>
                              + Thêm Section
                            </button>
                          </div>

                          {(activeTpl.sections || []).length === 0 && (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>Chưa có section nào. Nhấn "+ Thêm Section" để bắt đầu.</div>
                          )}

                          {(activeTpl.sections || []).map((sec, si) => (
                            <div key={si} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
                              {/* Section header */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,.04)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <button className="btn btn-ghost btn-sm btn-icon" title="Lên" onClick={() => moveSectionUp(si)} disabled={si === 0} style={{ padding: '1px 5px', fontSize: 10 }}>▲</button>
                                  <button className="btn btn-ghost btn-sm btn-icon" title="Xuống" onClick={() => moveSectionDown(si)} disabled={si === activeTpl.sections.length - 1} style={{ padding: '1px 5px', fontSize: 10 }}>▼</button>
                                </div>
                                <div style={{ fontWeight: 700, flex: 1, fontSize: 13, color: 'var(--text)' }}>{sec.title}</div>
                                <span style={{ fontSize: 11, color: '#9ca3af' }}>{(sec.items || []).length} câu</span>
                                <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }}
                                  onClick={() => { setEditingItem({ secIdx: si, itemIdx: null, item: null }); setShowItem(true); }}>
                                  + Câu
                                </button>
                                <button className="btn btn-ghost btn-sm btn-icon" title="Sửa tiêu đề"
                                  onClick={() => { setEditingSecIdx(si); setShowSection(true); }}>✏️</button>
                                <button className="btn btn-danger btn-sm btn-icon" title="Xóa section"
                                  onClick={() => handleDeleteSection(si)}>🗑️</button>
                              </div>

                              {/* Items table */}
                              {(sec.items || []).length === 0 ? (
                                <div style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 13 }}>Chưa có câu nào trong section này.</div>
                              ) : (
                                <table className="data-table" style={{ margin: 0 }}>
                                  <thead>
                                    <tr>
                                      <th style={{ width: 30 }}>#</th>
                                      <th>Câu tiếng Anh</th>
                                      <th style={{ width: 120 }}>Đáp án</th>
                                      <th style={{ textAlign: 'right', width: 80 }}>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sec.items.map((item, ii) => (
                                      <tr key={ii}>
                                        <td style={{ color: '#9ca3af', fontSize: 12 }}>{ii + 1}</td>
                                        <td style={{ maxWidth: 400 }}>
                                          <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.en.replace('___', '[ ___ ]')}
                                          </div>
                                          {item.vi && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.vi}</div>}
                                        </td>
                                        <td>
                                          <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{item.answer}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                            <button className="btn btn-ghost btn-sm btn-icon"
                                              onClick={() => { setEditingItem({ secIdx: si, itemIdx: ii, item }); setShowItem(true); }}>✏️</button>
                                            <button className="btn btn-danger btn-sm btn-icon"
                                              onClick={() => confirm('Xóa câu này?', () => handleDeleteItem(si, ii))}>🗑️</button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showTplMeta && (
        <TplMetaModal
          template={editingMeta}
          onClose={() => setShowTplMeta(false)}
          onSaved={reload}
        />
      )}

      {showSection && activeTpl && (
        <SectionModal
          section={editingSecIdx !== null ? activeTpl.sections[editingSecIdx] : null}
          onClose={() => setShowSection(false)}
          onSaved={title => {
            if (editingSecIdx !== null) handleEditSection(editingSecIdx, title);
            else handleAddSection(title);
          }}
        />
      )}

      {showItem && editingItem && activeTpl && (
        <ItemModal
          item={editingItem.item}
          onClose={() => setShowItem(false)}
          onSaved={item => {
            if (editingItem.itemIdx !== null) handleEditItem(editingItem.secIdx, editingItem.itemIdx, item);
            else handleAddItem(editingItem.secIdx, item);
          }}
        />
      )}
    </div>
  );
}
