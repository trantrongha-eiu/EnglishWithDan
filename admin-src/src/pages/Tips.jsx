import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch, FRONTEND_URL, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useApi } from '../hooks/useApi';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import { ErrorState, EmptyState, Skeleton } from '../components/ui/States';
import { renderMarkdown } from '../utils/markdown';

// Tips 4 kỹ năng — admin view of the Reading/Listening/Writing/Speaking Tips
// articles students read (GET/PATCH /api/admin/tips). Until now these had
// no admin surface at all. Show/hide is live for students (their list
// endpoint only returns active tips); content itself is still authored in
// the seed data files, so there's no block editor here.

const STUDENT_URL = {
  reading:   key => `/reading.html?mode=tips&tip=${encodeURIComponent(key)}`,
  listening: key => `/listening.html?mode=tips&tip=${encodeURIComponent(key)}`,
  writing:   key => `/writing.html?view=writing-tips&tip=${encodeURIComponent(key)}`,
  speaking:  key => `/speaking.html?tab=speaking-tips&tip=${encodeURIComponent(key)}`,
};

function PreviewModal({ skill, tip, onClose }) {
  const { data, error, loading, reload } = useApi(`/admin/tips/${skill}/${tip._id}`);
  const html = useMemo(() => (data?.tip ? renderMarkdown(data.tip.markdown) : ''), [data]);
  return (
    <Modal title={`${tip.icon || '💡'} ${tip.title}`} onClose={onClose} width={760}
      footer={<>
        {tip.isActive && <a className="btn btn-ghost" href={`${FRONTEND_URL}${STUDENT_URL[skill](tip.lessonKey)}`} target="_blank" rel="noreferrer">Mở trang học sinh ↗</a>}
        <button type="button" className="btn btn-primary" onClick={onClose}>Đóng</button>
      </>}>
      {loading && <Skeleton height={200} />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data?.tip && (
        <>
          <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
            {tip.category} · <code>{tip.lessonKey}</code> · cập nhật {formatDate(data.tip.updatedAt)}
            {!data.tip.isActive && <span className="badge badge-gray" style={{ marginLeft: 8 }}>Đang ẩn với học sinh</span>}
          </div>
          {/* renderMarkdown escapes all tip text before adding its own tags. */}
          <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
        </>
      )}
    </Modal>
  );
}

