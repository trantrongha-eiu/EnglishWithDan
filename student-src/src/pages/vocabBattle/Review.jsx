import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { battleApi, TYPE_EMOJI } from '../../utils/vocabBattle';
import { speakWord } from '../../utils/vocab';
import { siteToast } from '../../utils/shell';

// Xem lại: every question with the player's answer and the right one; the
// words of the missed ones are ticked to save into a Sổ tay.
export default function Review({ id }) {
  const [items, setItems] = useState(null);
  const [books, setBooks] = useState(null);
  const [bookId, setBookId] = useState('');
  const [ticked, setTicked] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    battleApi('GET', `/${id}/review`).then((d) => {
      if (!d.success) { setItems([]); return; }
      setItems(d.items);
      const miss = new Set();
      d.items.forEach((it) => { if (it.frac < 1) it.words.forEach((w) => w.word && miss.add(w.word)); });
      setTicked(miss);
    });
  }, [id]);
  useEffect(() => {
    apiFetch('/vocabbook').then((d) => {
      const list = d.books || [];
      setBooks(list);
      if (list[0]) setBookId(list[0]._id);
    }).catch(() => setBooks([]));
  }, []);

  const allWords = useMemo(() => {
    const m = new Map();
    (items || []).forEach((it) => it.words.forEach((w) => w.word && !m.has(w.word) && m.set(w.word, w)));
    return m;
  }, [items]);

  if (!items) return null;
  if (!items.length) return null;
  const right = items.filter((it) => it.frac === 1).length;

  function toggle(word) {
    setTicked((cur) => {
      const n = new Set(cur);
      if (n.has(word)) n.delete(word); else n.add(word);
      return n;
    });
  }

  async function save() {
    if (!bookId || !ticked.size) return;
    setSaving(true);
    const words = [...ticked].map((w) => allWords.get(w)).filter(Boolean)
      .map((w) => ({ word: w.word, meaning: w.meaning || '', example: w.example || '' }));
    try {
      const d = await apiFetch(`/vocabbook/${bookId}/words/bulk`, { method: 'POST', body: JSON.stringify({ words }) });
      siteToast(`📒 ${d.message || 'Đã lưu vào sổ'}`, 'success');
    } catch (e) {
      siteToast(e?.status === 403 ? 'Sổ tay từ vựng dành cho tài khoản đầy đủ.' : (e?.message || 'Không lưu được'), 'error');
    }
    setSaving(false);
  }

  return (
    <section className="vb-review">
      <h2 className="vb-h2">📝 Xem lại bài của bạn: đúng {right}/{items.length}</h2>
      <div className="vb-review-list">
        {items.map((it) => (
          <div key={it.i} className={`vb-ri ${it.frac === 1 ? 'ok' : it.frac > 0 ? 'part' : 'bad'}`}>
            <div className="vb-ri-head">
              <span>{TYPE_EMOJI[it.type]} {it.label}</span>
              <span className="vb-ri-pts">{it.timeout ? '⏰' : it.frac === 1 ? '✅' : it.frac > 0 ? '🟡' : '❌'} +{it.pts}</span>
            </div>
            {it.image && <img className="vb-ri-img" src={it.image} alt="" loading="lazy" />}
            {it.prompt && <div className="vb-ri-prompt">{it.prompt}</div>}
            {it.frac < 1 && <div className="vb-ri-given">Bạn: {it.given || <i>(bỏ trống)</i>}</div>}
            <div className="vb-ri-correct">Đáp án: <b>{it.correct}</b></div>
            <div className="vb-ri-words">
              {it.words.filter((w) => w.word).map((w) => (
                <label key={w.word} className="vb-ri-word">
                  <input type="checkbox" checked={ticked.has(w.word)} onChange={() => toggle(w.word)} />
                  <b>{w.word}</b> <button className="vb-say" type="button" onClick={() => speakWord(w.word)} aria-label="Nghe">🔊</button>
                  {w.meaning && <span>: {w.meaning}</span>}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {books?.length > 0 && (
        <div className="vb-save">
          <span>Lưu <b>{ticked.size}</b> từ đã chọn vào</span>
          <select className="vb-input" value={bookId} onChange={(e) => setBookId(e.target.value)}>
            {books.map((bk) => <option key={bk._id} value={bk._id}>{bk.emoji || '📒'} {bk.name}</option>)}
          </select>
          <button className="vb-btn vb-btn--primary" disabled={saving || !ticked.size} onClick={save}>{saving ? 'Đang lưu…' : '📒 Lưu vào sổ'}</button>
        </div>
      )}
    </section>
  );
}
