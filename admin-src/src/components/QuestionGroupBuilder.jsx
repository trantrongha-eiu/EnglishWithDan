// Was 1,316 lines: static group/question-type config data, several
// self-contained per-group-type config editors (Table/Note/Matching/
// Headings/Summary/DragDrop/Map), the add/edit-question modal, and this
// main orchestrating component all in one file. The config data and
// editors take their own props and don't reach into this component's
// state via closure, so they were safe to extract into
// questionGroupBuilder/{constants,Shared,GroupConfigs,QuestionFormModal}
// — this file now holds only the stateful group-list orchestration that
// genuinely can't be split without threading most of its state through
// prop drilling for no clarity gain.
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from './ConfirmDialog';
import { GuideBox } from './questionGroupBuilder/Shared';
import {
  TableConfig, NoteConfig, MatchingOptionsConfig, MatchingHeadingsConfig,
  DragDropConfig, SummaryConfig, MapConfig,
} from './questionGroupBuilder/GroupConfigs';
import { QuestionFormModal } from './questionGroupBuilder/QuestionFormModal';
import { GroupTypePicker } from './questionGroupBuilder/GroupTypePicker';
import {
  GROUP_LABEL, TYPE_LABEL,
  defaultGroup, autoQType, formatRanges,
} from './questionGroupBuilder/constants';

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
    copy.interchangeableAnswers = false;
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
    if (!qForm.correctAnswer.trim()) {
      const isTFNGType = ['true-false-ng', 'yes-no-ng'].includes(qForm.type);
      toast(isTFNGType ? 'Vui lòng chọn đáp án đúng (True / False / Not Given)' : 'Vui lòng nhập đáp án đúng', 'error'); return;
    }
    if (['multiple-choice', 'multi-answer-group'].includes(qForm.type)) {
      const nonEmpty = (qForm.options || []).filter(o => o.trim());
      if (nonEmpty.length < 2) { toast('Vui lòng nhập ít nhất 2 lựa chọn (A, B, C…)', 'error'); return; }
    }
    if (['multiple-choice', 'true-false-ng', 'yes-no-ng'].includes(qForm.type) && !qForm.questionText.trim()) {
      toast('Vui lòng nhập nội dung câu hỏi (statement)', 'error'); return;
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

  // Map drag-drop: compute word list and position label for modal
  const activeGroup = activeGi !== null ? groups[activeGi] : null;
  const mapDDWords = (activeGroup?.groupType === 'map' ? (activeGroup?.dragDropConfig?.words || []) : []).filter(Boolean);
  const mapPosLabel = (() => {
    if (!mapDDWords.length || !activeGroup) return null;
    if (editQi !== null) {
      // Editing existing question: find its sorted position
      const sorted = [...(activeGroup.questions || [])].sort((a, b) => a.questionNumber - b.questionNumber);
      const origQ = activeGroup.questions[editQi];
      const idx = sorted.findIndex(q => q.questionNumber === origQ?.questionNumber);
      return idx >= 0 ? String.fromCharCode(97 + idx) : null;
    }
    // Adding new question: next position = current count
    return String.fromCharCode(97 + (activeGroup.questions || []).length);
  })();

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

  // Group-level warnings: missing images, empty banks, missing answers, etc.
  const groupWarnings = groups.flatMap((g, gi) => {
    const warns = [];
    const qs = g.questions || [];
    const label = `Nhóm ${gi + 1}`;
    if (g.groupType === 'map' && !g.imageUrl?.trim())
      warns.push({ level: 'error', msg: `${label} (Map/Diagram): Chưa upload hình ảnh`, gi });
    if (g.groupType === 'summary-completion') {
      if (!g.summaryConfig?.text?.trim())
        warns.push({ level: 'error', msg: `${label} (Summary): Chưa nhập đoạn tóm tắt`, gi });
      if (!(g.summaryConfig?.wordBank || []).some(w => w.word?.trim()))
        warns.push({ level: 'warn', msg: `${label} (Summary): Word bank còn trống`, gi });
    }
    if (g.groupType === 'note-form' && !(g.noteConfig?.lines || []).some(l => l.trim()))
      warns.push({ level: 'warn', msg: `${label} (Note): Chưa có dòng nội dung`, gi });
    if (g.groupType === 'table' && !(g.tableConfig?.rows || []).length)
      warns.push({ level: 'warn', msg: `${label} (Bảng): Chưa có hàng nào`, gi });
    if (g.groupType === 'matching-options' && !(g.matchingOptions?.some(o => o.trim())))
      warns.push({ level: 'warn', msg: `${label} (Matching Options): Chưa có danh sách lựa chọn`, gi });
    if (g.groupType === 'sentence-endings' && !(g.endingsConfig?.endings?.some(e => e.text?.trim())))
      warns.push({ level: 'warn', msg: `${label} (Sentence Endings): Chưa có danh sách đoạn câu`, gi });
    if (g.groupType === 'matching-headings' && !(g.headingsConfig?.headings || []).some(h => h.text?.trim()))
      warns.push({ level: 'warn', msg: `${label} (Matching Headings): Chưa có tiêu đề nào`, gi });
    if (g.groupType === 'drag-drop' && !(g.dragDropConfig?.words || []).some(w => w?.trim()))
      warns.push({ level: 'warn', msg: `${label} (Drag & Drop): Chưa có từ nào trong danh sách kéo thả`, gi });
    qs.forEach(q => {
      if (!q.correctAnswer?.trim())
        warns.push({ level: 'error', msg: `Câu ${q.questionNumber}: Thiếu đáp án đúng`, gi });
      if (['multiple-choice', 'true-false-ng', 'yes-no-ng'].includes(q.type) && !q.questionText?.trim())
        warns.push({ level: 'warn', msg: `Câu ${q.questionNumber}: Thiếu nội dung câu hỏi`, gi });
      if (q.type === 'multiple-choice' && (q.options || []).filter(o => o.trim()).length < 2)
        warns.push({ level: 'error', msg: `Câu ${q.questionNumber} (MC): Thiếu lựa chọn A–D`, gi });
      if (q.type === 'sentence-completion' && !(q.wordBank || []).length)
        warns.push({ level: 'warn', msg: `Câu ${q.questionNumber} (Sentence Completion): Word Bank trống`, gi });
    });
    return warns;
  });
  const hasWarnings = dupNums.length > 0 || missingNums.length > 0 || groupWarnings.length > 0;
  const hasErrors = dupNums.length > 0 || groupWarnings.some(w => w.level === 'error');

  return (
    <div>
      {groups.map((g, gi) => (
        <div key={gi} id={`qgroup-${gi}`} style={{ border: '1.5px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 14, background: 'var(--bg)', scrollMarginTop: 8 }}>
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
          {g.groupType === 'plain' && (
            <GuideBox title={context === 'listening' ? 'Hướng dẫn: Câu hỏi thường (Listening)' : 'Hướng dẫn: Câu hỏi thường (Reading)'}>
              <strong>Dùng khi:</strong> Câu hỏi độc lập — không cần bảng, form hay sơ đồ.<br/><br/>
              <strong>Fill-blank:</strong> Nhập câu có <code>________</code> (8 gạch) cho chỗ trống. Đáp án = từ / cụm từ cần điền.<br/>
              <em>✓ Ví dụ:</em> <code>The meeting is on ________ at the community centre.</code><br/><br/>
              <strong>Multiple Choice:</strong> Nhập statement + 4 lựa chọn A–D. Đáp án = chữ cái (A / B / C / D).<br/><br/>
              {context === 'listening'
                ? <><strong>Choose TWO/THREE Letters A–G:</strong> Tạo từng câu riêng (Q18, Q19, Q20), mỗi câu chọn type "Choose TWO/THREE Letters A-G ✦", cùng options A–G, đáp án = 1 chữ cái/câu. Hệ thống tự gộp thành 1 UI chung cho học sinh.<br/><br/></>
                : <><strong>True/False/NG &amp; Yes/No/NG:</strong> Nhập statement. Đáp án chọn từ nút: TRUE / FALSE / NOT GIVEN.<br/><br/></>}
              <em>Lỗi thường gặp:</em> Dùng nhóm "Câu hỏi thường" cho dạng cần bảng hoặc sơ đồ — hãy xoá nhóm và chọn đúng loại từ đầu.
            </GuideBox>
          )}
          {g.groupType === 'table' && (
            <TableConfig config={g.tableConfig} onChange={cfg => updateGroup(gi, { tableConfig: cfg })} />
          )}
          {g.groupType === 'note-form' && (
            <NoteConfig config={g.noteConfig} onChange={cfg => updateGroup(gi, { noteConfig: cfg })} />
          )}
          {(g.groupType === 'matching-options' || g.groupType === 'sentence-endings') && (
            <MatchingOptionsConfig group={g} onChange={updated => onChange(groups.map((x, i) => i === gi ? updated : x))} context={context} />
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
                    {(g.questions || []).map((q, qi) => {
                      const isMapDD = g.groupType === 'map' && (g.dragDropConfig?.words || []).filter(Boolean).length > 0;
                      return (
                      <tr key={qi}>
                        <td style={{ fontWeight: 700, color: isDup(q.questionNumber) ? '#ef4444' : 'inherit' }}>
                          {isMapDD
                            ? <><span style={{ color: 'var(--blue)', fontSize: 15 }}>{String.fromCharCode(97 + qi)}</span><span style={{ color: 'var(--text3)', fontSize: 10, marginLeft: 3 }}>Q{q.questionNumber}</span></>
                            : q.questionNumber}
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
                      );
                    })}
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
          {hasWarnings && <span style={{ marginLeft: 8, color: hasErrors ? '#ef4444' : '#d97706', fontWeight: 700 }}>{hasErrors ? '🔴 Có lỗi cần sửa!' : '🟡 Có cảnh báo'}</span>}
        </div>
      )}

      {/* Validation warning banner */}
      {hasWarnings && (
        <div style={{ marginTop: 10, padding: '12px 16px', background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 10, fontSize: 13 }}>
          <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 10, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            ⚠ Cần kiểm tra lại
            <span style={{ fontSize: 11, fontWeight: 400, color: '#b45309', marginLeft: 4 }}>(nhấn vào cảnh báo để đến vị trí)</span>
          </div>
          {dupNums.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>🔴</span>
              <span style={{ color: '#7f1d1d', fontWeight: 600 }}>
                Số câu bị trùng: {dupNums.map(n => `Câu ${n}`).join(', ')}
              </span>
            </div>
          )}
          {missingNums.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ color: '#d97706', fontWeight: 700, flexShrink: 0 }}>🟡</span>
              <span style={{ color: '#78350f', fontWeight: 600 }}>
                Số câu thiếu: Câu {formatRanges(missingNums)}
                {questionTo ? ` (so với phạm vi ${questionFrom}–${questionTo})` : ' (khoảng trống giữa các câu)'}
              </span>
            </div>
          )}
          {groupWarnings.map((w, i) => (
            <div key={i}
              onClick={() => document.getElementById(`qgroup-${w.gi}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < groupWarnings.length - 1 ? 5 : 0, cursor: 'pointer' }}>
              <span style={{ color: w.level === 'error' ? '#ef4444' : '#d97706', fontWeight: 700, flexShrink: 0 }}>
                {w.level === 'error' ? '🔴' : '🟡'}
              </span>
              <span style={{ color: w.level === 'error' ? '#7f1d1d' : '#78350f', fontWeight: 600, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 2 }}>
                {w.msg}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Group type picker */}
      {showPicker && (
        <GroupTypePicker context={context} onSelect={addGroup} onClose={() => setShowPicker(false)} />
      )}

      {/* Question form modal */}
      {showQForm && qForm && (
        <QuestionFormModal
          qForm={qForm}
          setQForm={setQForm}
          groupType={activeGroup?.groupType || 'plain'}
          context={context}
          onSave={commitQ}
          onClose={() => setShowQForm(false)}
          isDup={qForm ? isDupModal(qForm.questionNumber) : false}
          dragDropWords={mapDDWords}
          positionLabel={mapPosLabel}
        />
      )}
    </div>
  );
}
