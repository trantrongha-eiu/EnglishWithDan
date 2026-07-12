import { useEffect, useState, useRef } from 'react';
import { API, apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import StudentPicker from './tuition/StudentPicker';
import SummaryTab from './tuition/SummaryTab';
import SettingsTab from './tuition/SettingsTab';
import { RemindModal, BulkRemindModal } from './tuition/RemindModals';
import { PAGE, MONTHS, CUR_YEAR, CUR_MONTH, YEARS, fmtVND, fmtLabel } from './tuition/helpers';

export default function Tuition() {
  const toast   = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('fees');

  // ── Fee list state ──
  const [fees, setFees]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [feeStats, setFeeStats] = useState({ totalAmount: 0, paidAmount: 0, pendingNotify: 0 });
  const [page, setPage]     = useState(1);
  const [filter, setFilter] = useState({
    month: String(CUR_MONTH), year: String(CUR_YEAR),
    feeType: '', isPaid: '', studentNotified: '', studentId: '',
  });
  const [students, setStudents] = useState([]);

  // ── Create/Edit form ──
  const [showForm, setShowForm]     = useState(false);
  const [editFee, setEditFee]       = useState(null);
  const [isCopy, setIsCopy]         = useState(false);
  const [formData, setFormData]     = useState({
    studentId: '', feeType: 'monthly', month: String(CUR_MONTH),
    year: String(CUR_YEAR), courseName: '', amount: '', note: '',
  });
  const [saving, setSaving] = useState(false);

  // ── Summary state ──
  const [summary, setSummary]       = useState([]);
  const [courseSummary, setCourseSummary] = useState([]);
  const [summaryYear, setSummaryYear] = useState(String(CUR_YEAR));

  // ── Settings state ──
  const [settings, setSettings]     = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    bankName: '', bankAccount: '', accountName: '', defaultMonthlyFee: '', paymentNote: '',
    autoRemindEnabled: false, autoRemindDay: 10, autoRemindEndMonth: '', autoRemindEndYear: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingQr, setUploadingQr]       = useState(false);
  const qrInputRef = useRef();

  // ── Remind modal ──
  const [remindFee, setRemindFee]   = useState(null);
  const [remindMsg, setRemindMsg]   = useState('');
  const [sendingRemind, setSendingRemind] = useState(false);

  // ── Bulk remind ──
  const [showBulkRemind, setShowBulkRemind] = useState(false);
  const [bulkMonth, setBulkMonth] = useState(String(CUR_MONTH));
  const [bulkYear, setBulkYear]   = useState(String(CUR_YEAR));
  const [bulkMsg, setBulkMsg]     = useState('');
  const [sendingBulk, setSendingBulk] = useState(false);

  // ── Student unpaid warning (when creating new fee) ──
  const [studentUnpaid, setStudentUnpaid] = useState(null); // { count, total }

  useEffect(() => { loadStudents(); }, []);
  useEffect(() => {
    if (activeTab === 'fees') { setPage(1); loadFees(1); }
  }, [filter, activeTab]);
  useEffect(() => { if (activeTab === 'summary') loadSummary(); }, [summaryYear, activeTab]);
  useEffect(() => { if (activeTab === 'settings') loadSettings(); }, [activeTab]);

  async function loadStudents() {
    try {
      const d = await apiFetch('/tuition/students-list');
      setStudents(d.students || []);
    } catch { /* ignore */ }
  }

  async function loadFees(p = page, overrideFilter) {
    try {
      const f = overrideFilter !== undefined ? overrideFilter : filter;
      const q = new URLSearchParams({ page: p, limit: PAGE, ...f });
      // remove empty; course fees have no year/month so never filter by them
      for (const [k, v] of [...q.entries()]) { if (!v) q.delete(k); }
      if (f.feeType === 'course') { q.delete('month'); q.delete('year'); }
      const d = await apiFetch(`/tuition?${q}`);
      setFees(d.fees || []);
      setTotal(d.total || 0);
      if (d.stats) setFeeStats(d.stats);
    } catch (e) { toast(e.message, 'error'); }
  }

  async function loadSummary() {
    try {
      const d = await apiFetch(`/tuition/summary?year=${summaryYear}`);
      setSummary(d.summary || []);
      setCourseSummary(d.courseSummary || []);
    } catch (e) { toast(e.message, 'error'); }
  }

  async function loadSettings() {
    try {
      const d = await apiFetch('/tuition/settings');
      setSettings(d.settings);
      setSettingsForm({
        bankName:          d.settings.bankName || '',
        bankAccount:       d.settings.bankAccount || '',
        accountName:       d.settings.accountName || '',
        defaultMonthlyFee: d.settings.defaultMonthlyFee || '',
        paymentNote:       d.settings.paymentNote || '',
        autoRemindEnabled:  d.settings.autoRemindEnabled || false,
        autoRemindDay:      d.settings.autoRemindDay || 10,
        autoRemindEndMonth: d.settings.autoRemindEndMonth || '',
        autoRemindEndYear:  d.settings.autoRemindEndYear || '',
      });
    } catch (e) { toast(e.message, 'error'); }
  }

  // ── CRUD ──
  async function fetchStudentUnpaid(studentId) {
    if (!studentId) { setStudentUnpaid(null); return; }
    try {
      const d = await apiFetch(`/tuition?studentId=${studentId}&isPaid=false&limit=100`);
      const fees = d.fees || [];
      const total = fees.reduce((s, f) => s + (f.amount || 0), 0);
      setStudentUnpaid(fees.length > 0 ? { count: fees.length, total } : null);
    } catch { setStudentUnpaid(null); }
  }

  function openCreate() {
    setEditFee(null); setIsCopy(false); setStudentUnpaid(null);
    setFormData({ studentId: '', feeType: 'monthly', month: String(CUR_MONTH), year: String(CUR_YEAR), courseName: '', amount: settings?.defaultMonthlyFee || '', note: '' });
    setShowForm(true);
  }
  function openCopy(fee) {
    setEditFee(null); setIsCopy(true); setStudentUnpaid(null);
    let nextMonth = fee.feeType === 'monthly' ? Number(fee.month) + 1 : CUR_MONTH;
    let nextYear  = fee.feeType === 'monthly' ? Number(fee.year)      : CUR_YEAR;
    if (nextMonth > 12) { nextMonth = 1; nextYear += 1; }
    const sid = fee.studentId?._id || fee.studentId;
    setFormData({
      studentId:  sid,
      feeType:    fee.feeType,
      month:      String(nextMonth),
      year:       String(nextYear),
      courseName: fee.courseName || '',
      amount:     String(fee.amount),
      note:       fee.note || '',
    });
    fetchStudentUnpaid(sid);
    setShowForm(true);
  }
  function openEdit(fee) {
    setEditFee(fee); setIsCopy(false); setStudentUnpaid(null);
    setFormData({
      studentId:  fee.studentId?._id || fee.studentId,
      feeType:    fee.feeType,
      month:      String(fee.month || CUR_MONTH),
      year:       String(fee.year  || CUR_YEAR),
      courseName: fee.courseName || '',
      amount:     String(fee.amount),
      note:       fee.note || '',
    });
    setShowForm(true);
  }

  async function saveFee(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, amount: Number(formData.amount) };
      if (editFee) {
        await apiFetch(`/tuition/${editFee._id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Đã cập nhật học phí');
        setShowForm(false);
        loadFees(page);
      } else {
        await apiFetch('/tuition', { method: 'POST', body: JSON.stringify(payload) });
        toast('Đã thêm học phí');
        setShowForm(false);
        setPage(1);
        // Snap filter to the month/year of the new fee so it's immediately visible
        const newFilter = formData.feeType === 'monthly'
          ? { ...filter, month: String(formData.month), year: String(formData.year) }
          : { ...filter, month: '', year: '' };
        setFilter(newFilter);
        loadFees(1, newFilter); // pass new filter directly to bypass stale closure
      }
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function togglePaid(fee) {
    try {
      await apiFetch(`/tuition/${fee._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPaid: !fee.isPaid }),
      });
      loadFees(page); // reload từ server để đảm bảo dữ liệu chính xác
    } catch (e) { toast(e.message, 'error'); }
  }

  async function deleteFee(id) {
    confirm('Xóa khoản học phí này?', async () => {
      try {
        await apiFetch(`/tuition/${id}`, { method: 'DELETE' });
        toast('Đã xóa');
        loadFees(page);
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  // ── Reminders ──
  async function sendRemind() {
    if (!remindFee) return;
    setSendingRemind(true);
    try {
      await apiFetch(`/tuition/${remindFee._id}/remind`, {
        method: 'POST',
        body: JSON.stringify({ customMessage: remindMsg || undefined }),
      });
      toast('Đã gửi nhắc nhở đến ' + (remindFee.studentId?.username || 'học viên'));
      setRemindFee(null); setRemindMsg('');
    } catch (e) { toast(e.message, 'error'); }
    finally { setSendingRemind(false); }
  }

  async function sendBulkRemind() {
    setSendingBulk(true);
    try {
      const d = await apiFetch('/tuition/remind-bulk', {
        method: 'POST',
        body: JSON.stringify({ month: Number(bulkMonth), year: Number(bulkYear), customMessage: bulkMsg || undefined }),
      });
      toast(`Đã gửi ${d.sent} nhắc nhở`);
      setShowBulkRemind(false); setBulkMsg('');
    } catch (e) { toast(e.message, 'error'); }
    finally { setSendingBulk(false); }
  }

  // ── Settings ──
  async function saveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await apiFetch('/tuition/settings', { method: 'PUT', body: JSON.stringify(settingsForm) });
      toast('Đã lưu cài đặt');
      loadSettings();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSavingSettings(false); }
  }

  async function uploadQr(file) {
    if (!file) return;
    setUploadingQr(true);
    try {
      const fd = new FormData(); fd.append('qr', file);
      const res = await fetch(`${API}/tuition/settings/qr`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast('Đã tải lên mã QR');
      loadSettings();
    } catch (e) { toast(e.message, 'error'); }
    finally { setUploadingQr(false); }
  }

  async function removeQr() {
    confirm('Xóa mã QR?', async () => {
      try {
        await apiFetch('/tuition/settings/qr', { method: 'DELETE' });
        toast('Đã xóa QR');
        loadSettings();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  // ── stat cards for top of fees tab (server-aggregated over ALL matching records) ──
  const totalAmount   = feeStats.totalAmount || 0;
  const paidAmount    = feeStats.paidAmount  || 0;
  const unpaidAmount  = totalAmount - paidAmount;
  const pendingNotify = feeStats.pendingNotify || 0;

  // ── accumulated unpaid per student (for warning icon in table) ──
  const studentDebtMap = fees.reduce((map, f) => {
    if (!f.isPaid) {
      const sid = f.studentId?._id || f.studentId;
      map[sid] = (map[sid] || 0) + (f.amount || 0);
    }
    return map;
  }, {});

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">💰 Quản lý học phí</h2>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[
          { key: 'fees',     label: '📋 Danh sách' },
          { key: 'summary',  label: '📊 Thống kê' },
          { key: 'settings', label: '⚙️ Cài đặt ngân hàng' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              borderBottom: activeTab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === t.key ? '#3b82f6' : 'var(--text2)',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ═══════════════ TAB: FEES ═══════════════ */}
      {activeTab === 'fees' && (
        <>
          {/* Filter bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
            {filter.feeType !== 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>Tháng</label>
              <select className="form-input" style={{ width: 110, padding: '6px 8px' }}
                value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}>
                <option value="">Tất cả</option>
                {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            )}
            {filter.feeType !== 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>Năm</label>
              <select className="form-input" style={{ width: 90, padding: '6px 8px' }}
                value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))}>
                <option value="">Tất cả</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>Loại</label>
              <select className="form-input" style={{ width: 130, padding: '6px 8px' }}
                value={filter.feeType} onChange={e => setFilter(f => ({ ...f, feeType: e.target.value }))}>
                <option value="">Tất cả</option>
                <option value="monthly">Hàng tháng</option>
                <option value="course">Khóa học</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>Trạng thái</label>
              <select className="form-input" style={{ width: 130, padding: '6px 8px' }}
                value={filter.isPaid} onChange={e => setFilter(f => ({ ...f, isPaid: e.target.value }))}>
                <option value="">Tất cả</option>
                <option value="false">Chưa thu</option>
                <option value="true">Đã thu</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>Đã báo TT</label>
              <select className="form-input" style={{ width: 130, padding: '6px 8px' }}
                value={filter.studentNotified} onChange={e => setFilter(f => ({ ...f, studentNotified: e.target.value }))}>
                <option value="">Tất cả</option>
                <option value="true">Đã báo</option>
                <option value="false">Chưa báo</option>
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBulkRemind(true)}>
                📣 Nhắc hàng loạt
              </button>
              <button className="btn btn-primary" onClick={openCreate}>
                ＋ Thêm học phí
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Tổng học phí', val: fmtVND(totalAmount), color: '#3b82f6' },
              { label: 'Đã thu', val: fmtVND(paidAmount), color: '#22c55e' },
              { label: 'Chưa thu', val: fmtVND(unpaidAmount), color: '#f59e0b' },
              { label: 'Chờ xác nhận', val: pendingNotify, color: '#8b5cf6', unit: 'học viên' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, minWidth: 140, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}{s.unit ? ` ${s.unit}` : ''}</div>
              </div>
            ))}
          </div>

          {/* Create/Edit Form */}
          {showForm && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>
                {editFee ? '✏️ Sửa học phí' : isCopy ? '📋 Copy học phí sang tháng tiếp' : '＋ Thêm khoản học phí'}
              </h3>
              <form onSubmit={saveFee} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Student */}
                {/* Copy/Edit mode: show student name (locked). Create mode: show picker */}
                {(editFee || isCopy) ? (
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    Học viên: <span style={{ color: '#3b82f6' }}>
                      {editFee
                        ? (editFee.studentId?.username)
                        : (students.find(s => s._id === formData.studentId)?.username || formData.studentId)}
                    </span>
                    {isCopy && studentUnpaid && (
                      <div style={{ marginTop: 8, padding: '8px 14px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#854d0e' }}>
                        ⚠️ Học viên này đang nợ <strong>{studentUnpaid.count} kỳ</strong>, tổng cộng: <strong>{Number(studentUnpaid.total).toLocaleString('vi-VN')} ₫</strong> chưa đóng.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Học viên *</label>
                    <StudentPicker
                      students={students}
                      value={formData.studentId}
                      onChange={sid => { setFormData(f => ({ ...f, studentId: sid })); fetchStudentUnpaid(sid); }}
                    />
                    {studentUnpaid && (
                      <div style={{ marginTop: 8, padding: '8px 14px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#854d0e' }}>
                        ⚠️ Học viên này đang nợ <strong>{studentUnpaid.count} kỳ</strong>, tổng cộng: <strong>{Number(studentUnpaid.total).toLocaleString('vi-VN')} ₫</strong> chưa đóng.
                      </div>
                    )}
                  </div>
                )}
                {/* Type */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 120 }}>
                    <label className="form-label">Loại học phí *</label>
                    <select className="form-input" value={formData.feeType}
                      onChange={e => setFormData(f => ({ ...f, feeType: e.target.value }))}>
                      <option value="monthly">Hàng tháng</option>
                      <option value="course">Khóa học</option>
                    </select>
                  </div>
                  {formData.feeType === 'monthly' ? (
                    <>
                      <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 100 }}>
                        <label className="form-label">Tháng *</label>
                        <select className="form-input" value={formData.month}
                          onChange={e => setFormData(f => ({ ...f, month: e.target.value }))}>
                          {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 90 }}>
                        <label className="form-label">Năm *</label>
                        <select className="form-input" value={formData.year}
                          onChange={e => setFormData(f => ({ ...f, year: e.target.value }))}>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="form-group" style={{ margin: 0, flex: 2, minWidth: 180 }}>
                      <label className="form-label">Tên khóa học *</label>
                      <input className="form-input" value={formData.courseName} placeholder="VD: IELTS Intensive 6.0"
                        onChange={e => setFormData(f => ({ ...f, courseName: e.target.value }))} required />
                    </div>
                  )}
                  <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 120 }}>
                    <label className="form-label">Số tiền (VND) *</label>
                    <input className="form-input" type="number" value={formData.amount} placeholder="0"
                      onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} required min={0} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Ghi chú</label>
                  <input className="form-input" value={formData.note} placeholder="Ghi chú thêm..."
                    onChange={e => setFormData(f => ({ ...f, note: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Huỷ</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : '💾 Lưu'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>HỌC VIÊN</th>
                  <th>LOẠI</th>
                  <th>KỲ HỌC</th>
                  <th>SỐ TIỀN</th>
                  <th style={{ textAlign: 'center' }}>ĐÃ THU</th>
                  <th style={{ textAlign: 'center' }}>HỌC VIÊN BÁO</th>
                  <th>NGÀY TẠO</th>
                  <th>GHI CHÚ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0
                  ? <tr><td colSpan={9} className="table-empty">Không có dữ liệu</td></tr>
                  : fees.map(f => (
                    <tr key={f._id} style={{ background: f.studentNotified && !f.isPaid ? 'rgba(139,92,246,.06)' : undefined }}>
                      <td>
                        <strong>{f.studentId?.username || '–'}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{f.studentId?.email}</div>
                        {(() => {
                          const sid = f.studentId?._id || f.studentId;
                          const debt = studentDebtMap[sid];
                          return debt > (f.amount || 0) ? (
                            <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 700, marginTop: 2 }}>
                              ⚠️ Tổng nợ: {Number(debt).toLocaleString('vi-VN')} ₫
                            </div>
                          ) : null;
                        })()}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: f.feeType === 'monthly' ? '#eff6ff' : '#f0fdf4', color: f.feeType === 'monthly' ? '#1d4ed8' : '#15803d', fontWeight: 600 }}>
                          {f.feeType === 'monthly' ? '📅 Tháng' : '🎓 Khóa'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{fmtLabel(f)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text1)' }}>{fmtVND(f.amount)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={f.isPaid} onChange={() => togglePaid(f)}
                          style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#22c55e' }} />
                        {f.isPaid && f.paidDate && (
                          <div style={{ fontSize: 10, color: '#22c55e', marginTop: 2 }}>
                            {formatDate(f.paidDate).split(' ')[0]}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {f.studentNotified
                          ? <span title={f.studentNotifiedAt ? formatDate(f.studentNotifiedAt) : ''} style={{ fontSize: 18 }}>✅</span>
                          : <span style={{ color: 'var(--text3)', fontSize: 13 }}>–</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(f.createdAt)}</td>
                      <td style={{ maxWidth: 160, fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.note || '–'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" title="Nhắc nhở" onClick={() => { setRemindFee(f); setRemindMsg(''); }}>📩</button>
                          <button className="btn btn-ghost btn-sm" title="Copy sang tháng tiếp" onClick={() => openCopy(f)}>📋</button>
                          <button className="btn btn-ghost btn-sm" title="Sửa" onClick={() => openEdit(f)}>✏️</button>
                          <button className="btn btn-danger btn-sm" title="Xóa" onClick={() => deleteFee(f._id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Pagination page={page} total={total} pageSize={PAGE} onPage={p => { setPage(p); loadFees(p); }} />
          </div>
        </>
      )}

      {/* ═══════════════ TAB: SUMMARY ═══════════════ */}
      {activeTab === 'summary' && (
        <SummaryTab summary={summary} courseSummary={courseSummary} summaryYear={summaryYear} setSummaryYear={setSummaryYear} />
      )}

      {/* ═══════════════ TAB: SETTINGS ═══════════════ */}
      {activeTab === 'settings' && (
        <SettingsTab
          settings={settings}
          settingsForm={settingsForm}
          setSettingsForm={setSettingsForm}
          savingSettings={savingSettings}
          saveSettings={saveSettings}
          uploadingQr={uploadingQr}
          qrInputRef={qrInputRef}
          uploadQr={uploadQr}
          removeQr={removeQr}
        />
      )}

      {/* ── Remind Modal ── */}
      {remindFee && (
        <RemindModal
          remindFee={remindFee}
          remindMsg={remindMsg}
          setRemindMsg={setRemindMsg}
          sendingRemind={sendingRemind}
          onSend={sendRemind}
          onClose={() => setRemindFee(null)}
        />
      )}

      {/* ── Bulk Remind Modal ── */}
      {showBulkRemind && (
        <BulkRemindModal
          bulkMonth={bulkMonth}
          setBulkMonth={setBulkMonth}
          bulkYear={bulkYear}
          setBulkYear={setBulkYear}
          bulkMsg={bulkMsg}
          setBulkMsg={setBulkMsg}
          sendingBulk={sendingBulk}
          onSend={sendBulkRemind}
          onClose={() => setShowBulkRemind(false)}
        />
      )}
    </>
  );
}
