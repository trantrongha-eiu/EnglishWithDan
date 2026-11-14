import { useMemo, useState } from 'react';
import { apiFetch, FRONTEND_URL, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatCard from '../components/ui/StatCard';
import { ErrorState, EmptyState, Skeleton, TableBody } from '../components/ui/States';
import { formatDur } from '../utils/format';

// Shadowing (Video) — admin side of shadowing.html (GET/PUT/PATCH
// /api/admin/shadowing/*). Lessons are YouTube clips cut into timed
// sentences by scripts/shadowing/* + seedShadowingLessons.js; this page
// lists them per chủ đề with 90-day practice stats, previews / fixes the
// sentence wording (timing stays script-owned) and shows/hides a lesson or
// a whole chủ đề for students.

const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];
const ytAt = (id, sec) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}&t=${Math.floor(sec || 0)}s`;

function LessonModal({ lessonId, onClose, onSaved }) {
  const toast = useToast();
  const { data, error, loading, reload } = useApi(`/admin/shadowing/lessons/${lessonId}`);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const lesson = data?.lesson;
  const form = draft || (lesson && {
    title: lesson.title, description: lesson.description || '', level: lesson.level, order: lesson.order || 0,
    segments: (lesson.segments || []).map(s => ({ text: s.text, vi: s.vi || '', answer: s.answer || '' })),
  });
  const set = (k, v) => setDraft({ ...form, [k]: v });
  const setSeg = (i, k, v) => setDraft({ ...form, segments: form.segments.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });

  async function save() {
    setSaving(true);
    try {
      const d = await apiFetch(`/admin/shadowing/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(form) });
      toast('Đã lưu bài Shadowing');
      onSaved(d.lesson);
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <Modal title={lesson ? `🗣️ ${lesson.title}` : 'Bài Shadowing'} onClose={onClose} width={900} busy={saving}
      footer={<>
        {lesson?.isPublished && <a className="btn btn-ghost" href={`${FRONTEND_URL}/shadowing.html?lesson=${encodeURIComponent(lesson.slug)}`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>}
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Đóng</button>
        <button type="button" className="btn btn-primary" onClick={save} disabled={!draft || saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
      </>}>
      {loading && <Skeleton height={240} />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {lesson && form && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="muted" style={{ fontSize: 12 }}>
            <code>{lesson.slug}</code> · {lesson.channel || '—'} · video <a href={ytAt(lesson.youtubeId, lesson.clipStart)} target="_blank" rel="noreferrer">{lesson.sourceTitle || lesson.youtubeId} ↗</a>
            {' '}· đoạn {formatDur(lesson.clipStart)}–{formatDur(lesson.clipEnd)} · {lesson.segmentCount} câu
            {lesson.burnedInCaptions && ' · video có sẵn phụ đề tiếng Anh'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Tiêu đề</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-input" value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Thứ tự</label>
              <input className="form-input" type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="hint-box" style={{ fontSize: 12 }}>
            Sửa được nội dung từng câu (tiếng Anh, bản dịch, đáp án Dictation). Mốc thời gian do script tạo (whisper / phụ đề) nên không sửa ở đây.
            "Đáp án Dictation" chỉ điền khi cần chấm khác câu hiển thị (tên riêng đánh vần, số…).
          </div>
          <div className="table-wrap" style={{ maxHeight: '48vh', overflow: 'auto' }}>
            <table className="table">
              <thead><tr><th style={{ width: 90 }}>THỜI GIAN</th><th>CÂU TIẾNG ANH</th><th>BẢN DỊCH</th><th style={{ width: 160 }}>ĐÁP ÁN DICTATION</th></tr></thead>
              <tbody>
                {form.segments.map((s, i) => {
                  const seg = lesson.segments[i];
                  return (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                        <a href={ytAt(lesson.youtubeId, seg.start)} target="_blank" rel="noreferrer" title="Nghe đoạn này trên YouTube">{formatDur(seg.start)}</a>
                        <span className="muted"> → {formatDur(seg.end)}</span>
                      </td>
                      <td><textarea className="form-input" rows={2} value={s.text} onChange={e => setSeg(i, 'text', e.target.value)} aria-label={`Câu ${i + 1}`} /></td>
                      <td><textarea className="form-input" rows={2} value={s.vi} onChange={e => setSeg(i, 'vi', e.target.value)} aria-label={`Bản dịch câu ${i + 1}`} /></td>
                      <td><input className="form-input" value={s.answer} placeholder="(như câu)" onChange={e => setSeg(i, 'answer', e.target.value)} aria-label={`Đáp án Dictation câu ${i + 1}`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Shadowing() {
  const toast = useToast();
  const confirm = useConfirm();
  const { data, error, loading, reload } = useApi('/admin/shadowing/lessons');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(null);
  const [patch, setPatch] = useState({}); // id -> partial lesson (optimistic)
  const [busy, setBusy] = useState({});

  const categories = useMemo(() => data?.categories || [], [data]);
  const catLabel = useMemo(() => Object.fromEntries(categories.map(c => [c.key, c.label])), [categories]);
  const lessons = useMemo(() => (data?.lessons || []).map(l => ({ ...l, ...patch[l._id] })), [data, patch]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lessons.filter(l => (!category || l.category === category)
      && (!level || l.level === level)
      && (!status || (status === 'visible' ? l.isPublished : !l.isPublished))
      && (!q || [l.title, l.slug, l.sourceTitle, l.channel].some(x => (x || '').toLowerCase().includes(q))));
  }, [lessons, category, level, status, search]);

  const totals = useMemo(() => ({
    lessons: lessons.length,
    published: lessons.filter(l => l.isPublished).length,
    attempts: lessons.reduce((a, l) => a + (l.attempts || 0), 0),
    practiced: lessons.filter(l => l.attempts > 0).length,
  }), [lessons]);

  async function togglePublish(l) {
    const next = !l.isPublished;
    setBusy(b => ({ ...b, [l._id]: true }));
    setPatch(p => ({ ...p, [l._id]: { ...p[l._id], isPublished: next } }));
    try {
      await apiFetch(`/admin/shadowing/lessons/${l._id}`, { method: 'PUT', body: JSON.stringify({ isPublished: next }) });
      toast(next ? 'Đã hiện bài với học sinh' : 'Đã ẩn bài');
    } catch (e) {
      setPatch(p => ({ ...p, [l._id]: { ...p[l._id], isPublished: l.isPublished } }));
      toast(e.message, 'error');
    } finally { setBusy(b => ({ ...b, [l._id]: false })); }
  }

  function bulkCategory(c, isPublished) {
    confirm(`${isPublished ? 'Hiện' : 'Ẩn'} toàn bộ ${c.total} bài của chủ đề "${c.label}"?`, async () => {
      try {
        const d = await apiFetch(`/admin/shadowing/categories/${c.key}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublished }) });
        toast(`Đã ${isPublished ? 'hiện' : 'ẩn'} ${d.modified} bài`);
        setPatch({});
        reload();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  const activeCat = categories.find(c => c.key === category);

  return (
    <>
      {open && <LessonModal lessonId={open} onClose={() => setOpen(null)}
        onSaved={l => setPatch(p => ({ ...p, [l._id]: { title: l.title, level: l.level, order: l.order, description: l.description, isPublished: l.isPublished } }))} />}
      <PageHeader
        title="Shadowing (Video)"
        subtitle="Bài nghe-nói theo đoạn video YouTube (trang shadowing.html, 2 chế độ Shadowing + Dictation). Ẩn một bài hoặc cả chủ đề để gỡ khỏi trang học sinh; số lượt luyện tính trong 90 ngày gần nhất."
        actions={<a className="btn btn-ghost btn-sm" href={`${FRONTEND_URL}/shadowing.html`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>}
      />

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <StatCard label="Tổng số bài" value={totals.lessons} icon="🎬" loading={loading} sub={`${categories.length} chủ đề`} />
        <StatCard label="Đang hiện" value={totals.published} icon="👁" tone="green" loading={loading} sub={`${totals.lessons - totals.published} đang ẩn`} />
        <StatCard label="Lượt luyện (90 ngày)" value={totals.attempts} icon="🎧" tone="purple" loading={loading} />
        <StatCard label="Bài đã có người luyện" value={totals.practiced} icon="✅" tone="yellow" loading={loading} />
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}

      <div className="filter-bar" style={{ marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="search" className="form-input search-input" style={{ maxWidth: 260 }} placeholder="Tìm tiêu đề, slug, kênh…"
          value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm bài Shadowing" />
        <select className="form-input" style={{ width: 210 }} value={category} onChange={e => setCategory(e.target.value)} aria-label="Lọc chủ đề">
          <option value="">Mọi chủ đề</option>
          {categories.map(c => <option key={c.key} value={c.key}>{c.label} ({c.published}/{c.total})</option>)}
        </select>
        <select className="form-input" style={{ width: 120 }} value={level} onChange={e => setLevel(e.target.value)} aria-label="Lọc level">
          <option value="">Mọi level</option>
          {LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="form-input" style={{ width: 150 }} value={status} onChange={e => setStatus(e.target.value)} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="visible">Đang hiện</option>
          <option value="hidden">Đang ẩn</option>
        </select>
        {activeCat && (
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => bulkCategory(activeCat, true)}>👁 Hiện cả chủ đề</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => bulkCategory(activeCat, false)}>🙈 Ẩn cả chủ đề</button>
          </>
        )}
        <span className="muted" style={{ marginLeft: 'auto', fontSize: 13 }}>{shown.length} bài</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>BÀI</th><th>CHỦ ĐỀ</th><th>LEVEL</th><th>CÂU · THỜI LƯỢNG</th><th>LUYỆN (90 NGÀY)</th><th>TRẠNG THÁI</th><th></th></tr>
          </thead>
          <TableBody loading={loading} colSpan={7}
            empty={!loading && shown.length === 0 ? <EmptyState icon="🗣️" title="Không có bài phù hợp" /> : null}>
            {shown.map(l => (
              <tr key={l._id} style={l.isPublished ? undefined : { opacity: 0.6 }}>
                <td style={{ maxWidth: 320 }}>
                  <div style={{ fontWeight: 600 }}>{l.title}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{l.channel || '—'} · <code>{l.slug}</code></div>
                </td>
                <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{catLabel[l.category] || l.category}</td>
                <td><span className="badge badge-blue">{l.level}</span></td>
                <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{l.segmentCount} câu · {formatDur(l.playDuration)}</td>
                <td style={{ fontSize: 12 }}>
                  {l.attempts
                    ? <>{l.attempts} lượt · {l.students} HS · TB {l.avgScore ?? 0}%<div className="muted" style={{ fontSize: 11 }}>gần nhất {formatDate(l.lastPracticed).split(' ')[0]}</div></>
                    : <span className="muted">Chưa có</span>}
                </td>
                <td>
                  <label className="switch" title={l.isPublished ? 'Đang hiện với học sinh — bấm để ẩn' : 'Đang ẩn — bấm để hiện'}>
                    <input type="checkbox" checked={!!l.isPublished} disabled={!!busy[l._id]} onChange={() => togglePublish(l)}
                      aria-label={`${l.isPublished ? 'Ẩn' : 'Hiện'} bài "${l.title}"`} />
                    <span className="switch-track" aria-hidden="true" />
                    {l.isPublished ? 'Hiện' : 'Ẩn'}
                  </label>
                </td>
                <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(l._id)}>Xem / sửa câu</button></td>
              </tr>
            ))}
          </TableBody>
        </table>
      </div>
    </>
  );
}
