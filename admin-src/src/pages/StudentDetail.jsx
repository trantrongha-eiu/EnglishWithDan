import { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useAdminData } from '../contexts/AdminDataContext';
import { useApi } from '../hooks/useApi';
import VocabDetailPanel from '../components/VocabDetailPanel';
import { skillBadge, SKILL_META } from '../components/SkillBadge';
import PageHeader from '../components/ui/PageHeader';
import { ErrorState, EmptyState, TableBody, Skeleton } from '../components/ui/States';
import { bandBadge, roleBadge, planBadge, simBadge } from '../components/ui/badges';
import { displayName, formatDur, formatLastSeen, formatDay, formatNumber, formatVnd, initials } from '../utils/format';
import { PlanModal, RemindModal, EditUserModal } from './users/UserModals';

// Chi tiết học sinh (redesigned 2026-09-25):
//  - "Tổng quan" = GET /admin/users/:id/overview: goals, streak, classes,
//    homework, per-skill activity, course progress, mock/entrance results,
//    paraphrase SRS, difficult words, tuition (admin) — none of which were
//    visible anywhere in admin before;
//  - header actions (message / remind / plan / edit) act in place instead
//    of sending the teacher back to Người dùng;
//  - each tab fetches only when opened; history filters by skill on the
//    SERVER (was: 500 rows × 16 collections, filtered client-side) and
//    vocab asks for this one student (was: the whole roster's analytics).

