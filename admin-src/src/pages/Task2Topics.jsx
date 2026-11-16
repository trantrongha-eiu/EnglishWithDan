import { useState, useEffect, Fragment } from 'react';
import { apiFetch, FRONTEND_URL } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';
import PageHeader from '../components/ui/PageHeader';

// Admin side of task2-practice.html ("Task 2 Luyện đề tuần"). Every
// Task2Topic is one Buổi (numbered over the active topics in week,
// orderIndex order — same as the student page). Rebuilt 2026-11-16:
//  - the 📋 panel now loads the full topic (/admin/task2/topics/:id) — the
//    list rows only carry counts, so the old panel always said "Chưa có câu
//    hỏi" and ✏️ opened with an empty prompt (saving wiped the brainstorm);
//  - step ③ "Dịch câu" is shown as the student meets it: Daniel's sample
//    sentences grouped Mở bài / Thân bài 1 / Thân bài 2 + "Tự viết kết bài",
//    next to the sample essay itself; the sets they replaced sit under
//    "Đã thay" (isActive:false, kept for students' history);
//  - vocabulary editor + per-student progress (steps ① ② ③ ④⑤).
// Content source of step ③: backend/scripts/data/task2/sampleSentences.js →
// scripts/seedTask2SampleSentences.js. Re-running the seeder overwrites
// sentences edited here (matched by questionId), so lasting edits belong in
// that data file.

const LIMIT = 15;
const ESSAY_TYPES = ['advantages_disadvantages', 'cause_effect', 'cause_solution', 'effect_solution', 'agree_disagree', 'discuss_both_views', 'positive_or_negative_development'];
const ESSAY_LABELS = { advantages_disadvantages: 'Adv & Disadv', cause_effect: 'Cause & Effect', cause_solution: 'Cause & Solution', effect_solution: 'Effect & Solution', agree_disagree: 'Agree/Disagree', discuss_both_views: 'Discuss Both Views', positive_or_negative_development: 'Positive/Negative' };
// Default brainstorm "side" labels per essay type — mirrors
// backend/scripts/data/task2Augment.js SIDE_LABELS.
const BH_SIDE_LABELS = {
  advantages_disadvantages: ['Ưu điểm (Advantages)', 'Nhược điểm (Disadvantages)'],
  cause_effect:             ['Nguyên nhân (Causes)', 'Hệ quả (Effects)'],
  cause_solution:           ['Nguyên nhân (Causes)', 'Giải pháp (Solutions)'],
  effect_solution:          ['Hệ quả (Effects)', 'Giải pháp (Solutions)'],
  agree_disagree:           ['Lý do ĐỒNG Ý', 'Lý do KHÔNG đồng ý / phản biện'],
  discuss_both_views:       ['Quan điểm 1 (View 1)', 'Quan điểm 2 (View 2)'],
  positive_or_negative_development: ['Mặt tích cực (Positive)', 'Mặt tiêu cực (Negative)'],
};
const ESSAY_COLORS = { advantages_disadvantages: '#4CAF50', cause_effect: '#FF9800', cause_solution: '#FF9800', effect_solution: '#FF9800', agree_disagree: '#9C27B0', discuss_both_views: '#2196F3', positive_or_negative_development: '#0ea5e9' };
const Q_TYPES = ['essay_type_recognition', 'fill_blank', 'rearrange', 'translation', 'error_correction', 'topic_sentence', 'short_writing', 'paraphrase'];
const Q_LABELS = { essay_type_recognition: 'Nhận diện dạng', fill_blank: 'Điền chỗ trống', rearrange: 'Sắp xếp từ', translation: 'Dịch câu', error_correction: 'Sửa lỗi', topic_sentence: 'Chọn topic sentence', short_writing: 'Tự viết kết bài', paraphrase: 'Paraphrase' };
const LEVELS = ['beginner', 'elementary', 'intermediate'];
const LEVEL_COLORS = { beginner: 'var(--green)', elementary: 'var(--blue)', intermediate: '#a855f7' };
const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);
const STEP3 = new Set(['translation', 'paraphrase', 'short_writing']);
const SECTIONS = [
  { key: 'intro', title: 'Mở bài', re: /^MỞ BÀI\b/ },
  { key: 'body1', title: 'Thân bài 1', re: /^THÂN BÀI 1\b/ },
  { key: 'body2', title: 'Thân bài 2', re: /^THÂN BÀI 2\b/ },
];
const SEC_TITLE = { intro: 'Mở bài', body1: 'Thân bài 1', body2: 'Thân bài 2', conclusion: 'Kết bài (tự viết)' };

const defaultTopic = { week: 1, block: 'advantages_disadvantages', topicName: '', topicEmoji: '📝', essayType: 'advantages_disadvantages', prompt: '', brainstormHints: [], orderIndex: 0, isActive: true };
const defaultQ = { level: 'intermediate', type: 'translation', questionText: '', options: '', baseWords: '', correctAnswer: '', promptVi: '', explanationVi: '', explanationEn: '', modelAnswer: '', fallbackKeywords: '', sentenceStructure: '', orderIndex: 0, isActive: true };

