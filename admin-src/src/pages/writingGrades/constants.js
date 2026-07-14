export const PAGE = 30;

export const STATUS = {
  pending:   { label: 'Chờ chấm',      cls: 'badge-red'   },
  ai_done:   { label: 'AI đã chấm',    cls: 'badge-blue'  },
  confirmed: { label: 'Đã xác nhận',   cls: 'badge-green' },
};

export const EMPTY_MANUAL = () => ({
  bandScore: '',
  ta:  { score: '', comment: '' },
  cc:  { score: '', comment: '' },
  lr:  { score: '', comment: '' },
  gra: { score: '', comment: '' },
  overallFeedback: ''
});