const HISTORY_STEP = 50;
const GROUPS = [
  ['reading', '📖 Reading'], ['listening', '🎧 Listening'], ['writing', '✍️ Writing'],
  ['speaking', '🎤 Speaking'], ['grammar', '📘 Ngữ pháp'], ['vocab', '🗂 Từ vựng'],
  ['course', '🎓 Khoá học'], ['mock', '🎯 Thi thử'],
];
const COURSE_LABEL = { 'IELTS-W-T1': 'Khoá Writing Task 1', 'IELTS-W-T2': 'Khoá Writing Task 2', 'IELTS-SPEAKING': 'Khoá Speaking' };
const DAY_LABEL = { mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7', sun: 'CN' };
const ENROLL_BADGE = { active: 'badge-green', warning: 'badge-yellow', failed: 'badge-red', completed: 'badge-blue', dropped: 'badge-gray' };
const ENROLL_LABEL = { active: 'Đang học', warning: 'Cảnh báo', failed: 'Không đạt', completed: 'Hoàn thành', dropped: 'Đã nghỉ' };
const ENTRANCE_LABEL = { IN_PROGRESS: 'Đang làm', PENDING_WRITING: 'Chờ chấm Writing', PENDING_REVIEW: 'Chờ duyệt', COMPLETED: 'Đã duyệt', DISQUALIFIED: 'Bị huỷ', ABANDONED: 'Bỏ dở' };

function Kv({ label, children }) {
  return <div className="kv"><span>{label}</span><span>{children}</span></div>;
}

function OverviewTab({ id, isAdmin }) {
  const { data, error, loading, reload } = useApi(`/admin/users/${id}/overview`);
  if (loading) return <div className="info-grid">{[0, 1, 2].map(i => <div key={i} className="panel"><Skeleton height={120} /></div>)}</div>;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const o = data.overview;
  const g = o.goal;
  const activityTotal = o.activity.reduce((n, a) => n + a.count, 0);

  return (
    <>
      <div className="info-grid">
        <div className="panel">
          <div className="panel-title" style={{ marginBottom: 8 }}>🎯 Mục tiêu</div>
          <Kv label="Band mục tiêu">{g.targetBand ?? <span className="muted">Chưa đặt</span>}</Kv>
          <Kv label="Band hiện tại">{g.currentBand != null ? `${g.currentBand}${g.currentBandSource === 'estimated' ? ' (ước tính)' : g.currentBandSource === 'self_assessed' ? ' (tự đánh giá)' : ''}` : <span className="muted">–</span>}</Kv>
          <Kv label="Ngày thi">{g.targetExamDate ? formatDay(g.targetExamDate) : <span className="muted">–</span>}</Kv>
          <Kv label="Lịch học">{g.studyDays.length ? g.studyDays.map(d => DAY_LABEL[d] || d).join(', ') : <span className="muted">–</span>}</Kv>
          <Kv label="Thời lượng / tuần">{g.weeklyStudyMinutes ? `${g.weeklyStudyMinutes} phút` : <span className="muted">–</span>}</Kv>
          {g.studyMotto && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8, fontStyle: 'italic' }}>“{g.studyMotto}”</div>}
        </div>
        <div className="panel">
          <div className="panel-title" style={{ marginBottom: 8 }}>🔥 Chuyên cần</div>
          <Kv label="Streak hiện tại">{o.streak.current} ngày</Kv>
          <Kv label="Streak cao nhất">{o.streak.max} ngày</Kv>
          <Kv label="Búa giữ streak">{o.streak.hammers}</Kv>
          <Kv label="Tổng thời gian học">{o.streak.totalStudyMinutes ? `${formatNumber(o.streak.totalStudyMinutes)} phút` : '–'}</Kv>
          <Kv label="Học gần nhất">{o.streak.lastActivityDate ? formatDay(o.streak.lastActivityDate) : '–'}</Kv>
        </div>
        <div className="panel">
          <div className="panel-title" style={{ marginBottom: 8 }}>🗂 Từ vựng & ôn tập</div>
          <Kv label="Paraphrase đang ôn (SRS)">{formatNumber(o.paraphrase.tracked)}</Kv>
          <Kv label="Đến hạn ôn hôm nay">{o.paraphrase.due > 0 ? <span style={{ color: 'var(--yellow)' }}>{o.paraphrase.due}</span> : 0}</Kv>
          <Kv label="Từ khó đã lưu">{formatNumber(o.difficultWords)}</Kv>
          <Kv label="Bài tập về nhà">{o.homework.assignments ? `${o.homework.completed}/${o.homework.assignments} hoàn thành` : <span className="muted">Chưa được giao</span>}</Kv>
          {o.tuition && (
            <Kv label="Học phí chưa đóng">
              {o.tuition.unpaidCount
                ? <Link to="/tuition" style={{ color: 'var(--danger)' }}>{o.tuition.unpaidCount} khoản · {formatVnd(o.tuition.unpaidAmount)}</Link>
                : <span style={{ color: 'var(--green)' }}>Không nợ</span>}
            </Kv>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">📊 Hoạt động theo kỹ năng</div>
            <div className="panel-sub">{formatNumber(activityTotal)} lượt · lịch sử luyện tập được giữ 3 tháng</div>
          </div>
        </div>
        {activityTotal === 0
          ? <EmptyState icon="🌱" title="Học sinh chưa làm bài nào" />
          : GROUPS.map(([gk, gl]) => {
            const items = o.activity.filter(a => a.group === gk && a.count > 0);
            if (!items.length) return null;
            return (
              <div key={gk}>
                <div className="skill-group-title">{gl}</div>
                <div className="skill-grid">
                  {items.map(a => (
                    <div key={a.key} className="skill-tile">
                      <div className="skill-tile-label">{a.label}</div>
                      <div className="skill-tile-count">{formatNumber(a.count)}</div>
                      <div className="skill-tile-meta">
                        {a.avgBand != null && <>Band TB <strong>{a.avgBand.toFixed(1)}</strong> · </>}
                        Gần nhất {a.lastAt ? formatDay(a.lastAt) : '–'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      <div className="info-grid">
        <div className="panel">
          <div className="panel-title" style={{ marginBottom: 8 }}>🗓️ Lớp học</div>
          {o.classes.length === 0
            ? <div className="muted" style={{ fontSize: 13 }}>{isAdmin ? 'Chưa ghi danh lớp nào.' : 'Không học lớp nào do bạn phụ trách.'}</div>
            : o.classes.map(c => (
              <div key={c.classId} className="kv">
                <span>
                  <Link to={`/classes/${c.classId}`}>{c.name}</Link>
                  <br /><small className="muted">{c.heldSessions ? `Đi học ${c.attendedCount}/${c.heldSessions} buổi` : 'Chưa có buổi nào'}{c.homeworkMissedCount ? ` · thiếu ${c.homeworkMissedCount} BTVN` : ''}</small>
                </span>
                <span>
                  <span className={`badge ${ENROLL_BADGE[c.status] || 'badge-gray'}`} title={c.statusReason || undefined}>{ENROLL_LABEL[c.status] || c.status}</span>
                  {c.attendanceRate != null && c.heldSessions > 0 && <><br /><small className="muted">{c.attendanceRate}% chuyên cần</small></>}
                </span>
              </div>
            ))}
        </div>
        <div className="panel">
          <div className="panel-title" style={{ marginBottom: 8 }}>🎓 Khoá học Writing / Speaking</div>
          {o.courses.length === 0
            ? <div className="muted" style={{ fontSize: 13 }}>Chưa bắt đầu khoá nào.</div>
            : o.courses.map(c => (
              <div key={c.courseCode} className="kv">
                <span>{COURSE_LABEL[c.courseCode] || c.courseCode}<br /><small className="muted">{c.exercisesCompleted} bài tập đã xong</small></span>
                <span>{c.lessonsCompleted}/{c.lessonsStarted} buổi hoàn thành</span>
              </div>
            ))}
        </div>
        <div className="panel">
          <div className="panel-head" style={{ marginBottom: 8 }}>
            <div className="panel-title">🏁 Thi thử & Test đầu vào</div>
            <Link to={`/monitoring?tab=mock&userId=${id}`} className="btn btn-ghost btn-sm">Tất cả</Link>
          </div>
          {o.entranceTest && (
            <Kv label={<Link to="/entrance-test?tab=attempts">Test đầu vào · {formatDay(o.entranceTest.date)}</Link>}>
              {o.entranceTest.overallBand != null ? bandBadge(o.entranceTest.overallBand) : <span className="muted">{ENTRANCE_LABEL[o.entranceTest.resultStatus] || o.entranceTest.status}</span>}
            </Kv>
          )}
          {o.mockTests.length === 0 && !o.entranceTest && <div className="muted" style={{ fontSize: 13 }}>Chưa thi thử lần nào.</div>}
          {o.mockTests.map(m => (
            <Kv key={m._id} label={<>Thi thử Full · {formatDay(m.createdAt)}{m.violated && <span className="badge badge-red" style={{ marginLeft: 6, fontSize: 10 }}>⚠️ vi phạm</span>}<br /><small className="muted">L {m.bands.listening ?? '–'} · R {m.bands.reading ?? '–'} · W {m.bands.writing ?? '–'} · S {m.bands.speaking ?? '–'}</small></>}>
              {m.overallBand != null ? bandBadge(m.overallBand) : <span className="muted">{m.status === 'in-progress' ? 'Đang làm' : m.status === 'disqualified' ? 'Bị huỷ' : 'Chờ chấm'}</span>}
            </Kv>
          ))}
        </div>
      </div>
    </>
  );
}

function HistoryTab({ id }) {
  const [skill, setSkill] = useState('');
  const [limit, setLimit] = useState(HISTORY_STEP);
  const path = `/admin/recent-attempts?userId=${id}&limit=${limit}${skill ? `&skill=${encodeURIComponent(skill)}` : ''}`;
  const { data, error, loading, refreshing, reload } = useApi(path);
  const rows = data?.attempts || [];
  const total = data?.total ?? rows.length;

  return (
    <>
      <div className="filter-bar" style={{ marginBottom: 14 }}>
        <select className="form-input" value={skill} onChange={e => { setSkill(e.target.value); setLimit(HISTORY_STEP); }} style={{ width: 240 }} aria-label="Lọc theo kỹ năng">
          <option value="">Tất cả kỹ năng</option>
          {Object.entries(SKILL_META).filter(([k]) => k !== 'wt1-course').map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
        {!loading && <span className="muted" style={{ fontSize: 12 }}>Hiển thị {rows.length} / {formatNumber(total)} lượt</span>}
      </div>
      <div className={`table-wrap${refreshing ? ' is-refreshing' : ''}`}>
        <table className="table">
          <thead>
            <tr><th>Kỹ năng</th><th>Bài</th><th>Ngày làm</th><th>Thời gian</th><th>Đúng/Tổng</th><th>Band</th></tr>
          </thead>
          <TableBody loading={loading} error={error} onRetry={reload} colSpan={6}
            empty={rows.length === 0 && <EmptyState icon="📝" title={skill ? 'Không có lượt nào cho kỹ năng này' : 'Chưa có lượt làm bài'} />}>
            {rows.map(h => {
              const graded = h.skill === 'writing' || h.skill === 'speaking';
              return (
                <tr key={`${h.skill}-${h._id}`}>
                  <td>{skillBadge(h.skill)}</td>
                  <td>
                    {h.skill === 'writing'
                      ? <Link to={`/writing-grades?viewAttempt=${h._id}`}>{h.testName || '–'}</Link>
                      : h.skill === 'speaking'
                        ? <Link to={`/speaking?viewAttempt=${h._id}`}>{h.testName || '–'}</Link>
                        : (h.testName || '–')}
                    {h.testMeta && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{h.testMeta}</div>}
                    {simBadge(h)}
                  </td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(h.date)}</td>
                  <td>{formatDur(h.duration)}</td>
                  <td>{h.correctCount != null && h.totalQuestions != null ? `${h.correctCount}/${h.totalQuestions}` : '–'}</td>
                  <td>{graded && h.bandScore == null
                    ? <span className="muted" style={{ fontSize: 12 }}>{h.status === 'error' ? 'Lỗi chấm bài' : 'Chờ chấm'}</span>
                    : bandBadge(h.bandScore)}</td>
                </tr>
              );
            })}
          </TableBody>
        </table>
      </div>
      {!loading && rows.length < total && (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button type="button" className="btn btn-ghost" disabled={refreshing} onClick={() => setLimit(l => l + HISTORY_STEP)}>
            {refreshing ? 'Đang tải…' : `Tải thêm ${Math.min(HISTORY_STEP, total - rows.length)} lượt`}
          </button>
        </div>
      )}
    </>
  );
}

function VocabTab({ id }) {
  const { data, error, loading, reload } = useApi(`/admin/vocab-students?userId=${id}`);
  if (loading) return <Skeleton height={160} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const s = data?.students?.[0];
  return s ? <VocabDetailPanel student={s} /> : <EmptyState icon="🗂" title="Học sinh chưa có hoạt động từ vựng nào" />;
}

function BadgesTab({ id }) {
  const { data: badges, error, loading, reload } = useApi(`/admin/users/${id}/badges`);
  if (loading) return <Skeleton height={160} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>Đã đạt {badges.earnedCount}/{badges.totalCount} huy hiệu</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {badges.badges.map(b => (
          <div key={b.id} className="panel" style={{ textAlign: 'center', padding: 14, borderColor: b.earned ? 'var(--green)' : undefined, opacity: b.earned ? 1 : 0.65 }} title={b.description}>
            <div style={{ fontSize: 28, marginBottom: 6 }} aria-hidden="true">{b.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{b.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', margin: '4px 0 8px' }}>{b.description}</div>
            {b.earned
              ? <span className="badge badge-green">✓ Đã đạt</span>
              : (
                <>
                  <div className="meter"><span style={{ width: `${Math.min(100, Math.round((b.progress.current / b.progress.target) * 100))}%` }} /></div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{b.progress.current}/{b.progress.target}</div>
                </>
              )}
          </div>
        ))}
      </div>
    </>
  );
}

const TABS = [
  { key: 'overview', label: '📋 Tổng quan' },
  { key: 'history', label: '🕓 Lịch sử làm bài' },
  { key: 'vocab', label: '📈 Từ vựng' },
  { key: 'badges', label: '🏅 Huy hiệu' },
];

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { badges } = useAdminData();
  const [params, setParams] = useSearchParams();
  const tab = TABS.find(t => t.key === params.get('tab'))?.key || 'overview';
  const { data, error, loading, reload } = useApi(`/admin/users/${id}`);
  const [modal, setModal] = useState(null); // 'plan' | 'remind' | 'edit'

  if (loading) {
    return <div className="panel"><div className="profile-card"><Skeleton width={64} height={64} radius={32} /><div style={{ flex: 1 }}><Skeleton width="40%" height={20} /><br /><Skeleton width="60%" style={{ marginTop: 8 }} /></div></div></div>;
  }
  if (error) {
    return (
      <>
        <PageHeader title="Chi tiết học sinh" back={{ to: '/users', label: 'Người dùng' }} />
        {error.status === 404
          ? <EmptyState icon="🔍" title="Không tìm thấy học sinh" action={<Link to="/users" className="btn btn-primary">Về danh sách</Link>} />
          : <ErrorState error={error} onRetry={reload} />}
      </>
    );
  }

  const user = data.user;
  const ls = formatLastSeen(user.lastSeen);
  const online = badges?.onlineIds?.has(user._id);
  const isStudent = user.role === 'student';

  return (
    <>
      {modal === 'plan' && <PlanModal user={user} onClose={() => setModal(null)} onSaved={reload} />}
      {modal === 'remind' && <RemindModal user={user} onClose={() => setModal(null)} onSaved={reload} />}
      {modal === 'edit' && <EditUserModal userId={user._id} onClose={() => setModal(null)} onSaved={reload} />}

      <PageHeader title="Hồ sơ học sinh" back={{ to: '/users?role=student', label: 'Người dùng' }} />

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="profile-card">
          <span className={`avatar-sm profile-avatar${online ? ' avatar-online' : ''}`}>
            {user.avatar ? <img src={user.avatar} alt="" /> : initials(user)}
          </span>
          <div className="profile-main">
            <div className="profile-name">{displayName(user)}</div>
            <div className="profile-meta">@{user.username} · {user.email}</div>
            <div className="profile-badges">
              {roleBadge(user.role)}
              {isStudent && planBadge(user.plan, user.planExpiresAt)}
              {user.className && <span className="badge badge-purple">Lớp {user.className}</span>}
              {user.isBanned && <span className="badge badge-red" title={user.banReason || undefined}>Bị cấm</span>}
              {user.studyReminderCount > 0 && (
                <span className={`badge ${user.studyReminderCount >= 3 ? 'badge-red' : 'badge-gray'}`}>🔔 {user.studyReminderCount} lần nhắc nhở</span>
              )}
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/messages?to=${user._id}`)}>✉️ Nhắn tin</button>
            {isStudent && <button className="btn btn-ghost btn-sm" onClick={() => setModal('remind')}>🔔 Nhắc nhở</button>}
            {isAdmin && isStudent && <button className="btn btn-soft btn-sm" onClick={() => setModal('plan')}>⭐ Gói</button>}
            {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => setModal('edit')}>✏️ Sửa</button>}
          </div>
        </div>
        <div className="profile-facts">
          <span>Ngày tạo: <strong>{formatDay(user.createdAt)}</strong></span>
          <span>Online gần nhất: <strong style={{ color: ls.color }}>{ls.text}</strong></span>
          <span>Đăng nhập bằng: <strong>{user.authProvider === 'google' ? 'Google' : 'Email'}</strong></span>
          {user.emailVerified === false && <span className="badge badge-yellow">Email chưa xác minh</span>}
        </div>
      </div>

      <div className="inner-tabs-nav" role="tablist" style={{ marginBottom: 16 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`inner-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setParams(t.key === 'overview' ? {} : { tab: t.key }, { replace: true })}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab id={id} isAdmin={isAdmin} />}
      {tab === 'history' && <HistoryTab id={id} />}
      {tab === 'vocab' && <VocabTab id={id} />}
      {tab === 'badges' && <BadgesTab id={id} />}
    </>
  );
}
