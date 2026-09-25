import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, actions, back }) {
  return (
    <div className="page-head">
      <div style={{ minWidth: 0 }}>
        {back && <Link to={back.to} className="page-head-back">← {back.label}</Link>}
        <h1 className="page-head-title">{title}</h1>
        {subtitle && <p className="page-head-sub">{subtitle}</p>}
      </div>
      {actions && <div className="page-head-actions">{actions}</div>}
    </div>
  );
}
