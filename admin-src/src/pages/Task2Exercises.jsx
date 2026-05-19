import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';

const LIMIT = 15;
const ESSAY_TYPES = ['advantages_disadvantages','cause_effect','cause_solution','effect_solution','agree_disagree','discuss_both_views'];
const ESSAY_LABELS = { advantages_disadvantages:'Adv & Disadv', cause_effect:'Cause & Effect', cause_solution:'Cause & Solution', effect_solution:'Effect & Solution', agree_disagree:'Agree/Disagree', discuss_both_views:'Discuss Both Views' };
const ESSAY_COLORS = { advantages_disadvantages:'#4CAF50', cause_effect:'#FF9800', cause_solution:'#FF9800', effect_solution:'#FF9800', agree_disagree:'#9C27B0', discuss_both_views:'#2196F3' };
const Q_TYPES = ['essay_type_recognition','fill_blank','rearrange','translation','error_correction','topic_sentence','short_writing','paraphrase'];
const Q_LABELS = { essay_type_recognition:'Nhận diện dạng', fill_blank:'Điền chỗ trống', rearrange:'Sắp xếp từ', translation:'Dịch câu', error_correction:'Sửa lỗi', topic_sentence:'Chọn topic sentence', short_writing:'Viết đoạn', paraphrase:'Paraphrase' };
const LEVELS = ['beginner','elementary','intermediate'];
const LEVEL_COLORS = { beginner:'#22c55e', elementary:'#3b82f6', intermediate:'#a855f7' };

const defaultTopic = { week: 1, block: 'advantages_disadvantages', topicName: '', topicEmoji: '📝', essayType: 'advantages_disadvantages', prompt: '', hintAdvantages: '', hintDisadvantages: '', isActive: true };
const defaultQ = { level: 'beginner', type: 'essay_type_recognition', questionText: '', options: '', baseWords: '', correctAnswer: '', explanationVi: '', modelAnswer: '', fallbackKeywords: '', orderIndex: 0 };