export default function Tips() {
  const toast = useToast();
  const { data, error, loading, reload } = useApi('/admin/tips');
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [override, setOverride] = useState({}); // tipId -> isActive (optimistic)
  const [busy, setBusy] = useState({});
  const [preview, setPreview] = useState(null);

  const skills = data?.skills || [];
  const active = skills.find(s => s.skill === params.get('skill')) || skills[0];
  const withOverride = t => (t._id in override ? { ...t, isActive: override[t._id] } : t);

  const tips = useMemo(() => {
    if (!active) return [];
    const q = search.trim().toLowerCase();
    return active.tips.map(withOverride).filter(t => {
      if (status === 'visible' && !t.isActive) return false;
      if (status === 'hidden' && t.isActive) return false;
      return !q || t.title.toLowerCase().includes(q) || t.lessonKey.toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q);
    });
  }, [active, search, status, override]); // eslint-disable-line react-hooks/exhaustive-deps

  const byCategory = useMemo(() => {
    const m = new Map();
    tips.forEach(t => { if (!m.has(t.category)) m.set(t.category, []); m.get(t.category).push(t); });
    return [...m.entries()];
  }, [tips]);

  async function toggle(skill, tip) {
    const next = !tip.isActive;
    setOverride(o => ({ ...o, [tip._id]: next }));
    setBusy(b => ({ ...b, [tip._id]: true }));
    try {
      const d = await apiFetch(`/admin/tips/${skill}/${tip._id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive: next }) });
      toast(d.message || (next ? 'Đã hiện' : 'Đã ẩn'));
    } catch (e) {
      setOverride(o => ({ ...o, [tip._id]: !next }));
      toast(e.message, 'error');
    } finally {
      setBusy(b => ({ ...b, [tip._id]: false }));
    }
  }

  return (
    <>
      {preview && <PreviewModal skill={preview.skill} tip={preview.tip} onClose={() => setPreview(null)} />}
      <PageHeader
        title="Tips 4 kỹ năng"
        subtitle="Bài hướng dẫn chiến thuật học sinh đọc ở trang Reading / Listening / Writing / Speaking. Ẩn một bài để gỡ khỏi trang học sinh ngay lập tức (tối đa ~2 phút do cache)."
      />

      {loading && <Skeleton height={260} />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {active && (
        <>
          <div className="inner-tabs-nav" role="tablist">
            {skills.map(s => {
              const hidden = s.tips.map(withOverride).filter(t => !t.isActive).length;
              return (
                <button key={s.skill} role="tab" aria-selected={s.skill === active.skill}
                  className={`inner-tab${s.skill === active.skill ? ' active' : ''}`}
                  onClick={() => setParams(s.skill === skills[0].skill ? {} : { skill: s.skill }, { replace: true })}>
                  {s.label} <span className="muted">({s.tips.length}{hidden ? ` · ${hidden} ẩn` : ''})</span>
                </button>
              );
            })}
          </div>

          <div className="filter-bar" style={{ marginBottom: 14 }}>
            <input type="search" className="form-input search-input" style={{ maxWidth: 300 }} placeholder="Tìm tiêu đề, mã bài, nhóm…"
              value={search} onChange={e => setSearch(e.target.value)} aria-label="Tìm bài Tips" />
            <select className="form-input" style={{ width: 170 }} value={status} onChange={e => setStatus(e.target.value)} aria-label="Lọc trạng thái">
              <option value="">Mọi trạng thái</option>
              <option value="visible">Đang hiện</option>
              <option value="hidden">Đang ẩn</option>
            </select>
          </div>

          {byCategory.length === 0
            ? <div className="panel"><EmptyState icon="💡" title="Không có bài Tips phù hợp" /></div>
            : byCategory.map(([cat, list]) => (
              <div key={cat} className="panel panel-flush" style={{ marginBottom: 14 }}>
                <div className="panel-head" style={{ paddingBottom: 12, marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
                  <div className="panel-title">{cat}</div>
                  <span className="panel-sub">{list.length} bài</span>
                </div>
                <div className="tips-list">
                  {list.map(t => (
                    <div key={t._id} className={`tip-row${t.isActive ? '' : ' tip-row--hidden'}`}>
                      <span className="tip-icon" aria-hidden="true">{t.icon || '💡'}</span>
                      <div className="tip-main">
                        <div className="tip-title">{t.title}</div>
                        <div className="tip-meta">
                          <code>{t.lessonKey}</code>
                          <span>{t.blockCount} khối nội dung</span>
                          {t.hasPractice && <span className="badge badge-blue" style={{ fontSize: 10 }}>🎯 có bài luyện tập</span>}
                          {t.updatedAt && <span>cập nhật {formatDate(t.updatedAt).split(' ')[0]}</span>}
                        </div>
                      </div>
                      <div className="tip-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview({ skill: active.skill, tip: t })}>Xem trước</button>
                        <label className="switch" title={t.isActive ? 'Đang hiện với học sinh — bấm để ẩn' : 'Đang ẩn — bấm để hiện'}>
                          <input type="checkbox" checked={t.isActive} disabled={!!busy[t._id]} onChange={() => toggle(active.skill, t)}
                            aria-label={`${t.isActive ? 'Ẩn' : 'Hiện'} bài "${t.title}" với học sinh`} />
                          <span className="switch-track" aria-hidden="true" />
                          {t.isActive ? 'Hiện' : 'Ẩn'}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}
    </>
  );
}
