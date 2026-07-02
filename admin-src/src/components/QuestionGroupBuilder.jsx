import { useRef, useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from './ConfirmDialog';
import { API } from '../utils/api';

const ROMAN = ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii'];

const GROUP_TYPES_READING = [
  { value: 'plain',              icon: '💬', label: 'Câu hỏi thường',            desc: 'True/False/NG, Multiple choice, Fill-blank riêng lẻ' },
  { value: 'table',              icon: '📋', label: 'Bảng (Table/Note)',          desc: 'Fill-blank trong ô bảng – dùng __Q1__ cho ô trống' },
  { value: 'note-form',          icon: '📝', label: 'Note / Bullet Completion',   desc: 'Điền vào biểu mẫu ghi chú – dùng __Q6__' },
  { value: 'matching-options',   icon: '🔗', label: 'Matching / Sentence Endings',desc: 'Ghép chữ cái – Matching Features, Sentence Endings, Choose Letters' },
  { value: 'matching-headings',  icon: '📌', label: 'Matching Headings',          desc: 'Tiêu đề i,ii,iii – ghép vào đoạn văn A,B,C' },
  { value: 'summary-completion', icon: '🧩', label: 'Summary Completion',         desc: 'Đoạn tóm tắt + Word Bank chữ cái A-J (kéo-thả)' },
  { value: 'map',                icon: '🗺️', label: 'Map / Diagram',              desc: 'Điền nhãn sơ đồ – có hình ảnh chung cho nhóm' },
];

const GROUP_TYPES_LISTENING = [
  { value: 'plain',            icon: '💬', label: 'Câu hỏi thường',              desc: 'Multiple Choice, Short-answer, Sentence Completion riêng lẻ' },
  { value: 'table',            icon: '📋', label: 'Table Completion',             desc: 'Điền vào ô bảng – dùng __Q1__ cho ô trống' },
  { value: 'note-form',        icon: '📝', label: 'Form / Note / Flow-chart',     desc: 'Điền vào biểu mẫu, ghi chú, lưu đồ – dùng __Q6__ cho chỗ trống' },
  { value: 'drag-drop',        icon: '🎯', label: 'Kéo-thả (Drag & Drop)',        desc: 'Học sinh kéo từ/cụm từ từ Option Bank vào chỗ trống – Flow chart, Diagram Summary' },
  { value: 'matching-options', icon: '🔗', label: 'Matching',                     desc: 'Nối thông tin – ghép chữ cái A-H (Part 2 / Part 3)' },
  { value: 'map',              icon: '🗺️', label: 'Map / Plan / Diagram',         desc: 'Dán nhãn bản đồ, sơ đồ – có hình ảnh chung cho nhóm' },
];

const Q_TYPES = {
  reading: [
    { value: 'true-false-ng',       label: 'True / False / Not Given' },
    { value: 'yes-no-ng',           label: 'Yes / No / Not Given' },
    { value: 'multiple-choice',     label: 'Multiple Choice (1 đáp án)' },
    { value: 'multi-answer-group',  label: 'Choose TWO/THREE Letters A-G ✦' },
    { value: 'fill-blank',          label: 'Fill in the blank' },
    { value: 'sentence-completion', label: 'Sentence Completion (kéo-thả)' },
    { value: 'matching-headings',   label: 'Matching Headings' },
    { value: 'matching-info',       label: 'Matching Information' },
    { value: 'map-labelling',       label: 'Map Labelling' },
  ],
  listening: [
    { value: 'fill-blank',          label: 'Fill in the blank' },
    { value: 'sentence-completion', label: 'Sentence Completion (kéo-thả từ Word Bank)' },
    { value: 'multiple-choice',     label: 'Multiple Choice (1 đáp án)' },
    { value: 'multi-answer-group',  label: 'Choose TWO/THREE Letters A-G ✦' },
    { value: 'matching-info',       label: 'Matching – gõ chữ cái A/B/C vào ô' },
    { value: 'map-labelling',       label: 'Map Labelling' },
  ],
};

const ALLOWED = {
  plain:               null,
  table:               ['fill-blank', 'sentence-completion'],
  'note-form':         ['fill-blank', 'sentence-completion'],
  'drag-drop':         ['fill-blank'],
  'matching-options':  ['matching-info'],
  'sentence-endings':  ['matching-info'],
  'matching-headings': ['matching-headings'],
  'summary-completion':['fill-blank'],
  map:                 ['map-labelling', 'fill-blank'],
};

const GROUP_LABEL = {
  plain:               '💬 Câu hỏi thường',
  table:               '📋 Bảng (Table)',
  'note-form':         '📝 Note Completion',
  'drag-drop':         '🎯 Kéo-thả (Drag & Drop)',
  'matching-options':  '🔗 Matching Features',
  'sentence-endings':  '🔚 Sentence Endings',
  'matching-headings': '📌 Matching Headings',
  'summary-completion':'🧩 Summary Completion',
  map:                 '🗺️ Map/Diagram',
};

const TYPE_LABEL = {
  'true-false-ng':     'True/False/NG',
  'yes-no-ng':         'Yes/No/NG',
  'multiple-choice':   'Multiple Choice',
  'multi-answer-group':'Choose Letters ✦',
  'checkbox':          'MC nhiều đáp án',
  'fill-blank':        'Fill-blank',
  'sentence-completion':'Sentence Completion',
  'matching-headings': 'Matching Headings',
  'matching-info':     'Matching Info',
  'map-labelling':     'Map Labelling',
};

const ANS_HINT = {
  'true-false-ng':     'TRUE / FALSE / NOT GIVEN',
  'yes-no-ng':         'YES / NO / NOT GIVEN',
  'multiple-choice':   'Chữ cái: A, B, C hoặc D',
  'multi-answer-group':'Chữ cái: A, B, C… (1 đáp án/câu — tạo nhiều câu cùng options)',
  'checkbox':          '["A","C"] — mảng JSON đáp án đúng',
  'fill-blank':        'Từ/cụm từ cần điền. Nhiều đáp án: word1 / word2',
  'sentence-completion':'Từ trong Word Bank',
  'matching-headings': 'Số La Mã: i, ii, iii…',
  'matching-info':     'Chữ cái: A, B, C…',
  'map-labelling':     'Nhãn điền vào sơ đồ',
};

function defaultGroup(type) {
  const base = { groupType: type, groupTitle: '', instruction: '', questions: [] };
  switch (type) {
    case 'table':             return { ...base, tableConfig: { headers: ['', '', ''], rows: [['', '', '']] } };
    case 'note-form':         return { ...base, noteConfig: { title: '', lines: [''] } };
    case 'matching-options':  return { ...base, matchingOptions: ['', '', '', '', '', ''], matchingOptionsTitle: '', matchingReuseAllowed: false, interchangeableAnswers: false };
    case 'matching-headings': return { ...base, headingsConfig: { headings: ROMAN.slice(0, 7).map(r => ({ numeral: r, text: '' })) } };
    case 'drag-drop':          return { ...base, dragDropConfig: { text: '', words: [] } };
    case 'summary-completion':return { ...base, summaryConfig: { text: '', wordBank: 'ABCDEFGH'.split('').map(l => ({ letter: l, word: '' })) } };
    case 'map':               return { ...base, imageUrl: '', dragDropConfig: { text: '', words: [] } };
    default:                  return base;
  }
}

function autoQType(groupType, ctx) {
  if (['table', 'note-form', 'summary-completion', 'drag-drop'].includes(groupType)) return 'fill-blank';
  if (groupType === 'map') return 'map-labelling';
  if (['matching-options', 'sentence-endings'].includes(groupType)) return 'matching-info';
  if (groupType === 'matching-headings') return 'matching-headings';
  return ctx === 'reading' ? 'true-false-ng' : 'fill-blank';
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function InfoBox({ children }) {
  return (
    <div style={{ fontSize: 11, background: 'rgba(61,139,255,.08)', border: '1px solid rgba(61,139,255,.25)', borderRadius: 7, padding: '8px 11px', marginBottom: 10, color: 'var(--text2)', lineHeight: 1.6 }}>
      {children}
    </div>
  );
}

function RemoveBtn({ onClick }) {
  return <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, padding: '2px 4px' }} onClick={onClick}>✕</button>;
}

