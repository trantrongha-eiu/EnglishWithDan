import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import { bindDict, openUpgrade, showBadges } from '../utils/shell';
import {
  EMPTY_FORM, FOCUS_TABS, HEAT_WEEKS, MAX_AVATAR_BYTES, VALID_TABS, compressImage, formFromUser, heatCells,
  normalizeStats, planInfo, setNavAvatar, syncCachedUser, userInitial,
} from '../utils/profile';
import OverviewTab from './profile/OverviewTab';
import HistoryTab from './profile/HistoryTab';
import InventoryTab from './profile/InventoryTab';
import { EditTab, SecurityTab } from './profile/AccountTabs';

// 👤 Hồ sơ — /app/profile?tab=edit|security|history|inventory&focus=plan
// (js/profile.js + js/inventory.js). Profile, stats and badges load side by
// side, so one failing leaves the others on screen.

const TABS = [
  { key: 'overview', icon: 'fa-chart-bar', label: 'Tổng quan' },
  { key: 'edit', icon: 'fa-edit', label: 'Chỉnh sửa' },
  { key: 'security', icon: 'fa-lock', label: 'Bảo mật' },
  { key: 'history', icon: 'fa-history', label: 'Lịch sử' },
  { key: 'inventory', icon: 'fa-box-open', label: 'Kho đồ' },
];
const ROLE_LABEL = { teacher: 'Giáo viên', admin: 'Quản trị viên' };
// A sleeping server can take a while to answer
const SLOW = { timeout: 90000 };
const titled = (type, title, msg) => window.showToastWithTitle?.(type, title, msg);
const settled = (r) => (r.status === 'fulfilled' ? r.value : {});

function PlanCard({ user }) {
  const plan = user ? planInfo(user) : null;
  const badge = plan?.badge || { cls: 'plan-tag--free', text: '🆓 Free' };
  return (
    <div className="plan-card" id="plan">
      <div className="plan-card-top">
        <span className="plan-card-heading"><i className="fas fa-tag" style={{ marginRight: 4 }} />Gói học tập</span>
        <span className={`plan-tag ${badge.cls}`} id="planBadge">{badge.text}</span>
      </div>
      <div className="plan-dates" id="planDates">
        {plan && <div className="plan-date-row"><i className="fas fa-calendar-plus" /> Thành viên từ: <strong>{plan.memberSince}</strong></div>}
        {plan?.expires && <div className="plan-date-row"><i className="fas fa-calendar-times" /> Hết hạn: <strong>{plan.expires}</strong></div>}
      </div>
      <div id="planCountdown">
        {plan?.countdown && (
          <>
            <div className="plan-progress-wrap"><div className="plan-progress-fill" style={{ width: `${plan.countdown.pct}%`, background: plan.countdown.color }} /></div>
            <span className={`plan-countdown-txt ${plan.countdown.cls}`}><i className="fas fa-clock" /> Còn {plan.countdown.daysLeft} ngày</span>
          </>
        )}
      </div>
      {plan?.upgrade && (
        <button type="button" className="plan-upgrade-link" id="planUpgradeBtn" onClick={() => openUpgrade()}
          style={{ display: 'flex', ...(plan.upgrade.background ? { background: plan.upgrade.background } : {}) }}>
          <i className="fas fa-crown" /> {plan.upgrade.label}
        </button>
      )}
    </div>
  );
}