function TopicModal({ topic, onClose, onSaved }) {
  const [form, setForm] = useState(topic || defaultTopic);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const isEdit = !!topic?._id;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.topicName.trim() || !form.prompt.trim()) return showToast('Điền tên topic và đề bài', 'error');
    setSaving(true);
    try {
      const body = {
        ...form,
        hintAdvantages: typeof form.hintAdvantages === 'string'
          ? form.hintAdvantages.split('\n').map(s => s.trim()).filter(Boolean)
          : form.hintAdvantages,
        hintDisadvantages: typeof form.hintDisadvantages === 'string'
          ? form.hintDisadvantages.split('\n').map(s => s.trim()).filter(Boolean)
          : form.hintDisadvantages
      };
      if (isEdit) {
        await apiFetch(`/admin/task2/topics/${topic._id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch('/admin/task2/topics', { method: 'POST', body: JSON.stringify(body) });
      }
      showToast(isEdit ? 'Đã cập nhật topic' : 'Đã thêm topic mới', 'success');
      onSaved();
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Sửa Topic' : 'Thêm Topic mới'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:10 }}>
            <div>
              <label className="form-label">Tên Topic *</label>
              <input className="form-input" value={form.topicName} onChange={e => set('topicName', e.target.value)} placeholder="Technology in Education" />
            </div>
            <div>
              <label className="form-label">Emoji</label>
              <input className="form-input" value={form.topicEmoji} onChange={e => set('topicEmoji', e.target.value)} placeholder="📝" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr', gap:10 }}>
            <div>
              <label className="form-label">Tuần</label>
              <input className="form-input" type="number" min={1} max={12} value={form.week} onChange={e => set('week', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="form-label">Essay Type *</label>
              <select className="form-input" value={form.essayType} onChange={e => { set('essayType', e.target.value); set('block', e.target.value); }}>
                {ESSAY_TYPES.map(t => <option key={t} value={t}>{ESSAY_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Order Index</label>
              <input className="form-input" type="number" value={form.orderIndex || 0} onChange={e => set('orderIndex', parseInt(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="form-label">Đề bài IELTS (Prompt) *</label>
            <textarea className="form-input" rows={3} value={form.prompt} onChange={e => set('prompt', e.target.value)} placeholder="Many schools now offer online learning..." />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label className="form-label">Hint Advantages (mỗi dòng 1 ý)</label>
              <textarea className="form-input" rows={3} value={typeof form.hintAdvantages === 'string' ? form.hintAdvantages : (form.hintAdvantages || []).join('\n')} onChange={e => set('hintAdvantages', e.target.value)} placeholder="flexible schedule&#10;cost-effective" />
            </div>
            <div>
              <label className="form-label">Hint Disadvantages</label>
              <textarea className="form-input" rows={3} value={typeof form.hintDisadvantages === 'string' ? form.hintDisadvantages : (form.hintDisadvantages || []).join('\n')} onChange={e => set('hintDisadvantages', e.target.value)} placeholder="lack of interaction&#10;motivation issues" />
            </div>
          </div>
          <div>
            <label className="form-label">Trạng thái</label>
            <select className="form-input" value={form.isActive ? 'true' : 'false'} onChange={e => set('isActive', e.target.value === 'true')}>
              <option value="true">Đang dùng</option>
              <option value="false">Ẩn</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm Topic')}</button>
        </div>
      </div>
    </div>
  );
}

function QuestionModal({ topicId, question, onClose, onSaved }) {
  const isEdit = !!question?._id;
  const [form, setForm] = useState(question ? {
    ...question,
    options: (question.options || []).join('\n'),
    baseWords: (question.baseWords || []).join(' '),
    fallbackKeywords: (question.fallbackKeywords || []).join('\n')
  } : defaultQ);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const isChoice = ['essay_type_recognition','topic_sentence'].includes(form.type);
  const isRearrange = form.type === 'rearrange';
  const hasModel = ['translation','error_correction','short_writing','paraphrase','rearrange'].includes(form.type);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.questionText.trim()) return showToast('Nhập nội dung câu hỏi', 'error');
    setSaving(true);
    try {
      const body = {
        ...form,
        options: typeof form.options === 'string' ? form.options.split('\n').map(s => s.trim()).filter(Boolean) : form.options,
        baseWords: typeof form.baseWords === 'string' ? form.baseWords.split(/[\s,]+/).map(s => s.trim()).filter(Boolean) : form.baseWords,
        fallbackKeywords: typeof form.fallbackKeywords === 'string' ? form.fallbackKeywords.split('\n').map(s => s.trim()).filter(Boolean) : form.fallbackKeywords,
        orderIndex: parseInt(form.orderIndex) || 0
      };
      if (isEdit) {
        await apiFetch(`/admin/task2/topics/${topicId}/questions/${question._id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await apiFetch(`/admin/task2/topics/${topicId}/questions`, { method: 'POST', body: JSON.stringify(body) });
      }
      showToast(isEdit ? 'Đã cập nhật câu hỏi' : 'Đã thêm câu hỏi', 'success');
      onSaved();
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 80px', gap:10 }}>
            <div>
              <label className="form-label">Level *</label>
              <select className="form-input" value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Loại câu hỏi *</label>
              <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
                {Q_TYPES.map(t => <option key={t} value={t}>{Q_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Thứ tự</label>
              <input className="form-input" type="number" value={form.orderIndex} onChange={e => set('orderIndex', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Nội dung câu hỏi *</label>
            <textarea className="form-input" rows={3} value={form.questionText} onChange={e => set('questionText', e.target.value)} placeholder="Điền từ còn thiếu để hoàn chỉnh câu..." />
          </div>
          {isChoice && (
            <div>
              <label className="form-label">Các lựa chọn (mỗi dòng 1 đáp án)</label>
              <textarea className="form-input" rows={4} value={form.options} onChange={e => set('options', e.target.value)} placeholder="Agree or Disagree&#10;Advantages & Disadvantages&#10;Discuss Both Views&#10;Cause & Solution" />
            </div>
          )}
          {isRearrange && (
            <div>
              <label className="form-label">Từ để sắp xếp — baseWords (cách nhau bởi dấu cách hoặc phẩy)</label>
              <input className="form-input" value={form.baseWords || ''} onChange={e => set('baseWords', e.target.value)} placeholder="One of the most advantages of smartphones is their convenience" />
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>Các từ này sẽ hiển thị dưới dạng chip để học sinh sắp xếp. Nếu để trống, hệ thống tự tạo từ Đáp án đúng.</div>
            </div>
          )}
          <div>
            <label className="form-label">Đáp án đúng (correctAnswer)</label>
            <input className="form-input" value={form.correctAnswer || ''} onChange={e => set('correctAnswer', e.target.value)} placeholder="Advantages & Disadvantages" />
          </div>
          {hasModel && (
            <div>
              <label className="form-label">Model Answer</label>
              <textarea className="form-input" rows={2} value={form.modelAnswer || ''} onChange={e => set('modelAnswer', e.target.value)} placeholder="Many universities have started offering..." />
            </div>
          )}
          <div>
            <label className="form-label">Giải thích (tiếng Việt)</label>
            <textarea className="form-input" rows={2} value={form.explanationVi || ''} onChange={e => set('explanationVi', e.target.value)} placeholder="Keyword 'advantages and disadvantages' trong câu hỏi..." />
          </div>
          <div>
            <label className="form-label">Từ khóa chấm bài fallback (mỗi dòng 1 từ/cụm)</label>
            <textarea className="form-input" rows={2} value={form.fallbackKeywords} onChange={e => set('fallbackKeywords', e.target.value)} placeholder="universities&#10;online learning&#10;students" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm câu hỏi')}</button>
        </div>
      </div>
    </div>
  );
}

export default function Task2Exercises() {
  const [topics, setTopics]           = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [weekFilter, setWeekFilter]   = useState('all');
  const [typeFilter, setTypeFilter]   = useState('all');
  const [search, setSearch]           = useState('');
  const [tick, setTick]               = useState(0);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic]     = useState(null);
  const [activeTopic, setActiveTopic]       = useState(null);
  const [showQModal, setShowQModal]         = useState(false);
  const [editingQ, setEditingQ]             = useState(null);

  const { showToast } = useToast();
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (weekFilter !== 'all') params.set('week', weekFilter);
      if (typeFilter !== 'all') params.set('essayType', typeFilter);
      if (search) params.set('search', search);
      const data = await apiFetch(`/admin/task2/topics?${params}`);
      setTopics(data.topics || []);
      setTotal(data.total || 0);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [page, weekFilter, typeFilter, search, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  function forceReload() { setPage(1); setTick(t => t + 1); }

  async function deleteTopic(t) {
    const ok = await confirm({ title: 'Xóa topic?', message: `"${t.topicName}" và tất cả câu hỏi bên trong sẽ bị xóa vĩnh viễn.` });
    if (!ok) return;
    try {
      await apiFetch(`/admin/task2/topics/${t._id}`, { method: 'DELETE' });
      showToast('Đã xóa topic', 'success');
      if (activeTopic?._id === t._id) setActiveTopic(null);
      forceReload();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function deleteQuestion(qid) {
    if (!activeTopic) return;
    const ok = await confirm({ title: 'Xóa câu hỏi?', message: 'Không thể hoàn tác.' });
    if (!ok) return;
    try {
      await apiFetch(`/admin/task2/topics/${activeTopic._id}/questions/${qid}`, { method: 'DELETE' });
      showToast('Đã xóa câu hỏi', 'success');
      // refresh activeTopic
      const data = await apiFetch(`/admin/task2/topics?search=${encodeURIComponent(activeTopic.topicName)}&limit=1`);
      const fresh = data.topics?.find(t => t._id === activeTopic._id);
      if (fresh) setActiveTopic(fresh);
      else forceReload();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function refreshActiveTopic() {
    if (!activeTopic) return;
    try {
      const data = await apiFetch(`/admin/task2/topics?search=${encodeURIComponent(activeTopic.topicName)}&limit=5`);
      const fresh = data.topics?.find(t => t._id === activeTopic._id);
      if (fresh) setActiveTopic(fresh);
    } catch {}
    forceReload();
  }

  const weeks = [1,2,3,4,5,6,7,8,9,10,11,12];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task 2 Writing</h1>
          <p className="page-subtitle">{total} topic — quản lý câu hỏi luyện viết IELTS Task 2</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingTopic(null); setShowTopicModal(true); }}>+ Thêm Topic</button>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ flexWrap:'wrap', gap:10 }}>
        <select className="filter-select" value={weekFilter} onChange={e => { setWeekFilter(e.target.value); setPage(1); }}>
          <option value="all">Tất cả tuần</option>
          {weeks.map(w => <option key={w} value={w}>Tuần {w}</option>)}
        </select>
        <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="all">Tất cả dạng</option>
          {ESSAY_TYPES.map(t => <option key={t} value={t}>{ESSAY_LABELS[t]}</option>)}
        </select>
        <input className="filter-search" placeholder="Tìm tên topic..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          onKeyDown={e => e.key === 'Enter' && forceReload()} />
        <button className="btn-secondary" onClick={forceReload}>Tìm</button>
      </div>

      {/* Topics table */}
      {loading ? (
        <div style={{ textAlign:'center', padding:40 }}>Đang tải...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tuần</th>
                <th>Topic</th>
                <th>Dạng bài</th>
                <th style={{ textAlign:'center' }}>Câu hỏi</th>
                <th style={{ textAlign:'center' }}>Trạng thái</th>
                <th style={{ textAlign:'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {topics.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>Chưa có topic nào</td></tr>
              )}
              {topics.map(t => (
                <>
                  <tr key={t._id} style={{ background: activeTopic?._id === t._id ? 'var(--blue-50,#eff6ff)' : undefined }}>
                    <td><span style={{ fontWeight:700, color:'#6366f1' }}>W{t.week}</span></td>
                    <td>
                      <div style={{ fontWeight:600 }}>{t.topicEmoji} {t.topicName}</div>
                      <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{(t.questions||[]).length} câu hỏi</div>
                    </td>
                    <td>
                      <span style={{ background: ESSAY_COLORS[t.essayType] + '20', color: ESSAY_COLORS[t.essayType], borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:700 }}>
                        {ESSAY_LABELS[t.essayType] || t.essayType}
                      </span>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <div style={{ display:'flex', gap:4, justifyContent:'center', flexWrap:'wrap' }}>
                        {LEVELS.map(l => {
                          const c = (t.questions||[]).filter(q => q.level === l).length;
                          return c > 0 ? <span key={l} style={{ background: LEVEL_COLORS[l]+'22', color: LEVEL_COLORS[l], borderRadius:20, padding:'1px 8px', fontSize:11, fontWeight:700 }}>{l[0].toUpperCase()}: {c}</span> : null;
                        })}
                      </div>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <span style={{ color: t.isActive ? '#22c55e' : '#ef4444', fontWeight:700 }}>{t.isActive ? '✓ Active' : '✗ Ẩn'}</span>
                    </td>
                    <td style={{ textAlign:'right' }}>
                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                        <button className="btn-icon" title="Quản lý câu hỏi"
                          onClick={() => setActiveTopic(activeTopic?._id === t._id ? null : t)}
                          style={{ background: activeTopic?._id === t._id ? '#6366f1' : undefined, color: activeTopic?._id === t._id ? '#fff' : undefined }}>
                          📋
                        </button>
                        <button className="btn-icon" title="Sửa topic" onClick={() => { setEditingTopic(t); setShowTopicModal(true); }}>✏️</button>
                        <button className="btn-icon btn-danger" title="Xóa topic" onClick={() => deleteTopic(t)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                  {activeTopic?._id === t._id && (
                    <tr key={t._id + '_questions'}>
                      <td colSpan={6} style={{ padding:0 }}>
                        <div style={{ background:'#f8fafc', borderTop:'2px solid #6366f1', padding:'16px 20px' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                            <div style={{ fontWeight:700, color:'#6366f1' }}>📋 Câu hỏi của: {t.topicEmoji} {t.topicName}</div>
                            <button className="btn-primary" style={{ fontSize:13, padding:'6px 14px' }}
                              onClick={() => { setEditingQ(null); setShowQModal(true); }}>+ Thêm câu hỏi</button>
                          </div>
                          {(activeTopic.questions||[]).length === 0 ? (
                            <div style={{ textAlign:'center', color:'#9ca3af', padding:'16px 0' }}>Chưa có câu hỏi nào. Nhấn "+ Thêm câu hỏi" để bắt đầu.</div>
                          ) : (
                            <table className="data-table" style={{ background:'#fff' }}>
                              <thead>
                                <tr>
                                  <th>Level</th>
                                  <th>Loại</th>
                                  <th>Câu hỏi</th>
                                  <th style={{ textAlign:'right' }}>Hành động</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(activeTopic.questions||[]).sort((a,b) => a.orderIndex - b.orderIndex).map(q => (
                                  <tr key={q._id}>
                                    <td><span style={{ color: LEVEL_COLORS[q.level], fontWeight:700, fontSize:12 }}>{q.level}</span></td>
                                    <td><span style={{ fontSize:12, color:'#6b7280' }}>{Q_LABELS[q.type] || q.type}</span></td>
                                    <td style={{ maxWidth:400 }}>
                                      <div style={{ fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q.questionText}</div>
                                    </td>
                                    <td style={{ textAlign:'right' }}>
                                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                                        <button className="btn-icon" onClick={() => { setEditingQ(q); setShowQModal(true); }}>✏️</button>
                                        <button className="btn-icon btn-danger" onClick={() => deleteQuestion(q._id)}>🗑️</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={Math.ceil(total / LIMIT)} onPageChange={setPage} />

      {showTopicModal && (
        <TopicModal
          topic={editingTopic}
          onClose={() => setShowTopicModal(false)}
          onSaved={forceReload}
        />
      )}

      {showQModal && activeTopic && (
        <QuestionModal
          topicId={activeTopic._id}
          question={editingQ}
          onClose={() => setShowQModal(false)}
          onSaved={refreshActiveTopic}
        />
      )}
    </div>
  );
}