function formatRanges(nums) {
  if (!nums.length) return '';
  const sorted = [...nums].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0], end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) { end = sorted[i]; }
    else { ranges.push(start === end ? `${start}` : `${start}–${end}`); start = end = sorted[i]; }
  }
  ranges.push(start === end ? `${start}` : `${start}–${end}`);
  return ranges.join(', ');
}

function TableConfig({ config, onChange }) {
  const { headers = ['', '', ''], rows = [[]] } = config || {};
  const updateH = v => onChange({ ...config, headers: v.split('|').map(h => h.trim()) });
  const updateRow = (ri, v) => onChange({ ...config, rows: rows.map((r, i) => i === ri ? v.split('|').map(c => c.trim()) : r) });
  const addRow = () => onChange({ ...config, rows: [...rows, Array(Math.max(headers.length, 3)).fill('')] });
  const removeRow = ri => onChange({ ...config, rows: rows.filter((_, i) => i !== ri) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <InfoBox>📋 <strong>Table/Note Completion:</strong> Tiêu đề cột cách nhau bằng <code>|</code>. Dùng <code>__Q1__</code> trong hàng để đánh dấu ô cần điền. Câu hỏi bên dưới chỉ cần số câu + đáp án.</InfoBox>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Tiêu đề cột (cách bằng |)</label>
        <input className="form-input" style={{ marginTop: 4, fontSize: 12 }} value={headers.join(' | ')} onChange={e => updateH(e.target.value)} placeholder="Apartments | Parking | Additional information" />
      </div>
      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Hàng (dùng | giữa ô, __Q1__ cho ô trống)</label>
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {rows.map((r, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', width: 18, textAlign: 'center' }}>{ri + 1}</span>
            <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 9px' }} value={Array.isArray(r) ? r.join(' | ') : r} onChange={e => updateRow(ri, e.target.value)} placeholder="Rose Garden | free parking | a large __Q1__" />
            <RemoveBtn onClick={() => removeRow(ri)} />
          </div>
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 7 }} onClick={addRow}>＋ Thêm hàng</button>
    </div>
  );
}

function NoteConfig({ config, onChange }) {
  const { title = '', lines = [''] } = config || {};
  const updateLine = (i, v) => onChange({ ...config, lines: lines.map((l, j) => j === i ? v : l) });
  const addLine = () => onChange({ ...config, lines: [...lines, ''] });
  const removeLine = i => onChange({ ...config, lines: lines.filter((_, j) => j !== i) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <InfoBox>📝 <strong>Note Completion:</strong> Tiêu đề khung (tùy chọn), rồi từng dòng nội dung. Dùng <code>__Q6__</code> cho chỗ trống. Câu hỏi bên dưới: fill-blank, đáp án là từ cần điền.</InfoBox>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)' }}>Tiêu đề khung</label>
        <input className="form-input" style={{ marginTop: 4, fontSize: 12 }} value={title} onChange={e => onChange({ ...config, title: e.target.value })} placeholder="VD: How Business Works" />
      </div>
      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Các dòng (dùng __Q6__ cho chỗ trống)</label>
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 9px' }} value={l} onChange={e => updateLine(i, e.target.value)} placeholder="The most important aspect is __Q6__ in others." />
            <RemoveBtn onClick={() => removeLine(i)} />
          </div>
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 7 }} onClick={addLine}>＋ Thêm dòng</button>
    </div>
  );
}

