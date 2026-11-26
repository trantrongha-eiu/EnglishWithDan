import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import {
  LIST_MIN_WORDS, LIST_MAX_WORDS, wordKey, parseWordLines, mergeWords, fillMissingMeanings,
} from './vocabListUtils';

// "📚 Bộ từ của lớp" block of the assignment editor (ClassDetail
// AssignmentEditor). Each list = { title, words: [{ word, meaning, example,
// phonetic }] } → resource { kind: 'vocab_list', title, words }.
// Words come from 3 places (AddListModal): a Vocab Topics lesson, a pasted
// list (meanings looked up automatically), or a list given before.

const box = { border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 };
const hint = { fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 };

function WordTable({ words, onChange }) {
  const set = (i, patch) => onChange(words.map((w, j) => (j === i ? { ...w, ...patch } : w)));
  return (
    <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
      <table className="table" style={{ margin: 0, fontSize: 13 }}>
        <thead><tr><th style={{ width: '28%' }}>TỪ</th><th>NGHĨA</th><th style={{ width: 34 }} /></tr></thead>
        <tbody>
          {words.map((w, i) => (
            <tr key={wordKey(w.word) || i}>
              <td style={{ fontWeight: 600 }}>{w.word}</td>
              <td>
                <input className="form-input" style={{ padding: '4px 8px', fontSize: 13, ...(w.meaning.trim() ? {} : { borderColor: 'var(--red, #e53935)' }) }}
                  value={w.meaning} placeholder="Thiếu nghĩa" onChange={(e) => set(i, { meaning: e.target.value })} />
              </td>
              <td>
                <button className="btn btn-ghost btn-sm" title="Bỏ từ này" onClick={() => onChange(words.filter((_, j) => j !== i))}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab 1: Vocab Topics lesson → tick words ──
function FromLessonTab({ onPick }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [lessons, setLessons] = useState(null);
  const [lesson, setLesson] = useState(null); // { title, words }
  const [ticked, setTicked] = useState(() => new Set());

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      apiFetch(`/classes/resources/catalog?type=vocabulary_lesson&search=${encodeURIComponent(search)}&limit=50`)
        .then((d) => { if (alive) setLessons(d.items || []); })
        .catch((e) => { if (alive) { setLessons([]); toast(e.message, 'error'); } });
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  async function open(id) {
    try {
      const d = await apiFetch(`/vocabulary-lessons/admin/${id}`);
      const words = (d.lesson?.words || []).map((w) => ({ word: w.word, meaning: w.meaning || '', example: w.example || '', phonetic: w.phonetic || '' }));
      setLesson({ title: d.lesson?.title || '', words });
      setTicked(new Set(words.map((w) => wordKey(w.word))));
    } catch (e) { toast(e.message, 'error'); }
  }

  if (lesson) {
    const all = ticked.size === lesson.words.length;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setLesson(null)}>← Chọn bài khác</button>
          <strong style={{ fontSize: 14 }}>{lesson.title}</strong>
          <span style={hint}>{ticked.size}/{lesson.words.length} từ được chọn</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => setTicked(all ? new Set() : new Set(lesson.words.map((w) => wordKey(w.word))))}>
            {all ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </button>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, padding: 6 }}>
          {lesson.words.map((w) => {
            const k = wordKey(w.word);
            return (
              <label key={k} style={{ display: 'flex', gap: 8, padding: '4px 6px', fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={ticked.has(k)} onChange={(e) => setTicked((s) => {
                  const n = new Set(s); if (e.target.checked) n.add(k); else n.delete(k); return n;
                })} />
                <span><b>{w.word}</b> — {w.meaning}</span>
              </label>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button className="btn btn-primary btn-sm" disabled={!ticked.size}
            onClick={() => onPick(lesson.title, lesson.words.filter((w) => ticked.has(wordKey(w.word))))}>
            Dùng {ticked.size} từ này
          </button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <input className="form-input" placeholder="Tìm bài Vocab Topics…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 8 }} />
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {lessons === null && <div style={hint}>Đang tải…</div>}
        {lessons?.length === 0 && <div style={hint}>Không có bài nào.</div>}
        {lessons?.map((l) => (
          <button key={l._id} className="btn btn-ghost" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', textAlign: 'left', marginBottom: 4 }}
            onClick={() => open(l._id)}>
            <span>{l.label}</span>
            {l.meta && <span style={hint}>{l.meta}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: paste words, meanings filled automatically ──
function PasteTab({ onPick }) {
  const toast = useToast();
  const [raw, setRaw] = useState('');
  const [rows, setRows] = useState(null);
  const [progress, setProgress] = useState(null); // { done, total }

  async function next() {
    const parsed = mergeWords([], parseWordLines(raw)).words;
    if (!parsed.length) { toast('Chưa có từ nào', 'error'); return; }
    if (parsed.length > LIST_MAX_WORDS) { toast(`Tối đa ${LIST_MAX_WORDS} từ một bộ`, 'error'); return; }
    setRows(parsed);
    if (parsed.some((w) => !w.meaning)) {
      setProgress({ done: 0, total: parsed.filter((w) => !w.meaning).length });
      const filled = await fillMissingMeanings(parsed, (done, total) => setProgress({ done, total }));
      setRows(filled);
      setProgress(null);
      const left = filled.filter((w) => !w.meaning.trim()).length;
      if (left) toast(`${left} từ chưa tra được nghĩa — hãy gõ nghĩa vào ô đỏ`, 'error');
    }
  }

  if (rows) {
    const missing = rows.filter((w) => !w.meaning.trim()).length;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setRows(null)} disabled={!!progress}>← Sửa danh sách</button>
          <span style={hint}>
            {progress ? `Đang tra nghĩa… ${progress.done}/${progress.total}` : `${rows.length} từ · nghĩa tự điền, sửa lại nếu cần`}
          </span>
        </div>
        <WordTable words={rows} onChange={setRows} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button className="btn btn-primary btn-sm" disabled={!!progress || !rows.length || missing > 0}
            title={missing ? 'Còn từ chưa có nghĩa' : undefined} onClick={() => onPick('', rows)}>
            Dùng {rows.length} từ này
          </button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <textarea className="form-input" rows={10} value={raw} onChange={(e) => setRaw(e.target.value)}
        placeholder={'Mỗi dòng 1 từ — có nghĩa hay không đều được:\nmitigate\nsustainable: bền vững\nexacerbate - làm trầm trọng thêm'} />
      <div style={{ ...hint, margin: '6px 0 10px' }}>
        Từ nào chưa có nghĩa sẽ được tự tra (tiếng Việt + câu ví dụ). Dán được từ Word/Excel (cột từ, cột nghĩa).
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-sm" onClick={next} disabled={!raw.trim()}>Tiếp tục →</button>
      </div>
    </div>
  );
}

// ── Tab 3: reuse a list given before ──
function ReuseTab({ onPick }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [lists, setLists] = useState(null);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      apiFetch(`/classes/resources/vocab-lists?search=${encodeURIComponent(search)}`)
        .then((d) => { if (alive) setLists(d.lists || []); })
        .catch((e) => { if (alive) { setLists([]); toast(e.message, 'error'); } });
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <input className="form-input" placeholder="Tìm theo tên bộ, lớp, bài tập hoặc 1 từ trong bộ…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 8 }} />
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {lists === null && <div style={hint}>Đang tải…</div>}
        {lists?.length === 0 && <div style={hint}>Chưa có bộ từ nào được giao{search ? ' khớp với tìm kiếm' : ''}.</div>}
        {lists?.map((l, i) => (
          <div key={i} style={box}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title} <span style={hint}>· {l.words.length} từ</span></div>
                <div style={hint}>{l.className} · {l.assignmentTitle} · {formatDate(l.createdAt)}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(open === i ? null : i)}>{open === i ? 'Ẩn' : 'Xem từ'}</button>
              <button className="btn btn-primary btn-sm" onClick={() => onPick(l.title, l.words)}>Dùng bộ này</button>
            </div>
            {open === i && (
              <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
                {l.words.map((w) => <span key={wordKey(w.word)} style={{ marginRight: 12 }}><b>{w.word}</b> {w.meaning}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS = [
  { key: 'lesson', label: '📗 Từ Vocab Topics' },
  { key: 'paste', label: '📋 Dán danh sách từ' },
  { key: 'reuse', label: '♻️ Dùng lại bộ đã giao' },
];

function AddListModal({ onClose, onAdd }) {
  const [tab, setTab] = useState('lesson');
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Thêm bộ từ của lớp</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '14px 20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {TABS.map((t) => (
              <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>
          {tab === 'lesson' && <FromLessonTab onPick={onAdd} />}
          {tab === 'paste' && <PasteTab onPick={onAdd} />}
          {tab === 'reuse' && <ReuseTab onPick={onAdd} />}
        </div>
      </div>
    </div>
  );
}

export default function VocabListsField({ lists, setLists }) {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);
  const setList = (i, patch) => setLists((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  function add(title, words) {
    const { words: clean } = mergeWords([], words);
    if (clean.length > LIST_MAX_WORDS) { toast(`Tối đa ${LIST_MAX_WORDS} từ một bộ — đã lấy ${LIST_MAX_WORDS} từ đầu`, 'info'); }
    setLists((a) => [...a, { title: title || '', words: clean.slice(0, LIST_MAX_WORDS) }]);
    setOpenIdx(lists.length);
    setAdding(false);
  }

  return (
    <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
      <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', padding: '0 6px' }}>📚 Bộ từ của lớp</legend>
      {lists.map((l, i) => {
        const missing = l.words.filter((w) => !w.meaning.trim()).length;
        const bad = l.words.length < LIST_MIN_WORDS || l.words.length > LIST_MAX_WORDS || missing > 0;
        return (
          <div key={i} style={{ ...box, ...(bad ? { borderColor: 'var(--red, #e53935)' } : {}) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input className="form-input" style={{ flex: 1 }} placeholder={`Tên bộ từ (vd: Environment – Buổi 3)`}
                value={l.title} maxLength={200} onChange={(e) => setList(i, { title: e.target.value })} />
              <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{l.words.length} từ</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenIdx(openIdx === i ? null : i)}>{openIdx === i ? 'Thu gọn' : 'Sửa từ'}</button>
              <button className="btn btn-ghost btn-sm" title="Bỏ bộ từ" onClick={() => { setLists((a) => a.filter((_, j) => j !== i)); setOpenIdx(null); }}>✕</button>
            </div>
            {bad && (
              <div style={{ fontSize: 12, color: 'var(--red, #e53935)', marginTop: 4 }}>
                {missing ? `${missing} từ chưa có nghĩa. ` : ''}
                {l.words.length < LIST_MIN_WORDS || l.words.length > LIST_MAX_WORDS ? `Bộ từ cần ${LIST_MIN_WORDS}–${LIST_MAX_WORDS} từ.` : ''}
              </div>
            )}
            {openIdx === i && (
              <div style={{ marginTop: 8 }}>
                <WordTable words={l.words} onChange={(words) => setList(i, { words })} />
                <AddMoreWords onAdd={(incoming) => {
                  const r = mergeWords(l.words, incoming);
                  setList(i, { words: r.words });
                  if (r.dup) toast(`Bỏ qua ${r.dup} từ đã có trong bộ`, 'info');
                }} />
              </div>
            )}
          </div>
        );
      })}
      <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>+ Thêm bộ từ (Vocab Topics / dán từ / bộ đã giao)</button>
      <div style={{ ...hint, marginTop: 6 }}>
        Học sinh bấm "Bắt đầu" → các từ chưa có được thêm vào sổ <b>📚 Từ của lớp</b> của em đó, rồi luyện ngay (Quiz, Flashcard, Điền từ…).
        Hoàn thành khi luyện <b>hết các từ trong bộ</b>, đúng ≥70%, tính từ lúc giao bài. Từ đã có sẵn ở sổ khác của học sinh thì luyện ở đó cũng được tính.
      </div>
      {adding && <AddListModal onClose={() => setAdding(false)} onAdd={add} />}
    </fieldset>
  );
}

// "+ thêm từ" under an open list: paste more lines, meanings looked up.
function AddMoreWords({ onAdd }) {
  const [raw, setRaw] = useState('');
  const [busy, setBusy] = useState(false);
  async function go() {
    const parsed = parseWordLines(raw);
    if (!parsed.length) return;
    setBusy(true);
    const filled = await fillMissingMeanings(parsed);
    setBusy(false);
    setRaw('');
    onAdd(filled);
  }
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-start' }}>
      <textarea className="form-input" rows={2} style={{ flex: 1 }} value={raw} onChange={(e) => setRaw(e.target.value)}
        placeholder="Thêm từ: mỗi dòng 1 từ (có thể kèm ': nghĩa')" />
      <button className="btn btn-ghost btn-sm" onClick={go} disabled={busy || !raw.trim()}>{busy ? 'Đang tra…' : '+ Thêm'}</button>
    </div>
  );
}
