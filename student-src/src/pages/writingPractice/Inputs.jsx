import { useState } from 'react';
import { shuffle } from '../../utils/writingPractice';

// Answer widgets shared by the practice card and the test.

const PLACEHOLDER = <span className="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>;

// 🔀 Sắp xếp từ: tap the bank's words into order, tap one in the answer to give it back
export function Rearrange({ words, prefix = '', onChange }) {
  const [bank] = useState(() => shuffle([...(words || [])]));
  const [picked, setPicked] = useState([]); // indexes into bank, in answer order

  function update(next) {
    setPicked(next);
    onChange(next.map((i) => bank[i]).join(' '));
  }

  return (
    <>
      <div className="wp-rearrange-answer" id={`${prefix}rearrange-answer`}>
        {picked.length ? picked.map((bi, i) => (
          <span key={`${bi}-${i}`} className="wp-answer-chip" data-word={bank[bi]} data-idx={i} title={prefix ? 'Bấm để bỏ' : 'Bấm để bỏ từ này'}
            onClick={() => update(picked.filter((_, j) => j !== i))}>{bank[bi]}</span>
        )) : PLACEHOLDER}
      </div>
      <div className="wp-rearrange-bank" id={`${prefix}rearrange-bank`}>
        {bank.map((w, i) => {
          const used = picked.includes(i);
          return (
            <span key={i} className={`wp-word-chip${used ? ' wp-chip-used' : ''}`} data-index={i} data-word={w} data-used={used ? 'true' : 'false'}
              onClick={() => { if (!used) update([...picked, i]); }}>{w}</span>
          );
        })}
      </div>
    </>
  );
}

// "I ___ to school." with the blank underlined
export function BlankSentence({ text }) {
  const s = text || '';
  const at = s.indexOf('___');
  if (at < 0) return s;
  return <>{s.slice(0, at)}<span className="wp-blank-underline">___</span>{s.slice(at + 3)}</>;
}

// The tapped option stays marked even if the answer is then typed over (as before)
export function FillOptions({ options, onPick, id }) {
  const [picked, setPicked] = useState(-1);
  return (
    <div className="wp-fill-options" id={id}>
      {(options || []).map((opt, i) => (
        <button key={i} className={`wp-option-btn${picked === i ? ' selected' : ''}`} onClick={() => { setPicked(i); onPick(opt); }}>{opt}</button>
      ))}
    </div>
  );
}

export function CombineSentences({ sentences }) {
  return (sentences || []).map((s, i) => <div key={i} className="wp-combine-sent">&quot;{s}&quot;</div>);
}

export function Connector({ connector }) {
  if (!connector) return null;
  return <span className="wp-connector-badge">💡 Dùng: <strong>{connector}</strong></span>;
}
