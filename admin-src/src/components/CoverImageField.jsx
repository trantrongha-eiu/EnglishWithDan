import { useRef, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

// Cover image of a student practice-list card (Passage.thumbnailUrl / ListeningSection.thumbnailUrl).
// Empty → the list falls back to the first <img> in the passage content,
// then to the Daniel logo. The card crops to 2:1, so the preview does too.
export default function CoverImageField({ value, onChange, hint }) {
  const toast = useToast();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  async function upload() {
    const file = fileRef.current?.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast('Ảnh quá lớn (tối đa 8MB)', 'error'); return; }
    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const d = await apiFetch('/admin/passages/upload-cover-image', { method: 'POST', body: JSON.stringify({ imageBase64: dataUrl }) });
      if (!d.success) throw new Error(d.message);
      onChange(d.url);
      toast('Đã tải ảnh bìa lên — nhấn Lưu để áp dụng');
    } catch (err) { toast('Upload thất bại: ' + err.message, 'error'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  return (
    <div className="form-group">
      <label className="form-label">Ảnh bìa <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(card ở danh sách luyện đề)</span></label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 200, aspectRatio: '2 / 1', flexShrink: 0, borderRadius: 7, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text3)' }}>
          {value
            ? <img src={value} alt="Ảnh bìa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : 'Chưa có ảnh bìa'}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input className="form-input" style={{ fontSize: 12 }} value={value} onChange={e => onChange(e.target.value.trim())} placeholder="https://res.cloudinary.com/..." />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input ref={fileRef} type="file" accept="image/*" className="form-input" style={{ padding: 5, flex: 1, fontSize: 11 }} onChange={upload} disabled={uploading} />
            {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')} style={{ flexShrink: 0, fontSize: 12 }}>Xoá ảnh</button>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {uploading ? 'Đang upload...' : (hint || 'Để trống: dùng ảnh đầu tiên trong nội dung bài, không có thì hiện logo.') + ' Chỉ dùng ảnh được phép dùng tự do (card không có chỗ ghi nguồn).'}
          </div>
        </div>
      </div>
    </div>
  );
}
