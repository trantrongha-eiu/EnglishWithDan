import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import LessonPreview from '../components/LessonPreview';

// Copied verbatim into the admin's clipboard — the site never calls an AI
// API itself, this is only ever pasted by a human into ChatGPT/Gemini.
const AI_PROMPT = `Bạn là trợ lý biên soạn nội dung từ vựng tiếng Anh cho học sinh luyện thi IELTS.

Hãy tạo một bài học từ vựng theo ĐÚNG định dạng văn bản dưới đây — KHÔNG dùng JSON, KHÔNG dùng YAML, KHÔNG dùng Markdown hay bảng biểu, chỉ dùng đúng cú pháp key=value như ví dụ:

@lesson
title=<tên bài học>
description=<mô tả ngắn>
difficulty=<A1|A2|B1|B2|C1|C2>
order=<số thứ tự buổi học>

@word
word=<từ vựng tiếng Anh>
meaning=<nghĩa tiếng Việt>
ipa=<phiên âm IPA>
pos=<từ loại: noun/verb/adjective/adverb...>
example=<1 câu ví dụ tiếng Anh sử dụng từ này>
definition=<định nghĩa tiếng Anh ngắn gọn, dễ hiểu>
collocations=<cụm từ đi kèm 1>|<cụm từ đi kèm 2>
distractors=<đáp án nhiễu 1>|<đáp án nhiễu 2>|<đáp án nhiễu 3>

Lặp lại khối @word cho mỗi từ vựng cần tạo.

Yêu cầu bắt buộc:
- Mỗi từ phải có đủ tất cả field: word, meaning, ipa, pos, example, definition, collocations, distractors.
- distractors phải là từ dễ gây nhầm lẫn với từ chính (dùng cho câu hỏi trắc nghiệm), tối thiểu 3 từ, cách nhau bằng dấu "|".
- collocations tối thiểu 2 cụm, cách nhau bằng dấu "|".
- Không được lặp lại cùng 1 "word" trong cùng một lesson.
- difficulty chỉ được là một trong: A1, A2, B1, B2, C1, C2.
- Chỉ trả lời đúng nội dung theo định dạng trên. Không thêm lời giải thích, không bọc trong code block, không thêm ký tự thừa.

Chủ đề / danh sách từ vựng cần tạo: [DÁN CHỦ ĐỀ HOẶC DANH SÁCH TỪ VÀO ĐÂY]
Số lượng từ mong muốn: [DÁN SỐ LƯỢNG VÀO ĐÂY]`;

const PREFILL_KEY = 'vocabLessonImportPrefill';

