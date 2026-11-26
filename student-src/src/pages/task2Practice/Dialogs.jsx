import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { ESSAY_LABELS, guideFlow, LESSON_MIN_WORDS, perBodyChains, Q_LABELS, T2_TRANSLATE_PASS, VQUIZ_LEN, VQUIZ_PASS } from '../../utils/task2Practice';
import { ideaSides } from './lib';
import { HistShell, Html, Spinner, TgShell } from './Parts';

// "Guideline for teacher", "Lịch sử" and "Xem trước câu hỏi".

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const luluSvg = (mood) => { try { return window.Mascot ? window.Mascot.svg(mood, { label: 'Lulu' }) : '🍊'; } catch { return '🍊'; } };

function tgStep(i, num, title, time, goal, how, tip, extra) {
  return `<section class="t2-tg-step" style="--i:${i}">
      <div class="t2-tg-step-head"><span class="t2-step-num">${num}</span><b>${title}</b>${time ? `<span class="t2-tg-time"><i class="far fa-clock"></i> ${time}</span>` : ''}</div>
      ${goal ? `<p class="t2-tg-goal"><b>Mục tiêu:</b> ${goal}</p>` : ''}
      <ul class="t2-tg-how">${how.filter(Boolean).map((h) => `<li>${h}</li>`).join('')}</ul>
      ${extra || ''}
      ${tip ? `<div class="t2-tg-tip">💡 ${tip}</div>` : ''}
    </section>`;
}
function chainsHtml(chains) {
  return chains.map((c) => `<div class="t2-flow">${c.label ? `<b style="font-size:12px">${esc(c.label)}:</b>` : ''}${c.steps.map((s) => `<span>${esc(s)}</span>`).join('<i class="fas fa-chevron-right"></i>')}</div>
        ${c.note ? `<p class="t2-step-desc" style="margin:-6px 0 10px">💡 ${esc(c.note)}</p>` : ''}`).join('');
}
// The full lesson plan (timings, grouping, what to model on the board, the
// brainstorm answer key) — kept out of the student cards
function teacherGuideHtml(t, { n, vocabN, guide, week }) {
  const sides = ideaSides(t);
  const hasHints = sides.some((s) => (s.points || []).length);
  const flow = guideFlow(guide);
  const chains = perBodyChains(guide?.outline?.perBody);
  const typeLabel = ESSAY_LABELS[t.essayType] || t.essayType || '';
  const sideNames = sides.map((s) => `<b>${esc(s.side)}</b>`).join(', ');
  const tl = [['p1', 'Từ vựng', 15], ['p1', 'Brainstorm', 15], ['p1', 'Dịch câu', 15], ['p1', 'Hướng dẫn viết', 15], ['p2', 'Viết trên lớp', 30], ['p3', 'Về nhà', 12]];
  let i = 0;
  return `
    <div class="t2-tg-prompt"><b>Đề bài:</b> ${esc(t.prompt)}</div>
    <div class="t2-tg-tl" aria-hidden="true">${tl.map(([p, label, m], k) => `<div class="t2-tg-seg ${p}" style="flex:${m};--i:${k}">${label}<small>${p === 'p3' ? 'ở nhà' : m + '′'}</small></div>`).join('')}</div>
    <div class="t2-tg-tl-note">Tổng thời gian trên lớp ≈ 90 phút · phần cuối làm ở nhà.</div>
    <div class="t2-tg-group">
      <div class="t2-tg-group-k"><i class="fas fa-users"></i> Ưu tiên học theo nhóm</div>
      <p>Buổi học hiệu quả nhất khi HS <b>làm việc và viết bài theo nhóm</b>: các em học được ý tưởng, từ vựng và cách diễn đạt của nhau, mạnh dạn hơn khi viết.</p>
      <ul class="t2-tg-how">
        <li>Chia nhóm <b>3–4 bạn</b>, <b>trộn trình độ</b> (mỗi nhóm có 1 bạn khá) và giữ nguyên nhóm suốt buổi.</li>
        <li>Phân vai, đổi vai sau mỗi bước:
          <span class="t2-tg-roles"><span>👑 Nhóm trưởng</span><span>✍️ Thư ký</span><span>🎤 Người trình bày</span><span>⏱️ Canh giờ</span></span></li>
        <li><b>Tính điểm thi đua nhóm</b> suốt buổi (quiz, brainstorm, đoạn văn hay nhất) — nhóm thắng được cộng điểm / khen trước lớp.</li>
      </ul>
    </div>

    <div class="t2-tg-phase t2-phase" style="margin-top:12px"><span class="t2-phase-k">Giai đoạn 1</span><b>Scaffolding</b><span class="t2-phase-time">~60 phút</span>
      <p>Chuẩn bị từ vựng, ý tưởng và cách diễn đạt trước khi viết.</p></div>
    ${tgStep(i++, 1, 'Từ vựng &amp; collocations', '15′',
    `HS nắm ${vocabN ? vocabN + ' từ / collocation' : 'các từ / collocation'} trọng tâm của chủ đề.`,
    ['Giới thiệu nhanh các từ trọng tâm, bấm 🔊 cho cả lớp nghe phát âm, nhấn mạnh <b>collocation</b> đi kèm.',
      'Cho HS bấm <b>Lưu tất cả vào sổ</b>.',
      `<b>Quiz từ vựng là bắt buộc:</b> mỗi HS phải đạt <b>≥ ${VQUIZ_PASS}%</b> mới mở khoá các bước 2–6 (chưa đạt thì làm lại). Quiz cố định ${VQUIZ_LEN} câu — cả lớp cùng một bộ câu hỏi, cùng thứ tự, nên GV có thể chữa chung.`,
      '<b>Thi đua nhóm:</b> trước khi làm quiz cá nhân, các nhóm đố nhau collocation (nhóm A nói từ, nhóm B nói cụm đi kèm) — tính điểm nhóm; bạn đạt quiz trước kèm bạn chưa đạt.'],
    'Nếu HS chưa đạt quiz, các bước sau trên máy vẫn bị khoá — vẫn cho HS tham gia brainstorm nhóm (trên giấy / bảng) rồi nhập ý sau khi mở khoá.')}
    ${tgStep(i++, 2, 'Brainstorm ý tưởng — thi đua nhóm', '15′',
    'Có thật nhiều ý hay, hợp lý và dùng được trong bài IELTS.',
    [`Chia lớp thành nhóm <b>3–4 bạn</b>. Mỗi nhóm có <b>~7 phút</b> liệt kê thật nhiều ý cho từng phần: ${sideNames}.`,
      'Các nhóm lần lượt trình bày. Nhóm có nhiều ý <b>hay, hợp lý và dùng được trong bài IELTS</b> nhất sẽ thắng.',
      hasHints ? 'Sau khi các nhóm trình bày xong mới cho HS mở <b>“Xem gợi ý ý chính”</b> để so sánh.' : '',
      'HS ghi lại ý tốt nhất (của nhóm mình và nhóm bạn) vào ô — các ý này hiện ở cột trái khi viết bài.'],
    '', hasHints ? `<details class="t2-model"><summary>🔑 Gợi ý ý chính (đáp án tham khảo cho GV)</summary>
        ${sides.map((h) => `<div class="t2-brainstorm-hint-side">${esc(h.side)}</div>
          <ul class="t2-brainstorm-hint-list">${(h.points || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`).join('')}
      </details>` : '')}
    ${tgStep(i++, 3, 'Dịch câu Việt → Anh', '15′',
    'Chuyển ý tưởng thành câu tiếng Anh đúng, dùng từ vựng vừa học.',
    ['HS làm các câu tiếng Việt chứa ý chính của đề; hệ thống chấm và gợi ý ngay.',
      'Mỗi câu có một dạng cố định (cả lớp giống nhau): <b>chọn cụm đúng</b>, <b>điền cụm từ</b>, <b>nghe &amp; điền</b>, <b>gõ cả câu</b> (~1/4 số câu) và <b>ghép cụm</b> cho câu dài — nhanh hơn nhiều so với gõ cả ~20 câu.',
      `<b>Bắt buộc:</b> HS phải dịch đúng <b>≥ ${T2_TRANSLATE_PASS}%</b> số câu mới mở khoá bước 5–6 (viết trên lớp, bài về nhà) trên máy — chưa đạt thì “Làm lại” các câu chưa đúng.`,
      '<b>Đối chiếu theo nhóm (~3′):</b> các bạn trong nhóm so sánh bản dịch của nhau, chọn câu hay nhất cho mỗi ý; người trình bày đọc câu của nhóm trước lớp.',
      'GV chữa nhanh 2–3 câu khó trên bảng, chỉ ra collocation / cấu trúc hay.',
      'Câu HS dịch sẽ hiện ở <b>cột trái màn hình viết</b> — dịch càng nhiều, viết càng dễ.',
      'Hết giờ trên lớp: giao làm nốt ở nhà. HS khá có thể chọn <b>Luyện đủ bộ câu</b> (điền từ, sắp xếp, nhận diện dạng…) trong “Tuỳ chọn khác”.'],
    'Dùng <b>Xem trước câu hỏi</b> (trong “Tuỳ chọn khác”) để chuẩn bị trước buổi học.')}
    ${tgStep(i++, 4, 'Hướng dẫn viết (Guided writing)', '15′',
    'HS biết biến <b>ý tưởng + câu đã dịch</b> thành đoạn văn hoàn chỉnh, thay vì học thuộc bài mẫu.',
    [`Giới thiệu bố cục bài <b>${esc(typeLabel)}</b>.`,
      '<b>GV làm mẫu trên bảng:</b> chọn 1 ý từ phần brainstorm → ghép 3–4 câu đã dịch theo thứ tự <b>Ý chính → Giải thích → Kết quả → Ví dụ</b> → thêm từ nối (<i>This is because, As a result, For example</i>) → sửa cho câu liền mạch.',
      '<b>Phân tích đoạn mẫu theo nhóm:</b> mỗi nhóm tìm trong <b>đoạn mẫu cùng dạng</b> (đề khác) một phần của công thức (ý chính / giải thích / kết quả / ví dụ) và các từ nối, rồi chia sẻ với lớp.'],
    '', `<div class="t2-flow">${flow.map((f) => `<span>${esc(f)}</span>`).join('<i class="fas fa-chevron-right"></i>')}</div>
        ${chains.length ? `<details class="t2-model"><summary>🧭 Triển khai mỗi đoạn thân bài</summary>${chainsHtml(chains)}</details>` : ''}`)}

    <div class="t2-tg-phase t2-phase is-class"><span class="t2-phase-k">Giai đoạn 2</span><b>Viết trên lớp</b><span class="t2-phase-time">~30 phút</span>
      <p>Viết khoảng một nửa bài dưới sự hướng dẫn của GV — kết hợp viết cá nhân và viết theo nhóm.</p></div>
    ${tgStep(i++, 5, 'Viết Mở bài + Thân bài 1 — viết theo nhóm', '30′',
    'Cả nhóm cùng tạo ra một đoạn văn tốt, rồi mỗi bạn viết lại được bằng lời của mình.',
    ['<b>Mở bài — theo cặp (~8′):</b> mỗi cặp cùng paraphrase đề và nêu hướng triển khai / quan điểm; 2 cặp trong nhóm so sánh, chọn câu mở bài hay nhất.',
      '<b>Thân bài 1 — cả nhóm viết chung (~12′):</b> chọn ý mạnh nhất, thống nhất dàn ý (ý chính → giải thích → kết quả → ví dụ). <b>Thư ký</b> viết đoạn chung, mỗi bạn góp ít nhất 1 câu (dùng câu đã dịch).',
      '<b>Đổi bài chéo (~5′):</b> các nhóm đổi đoạn văn cho nhau, góp ý theo checklist: đủ 4 phần? có từ nối? dùng từ vựng của bài? Nhóm có đoạn hay nhất được cộng điểm.',
      '<b>Cá nhân (~5′):</b> mỗi bạn tự viết lại Mở bài + Thân bài 1 vào màn hình viết bằng lời của mình, dựa trên bản của nhóm.',
      'GV đi từng nhóm hỗ trợ chọn ý, diễn đạt câu và sắp xếp nội dung theo cấu trúc bài Task 2; khuyến khích các bạn yếu đóng góp câu.'],
    'Màn hình viết chia đôi: câu HS đã dịch ở bên trái, phần viết ở bên phải. HS bấm <b>＋</b> để chèn một câu vào chỗ con trỏ, rồi chỉnh lại cho liền mạch.')}

    <div class="t2-tg-phase t2-phase is-home"><span class="t2-phase-k">Giai đoạn 3</span><b>Bài tập về nhà</b>
      <p>HS tự hoàn thành nửa bài còn lại theo template trong sách.</p></div>
    ${tgStep(i++, 6, 'Viết Thân bài 2 + Kết bài', '', '',
    ['HS viết <b>Thân bài 2</b> và <b>Kết bài</b> theo template trong sách (tab “Template” ở cột trái màn hình viết).',
      'Nhắc HS làm nốt các câu chưa dịch ở bước 3 để có thêm câu tham khảo.',
      `Đủ 4 phần (≥ ${LESSON_MIN_WORDS} từ) → HS bấm <b>Nộp bài chấm AI</b>.`,
      'Khuyến khích HS <b>trao đổi trong nhóm</b> (nhắn tin / gặp nhau) để góp ý dàn ý Thân bài 2 trước khi viết — nhưng mỗi bạn tự viết bài của mình.',
      'Đầu buổi sau (~5′): các nhóm đọc chéo bài của nhau, chọn 1 câu hay và 1 lỗi cần sửa; GV nhận xét các lỗi chung từ bài đã chấm.'])}
    ${tgStep(i, '<i class="fas fa-clipboard-check" style="font-size:11px"></i>', 'Thi thử cả tuần <span class="t2-opt-tag">tuỳ chọn</span>', '', '',
    [`Câu hỏi ngẫu nhiên từ các chủ đề của Tuần ${week ?? ''}, 2 phút/câu — phù hợp làm bài kiểm tra nhanh cuối tuần.`])}

    <div class="t2-tg-foot"><i class="fas fa-random" style="margin-top:4px"></i><div><b>Linh hoạt:</b> GV có thể đổi thứ tự hoặc gộp các bước tuỳ độ khó của đề và trình độ lớp${n ? ` (Buổi ${n})` : ''}. Lớp mạnh có thể rút ngắn bước 1 và 3 để dành thêm thời gian viết.</div></div>`;
}