function MatchingOptionsConfig({ group, onChange }) {
  const isSE = group.groupType === 'sentence-endings';
  const matchOpts = group.matchingOptions || ['', '', '', '', '', ''];
  const endings = group.endingsConfig?.endings || [];
  const setMode = mode => {
    if (mode === 'endings') {
      const src = matchOpts.length ? matchOpts : Array(6).fill('');
      onChange({ ...group, groupType: 'sentence-endings', endingsConfig: { endings: src.map((t, i) => ({ letter: 'ABCDEFGHIJ'[i] || String(i + 1), text: t })) } });
    } else {
      onChange({ ...group, groupType: 'matching-options', matchingOptions: endings.length ? endings.map(e => e.text) : Array(6).fill('') });
    }
  };
  const updateOpt = (i, v) => { const o = [...matchOpts]; o[i] = v; onChange({ ...group, matchingOptions: o }); };
  const addOpt = () => onChange({ ...group, matchingOptions: [...matchOpts, ''] });
  const removeOpt = i => onChange({ ...group, matchingOptions: matchOpts.filter((_, j) => j !== i) });
  const updateEnding = (i, f, v) => onChange({ ...group, endingsConfig: { endings: endings.map((e, j) => j === i ? { ...e, [f]: v } : e) } });
  const addEnding = () => { const idx = endings.length; onChange({ ...group, endingsConfig: { endings: [...endings, { letter: 'ABCDEFGHIJ'[idx] || String(idx + 1), text: '' }] } }); };
  const removeEnding = i => onChange({ ...group, endingsConfig: { endings: endings.filter((_, j) => j !== i) } });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
          <input type="radio" checked={!isSE} onChange={() => setMode('matching')} /> 🔗 Matching / Choose Letters
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
          <input type="radio" checked={isSE} onChange={() => setMode('endings')} /> 🔚 Sentence Endings
        </label>
      </div>
      {!isSE ? (
        <>
          <InfoBox>🔗 <strong>Matching:</strong> Nhập người/sự vật A→G. Câu hỏi loại <code>matching-info</code>. Hoặc 5-7 lựa chọn + bật Hoán đổi cho Choose TWO/THREE letters.</InfoBox>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={group.matchingReuseAllowed || false} onChange={e => onChange({ ...group, matchingReuseAllowed: e.target.checked })} /> NB: You may use any letter more than once
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: 'var(--green)', fontWeight: 600 }}>
              <input type="checkbox" checked={group.interchangeableAnswers || false} onChange={e => onChange({ ...group, interchangeableAnswers: e.target.checked })} /> Hoán đổi thứ tự (Choose TWO/THREE)
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Tiêu đề bảng lựa chọn (tuỳ chọn)</label>
            <input className="form-input" style={{ marginTop: 4, fontSize: 12, padding: '5px 9px', width: '100%' }}
              value={group.matchingOptionsTitle || ''} placeholder='VD: "Types of Products"'
              onChange={e => onChange({ ...group, matchingOptionsTitle: e.target.value })} />
          </div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Danh sách lựa chọn (A, B, C…)</label>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {matchOpts.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--blue)', width: 18, fontSize: 13 }}>{String.fromCharCode(65 + i)}.</span>
                <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 9px' }} value={opt} onChange={e => updateOpt(i, e.target.value)} placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`} />
                <RemoveBtn onClick={() => removeOpt(i)} />
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 7 }} onClick={addOpt}>＋ Thêm mục</button>
        </>
      ) : (
        <>
          <InfoBox>🔚 <strong>Sentence Endings:</strong> Nhập phần kết câu A-H. Câu hỏi: mỗi câu = phần đầu câu, đáp án = chữ cái (A, B…).</InfoBox>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Danh sách phần kết câu</label>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {endings.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input className="form-input" style={{ width: 38, fontSize: 12, padding: '5px 7px', fontWeight: 700 }} value={e.letter} onChange={ev => updateEnding(i, 'letter', ev.target.value)} placeholder="A" />
                <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 9px' }} value={e.text} onChange={ev => updateEnding(i, 'text', ev.target.value)} placeholder="can be found in unusual thoughts and chance events." />
                <RemoveBtn onClick={() => removeEnding(i)} />
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 7 }} onClick={addEnding}>＋ Thêm mục</button>
        </>
      )}
    </div>
  );
}

