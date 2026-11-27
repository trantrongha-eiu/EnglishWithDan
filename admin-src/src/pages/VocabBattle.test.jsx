import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const apiFetch = vi.fn();
const toast = vi.fn();
vi.mock('../utils/api', () => ({ apiFetch: (...a) => apiFetch(...a), formatDate: () => '', FRONTEND_URL: 'https://x.test' }));
vi.mock('../contexts/ToastContext', () => ({ useToast: () => toast }));
vi.mock('../components/ConfirmDialog', () => ({ useConfirm: () => (msg, fn) => fn() }));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { role: 'admin' } }) }));

import VocabBattle from './VocabBattle';

const OVERVIEW = {
  success: true, enabled: false, counts: { open: 1, playing: 0, done: 3, cancelled: 0 },
  week: { rooms: { quiz: 3, chain: 1, solo: 2 }, players: 4, stakedRooms: 1, pot: 20, rated: 2 },
  days: Array.from({ length: 14 }, (_, i) => ({ day: `2026-11-${String(i + 10).padStart(2, '0')}`, quiz: i % 3, chain: i % 2 })),
};
const BATTLES = {
  success: true, total: 1, page: 1, limit: 30,
  battles: [{ id: 'b1', kind: 'quiz', solo: false, stake: 10, pot: 20, status: 'open', rated: false, game: '10 câu: Nghĩa của từ',
    source: 'Tất cả', lessonTitle: '', createdAt: '', total: 10,
    players: [{ id: 'u1', name: 'An', state: 'joined', score: 500, answered: 5, reward: 0 }, { id: 'u2', name: 'Bình', state: 'invited', score: 0, answered: 0 }] }],
};
const BANK = {
  success: true,
  stats: { pictures: 717, antonyms: 384, chain: { accepted: 184756, lulu: 8921 }, sources: {} },
  sources: [{ key: 'pictures', label: 'Từ có hình ảnh', types: ['image'], words: 599 }],
  battleSets: [{ kind: 'dict', set: 'adj-01', title: 'Từ điển mở – Tính từ 1', count: 250, hidden: 0, ai: 12 }],
};
const WORDS = {
  success: true, total: 1, page: 1, limit: 50,
  words: [{ id: 'w1', kind: 'dict', word: 'fragile', meaning: 'dễ vỡ', pos: 'adj', set: 'adj-01', setTitle: 'Từ điển mở – Tính từ 1',
    imageUrl: '', example: 'Be careful with the fragile glasses.', near: [], ant: 'sturdy', origin: 'ai', hidden: false, edited: false }],
};
const CHAIN = { success: true, total: 1, page: 1, limit: 50, counts: { players: 1, all: 11933 }, blocked: ['yobbo'],
  words: [{ w: 'website', pos: 'noun', def: 'A collection of pages', source: 'player', createdAt: '' }] };
const SETTINGS = {
  success: true,
  settings: { enabled: true, limits: { meaning: 15, spell: 25 }, disabledTypes: [], disabledSources: [], blockedWords: [],
    minStake: 5, maxStake: 100, maxOpen: 5, inviteHours: 24, friendlyWinFlames: 3, friendlyDailyWins: 3, speedBonus: 50,
    chainBankBonus: 10, chainSurvivorBonus: 30, botFailBase: 4, botFailPerWord: 2 },
  defaults: { limits: { meaning: 15, spell: 25 }, minStake: 5, maxStake: 100, maxOpen: 5, inviteHours: 24, friendlyWinFlames: 3,
    friendlyDailyWins: 3, speedBonus: 50, chainBankBonus: 10, chainSurvivorBonus: 30, botFailBase: 4, botFailPerWord: 2 },
  ranges: { minStake: [1, 1000], maxStake: [1, 10000], maxOpen: [1, 20], inviteHours: [1, 168], friendlyWinFlames: [0, 50],
    friendlyDailyWins: [0, 50], speedBonus: [0, 500], chainBankBonus: [0, 100], chainSurvivorBonus: [0, 500], botFailBase: [0, 50], botFailPerWord: [0, 20] },
  limitRange: [5, 120],
  types: [{ key: 'meaning', label: 'Nghĩa của từ' }, { key: 'spell', label: 'Nghe & gõ từ' }],
  sources: [{ key: 'pictures', label: 'Từ có hình ảnh' }],
};

