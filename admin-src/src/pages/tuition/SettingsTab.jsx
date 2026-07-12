// Extracted from Tuition.jsx — the "Cài đặt ngân hàng" tab (bank info form,
// QR upload, auto-remind schedule). Takes its slice of Tuition's state and
// the mutator callbacks as props; no state of its own.
import { MONTHS, YEARS } from './helpers';

export default function SettingsTab({
  settings, settingsForm, setSettingsForm, savingSettings, saveSettings,
  uploadingQr, qrInputRef, uploadQr, removeQr,
}) {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* Bank form */}
      <div style={{ flex: 1, minWidth: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>🏦 Thông tin ngân hàng</h3>
        {settings !== null ? (
          <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tên ngân hàng</label>
              <input className="form-input" value={settingsForm.bankName} placeholder="VD: Vietcombank"
                onChange={e => setSettingsForm(f => ({ ...f, bankName: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Số tài khoản</label>
              <input className="form-input" value={settingsForm.bankAccount} placeholder="VD: 1234567890"
                onChange={e => setSettingsForm(f => ({ ...f, bankAccount: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tên chủ tài khoản</label>
              <input className="form-input" value={settingsForm.accountName} placeholder="VD: NGUYEN VAN A"
                onChange={e => setSettingsForm(f => ({ ...f, accountName: e.target.value }))} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Học phí mặc định / tháng (VND)</label>
              <input className="form-input" type="number" value={settingsForm.defaultMonthlyFee} placeholder="0"
                onChange={e => setSettingsForm(f => ({ ...f, defaultMonthlyFee: e.target.value }))} min={0} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Hướng dẫn chuyển khoản</label>
              <textarea className="form-input" rows={3} value={settingsForm.paymentNote}
                placeholder="VD: Nội dung CK: [Tên] - [Tháng] - Học phí..."
                onChange={e => setSettingsForm(f => ({ ...f, paymentNote: e.target.value }))}
                style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingSettings}>
              {savingSettings ? 'Đang lưu...' : '💾 Lưu cài đặt'}
            </button>
          </form>
        ) : <div style={{ color: 'var(--text3)' }}>Đang tải...</div>}
      </div>

      {/* QR section */}
      <div style={{ flex: 1, minWidth: 280, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📷 Mã QR ngân hàng</h3>
        {settings?.qrImageUrl ? (
          <div style={{ textAlign: 'center' }}>
            <img src={settings.qrImageUrl} alt="QR" style={{ maxWidth: 260, maxHeight: 260, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => qrInputRef.current?.click()}>🔄 Đổi QR</button>
              <button className="btn btn-danger" onClick={removeQr}>🗑 Xóa QR</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
            <div style={{ color: 'var(--text3)', marginBottom: 16, fontSize: 14 }}>Chưa có mã QR</div>
            <button className="btn btn-primary" onClick={() => qrInputRef.current?.click()}>
              {uploadingQr ? 'Đang tải...' : '📤 Tải lên mã QR'}
            </button>
          </div>
        )}
        <input ref={qrInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) uploadQr(e.target.files[0]); e.target.value = ''; }} />
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(59,130,246,.08)', borderRadius: 8, fontSize: 12, color: 'var(--text2)' }}>
          💡 Học viên sẽ thấy mã QR này trong trang Học phí để quét và chuyển khoản.
        </div>
      </div>

      {/* Auto-remind card */}
      <div style={{ flex: '0 0 100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>⏰ Nhắc nhở tự động hàng tháng</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text3)' }}>
          Hệ thống tự động gửi tin nhắn nhắc học viên vào ngày đã chọn mỗi tháng, cho đến tháng cuối bạn đặt.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={settingsForm.autoRemindEnabled}
              onChange={e => setSettingsForm(f => ({ ...f, autoRemindEnabled: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: '#22c55e', cursor: 'pointer' }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Bật nhắc nhở tự động</span>
          </label>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Ngày nhắc mỗi tháng</label>
            <input className="form-input" type="number" min={1} max={28} style={{ width: 80 }}
              value={settingsForm.autoRemindDay}
              onChange={e => setSettingsForm(f => ({ ...f, autoRemindDay: Number(e.target.value) }))} />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tháng cuối</label>
            <select className="form-input" style={{ width: 120 }} value={settingsForm.autoRemindEndMonth}
              onChange={e => setSettingsForm(f => ({ ...f, autoRemindEndMonth: e.target.value }))}>
              <option value="">--</option>
              {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Năm cuối</label>
            <select className="form-input" style={{ width: 100 }} value={settingsForm.autoRemindEndYear}
              onChange={e => setSettingsForm(f => ({ ...f, autoRemindEndYear: e.target.value }))}>
              <option value="">--</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button type="button" className="btn btn-primary" disabled={savingSettings}
            onClick={() => saveSettings({ preventDefault: () => {} })}>
            {savingSettings ? 'Đang lưu...' : '💾 Lưu cài đặt nhắc nhở'}
          </button>
        </div>

        {settingsForm.autoRemindEnabled && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 8, fontSize: 13, color: '#15803d' }}>
            ✅ Đang bật — gửi lúc 8:00 sáng ngày <strong>{settingsForm.autoRemindDay}</strong> mỗi tháng
            {settingsForm.autoRemindEndMonth && settingsForm.autoRemindEndYear
              ? `, đến hết tháng ${settingsForm.autoRemindEndMonth}/${settingsForm.autoRemindEndYear}`
              : ' (không giới hạn)'}
          </div>
        )}
      </div>
    </div>
  );
}
