import Modal from './ui/Modal';
import { useApi } from '../hooks/useApi';
import { ErrorState, Skeleton } from './ui/States';
import { formatDate } from '../utils/api';

// One student's saved attempt at a WT1-stack course exercise (Khoá học
// Task 1 / Task 2 / Speaking) — GET /admin/wt1/submissions/:id, the same
// `review` shape the student's own "Lịch sử" view renders
// (WT1History in frontend/js/shared/course-engine.js; built by wt1Service.buildReview).
// Opened from the WT1 rows of StudentHistory / StudentDetail's history tab.

const SCORE_LABELS = {
  taskAchievement: 'Task Achievement', coherence: 'Coherence & Cohesion', lexical: 'Lexical Resource', grammar: 'Grammar',
  fluency: 'Fluency & Coherence', vocabulary: 'Lexical Resource', pronunciation: 'Pronunciation',
};
const num = (n) => (n == null || Number.isNaN(Number(n)) ? '–' : Math.round(Number(n) * 10) / 10);

function scoreText(r) {
  if (r.band != null) return `Band ${num(r.band)}`;
  if (r.correctCount != null && r.maxScore != null) return `${r.correctCount}/${r.maxScore} câu (${r.score ?? 0}%)`;
  if (r.score != null) return `${r.score}%`;
  return 'Đã nộp';
}

const box = { whiteSpace: 'pre-wrap', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, lineHeight: 1.7 };
const secTitle = { fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text3)', margin: '14px 0 4px' };

function Section({ title, children }) {
  return <div><div style={secTitle}>{title}</div>{children}</div>;
}

function Corrections({ list }) {
  if (!list?.length) return null;
  return (
    <Section title="Sửa lỗi">
      {list.map((c, i) => (
        <div key={i} style={{ fontSize: 13, marginTop: 3 }}>
          ✎ <s style={{ color: 'var(--danger)' }}>{c.original}</s> → <b style={{ color: 'var(--green)' }}>{c.corrected}</b>
          {c.note && <span className="muted"> ({c.note})</span>}
        </div>
      ))}
    </Section>
  );
}

function Bullets({ title, list }) {
  if (!list?.length) return null;
  return <Section title={title}>{list.map((x, i) => <div key={i} style={{ fontSize: 13, marginTop: 3 }}>• {typeof x === 'string' ? x : (x?.text || x?.name || x?.label || '')}</div>)}</Section>;
}

function ScoreGrid({ scores }) {
  const keys = Object.keys(scores || {}).filter(k => scores[k] != null);
  if (!keys.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '4px 14px' }}>
      {keys.map(k => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dotted var(--border)', padding: '3px 0' }}>
          <span>{SCORE_LABELS[k] || k}</span><b>{num(scores[k])}</b>
        </div>
      ))}
    </div>
  );
}

