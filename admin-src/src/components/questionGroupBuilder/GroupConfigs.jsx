// Extracted from QuestionGroupBuilder.jsx — one config-editor component
// per question-group type (Table, Note, Matching, Headings, Summary,
// Drag & Drop, Map). Each is self-contained: it receives its own slice of
// config plus an onChange callback and has no dependency on the main
// builder's state beyond those props — safe to isolate from the
// orchestrating component that decides which one to render.
import { useRef, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { apiFetch } from '../../utils/api';
import { GuideBox, RemoveBtn } from './Shared';
import { ROMAN } from './constants';

export function TableConfig({ config, onChange }) {
  const { headers = ['', '', ''], rows = [[]] } = config || {};
  const updateH = v => onChange({ ...config, headers: v.split('|').map(h => h.trim()) });
  const updateRow = (ri, v) => onChange({ ...config, rows: rows.map((r, i) => i === ri ? v.split('|').map(c => c.trim()) : r) });
  const addRow = () => onChange({ ...config, rows: [...rows, Array(Math.max(headers.length, 3)).fill('')] });
  const removeRow = ri => onChange({ ...config, rows: rows.filter((_, i) => i !== ri) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <GuideBox title="Hướng dẫn: Table / Note Completion">
        <strong>Bước 1 – Tiêu đề cột:</strong> Nhập tên cột, phân cách bằng <code>|</code>.<br/>
        <em>✓ Đúng:</em> <code>Apartments | Parking | Additional notes</code><br/><br/>
        <strong>Bước 2 – Hàng nội dung:</strong> Mỗi ô phân cách bằng <code>|</code>. Dùng <code>__Q1__</code> cho ô cần điền — số phải khớp với số câu bên dưới.<br/>
        <em>✓ Đúng:</em> <code>Rose Garden | free parking | a large __Q1__</code><br/>
        <em>✗ Sai:</em> <code>Rose Garden, free parking, Q1</code> (thiếu <code>|</code> và <code>__</code>)<br/><br/>
        <strong>Bước 3 – Câu hỏi:</strong> Thêm câu hỏi loại <strong>Fill-blank</strong>. Số câu = số trong <code>__Q1__</code>. Đáp án = từ / cụm từ cần điền.<br/>
        <em>Lỗi thường gặp:</em> Đặt <code>__Q1__</code> nhưng quên tạo câu Q1 bên dưới.
      </GuideBox>
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

export function NoteConfig({ config, onChange }) {
  const { title = '', lines = [''] } = config || {};
  const updateLine = (i, v) => onChange({ ...config, lines: lines.map((l, j) => j === i ? v : l) });
  const addLine = () => onChange({ ...config, lines: [...lines, ''] });
  const removeLine = i => onChange({ ...config, lines: lines.filter((_, j) => j !== i) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <GuideBox title="Hướng dẫn: Note / Bullet / Flow-chart Completion">
        <strong>Tiêu đề khung (tùy chọn):</strong> Tên khung hiển thị ở đầu, ví dụ: <em>How Business Works</em>.<br/><br/>
        <strong>Dòng nội dung:</strong> Mỗi dòng = một hàng trong khung ghi chú. Dùng <code>__Q6__</code> cho chỗ trống — số phải khớp số câu bên dưới.<br/>
        <em>✓ Đúng:</em> <code>The most important aspect is __Q6__ in others.</code><br/>
        <em>✗ Sai:</em> <code>The most important aspect is Q6 in others.</code> (thiếu <code>__</code>)<br/><br/>
        <strong>Câu hỏi:</strong> Loại <strong>Fill-blank</strong>. Đáp án = từ / cụm từ cần điền.<br/>
        <em>Lỗi thường gặp:</em> Dùng <code>__Q6__</code> nhưng câu Q6 chưa được tạo.
      </GuideBox>
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

export function MatchingOptionsConfig({ group, onChange, context }) {
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
        {context !== 'listening' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
            <input type="radio" checked={isSE} onChange={() => setMode('endings')} /> 🔚 Sentence Endings
          </label>
        )}
      </div>
      {!isSE ? (
        <>
          <GuideBox title="Hướng dẫn: Matching / Choose from List">
            <strong>Bước 1 – Danh sách lựa chọn A, B, C…:</strong> Nhập từng mục (tên người / địa điểm / ý kiến / câu kết). Tối đa 10 mục.<br/>
            <em>✓ Ví dụ:</em> <code>A. Professor Jones&nbsp;&nbsp;B. Dr Smith&nbsp;&nbsp;C. The Institute</code><br/><br/>
            <strong>Bước 2 – Câu hỏi:</strong> Mỗi câu = 1 statement, đáp án = chữ cái (A / B / C…).<br/><br/>
            <strong>Choose TWO/THREE letters:</strong> Bật <em>Hoán đổi thứ tự</em>, tạo nhiều câu riêng (Q14, Q15, Q16), mỗi câu đáp án 1 chữ cái. Hệ thống chấm tự động cho phép thứ tự khác nhau.<br/><br/>
            <strong>NB: You may use any letter more than once</strong> → bật checkbox <em>Reuse allowed</em> để chip không bị ẩn sau khi dùng.
          </GuideBox>
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
          <GuideBox title="Hướng dẫn: Sentence Endings">
            <strong>Bước 1 – Phần kết câu (A, B, C…):</strong> Nhập từng phần kết câu. Chữ cái có thể tùy chỉnh (A, B, C… hoặc F, G, H…).<br/>
            <em>✓ Ví dụ:</em> <code>A&nbsp;&nbsp;can be found in unusual thoughts and chance events.</code><br/><br/>
            <strong>Bước 2 – Câu hỏi:</strong> Mỗi câu = phần đầu câu (beginning). Đáp án = chữ cái phần kết tương ứng.<br/>
            <em>✓ Câu hỏi:</em> <code>Creative ideas…</code><br/>
            <em>✓ Đáp án:</em> <code>A</code><br/><br/>
            <em>Lỗi thường gặp:</em> Nhập đáp án là toàn bộ câu kết thay vì chỉ nhập chữ cái.
          </GuideBox>
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

export function MatchingHeadingsConfig({ config, onChange }) {
  const headings = config?.headings || ROMAN.slice(0, 7).map(r => ({ numeral: r, text: '' }));
  const update = (i, f, v) => onChange({ headings: headings.map((h, j) => j === i ? { ...h, [f]: v } : h) });
  const add = () => onChange({ headings: [...headings, { numeral: ROMAN[headings.length] || '', text: '' }] });
  const remove = i => onChange({ headings: headings.filter((_, j) => j !== i) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <GuideBox title="Hướng dẫn: Matching Headings">
        <strong>Bước 1 – Danh sách tiêu đề:</strong> Nhập số La Mã (i, ii, iii…) và nội dung tiêu đề.<br/>
        <em>✓ Ví dụ:</em> <code>i&nbsp;&nbsp;The history of silk production</code><br/>
        <em>Thông thường:</em> 7–10 tiêu đề cho 5–8 đoạn văn (luôn nhiều tiêu đề hơn đoạn văn).<br/><br/>
        <strong>Bước 2 – Câu hỏi:</strong> Nội dung = tên đoạn văn trong bài đọc.<br/>
        <em>✓ Câu hỏi:</em> <code>Section A</code> hoặc <code>Paragraph B</code><br/>
        <em>✓ Đáp án:</em> <code>iii</code> (chính xác số La Mã — phân biệt chữ hoa / thường)<br/><br/>
        <em>Lỗi thường gặp:</em> Nhập đáp án là <code>III</code> (chữ hoa) thay vì <code>iii</code> (chữ thường).
      </GuideBox>
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

export function SummaryConfig({ config, onChange }) {
  const { text = '', wordBank = [] } = config || {};
  const updateWB = (i, f, v) => onChange({ ...config, wordBank: wordBank.map((w, j) => j === i ? { ...w, [f]: v } : w) });
  const addWB = () => { const l = wordBank.length; onChange({ ...config, wordBank: [...wordBank, { letter: String.fromCharCode(65 + l), word: '' }] }); };
  const removeWB = i => onChange({ ...config, wordBank: wordBank.filter((_, j) => j !== i) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <GuideBox title="Hướng dẫn: Summary Completion">
        <strong>Bước 1 – Đoạn tóm tắt:</strong> Nhập đoạn văn tóm tắt, dùng <code>__Q14__</code> cho chỗ trống.<br/>
        <em>✓ Ví dụ:</em> <code>The programme focuses on __Q14__ management and __Q15__ skills…</code><br/><br/>
        <strong>Bước 2 – Word Bank:</strong> Nhập từng từ / cụm từ cho Word Bank. Có thể thêm từ mồi (distractors) để tăng độ khó. Chữ cái (A, B, C…) được hiển thị kèm từ cho học sinh.<br/>
        <em>✓ Ví dụ:</em> <code>A → popular&nbsp;&nbsp;B → creative&nbsp;&nbsp;C → financial</code> (C là từ mồi)<br/><br/>
        <strong>Bước 3 – Câu hỏi:</strong> Thêm câu hỏi loại <strong>Fill-blank</strong>. Đáp án = <strong>từ thực tế</strong> (VD: <code>popular</code>), KHÔNG phải chữ cái.<br/>
        Nhiều đáp án chấp nhận: <code>word1 / word2</code><br/><br/>
        <em>Lỗi thường gặp:</em> Nhập đáp án là chữ cái <code>A</code> thay vì từ thực tế <code>popular</code>.
      </GuideBox>
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

export function DragDropConfig({ config, onChange }) {
  const { text = '', words = [] } = config || {};
  const updateWord = (i, v) => onChange({ ...config, words: words.map((w, j) => j === i ? v : w) });
  const addWord = () => onChange({ ...config, words: [...words, ''] });
  const removeWord = i => onChange({ ...config, words: words.filter((_, j) => j !== i) });
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
      <GuideBox title="Hướng dẫn: Drag & Drop / Flow-chart">
        <strong>Bước 1 – Nội dung / Lưu đồ:</strong> Nhập văn bản, dùng <code>__Q5__</code> cho chỗ trống. Xuống dòng để tạo từng bước trong lưu đồ.<br/>
        <em>✓ Ví dụ:</em><br/>
        <code>Locate the top 5. __Q5__ on a world map.</code><br/>
        <code>Discuss the pros and cons of different __Q6__.</code><br/><br/>
        <strong>Bước 2 – Option Bank:</strong> Nhập từng từ / cụm từ học sinh có thể kéo vào. Thêm 2–4 từ mồi (distractors) để tăng độ khó.<br/>
        <em>Thứ tự nhập = thứ tự hiển thị cho học sinh.</em><br/><br/>
        <strong>Bước 3 – Câu hỏi:</strong> Loại <strong>Fill-blank</strong>. Đáp án = từ thực tế trong Option Bank (VD: <code>export routes</code>).<br/>
        <em>Lỗi thường gặp:</em> Đáp án không khớp chính xác với từ trong Option Bank (kể cả khoảng trắng và chữ hoa/thường).
      </GuideBox>
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

export function MapConfig({ imageUrl, dragDropConfig, onImageChange, onDragDropChange, context }) {
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
        ? '/listening/admin/upload-map-image'
        : '/admin/passages/upload-map-image';
      const d = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ imageBase64: dataUrl }),
      });
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
        <GuideBox title="Hướng dẫn: Map / Diagram Labelling">
          <strong>Bước 1 – Upload hình ảnh:</strong> Chọn file ảnh → nhấn 📤 Upload. Hình ảnh được lưu trên Cloudinary và hiển thị preview bên phải.<br/><br/>
          <strong>Bước 2 – Chọn chế độ:</strong><br/>
          • <strong>✏️ Điền chữ:</strong> Học sinh tự gõ nhãn vào ô trống. Đáp án trong câu hỏi = từ cần điền.<br/>
          • <strong>🎯 Kéo-thả:</strong> Nhập Option Bank — học sinh kéo nhãn đúng vào đúng số câu trên sơ đồ. Đáp án = nhãn thực tế trong Option Bank.<br/><br/>
          <strong>Bước 3 – Câu hỏi:</strong> Thêm câu hỏi, điền số câu IELTS (ví dụ: 25, 26, 27…). Nội dung câu hỏi = nhãn / mô tả vị trí trên sơ đồ (tùy chọn).<br/><br/>
          <em>Lỗi thường gặp:</em> Quên upload hình ảnh, hoặc nhập đáp án không khớp với nhãn trong Option Bank.
        </GuideBox>
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
