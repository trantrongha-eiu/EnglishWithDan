import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal';
import { FEAT_INFO } from './featInfo';
import ClassInfoCard from './ClassInfoCard';
import HomeworkCard from './HomeworkCard';
import WeaknessCard from './WeaknessCard';
import TodaysLesson from './TodaysLesson';
import { hasPremiumAccess } from '../../utils/plan';
import { bindDict, openUpgrade } from '../../utils/shell';
import { useStreakFace } from '../../utils/streak';

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

function WeeklyProgress({ days }) {
  return (
    <div className="dan-week">
      <div className="dan-week-title">Tiến độ 7 ngày qua</div>
      <div className="dan-week-row">
        {(days || []).map(d => (
          <div key={d.key} className={`dan-week-day${d.isToday ? ' today' : ''}`}>
            <div className="dan-week-dot" data-lvl={d.level} title={`${d.key}: ${d.count} bài`}>{d.count > 0 ? '✓' : ''}</div>
            <span>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakCard({ stats, weekDays, onUseHammer, hammerBusy, onFlameRules }) {
  const { streak = 0, streakHammers = 0, canUseHammer = false } = stats || {};
  const { state, mascot, fire, num } = useStreakFace(stats);
  return (
    <div className={`dan-streak-card${state.mood === 'angry' ? ' is-angry' : state.mood === 'sad' ? ' is-sad' : ''}`}>
      <div className="dan-streak-top">
        <div className="dan-mascot" ref={mascot}>🐼</div>
        <div className="dan-streak-info">
          <div className="dan-streak-badge">
            <span className="dan-fire" ref={fire}><i className="fas fa-fire" /></span>
            <span className="dan-streak-num" ref={num}>{stats ? streak : '–'}</span>
            <span className="dan-streak-label">ngày streak</span>
            {streakHammers > 0 && (
              <span className="dan-hammer-badge" title="Búa Daniel">
                <img src="/img/buaDaniel.jpg" alt="Búa Daniel" className="dan-hammer-icon" />
                <span>{streakHammers}</span>
              </span>
            )}
          </div>
          <div className="dan-streak-msg">{stats ? state.msg : 'Đang tải...'}</div>
        </div>
      </div>
      <button type="button" className="dan-flame-rules-btn" onClick={onFlameRules}>
        <i className="fas fa-fire" /> Cách tính lửa <span className="dan-flame-rules-new">Mới</span>
      </button>
      {canUseHammer && (
        <button className="btn-use-hammer" style={{ display: 'inline-flex' }} onClick={onUseHammer} disabled={hammerBusy}>
          <img src="/img/buaDaniel.jpg" alt="" className="dan-hammer-icon" />
          Dùng búa Daniel — khôi phục streak vừa mất
        </button>
      )}
      <WeeklyProgress days={weekDays} />
    </div>
  );
}

export default function Welcome() {
  const { stats, loadStats, weekDays, loadWeek, homework, loadHomework, openGuide, lessons } = useOutletContext();
  const toast = useToast();
  const [infoKey, setInfoKey] = useState(null);
  const [hammerBusy, setHammerBusy] = useState(false);
  const info = infoKey && FEAT_INFO[infoKey];

  useEffect(() => { bindDict('book-welcome', 'dashboard-home'); }, []);

  // /dashboard?focus=homework-card (nav.js homework reminders): the card
  // appears once the homework has loaded
  const [params] = useSearchParams();
  const focus = params.get('focus');
  const hwReady = !!homework;
  useEffect(() => {
    if (!focus || !hwReady) return undefined;
    const t = setTimeout(() => document.getElementById(focus)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => clearTimeout(t);
  }, [focus, hwReady]);

  // The colourful skill tiles come from playful.js, like on the static pages
  const [richSkills] = useState(() => !!window.Mascot?.renderSkillCards);
  useEffect(() => { if (richSkills) window.Mascot.renderSkillCards(); }, [richSkills]);

  async function useHammer() {
    setHammerBusy(true);
    try {
      const d = await apiFetch('/user/streak/use-hammer', { method: 'POST' });
      toast(`🔨 Đã khôi phục streak ${d.streak} ngày!`, 'success');
      await loadStats();
      loadWeek();
    } catch (err) {
      toast(err.message || 'Không thể dùng búa lúc này', 'error');
    } finally {
      setHammerBusy(false);
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
              <p className="dash-vocab-hero-sub dash-mob-hint">
                <i className="fas fa-hand-pointer" /> Bấm <strong>Sổ từ</strong> bên dưới để chọn sổ, học Paraphrase hoặc Vocab Topics
              </p>
            </div>
            <a className="dash-vocab-hero-lb" href="/app/leaderboard">
              <i className="fas fa-ranking-star" /> Xem BXH vocab
            </a>
          </div>
          <div className="dash-vocab-hero-row">
            <StreakCard stats={stats} weekDays={weekDays} onUseHammer={useHammer} hammerBusy={hammerBusy} onFlameRules={() => setInfoKey('streak')} />
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

        {richSkills
          ? <div className="skill-cards" data-skill-cards style={{ marginBottom: 24 }} />
          : (
            <div style={{ marginBottom: 24 }}>
          <div className="skills-explore-row">
            <span className="skills-explore-label">Khám phá:</span>
            {SKILL_CARDS.map(s => (
              <a key={s.href} className="skills-explore-link" href={s.href}>
                <i className={`fas ${s.icon}`} /> {s.label}
              </a>
            ))}
          </div>
            </div>
          )}

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn btn-primary btn-sm" onClick={openGuide}><i className="fas fa-book-open" /> Xem hướng dẫn chi tiết</button>
        </div>
      </div>
    </div>
  );
}
