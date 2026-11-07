import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import ImportStatusBox from '../components/ImportStatusBox';

// Copied verbatim into the admin's clipboard — the site never calls an AI
// API itself, this is only ever pasted by a human into ChatGPT/Gemini.
// Mostly used to convert a quarterly forecast PDF (e.g. Ngọc Bách's "Bộ dự
// đoán Speaking Quý N") into the import format, so the rules lean hard on
// "copy, don't invent": an earlier prompt's "Part 1 nên 4–11 câu" made the
// AI pad short topics with made-up questions.
const AI_PROMPT = `Bạn là trợ lý chuyển bộ đề IELTS Speaking sang định dạng import của website EnglishWithDan.

ĐỊNH DẠNG (văn bản thuần — KHÔNG JSON, KHÔNG Markdown, KHÔNG bảng):

@topic
topic=<tên chủ đề>
group=<mã nhóm — chỉ cho topic Part 2/3>

@part1
<câu hỏi Part 1, mỗi câu 1 dòng>

@part2
cue=<gạch đầu dòng 1> | <gạch đầu dòng 2> | <gạch đầu dòng 3> | And explain ...
Describe <đề bài Part 2 — đúng 1 dòng>

@part3
<câu hỏi Part 3, mỗi câu 1 dòng>

CÁCH CHIA TOPIC (giống đề thi thật):
- Mỗi chủ đề Part 1 là 1 khối @topic riêng, CHỈ có @part1. topic= là tên chủ đề như trong đề (VD: topic=Street market).
- Mỗi cue card Part 2 là 1 khối @topic riêng, gồm @part2 và các câu Part 3 đi kèm cue card đó. topic= là tên ngắn bằng tiếng Anh (VD: topic=A person you only met once).
- KHÔNG gộp chủ đề Part 1 với cue card Part 2.

group= (chỉ topic Part 2/3) — chọn đúng 1 mã:
people (người) · places (địa điểm) · objects (đồ vật) · events (sự kiện / trải nghiệm / quyết định) · activities_skills (hoạt động, kỹ năng, mục tiêu, thói quen) · nature_science (thiên nhiên, động vật, môi trường, công nghệ, luật môi trường) · culture_media (phim, sách, quảng cáo, tin tức, video, âm nhạc, món ăn truyền thống)

QUY TẮC KHI CÓ ĐỀ GỐC (PDF / văn bản dán bên dưới):
- Chép ĐỦ và ĐÚNG mọi câu hỏi trong đề gốc. KHÔNG tự thêm câu, KHÔNG bỏ câu, KHÔNG diễn đạt lại.
- Chỉ được sửa: lỗi chính tả / ngữ pháp hiển nhiên (VD: "Do you often dinner" → "Do you often have dinner"), ký tự lỗi như \\' → ', bỏ số thứ tự / dấu gạch đầu dòng ở đầu câu, bỏ gợi ý trong ngoặc như "(Why?)", "(Why/Why not?)".
- 1 dòng chứa 2 câu hỏi (VD: "Have you ever bought shoes online? How often do you buy shoes?") → tách thành 2 dòng.
- Đề bài Part 2 luôn bắt đầu bằng "Describe" (thêm vào nếu đề gốc thiếu, VD: "A friend from your childhood" → "Describe a friend from your childhood").
- Bỏ phần quảng cáo, số trang, hotline, link, tiêu đề "You should say:", "Part 3".
- Topic có ít câu thì giữ nguyên ít câu — đừng bù thêm.
- Nếu đề gốc có lỗi (cue card thiếu gạch đầu dòng, câu Part 3 rõ ràng bị chép nhầm từ cue card khác, thiếu Part 3...) thì KHÔNG đoán; bỏ phần lỗi đó và ghi 1 dòng chú thích ngay trong khối topic: # Ghi chú: <mô tả lỗi>

QUY TẮC KHI CHỈ CÓ TÊN CHỦ ĐỀ (không có đề gốc):
- Tự soạn câu hỏi sát đề thi thật: @part1 khoảng 4–6 câu, cue card 4 gạch đầu dòng (dòng cuối bắt đầu bằng "And explain"), @part3 khoảng 4–6 câu.

ĐỊNH DẠNG TRẢ LỜI:
- Chỉ trả về nội dung theo định dạng trên, không lời dẫn, không giải thích, không bọc trong code block.
- Bộ đề dài: trả lời theo từng lượt, mỗi lượt tối đa khoảng 20 khối @topic (Part 1 trước, rồi Part 2/3 theo thứ tự trong đề). Cuối mỗi lượt chưa xong ghi đúng 1 dòng: # CÒN TIẾP — và dừng lại chờ tôi gõ "tiếp". Không được rút gọn hay bỏ bớt topic để kịp trả lời.

ĐỀ GỐC / CHỦ ĐỀ CẦN CHUYỂN:
[DÁN NỘI DUNG ĐỀ VÀO ĐÂY]`;

const PLACEHOLDER = `@topic
topic=A TV/online programme you enjoy
group=culture_media

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
    const done = () => toast('Đã copy prompt — dán vào ChatGPT/Gemini, rồi dán đề vào cuối prompt');
    // navigator.clipboard is missing outside a secure context (e.g. admin
    // opened over a LAN IP) — fall back to the old execCommand path.
    const legacy = () => {
      const ta = document.createElement('textarea');
      ta.value = AI_PROMPT;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (ok) done();
      else toast('Không copy được, trình duyệt chặn clipboard', 'error');
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(AI_PROMPT).then(done).catch(legacy);
    else legacy();
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
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {t.topic}
                {t.group && <span className="badge badge-blue" style={{ marginLeft: 8, fontSize: 11 }}>{t.group}</span>}
                {!t.group && (t.part2 || t.part3?.length > 0) && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text3,#888)', fontWeight: 400 }}>chưa có group → nhóm "Khác"</span>}
              </div>
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
