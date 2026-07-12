'use strict';

const courseService = require('../../../services/courseService');
const { createCourse } = require('../../factories/contentFactory');

describe('courseService.listActiveCourses', () => {
  it('returns only isActive:true courses', async () => {
    await createCourse({ title: 'Active Course', isActive: true, order: 1 });
    await createCourse({ title: 'Inactive Course', isActive: false, order: 0 });

    const courses = await courseService.listActiveCourses();
    expect(courses).toHaveLength(1);
    expect(courses[0].title).toBe('Active Course');
  });

  it('sorts by order ascending, then createdAt ascending', async () => {
    const c3 = await createCourse({ title: 'Order 2', isActive: true, order: 2 });
    const c1 = await createCourse({ title: 'Order 0', isActive: true, order: 0 });
    const c2 = await createCourse({ title: 'Order 1', isActive: true, order: 1 });

    const courses = await courseService.listActiveCourses();
    expect(courses.map(c => c.title)).toEqual(['Order 0', 'Order 1', 'Order 2']);
    // sanity check the created docs actually persisted with expected order values
    expect([c1.order, c2.order, c3.order]).toEqual([0, 1, 2]);
  });

  it('sorts by createdAt when order values tie', async () => {
    const first = await createCourse({ title: 'First Created', isActive: true, order: 5 });
    // small delay to guarantee a distinct createdAt ordering
    await new Promise(r => setTimeout(r, 10));
    const second = await createCourse({ title: 'Second Created', isActive: true, order: 5 });

    const courses = await courseService.listActiveCourses();
    expect(courses.map(c => c.title)).toEqual(['First Created', 'Second Created']);
    expect(first.createdAt.getTime()).toBeLessThanOrEqual(second.createdAt.getTime());
  });
});
