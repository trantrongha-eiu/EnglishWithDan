import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 32 }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h2 style={{ margin: 0, fontSize: 24 }}>Trang không tìm thấy</h2>
      <p style={{ color: 'var(--text2)', margin: 0 }}>Trang này chưa được migrate sang React hoặc không tồn tại.</p>
      <Link to="/dashboard" className="btn btn-primary">Về Dashboard</Link>
    </div>
  );
}