function MatchingHeadingsConfig({ config, onChange }) {
  const headings = config?.headings || ROMAN.slice(0, 7).map(r => ({ numeral: r, text: '' }));
  const update = (i, f, v) => onChange({ headings: headings.map((h, j) => j === i ? { ...h, [f]: v } : h) });
  const add = () => onChange({ headings: [...headings, { numeral: ROMAN[headings.length] || '', text: '' }] });
  const remove = i => onChange({ headings: headings.filter((_, j) => j !== i) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <InfoBox>📌 <strong>Matching Headings:</strong> Nhập tiêu đề (số La Mã + nội dung). Câu hỏi: nội dung = tên đoạn (VD: <em>Section A</em>), đáp án = số La Mã tương ứng (VD: <em>iii</em>).</InfoBox>
      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Danh sách tiêu đề</label>
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {headings.map((h, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input className="form-input" style={{ width: 42, fontSize: 12, padding: '5px 7px', fontStyle: 'italic' }} value={h.numeral} onChange={e => update(i, 'numeral', e.target.value)} placeholder="i" />
            <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 9px' }} value={h.text} onChange={e => update(i, 'text', e.target.value)} placeholder="The history of silk production" />
            <RemoveBtn onClick={() => remove(i)} />
          </div>
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 7 }} onClick={add}>＋ Thêm tiêu đề</button>
    </div>
  );
}

function SummaryConfig({ config, onChange }) {
  const { text = '', wordBank = [] } = config || {};
  const updateWB = (i, f, v) => onChange({ ...config, wordBank: wordBank.map((w, j) => j === i ? { ...w, [f]: v } : w) });
  const addWB = () => { const l = wordBank.length; onChange({ ...config, wordBank: [...wordBank, { letter: String.fromCharCode(65 + l), word: '' }] }); };
  const removeWB = i => onChange({ ...config, wordBank: wordBank.filter((_, j) => j !== i) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <InfoBox>🧩 <strong>Summary Completion:</strong> Đoạn tóm tắt với <code>__Q14__</code> cho chỗ trống. Học sinh kéo-thả <strong>từ</strong> từ Word Bank. Câu hỏi: số câu + <strong>đáp án là từ thực tế</strong> (VD: <em>popular</em>, không phải chữ cái). Nhiều đáp án chấp nhận: <code>word1 / word2</code>.</InfoBox>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Đoạn tóm tắt (dùng __Q14__ cho chỗ trống)</label>
        <textarea className="form-input" rows={4} style={{ marginTop: 4, fontSize: 12, resize: 'vertical' }} value={text} onChange={e => onChange({ ...config, text: e.target.value })} placeholder="The programme focuses on __Q14__ management and __Q15__ skills…" />
      </div>
      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Word Bank (chữ cái → từ)</label>
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {wordBank.map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input className="form-input" style={{ width: 38, fontSize: 12, padding: '5px 7px', fontWeight: 700 }} value={w.letter} onChange={e => updateWB(i, 'letter', e.target.value)} placeholder="A" />
            <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 9px' }} value={w.word} onChange={e => updateWB(i, 'word', e.target.value)} placeholder="popular" />
            <RemoveBtn onClick={() => removeWB(i)} />
          </div>
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 7 }} onClick={addWB}>＋ Thêm từ</button>
    </div>
  );
}

function DragDropConfig({ config, onChange }) {
  const { text = '', words = [] } = config || {};
  const updateWord = (i, v) => onChange({ ...config, words: words.map((w, j) => j === i ? v : w) });
  const addWord = () => onChange({ ...config, words: [...words, ''] });
  const removeWord = i => onChange({ ...config, words: words.filter((_, j) => j !== i) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <InfoBox>
        🎯 <strong>Drag &amp; Drop:</strong> Nhập nội dung/lưu đồ với <code>__Q5__</code> cho chỗ trống.
        Danh sách từ/cụm từ bên dưới là <strong>Option Bank</strong> — học sinh kéo thả vào chỗ trống.
        Có thể thêm từ mồi (distractors) để tăng độ khó.
        Đáp án mỗi câu = từ/cụm từ thực tế (VD: <em>export routes</em>). Nhiều đáp án: <code>word1 / word2</code>.
      </InfoBox>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>
          Nội dung / Lưu đồ (dùng __Q5__ cho chỗ trống)
        </label>
        <textarea className="form-input" rows={5} style={{ marginTop: 4, fontSize: 12, resize: 'vertical' }}
          value={text} onChange={e => onChange({ ...config, text: e.target.value })}
          placeholder={"Examine a pencil and discuss where the materials come from.\nLocate the top 5. __Q5__ on a world map.\nDiscuss the pros and cons of different 6. __Q6__.\nIn groups, discuss countries' possible 7. __Q7__ like USA."} />
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
          Mỗi <code>__Q5__</code> = 1 chỗ trống ứng với câu Q5 bên dưới. Xuống dòng bình thường để tạo các dòng / khung riêng.
        </div>
      </div>
      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>
        Option Bank – từ / cụm từ (gồm cả distractors)
      </label>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, marginBottom: 6 }}>
        Thêm 2–4 từ mồi không phải đáp án để tăng độ khó. Thứ tự nhập = thứ tự hiển thị cho học sinh.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {words.map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--text3)', width: 20, fontSize: 12, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
            <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 9px' }}
              value={w} onChange={e => updateWord(i, e.target.value)} placeholder="VD: export routes" />
            <RemoveBtn onClick={() => removeWord(i)} />
          </div>
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={addWord}>＋ Thêm từ / cụm từ</button>
    </div>
  );
}

function MapConfig({ imageUrl, dragDropConfig, onImageChange, onDragDropChange, context }) {
  const toast = useToast();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const words = dragDropConfig?.words || [];
  const isDragDrop = words.length > 0;

  async function uploadMapImage() {
    const file = fileRef.current?.files[0];
    if (!file) { toast('Chọn ảnh trước', 'error'); return; }
    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const endpoint = context === 'listening'
        ? `${API}/listening/admin/upload-map-image`
        : `${API}/admin/passages/upload-map-image`;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.message);
      onImageChange(d.url);
      toast('Upload ảnh thành công');
    } catch (err) { toast('Upload thất bại: ' + err.message, 'error'); }
    finally { setUploading(false); }
  }

  function toggleDragDrop(enable) {
    if (enable) onDragDropChange({ text: '', words: [''] });
    else onDragDropChange({ text: '', words: [] });
  }
  const updateWord = (i, v) => onDragDropChange({ ...dragDropConfig, words: words.map((w, j) => j === i ? v : w) });
  const addWord = () => onDragDropChange({ ...dragDropConfig, words: [...words, ''] });
  const removeWord = i => onDragDropChange({ ...dragDropConfig, words: words.filter((_, j) => j !== i) });

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Image section */}
      <div>
        <InfoBox>🗺️ <strong>Map/Plan/Diagram:</strong> Upload hình sơ đồ. Chọn <strong>Kéo-thả</strong> để thêm Option Bank — học sinh kéo nhãn vào đúng số câu trên sơ đồ. Để trống Option Bank = dạng điền chữ bình thường.</InfoBox>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>URL hình ảnh sơ đồ</label>
            <input className="form-input" style={{ marginTop: 4, fontSize: 12 }} value={imageUrl || ''} onChange={e => onImageChange(e.target.value)} placeholder="https://res.cloudinary.com/..." />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <input ref={fileRef} type="file" accept="image/*" className="form-input" style={{ padding: 5, flex: 1, fontSize: 11 }} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={uploadMapImage}
                disabled={uploading} style={{ flexShrink: 0, fontSize: 12 }}>
                {uploading ? 'Đang upload...' : '📤 Upload'}
              </button>
            </div>
          </div>
          {imageUrl && (
            <div style={{ width: 120, height: 80, border: '1.5px dashed var(--border2)', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
              <img src={imageUrl} alt="map preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 20, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
          <input type="radio" checked={!isDragDrop} onChange={() => toggleDragDrop(false)} />
          ✏️ Điền chữ (text input)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
          <input type="radio" checked={isDragDrop} onChange={() => toggleDragDrop(true)} />
          🎯 Kéo-thả (Option Bank)
        </label>
      </div>

      {/* Word bank editor (drag-drop mode only) */}
      {isDragDrop && (
        <div>
          <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>
            Option Bank – nhãn / từ (gồm cả distractors)
          </label>
          <div style={{ fontSize: 11, color: 'var(--text3)', margin: '3px 0 8px' }}>
            Đáp án mỗi câu = nhãn thực tế (VD: <em>car park</em>). Có thể thêm từ mồi để tăng độ khó.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {words.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text3)', width: 20, fontSize: 12, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 9px' }}
                  value={w} onChange={e => updateWord(i, e.target.value)} placeholder="VD: car park" />
                <RemoveBtn onClick={() => removeWord(i)} />
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={addWord}>＋ Thêm nhãn</button>
        </div>
      )}
    </div>
  );
}

