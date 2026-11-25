import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, FRONTEND_URL, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useAdminData } from '../contexts/AdminDataContext';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Pagination from '../components/Pagination';
import { ErrorState, EmptyState, Skeleton, TableBody } from '../components/ui/States';

// Báo lỗi Dictation — admin side of the "🚩 Báo lỗi câu này" button on
// Luyện Dictation (/app/dictation). GET/PUT/PATCH/DELETE
// /api/admin/dictation-reports/* (services/dictationReportService.js).
// A report opens the sentence as it is now, with a clip player to re-time
// it against; saving the fix closes every open report of that sentence
// (and thanks the students, if that's on in Cấu hình).

const PAGE_SIZE = 30;
const STATUS_TABS = [
  { key: 'open', label: '🚩 Chờ xử lý' },
  { key: 'fixed', label: '✅ Đã sửa' },
  { key: 'dismissed', label: '🙈 Bỏ qua' },
  { key: 'all', label: 'Tất cả' },
];
const STATUS_BADGE = {
  open: ['badge-red', 'Chờ xử lý'],
  fixed: ['badge-green', 'Đã sửa'],
  dismissed: ['badge-gray', 'Bỏ qua'],
};

const t2 = (n) => (Number.isFinite(n) ? Number(n).toFixed(2) : '—');
const studentUrl = (r) => (r.kind === 'drill'
  ? `${FRONTEND_URL}/app/dictation?drill=${encodeURIComponent(r.drillSlug || '')}`
  : `${FRONTEND_URL}/app/dictation?sectionId=${r.targetId}`);

// Plays [start, end) of one audio file, stopping exactly at `end`.
function ClipPlayer({ src, start, end, label = 'Nghe câu', small }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const range = useRef({ start, end });
  useEffect(() => { range.current = { start, end }; }, [start, end]);

  useEffect(() => {
    const a = ref.current;
    if (!a) return undefined;
    let frame = 0;
    const tick = () => {
      if (a.paused) return;
      if (a.currentTime >= range.current.end) { a.pause(); return; }
      frame = requestAnimationFrame(tick);
    };
    const onPlay = () => { setPlaying(true); cancelAnimationFrame(frame); frame = requestAnimationFrame(tick); };
    const onPause = () => setPlaying(false);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onPause);
    return () => {
      cancelAnimationFrame(frame);
      a.pause();
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onPause);
    };
  }, [src]);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (!a.paused) { a.pause(); return; }
    const go = () => { a.currentTime = range.current.start; a.play().catch(() => {}); };
    if (a.readyState >= 1) go();
    else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
  }

  if (!src) return <span className="muted" style={{ fontSize: 12 }}>(không có audio)</span>;
  return (
    <>
      <button type="button" className={`btn ${small ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'}`} onClick={toggle} disabled={!(end > start)}>
        {playing ? '⏸ Dừng' : `▶ ${label}`}
      </button>
      <audio ref={ref} src={src} preload="metadata" />
    </>
  );
}

function TimeField({ label, value, onChange }) {
  const nudge = (d) => onChange(Math.max(0, Math.round((Number(value) + d) * 100) / 100));
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label} (giây)</label>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudge(-0.5)} title="−0.5 s">−.5</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudge(-0.1)} title="−0.1 s">−.1</button>
        <input className="form-input" type="number" step="0.05" min="0" style={{ width: 96 }} value={value}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} aria-label={label} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudge(0.1)} title="+0.1 s">+.1</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => nudge(0.5)} title="+0.5 s">+.5</button>
      </div>
    </div>
  );
}

