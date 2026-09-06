import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import ImportStatusBox from '../components/ImportStatusBox';

// Copied verbatim into the admin's clipboard — the site never calls an AI
// API itself, this is only ever pasted by a human into ChatGPT/Gemini.
const AI_PROMPT = `Bạn là trợ lý biên soạn đề IELTS Speaking cho học sinh luyện thi.

Hãy tạo bộ đề Speaking theo ĐÚNG định dạng văn bản dưới đây — KHÔNG dùng JSON, KHÔNG dùng Markdown hay bảng biểu, chỉ dùng đúng cú pháp như ví dụ:

@topic
topic=<tên chủ đề, VD: A TV/online programme you enjoy>

@part1
<câu hỏi Part 1 số 1>
<câu hỏi Part 1 số 2>
<... mỗi câu 1 dòng>

@part2
cue=<gạch đầu dòng cue card 1> | <gạch đầu dòng 2> | <gạch đầu dòng 3> | and explain ...
<câu đề bài Part 2, VD: Describe a TV or online programme that you enjoy watching>

@part3
<câu hỏi Part 3 số 1>
<câu hỏi Part 3 số 2>
<...>

Lặp lại khối @topic cho mỗi chủ đề. Một khối @topic chứa cả 3 part; part nào không có thì bỏ qua.

Yêu cầu bắt buộc:
- Mỗi @topic phải có dòng "topic=".
- @part1 / @part3: mỗi dòng là 1 câu hỏi. @part1 nên 4–11 câu, @part3 nên 4–6 câu.
- @part2: đúng 1 dòng câu đề bài; các gạch đầu dòng cue card để ở dòng "cue=", cách nhau bằng dấu "|".
- Không lặp lại cùng 1 câu hỏi trong cùng 1 part của cùng 1 topic.
- Chỉ trả lời đúng nội dung theo định dạng trên. Không thêm lời giải thích, không bọc trong code block.

Chủ đề / bộ đề quý cần tạo: [DÁN CHỦ ĐỀ HOẶC DANH SÁCH ĐỀ VÀO ĐÂY]`;

const PLACEHOLDER = `@topic
topic=A TV/online programme you enjoy

@part1
What kinds of TV programmes do you like to watch?
How often do you watch television?
Do you prefer watching TV alone or with other people?

@part2
cue=what it is about | how often you watch it | who you watch it with | and explain why you enjoy it
Describe a TV or online programme that you enjoy watching

@part3
Why do some people spend so much time watching TV and online programmes?
Do younger and older people enjoy watching similar programmes?`;

function PartList({ n, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3,#888)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Part {n} · {items.length} câu</div>
      <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
        {items.map((q, i) => <li key={i}>{q}</li>)}
      </ul>
    </div>
  );
}

export default function SpeakingImport() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { valid, errors, warnings, topics, counts }

  async function handleParse() {
    if (!text.trim()) { toast('Chưa có nội dung để kiểm tra', 'warn'); return; }
    setParsing(true);
    try {
      const d = await apiFetch('/admin/speaking/questions/parse', { method: 'POST', body: JSON.stringify({ text }) });
      setResult(d);
      if (d.valid) toast(`✓ Hợp lệ — ${d.counts.topics} topic, ${d.counts.total} câu` + (d.warnings?.length ? ` (${d.warnings.length} cảnh báo)` : ''));
      else toast(`✗ ${d.errors.length} lỗi`, 'error');
    } catch (e) { toast(e.message, 'error'); }
    finally { setParsing(false); }
  }

  async function handleImport() {
    if (!result?.valid) { toast('Hãy Validate trước khi import', 'warn'); return; }
    confirm(`Import ${result.counts.topics} topic (${result.counts.total} câu) vào ngân hàng câu hỏi Speaking?`, async () => {
      setImporting(true);
      try {
        const d = await apiFetch('/admin/speaking/questions/import', { method: 'POST', body: JSON.stringify({ text }) });
        toast(d.message);
        navigate('/speaking');
      } catch (e) {
        toast(e.message, 'error');
        if (e.body?.errors) setResult({ valid: false, errors: e.body.errors, warnings: [], topics: [], counts: {} });
      } finally {
        setImporting(false);
      }
    });
  }

  function handleClear() {
    if (!text.trim()) return;
    confirm('Xoá toàn bộ nội dung đang nhập?', () => { setText(''); setResult(null); });
  }

  function handleCopyPrompt() {
    navigator.clipboard.writeText(AI_PROMPT)
      .then(() => toast('Đã copy prompt — dán vào ChatGPT/Gemini'))
      .catch(() => toast('Không copy được, trình duyệt chặn clipboard', 'error'));
  }

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Import đề Speaking</h2>
        <button className="btn btn-ghost" onClick={() => navigate('/speaking')}>← Quay lại Speaking</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={handleCopyPrompt}>🤖 Copy AI Prompt</button>
      </div>

      <div className="form-group">
        <label className="form-label">Paste bộ đề (định dạng EnglishWithDan Speaking Format — cả Part 1, 2, 3)</label>
        <textarea
          className="form-input"
          rows={18}
          value={text}
          onChange={e => { setText(e.target.value); setResult(null); }}
          placeholder={PLACEHOLDER}
          style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={handleParse} disabled={parsing}>{parsing ? 'Đang kiểm tra...' : '✓ Validate / Preview'}</button>
        <button className="btn btn-primary" onClick={handleImport} disabled={importing || !result?.valid}>
          {importing ? 'Đang import...' : '📥 Import'}
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>🗑 Clear</button>
      </div>

      {result && !result.valid && (
        <div style={{ marginBottom: 20 }}>
          <ImportStatusBox tone="error" title={`✗ ${result.errors.length} lỗi — chưa thể import:`} items={result.errors} />
        </div>
      )}

      {result?.valid && result.warnings?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <ImportStatusBox tone="warning" title={`⚠ ${result.warnings.length} cảnh báo — vẫn import được:`} items={result.warnings} />
        </div>
      )}

      {result?.valid && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>
            ✓ Preview — {result.counts.topics} topic · {result.counts.part1} câu P1 · {result.counts.part2} cue card P2 · {result.counts.part3} câu P3
          </div>
          {result.topics.map((t, i) => (
            <div key={i} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.topic}</div>
              <PartList n={1} items={t.part1} />
              {t.part2 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3,#888)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Part 2</div>
                  <div style={{ fontSize: 12.5, marginTop: 4 }}>{t.part2.question}</div>
                  {t.part2.cueCard && <pre style={{ fontSize: 11.5, color: 'var(--text2,#555)', margin: '4px 0 0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{t.part2.cueCard}</pre>}
                </div>
              )}
              <PartList n={3} items={t.part3} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
