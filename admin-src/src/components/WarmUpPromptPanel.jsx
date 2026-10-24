import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { WARMUP_PROMPTS, buildWarmUpMessage } from '../data/warmUpPrompts';

// "Prompt warm-up" box on Tài liệu in (Tips), Reading / Listening tabs: the
// admin pastes any passage/transcript + its questions, copies the teacher's
// prompt with that material and sends it to an AI to write a printable
// warm-up handout. Nothing is saved — the pasted text lives only in this box.

export default function WarmUpPromptPanel({ skill }) {
  const toast = useToast();
  const cfg = WARMUP_PROMPTS[skill];
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});
  const [showPrompt, setShowPrompt] = useState(false);
  if (!cfg) return null;

  const filled = cfg.fields.filter(f => String(values[f.key] || '').trim());

  async function copy(withMaterial) {
    if (withMaterial && filled.length < cfg.fields.length) {
      const missing = cfg.fields.filter(f => !filled.includes(f)).map(f => f.label).join(', ');
      toast(`Chưa dán: ${missing}`, 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(withMaterial ? buildWarmUpMessage(skill, values) : cfg.prompt);
      toast(withMaterial ? 'Đã copy prompt + bài — dán thẳng vào ChatGPT / Gemini / Claude' : 'Đã copy prompt — dán vào AI rồi dán thêm bài', 'success');
    } catch {
      toast('Trình duyệt chặn copy — hãy bôi đen phần prompt bên dưới để copy tay', 'error');
      setShowPrompt(true);
    }
  }

  return (
    <div className="table-wrap" style={{ padding: '14px 16px', overflow: 'visible' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>📝 {cfg.title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 2 }}>
            Dùng chung cho mọi bài {skill === 'reading' ? 'Reading' : 'Listening'} lẻ, không theo dạng bài. Dán bài vào, copy prompt kèm bài rồi gửi cho AI. AI sẽ trả về phiếu warm-up in cho lớp, kèm đáp án cho giáo viên.
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => copy(false)}>📋 Copy prompt</button>
        <button className="btn btn-primary btn-sm" onClick={() => setOpen(o => !o)}>
          {open ? 'Thu gọn' : '✍️ Dán bài & copy'}
        </button>
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {cfg.fields.map((f, i) => (
              <div className="form-group" key={f.key} style={{ margin: 0 }}>
                <label className="form-label" htmlFor={`wu-${skill}-${f.key}`}>{i + 1}. {f.label}</label>
                <textarea id={`wu-${skill}-${f.key}`} className="form-textarea" rows={9} placeholder={f.placeholder}
                  value={values[f.key] || ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                  style={{ width: '100%', fontSize: 13, lineHeight: 1.5 }} />
              </div>
            ))}
          </div>
          <div className="row-actions" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={() => copy(true)}>📄 Copy prompt + bài</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPrompt(s => !s)}>👁 {showPrompt ? 'Ẩn prompt' : 'Xem prompt'}</button>
            {filled.length > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setValues({})}>🗑 Xoá bài đã dán</button>}
          </div>
        </div>
      )}

      {showPrompt && (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12.5, lineHeight: 1.55, maxHeight: '50vh', overflow: 'auto', margin: '12px 0 0', fontFamily: 'var(--mono)', userSelect: 'text' }}>
          {buildWarmUpMessage(skill, values)}
        </pre>
      )}
    </div>
  );
}
