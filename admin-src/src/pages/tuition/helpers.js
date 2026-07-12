// Extracted from Tuition.jsx — pure constants and formatters with no
// component state, usable independently of the page.

export const PAGE = 30;
export const MONTHS = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
export const CUR_YEAR  = new Date().getFullYear();
export const CUR_MONTH = new Date().getMonth() + 1;
export const YEARS = Array.from({ length: 5 }, (_, i) => CUR_YEAR - 2 + i);

export function fmtVND(n) {
  return Number(n || 0).toLocaleString('vi-VN') + ' ₫';
}
export function fmtLabel(fee) {
  if (fee.feeType === 'monthly') return `${MONTHS[fee.month] || fee.month}/${fee.year}`;
  return fee.courseName || '(Khóa học)';
}
