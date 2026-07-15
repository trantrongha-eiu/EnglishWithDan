import { SORT_OPTIONS } from '../utils/sort';

export default function SortSelect({ value, onChange, style }) {
  return (
    <select className="form-input" value={value} onChange={e => onChange(e.target.value)} style={{ width: 170, ...style }}>
      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
