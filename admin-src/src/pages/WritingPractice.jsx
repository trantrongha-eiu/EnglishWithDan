import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const PAGE = 20;
const LEVELS = ['beginner', 'elementary', 'intermediate'];
const TYPES = ['translation', 'rearrange', 'fill_blank', 'expand', 'combine'];

function levelBadge(l) {
  const map = { beginner: 'badge-green', elementary: 'badge-blue', intermediate: 'badge-red' };
  return <span className={`badge ${map[l] || 'badge-gray'}`}>{l}</span>;
}

function typeBadge(t) {
  const map = { translation: '#3d8bff', rearrange: '#a78bfa', fill_blank: '#fbbf24', expand: '#34d399', combine: '#f97316' };
  return <span style={{ background: (map[t] || '#555') + '22', color: map[t] || '#888', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{t}</span>;
}

function Tab({ label, active, onClick }) {
  return <button className={`inner-tab${active ? ' active' : ''}`} onClick={onClick}>{label}</button>;
}

function ExerciseModal({ exercise, topics, onClose, onSaved }) {
  const toast = useToast();
  const init = { level: 'beginner', type: 'translation', topicKey: '', grammarPoint: '', question: '', baseText: '', baseWords: '', sentences: '', sampleAnswer: '', blankAnswer: '', alternativeAnswers: '', explanation: '', orderIndex: 0, isActive: true };
  const [form, setForm] = useState(exercise ? { ...exercise, alternativeAnswers: (exercise.alternativeAnswers || []).join('\n'), isActive: exercise.isActive !== false } : init);
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, alternativeAnswers: form.alternativeAnswers.split('\n').map(s => s.trim()).filter(Boolean) };
      if (exercise?._id) await apiFetch(`/admin/wp-exercises/${exercise._id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await apiFetch('/admin/wp-exercises', { method: 'POST', body: JSON.stringify(body) });
      toast(exercise?._id ? 'Đã cập nhật bài tập' : 'Đã tạo bài tập');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }));
  const showBaseText = ['fill_blank', 'rearrange', 'combine'].includes(form.type);
  const showBaseWords = form.type === 'rearrange';
  const showSentences = form.type === 'combine';
  const showBlank = form.type === 'fill_blank';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{exercise?._id ? 'Sửa bài tập' : 'Thêm bài tập'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-input" value={form.level} onChange={set('level')}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Loại bài</label>
              <select className="form-input" value={form.type} onChange={set('type')}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Chủ đề</label>
              <select className="form-input" value={form.topicKey} onChange={set('topicKey')}>
                <option value="">– Chọn –</option>
                {topics.map(t => <option key={t.key} value={t.key}>{t.titleVi || t.title}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Điểm ngữ pháp</label><input className="form-input" value={form.grammarPoint} onChange={set('grammarPoint')} placeholder="Simple Present Tense" /></div>
          <div className="form-group"><label className="form-label">Câu hỏi / Đề bài *</label><textarea className="form-input" rows={2} value={form.question} onChange={set('question')} required /></div>
          {showBaseText && <div className="form-group"><label className="form-label">Câu gốc (baseText)</label><input className="form-input" value={form.baseText} onChange={set('baseText')} /></div>}
          {showBaseWords && <div className="form-group"><label className="form-label">Từ xáo trộn (baseWords, cách nhau bởi |)</label><input className="form-input" value={form.baseWords} onChange={set('baseWords')} placeholder="She | plays | tennis | every | day" /></div>}
          {showSentences && <div className="form-group"><label className="form-label">Câu để kết hợp (sentences, mỗi câu 1 dòng)</label><textarea className="form-input" rows={3} value={form.sentences} onChange={set('sentences')} /></div>}
          <div className="form-group"><label className="form-label">Đáp án mẫu (sampleAnswer) *</label><input className="form-input" value={form.sampleAnswer} onChange={set('sampleAnswer')} required /></div>
          {showBlank && <div className="form-group"><label className="form-label">Đáp án chỗ trống (blankAnswer)</label><input className="form-input" value={form.blankAnswer} onChange={set('blankAnswer')} /></div>}
          <div className="form-group"><label className="form-label">Đáp án thay thế (mỗi dòng 1 đáp án)</label><textarea className="form-input" rows={2} value={form.alternativeAnswers} onChange={set('alternativeAnswers')} /></div>
          <div className="form-group"><label className="form-label">Giải thích</label><textarea className="form-input" rows={2} value={form.explanation} onChange={set('explanation')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Thứ tự</label><input className="form-input" type="number" value={form.orderIndex} onChange={set('orderIndex')} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', alignSelf: 'end', paddingBottom: 8 }}>
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị bài tập
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TopicModal({ topic, onClose, onSaved }) {
  const toast = useToast();
  const init = { key: '', title: '', titleVi: '', description: '', category: '', orderIndex: 0, isActive: true };
  const [form, setForm] = useState(topic ? { ...topic, isActive: topic.isActive !== false } : init);
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault(); setSaving(true);
    try {
      if (topic?._id) await apiFetch(`/admin/wp-topics/${topic._id}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/admin/wp-topics', { method: 'POST', body: JSON.stringify(form) });
      toast(topic?._id ? 'Đã cập nhật chủ đề' : 'Đã tạo chủ đề');
      onSaved(); onClose();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{topic?._id ? 'Sửa chủ đề' : 'Thêm chủ đề'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Key (slug) *</label><input className="form-input" value={form.key} onChange={set('key')} required /></div>
            <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category} onChange={set('category')} /></div>
          </div>
          <div className="form-group"><label className="form-label">Tên (tiếng Anh)</label><input className="form-input" value={form.title} onChange={set('title')} /></div>
          <div className="form-group"><label className="form-label">Tên (tiếng Việt)</label><input className="form-input" value={form.titleVi} onChange={set('titleVi')} /></div>
          <div className="form-group"><label className="form-label">Mô tả</label><input className="form-input" value={form.description} onChange={set('description')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Thứ tự</label><input className="form-input" type="number" value={form.orderIndex} onChange={set('orderIndex')} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)', alignSelf: 'end', paddingBottom: 8 }}>
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Hiển thị
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WritingPractice() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('exercises');
  const [exercises, setExercises] = useState([]);
  const [filteredEx, setFilteredEx] = useState([]);
  const [topics, setTopics] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [page, setPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [exSearch, setExSearch] = useState('');
  const [editEx, setEditEx] = useState(null);
  const [showExModal, setShowExModal] = useState(false);
  const [editTopic, setEditTopic] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);

  const loadEx = () => apiFetch('/admin/wp-exercises?limit=500').then(d => setExercises(d.exercises || [])).catch(e => toast(e.message, 'error'));
  const loadTopics = () => apiFetch('/admin/wp-topics').then(d => setTopics(d.topics || [])).catch(e => toast(e.message, 'error'));
  const loadAttempts = () => apiFetch('/admin/wp-attempts?limit=200').then(d => setAttempts(d.attempts || [])).catch(e => toast(e.message, 'error'));

  useEffect(() => { loadTopics(); loadEx(); }, []);
  useEffect(() => { if (tab === 'attempts' && attempts.length === 0) loadAttempts(); }, [tab]);

  useEffect(() => {
    setFilteredEx(exercises.filter(ex => {
      if (levelFilter && ex.level !== levelFilter) return false;
      if (typeFilter && ex.type !== typeFilter) return false;
      if (topicFilter && ex.topicKey !== topicFilter) return false;
      if (exSearch && !ex.question?.toLowerCase().includes(exSearch.toLowerCase())) return false;
      return true;
    }));
    setPage(1);
  }, [exercises, levelFilter, typeFilter, topicFilter, exSearch]);

  async function delEx(id) {
    confirm('Xóa bài tập này?', async () => {
      try { await apiFetch(`/admin/wp-exercises/${id}`, { method: 'DELETE' }); toast('Đã xóa'); loadEx(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  async function delTopic(id, t) {
    confirm(`Xóa chủ đề "${t}"?`, async () => {
      try { await apiFetch(`/admin/wp-topics/${id}`, { method: 'DELETE' }); toast('Đã xóa'); loadTopics(); }
      catch (e) { toast(e.message, 'error'); }
    });
  }

  const paged = filteredEx.slice((page - 1) * PAGE, page * PAGE);

  return (
    <>
      {(showExModal || editEx) && (
        <ExerciseModal exercise={editEx} topics={topics} onClose={() => { setShowExModal(false); setEditEx(null); }} onSaved={loadEx} />
      )}
      {(showTopicModal || editTopic) && (
        <TopicModal topic={editTopic} onClose={() => { setShowTopicModal(false); setEditTopic(null); }} onSaved={loadTopics} />
      )}

      <div className="section-header">
        <h2 className="section-title">Luyện viết (Writing Practice)</h2>
      </div>

      <div className="inner-tabs-nav">
        <Tab label="📝 Bài tập" active={tab === 'exercises'} onClick={() => setTab('exercises')} />
        <Tab label="🏷️ Chủ đề" active={tab === 'topics'} onClick={() => setTab('topics')} />
        <Tab label="📊 Lịch sử luyện" active={tab === 'attempts'} onClick={() => setTab('attempts')} />
      </div>

      {tab === 'exercises' && (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0', alignItems: 'center' }}>
            <input className="form-input search-input" placeholder="Tìm bài tập..." value={exSearch}
              onChange={e => setExSearch(e.target.value)} style={{ maxWidth: 220 }} />
            <select className="form-input" value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ width: 140 }}>
              <option value="">Tất cả level</option>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 140 }}>
              <option value="">Tất cả loại</option>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select className="form-input" value={topicFilter} onChange={e => setTopicFilter(e.target.value)} style={{ width: 160 }}>
              <option value="">Tất cả chủ đề</option>
              {topics.map(t => <option key={t.key} value={t.key}>{t.titleVi || t.title}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditEx(null); setShowExModal(true); }}>+ Thêm bài tập</button>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>CÂU HỎI</th><th>LEVEL</th><th>LOẠI</th><th>CHỦ ĐỀ</th><th>TRẠNG THÁI</th><th></th></tr></thead>
              <tbody>
                {paged.length === 0
                  ? <tr><td colSpan={6} className="table-empty">Không có bài tập</td></tr>
                  : paged.map(ex => (
                    <tr key={ex._id}>
                      <td style={{ maxWidth: 280, wordBreak: 'break-word' }}>{ex.question}</td>
                      <td>{levelBadge(ex.level)}</td>
                      <td>{typeBadge(ex.type)}</td>
                      <td style={{ fontSize: 12 }}>{ex.topicKey || '–'}</td>
                      <td><span className={`badge ${ex.isActive !== false ? 'badge-green' : 'badge-gray'}`}><span className="dot" />{ex.isActive !== false ? 'Hiện' : 'Ẩn'}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditEx(ex); }}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => delEx(ex._id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Pagination page={page} total={filteredEx.length} pageSize={PAGE} onPage={setPage} />
          </div>
        </>
      )}

      {tab === 'topics' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '12px 0' }}>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditTopic(null); setShowTopicModal(true); }}>+ Thêm chủ đề</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>KEY</th><th>TÊN TIẾNG VIỆT</th><th>CATEGORY</th><th>THỨ TỰ</th><th>TRẠNG THÁI</th><th></th></tr></thead>
              <tbody>
                {topics.length === 0
                  ? <tr><td colSpan={6} className="table-empty">Không có chủ đề</td></tr>
                  : topics.map(t => (
                    <tr key={t._id}>
                      <td><code style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--blue)' }}>{t.key}</code></td>
                      <td><strong>{t.titleVi || t.title}</strong></td>
                      <td>{t.category || '–'}</td>
                      <td>{t.orderIndex}</td>
                      <td><span className={`badge ${t.isActive !== false ? 'badge-green' : 'badge-gray'}`}><span className="dot" />{t.isActive !== false ? 'Hiện' : 'Ẩn'}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditTopic(t)}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => delTopic(t._id, t.titleVi || t.title)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'attempts' && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>HỌC SINH</th><th>LEVEL</th><th>LOẠI</th><th>CHỦ ĐỀ</th><th>XP</th><th>NGÀY</th><th></th></tr></thead>
            <tbody>
              {attempts.length === 0
                ? <tr><td colSpan={7} className="table-empty">Chưa có lịch sử</td></tr>
                : attempts.map(a => (
                  <tr key={a._id}>
                    <td><strong>{a.studentId?.username || '–'}</strong></td>
                    <td>{levelBadge(a.level)}</td>
                    <td>{typeBadge(a.type)}</td>
                    <td style={{ fontSize: 12 }}>{a.topic || '–'}</td>
                    <td><span style={{ color: 'var(--yellow)', fontWeight: 700 }}>+{a.xpEarned || 0}</span></td>
                    <td style={{ fontSize: 12 }}>{formatDate(a.createdAt).split(' ')[0]}</td>
                    <td>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => {
                        confirm('Xóa lịch sử này?', async () => {
                          try { await apiFetch(`/admin/wp-attempts/${a._id}`, { method: 'DELETE' }); toast('Đã xóa'); setAttempts(x => x.filter(y => y._id !== a._id)); }
                          catch (e) { toast(e.message, 'error'); }
                        });
                      }}>🗑</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