function route(path) {
  if (path.startsWith('/admin/vocab-battle/overview')) return OVERVIEW;
  if (path.startsWith('/admin/vocab-battle/battles?')) return BATTLES;
  if (path.startsWith('/admin/vocab-battle/bank')) return BANK;
  if (path.startsWith('/admin/vocab-battle/words?')) return WORDS;
  if (path.startsWith('/admin/vocab-battle/chain-words?')) return CHAIN;
  if (path.startsWith('/admin/vocab-battle/settings')) return SETTINGS;
  return { success: true };
}
const page = (tab) => render(<MemoryRouter initialEntries={[`/vocab-battle${tab ? `?tab=${tab}` : ''}`]}><VocabBattle /></MemoryRouter>);

describe('VocabBattle admin page', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    toast.mockReset();
    apiFetch.mockImplementation((path) => Promise.resolve(route(path)));
  });

  it('overview: closed notice, counts, rooms; stopping a room calls cancel', async () => {
    page('');
    expect(await screen.findByText(/đang/, { selector: 'div.hint-box' })).toBeTruthy();
    expect(await screen.findByText('An')).toBeTruthy();
    fireEvent.click(screen.getByText('⛔ Dừng'));
    await waitFor(() => expect(apiFetch.mock.calls.some(([p, o]) => p === '/admin/vocab-battle/battles/b1/cancel' && o.method === 'POST')).toBe(true));
  });

  it('Kho từ: lists words with their origin and edits one', async () => {
    page('words');
    expect(await screen.findByText('fragile')).toBeTruthy();
    expect(screen.getByText('AI — nên xem')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Sửa fragile'));
    const input = await screen.findByDisplayValue('dễ vỡ');
    fireEvent.change(input, { target: { value: 'mỏng manh' } });
    fireEvent.click(screen.getByText('Lưu'));
    await waitFor(() => expect(apiFetch.mock.calls.some(([p, o]) => p === '/admin/vocab-battle/words/w1' && o.method === 'PUT'
      && JSON.parse(o.body).meaning === 'mỏng manh')).toBe(true));
  });

  it('Nối chữ: lists player finds and blocks a word', async () => {
    page('chain');
    expect(await screen.findByText('website')).toBeTruthy();
    expect(screen.getByText('yobbo')).toBeTruthy();
    fireEvent.click(screen.getByText('🚫 Chặn'));
    await waitFor(() => expect(apiFetch.mock.calls.some(([p, o]) => p === '/admin/vocab-battle/chain-words/block'
      && JSON.parse(o.body).w === 'website')).toBe(true));
  });

  it('Cài đặt: saves only what changed form-wide, without the blocked list', async () => {
    page('settings');
    const save = await screen.findByText('Lưu cài đặt');
    expect(save.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('Bật Nghe & gõ từ'));
    fireEvent.change(screen.getByLabelText('Giây cho Nghĩa của từ'), { target: { value: '20' } });
    expect(save.disabled).toBe(false);
    fireEvent.click(save);
    await waitFor(() => {
      const call = apiFetch.mock.calls.find(([p, o]) => p === '/admin/vocab-battle/settings' && o?.method === 'PUT');
      expect(call).toBeTruthy();
      const body = JSON.parse(call[1].body);
      expect(body.disabledTypes).toEqual(['spell']);
      expect(body.limits.meaning).toBe(20);
      expect(body).not.toHaveProperty('blockedWords');
    });
  });
});
