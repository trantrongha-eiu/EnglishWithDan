import { describe, it, expect } from 'vitest';
import { NAV_GROUPS, isItemActive, routeTitle } from './navConfig';

const item = to => NAV_GROUPS.flatMap(g => g.items).find(i => i.to === to);

describe('navConfig', () => {
  it('tells the /wt1-course entries apart by ?course=', () => {
    const t1 = item('/wt1-course');
    const t2 = item('/wt1-course?course=IELTS-W-T2');
    const spk = item('/wt1-course?course=IELTS-SPEAKING');
    const m0 = item('/wt1-course?course=MINDSET-0');
    expect(isItemActive(t1, '/wt1-course', '')).toBe(true);
    expect(isItemActive(t2, '/wt1-course', '')).toBe(false);
    expect(isItemActive(t1, '/wt1-course', '?course=IELTS-W-T2')).toBe(false);
    expect(isItemActive(t2, '/wt1-course', '?course=IELTS-W-T2')).toBe(true);
    expect(isItemActive(spk, '/wt1-course', '?course=IELTS-SPEAKING')).toBe(true);
    expect(isItemActive(m0, '/wt1-course', '?course=MINDSET-0')).toBe(true);
    expect(isItemActive(t1, '/wt1-course', '?course=MINDSET-0')).toBe(false);
  });

  it('splits one page into per-skill / per-tab entries by query', () => {
    expect(isItemActive(item('/tips'), '/tips', '')).toBe(true);
    expect(isItemActive(item('/tips'), '/tips', '?skill=writing')).toBe(false);
    expect(isItemActive(item('/tips?skill=writing'), '/tips', '?skill=writing')).toBe(true);
    expect(isItemActive(item('/writing-tests'), '/writing-tests', '?tab=task1')).toBe(false);
    expect(isItemActive(item('/writing-tests?tab=task1'), '/writing-tests', '?tab=task1')).toBe(true);
    expect(isItemActive(item('/speaking'), '/speaking', '?tab=history')).toBe(true);
    expect(isItemActive(item('/speaking?tab=materials'), '/speaking', '?tab=materials')).toBe(true);
    expect(isItemActive(item('/shop'), '/shop', '?tab=shop')).toBe(false);
    expect(routeTitle('/tips', '?skill=speaking')).toEqual({ title: 'Speaking Tips', group: 'Speaking' });
  });

  it('highlights hub items for their sub-routes', () => {
    expect(isItemActive(item('/users'), '/students/abc', '')).toBe(true);
    expect(isItemActive(item('/monitoring'), '/reading-stats', '')).toBe(true);
    expect(isItemActive(item('/reading-tests'), '/reading-tests/123', '')).toBe(true);
    expect(isItemActive(item('/speaking'), '/speaking/import', '')).toBe(true);
    expect(isItemActive(item('/speaking'), '/speaking-part2', '')).toBe(false);
    expect(isItemActive(item('/dashboard'), '/users', '')).toBe(false);
  });

  it('derives page title + group, including non-sidebar routes', () => {
    expect(routeTitle('/users')).toEqual({ title: 'Người dùng', group: 'Học sinh & Lớp' });
    expect(routeTitle('/wt1-course', '?course=IELTS-SPEAKING').title).toBe('Khóa học Speaking');
    expect(routeTitle('/task1-exercises')).toEqual({ title: 'Task 1 Grammar', group: 'Ngữ pháp & Viết câu' });
    expect(routeTitle('/students/abc').title).toBe('Chi tiết học sinh');
    expect(routeTitle('/listening-sections/x')).toEqual({ title: 'Chỉnh sửa bài lẻ Listening', group: 'Listening' });
    expect(routeTitle('/nope').title).toBe('Admin');
  });

  it('uses the student-menu names (frontend/js/nav.js) for the pages they manage', () => {
    const labels = NAV_GROUPS.flatMap(g => g.items).map(i => i.label);
    for (const name of ['Task 2 Luyện đề tuần', 'Task 2 Templates', 'Essential Grammar', 'Task 1 Grammar', 'Viết câu giao tiếp',
      'Speaking forecast', 'Part 2 · 7 câu chuyện gốc', 'Shadowing (Video)', 'Học Paraphrase', 'Học Vocab Topics',
      'Mindset Foundation', 'Mindset Level 1', 'Mindset Level 2', 'Test đầu vào', 'Full Mock Test', 'Bảng xếp hạng', 'Cửa hàng lửa']) {
      expect(labels).toContain(name);
    }
    expect(labels.some(l => /\(cũ\)/.test(l))).toBe(false);
  });

  it('has unique routes and group ids', () => {
    const tos = NAV_GROUPS.flatMap(g => g.items).map(i => i.to);
    expect(new Set(tos).size).toBe(tos.length);
    const ids = NAV_GROUPS.map(g => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks the finance pages admin-only', () => {
    expect(item('/tuition').adminOnly).toBe(true);
    expect(item('/upgrade-requests').adminOnly).toBe(true);
    expect(item('/users').adminOnly).toBeFalsy();
  });
});
