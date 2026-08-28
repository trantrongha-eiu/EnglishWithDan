import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';

// "Theo dõi học sinh" — one hub for what used to be four separate sidebar
// entries (Lịch sử làm bài, Thống kê Reading, Thống kê Listening, Hoạt động
// từ vựng) plus the newly-added full mock-test monitor. Each tab just
// renders the existing self-contained page component; the old routes still
// resolve (nothing links to them internally) so deep bookmarks don't break.

const StudentHistory = lazy(() => import('./StudentHistory'));
const MockTests = lazy(() => import('./MockTests'));
const ReadingStats = lazy(() => import('./ReadingStats'));
const ListeningStats = lazy(() => import('./ListeningStats'));
const VocabActivity = lazy(() => import('./VocabActivity'));

const TABS = [
  { key: 'history',   label: '🕓 Lịch sử làm bài', El: StudentHistory },
  { key: 'mock',      label: '🎯 Thi thử Full',    El: MockTests },
  { key: 'reading',   label: '📖 Thống kê Reading', El: ReadingStats },
  { key: 'listening', label: '🎧 Thống kê Listening', El: ListeningStats },
  { key: 'vocab',     label: '📈 Hoạt động từ vựng', El: VocabActivity },
];

export default function Monitoring() {
  const [params, setParams] = useSearchParams();
  const active = TABS.find(t => t.key === params.get('tab')) || TABS[0];
  const El = active.El;

  return (
    <>
      <div className="inner-tabs-nav" style={{ marginBottom: 18 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`inner-tab${t.key === active.key ? ' active' : ''}`}
            onClick={() => setParams(t.key === 'history' ? {} : { tab: t.key }, { replace: true })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Suspense fallback={<div className="route-loading">Đang tải…</div>}>
        <El />
      </Suspense>
    </>
  );
}