export function TeacherGuide({ t, n, vocabN, guide, week, onClose }) {
  return (
    <TgShell id="t2-tg-overlay" onClose={onClose}>
      {(closeRef) => (
        <div className="t2-tg-modal" role="dialog" aria-modal="true" aria-labelledby="t2-tg-title">
          <div className="t2-tg-hdr">
            <Html as="div" className="t2-tg-lulu" aria-hidden="true" html={luluSvg('wink')} />
            <div style={{ minWidth: 0 }}>
              <h3 id="t2-tg-title">Guideline for teacher</h3>
              <div className="t2-tg-sub">{n ? `Buổi ${n} · ` : ''}{t.topicName} · {ESSAY_LABELS[t.essayType] || t.essayType || ''}</div>
            </div>
            <button className="t2-hist-close" ref={closeRef} onClick={onClose} aria-label="Đóng"><i className="fas fa-times" /></button>
          </div>
          <Html as="div" className="t2-tg-body" id="t2-tg-body" html={teacherGuideHtml(t, { n, vocabN, guide, week })} />
        </div>
      )}
    </TgShell>
  );
}

const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

function Review({ item, i }) {
  return (
    <div className={item.isCorrect ? 'wp-wr-item-ok' : 'wp-wr-item'}>
      <div className={item.isCorrect ? 'wp-wr-num-ok' : 'wp-wr-num'}>
        {item.isCorrect ? '✅' : '❌'} Câu {item.index ?? i + 1}{item.type ? ` — ${Q_LABELS[item.type] || item.type}` : ''}
        {item.score != null && <> <span className="wp-wr-skill">{item.score} điểm</span></>}
      </div>
      {item.questionText && <div className="wp-wr-q" style={{ whiteSpace: 'pre-line' }}>{item.questionText}</div>}
      <div className="wp-wr-row"><span className="wp-wr-lbl-you">Bạn:</span> <span className={item.isCorrect ? 'wp-wr-ans' : 'wp-wr-your'}>{item.userAnswer || '(bỏ trống)'}</span></div>
      {item.modelAnswer && !item.isCorrect && <div className="wp-wr-row"><span className="wp-wr-lbl-ans">Đáp án:</span> <span className="wp-wr-ans">{item.modelAnswer}</span></div>}
      {item.explanationVi && <div className="wp-wr-gp">💡 {item.explanationVi}</div>}
    </div>
  );
}