function FixModal({ report, isAdmin, onClose, onDone }) {
  const toast = useToast();
  const confirm = useConfirm();
  const path = `/admin/dictation-reports/sentence/${report.kind}/${report.targetId}/${report.sentenceIndex}`;
  const removed = !!report.sentenceRemoved;
  const { data, error, loading, reload } = useApi(removed ? null : path);
  const [draft, setDraft] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [busy, setBusy] = useState(false);
  const s = data?.sentence;
  const form = draft || (s && { text: s.text, start: s.start, end: s.end, answer: s.answer || '' });
  const set = (k, v) => setDraft({ ...form, [k]: v });
  const isDrill = report.kind === 'drill';
  const changed = !!draft && !!s && (draft.text !== s.text || draft.start !== s.start || draft.end !== s.end || (isDrill && draft.answer !== s.answer));
  const others = Math.max(0, (report.sameOpen || 0) - (report.status === 'open' ? 1 : 0));

  async function run(fn, okMsg) {
    setBusy(true);
    try {
      const d = await fn();
      toast(typeof okMsg === 'function' ? okMsg(d) : okMsg);
      onDone();
      onClose();
    } catch (e) { toast(e.message, 'error'); setBusy(false); }
  }

  const saveFix = () => run(
    () => apiFetch(path, { method: 'PUT', body: JSON.stringify({ ...form, adminNote }) }),
    d => `Đã sửa câu${d.closed ? ` · đóng ${d.closed} báo lỗi` : ''}`,
  );
  const mark = (status) => run(
    () => apiFetch(`/admin/dictation-reports/${report._id}`, { method: 'PATCH', body: JSON.stringify({ status, adminNote, sameSentence: true }) }),
    d => `${status === 'fixed' ? 'Đã đánh dấu đã sửa' : status === 'dismissed' ? 'Đã bỏ qua' : 'Đã mở lại'} ${d.updated} báo lỗi`,
  );
  const removeSentence = () => confirm(
    `Xoá câu ${report.sentenceIndex + 1} khỏi bài "${report.lessonTitle}"? Các câu sau sẽ lùi lên 1 số; mọi báo lỗi của câu này được đóng.`,
    () => run(
      () => apiFetch(`${path}?note=${encodeURIComponent(adminNote)}`, { method: 'DELETE' }),
      d => `Đã xoá câu · bài còn ${d.remaining} câu`,
    ),
  );

  const audioSrc = s?.audioUrl;
  return (
    <Modal title={`🚩 ${report.lessonTitle} · câu ${report.sentenceIndex + 1}`} onClose={onClose} width={860} busy={busy}
      footer={<>
        <a className="btn btn-ghost" href={studentUrl(report)} target="_blank" rel="noreferrer">Mở bài ↗</a>
        {isAdmin && !removed && s && <button type="button" className="btn btn-danger" onClick={removeSentence} disabled={busy}>🗑 Xoá câu khỏi bài</button>}
        <span style={{ flex: 1 }} />
        {report.status !== 'open'
          ? <button type="button" className="btn btn-ghost" onClick={() => mark('open')} disabled={busy}>↩ Mở lại</button>
          : <>
            <button type="button" className="btn btn-ghost" onClick={() => mark('dismissed')} disabled={busy} title="Câu đúng, không cần sửa">🙈 Bỏ qua</button>
            {!changed && <button type="button" className="btn btn-ghost" onClick={() => mark('fixed')} disabled={busy} title="Đã sửa ở nơi khác">✅ Đánh dấu đã sửa</button>}
          </>}
        {!removed && <button type="button" className="btn btn-primary" onClick={saveFix} disabled={!changed || busy}>{busy ? 'Đang lưu…' : '💾 Lưu & đóng báo lỗi'}</button>}
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="hint-box" style={{ fontSize: 13 }}>
          <div><b>{report.userName || 'Học sinh'}</b> · {formatDate(report.createdAt)} · <b>{report.reasonLabel || report.reason}</b>
            {others > 0 && <span className="badge badge-red" style={{ marginLeft: 8 }}>+{others} báo lỗi khác cùng câu</span>}
          </div>
          {report.note && <div style={{ marginTop: 4 }}>📝 “{report.note}”</div>}
          {report.typedText && <div style={{ marginTop: 4 }} className="muted">Học sinh đã gõ: <i>{report.typedText}</i></div>}
          <div style={{ marginTop: 4 }} className="muted">
            Lúc báo: “{report.sentenceText}”{report.answer && <> · đáp án <b>{report.answer}</b></>} · {t2(report.start)}–{t2(report.end)} s
          </div>
          {report.adminNote && <div style={{ marginTop: 4 }}>🧑‍🏫 Ghi chú xử lý: {report.adminNote}</div>}
        </div>

        {removed && <div className="hint-box">Câu này đã bị xoá khỏi bài.</div>}
        {!removed && loading && <Skeleton height={160} />}
        {!removed && error && <ErrorState error={error} onRetry={reload} />}
        {!removed && data && form && (
          <>
            <div className="muted" style={{ fontSize: 12 }}>
              {isDrill ? 'Bài đánh vần / số' : 'Bài lẻ Listening'} · câu {data.index + 1}/{data.total}
              {s.sourceTitle && <> · 🎧 {s.sourceTitle}</>}
              {s.text !== report.sentenceText && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>Câu đã đổi so với lúc báo</span>}
            </div>

            {data.prev && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }} className="muted">
                <ClipPlayer src={data.prev.audioUrl} start={data.prev.start} end={data.prev.end} label="Câu trước" small />
                <span>{t2(data.prev.start)}–{t2(data.prev.end)} s · “{data.prev.text}”</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <TimeField label="Bắt đầu" value={form.start} onChange={v => set('start', v)} />
              <TimeField label="Kết thúc" value={form.end} onChange={v => set('end', v)} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 2 }}>
                <ClipPlayer src={audioSrc} start={Number(form.start)} end={Number(form.end)} label="Nghe câu này" />
                <span className="muted" style={{ fontSize: 12 }}>dài {t2(Number(form.end) - Number(form.start))} s</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{isDrill ? 'Câu trong clip (hiện sau khi làm)' : 'Câu đáp án'}</label>
              <textarea className="form-input" rows={2} value={form.text} onChange={e => set('text', e.target.value)} aria-label="Câu đáp án" />
            </div>
            {isDrill && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Đáp án học sinh phải gõ (tên / số)</label>
                <input className="form-input" value={form.answer} onChange={e => set('answer', e.target.value)} aria-label="Đáp án drill" />
              </div>
            )}

            {data.next && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }} className="muted">
                <ClipPlayer src={data.next.audioUrl} start={data.next.start} end={data.next.end} label="Câu sau" small />
                <span>{t2(data.next.start)}–{t2(data.next.end)} s · “{data.next.text}”</span>
              </div>
            )}
          </>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Ghi chú xử lý (không bắt buộc)</label>
          <input className="form-input" value={adminNote} maxLength={500} onChange={e => setAdminNote(e.target.value)} placeholder="vd: chỉnh lại mốc kết thúc, sửa 'ten' → 'eleven'" />
        </div>
        <div className="muted" style={{ fontSize: 12 }}>
          Nghĩa tiếng Việt của câu được dịch lại tự động khi câu đổi chữ. Lưu sửa / đánh dấu sẽ áp dụng cho mọi báo lỗi đang chờ của câu này.
        </div>
      </div>
    </Modal>
  );
}

