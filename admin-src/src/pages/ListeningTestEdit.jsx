import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import QuestionGroupBuilder from '../components/QuestionGroupBuilder';

function defaultSection(partNumber) {
  const ranges = { 1: { start: 1, end: 10 }, 2: { start: 11, end: 20 }, 3: { start: 21, end: 30 }, 4: { start: 31, end: 40 } };
  return { partNumber, title: `Part ${partNumber}`, description: '', questionRange: ranges[partNumber], questionGroups: [] };
}

function parseSections(rawSections = []) {
  return [1, 2, 3, 4].map(partNum => {
    const sec = rawSections.find(s => s.partNumber === partNum);
    if (!sec) return defaultSection(partNum);
    return {
      partNumber: partNum,
      title: sec.title || `Part ${partNum}`,
      description: sec.description || '',
      questionRange: sec.questionRange || { start: (partNum - 1) * 10 + 1, end: partNum * 10 },
      questionGroups: sec.questionGroups || [],
    };
  });
}

function buildSections(sections) {
  return sections.map(sec => ({
    partNumber: sec.partNumber,
    title: sec.title,
    description: sec.description || '',
    questionRange: sec.questionRange,
    questionGroups: sec.questionGroups || [],
  }));
}

export default function ListeningTestEdit() {
  const { id } = useParams();
  const toast = useToast();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(isNew ? null : id);
  const [activePart, setActivePart] = useState(0);

  const [meta, setMeta] = useState({ name: '', seriesName: '', testNumber: 1, audioUrl: '', isActive: true });
  const [sections, setSections] = useState([1, 2, 3, 4].map(defaultSection));

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

  const totalQs = sec.questionGroups.reduce((n, g) => n + (g.questions?.length || 0), 0);

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
          {sections.map((s, i) => {
            const qCount = s.questionGroups.reduce((n, g) => n + (g.questions?.length || 0), 0);
            return (
              <button key={i} className={`inner-tab${activePart === i ? ' active' : ''}`} onClick={() => setActivePart(i)}>
                Part {s.partNumber}
                <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.7 }}>({qCount})</span>
              </button>
            );
          })}
        </div>

        {/* Part metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 12, marginBottom: 12 }}>
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

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Mô tả ngữ cảnh (hiển thị trước câu hỏi)</label>
          <textarea className="form-input" rows={2} value={sec.description || ''} onChange={e => updateSection(activePart, { description: e.target.value })}
            placeholder="VD: You will hear a conversation between two students discussing their assignment."
            style={{ fontSize: 13 }} />
        </div>

        {/* Question groups for this Part */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Câu hỏi Part {sec.partNumber} ({totalQs} câu)</span>
        </div>

        <QuestionGroupBuilder
          groups={sec.questionGroups || []}
          onChange={groups => updateSection(activePart, { questionGroups: groups })}
          context="listening"
        />

        <div style={{ marginTop: 16, padding: 12, background: 'var(--surface2)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          <strong>Ghi chú:</strong> Mỗi Part có thể có nhiều nhóm câu hỏi. Fill-blank: dùng <code>________</code> hoặc <code>(Q14)</code>. Đáp án không phân biệt hoa/thường. Multiple choice: đáp án là chữ cái A/B/C/D.
        </div>
      </div>
    </div>
  );
}
