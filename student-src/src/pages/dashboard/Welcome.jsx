import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal';
import { FEAT_INFO } from './featInfo';
import ClassInfoCard from './ClassInfoCard';
import HomeworkCard from './HomeworkCard';
import WeaknessCard from './WeaknessCard';
import TodaysLesson from './TodaysLesson';
import { hasPremiumAccess } from '../../utils/plan';
import { openUpgrade } from '../../utils/shell';

const SKILL_CARDS = [
  { href: '/reading.html', icon: 'fa-book-open', label: 'Reading' },
  { href: '/listening.html', icon: 'fa-headphones', label: 'Listening' },
  { href: '/writing.html', icon: 'fa-pen-nib', label: 'Writing' },
  { href: '/speaking.html', icon: 'fa-microphone', label: 'Speaking' },
  { href: '/writing-practice.html', icon: 'fa-dumbbell', label: 'Luyện viết' },
];

const FEAT_CHIPS = [
  { icon: 'fa-file-import', label: 'Nhập hàng loạt', key: 'bulk-import' },
  { icon: 'fa-fire-alt', label: 'Cách tính lửa', key: 'streak' },
  { icon: 'fa-book-open', label: 'Paraphrase Cambridge', key: 'paraphrase' },
  { icon: 'fa-hammer', label: 'Búa Daniel', key: 'hammer' },
];

const WEEK_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getMascotMsg(streak) {
  if (streak === 0) return 'Bắt đầu luyện từ hôm nay để xây dựng streak!';
  if (streak < 3) return 'Streak đang bắt đầu! Giữ vững nhé 💪';
  if (streak < 7) return `${streak} ngày liên tiếp — bạn đang tiến bộ rất tốt!`;
  if (streak < 14) return `🔥 ${streak} ngày streak! Thật tuyệt vời!`;
  return `🌟 ${streak} ngày streak! Bạn là chiến thần vocab rồi!`;
}

// Free-plan students only (staff + trial accounts have full access)
function PremiumBanner() {
  if (hasPremiumAccess()) return null;
  return (
    <div id="dash-premium-banner" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,rgba(124,58,237,.08),rgba(79,70,229,.06))', border: '1px solid rgba(124,58,237,.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 22 }}>⭐</div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 2 }}>Nâng cấp Premium để mở khóa toàn bộ tính năng</div>
        <div style={{ fontSize: 12, color: 'var(--text2,#555)' }}>Full test Reading · Listening · thi thử Writing/Speaking không giới hạn · ngân hàng đề cập nhật thường xuyên</div>
      </div>
      <button onClick={() => openUpgrade()} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Upgrade Premium</button>
    </div>
  );
}

function StreakCard({ stats, onUseHammer }) {
  const { streak = 0, streakHammers = 0, canUseHammer = false } = stats || {};
  return (
    <div className="dan-streak-card">
      <div className="dan-streak-top">
        <div className="dan-mascot">🐼</div>
        <div className="dan-streak-info">
          <div className="dan-streak-badge">
            <span className="dan-fire"><i className="fas fa-fire" /></span>
            <span className="dan-streak-num">{stats ? streak : '–'}</span>
            <span className="dan-streak-label">ngày streak</span>
            {streakHammers > 0 && (
              <span className="dan-hammer-badge" title="Búa Daniel">
                <img src="/img/buaDaniel.jpg" alt="Búa Daniel" className="dan-hammer-icon" />
                <span>{streakHammers}</span>
              </span>
            )}
          </div>
          <div className="dan-streak-msg">{stats ? getMascotMsg(streak) : 'Đang tải...'}</div>
        </div>
      </div>
      {canUseHammer && (
        <button className="btn-use-hammer" onClick={onUseHammer}>
          <img src="/img/buaDaniel.jpg" alt="" className="dan-hammer-icon" />
          Dùng búa Daniel — khôi phục streak vừa mất
        </button>
      )}
    </div>
  );
}

function WeeklyProgress({ days }) {
  if (!days) return null;
  return (
    <div className="dan-week" style={{ marginTop: 12 }}>
      <div className="dan-week-title">Tiến độ 7 ngày qua</div>
      <div className="dan-week-row">
        {days.map((d, i) => {
          const day = WEEK_DAYS[new Date(d.date).getDay()];
          return (
            <div key={i} className={`dan-week-dot${d.count > 0 ? ' active' : ''}`} title={`${day}: ${d.count} từ`}>
              <span className="dan-week-day">{day}</span>
              <span className={`dan-week-circle${d.count > 0 ? ' filled' : ''}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Welcome() {
  const { stats, setStats, weekDays, homework, loadHomework, openGuide, lessons } = useOutletContext();
  const toast = useToast();
  const [infoKey, setInfoKey] = useState(null);
  const info = infoKey && FEAT_INFO[infoKey];

  async function useHammer() {
    try {
      const d = await apiFetch('/user/streak/use-hammer', { method: 'POST' });
      setStats(s => ({ ...s, streak: d.streak, streakHammers: d.streakHammers ?? Math.max(0, (s?.streakHammers || 1) - 1), canUseHammer: false }));
      toast('Đã khôi phục streak bằng búa Daniel!', 'success');
    } catch (err) {
      toast(err.message || 'Không dùng được búa', 'error');
    }
  }

  return (
    <div id="book-welcome" style={{ flex: 1, overflowY: 'auto', padding: '40px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <PremiumBanner />
        {/* 🏫 class + 📚 homework cards — render nothing for a student in no class */}
        <ClassInfoCard />
        <HomeworkCard homework={homework} reload={loadHomework} />

        <section className="dash-vocab-hero" style={{ marginBottom: 24 }}>
          <div className="dash-vocab-hero-head">
            <div className="dash-vocab-hero-text">
              <h2 className="dash-vocab-hero-title">Sổ từ vựng thông minh</h2>
              <p className="dash-vocab-hero-sub">Chọn sổ ở sidebar để xem từ — hoặc khám phá các tính năng bên cạnh</p>
            </div>
            <a className="dash-vocab-hero-lb" href="/vocab-leaderboard.html">
              <i className="fas fa-ranking-star" /> Xem BXH vocab
            </a>
          </div>
          <div className="dash-vocab-hero-row">
            <div>
              <StreakCard stats={stats} onUseHammer={useHammer} />
              <WeeklyProgress days={weekDays} />
            </div>
            <TodaysLesson lessons={lessons} />
          </div>
        </section>

        <WeaknessCard />

        <div className="feat-chip-row" style={{ marginBottom: 24 }}>
          {FEAT_CHIPS.map(c => (
            <button key={c.key} type="button" className="feat-chip" onClick={() => setInfoKey(c.key)}>
              <i className={`fas ${c.icon}`} /> {c.label}
            </button>
          ))}
        </div>
        {info && (
          <Modal
            title={<><i className={`fas ${info.icon}`} /> {info.title}</>}
            size={info.wide ? 'modal-md' : 'modal-sm'}
            onClose={() => setInfoKey(null)}
          >
            {info.body}
          </Modal>
        )}

        <div className="skill-cards" style={{ marginBottom: 24 }}>
          <div className="skills-explore-row">
            <span className="skills-explore-label">Khám phá:</span>
            {SKILL_CARDS.map(s => (
              <a key={s.href} className="skills-explore-link" href={s.href}>
                <i className={`fas ${s.icon}`} /> {s.label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn btn-primary btn-sm" onClick={openGuide}><i className="fas fa-book-open" /> Xem hướng dẫn chi tiết</button>
        </div>
      </div>
    </div>
  );
}