function SettingsModal({ settings, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    enabled: settings.enabled, thankOnFix: settings.thankOnFix,
    reasons: settings.reasons.map(r => ({ ...r })),
  }));
  const [saving, setSaving] = useState(false);
  const setReason = (i, label) => setForm(f => ({ ...f, reasons: f.reasons.map((r, j) => (j === i ? { ...r, label } : r)) }));
  const move = (i, d) => setForm(f => {
    const reasons = [...f.reasons];
    const j = i + d;
    if (j < 0 || j >= reasons.length) return f;
    [reasons[i], reasons[j]] = [reasons[j], reasons[i]];
    return { ...f, reasons };
  });

  async function save() {
    setSaving(true);
    try {
      const d = await apiFetch('/admin/dictation-reports/settings', { method: 'PUT', body: JSON.stringify(form) });
      toast('Đã lưu cấu hình báo lỗi');
      onSaved(d.settings);
      onClose();
    } catch (e) { toast(e.message, 'error'); setSaving(false); }
  }

  return (
    <Modal title="⚙️ Cấu hình báo lỗi Dictation" onClose={onClose} width={620} busy={saving}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Huỷ</button>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu cấu hình'}</button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label className="switch">
          <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} aria-label="Bật nút báo lỗi" />
          <span className="switch-track" aria-hidden="true" />
          Hiện nút <b style={{ margin: '0 4px' }}>🚩 Báo lỗi</b> trên mọi câu Dictation cho học sinh
        </label>
        <label className="switch">
          <input type="checkbox" checked={form.thankOnFix} onChange={e => setForm(f => ({ ...f, thankOnFix: e.target.checked }))} aria-label="Nhắn cảm ơn" />
          <span className="switch-track" aria-hidden="true" />
          Sửa xong thì nhắn cảm ơn vào Hộp thư của học sinh đã báo
        </label>

        <div>
          <div className="form-label" style={{ marginBottom: 6 }}>Lý do học sinh chọn khi báo lỗi</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {form.reasons.map((r, i) => (
              <div key={r.key || `new-${i}`} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input className="form-input" value={r.label} maxLength={120} onChange={e => setReason(i, e.target.value)} aria-label={`Lý do ${i + 1}`} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Lên">↑</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === form.reasons.length - 1} aria-label="Xuống">↓</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(f => ({ ...f, reasons: f.reasons.filter((_, j) => j !== i) }))}
                  disabled={form.reasons.length <= 1} aria-label={`Xoá lý do ${i + 1}`}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} disabled={form.reasons.length >= 12}
            onClick={() => setForm(f => ({ ...f, reasons: [...f.reasons, { key: '', label: '' }] }))}>＋ Thêm lý do</button>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            Lý do “Lỗi khác” (mã <code>other</code>) bắt học sinh ghi mô tả. Đổi tên một lý do không làm đổi các báo lỗi cũ.
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function DictationReports() {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { reloadBadges } = useAdminData();
  const [params, setParams] = useSearchParams();
  const status = STATUS_TABS.some(t => t.key === params.get('status')) ? params.get('status') : 'open';
  const [kind, setKind] = useState('');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsPatch, setSettingsPatch] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => { setQ(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const url = useMemo(() => {
    const p = new URLSearchParams({ status, page: String(page), limit: String(PAGE_SIZE) });
    if (kind) p.set('kind', kind);
    if (reason) p.set('reason', reason);
    if (q) p.set('search', q);
    return `/admin/dictation-reports?${p}`;
  }, [status, page, kind, reason, q]);
  const { data, error, loading, reload } = useApi(url);
  const settings = settingsPatch || data?.settings;
  const counts = data?.counts || { open: 0, fixed: 0, dismissed: 0 };
  const reports = data?.reports || [];
  const reasonLabels = useMemo(() => Object.fromEntries((settings?.reasons || []).map(r => [r.key, r.label])), [settings]);

  const refresh = () => { reload(); reloadBadges?.(); };

  async function quick(r, next) {
    try {
      const d = await apiFetch(`/admin/dictation-reports/${r._id}`, { method: 'PATCH', body: JSON.stringify({ status: next, sameSentence: true }) });
      toast(`${next === 'dismissed' ? 'Đã bỏ qua' : 'Đã mở lại'} ${d.updated} báo lỗi`);
      refresh();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function remove(r) {
    try {
      await apiFetch(`/admin/dictation-reports/${r._id}`, { method: 'DELETE' });
      toast('Đã xoá báo lỗi');
      refresh();
    } catch (e) { toast(e.message, 'error'); }
  }

  return (
    <>
      {open && <FixModal report={open} isAdmin={isAdmin} onClose={() => setOpen(null)} onDone={refresh} />}
      {settingsOpen && settings && <SettingsModal settings={settings} onClose={() => setSettingsOpen(false)} onSaved={setSettingsPatch} />}
      <PageHeader
        title="Báo lỗi Dictation"
        subtitle="Câu Dictation học sinh báo sai (nút 🚩 trên trang Luyện Dictation). Mở một báo lỗi để nghe lại câu, chỉnh chữ / mốc thời gian / đáp án rồi lưu — mọi báo lỗi của câu đó được đóng cùng lúc."
        actions={<>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen(true)} disabled={!settings}>⚙️ Cấu hình</button>
          <a className="btn btn-ghost btn-sm" href={`${FRONTEND_URL}/app/dictation`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>
        </>}
      />

      {settings && !settings.enabled && (
        <div className="hint-box" style={{ marginBottom: 12 }}>⏸ Nút báo lỗi đang <b>tắt</b> với học sinh — bật lại trong ⚙️ Cấu hình.</div>
      )}

      <div className="inner-tabs-nav" style={{ marginBottom: 14 }}>
        {STATUS_TABS.map(t => (
          <button key={t.key} type="button" className={`inner-tab${t.key === status ? ' active' : ''}`}
            onClick={() => { setParams(t.key === 'open' ? {} : { status: t.key }, { replace: true }); setPage(1); }}>
            {t.label}{t.key !== 'all' && data && <span className="muted"> ({counts[t.key] || 0})</span>}
          </button>
        ))}
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}

      <div className="filter-bar" style={{ marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="search" className="form-input search-input" style={{ maxWidth: 280 }} placeholder="Tìm bài, câu, học sinh, ghi chú…"
          value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm báo lỗi" />
        <select className="form-input" style={{ width: 190 }} value={kind} onChange={e => { setKind(e.target.value); setPage(1); }} aria-label="Lọc loại bài">
          <option value="">Mọi loại bài</option>
          <option value="section">Bài lẻ Listening</option>
          <option value="drill">Đánh vần tên / số</option>
        </select>
        <select className="form-input" style={{ width: 240 }} value={reason} onChange={e => { setReason(e.target.value); setPage(1); }} aria-label="Lọc lý do">
          <option value="">Mọi lý do</option>
          {(settings?.reasons || []).map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <span className="muted" style={{ marginLeft: 'auto', fontSize: 13 }}>{data ? `${data.total} báo lỗi` : ''}</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>THỜI GIAN</th><th>HỌC SINH</th><th>BÀI · CÂU</th><th>LỖI</th><th>CÂU HIỆN TẠI</th><th>TRẠNG THÁI</th><th></th></tr>
          </thead>
          <TableBody loading={loading} colSpan={7}
            empty={!loading && !reports.length ? <EmptyState icon="🚩" title={status === 'open' ? 'Không có báo lỗi nào đang chờ 🎉' : 'Không có báo lỗi phù hợp'} /> : null}>
            {reports.map(r => {
              const [cls, label] = STATUS_BADGE[r.status] || ['badge-gray', r.status];
              const cur = r.current;
              return (
                <tr key={r._id}>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</td>
                  <td style={{ fontSize: 13 }}>{r.userName || '—'}</td>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.lessonTitle}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{r.kind === 'drill' ? '🔤 Drill' : '🎧 Bài lẻ'} · câu {r.sentenceIndex + 1}</div>
                  </td>
                  <td style={{ maxWidth: 220, fontSize: 13 }}>
                    <div>{r.reasonLabel || reasonLabels[r.reason] || r.reason}</div>
                    {r.note && <div className="muted" style={{ fontSize: 12 }}>“{r.note}”</div>}
                    {r.sameOpen > 1 && <span className="badge badge-red" style={{ marginTop: 2 }}>{r.sameOpen} HS báo câu này</span>}
                  </td>
                  <td style={{ maxWidth: 300, fontSize: 13 }}>
                    {r.sentenceRemoved
                      ? <span className="muted">(câu đã bị xoá)</span>
                      : cur
                        ? <>{cur.answer && <b>{cur.answer} — </b>}{cur.text}
                          {cur.text !== r.sentenceText && <div className="muted" style={{ fontSize: 11 }}>lúc báo: “{r.sentenceText}”</div>}</>
                        : <span className="muted">(không còn câu này)</span>}
                  </td>
                  <td>
                    <span className={`badge ${cls}`}>{label}</span>
                    {r.adminNote && <div className="muted" style={{ fontSize: 11, maxWidth: 160 }}>{r.adminNote}</div>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(r)}>{r.status === 'open' ? 'Xem & sửa' : 'Xem'}</button>
                    {r.status === 'open'
                      ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => quick(r, 'dismissed')} title="Câu đúng — bỏ qua mọi báo lỗi của câu này">Bỏ qua</button>
                      : <button type="button" className="btn btn-ghost btn-sm" onClick={() => quick(r, 'open')}>Mở lại</button>}
                    {isAdmin && <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(r)} title="Xoá báo lỗi này" aria-label="Xoá báo lỗi">🗑</button>}
                  </td>
                </tr>
              );
            })}
          </TableBody>
        </table>
      </div>
      {data && <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onPage={setPage} />}
    </>
  );
}