function sectionOf(q) {
  if (q.type === 'short_writing') return 'conclusion';
  const s = SECTIONS.find(x => x.re.test(q.questionText || ''));
  return s ? s.key : null;
}
// "MỞ BÀI · Dịch câu trong bài mẫu (dùng cấu trúc "X"):\n\n"<vi>"" → { vi, key, keyKind }
function parseSampleText(qt) {
  const text = String(qt || '');
  const km = text.match(/dùng (cấu trúc|từ) "([^"]+)"/);
  const vm = text.match(/\n\n"([\s\S]*)"\s*$/);
  return { vi: vm ? vm[1] : text.replace(/^[^·]*·\s*/, ''), key: km ? km[2] : '', keyKind: km ? km[1] : '' };
}
const words = s => (String(s || '').trim() ? String(s).trim().split(/\s+/).length : 0);
const fmtDate = d => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');
const studentUrl = t => `${FRONTEND_URL}/task2-practice.html?week=${t.week}&topicId=${t._id}`;

function Chip({ color, children, title }) {
  return <span title={title} style={{ background: color + '22', color, borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{children}</span>;
}

// ── Topic modal ─────────────────────────────────────────────────────────
// Always opened with the FULL topic (fetched by the caller).
function TopicModal({ topic, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    const t = { ...defaultTopic, ...(topic || {}) };
    const bh = (t.brainstormHints && t.brainstormHints.length)
      ? t.brainstormHints.map(h => ({ side: h.side || '', points: (h.points || []).join('\n') }))
      : (BH_SIDE_LABELS[t.essayType] || ['Nhóm ý 1', 'Nhóm ý 2']).map(s => ({ side: s, points: '' }));
    return { ...t, brainstormHints: bh };
  });
  const [saving, setSaving] = useState(false);
  const showToast = useToast();
  const isEdit = !!topic?._id;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function bhSet(i, k, v) {
    setForm(f => ({ ...f, brainstormHints: f.brainstormHints.map((h, j) => (j === i ? { ...h, [k]: v } : h)) }));
  }

  async function save() {
    if (!form.topicName.trim() || !form.prompt.trim()) return showToast('Điền tên topic và đề bài', 'error');
    setSaving(true);
    try {
      const body = {
        week: Number(form.week) || 1,
        block: form.block || form.essayType,
        topicName: form.topicName.trim(),
        topicEmoji: form.topicEmoji || '📝',
        essayType: form.essayType,
        prompt: form.prompt.trim(),
        orderIndex: Number(form.orderIndex) || 0,
        isActive: !!form.isActive,
        brainstormHints: (form.brainstormHints || [])
          .map(h => ({ side: (h.side || '').trim(), points: (h.points || '').split('\n').map(s => s.trim()).filter(Boolean) }))
          .filter(h => h.side && h.points.length),
      };
      if (isEdit) await apiFetch(`/admin/task2/topics/${topic._id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await apiFetch('/admin/task2/topics', { method: 'POST', body: JSON.stringify(body) });
      showToast(isEdit ? 'Đã cập nhật topic' : 'Đã thêm topic mới', 'success');
      onSaved();
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Sửa buổi / topic' : 'Thêm topic mới'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
            <div>
              <label className="form-label">Tên topic *</label>
              <input className="form-input" value={form.topicName} onChange={e => set('topicName', e.target.value)} placeholder="Technology in Education" />
            </div>
            <div>
              <label className="form-label">Emoji</label>
              <input className="form-input" value={form.topicEmoji} onChange={e => set('topicEmoji', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 110px', gap: 10 }}>
            <div>
              <label className="form-label">Tuần</label>
              <select className="form-input" value={form.week} onChange={e => set('week', parseInt(e.target.value, 10))}>
                {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Dạng bài *</label>
              <select className="form-input" value={form.essayType} onChange={e => { set('essayType', e.target.value); set('block', e.target.value); }}>
                {ESSAY_TYPES.map(t => <option key={t} value={t}>{ESSAY_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Thứ tự trong tuần</label>
              <input className="form-input" type="number" value={form.orderIndex || 0} onChange={e => set('orderIndex', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Đề bài IELTS (prompt) *</label>
            <textarea className="form-input" rows={3} value={form.prompt} onChange={e => set('prompt', e.target.value)} />
            {isEdit && (
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                Bài mẫu Daniel và nút “Viết bài ngay” khớp với đề này qua đề Writing Task 2 đã liên kết — đổi đề ở đây không đổi bài mẫu.
              </div>
            )}
          </div>
          <div>
            <label className="form-label">② Brainstorm — gợi ý ý tưởng cho từng nhóm (mỗi dòng 1 ý)</label>
            {(form.brainstormHints || []).map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '190px 1fr 32px', gap: 8, marginBottom: 6, alignItems: 'start' }}>
                <input className="form-input" value={h.side} placeholder="Nhãn nhóm ý" onChange={e => bhSet(i, 'side', e.target.value)} />
                <textarea className="form-input" rows={3} value={h.points} placeholder="mỗi dòng 1 ý gợi ý" onChange={e => bhSet(i, 'points', e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm" title="Xóa nhóm ý" onClick={() => setForm(f => ({ ...f, brainstormHints: f.brainstormHints.filter((_, j) => j !== i) }))}>✕</button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(f => ({ ...f, brainstormHints: [...(f.brainstormHints || []), { side: '', points: '' }] }))}>+ Thêm nhóm ý</button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)} />
            Hiện buổi này cho học sinh
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm topic')}</button>
        </div>
      </div>
    </div>
  );
}

// ── Question modal ──────────────────────────────────────────────────────
function QuestionModal({ topicId, question, onClose, onSaved }) {
  const isEdit = !!question?._id;
  const [form, setForm] = useState(question ? {
    ...defaultQ,
    ...question,
    options: (question.options || []).join('\n'),
    baseWords: (question.baseWords || []).join(' '),
    fallbackKeywords: (question.fallbackKeywords || []).join('\n'),
  } : defaultQ);
  const [saving, setSaving] = useState(false);
  const showToast = useToast();
  const isChoice = ['essay_type_recognition', 'topic_sentence'].includes(form.type);
  const isRearrange = form.type === 'rearrange';
  const isSample = !!sectionOf(form) && form.type !== 'short_writing';

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.questionText.trim()) return showToast('Nhập nội dung câu hỏi', 'error');
    setSaving(true);
    try {
      const split = (v, re) => (typeof v === 'string' ? v.split(re).map(s => s.trim()).filter(Boolean) : v);
      const body = {
        level: form.level, type: form.type, questionText: form.questionText,
        options: split(form.options, '\n'),
        baseWords: split(form.baseWords, /[\s,]+/),
        fallbackKeywords: split(form.fallbackKeywords, '\n'),
        correctAnswer: form.correctAnswer || '',
        modelAnswer: form.modelAnswer || '',
        promptVi: form.promptVi || '',
        explanationVi: form.explanationVi || '',
        explanationEn: form.explanationEn || '',
        sentenceStructure: form.sentenceStructure || '',
        orderIndex: parseInt(form.orderIndex, 10) || 0,
        isActive: form.isActive !== false,
      };
      if (isEdit) await apiFetch(`/admin/task2/topics/${topicId}/questions/${question._id}`, { method: 'PUT', body: JSON.stringify(body) });
      else await apiFetch(`/admin/task2/topics/${topicId}/questions`, { method: 'POST', body: JSON.stringify(body) });
      showToast(isEdit ? 'Đã cập nhật câu hỏi' : 'Đã thêm câu hỏi', 'success');
      onSaved();
      onClose();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}{question?.questionId ? <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>{question.questionId}</span> : null}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isSample && (
            <div style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(234,179,8,.12)', border: '1px solid rgba(234,179,8,.35)' }}>
              Câu này lấy từ bài mẫu Daniel. Chạy lại <code>seedTask2SampleSentences.js</code> sẽ ghi đè bản sửa ở đây — muốn giữ lâu dài thì sửa cả trong <code>backend/scripts/data/task2/sampleSentences.js</code>.
              Giữ nguyên tiền tố “MỞ BÀI · / THÂN BÀI 1 · / THÂN BÀI 2 ·” để học sinh thấy câu đúng đoạn.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 10 }}>
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
            <label className="form-label">Nội dung câu hỏi * {form.type === 'translation' && <span style={{ fontWeight: 400, color: 'var(--text3)' }}>— ghi `dùng cấu trúc "cụm"` hoặc `dùng từ "cụm"` để có dạng chọn cụm / điền cụm</span>}</label>
            <textarea className="form-input" rows={4} value={form.questionText} onChange={e => set('questionText', e.target.value)} />
          </div>
          {isChoice && (
            <div>
              <label className="form-label">Các lựa chọn (mỗi dòng 1 đáp án)</label>
              <textarea className="form-input" rows={4} value={form.options} onChange={e => set('options', e.target.value)} />
            </div>
          )}
          {isRearrange && (
            <>
              <div>
                <label className="form-label">Từ để sắp xếp — baseWords (cách nhau bởi dấu cách hoặc phẩy)</label>
                <input className="form-input" value={form.baseWords || ''} onChange={e => set('baseWords', e.target.value)} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Để trống: lấy các cụm trong [ … / … ] của câu hỏi, hoặc tách từ Đáp án đúng.</div>
              </div>
              <div>
                <label className="form-label">Nghĩa tiếng Việt (hiện trên câu Sắp xếp từ)</label>
                <input className="form-input" value={form.promptVi || ''} onChange={e => set('promptVi', e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className="form-label">{form.type === 'short_writing' ? 'Kết bài mẫu (chỉ hiện SAU khi học sinh nộp)' : 'Đáp án đúng (correctAnswer)'}</label>
            <textarea className="form-input" rows={form.type === 'short_writing' ? 4 : 2} value={form.correctAnswer || ''} onChange={e => set('correctAnswer', e.target.value)} />
          </div>
          {form.type !== 'short_writing' && (
            <div>
              <label className="form-label">Model answer (để trống = dùng đáp án đúng)</label>
              <textarea className="form-input" rows={2} value={form.modelAnswer || ''} onChange={e => set('modelAnswer', e.target.value)} />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="form-label">Giải thích (tiếng Việt)</label>
              <textarea className="form-input" rows={2} value={form.explanationVi || ''} onChange={e => set('explanationVi', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Giải thích (tiếng Anh)</label>
              <textarea className="form-input" rows={2} value={form.explanationEn || ''} onChange={e => set('explanationEn', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="form-label">Từ khóa (gợi ý + chấm dự phòng khi AI lỗi, mỗi dòng 1 cụm)</label>
              <textarea className="form-input" rows={3} value={form.fallbackKeywords} onChange={e => set('fallbackKeywords', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Gợi ý cấu trúc câu (để trống = tự suy ra)</label>
              <textarea className="form-input" rows={3} value={form.sentenceStructure || ''} onChange={e => set('sentenceStructure', e.target.value)} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text2)' }}>
            <input type="checkbox" checked={form.isActive !== false} onChange={e => set('isActive', e.target.checked)} />
            Hiển thị câu hỏi
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm câu hỏi')}</button>
        </div>
      </div>
    </div>
  );
}

// ── One student's work on one buổi ──────────────────────────────────────
function StudentWorkModal({ topic, student, onClose }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  useEffect(() => {
    apiFetch(`/admin/task2/topics/${topic._id}/students/${student.userId}`)
      .then(setData)
      .catch(e => { toast(e.message, 'error'); onClose(); });
  }, [topic._id, student.userId]); // eslint-disable-line react-hooks/exhaustive-deps
  const sec = data?.sections || {};
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{student.name} · Buổi {topic.session || '—'} · {topic.topicName}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '75vh', overflowY: 'auto' }}>
          {!data ? <div style={{ color: 'var(--text3)' }}>Đang tải…</div> : (
            <>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>③ Dịch câu</div>
                {data.sentences.map((s, i) => (
                  <div key={s.questionId} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text3)', minWidth: 22 }}>{i + 1}.</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 74 }}>{SEC_TITLE[s.section] || '—'}</span>
                      <span style={{ flex: 1 }}>
                        {s.en
                          ? <span style={{ color: s.isCorrect ? 'var(--green)' : 'var(--danger)' }}>{s.isCorrect ? '✓' : '✗'} {s.en}</span>
                          : <span style={{ color: 'var(--text3)' }}>chưa làm</span>}
                        {s.type !== 'short_writing' && s.en && !s.isCorrect && <div style={{ color: 'var(--text3)', fontSize: 12 }}>Mẫu: {s.model}</div>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {(data.brainstorm || []).some(x => (x || '').trim()) && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>② Brainstorm</div>
                  {data.brainstorm.map((b, i) => (b || '').trim() ? <div key={i} style={{ whiteSpace: 'pre-wrap', fontSize: 13, marginBottom: 6 }}>{b}</div> : null)}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>④⑤ Bài viết {data.submittedAt ? `· đã nộp chấm ${fmtDate(data.submittedAt)}` : ''}</div>
                {['intro', 'body1', 'body2', 'conclusion'].map(k => (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{SEC_TITLE[k].replace(' (tự viết)', '')} · {words(sec[k])} từ</div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{(sec[k] || '').trim() || <span style={{ color: 'var(--text3)' }}>—</span>}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail panel (one buổi) ─────────────────────────────────────────────
function TopicPanel({ topicId, version, onEditTopic, onCountsChanged }) {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('step3');
  const [editQ, setEditQ] = useState(undefined); // undefined = closed, null = new
  const [students, setStudents] = useState(null);
  const [studentOpen, setStudentOpen] = useState(null);
  const [vocab, setVocab] = useState(null);
  const [savingVocab, setSavingVocab] = useState(false);
  const [showSample, setShowSample] = useState(true);

  async function reload() {
    try {
      const d = await apiFetch(`/admin/task2/topics/${topicId}`);
      setData(d);
      setVocab((d.topic.vocabularyList || []).map(v => ({ term: v.term || '', definitionVi: v.definitionVi || '', example: v.example || '' })));
    } catch (e) { toast(e.message, 'error'); }
  }
  useEffect(() => { (async () => { await reload(); })(); }, [topicId, version]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (tab !== 'students' || students) return;
    apiFetch(`/admin/task2/topics/${topicId}/students`)
      .then(d => setStudents(d.students || []))
      .catch(e => { toast(e.message, 'error'); setStudents([]); });
  }, [tab, topicId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <div style={{ padding: 20, color: 'var(--text3)' }}>Đang tải buổi học…</div>;
  const { topic, sample } = data;
  const qs = (topic.questions || []).slice().sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const active = qs.filter(q => q.isActive !== false);
  const retired = qs.filter(q => q.isActive === false);
  const step3 = active.filter(q => STEP3.has(q.type));
  const others = active.filter(q => !STEP3.has(q.type));
  const bySec = k => step3.filter(q => sectionOf(q) === k);
  const unsectioned = step3.filter(q => !sectionOf(q));

  async function toggleQ(q) {
    try {
      await apiFetch(`/admin/task2/topics/${topic._id}/questions/${q._id}`, { method: 'PUT', body: JSON.stringify({ isActive: q.isActive === false }) });
      toast(q.isActive === false ? 'Đã hiện lại câu hỏi' : 'Đã ẩn câu hỏi', 'success');
      await reload(); onCountsChanged();
    } catch (e) { toast(e.message, 'error'); }
  }
  function delQ(q) {
    confirm('Xóa hẳn câu hỏi này? Kết quả cũ của học sinh cho câu này sẽ không còn khớp được. Thường chỉ cần Ẩn.', async () => {
      try {
        await apiFetch(`/admin/task2/topics/${topic._id}/questions/${q._id}`, { method: 'DELETE' });
        toast('Đã xóa câu hỏi', 'success');
        await reload(); onCountsChanged();
      } catch (e) { toast(e.message, 'error'); }
    });
  }
  async function saveVocab() {
    const list = vocab.map(v => ({ term: v.term.trim(), definitionVi: v.definitionVi.trim(), example: v.example.trim() })).filter(v => v.term);
    setSavingVocab(true);
    try {
      await apiFetch(`/admin/task2/topics/${topic._id}`, { method: 'PUT', body: JSON.stringify({ vocabularyList: list }) });
      toast(`Đã lưu ${list.length} từ vựng`, 'success');
      await reload(); onCountsChanged();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSavingVocab(false); }
  }

  const qActions = q => (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end', flexShrink: 0 }}>
      <button className={`btn btn-sm btn-icon ${q.isActive !== false ? 'btn-warning' : 'btn-success'}`} title={q.isActive !== false ? 'Ẩn câu hỏi' : 'Hiện lại'} onClick={() => toggleQ(q)}>
        {q.isActive !== false ? '🙈' : '👁'}
      </button>
      <button className="btn btn-ghost btn-sm btn-icon" title="Sửa" onClick={() => setEditQ(q)}>✏️</button>
      {isAdmin && <button className="btn btn-danger btn-sm btn-icon" title="Xóa hẳn" onClick={() => delQ(q)}>🗑️</button>}
    </div>
  );

  const sentenceCard = (q, n) => {
    const p = parseSampleText(q.questionText);
    const model = q.correctAnswer || q.modelAnswer || '';
    return (
      <div key={q._id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text3)', fontSize: 12, minWidth: 20 }}>{n}.</span>
        <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
          <div>{p.vi}</div>
          <div style={{ color: 'var(--text2)', marginTop: 2 }}>{model}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {p.key ? <Chip color={p.keyKind === 'từ' ? '#0ea5e9' : '#a855f7'} title={p.keyKind === 'từ' ? 'Từ vựng của buổi' : 'Khung câu Band 7'}>{p.keyKind === 'từ' ? 'từ' : 'cấu trúc'}: {p.key}</Chip>
              : <Chip color="#6b7280" title="Không có cụm khoá → nghe chép / gõ / ghép cụm">không cụm khoá</Chip>}
            <Chip color="#6b7280">{words(model)} từ{words(model) > 22 ? ' · ghép cụm' : ''}</Chip>
            {q.questionId && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{q.questionId}</span>}
          </div>
        </div>
        {qActions(q)}
      </div>
    );
  };

  const tabBtn = (k, label) => (
    <button type="button" className={`btn btn-sm ${tab === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(k)}>{label}</button>
  );
  let n = 0;

  return (
    <div style={{ background: 'var(--surface2)', borderTop: '2px solid #6366f1', padding: '14px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#6366f1' }}>Buổi {topic.session || '—'} · {topic.topicEmoji} {topic.topicName}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{topic.prompt}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <a className="btn btn-ghost btn-sm" href={studentUrl(topic)} target="_blank" rel="noreferrer">Trang học sinh ↗</a>
          <button className="btn btn-ghost btn-sm" onClick={() => onEditTopic(topic)}>✏️ Sửa đề / brainstorm</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
        {tabBtn('step3', `③ Dịch câu (${step3.length})`)}
        {tabBtn('other', `Câu hỏi khác (${others.length})`)}
        {tabBtn('vocab', `① Từ vựng (${(topic.vocabularyList || []).length})`)}
        {tabBtn('students', '👥 Học sinh')}
        {retired.length > 0 && tabBtn('retired', `Đã thay (${retired.length})`)}
      </div>

      {tab === 'step3' && (
        <div style={{ display: 'grid', gridTemplateColumns: sample && showSample ? 'minmax(0,3fr) minmax(0,2fr)' : '1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
              Học sinh dịch các câu theo thứ tự bài luận; đúng ≥ 70% mới mở phần viết. Cụm khoá quyết định dạng bài: có cụm → chọn cụm / điền cụm; không có → nghe chép / gõ; dài hơn 22 từ → ghép cụm.
              {sample && <> <button type="button" className="link-btn" onClick={() => setShowSample(v => !v)}>{showSample ? 'Ẩn bài mẫu' : 'Hiện bài mẫu Daniel'}</button></>}
            </div>
            {SECTIONS.map(s => {
              const list = bySec(s.key);
              if (!list.length) return null;
              return (
                <div key={s.key} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{s.title} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>· {list.length} câu</span></div>
                  {list.map(q => sentenceCard(q, ++n))}
                </div>
              );
            })}
            {unsectioned.filter(q => q.type !== 'short_writing').length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>Câu dịch chưa gắn đoạn</div>
                {unsectioned.filter(q => q.type !== 'short_writing').map(q => sentenceCard(q, ++n))}
              </div>
            )}
            {bySec('conclusion').map(q => (
              <div key={q._id} style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>✍️ Tự viết kết bài <span style={{ color: 'var(--text3)', fontWeight: 400 }}>· học sinh viết theo template Band 7, AI chấm; kết bài mẫu hiện sau khi nộp</span></div>
                <div style={{ display: 'flex', gap: 10, padding: '8px 0' }}>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <div style={{ color: 'var(--text3)', fontSize: 12 }}>{q.questionText}</div>
                    <div style={{ color: 'var(--text2)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{q.correctAnswer || q.modelAnswer}</div>
                  </div>
                  {qActions(q)}
                </div>
              </div>
            ))}
            {!bySec('conclusion').length && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>⚠️ Buổi này chưa có câu “Tự viết kết bài”.</div>}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setEditQ(null)}>+ Thêm câu</button>
          </div>
          {sample && showSample && (
            <div style={{ fontSize: 13, background: 'var(--surface)', borderRadius: 10, padding: '10px 14px', alignSelf: 'start', maxHeight: 640, overflowY: 'auto' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>📄 Bài mẫu từ Daniel</div>
              {sample.sections.map((s, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>{s.title || ['Mở bài', 'Thân bài 1', 'Thân bài 2', 'Kết bài'][i]}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{s.content}</div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Sửa bài mẫu ở Writing ▸ Đề Task 2. Sửa xong, câu dịch không còn khớp nguyên văn thì script seed sẽ bỏ qua buổi này cho tới khi cập nhật sampleSentences.js.</div>
            </div>
          )}
          {!sample && <div style={{ fontSize: 12, color: 'var(--text3)' }}>Không tìm thấy bài mẫu Daniel cho đề này (Writing ▸ Đề Task 2).</div>}
        </div>
      )}

      {tab === 'other' && (
        <>
          {others.length === 0 ? <div style={{ color: 'var(--text3)', padding: '8px 0' }}>Không có câu hỏi khác.</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>LEVEL</th><th>LOẠI</th><th>CÂU HỎI</th><th>ĐÁP ÁN</th><th></th></tr></thead>
                <tbody>
                  {others.map(q => (
                    <tr key={q._id}>
                      <td><span style={{ color: LEVEL_COLORS[q.level], fontWeight: 700, fontSize: 12 }}>{q.level}</span></td>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{Q_LABELS[q.type] || q.type}</td>
                      <td style={{ maxWidth: 380, fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{q.questionText}</td>
                      <td style={{ maxWidth: 220, fontSize: 12, color: 'var(--text2)', wordBreak: 'break-word' }}>{q.correctAnswer || q.modelAnswer}</td>
                      <td>{qActions(q)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setEditQ(null)}>+ Thêm câu hỏi</button>
        </>
      )}

      {tab === 'retired' && (
        <>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
            Các câu đã được thay (bộ câu dịch cũ, câu trùng). Học sinh không thấy nữa; giữ lại để lịch sử làm bài cũ vẫn khớp. Học sinh đã đúng ≥ 70% bộ cũ vẫn được mở phần viết.
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>LOẠI</th><th>CÂU HỎI</th><th>ĐÁP ÁN</th><th></th></tr></thead>
              <tbody>
                {retired.map(q => (
                  <tr key={q._id} style={{ opacity: 0.75 }}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{Q_LABELS[q.type] || q.type}</td>
                    <td style={{ maxWidth: 380, fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{q.questionText}</td>
                    <td style={{ maxWidth: 240, fontSize: 12, color: 'var(--text2)', wordBreak: 'break-word' }}>{q.correctAnswer || q.modelAnswer}</td>
                    <td>{qActions(q)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'vocab' && vocab && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Bước ①: học sinh lưu hết từ vào sổ và đạt quiz ≥ 70% mới mở các bước sau. Quiz cần ít nhất 4 từ có nghĩa tiếng Việt.</div>
          {vocab.map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1.6fr) 32px', gap: 6, marginBottom: 6 }}>
              <input className="form-input" placeholder="Từ / cụm" value={v.term} onChange={e => setVocab(l => l.map((x, j) => (j === i ? { ...x, term: e.target.value } : x)))} />
              <input className="form-input" placeholder="Nghĩa tiếng Việt" value={v.definitionVi} onChange={e => setVocab(l => l.map((x, j) => (j === i ? { ...x, definitionVi: e.target.value } : x)))} />
              <input className="form-input" placeholder="Ví dụ" value={v.example} onChange={e => setVocab(l => l.map((x, j) => (j === i ? { ...x, example: e.target.value } : x)))} />
              <button type="button" className="btn btn-ghost btn-sm" title="Xoá dòng" onClick={() => setVocab(l => l.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setVocab(l => [...l, { term: '', definitionVi: '', example: '' }])}>+ Thêm từ</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={saveVocab} disabled={savingVocab}>{savingVocab ? 'Đang lưu…' : 'Lưu từ vựng'}</button>
          </div>
        </div>
      )}

      {tab === 'students' && (
        students === null ? <div style={{ color: 'var(--text3)', padding: '8px 0' }}>Đang tải…</div>
          : students.length === 0 ? <div style={{ color: 'var(--text3)', padding: '8px 0' }}>Chưa có học sinh nào học buổi này trong 3 tháng gần đây.</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>HỌC SINH</th>
                    <th title="Từ đã lưu / tổng · quiz cao nhất">① TỪ VỰNG</th>
                    <th title="Số nhóm ý đã ghi">② Ý</th>
                    <th title="Câu đúng / tổng câu hiện tại (cần ≥ 70%)">③ DỊCH CÂU</th>
                    <th title="Số từ: mở bài / thân 1 / thân 2 / kết bài">④⑤ BÀI VIẾT</th>
                    <th>LẦN CUỐI</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const pct = s.step3Total ? Math.round(s.step3Correct / s.step3Total * 100) : 0;
                    return (
                      <tr key={s.userId} style={{ cursor: 'pointer' }} onClick={() => setStudentOpen(s)} title="Xem câu dịch và bài viết">
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ fontSize: 12 }}>{s.vocabSaved}/{s.vocabTotal}{s.quizBest != null ? ` · quiz ${s.quizBest}%` : ''}</td>
                        <td style={{ fontSize: 12 }}>{s.brainstorm || '—'}</td>
                        <td style={{ fontSize: 12 }}>
                          <b style={{ color: pct >= 70 ? 'var(--green)' : 'var(--text)' }}>{s.step3Correct}/{s.step3Total}</b>
                          <span style={{ color: 'var(--text3)' }}> · đã làm {s.step3Done}</span>
                        </td>
                        <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                          {s.words.intro}/{s.words.body1}/{s.words.body2}/{s.words.conclusion}
                          {s.submittedAt && <span style={{ color: 'var(--green)' }}> · đã nộp</span>}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmtDate(s.last)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
      )}

      {editQ !== undefined && (
        <QuestionModal
          topicId={topic._id}
          question={editQ}
          onClose={() => setEditQ(undefined)}
          onSaved={async () => { await reload(); onCountsChanged(); }}
        />
      )}
      {studentOpen && <StudentWorkModal topic={topic} student={studentOpen} onClose={() => setStudentOpen(null)} />}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
// Named Task2Exercises.jsx until 2026-07-25 — it manages Topics with nested
// Questions (Task2Topic.questions). Route /task2-exercises unchanged.
export default function Task2Topics() {
  const [topics, setTopics] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [weekFilter, setWeekFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tick, setTick] = useState(0);
  const [topicModal, setTopicModal] = useState(undefined); // undefined closed · null new · object edit
  const [openId, setOpenId] = useState(null);

  const showToast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useAuth();

  function qs(extra) {
    const params = new URLSearchParams(extra);
    if (weekFilter !== 'all') params.set('week', weekFilter);
    if (typeFilter !== 'all') params.set('essayType', typeFilter);
    if (activeFilter !== 'all') params.set('active', activeFilter);
    if (search) params.set('search', search);
    return params;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await apiFetch(`/admin/task2/topics?${qs({ page, limit: LIMIT })}`);
        if (!cancelled) { setTopics(d.topics || []); setTotal(d.total || 0); }
      } catch (e) {
        if (!cancelled) showToast(e.message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, weekFilter, typeFilter, activeFilter, search, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => setTick(t => t + 1);
  const filterChange = setter => e => { setter(e.target.value); setPage(1); };

  async function openEdit(t) {
    try {
      const d = await apiFetch(`/admin/task2/topics/${t._id}`);
      setTopicModal(d.topic);
    } catch (e) { showToast(e.message, 'error'); }
  }

  function deleteTopic(t) {
    confirm(`Xóa topic "${t.topicName}" và tất cả câu hỏi bên trong? Không thể hoàn tác.`, async () => {
      try {
        await apiFetch(`/admin/task2/topics/${t._id}`, { method: 'DELETE' });
        showToast('Đã xóa topic', 'success');
        if (openId === t._id) setOpenId(null);
        refresh();
      } catch (e) { showToast(e.message, 'error'); }
    });
  }

  async function toggleTopicActive(t) {
    setTopics(prev => prev.map(x => (x._id === t._id ? { ...x, isActive: !t.isActive } : x)));
    try {
      await apiFetch(`/admin/task2/topics/${t._id}`, { method: 'PUT', body: JSON.stringify({ isActive: !t.isActive }) });
      showToast(t.isActive ? 'Đã ẩn buổi' : 'Đã hiện buổi', 'success');
      refresh(); // Buổi numbers shift when a topic is shown / hidden
    } catch (e) {
      setTopics(prev => prev.map(x => (x._id === t._id ? { ...x, isActive: t.isActive } : x)));
      showToast(e.message, 'error');
    }
  }

  async function bulkToggleTopics() {
    try {
      const d = await apiFetch(`/admin/task2/topics?${qs({ page: 1, limit: 5000 })}`);
      const all = d.topics || [];
      if (all.length === 0) return;
      const targetActive = !all.some(t => t.isActive);
      confirm(`${targetActive ? 'Hiện' : 'Ẩn'} tất cả ${all.length} buổi đang lọc?`, async () => {
        try {
          await Promise.all(all.map(t => apiFetch(`/admin/task2/topics/${t._id}`, { method: 'PUT', body: JSON.stringify({ isActive: targetActive }) })));
          showToast(`Đã ${targetActive ? 'hiện' : 'ẩn'} ${all.length} buổi`, 'success');
          refresh();
        } catch (e) { showToast(e.message, 'error'); }
      });
    } catch (e) { showToast(e.message, 'error'); }
  }

  return (
    <>
      <PageHeader
        title="Task 2 Luyện đề tuần"
        subtitle={`${total} buổi · mỗi buổi = 1 đề: ① từ vựng → ② brainstorm → ③ dịch câu từ bài mẫu Daniel (Mở bài, 2 thân bài) + tự viết kết bài → ④⑤ viết bài. Bấm 📋 để xem câu, bài mẫu, từ vựng và tiến độ từng học sinh.`}
        actions={<>
          <a className="btn btn-ghost btn-sm" href={`${FRONTEND_URL}/task2-practice.html`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>
          <button className="btn btn-ghost btn-sm" onClick={bulkToggleTopics} disabled={topics.length === 0}>
            {topics.some(t => t.isActive) ? '🙈 Ẩn tất cả đang lọc' : '👁 Hiện tất cả đang lọc'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setTopicModal(null)}>+ Thêm topic</button>
        </>}
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0', alignItems: 'center' }}>
        <input className="form-input search-input" placeholder="Tìm tên topic hoặc đề…" value={search} onChange={filterChange(setSearch)} style={{ maxWidth: 240 }} />
        <select className="form-input" value={weekFilter} onChange={filterChange(setWeekFilter)} style={{ width: 130 }} aria-label="Lọc tuần">
          <option value="all">Tất cả tuần</option>
          {WEEKS.map(w => <option key={w} value={w}>Tuần {w}</option>)}
        </select>
        <select className="form-input" value={typeFilter} onChange={filterChange(setTypeFilter)} style={{ width: 170 }} aria-label="Lọc dạng bài">
          <option value="all">Tất cả dạng</option>
          {ESSAY_TYPES.map(t => <option key={t} value={t}>{ESSAY_LABELS[t]}</option>)}
        </select>
        <select className="form-input" value={activeFilter} onChange={filterChange(setActiveFilter)} style={{ width: 140 }} aria-label="Lọc trạng thái">
          <option value="all">Mọi trạng thái</option>
          <option value="true">Đang hiện</option>
          <option value="false">Đang ẩn</option>
        </select>
        <span style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 'auto' }}>{total} buổi</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>BUỔI</th>
              <th>TOPIC</th>
              <th>DẠNG BÀI</th>
              <th title="Bước ③: câu dịch từ bài mẫu Daniel + tự viết kết bài">③ DỊCH CÂU</th>
              <th title="Câu hỏi đang hiện theo level">CÂU HỎI</th>
              <th>TRẠNG THÁI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && topics.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">Đang tải...</td></tr>
            ) : topics.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">Không có buổi nào</td></tr>
            ) : topics.map(t => {
              const open = openId === t._id;
              return (
                <Fragment key={t._id}>
                  <tr style={{ background: open ? 'rgba(99,102,241,.07)' : undefined, opacity: t.isActive ? 1 : 0.55 }}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#6366f1' }}>{t.session ? `Buổi ${t.session}` : '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>Tuần {t.week}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.topicEmoji} {t.topicName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{t.vocabCount} từ vựng</div>
                    </td>
                    <td><Chip color={ESSAY_COLORS[t.essayType] || '#6b7280'}>{ESSAY_LABELS[t.essayType] || t.essayType}</Chip></td>
                    <td style={{ fontSize: 12 }}>
                      {t.fromSample > 0
                        ? <span title="Câu lấy từ bài mẫu Daniel">📄 {t.fromSample} câu bài mẫu</span>
                        : <span style={{ color: 'var(--text3)' }}>{t.step3Count} câu dịch</span>}
                      <div style={{ color: t.hasConclusion ? 'var(--text3)' : 'var(--danger)' }}>{t.hasConclusion ? '+ tự viết kết bài' : '⚠️ thiếu kết bài'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {LEVELS.map(l => {
                          const c = (t.levels || []).filter(x => x === l).length;
                          return c > 0 ? <Chip key={l} color={LEVEL_COLORS[l]}>{l[0].toUpperCase()}: {c}</Chip> : null;
                        })}
                      </div>
                      {t.retiredCount > 0 && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{t.retiredCount} câu đã thay</div>}
                    </td>
                    <td>
                      <span className={`badge ${t.isActive ? 'badge-green' : 'badge-gray'}`}><span className="dot" />{t.isActive ? 'Hiện' : 'Ẩn'}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className={`btn btn-sm ${open ? 'btn-primary' : 'btn-ghost'}`} title="Câu hỏi, bài mẫu, từ vựng, học sinh" onClick={() => setOpenId(open ? null : t._id)}>📋</button>
                        <button className={`btn btn-sm ${t.isActive ? 'btn-warning' : 'btn-success'}`} title={t.isActive ? 'Ẩn buổi' : 'Hiện buổi'} onClick={() => toggleTopicActive(t)}>
                          {t.isActive ? '🙈' : '👁'}
                        </button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Sửa đề / brainstorm" onClick={() => openEdit(t)}>✏️</button>
                        <a className="btn btn-ghost btn-sm btn-icon" title="Trang học sinh" href={studentUrl(t)} target="_blank" rel="noreferrer">↗</a>
                        {isAdmin && <button className="btn btn-danger btn-sm btn-icon" title="Xóa topic" onClick={() => deleteTopic(t)}>🗑️</button>}
                      </div>
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <TopicPanel topicId={t._id} version={tick} onEditTopic={full => setTopicModal(full)} onCountsChanged={refresh} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <Pagination page={page} total={total} pageSize={LIMIT} onPage={setPage} />
      </div>

      {topicModal !== undefined && (
        <TopicModal
          key={topicModal?._id || 'new'}
          topic={topicModal}
          onClose={() => setTopicModal(undefined)}
          onSaved={refresh}
        />
      )}
    </>
  );
}