// Lịch sử: the attempt list, then one attempt question by question
export function HistoryDialog({ onClose }) {
  const [st, setSt] = useState({ loading: true });
  const [detail, setDetail] = useState(null); // { loading } | { attempt } | { error }
  const body = useRef(null);
  const loggedIn = !!window.AuthService?.getToken?.();
  useEffect(() => {
    if (!loggedIn) return undefined;
    let alive = true;
    apiFetch('/task2/history?limit=100')
      .then((d) => { if (!d.success) throw new Error(d.message); if (alive) setSt({ attempts: d.attempts || [] }); })
      .catch((e) => { if (alive) setSt({ error: e.message }); });
    return () => { alive = false; };
  }, [loggedIn]);
  function openDetail(id) {
    if (body.current) body.current.scrollTop = 0;
    setDetail({ loading: true });
    apiFetch(`/task2/attempt/${id}`)
      .then((d) => { if (!d.success) throw new Error(d.message); setDetail({ attempt: d.attempt }); })
      .catch((e) => setDetail({ error: e.message || '' }));
  }
  function backToList() { if (body.current) body.current.scrollTop = 0; setDetail(null); }

  let content;
  if (!loggedIn) {
    content = (
      <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <p style={{ fontSize: 14, marginBottom: 16 }}>Vui lòng đăng nhập để xem lịch sử luyện tập</p>
        <a href="/login.html" className="t2-start-btn" style={{ display: 'inline-block', textDecoration: 'none', fontSize: 14, padding: '10px 24px' }}><i className="fas fa-sign-in-alt" /> Đăng nhập</a>
      </div>
    );
  } else if (detail) {
    const back = <button className="t2-back-btn" onClick={backToList} style={{ marginBottom: 14 }}><i className="fas fa-arrow-left" /> Quay lại danh sách</button>;
    if (detail.loading) content = <Spinner />;
    else if (detail.error != null) content = <>{back}<p style={{ color: '#e53935', textAlign: 'center', padding: 24, fontSize: 13 }}>Không thể tải: {detail.error}</p></>;
    else {
      const a = detail.attempt;
      const acc = a.scorePercentage != null ? Math.round(a.scorePercentage) : 0;
      const cls = acc >= 70 ? 'good' : acc >= 50 ? 'mid' : 'bad';
      content = (
        <>
          {back}
          <div className="t2-hist-entry-name" style={{ fontSize: 14, marginBottom: 4 }}>{a.topicName || '–'}{a.week ? ` · W${a.week}` : ''}</div>
          <div className="t2-hist-entry-date" style={{ marginBottom: 14 }}>{fmtDate(a.completedAt)} · {a.sessionType === 'exam' ? '🎓 Thi thử' : '✏️ Luyện tập'} · <span className={`t2-hist-entry-acc ${cls}`}>{a.correctCount ?? '?'}/{a.totalQuestions ?? '?'} câu · {acc}%</span></div>
          {(a.questions || []).length
            ? a.questions.map((item, i) => <Review key={i} item={item} i={i} />)
            : <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24, fontSize: 13 }}>Lượt này được lưu trước khi hệ thống ghi lại chi tiết từng câu.</p>}
        </>
      );
    }
  } else if (st.loading) content = <Spinner />;
  else if (st.error != null) content = <p style={{ color: '#e53935', textAlign: 'center', padding: 24, fontSize: 13 }}>Không thể tải: {st.error}</p>;
  else if (!st.attempts.length) content = <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}><div style={{ fontSize: 40, marginBottom: 10 }}>📭</div><p>Chưa có lịch sử luyện tập</p></div>;
  else {
    const attempts = st.attempts;
    const total = attempts.length;
    const avgScore = Math.round(attempts.reduce((s, a) => s + (a.scorePercentage || 0), 0) / total);
    const totalQ = attempts.reduce((s, a) => s + (a.totalQuestions || 0), 0);
    const totalC = attempts.reduce((s, a) => s + (a.correctCount || 0), 0);
    content = (
      <>
        <div className="t2-hist-stats">
          <div className="t2-hist-stat"><div className="t2-hist-num">{total}</div><div className="t2-hist-lbl">Phiên học</div></div>
          <div className="t2-hist-stat"><div className="t2-hist-num">{totalC}/{totalQ}</div><div className="t2-hist-lbl">Đúng/Tổng</div></div>
          <div className="t2-hist-stat"><div className="t2-hist-num">{avgScore}%</div><div className="t2-hist-lbl">TB chính xác</div></div>
        </div>
        {attempts.slice(0, 40).map((a, i) => {
          const acc = a.scorePercentage != null ? Math.round(a.scorePercentage) : (a.totalQuestions ? Math.round((a.correctCount / a.totalQuestions) * 100) : 0);
          const cls = acc >= 70 ? 'good' : acc >= 50 ? 'mid' : 'bad';
          return (
            <div key={a._id || i} className={`t2-hist-entry${a._id ? ' is-clickable' : ''}`} onClick={a._id ? () => openDetail(a._id) : undefined}>
              <div className="t2-hist-entry-date">{fmtDate(a.completedAt || a.createdAt)} · {a.sessionType === 'exam' ? '🎓 Thi thử' : '✏️ Luyện tập'}</div>
              <div className="t2-hist-entry-name">{a.topicName || '–'}{a.week ? ` · W${a.week}` : ''}</div>
              <div className="t2-hist-entry-row">
                <span className="t2-hist-entry-count">{a.correctCount ?? '?'}/{a.totalQuestions ?? '?'} câu</span>
                <span className={`t2-hist-entry-acc ${cls}`}>{acc}% đúng</span>
                {a._id && <span className="t2-hist-entry-more">Xem từng câu <i className="fas fa-chevron-right" /></span>}
              </div>
            </div>
          );
        })}
      </>
    );
  }
  return (
    <HistShell id="t2-hist-overlay" titleId="t2-hist-title" title={detail ? '📝 Chi tiết bài luyện tập' : '📝 Lịch sử Task 2 Writing'} onClose={onClose} bodyId="t2-hist-body" bodyRef={body}>
      {content}
    </HistShell>
  );
}

