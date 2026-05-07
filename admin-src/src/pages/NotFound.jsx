import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const nav = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>404</div>
      <h2 style={{ color: 'var(--text)', marginBottom: 8 }}>Trang không tồn tại</h2>
      <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Route này không có trong admin panel.</p>
      <button className="btn btn-primary" onClick={() => nav('/admin/dashboard')}>← Về Dashboard</button>
    </div>
  );
}
