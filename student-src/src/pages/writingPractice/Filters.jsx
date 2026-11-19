import { LEVELS, TOPICS, TYPES } from '../../utils/writingPractice';

// The filter buttons, the same in the sidebar and the phone sheet.
// meta = /writing-practice/meta counts once loaded.

const levelCount = (meta, id) => meta?.counts?.[id]?._total || 0;

export function LevelList({ meta, level, onPick }) {
  return (
    <div className="wp-level-list">
      {LEVELS.map((l) => {
        const n = levelCount(meta, l.id);
        return (
          <button key={l.id} className={`wp-level-btn${l.id === level ? ' active' : ''}`} data-level={l.id} onClick={() => onPick(l.id)}>
            {l.label}{n > 0 && <span className="wp-lc-badge">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function TopicList({ meta, level, topic, scores, onPick }) {
  const levelData = meta?.counts?.[level] || {};
  return (
    <div className="wp-topic-list">
      {TOPICS.map((t) => {
        const n = t.id === 'all' ? (levelData._total || 0) : (levelData[t.id] || 0);
        return (
          <button
            key={t.id}
            className={`wp-topic-btn${t.id === topic ? ' active' : ''}`}
            data-topic={t.id}
            style={meta && !n && t.id !== 'all' ? { opacity: 0.5 } : undefined}
            onClick={() => onPick(t.id)}
          >
            {t.label}
            {t.id !== 'all' && scores[t.id]?.completed && <i className="fas fa-check-circle wp-item-done-icon" title="Đã hoàn thành (≥80%)" />}
            {meta && <span className="wp-lc-badge">{n || ''}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function TypeList({ type, onPick }) {
  return (
    <div className="wp-type-list">
      {TYPES.map((t) => (
        <button key={t.id} className={`wp-type-btn${t.id === type ? ' active' : ''}`} data-type={t.id} onClick={() => onPick(t.id)}>{t.label}</button>
      ))}
    </div>
  );
}

export function TestLevelList({ meta, level, onPick }) {
  return (
    <div className="wp-level-list">
      {[...LEVELS, { id: 'all', label: '🎯 Tất cả' }].map((l) => {
        const n = l.id === 'all' ? 0 : levelCount(meta, l.id);
        return (
          <button key={l.id} className={`wp-level-btn${l.id === level ? ' active' : ''}`} data-tlevel={l.id} onClick={() => onPick(l.id)}>
            {l.label}{n > 0 && <span className="wp-lc-badge">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function TestCountList({ count, onPick }) {
  return (
    <div className="wp-level-list">
      {[10, 15, 20].map((n) => (
        <button key={n} className={`wp-level-btn${n === count ? ' active' : ''}`} data-tcount={n} onClick={() => onPick(n)}>{n} câu</button>
      ))}
    </div>
  );
}

export function Toggle({ id, checked, onChange }) {
  return (
    <label className="wp-toggle-switch">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="wp-toggle-slider" />
    </label>
  );
}
