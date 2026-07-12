// Extracted from Tuition.jsx — the "Thống kê" tab. Purely presentational:
// reads only the summary/courseSummary/summaryYear props, no coupling to
// the fees-tab or settings-tab state.
import { MONTHS, YEARS, fmtVND } from './helpers';

export default function SummaryTab({ summary, courseSummary, summaryYear, setSummaryYear }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <label style={{ fontWeight: 600 }}>Năm:</label>
        <select className="form-input" style={{ width: 100 }} value={summaryYear}
          onChange={e => setSummaryYear(e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>📅 Theo tháng ({summaryYear})</h3>
      <div className="table-wrap" style={{ marginBottom: 28 }}>
        <table className="table">
          <thead>
            <tr><th>THÁNG</th><th>TỔNG HỌC PHÍ</th><th>ĐÃ THU</th><th>CHƯA THU</th><th>SL HỌC VIÊN</th><th>ĐÃ ĐÓNG</th><th>CHƯA ĐÓNG</th><th>CHỜ XN</th></tr>
          </thead>
          <tbody>
            {summary.length === 0
              ? <tr><td colSpan={8} className="table-empty">Không có dữ liệu</td></tr>
              : summary.map(s => (
                <tr key={`${s._id.year}-${s._id.month}`}>
                  <td style={{ fontWeight: 700 }}>{MONTHS[s._id.month]}/{s._id.year}</td>
                  <td style={{ fontWeight: 700, color: '#3b82f6' }}>{fmtVND(s.totalAmount)}</td>
                  <td style={{ color: '#22c55e', fontWeight: 600 }}>{fmtVND(s.paidAmount)}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 600 }}>{fmtVND(s.unpaidAmount)}</td>
                  <td>{s.totalCount}</td>
                  <td>{s.paidCount}</td>
                  <td>{s.unpaidCount}</td>
                  <td>
                    {s.pendingNotify > 0
                      ? <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{s.pendingNotify}</span>
                      : '–'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {courseSummary.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🎓 Theo khóa học</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>KHÓA HỌC</th><th>TỔNG HỌC PHÍ</th><th>ĐÃ THU</th><th>SL</th><th>ĐÃ ĐÓNG</th></tr>
              </thead>
              <tbody>
                {courseSummary.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s._id}</td>
                    <td style={{ fontWeight: 700, color: '#3b82f6' }}>{fmtVND(s.totalAmount)}</td>
                    <td style={{ color: '#22c55e', fontWeight: 600 }}>{fmtVND(s.paidAmount)}</td>
                    <td>{s.totalCount}</td>
                    <td>{s.paidCount}/{s.totalCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
