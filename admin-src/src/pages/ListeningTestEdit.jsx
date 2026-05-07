import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

const Q_TYPES = [
  { value: 'fill-blank', label: 'Fill-blank' },
  { value: 'sentence-completion', label: 'Sentence completion' },
  { value: 'multiple-choice', label: 'Multiple choice' },
  { value: 'matching', label: 'Matching' },
  { value: 'matching-info', label: 'Matching information' },
  { value: 'map-labelling', label: 'Map labelling' },
  { value: 'checkbox', label: 'Checkbox (chọn nhiều đáp án)' },
];

const BLANK_Q = { questionNumber: 1, type: 'fill-blank', questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' };

function defaultSection(partNumber) {
  const ranges = { 1: { start: 1, end: 10 }, 2: { start: 11, end: 20 }, 3: { start: 21, end: 30 }, 4: { start: 31, end: 40 } };
  return { partNumber, title: `Part ${partNumber}`, description: '', groupInstruction: '', questionRange: ranges[partNumber], questions: [] };
}

function parseSections(rawSections = []) {
  return [1, 2, 3, 4].map(partNum => {
    const sec = rawSections.find(s => s.partNumber === partNum);
    if (!sec) return defaultSection(partNum);
    const questions = (sec.questionGroups || []).flatMap(g => g.questions || []);
    const instruction = (sec.questionGroups || [])[0]?.instruction || '';
    return {
      partNumber: partNum,
      title: sec.title || `Part ${partNum}`,
      description: sec.description || '',
      groupInstruction: instruction,
      questionRange: sec.questionRange || { start: (partNum - 1) * 10 + 1, end: partNum * 10 },
      questions,
    };
  });
}

function buildSections(sections) {
  return sections.map(sec => ({
    partNumber: sec.partNumber,
    title: sec.title,
    description: sec.description || '',
    questionRange: sec.questionRange,
    questionGroups: sec.questions.length > 0
      ? [{ groupType: 'plain', instruction: sec.groupInstruction || '', questions: sec.questions }]
      : [],
  }));
}

export default function ListeningTestEdit() {
  const { id } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(isNew ? null : id);
  const [activePart, setActivePart] = useState(0);

  const [meta, setMeta] = useState({ name: '', seriesName: '', testNumber: 1, audioUrl: '', isActive: true });
  const [sections, setSections] = useState([1, 2, 3, 4].map(defaultSection));

  const [showQForm, setShowQForm] = useState(false);
  const [editQIdx, setEditQIdx] = useState(null);
  const [qForm, setQForm] = useState({ ...BLANK_Q });

  const setMetaField = k => e => setMeta(f => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked
       : e.target.type === 'number' ? Number(e.target.value)
       : e.target.value
  }));

  useEffect(() => {
    if (!savedId) return;
    apiFetch(`/listening/admin/tests/${savedId}`)
      .then(d => {
        const t = d.test;
        setMeta({ name: t.name || '', seriesName: t.seriesName || '', testNumber: t.testNumber || 1, audioUrl: t.audioUrl || '', isActive: t.isActive !== false });
        setSections(parseSections(t.sections));
      })
      .catch(() => toast('Không tải được đề', 'error'))
      .finally(() => setLoading(false));
  }, [savedId]);

  async function saveAll() {
    if (!meta.name.trim()) { toast('Vui lòng nhập tên đề', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...meta, sections: buildSections(sections) };
      if (!savedId) {
        const d = await apiFetch('/listening/admin/tests', { method: 'POST', body: JSON.stringify(payload) });
        setSavedId(d.test._id);
        window.history.replaceState(null, '', `/admin/listening-tests/${d.test._id}`);
        toast('Đã tạo đề Listening');
      } else {
        await apiFetch(`/listening/admin/tests/${savedId}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Đã lưu đề Listening');
      }
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  function updateSection(i, changes) {
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, ...changes } : s));
  }
  function updateRange(i, key, val) {
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, questionRange: { ...s.questionRange, [key]: Number(val) } } : s));
  }

  const sec = sections[activePart];

  function openAddQ() {
    const nextNum = sec.questions.length > 0
      ? Math.max(...sec.questions.map(q => q.questionNumber)) + 1
      : (sec.questionRange?.start || 1);
    setQForm({ ...BLANK_Q, questionNumber: nextNum });
    setEditQIdx(null);
    setShowQForm(true);
  }

  function openEditQ(qi) {
    const q = sec.questions[qi];
    setQForm({
      questionNumber: q.questionNumber,
      type: q.type,
      questionText: q.questionText || '',
      options: q.options?.length > 0 ? [...q.options, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
    });
    setEditQIdx(qi);
    setShowQForm(true);
  }

  function commitQ() {
    if (!qForm.correctAnswer.trim()) { toast('Vui lòng nhập đáp án', 'error'); return; }
    const q = {
      questionNumber: qForm.questionNumber,
      type: qForm.type,
      questionText: qForm.questionText,
      correctAnswer: qForm.correctAnswer.trim(),
      explanation: qForm.explanation.trim(),
      options: ['multiple-choice', 'matching'].includes(qForm.type) ? qForm.options.filter(o => o.trim()) : [],
    };
    setSections(prev => prev.map((s, i) => {
      if (i !== activePart) return s;
      const qs = [...s.questions];
      if (editQIdx !== null) qs[editQIdx] = q;
      else qs.push(q);
      return { ...s, questions: qs.sort((a, b) => a.questionNumber - b.questionNumber) };
    }));
    setShowQForm(false);
  }

  function deleteQ(qi) {
    confirm('Xóa câu hỏi này?', () => {
      setSections(prev => prev.map((s, i) =>
        i !== activePart ? s : { ...s, questions: s.questions.filter((_, j) => j !== qi) }
      ));
    });
  }

  const setQ = k => e => setQForm(f => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));
  const setOpt = (i, v) => setQForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options: o }; });

  const needsOptions = ['multiple-choice', 'matching', 'matching-info'].includes(qForm.type);
  const isCheckbox = qForm.type === 'checkbox';

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => window.close()}>← Đóng</button>
        <h2 style={{ margin: 0 }}>{isNew ? 'Thêm đề Listening' : (meta.name || 'Sửa đề Listening')}</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => window.close()}>Huỷ</button>
          <button className="btn btn-primary" onClick={saveAll} disabled={saving}>
            {saving ? 'Đang lưu...' : '💾 Lưu tất cả'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Thông tin đề</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tên đề *</label>
            <input className="form-input" value={meta.name} onChange={setMetaField('name')} placeholder="IELTS Listening Test 1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Series</label>
            <input className="form-input" value={meta.seriesName} onChange={setMetaField('seriesName')} placeholder="Cambridge 17" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Số đề</label>
            <input className="form-input" type="number" value={meta.testNumber} onChange={setMetaField('testNumber')} min={1} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 10 }}>
          <label className="form-label">URL Audio (Cloudinary)</label>
          <input className="form-input" value={meta.audioUrl} onChange={setMetaField('audioUrl')} placeholder="https://res.cloudinary.com/..." />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
          <input type="checkbox" checked={meta.isActive} onChange={setMetaField('isActive')} /> Kích hoạt
        </label>
      </div>

      {/* Parts */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Câu hỏi theo Part</div>
        <div className="inner-tabs-nav" style={{ marginBottom: 16 }}>
          {sections.map((s, i) => (
            <button key={i} className={`inner-tab${activePart === i ? ' active' : ''}`} onClick={() => setActivePart(i)}>
              Part {s.partNumber}
              <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.7 }}>({s.questions.length})</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tiêu đề part</label>
            <input className="form-input" value={sec.title} onChange={e => updateSection(activePart, { title: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Câu từ số</label>
            <input className="form-input" type="number" value={sec.questionRange.start} onChange={e => updateRange(activePart, 'start', e.target.value)} min={1} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Đến số</label>
            <input className="form-input" type="number" value={sec.questionRange.end} onChange={e => updateRange(activePart, 'end', e.target.value)} min={1} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Mô tả ngữ cảnh (context/situation, hiển thị trước câu hỏi)</label>
          <textarea className="form-input" rows={2} value={sec.description || ''} onChange={e => updateSection(activePart, { description: e.target.value })}
            placeholder={`VD: You will hear a conversation between two students discussing their assignment.`}
            style={{ fontSize: 13 }} />
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Hướng dẫn làm bài (hiển thị cho học sinh)</label>
          <input className="form-input" value={sec.groupInstruction || ''} onChange={e => updateSection(activePart, { groupInstruction: e.target.value })}
            placeholder="Write ONE WORD AND/OR A NUMBER for each answer." />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Câu hỏi ({sec.questions.length})</span>
          <button className="btn btn-primary btn-sm" onClick={openAddQ}>+ Thêm câu hỏi</button>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th style={{ width: 50 }}>SỐ</th><th style={{ width: 150 }}>LOẠI</th><th>NỘI DUNG / PLACEHOLDER</th><th style={{ width: 150 }}>ĐÁP ÁN</th><th style={{ width: 70 }}></th></tr>
            </thead>
            <tbody>
              {sec.questions.length === 0
                ? <tr><td colSpan={5} className="table-empty">Chưa có câu hỏi — nhấn "+ Thêm câu hỏi"</td></tr>
                : sec.questions.map((q, qi) => (
                  <tr key={qi}>
                    <td style={{ fontWeight: 700 }}>{q.questionNumber}</td>
                    <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{q.type}</span></td>
                    <td style={{ fontSize: 13, maxWidth: 280 }}>{(q.questionText || '–').slice(0, 90)}{(q.questionText || '').length > 90 ? '…' : ''}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{q.correctAnswer}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditQ(qi)}>✏️</button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteQ(qi)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: 'var(--surface2)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          <strong>Ghi chú:</strong> Câu fill-blank: dùng <code>________</code> hoặc <code>(Q14)</code> trong questionText để đánh dấu vị trí điền.
          Đáp án phải khớp chính xác (không phân biệt hoa/thường). Các options cho Multiple choice: nhập text từng dòng, đáp án là chữ cái A/B/C/D.
        </div>
      </div>

      {/* Question form modal */}
      {showQForm && (
        <div className="modal-overlay" onClick={() => setShowQForm(false)}>
          <div className="modal" style={{ maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editQIdx !== null ? 'Sửa câu hỏi' : 'Thêm câu hỏi'} — Part {sec.partNumber}</h3>
              <button className="modal-close" onClick={() => setShowQForm(false)}>✕</button>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Câu số *</label>
                  <input className="form-input" type="number" value={qForm.questionNumber} onChange={setQ('questionNumber')} min={1} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Loại câu hỏi *</label>
                  <select className="form-input" value={qForm.type} onChange={setQ('type')}>
                    {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {qForm.type === 'fill-blank' ? 'Văn bản có chỗ trống (ghi số câu hoặc ________)' : 'Nội dung câu hỏi'}
                </label>
                <textarea className="form-input" rows={3} value={qForm.questionText} onChange={setQ('questionText')}
                  placeholder={qForm.type === 'fill-blank' ? 'The meeting is on ________ at the community centre.' : 'What is the main purpose of the call?'} />
              </div>

              {needsOptions && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Lựa chọn (A, B, C, D...)</label>
                  {qForm.options.map((opt, i) => (
                    <input key={i} className="form-input" style={{ marginBottom: 5 }} value={opt}
                      onChange={e => setOpt(i, e.target.value)} placeholder={`${String.fromCharCode(65 + i)}. ...`} />
                  ))}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Đáp án đúng *</label>
                <input className="form-input" value={qForm.correctAnswer} onChange={setQ('correctAnswer')}
                  placeholder={
                    qForm.type === 'multiple-choice' ? 'A (hoặc B, C, D)' :
                    qForm.type === 'checkbox' ? '["A","C"] — JSON array các đáp án đúng' :
                    'Đáp án chính xác (dùng / để phân cách đáp án thay thế: cat/cats)'
                  } />
                {isCheckbox && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Format: ["A","C"] cho checkbox chọn nhiều</div>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Giải thích (tùy chọn)</label>
                <input className="form-input" value={qForm.explanation} onChange={setQ('explanation')} placeholder="Giải thích đáp án..." />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setShowQForm(false)}>Huỷ</button>
                <button className="btn btn-primary" onClick={commitQ}>Lưu câu hỏi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
