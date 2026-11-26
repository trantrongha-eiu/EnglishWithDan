import { initials } from '../../utils/vocabBattle';

export default function Avatar({ p, small, online }) {
  const cls = `vb-ava${small ? ' vb-ava--sm' : ''}`;
  return (
    <span className={cls} title={p?.name}>
      {p?.bot ? <span>🤖</span> : p?.avatar ? <img src={p.avatar} alt="" loading="lazy" /> : <span>{initials(p?.name)}</span>}
      {online && <i className="vb-dot" aria-label="đang online" />}
    </span>
  );
}