export default function VocabularyLessonImport() {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');

  // Lazy initializer, not an effect — this is a one-shot "derive initial
  // state" read (sessionStorage prefill from Import History's "Sửa & Import
  // lại"), not a subscription to an external system, so it belongs here
  // rather than in a useEffect that would call setState synchronously in
  // its body on every mount.
  const [text, setText] = useState(() => {
    if (lessonId) return ''; // filled in by the lesson-fetch effect below
    const prefill = sessionStorage.getItem(PREFILL_KEY);
    if (prefill) sessionStorage.removeItem(PREFILL_KEY);
    return prefill || '';
  });
  const [lessonTitle, setLessonTitle] = useState('');
  const [loadingLesson, setLoadingLesson] = useState(!!lessonId);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { valid, errors, lesson, words }

  useEffect(() => {
    if (!lessonId) return;
    apiFetch(`/vocabulary-lessons/admin/${lessonId}`)
      .then(d => {
        setText(d.lesson.rawImport || '');
        setLessonTitle(d.lesson.title);
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoadingLesson(false));
  }, [lessonId]);

  async function handleParse() {
    if (!text.trim()) { toast('Chưa có nội dung để kiểm tra', 'warn'); return; }
    setParsing(true);
    try {
      const d = await apiFetch('/vocabulary-lessons/admin/parse', { method: 'POST', body: JSON.stringify({ text }) });
      setResult(d);
      if (d.valid) toast(`✓ Hợp lệ — ${d.words.length} từ` + (d.warnings?.length ? ` (${d.warnings.length} cảnh báo)` : ''));
      else toast(`✗ ${d.errors.length} lỗi`, 'error');
    } catch (e) { toast(e.message, 'error'); }
    finally { setParsing(false); }
  }

  async function handleImport() {
    if (!text.trim()) { toast('Chưa có nội dung để import', 'warn'); return; }
    setImporting(true);
    try {
      const path = lessonId ? `/vocabulary-lessons/admin/${lessonId}/reimport` : '/vocabulary-lessons/admin/import';
      const d = await apiFetch(path, { method: lessonId ? 'PUT' : 'POST', body: JSON.stringify({ text }) });
      toast(d.message);
      navigate('/vocabulary-lessons');
    } catch (e) {
      toast(e.message, 'error');
      // The backend validates the same way /admin/parse does — surface the
      // same per-word error list here instead of just a generic toast.
      if (e.body?.errors) setResult({ valid: false, errors: e.body.errors, lesson: null, words: [] });
    } finally {
      setImporting(false);
    }
  }

  function handleClear() {
    if (!text.trim()) return;
    confirm('Xoá toàn bộ nội dung đang nhập?', () => {
      setText('');
      setResult(null);
    });
  }

  function handleCopyPrompt() {
    navigator.clipboard.writeText(AI_PROMPT)
      .then(() => toast('Đã copy prompt — dán vào ChatGPT/Gemini'))
      .catch(() => toast('Không copy được, trình duyệt chặn clipboard', 'error'));
  }

  if (loadingLesson) return <div style={{ padding: 40, color: 'var(--text2)' }}>Đang tải...</div>;

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">{lessonId ? `Sửa nội dung: ${lessonTitle}` : 'Import Lesson'}</h2>
        <button className="btn btn-ghost" onClick={() => navigate('/vocabulary-lessons')}>← Quay lại danh sách</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={handleCopyPrompt}>🤖 Copy AI Prompt</button>
      </div>

      <div className="form-group">
        <label className="form-label">Paste Lesson (định dạng EnglishWithDan Lesson Format)</label>
        <textarea
          className="form-input"
          rows={18}
          value={text}
          onChange={e => { setText(e.target.value); setResult(null); }}
          placeholder={'@lesson\ntitle=Week 12 - Environment\ndescription=Environment Vocabulary\ndifficulty=B1\norder=12\n\n@word\nword=sustainable\nmeaning=bền vững\nipa=/səˈsteɪnəbl/\npos=adjective\nexample=Solar energy is a sustainable source of power.\ndefinition=Able to continue without harming the environment.\ncollocations=sustainable development|sustainable energy\ndistractors=renewable|temporary|harmful'}
          style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={handleParse} disabled={parsing}>{parsing ? 'Đang kiểm tra...' : '✓ Validate'}</button>
        <button className="btn btn-ghost" onClick={handleParse} disabled={parsing}>👁 Preview</button>
        <button className="btn btn-primary" onClick={handleImport} disabled={importing || !result?.valid}>
          {importing ? 'Đang lưu...' : (lessonId ? '💾 Lưu thay đổi' : '📥 Import')}
        </button>
        <button className="btn btn-ghost" onClick={handleClear}>🗑 Clear</button>
      </div>

      {result && !result.valid && (
        <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', marginBottom: 20 }}>
          <strong style={{ color: 'var(--danger)' }}>✗ {result.errors.length} lỗi — chưa thể import:</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13, color: 'var(--danger)' }}>
            {result.errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {result?.valid && result.warnings?.length > 0 && (
        <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', marginBottom: 20 }}>
          <strong style={{ color: '#b45309' }}>⚠ {result.warnings.length} cảnh báo — vẫn import được:</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13, color: '#b45309' }}>
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {result?.valid && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>
            ✓ Preview — sẵn sàng import
          </div>
          <LessonPreview lesson={result.lesson} words={result.words} />
        </div>
      )}
    </>
  );
}
