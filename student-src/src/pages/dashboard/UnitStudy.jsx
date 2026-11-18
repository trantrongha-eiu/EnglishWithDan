import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal';
import { speakWord, prefetchAudio, VOCAB_BOOK_MAX_WORDS } from '../../utils/vocab';
import { bindDict } from '../../utils/shell';

// Paraphrase Unit → "Study" tab: vocab cards + the paraphrase block
// (flip cards that feed the per-student review schedule, or the scan/copy
// table). Port of renderStudyGrid + dashboard-paraphrase.js.

const VIEW_KEY = 'ews_para_study_view';
const STATUS_PILL = {
  'chua-thuoc': { cls: 'is-new', txt: 'Chưa thuộc' },
  'nho-so-so': { cls: 'is-learning', txt: 'Đang nhớ' },
  'da-thuoc': { cls: 'is-mastered', txt: 'Đã thuộc' },
};
const RATINGS = [
  ['chua-thuoc', 'r-bad', 'Chưa thuộc'],
  ['nho-so-so', 'r-mid', 'Nhớ sơ sơ'],
  ['da-thuoc', 'r-good', 'Đã thuộc'],
];

// Must mirror paraphraseSrsService.normalisePart on the server
const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
const itemSig = (w) => `${norm(w.word)} ∴ ${norm(w.paraphrase)}`;

function fmtNextReview(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.round((d - Date.now()) / 86400000);
  if (days <= 0) return 'đến hạn ôn';
  return days === 1 ? 'ôn lại sau 1 ngày' : `ôn lại sau ${days} ngày`;
}

function readView() {
  try { const v = localStorage.getItem(VIEW_KEY); if (v === 'cards' || v === 'table') return v; } catch { /* private mode */ }
  return 'cards';
}