function Sidebar({ user, stats, onAvatar }) {
  const fileInput = useRef(null);
  const cover = useRef(null);
  useEffect(() => { window.Mascot?.mount?.(cover.current, 'wink'); }, []);
  const name = user ? (`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username) : 'Đang tải...';
  return (
    <aside className="profile-sidebar">
      <div className="profile-card">
        <div className="profile-card-cover"><div className="pfp-cover-dan" ref={cover} aria-hidden="true" /></div>
        <div className="profile-card-body" id="profileCardBody">
          <div className="avatar-wrap">
            {user?.avatar
              ? <img id="avatarDisplay" src={user.avatar} alt="avatar" />
              : <div className="avatar-placeholder" id="avatarDisplay">{user ? userInitial(user) : '?'}</div>}
            <div className="avatar-edit-btn" title="Đổi ảnh" onClick={() => fileInput.current?.click()}><i className="fas fa-camera" /></div>
            <input ref={fileInput} type="file" id="avatarInput" accept="image/*" style={{ display: 'none' }} onChange={onAvatar} />
          </div>
          <div className="profile-name" id="profileName">{name}</div>
          <div className="profile-username" id="profileUsername">@{user ? user.username : '...'}</div>
          <div className="profile-role"><i className="fas fa-user-graduate" /> <span id="profileRole">{ROLE_LABEL[user?.role] || 'Học sinh'}</span></div>
          <div className="profile-bio" id="profileBio">{user?.bio || ''}</div>
          {user?.studyMotto && (
            <div className="profile-motto" id="profileMotto" style={{ display: 'flex' }}>
              <i className="fas fa-quote-left" /><span id="mottoText">{user.studyMotto}</span>
            </div>
          )}
          {user?.targetBand ? (
            <div className="profile-target" id="profileTarget" style={{ display: 'block' }}>
              🎯 Mục tiêu: Band <strong id="targetBandDisplay">{user.targetBand}</strong>
            </div>
          ) : null}
        </div>
      </div>

      <PlanCard user={user} />

      <div className="card-plain">
        <div className="mini-stats">
          <div className="mini-stat"><div className="mini-stat-val" id="statReading">{stats?.reading.avgBand || '-'}</div><div className="mini-stat-label">Reading Band</div></div>
          <div className="mini-stat"><div className="mini-stat-val" id="statListening">{stats?.listening.avgBand || '-'}</div><div className="mini-stat-label">Listening Band</div></div>
          <div className="mini-stat"><div className="mini-stat-val" id="statTests">{stats ? stats.reading.total + stats.listening.total : 0}</div><div className="mini-stat-label">Bài kiểm tra</div></div>
          <div className="mini-stat"><div className="mini-stat-val" id="statSpeaking">{stats ? stats.speaking.total : 0}</div><div className="mini-stat-label">Bài Speaking</div></div>
        </div>
      </div>
    </aside>
  );
}

function Heatmap({ cells }) {
  // Only once there is something to show
  if (!cells?.some((c) => c.n > 0)) return null;
  return (
    <div className="card mb-16" id="heatmapCard" style={{ display: 'block' }}>
      <div className="card-header">
        <span style={{ fontWeight: 700 }}><i className="fas fa-calendar-check" /> Hoạt động học tập</span>
        <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 6 }}>6 tháng gần nhất</span>
      </div>
      <div className="card-body">
        <div className="heat-scroll">
          <div className="heat-grid" id="heatGrid">
            {cells.map((c) => <span key={c.key} className="heat-cell" data-lvl={c.level} title={`${c.key}: ${c.n} bài luyện tập`} />)}
          </div>
        </div>
        <div className="heat-legend">
          Ít {[0, 1, 2, 3, 4].map((l) => <span key={l} className="heat-cell" data-lvl={l} />)} Nhiều
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: cachedUser, refreshUser, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const [{ user, stats, badges }, setData] = useState({ user: null, stats: null, badges: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [heat, setHeat] = useState(null);

  const focus = params.get('focus');
  const wanted = params.get('tab');
  const tab = VALID_TABS.includes(wanted) ? wanted : (FOCUS_TABS[focus] || 'overview');
  const role = cachedUser?.role;
  const canPlay = !role || role === 'student' || role === 'teacher';

  const load = useCallback(() => Promise.allSettled([
    apiFetch('/user/profile', SLOW), apiFetch('/user/stats', SLOW), apiFetch('/badges', SLOW),
  ]).then(([p, s, b]) => {
    const pd = settled(p);
    const sd = settled(s);
    const bd = settled(b);
    if (!pd.success) titled('error', 'Lỗi', 'Không thể tải thông tin profile');
    if (!sd.success) titled('error', 'Lỗi', 'Không thể tải số liệu thống kê');
    if (pd.success) {
      // Every other page reads name / avatar from this cache
      syncCachedUser(pd.user);
      refreshUser();
      setNavAvatar(pd.user);
      setForm(formFromUser(pd.user));
    }
    setData((d) => ({
      user: pd.success ? pd.user : d.user,
      stats: sd.success ? normalizeStats(sd.stats) : d.stats,
      badges: bd.success ? bd : d.badges,
    }));
    if (bd.success) showBadges(bd);
  }), [refreshUser]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let alive = true;
    apiFetch(`/user/activity-heatmap?days=${HEAT_WEEKS * 7 + 7}`, SLOW).then((d) => {
      if (alive && d.success) setHeat(heatCells(d.activity));
    }).catch(() => { /* a side widget: the page works without it */ });
    return () => { alive = false; };
  }, []);

  // Double-click a word to look it up
  const loaded = !!user;
  useEffect(() => {
    if (!loaded) return;
    bindDict('profileCardBody', 'profile');
    bindDict('tab-overview', 'profile');
  }, [loaded]);

  // ?focus=plan: bring that section into view and flash it
  useEffect(() => {
    const el = focus && document.getElementById(focus);
    if (!el) return undefined;
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-pulse');
    });
    const timer = setTimeout(() => el.classList.remove('highlight-pulse'), 1800);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      el.classList.remove('highlight-pulse');
    };
  }, [focus]);

  // From a long History tab, the new panel starts in view. Scrolled once the
  // new panel is on screen: its height decides how far the page can go.
  const scrollToTabs = useRef(false);
  useEffect(() => {
    if (!scrollToTabs.current) return;
    scrollToTabs.current = false;
    document.querySelector('.tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [tab]);

  function openTab(name) {
    if (name === tab) {
      document.querySelector('.tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    scrollToTabs.current = true;
    setParams(name === 'overview' ? {} : { tab: name }, { replace: true });
  }

  async function uploadAvatar(e) {
    const input = e.target;
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      titled('warning', 'Cảnh báo', 'Vui lòng chọn file ảnh');
    } else if (file.size > MAX_AVATAR_BYTES) {
      titled('warning', 'Ảnh quá lớn', 'Vui lòng chọn ảnh dưới 20MB');
    } else {
      try {
        titled('info', 'Đang xử lý...', 'Đang nén ảnh');
        const imageBase64 = await compressImage(file, 600, 0.85);
        titled('info', 'Đang tải...', 'Vui lòng chờ');
        const data = await apiFetch('/user/avatar', { method: 'POST', body: JSON.stringify({ imageBase64 }), timeout: 120000 });
        setData((d) => ({ ...d, user: d.user ? { ...d.user, avatar: data.avatar } : d.user }));
        syncCachedUser(data.user || { avatar: data.avatar });
        refreshUser();
        setNavAvatar(data.user || { ...user, avatar: data.avatar });
        titled('success', 'Thành công', 'Ảnh đại diện đã được cập nhật');
      } catch (err) {
        titled('error', 'Lỗi', err.message || 'Upload thất bại');
      }
    }
    input.value = ''; // the same file can be picked again
  }

  const markPasswordSet = () => setData((d) => ({ ...d, user: { ...d.user, hasPassword: true } }));
  const signOut = () => { if (window.logout) window.logout(); else logout(); };

  return (
    <div className="profile-layout">
      <Sidebar user={user} stats={stats} onAvatar={uploadAvatar} />

      <main>
        {stats?.streak > 0 && (
          <div className="streak-display" id="streakDisplay" style={{ display: 'flex' }}>
            <div className="streak-fire">🔥</div>
            <div className="streak-info">
              <h3 id="streakCount">{stats.streak} ngày</h3>
              <p>Chuỗi học liên tục của bạn</p>
            </div>
          </div>
        )}

        <Heatmap cells={heat} />

        <div className="tabs">
          {TABS.filter((t) => t.key !== 'inventory' || canPlay).map((t) => (
            <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} data-tab={t.key} onClick={() => openTab(t.key)}>
              <i className={`fas ${t.icon}`} /> {t.label}
            </button>
          ))}
        </div>

        <OverviewTab active={tab === 'overview'} user={user} stats={stats} badges={badges} />
        <EditTab active={tab === 'edit'} form={form} setForm={setForm} onSaved={load} />
        <SecurityTab active={tab === 'security'} hasPassword={user?.hasPassword !== false} onPasswordSet={markPasswordSet} onLogout={signOut} />
        <InventoryTab active={tab === 'inventory'} canPlay={canPlay} />
        <HistoryTab active={tab === 'history'} stats={stats} />
      </main>
    </div>
  );
}
