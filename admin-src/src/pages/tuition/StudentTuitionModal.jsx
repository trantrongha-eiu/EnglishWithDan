import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../components/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { MONTHS, CUR_YEAR, CUR_MONTH, YEARS, fmtVND, fmtLabel } from './helpers';

// Học phí of ONE student, opened from the "💰 Học phí" button on
// StudentDetail — list (thu / bỏ thu / xoá) + add, without leaving the
// profile for /tuition and re-finding the student in the picker. Monthly
// fees take a "số tháng": the server creates one record per month
// (createMonthlyFees) and the form shows the multiplied total up front.

function addMonths(month, year, n) {
  const idx = (Number(year) * 12 + Number(month) - 1) + n;
  return { month: (idx % 12) + 1, year: Math.floor(idx / 12) };
}

export default function StudentTuitionModal({ user, initialPeriod, onClose, onSaved }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [fees, setFees] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    feeType: 'monthly',
    month: String(initialPeriod?.month || CUR_MONTH), year: String(initialPeriod?.year || CUR_YEAR),
    monthCount: '1', courseName: '', amount: '', note: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    load();
    // Prefill the per-month price from Cài đặt ngân hàng → học phí mặc định.
    apiFetch('/tuition/settings')
      .then(d => { if (d.settings?.defaultMonthlyFee) setForm(f => (f.amount ? f : { ...f, amount: String(d.settings.defaultMonthlyFee) })); })
      .catch(() => {});
  }, []);

  async function load() {
    try {
      const d = await apiFetch(`/tuition?studentId=${user._id}&limit=200`);
      setFees(d.fees || []);
    } catch (e) { toast(e.message, 'error'); setFees([]); }
  }

  const monthly = form.feeType === 'monthly';
  const count = monthly ? Math.min(24, Math.max(1, Math.floor(Number(form.monthCount) || 1))) : 1;
  const amount = Number(form.amount) || 0;
  const last = addMonths(form.month, form.year, count - 1);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const d = await apiFetch('/tuition', {
        method: 'POST',
        body: JSON.stringify({ ...form, studentId: user._id, amount, monthCount: count }),
      });
      if (d.skipped?.length) {
        toast(`Đã thêm ${d.fees.length} tháng · bỏ qua ${d.skipped.map(p => `${p.month}/${p.year}`).join(', ')} (đã có)`);
      } else {
        toast(count > 1 ? `Đã thêm ${count} tháng học phí` : 'Đã thêm học phí');
      }
      setForm(f => ({ ...f, courseName: '', note: '', monthCount: '1' }));
      load(); onSaved?.();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function togglePaid(fee) {
    try {
      await apiFetch(`/tuition/${fee._id}`, { method: 'PUT', body: JSON.stringify({ isPaid: !fee.isPaid }) });
      load(); onSaved?.();
    } catch (e) { toast(e.message, 'error'); }
  }

  function remove(fee) {
    confirm(`Xóa học phí ${fmtLabel(fee)}?`, async () => {
      try {
        await apiFetch(`/tuition/${fee._id}`, { method: 'DELETE' });
        toast('Đã xóa');
        load(); onSaved?.();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  const unpaid = (fees || []).filter(f => !f.isPaid);
  const unpaidTotal = unpaid.reduce((s, f) => s + (f.amount || 0), 0);

  return (
    <Modal title={`💰 Học phí — ${user.username}`} onClose={onClose} width={640} busy={saving}>
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 120 }}>
            <label className="form-label">Loại học phí</label>
            <select className="form-input" value={form.feeType} onChange={e => set('feeType', e.target.value)}>
              <option value="monthly">Hàng tháng</option>
              <option value="course">Khóa học</option>
            </select>
          </div>
          {monthly ? (
            <>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 100 }}>
                <label className="form-label">Từ tháng</label>
                <select className="form-input" value={form.month} onChange={e => set('month', e.target.value)}>
                  {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 80 }}>
                <label className="form-label">Năm</label>
                <select className="form-input" value={form.year} onChange={e => set('year', e.target.value)}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 80 }}>
                <label className="form-label">Số tháng</label>
                <input className="form-input" type="number" min={1} max={24} value={form.monthCount}
                  onChange={e => set('monthCount', e.target.value)} required />
              </div>
            </>
          ) : (
            <div className="form-group" style={{ margin: 0, flex: 2, minWidth: 180 }}>
              <label className="form-label">Tên khóa học</label>
              <input className="form-input" value={form.courseName} placeholder="VD: IELTS Intensive 6.0"
                onChange={e => set('courseName', e.target.value)} required />
            </div>
          )}
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 130 }}>
            <label className="form-label">{monthly ? 'Học phí / tháng (VND)' : 'Số tiền (VND)'}</label>
            <input className="form-input" type="number" min={0} value={form.amount} placeholder="0"
              onChange={e => set('amount', e.target.value)} required />
          </div>
        </div>
        <input className="form-input" value={form.note} placeholder="Ghi chú (không bắt buộc)" onChange={e => set('note', e.target.value)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {monthly && (
            <div style={{ fontSize: 13 }}>
              {count > 1 && <span className="muted">{MONTHS[form.month]}/{form.year} → {MONTHS[last.month]}/{last.year} · {count} × {fmtVND(amount)} = </span>}
              <strong style={{ color: 'var(--blue)', fontSize: 15 }}>Tổng {fmtVND(amount * count)}</strong>
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginLeft: 'auto' }}>
            {saving ? 'Đang lưu…' : count > 1 ? `＋ Thêm ${count} tháng` : '＋ Thêm học phí'}
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div className="panel-title">Các khoản học phí</div>
        {fees && (unpaid.length
          ? <span style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>Chưa đóng: {unpaid.length} khoản · {fmtVND(unpaidTotal)}</span>
          : <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Không nợ</span>)}
      </div>
      <div className="table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
        <table className="table">
          <thead><tr><th>Kỳ</th><th>Số tiền</th><th style={{ textAlign: 'center' }}>Đã thu</th><th style={{ textAlign: 'center' }}>HV báo</th><th></th></tr></thead>
          <tbody>
            {fees === null
              ? <tr><td colSpan={5} className="table-empty">Đang tải…</td></tr>
              : fees.length === 0
                ? <tr><td colSpan={5} className="table-empty">Chưa có khoản học phí nào</td></tr>
                : fees.map(f => (
                  <tr key={f._id}>
                    <td style={{ fontWeight: 600 }}>
                      {f.feeType === 'monthly' ? '📅 ' : '🎓 '}{fmtLabel(f)}
                      {f.note && <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 400 }}>{f.note}</div>}
                    </td>
                    <td style={{ fontWeight: 700 }}>{fmtVND(f.amount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={f.isPaid} onChange={() => togglePaid(f)} aria-label={`Đã thu ${fmtLabel(f)}`}
                        style={{ width: 17, height: 17, cursor: 'pointer', accentColor: 'var(--green)' }} />
                      {f.isPaid && f.paidDate && <div style={{ fontSize: 10, color: 'var(--green)' }}>{formatDate(f.paidDate).split(' ')[0]}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>{f.studentNotified ? '✅' : <span className="muted">–</span>}</td>
                    <td><button type="button" className="btn btn-ghost btn-sm" title="Xóa" onClick={() => remove(f)}>🗑</button></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
