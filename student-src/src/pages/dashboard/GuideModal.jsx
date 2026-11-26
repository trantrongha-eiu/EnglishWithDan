import { useEffect } from 'react';

// "Hướng dẫn sử dụng Sổ từ vựng" — same content + .guide-* classes as
// dashboard.html #modal-guide.

const MODES = [
  { icon: 'fa-sync-alt', bg: '#eff6ff', color: 'var(--blue)', name: 'Flashcard', text: 'Lật thẻ, đánh giá mức độ nhớ.' },
  { icon: 'fa-check-circle', bg: '#f0fdf4', color: 'var(--green)', name: 'Quiz', text: 'Chọn đáp án đúng trong 4 lựa chọn ngẫu nhiên.' },
  { icon: 'fa-pen', bg: '#fef3c7', color: '#d97706', name: 'Điền từ', text: 'Đọc câu ví dụ, gõ từ còn thiếu vào chỗ trống (chỉ dùng từ có câu ví dụ).' },
  { icon: 'fa-headphones', bg: '#f5f3ff', color: '#7c3aed', name: 'Listen (Nghe)', text: 'Nghe phát âm, gõ từ bạn nghe thấy.' },
  { icon: 'fa-language', bg: '#fce7f3', color: '#db2777', name: 'Translate (Dịch)', text: 'Nhìn nghĩa tiếng Việt, gõ từ tiếng Anh.' },
  { icon: 'fa-random', bg: '#fff7ed', color: '#ea580c', name: 'Mixed', text: 'Trộn ngẫu nhiên 4 dạng Quiz · Điền từ · Nghe · Dịch. Từ chưa có câu ví dụ sẽ không ra dạng Điền từ. Từ trả lời sai quay lại sau vài câu ở dạng khác.' },
];

const STATUS = [
  { label: 'Mastered', style: { background: 'var(--success-light)', color: 'var(--success)', borderColor: 'rgba(22,163,74,.4)' }, text: 'Đã thuộc chắc, ít được ôn lại hơn.' },
  { label: 'So-so', style: { background: 'var(--warning-light)', color: 'var(--warning)', borderColor: 'rgba(217,119,6,.4)' }, text: 'Nhớ lơ mơ, cần ôn thêm vài lần.' },
  { label: 'Not yet', style: { background: 'var(--surface2)', color: 'var(--text2)', borderColor: 'var(--border2)' }, text: 'Chưa thuộc, ưu tiên ôn trước.' },
];


export default function GuideModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box modal-guide" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3><i className="fas fa-book-open" /> Hướng dẫn sử dụng Sổ từ vựng</h3>
          <button className="modal-close" aria-label="Đóng" onClick={onClose}>×</button>
        </div>
        <div className="modal-body guide-body">
          <div className="guide-section">
            <div className="guide-section-title"><span className="guide-num">1</span> Tạo &amp; quản lý sổ</div>
            <ul className="guide-list">
              <li><strong>5 sổ mặc định:</strong> Mỗi bạn dùng 5 sổ cố định <strong>Sổ 1 – Sổ 5</strong> (giáo viên giao bài theo số sổ) — không đổi tên hay xoá được.</li>
              <li><strong>📚 Từ của lớp:</strong> Sổ tự có khi bạn bấm <code>Bắt đầu</code> một bộ từ giáo viên giao — chứa các từ của bộ đó (không tính vào giới hạn sổ, không xoá được).</li>
              <li><strong>Tạo sổ mới:</strong> Nhấn <code>+</code> cạnh “My Notebooks”. Tối đa <strong>10 sổ</strong> (tính cả Sổ 1 – Sổ 5).</li>
              <li><strong>Chuyển từ sang sổ khác:</strong> Nhấn <code>Chuyển sang sổ khác</code> trên thanh công cụ của sổ (hoặc <code>⋯</code> ở topbar → <em>Chuyển toàn bộ từ sang sổ khác</em>).</li>
              <li><strong>Sổ tự tạo</strong> có thể đổi tên, gộp hoặc xóa qua nút <code>⋯</code>.</li>
              <li>Mỗi sổ chứa tối đa <strong>1000 từ</strong>.</li>
            </ul>
          </div>

          <div className="guide-section">
            <div className="guide-section-title"><span className="guide-num">2</span> Thêm từ vào sổ</div>
            <ul className="guide-list">
              <li><strong>Thêm thủ công:</strong> Nhấn <code>+ Add word</code> → nhập từ, nghĩa, ví dụ. Hệ thống tự gợi ý ví dụ từ từ điển.</li>
              <li><strong>Nhập hàng loạt:</strong> Nhấn <code>Nhập hàng loạt</code> → dán danh sách theo định dạng:<br />
                <code className="guide-code">word: nghĩa tiếng Việt</code> (hoặc dùng <code>-</code> hay Tab thay dấu <code>:</code>)<br />
                Hệ thống sẽ tự tra ví dụ và phát âm từ từ điển Oxford/Cambridge.</li>
              <li><strong>Từ bài Reading:</strong> Đọc bài Reading → double-click vào từ bất kỳ → chọn sổ để lưu.</li>
              <li><strong>Chia sẻ cho bạn:</strong> Nhấn <code>Copy danh sách</code> → gửi cho bạn qua Zalo/Messenger. Bạn ấy chỉ cần dán vào <code>Nhập hàng loạt</code> là lưu được. Muốn gửi vài từ thôi: tick chọn các từ đó rồi nhấn <code>Copy</code>.</li>
            </ul>
          </div>

          <div className="guide-section">
            <div className="guide-section-title"><span className="guide-num">3</span> Trạng thái từ vựng</div>
            {STATUS.map(s => (
              <div className="guide-status-row" key={s.label}>
                <span className="guide-status-badge" style={s.style}>{s.label}</span>
                <span>{s.text}</span>
              </div>
            ))}
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Khi học Flashcard, bạn tự đánh giá và cập nhật trạng thái. Các chế độ có chấm điểm (Quiz, Điền từ, Nghe, Dịch, Mixed) tự ghi nhận đúng/sai và tự nâng hoặc hạ mức nhớ của từ.</p>
          </div>

          <div className="guide-section">
            <div className="guide-section-title"><span className="guide-num">4</span> Các chế độ học</div>
            <div className="guide-modes-grid">
              {MODES.map(m => (
                <div className="guide-mode-item" key={m.name}>
                  <span className="guide-mode-icon" style={{ background: m.bg, color: m.color }}><i className={`fas ${m.icon}`} /></span>
                  <div><strong>{m.name}</strong><br />{m.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="guide-section">
            <div className="guide-section-title"><span className="guide-num">5</span> Hard Words &amp; Streak</div>
            <ul className="guide-list">
              <li><strong>Ôn lại từ hay sai:</strong> Nhấn <code>Ôn lại từ hay sai</code> (xuất hiện khi sổ có từ sai từ 3 lần trở lên) để luyện riêng các từ bạn hay nhầm nhất trong sổ đó.</li>
              <li><strong>Ôn lại từ hay sai (toàn bộ):</strong> Sidebar → <code>Ôn lại từ hay sai</code> — tổng hợp từ tất cả sổ.</li>
              <li><strong>Streak:</strong> Học ít nhất một session mỗi ngày để giữ chuỗi ngày liên tiếp. Panda sẽ cổ vũ bạn mỗi ngày!</li>
            </ul>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Đã hiểu, bắt đầu học!</button>
        </div>
      </div>
    </div>
  );
}
