import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const apiFetch = vi.fn();
const toast = vi.fn();
vi.mock('../../utils/api', () => ({ apiFetch: (...a) => apiFetch(...a) }));
vi.mock('../../contexts/ToastContext', () => ({ useToast: () => toast }));

import CustomWritingExamBuilder from './CustomWritingExamBuilder';

const T1 = [
  { _id: 'a1', label: 'The table and line graph show energy use', meta: 'Mixed charts', chartType: 'mixed', imageUrl: '' },
  { _id: 'a2', label: 'The map shows a town centre', meta: 'Map', chartType: 'map', imageUrl: '' },
];
const T2 = [
  { _id: 'b1', label: 'Traffic congestion is a problem. Why? Solutions?', meta: 'Cause & Solution', t2Type: 'type03' },
  { _id: 'b2', label: 'Some people think children should…', meta: 'Agree / Disagree', t2Type: 'type06' },
];

describe('CustomWritingExamBuilder', () => {
  beforeEach(() => {
    apiFetch.mockReset();
    toast.mockReset();
    apiFetch.mockImplementation((path) => {
      if (path.includes('type=task1_practice')) return Promise.resolve({ items: T1 });
      if (path.includes('type=task2_practice')) return Promise.resolve({ items: T2 });
      return Promise.resolve({ exam: { _id: 'e1', label: 'Writing – Mixed Charts + Cause & Solution', meta: '🧩 Tự ghép', isCustom: true } });
    });
  });

  it('filters by dạng đề, pairs one Task 1 + one Task 2 and posts them', async () => {
    const onCreated = vi.fn();
    render(<CustomWritingExamBuilder onCreated={onCreated} />);
    expect(await screen.findByText(T1[0].label)).toBeTruthy();
    expect(screen.getByText(T2[0].label)).toBeTruthy();

    const create = screen.getByRole('button', { name: /Ghép đề/ });
    expect(create.disabled).toBe(true);

    // Task 1 "Dạng đề" = Mixed charts hides the map prompt
    fireEvent.change(screen.getAllByTitle('Lọc theo dạng đề')[0], { target: { value: 'mixed' } });
    expect(screen.queryByText(T1[1].label)).toBeNull();

    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]); // Task 1 a1
    fireEvent.click(radios[1]); // Task 2 b1
    expect(screen.getByPlaceholderText(/Writing – Mixed Charts \+ Cause & Solution/)).toBeTruthy();

    fireEvent.click(create);
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ _id: 'e1' })));
    const post = apiFetch.mock.calls.find(([p]) => p === '/classes/resources/writing-exams/custom');
    expect(JSON.parse(post[1].body)).toEqual({ task1Id: 'a1', task2Id: 'b1', name: 'Writing – Mixed Charts + Cause & Solution' });
  });
});