export function SaveWordModal({ word, onClose }) {
  const toast = useToast();
  const { books, loadBooks, book: openBook, loadBook } = useOutletContext();
  const fits = (b) => (b.totalWords || 0) < VOCAB_BOOK_MAX_WORDS;
  const openId = openBook?._id;
  const [picked, setPicked] = useState(() => (books || []).find(b => b._id === openId && fits(b))?._id || null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!picked) { toast('Hãy chọn một sổ từ vựng', 'error'); return; }
    setBusy(true);
    try {
      const data = await apiFetch(`/vocabbook/${picked}/words`, { method: 'POST', body: JSON.stringify({ ...word, note: note.trim() }) });
      toast(data.message || 'Đã lưu từ', data.success === false ? 'error' : 'success');
      onClose();
      loadBooks();
      if (picked === openId) loadBook(picked, { quiet: true });
    } catch (err) {
      toast(err.message, 'error');
      setBusy(false);
    }
  }

  return (
    <Modal title="Lưu từ vào sổ" size="modal-md" onClose={onClose} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
      <button className="btn btn-primary" onClick={save} disabled={busy}>Lưu từ</button>
    </>}>
      <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{word.word}</span>
          <button className="btn-audio" onClick={() => speakWord(word.word)} style={{ fontSize: 16 }}>🔊</button>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "'JetBrains Mono',monospace" }}>{word.phonetic || ''}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{word.meaning || ''}</div>
        <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text3)', marginTop: 4 }}>{word.example || ''}</div>
      </div>
      <div className="form-group">
        <label>Chọn một sổ</label>
        <div className="book-list-select">
          {(books || []).map((b) => {
            const total = b.totalWords || 0;
            const full = total >= VOCAB_BOOK_MAX_WORDS;
            const near = !full && total >= VOCAB_BOOK_MAX_WORDS - 50;
            return (
              <div key={b._id} className={`book-opt${picked === b._id ? ' selected' : ''}`} onClick={full ? undefined : () => setPicked(b._id)}
                style={full ? { opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' } : undefined}>
                <span className="book-opt-emoji">{b.emoji || '📘'}</span>
                <div className="book-opt-info">
                  <div className="book-opt-name">{b.name}</div>
                  <div className="book-opt-count" style={{ color: full ? '#ef4444' : near ? '#f59e0b' : 'var(--text3)' }}>
                    {full ? `${total} / ${VOCAB_BOOK_MAX_WORDS} (đầy)` : near ? `${total} / ${VOCAB_BOOK_MAX_WORDS}` : `${total} từ`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="form-group">
        <label>Ghi chú riêng (không bắt buộc)</label>
        <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="vd: gặp trong bài đọc tháng 3..." />
      </div>
    </Modal>
  );
}

function ParaCard({ w, prog, onRate, onSave }) {
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chosen, setChosen] = useState(null);
  const pill = prog && STATUS_PILL[prog.status];
  const next = prog ? fmtNextReview(prog.nextReviewAt) : '';

  const flip = (e) => {
    if (e.target.closest('.para-rate-btn') || e.target.closest('.para-card-save')) return;
    // a double-click or drag-select is a dictionary lookup, not a flip
    if (e.detail >= 2) return;
    const sel = window.getSelection?.();
    if (sel && !sel.isCollapsed && String(sel).trim()) return;
    setFlipped(f => !f);
  };
  const rate = async (rating) => {
    setBusy(true);
    setChosen(rating);
    const ok = await onRate(w, rating);
    if (!ok) { setBusy(false); setChosen(null); return; }
    setTimeout(() => { setFlipped(false); setBusy(false); setChosen(null); }, 550);
  };

  return (
    <div className={`para-card${flipped ? ' flipped' : ''}`} onClick={flip}>
      <div className="para-card-inner">
        <div className="para-card-face para-card-front">
          <div className="para-card-tag">Trong bài đọc</div>
          <div className="para-card-phrase">{w.word}</div>
          {pill
            ? <div className={`para-pill ${pill.cls}`}>{pill.txt}{next ? ` · ${next}` : ''}</div>
            : <div className="para-pill is-untouched">Chưa học</div>}
          <div className="para-card-flip-hint">Nhấn để xem câu hỏi diễn đạt lại →</div>
        </div>
        <div className="para-card-face para-card-back">
          <div className="para-card-tag">Trong câu hỏi</div>
          <div className="para-card-para">{w.paraphrase || '–'}</div>
          {w.meaning && <div className="para-card-meaning">{w.meaning}</div>}
          {w.explanation && <div className="para-card-explain">{w.explanation}</div>}
          <div className="para-rate-row">
            <span className="para-rate-label">Bạn nhớ cụm này tới đâu?</span>
            <div className="para-rate-btns">
              {RATINGS.map(([key, cls, label]) => (
                <button key={key} className={`para-rate-btn ${cls}${chosen === key ? ' chosen' : ''}`} disabled={busy} onClick={() => rate(key)}>{label}</button>
              ))}
            </div>
          </div>
          <button className="para-card-save" onClick={() => onSave(w)}>🔖 Lưu vào sổ</button>
        </div>
      </div>
    </div>
  );
}

function ParaphraseBlock({ items, unit, onSave }) {
  const toast = useToast();
  const [view, setView] = useState(readView);
  const [loaded, setLoaded] = useState({ unitId: null, bySig: {} });
  const unitId = unit._id;
  const prog = loaded.unitId === unitId ? loaded.bySig : {};

  // premium-only, same bar as the unit itself; failure just means no pills
  useEffect(() => {
    if (!unitId) return undefined;
    let alive = true;
    apiFetch(`/vocab/paraphrase/progress/${unitId}`).then((d) => {
      if (!alive || !d?.success) return;
      const bySig = {};
      for (const it of d.items || []) bySig[itemSig(it)] = it;
      setLoaded({ unitId, bySig });
    }).catch(() => {});
    return () => { alive = false; };
  }, [unitId]);

  const pickView = (v) => {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode */ }
  };

  const rate = async (w, rating) => {
    try {
      const d = await apiFetch('/vocab/paraphrase/review', {
        method: 'POST',
        body: JSON.stringify({ unitId, word: w.word, paraphrase: w.paraphrase || '', meaning: w.meaning || '', explanation: w.explanation || '', rating }),
      });
      if (!d?.success) throw new Error('save failed');
      setLoaded(l => ({
        unitId,
        bySig: { ...(l.unitId === unitId ? l.bySig : {}), [itemSig(w)]: { status: d.itemStatus, srsBox: d.srsBox, nextReviewAt: d.nextReviewAt, word: w.word, paraphrase: w.paraphrase } },
      }));
      toast(`${RATINGS.find(r => r[0] === rating)[2]} — ${fmtNextReview(d.nextReviewAt)}`, 'success');
      return true;
    } catch {
      toast('Chưa lưu được, thử lại sau', 'error');
      return false;
    }
  };

  const copy = () => {
    const text = items.map(w => `${w.word}\t${w.paraphrase || ''}\t${w.meaning || ''}\t${w.explanation || ''}`).join('\n');
    navigator.clipboard?.writeText(text).then(() => toast('Đã copy bảng Paraphrase ✅', 'success'));
  };

  const mastered = items.filter(w => prog[itemSig(w)]?.status === 'da-thuoc').length;
  const pct = items.length ? Math.round((mastered / items.length) * 100) : 0;

  return (
    <div id="paraphrase-table-section" className="paraphrase-section">
      <div className="para-study-head">
        <div className="para-study-title"><span className="para-icon">🔑</span> Paraphrase — {unit.title || ''}</div>
        <div className={`para-ring${items.length && mastered === items.length ? ' is-done' : ''}`} id="para-ring" title="Số cụm đã thuộc" style={{ '--para-pct': pct }}>
          <span className="para-ring-num">{mastered}/{items.length}</span>
        </div>
        <div className="para-view-toggle" role="tablist">
          <button className={`para-view-btn${view === 'cards' ? ' active' : ''}`} role="tab" onClick={() => pickView('cards')}>🃏 Thẻ</button>
          <button className={`para-view-btn${view === 'table' ? ' active' : ''}`} role="tab" onClick={() => pickView('table')}>📊 Bảng</button>
        </div>
        <button className="para-copy-btn" onClick={copy} title="Copy bảng">⧉</button>
      </div>
      <div className="para-study-hint">Nhấn vào thẻ để lật — tự nhớ lại cách câu hỏi diễn đạt lại cụm trong bài trước khi xem đáp án. Bôi đen hoặc double-click bất kỳ từ nào để tra nghĩa.</div>
      <div id="para-study-body">
        {view === 'cards' ? (
          <div className="para-card-grid">
            {items.map((w, i) => <ParaCard key={w._id || i} w={w} prog={prog[itemSig(w)]} onRate={rate} onSave={onSave} />)}
          </div>
        ) : (
          <>
            <div className="para-table-header">
              <div className="para-table-title"><span className="para-icon">📊</span> PARAPHRASE TABLE + EXPLANATION</div>
              <button className="para-copy-btn" onClick={copy} title="Copy table">⧉</button>
            </div>
            <div className="para-table-wrap">
              <table className="para-table">
                <thead><tr><th>Text (in passage)</th><th>Paraphrase (in question)</th><th>Meaning</th><th>Detailed Explanation</th></tr></thead>
                <tbody>
                  {items.map((w, i) => (
                    <tr className="para-row" key={w._id || i}>
                      <td className="para-cell-original"><span className="para-original-text">{w.word}</span></td>
                      <td className="para-cell-paraphrase"><span className="para-para-text">{w.paraphrase || '–'}</span></td>
                      <td className="para-cell-meaning">{w.meaning || '–'}</td>
                      <td className="para-cell-explain">{w.explanation || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnitStudy({ unit }) {
  const [saving, setSaving] = useState(null);
  const words = unit.words || [];
  const vocab = words.filter(w => (w.type || 'vocab') === 'vocab');
  const para = words.filter(w => w.type === 'paraphrase');
  const src = unit.unitNumber ? `Unit ${unit.unitNumber}` : (unit.title || 'Paraphrase');

  useEffect(() => {
    bindDict('studyMode', 'vocab-study');
    prefetchAudio((unit.words || []).map(w => w.word));
  }, [unit]);

  return (
    <div id="studyMode">
      <div className="vocab-grid" id="vocabGrid">
        {vocab.map((w, i) => (
          <div className="vocab-card" key={w._id || i}>
            <div className="vocab-card-top">
              <span className="vocab-num">{i + 1}</span>
              <span className="vocab-word-big">{w.word}</span>
              <button className="btn-audio" onClick={() => speakWord(w.word)} title="Phát âm">🔊</button>
              {w.partOfSpeech && <span className="vocab-pos">{w.partOfSpeech}</span>}
            </div>
            {w.phonetic && <div className="vocab-phonetic">{w.phonetic}</div>}
            <div className="vocab-meaning">{w.meaning || ''}</div>
            {w.example && <div className="vocab-example">"{w.example}"</div>}
            <button className="btn-save-to-book" onClick={() => setSaving({
              word: w.word, meaning: w.meaning, example: w.example || '', phonetic: w.phonetic || '', partOfSpeech: w.partOfSpeech || '', source: src,
            })}><i className="fas fa-bookmark" /> Save to notebook</button>
          </div>
        ))}
      </div>
      {para.length > 0 && (
        <ParaphraseBlock items={para} unit={unit} onSave={(w) => setSaving({
          word: w.word, meaning: w.meaning || '', example: w.paraphrase ? `Paraphrase: ${w.paraphrase}` : '', phonetic: w.phonetic || '', partOfSpeech: '', source: src,
        })} />
      )}
      {saving && <SaveWordModal word={saving} onClose={() => setSaving(null)} />}
    </div>
  );
}