function ObjectiveItems({ items }) {
  if (!items?.length) return <div className="muted" style={{ marginTop: 12 }}>Bài tập này không còn trong khoá học.</div>;
  return items.map((it, i) => (
    <div key={i} style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${it.correct ? 'var(--green)' : 'var(--danger)'}`, borderRadius: 10, padding: '8px 12px', marginTop: 8, fontSize: 13, lineHeight: 1.55 }}>
      <div style={{ fontWeight: 600, whiteSpace: 'pre-wrap' }}>{i + 1}. {it.prompt}</div>
      <div style={{ color: it.correct ? 'var(--green)' : 'var(--danger)' }}>
        {it.correct ? '✔' : '✗'} Trả lời: <b>{it.answer || <i>(bỏ trống)</i>}</b>
      </div>
      {!it.correct && it.correctAnswer && <div style={{ color: 'var(--green)' }}>Đáp án: <b>{it.correctAnswer}</b></div>}
      {it.explanation && <div className="muted" style={{ fontSize: 12, marginTop: 3, whiteSpace: 'pre-wrap' }}>💡 {it.explanation}</div>}
    </div>
  ));
}

function OpenResponse({ r }) {
  const isSpk = r.kind === 'speaking';
  const perItem = isSpk && r.speakingItems?.length > 0;
  const responses = (r.responses || []).filter(x => String(x || '').trim());
  return (
    <>
      {perItem ? r.speakingItems.map((s, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Câu {i + 1}: {s.prompt}</div>
          <div style={box}>{s.transcript || <i>(không có lời thoại)</i>}</div>
          <div style={{ fontSize: 13, marginTop: 6 }}><b>Band {num(s.band)}</b>{s.feedbackVi && ` — ${s.feedbackVi}`}</div>
          <Corrections list={s.corrections} />
        </div>
      )) : (
        <>
          {r.prompts?.length > 0 && <Section title="Câu hỏi">{r.prompts.map((p, i) => <div key={i} style={{ fontSize: 13 }}>• {p}</div>)}</Section>}
          <Section title={isSpk ? 'Lời thoại' : 'Bài viết'}>
            {responses.length ? responses.map((t, i) => (
              <div key={i} style={{ marginTop: i ? 8 : 0 }}>
                {responses.length > 1 && <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Phần {i + 1}</div>}
                <div style={box}>{t}</div>
              </div>
            )) : <span className="muted">(trống)</span>}
          </Section>
        </>
      )}
      {r.ai && (
        <>
          <Section title={isSpk ? 'AI chấm (trung bình)' : 'AI chấm'}><ScoreGrid scores={r.ai.scores} /></Section>
          {r.ai.feedbackVi && <Section title="Nhận xét"><div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{r.ai.feedbackVi}</div></Section>}
          {!perItem && <Corrections list={r.ai.corrections} />}
          <Bullets title="Điểm mạnh" list={r.ai.strengths} />
          <Bullets title="Cần cải thiện" list={r.ai.improvements} />
          <Bullets title="Cấu trúc đã dùng" list={r.ai.usedStructures} />
          <Bullets title="Cấu trúc còn thiếu" list={r.ai.missingStructures} />
        </>
      )}
      {!r.ai && r.local && (
        <Section title="Chấm theo rubric">
          {r.local.aiUnavailable && <div className="hint-box" style={{ marginBottom: 6 }}>Lúc nộp, AI đang bận — điểm sơ bộ theo rubric.</div>}
          {r.local.feedbackVi && <div style={{ fontSize: 13 }}>{r.local.feedbackVi}</div>}
          {(r.local.checklist || []).map((c, i) => (
            <div key={i} style={{ fontSize: 13, marginTop: 3 }}>
              {c.ok === true ? '✔' : c.ok === false ? '✗' : '•'} {c.label}{c.detail && <span className="muted"> ({c.detail})</span>}
            </div>
          ))}
        </Section>
      )}
      {r.sampleAnswer && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Bài mẫu</summary>
          <div style={{ ...box, marginTop: 6 }}>{r.sampleAnswer}</div>
        </details>
      )}
    </>
  );
}

export default function Wt1ReviewModal({ id, onClose }) {
  const { data, error, loading, reload } = useApi(`/admin/wt1/submissions/${id}`);
  const r = data?.review;
  return (
    <Modal title={r ? r.exercise.title : 'Bài làm khoá học'} onClose={onClose} width={720}>
      {loading && <div style={{ display: 'grid', gap: 8 }}><Skeleton height={18} /><Skeleton height={60} /><Skeleton height={60} /></div>}
      {error && <ErrorState error={error} onRetry={reload} compact />}
      {r && (
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', alignItems: 'center', fontSize: 13, color: 'var(--text2)', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <b style={{ fontSize: 17, color: 'var(--accent)' }}>{scoreText(r)}</b>
            <span>👤 <b>{data.student?.displayName}</b>{data.student?.username && ` (@${data.student.username})`}</span>
            <span>{r.lessonTitle}</span>
            <span>Lượt <b>{r.attempt}</b></span>
            <span>{formatDate(r.createdAt)}</span>
          </div>
          {r.exercise.instruction && <div className="muted" style={{ fontSize: 12.5, marginTop: 10, whiteSpace: 'pre-wrap' }}>{r.exercise.instruction}</div>}
          {r.kind === 'objective' ? <ObjectiveItems items={r.items} /> : <OpenResponse r={r} />}
        </div>
      )}
    </Modal>
  );
}