function QuestionFormModal({ qForm, setQForm, groupType, context, onSave, onClose, isDup }) {
  const allTypes = Q_TYPES[context] || Q_TYPES.reading;
  const allowed = ALLOWED[groupType];
  const types = allowed ? allTypes.filter(t => allowed.includes(t.value)) : allTypes;
  const setF = k => e => setQForm(f => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));
  const setOpt = (i, v) => setQForm(f => { const o = [...(f.options || [])]; o[i] = v; return { ...f, options: o }; });
  const isTFNG = ['true-false-ng', 'yes-no-ng'].includes(qForm.type);
  const tfOpts = qForm.type === 'true-false-ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
  const isMultiOpt = t => ['checkbox', 'multi-answer-group'].includes(t);
  const needsOpts = ['multiple-choice', 'checkbox', 'multi-answer-group'].includes(qForm.type);
  const optLabels = isMultiOpt(qForm.type)
    ? Array.from({ length: (qForm.options || []).length }, (_, i) => String.fromCharCode(65 + i))
    : ['A','B','C','D'];
  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Câu hỏi trong nhóm</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 11, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Câu số *</label>
              <input className="form-input" type="number" min={1} value={qForm.questionNumber} onChange={setF('questionNumber')}
                style={{ borderColor: isDup ? '#ef4444' : '' }} />
              {isDup && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2, fontWeight: 600 }}>⚠ Số câu đã tồn tại!</div>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Loại câu *</label>
              <select className="form-input" value={qForm.type}
                onChange={e => {
                  const t = e.target.value;
                  setQForm(f => {
                    const opts = f.options || [];
                    let newOpts = opts;
                    if (isMultiOpt(t) && opts.length < 5) newOpts = [...opts, ...Array(5 - opts.length).fill('')];
                    else if (t === 'multiple-choice' && opts.length > 4) newOpts = opts.slice(0, 4);
                    return {
                      ...f, type: t, options: newOpts,
                      correctAnswer: ['true-false-ng','yes-no-ng'].includes(f.type) && !['true-false-ng','yes-no-ng'].includes(t) ? '' : f.correctAnswer,
                    };
                  });
                }}
                style={types.length === 1 ? { opacity: 0.7, pointerEvents: 'none' } : {}}>
                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {types.length === 1 && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>💡 Loại câu cố định cho nhóm này</div>}
            </div>
          </div>

          {qForm.type === 'multi-answer-group' && (
            <InfoBox>
              ✦ <strong>Choose TWO/THREE Letters A-G:</strong> Tạo <strong>từng câu riêng biệt</strong> với cùng danh sách options.<br/>
              Ví dụ Q18-20 "Choose THREE letters A-G": tạo <strong>3 câu</strong> (Q18, Q19, Q20), mỗi câu cùng type này, cùng options A-G, đáp án mỗi câu = <strong>1 chữ cái</strong> (A / B / C...). Hệ thống tự gộp thành 1 UI chung cho học sinh. <strong>Copy-paste options</strong> sang Q19, Q20 để tiết kiệm thời gian.
            </InfoBox>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              {qForm.type === 'fill-blank' ? 'Văn bản có chỗ trống (dùng ________ hoặc __Q1__)' : 'Nội dung câu hỏi'}
            </label>
            <textarea className="form-input" rows={3} value={qForm.questionText} onChange={setF('questionText')}
              placeholder={qForm.type === 'fill-blank' ? 'The meeting is on ________ at the community centre.' : 'Nội dung câu hỏi...'} />
          </div>

          {needsOpts && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Các đáp án {isMultiOpt(qForm.type) ? `A–${optLabels[optLabels.length - 1] || 'E'}` : 'A-D'}
              </label>
              {isMultiOpt(qForm.type) ? (
                <div style={{ marginTop: 4 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {optLabels.map((l, i) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontWeight: 700, color: 'var(--blue)', width: 18, fontSize: 12, flexShrink: 0 }}>{l}.</span>
                        <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 8px' }}
                          value={qForm.options?.[i] || ''} onChange={e => setOpt(i, e.target.value)} placeholder={l} />
                        {optLabels.length > 2 && (
                          <button type="button"
                            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, padding: '2px 4px', flexShrink: 0 }}
                            onClick={() => setQForm(f => ({
                              ...f,
                              options: f.options.filter((_, j) => j !== i),
                              correctAnswer: qForm.type === 'multi-answer-group' ? '' : '[]',
                            }))}>
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {optLabels.length < 7 && (
                    <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}
                      onClick={() => setQForm(f => ({ ...f, options: [...(f.options || []), ''] }))}>
                      ＋ Thêm đáp án
                    </button>
                  )}
                  {qForm.type === 'checkbox' && (
                    <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Số đáp án cần chọn:</label>
                      <input className="form-input" type="number" min={1} max={7}
                        value={qForm.checkboxCount || 2}
                        onChange={e => setQForm(f => ({ ...f, checkboxCount: Number(e.target.value) }))}
                        style={{ width: 55, fontSize: 12, padding: '5px 8px' }} />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 4 }}>
                  {optLabels.map((l, i) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontWeight: 700, color: 'var(--blue)', width: 14, fontSize: 12 }}>{l}.</span>
                      <input className="form-input" style={{ fontSize: 12, padding: '5px 8px' }}
                        value={qForm.options?.[i] || ''} onChange={e => setOpt(i, e.target.value)} placeholder={l} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {qForm.type === 'sentence-completion' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Word Bank (cách nhau bằng dấu phẩy)</label>
              <input className="form-input"
                value={Array.isArray(qForm.wordBank) ? qForm.wordBank.join(', ') : ''}
                onChange={e => setQForm(f => ({ ...f, wordBank: e.target.value.split(',').map(w => w.trim()).filter(Boolean) }))}
                placeholder="word1, phrase two, word3" />
            </div>
          )}

          {qForm.type === 'map-labelling' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hình ảnh riêng (để trống nếu dùng hình nhóm)</label>
              <input className="form-input" value={qForm.imageUrl || ''}
                onChange={e => setQForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="URL hình (tùy chọn)" />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Đáp án đúng *</label>
            {isTFNG ? (
              <select className="form-input" value={qForm.correctAnswer} onChange={setF('correctAnswer')}>
                <option value="">-- Chọn --</option>
                {tfOpts.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            ) : ['multiple-choice', 'multi-answer-group'].includes(qForm.type) && (qForm.options || []).some(o => o?.trim()) ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
                {(qForm.options || []).map((opt, i) => !opt?.trim() ? null : (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" name="mc-ans" checked={qForm.correctAnswer === optLabels[i]}
                      onChange={() => setQForm(f => ({ ...f, correctAnswer: optLabels[i] }))} />
                    <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{optLabels[i]}</span>
                  </label>
                ))}
              </div>
            ) : qForm.type === 'checkbox' && (qForm.options || []).some(o => o?.trim()) ? (
              <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  {(qForm.options || []).map((opt, i) => {
                    if (!opt?.trim()) return null;
                    const letter = optLabels[i];
                    let sel = false;
                    try { sel = JSON.parse(qForm.correctAnswer || '[]').includes(letter); } catch {}
                    return (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 }}>
                        <input type="checkbox" checked={sel} onChange={() => {
                          try {
                            const arr = JSON.parse(qForm.correctAnswer || '[]');
                            const next = sel ? arr.filter(l => l !== letter) : [...arr, letter].sort();
                            setQForm(f => ({ ...f, correctAnswer: JSON.stringify(next) }));
                          } catch { setQForm(f => ({ ...f, correctAnswer: JSON.stringify([letter]) })); }
                        }} />
                        <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{letter}</span>
                      </label>
                    );
                  })}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>JSON đáp án (tự cập nhật):</div>
                <input className="form-input" style={{ fontSize: 11 }} value={qForm.correctAnswer}
                  onChange={setF('correctAnswer')} placeholder='["A","C"]' />
              </div>
            ) : (
              <input className="form-input" value={qForm.correctAnswer} onChange={setF('correctAnswer')}
                placeholder={ANS_HINT[qForm.type] || 'Đáp án chính xác'} />
            )}
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>💡 {ANS_HINT[qForm.type]}</div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Giải thích (tùy chọn)</label>
            <textarea className="form-input" rows={2} value={qForm.explanation || ''} onChange={setF('explanation')} placeholder="Giải thích đáp án..." />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn btn-primary" onClick={onSave}>Lưu câu hỏi</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function QuestionGroupBuilder({ groups = [], onChange, context = 'reading', questionFrom = 1, questionTo = null }) {
  const confirm = useConfirm();
  const toast = useToast();
  const [showPicker, setShowPicker] = useState(false);
  const [showQForm, setShowQForm] = useState(false);
  const [activeGi, setActiveGi] = useState(null);
  const [editQi, setEditQi] = useState(null);
  const [qForm, setQForm] = useState(null);

  const allNums = groups.flatMap(g => (g.questions || []).map(q => q.questionNumber));
  const isDup = num => allNums.filter(n => n === num).length > 1;

  function isDupModal(newNum) {
    if (editQi !== null && activeGi !== null) {
      const origNum = groups[activeGi]?.questions[editQi]?.questionNumber;
      let removed = false;
      const others = allNums.filter(n => {
        if (!removed && n === origNum) { removed = true; return false; }
        return true;
      });
      return others.filter(n => n === newNum).length > 0;
    }
    return allNums.filter(n => n === newNum).length > 0;
  }

  function moveGroup(gi, dir) {
    const to = gi + dir;
    if (to < 0 || to >= groups.length) return;
    const next = [...groups];
    [next[gi], next[to]] = [next[to], next[gi]];
    onChange(next);
  }

  function duplicateGroup(gi) {
    const copy = JSON.parse(JSON.stringify(groups[gi]));
    copy.questions = [];
    if (copy.groupTitle) copy.groupTitle += ' (bản sao)';
    const next = [...groups];
    next.splice(gi + 1, 0, copy);
    onChange(next);
  }

  function addGroup(type) {
    onChange([...groups, defaultGroup(type)]);
    setShowPicker(false);
  }

  function updateGroup(gi, changes) {
    onChange(groups.map((g, i) => i === gi ? { ...g, ...changes } : g));
  }

  function removeGroup(gi) {
    confirm('Xóa nhóm câu hỏi này và toàn bộ câu hỏi bên trong?', () => {
      onChange(groups.filter((_, i) => i !== gi));
    });
  }

  function openAddQ(gi) {
    const g = groups[gi];
    const defaultType = autoQType(g.groupType || 'plain', context);
    const nextNum = allNums.length > 0 ? Math.max(...allNums) + 1 : questionFrom;
    setQForm({ questionNumber: nextNum, type: defaultType, questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', checkboxCount: 2, wordBank: [], imageUrl: '' });
    setActiveGi(gi);
    setEditQi(null);
    setShowQForm(true);
  }

  function openEditQ(gi, qi) {
    const q = groups[gi].questions[qi];
    setQForm({
      questionNumber: q.questionNumber,
      type: q.type,
      questionText: q.questionText || '',
      options: ['checkbox', 'multi-answer-group'].includes(q.type)
        ? (q.options?.length ? [...q.options] : ['', '', '', '', ''])
        : (q.options?.length ? [...q.options, '', '', '', ''].slice(0, 4) : ['', '', '', '']),
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      checkboxCount: q.checkboxCount || 2,
      wordBank: q.wordBank || [],
      imageUrl: q.imageUrl || '',
    });
    setActiveGi(gi);
    setEditQi(qi);
    setShowQForm(true);
  }

  function commitQ() {
    if (!qForm.questionNumber || qForm.questionNumber < 1) {
      toast('Số câu phải lớn hơn 0', 'error'); return;
    }
    if (isDupModal(qForm.questionNumber)) {
      toast(`Số câu ${qForm.questionNumber} đã tồn tại trong đề`, 'error'); return;
    }
    if (!qForm.correctAnswer.trim() && !['true-false-ng', 'yes-no-ng'].includes(qForm.type)) {
      toast('Vui lòng nhập đáp án đúng', 'error'); return;
    }
    const q = {
      questionNumber: qForm.questionNumber,
      type: qForm.type,
      questionText: qForm.questionText.trim(),
      correctAnswer: qForm.correctAnswer.trim(),
      explanation: (qForm.explanation || '').trim(),
    };
    if (['multiple-choice', 'checkbox', 'multi-answer-group'].includes(qForm.type)) q.options = (qForm.options || []).map(o => (o || '').trim()).filter(Boolean);
    if (qForm.type === 'checkbox') q.checkboxCount = qForm.checkboxCount || 2;
    if (qForm.type === 'sentence-completion') q.wordBank = qForm.wordBank || [];
    if (qForm.type === 'map-labelling') q.imageUrl = qForm.imageUrl || '';

    const updated = groups.map((g, gi) => {
      if (gi !== activeGi) return g;
      const qs = [...(g.questions || [])];
      if (editQi !== null) qs[editQi] = q;
      else qs.push(q);
      return { ...g, questions: qs.sort((a, b) => a.questionNumber - b.questionNumber) };
    });
    onChange(updated);
    setShowQForm(false);
  }

  function duplicateQ(gi, qi) {
    const q = JSON.parse(JSON.stringify(groups[gi].questions[qi]));
    const allNums = groups.flatMap(g => (g.questions || []).map(q => q.questionNumber));
    q.questionNumber = Math.max(...allNums) + 1;
    onChange(groups.map((g, i) => i !== gi ? g : {
      ...g,
      questions: [...g.questions, q].sort((a, b) => a.questionNumber - b.questionNumber),
    }));
  }

  function deleteQ(gi, qi) {
    confirm('Xóa câu hỏi này?', () => {
      onChange(groups.map((g, i) => i !== gi ? g : { ...g, questions: g.questions.filter((_, j) => j !== qi) }));
    });
  }

  function qRange(questions) {
    if (!questions?.length) return null;
    const nums = questions.map(q => q.questionNumber).sort((a, b) => a - b);
    if (nums.length === 1) return `Q${nums[0]}`;
    return `Q${nums[0]}–${nums[nums.length - 1]}`;
  }

  const totalQs = groups.reduce((n, g) => n + (g.questions?.length || 0), 0);

  // Validation: duplicates + missing numbers
  const dupNums = [...new Set(allNums.filter(n => allNums.filter(x => x === n).length > 1))].sort((a, b) => a - b);
  const missingNums = (() => {
    if (!allNums.length) return [];
    if (questionTo) {
      const numSet = new Set(allNums);
      const missing = [];
      for (let i = questionFrom; i <= questionTo; i++) { if (!numSet.has(i)) missing.push(i); }
      return missing;
    }
    const sorted = [...allNums].sort((a, b) => a - b);
    const missing = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let n = sorted[i] + 1; n < sorted[i + 1]; n++) missing.push(n);
    }
    return missing;
  })();
  const hasWarnings = dupNums.length > 0 || missingNums.length > 0;

  return (
    <div>
      {groups.map((g, gi) => (
        <div key={gi} style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 14, background: 'var(--bg)' }}>
          {/* Group header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ background: '#3d8bff', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>
              {GROUP_LABEL[g.groupType] || g.groupType}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Nhóm {gi + 1}</span>
            {qRange(g.questions) && (
              <span style={{ fontSize: 11, background: 'var(--surface2)', color: 'var(--text3)', padding: '2px 7px', borderRadius: 10, border: '1px solid var(--border)' }}>
                {qRange(g.questions)}
              </span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
              <button className="btn btn-ghost btn-sm btn-icon" title="Di chuyển lên" onClick={() => moveGroup(gi, -1)} style={{ opacity: gi === 0 ? 0.3 : 1 }}>↑</button>
              <button className="btn btn-ghost btn-sm btn-icon" title="Di chuyển xuống" onClick={() => moveGroup(gi, 1)} style={{ opacity: gi === groups.length - 1 ? 0.3 : 1 }}>↓</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} title="Sao chép nhóm (không sao chép câu hỏi)" onClick={() => duplicateGroup(gi)}>📋 Sao chép</button>
              <button className="btn btn-danger btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => removeGroup(gi)}>✕ Xoá</button>
            </div>
          </div>

          {/* Title + Instruction */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 8, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Tiêu đề nhóm</label>
              <input className="form-input" style={{ fontSize: 12, padding: '7px 10px' }}
                value={g.groupTitle || ''} onChange={e => updateGroup(gi, { groupTitle: e.target.value })}
                placeholder="VD: Questions 1-5" />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Hướng dẫn</label>
              <textarea className="form-input" rows={2} style={{ fontSize: 12, padding: '7px 10px', resize: 'vertical' }}
                value={g.instruction || ''} onChange={e => updateGroup(gi, { instruction: e.target.value })}
                placeholder="VD: Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer." />
            </div>
          </div>

          {/* Group-type config */}
          {g.groupType === 'table' && (
            <TableConfig config={g.tableConfig} onChange={cfg => updateGroup(gi, { tableConfig: cfg })} />
          )}
          {g.groupType === 'note-form' && (
            <NoteConfig config={g.noteConfig} onChange={cfg => updateGroup(gi, { noteConfig: cfg })} />
          )}
          {(g.groupType === 'matching-options' || g.groupType === 'sentence-endings') && (
            <MatchingOptionsConfig group={g} onChange={updated => onChange(groups.map((x, i) => i === gi ? updated : x))} />
          )}
          {g.groupType === 'matching-headings' && (
            <MatchingHeadingsConfig config={g.headingsConfig} onChange={cfg => updateGroup(gi, { headingsConfig: cfg })} />
          )}
          {g.groupType === 'drag-drop' && (
            <DragDropConfig config={g.dragDropConfig} onChange={cfg => updateGroup(gi, { dragDropConfig: cfg })} />
          )}
          {g.groupType === 'summary-completion' && (
            <SummaryConfig config={g.summaryConfig} onChange={cfg => updateGroup(gi, { summaryConfig: cfg })} />
          )}
          {g.groupType === 'map' && (
            <MapConfig
              imageUrl={g.imageUrl}
              dragDropConfig={g.dragDropConfig}
              onImageChange={url => updateGroup(gi, { imageUrl: url })}
              onDragDropChange={cfg => updateGroup(gi, { dragDropConfig: cfg })}
              context={context}
            />
          )}

          {/* Questions in group */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Câu hỏi ({g.questions?.length || 0})
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => openAddQ(gi)}>＋ Thêm câu</button>
            </div>
            {(g.questions || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '10px 0', color: 'var(--text3)', fontSize: 13 }}>Chưa có câu hỏi – nhấn "＋ Thêm câu"</div>
            ) : (
              <div className="table-wrap">
                <table className="table" style={{ fontSize: 12 }}>
                  <thead><tr>
                    <th style={{ width: 44 }}>SỐ</th>
                    <th style={{ width: 170 }}>LOẠI</th>
                    <th>NỘI DUNG</th>
                    <th style={{ width: 140 }}>ĐÁP ÁN</th>
                    <th style={{ width: 64 }}></th>
                  </tr></thead>
                  <tbody>
                    {(g.questions || []).map((q, qi) => (
                      <tr key={qi}>
                        <td style={{ fontWeight: 700, color: isDup(q.questionNumber) ? '#ef4444' : 'inherit' }}>
                          {q.questionNumber}
                          {isDup(q.questionNumber) && <span title="Số câu trùng!" style={{ marginLeft: 2 }}>⚠</span>}
                        </td>
                        <td><span className="badge badge-blue" style={{ fontSize: 10 }}>{TYPE_LABEL[q.type] || q.type}</span></td>
                        <td style={{ maxWidth: 220, fontSize: 12 }}>{(q.questionText || '–').slice(0, 70)}{(q.questionText || '').length > 70 ? '…' : ''}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{q.correctAnswer}</td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-ghost btn-sm btn-icon" title="Sao chép câu hỏi" onClick={() => duplicateQ(gi, qi)}>📋</button>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditQ(gi, qi)}>✏️</button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteQ(gi, qi)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add group button */}
      <button className="btn btn-ghost" style={{ width: '100%', border: '1.5px dashed var(--border)', borderRadius: 8, padding: '10px 0', fontSize: 13 }}
        onClick={() => setShowPicker(true)}>
        ＋ Thêm nhóm câu hỏi
      </button>

      {totalQs > 0 && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6, fontSize: 12, color: 'var(--text3)' }}>
          Tổng: <strong>{totalQs}</strong> câu hỏi trong <strong>{groups.length}</strong> nhóm
          {questionTo && <span style={{ marginLeft: 8 }}>| Phạm vi câu {questionFrom}–{questionTo} ({questionTo - questionFrom + 1} câu)</span>}
          {hasWarnings && <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 700 }}>⚠ Có lỗi nhập liệu!</span>}
        </div>
      )}

      {/* Validation warning banner */}
      {hasWarnings && (
        <div style={{ marginTop: 10, padding: '12px 16px', background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 10, fontSize: 13 }}>
          <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 8, fontSize: 14 }}>
            ⚠ Cảnh báo — cần kiểm tra lại câu hỏi
          </div>
          {dupNums.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: missingNums.length ? 8 : 0 }}>
              <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>🔴 Số câu bị trùng:</span>
              <span style={{ color: '#7f1d1d', fontWeight: 600 }}>
                {dupNums.map(n => `Câu ${n}`).join(', ')}
              </span>
            </div>
          )}
          {missingNums.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: '#d97706', fontWeight: 700, flexShrink: 0 }}>🟡 Số câu bị thiếu:</span>
              <span style={{ color: '#78350f', fontWeight: 600 }}>
                Câu {formatRanges(missingNums)}
                {questionTo
                  ? ` (so với phạm vi ${questionFrom}–${questionTo})`
                  : ' (khoảng trống giữa các câu hiện có)'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Group type picker */}
      {showPicker && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setShowPicker(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chọn loại nhóm câu hỏi</h3>
              <button className="modal-close" onClick={() => setShowPicker(false)}>✕</button>
            </div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(context === 'listening' ? GROUP_TYPES_LISTENING : GROUP_TYPES_READING).map(gt => (
                <div key={gt.value}
                  onClick={() => addGroup(gt.value)}
                  style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: 12, cursor: 'pointer', transition: 'all .15s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#3d8bff'; e.currentTarget.style.background = 'rgba(61,139,255,.06)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}
                >
                  <div style={{ fontSize: 18, marginBottom: 5 }}>{gt.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{gt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{gt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question form modal */}
      {showQForm && qForm && (
        <QuestionFormModal
          qForm={qForm}
          setQForm={setQForm}
          groupType={activeGi !== null ? (groups[activeGi]?.groupType || 'plain') : 'plain'}
          context={context}
          onSave={commitQ}
          onClose={() => setShowQForm(false)}
          isDup={qForm ? isDupModal(qForm.questionNumber) : false}
        />
      )}
    </div>
  );
}