// Every sentence of this topic's Luyện tập run, answers not included
// (the endpoint strips them server-side)
export function PreviewDialog({ topicId, level, onClose }) {
  const [st, setSt] = useState({ loading: true });
  useEffect(() => {
    let alive = true;
    apiFetch(`/task2/questions/topic/${topicId}?${new URLSearchParams({ level })}`)
      .then((d) => { if (alive) setSt({ questions: d.questions || [] }); })
      .catch((e) => { if (alive) setSt({ error: e.message }); });
    return () => { alive = false; };
  }, [topicId, level]);
  let content;
  if (st.loading) content = <Spinner />;
  else if (st.error != null) content = <p style={{ color: '#e53935', textAlign: 'center', padding: 24, fontSize: 13 }}>Không thể tải: {st.error}</p>;
  else if (!st.questions.length) content = <p style={{ color: '#9ca3af', textAlign: 'center', padding: 24, fontSize: 13 }}>Chưa có câu hỏi ở level này</p>;
  else {
    content = (
      <>
        <p style={{ fontSize: 12.5, color: '#9ca3af', margin: '0 0 14px' }}>Toàn bộ {st.questions.length} câu sẽ xuất hiện khi bạn bấm &quot;Bắt đầu&quot; (thứ tự có thể bị xáo trộn nếu bật &quot;Xáo trộn câu&quot;). Đáp án chưa hiển thị ở đây.</p>
        {st.questions.map((q, i) => (
          <div className="t2-hist-entry" key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="t2-hist-entry-date" style={{ margin: 0 }}>Câu {i + 1}</span>
              <span className="wp-type-tag">{Q_LABELS[q.type] || q.type}</span>
              {q.answerWordCount && <span className="t2-hist-entry-date" style={{ margin: 0 }}>📏 {q.answerWordCount} từ</span>}
            </div>
            <div className="t2-question-text" style={{ margin: 0 }}>{q.questionText || ''}</div>
          </div>
        ))}
      </>
    );
  }
  return <HistShell id="t2-preview-overlay" title="👀 Xem trước câu hỏi" onClose={onClose} bodyId="t2-preview-body">{content}</HistShell>;
}
