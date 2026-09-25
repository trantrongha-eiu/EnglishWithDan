import { describe, it, expect } from 'vitest';
import { NAV_GROUPS, isItemActive, routeTitle } from './navConfig';

const item = to => NAV_GROUPS.flatMap(g => g.items).find(i => i.to === to);

describe('navConfig', () => {
  it('tells the three /wt1-course entries apart by ?course=', () => {
    const t1 = item('/wt1-course');
    const t2 = item('/wt1-course?course=IELTS-W-T2');
    const spk = item('/wt1-course?course=IELTS-SPEAKING');
    expect(isItemActive(t1, '/wt1-course', '')).toBe(true);
    expect(isItemActive(t2, '/wt1-course', '')).toBe(false);
    expect(isItemActive(t1, '/wt1-course', '?course=IELTS-W-T2')).toBe(false);
    expect(isItemActive(t2, '/wt1-course', '?course=IELTS-W-T2')).toBe(true);
    expect(isItemActive(spk, '/wt1-course', '?course=IELTS-SPEAKING')).toBe(true);
  });

  it('highlights hub items for their sub-routes', () => {
    expect(isItemActive(item('/users'), '/students/abc', '')).toBe(true);
    expect(isItemActive(item('/monitoring'), '/reading-stats', '')).toBe(true);
    expect(isItemActive(item('/reading-tests'), '/reading-tests/123', '')).toBe(true);
    expect(isItemActive(item('/dashboard'), '/users', '')).toBe(false);
  });

  it('derives page title + group, including non-sidebar routes', () => {
    expect(routeTitle('/users')).toEqual({ title: 'Người dùng', group: 'Học sinh' });
    expect(routeTitle('/wt1-course', '?course=IELTS-SPEAKING').title).toBe('Khoá Speaking');
    expect(routeTitle('/students/abc').title).toBe('Chi tiết học sinh');
    expect(routeTitle('/nope').title).toBe('Admin');
  });

  it('marks the finance pages admin-only', () => {
    expect(item('/tuition').adminOnly).toBe(true);
    expect(item('/upgrade-requests').adminOnly).toBe(true);
    expect(item('/users').adminOnly).toBeFalsy();
  });
});
