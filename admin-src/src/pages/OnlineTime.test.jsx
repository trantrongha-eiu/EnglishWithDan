import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const apiFetch = vi.fn();
vi.mock('../utils/api', () => ({ apiFetch: (...a) => apiFetch(...a), formatDate: () => '' }));

import OnlineTime from './OnlineTime';
import { fmtMinutes, fmtDayLabel } from '../utils/onlineTime';

const user = { _id: 'u1', username: 'hoa', firstName: 'Hoa', lastName: 'Lê' };
const trend = Array.from({ length: 7 }, (_, i) => ({ day: `2026-11-0${i + 1}`, activeSeconds: i * 300 }));
const LIST = {
  success: true, day: '2026-11-07', today: '2026-11-07', total: 1, page: 1, limit: 50,
  totals: { students: 1, activeSeconds: 3900, sessions: 2, tabSwitches: 4, idlePauses: 1 },
  students: [{ userId: 'u1', user, activeSeconds: 3900, sessions: 2, tabSwitches: 4, idlePauses: 1,
    firstStart: '2026-11-07T02:00:00Z', lastEnd: '2026-11-07T04:00:00Z', trend }],
};
const DETAIL = {
  success: true, user, today: '2026-11-07', day: '2026-11-07',
  days: Array.from({ length: 14 }, (_, i) => ({ day: i === 0 ? '2026-11-07' : `2026-10-${String(31 - i).padStart(2, '0')}`,
    activeSeconds: i === 0 ? 3900 : 0, sessions: i === 0 ? 2 : 0, tabSwitches: i === 0 ? 4 : 0, idlePauses: i === 0 ? 1 : 0 })),
  sessions: [{ _id: 's1', startedAt: '2026-11-07T02:00:00Z', endedAt: '2026-11-07T03:00:00Z', activeSeconds: 3000,
    tabSwitches: 3, idlePauses: 1, device: 'desktop', pages: ['/reading', '/reading.html', '/listening'],
    breaks: [{ type: 'tab', at: '2026-11-07T02:10:00Z', seconds: 95 }, { type: 'idle', at: '2026-11-07T02:30:00Z', seconds: 400 }] }],
};

describe('OnlineTime', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockImplementation(path => Promise.resolve(path.startsWith('/admin/online-time/') ? DETAIL : LIST));
  });

  it('lists students for the day and opens the session detail', async () => {
    render(<MemoryRouter><OnlineTime /></MemoryRouter>);
    expect(await screen.findByText('Hoa Lê')).toBeTruthy();
    expect(screen.getAllByText('1 giờ 5 phút').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('📊 Chi tiết'));
    expect(await screen.findByText('Phiên 1')).toBeTruthy();
    expect(screen.getByText(/Trang đã mở: Reading, Listening/)).toBeTruthy();
    fireEvent.click(screen.getByText(/2 lần gián đoạn/));
    await waitFor(() => expect(screen.getByText(/Rời trang/)).toBeTruthy());
    expect(screen.getByText('1 phút 35 giây')).toBeTruthy();
    expect(apiFetch.mock.calls.some(([p]) => p.startsWith('/admin/online-time/u1?days=14&day=2026-11-07'))).toBe(true);
  });
});

describe('onlineTime format helpers', () => {
  it('formats minutes and day labels', () => {
    expect(fmtMinutes(0)).toBe('0 phút');
    expect(fmtMinutes(20)).toBe('< 1 phút');
    expect(fmtMinutes(600)).toBe('10 phút');
    expect(fmtMinutes(7200)).toBe('2 giờ');
    expect(fmtDayLabel('2026-11-07')).toBe('T7 07/11');
  });
});
