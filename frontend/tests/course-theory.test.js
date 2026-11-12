/**
 * Lesson theory cards ("📘 Lý thuyết", js/shared/course-engine.js
 * renderTheory). Task 1 / Task 2 / Speaking lessons carry cards copied from
 * the printed books (backend/scripts/bookTheory/buildBookTheory.js) as ordered
 * blocks — headings, boxes, tables, pictures; Mindset / Task 2 Phần C keep the
 * hand-written formula / usage / examples / notes cards.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', '..', 'backend', 'scripts', 'data');
const lessonsOf = (dir) => fs.readdirSync(path.join(DATA, dir))
  .filter((f) => /^lessons.*\.json$/.test(f))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(DATA, dir, f), 'utf8')).lessons || []);

let renderTheory;
beforeAll(() => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'js', 'shared', 'course-engine.js'), 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code);
  renderTheory = window.CourseEngine.renderTheory;
});

const dom = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d; };

describe('book cards render in book order', () => {
  test('boxes, tables, examples, translations and pictures', () => {
    const html = renderTheory([{
      src: 'book', title: '2.1. Ba loại dữ liệu chính', titleEn: '',
      blocks: [
        { k: 'h', t: '**1. Dữ liệu đếm được**' },
        { k: 'box', tone: 'formula', t: '🧩 Cấu trúc', lines: ['**The number of + plural noun + verb**'] },
        { k: 'p', lines: ['▸ The number of users was 5 million.', '→ Số lượng người dùng là 5 triệu.', '• một ý', '✘ the number of water', '✔ the amount of water'] },
        { k: 'table', rows: [['**A**', 'B'], ['x\ny', '<script>']] },
        { k: 'img', url: 'https://media.example/x.png', caption: 'Hình 1' },
        { k: 'box', tone: 'warn', t: 'LỖI THƯỜNG GẶP', lines: ['đừng'] },
      ],
    }]);
    const d = dom(html);
    expect(d.querySelector('.t1-theory-src')).not.toBeNull();
    const body = d.querySelector('.bk');
    const kinds = [...body.children].map((c) => c.className.split(' ')[0]);
    expect(kinds).toEqual(['bk-h', 'bk-box', 'bk-p', 'bk-tbl', 'bk-img', 'bk-box']);
    expect(body.querySelector('.bk-formula .bk-box-t').textContent).toBe('🧩 Cấu trúc');
    expect(body.querySelector('.bk-warn .bk-box-t').textContent).toBe('⚠️ LỖI THƯỜNG GẶP');
    expect(body.querySelector('.bk-ex').textContent).toContain('The number of users');
    expect(body.querySelector('.bk-tr').textContent).toContain('Số lượng');
    expect(body.querySelector('.bk-li').textContent).toBe('một ý');
    expect(body.querySelector('.bk-bad')).not.toBeNull();
    expect(body.querySelector('.bk-ok')).not.toBeNull();
    expect(body.querySelectorAll('th')).toHaveLength(2);
    expect(body.querySelector('td').innerHTML).toBe('x<br>y');
    expect(body.querySelector('script')).toBeNull(); // escaped
    expect(body.querySelector('.bk-img img').getAttribute('src')).toBe('https://media.example/x.png');
    expect(body.querySelector('figcaption').textContent).toBe('Hình 1');
  });

  test('hand-written cards keep the formula / usage / examples / notes layout', () => {
    const d = dom(renderTheory([{ title: 'Câu phức', formula: ['**Although** + S + V'], usage: ['u'], examples: [{ en: 'e', vi: 'v' }], notes: ['n'] }]));
    expect(d.querySelector('.bk')).toBeNull();
    expect(d.querySelector('.t1-th-formula b').textContent).toBe('Although');
    expect(d.querySelectorAll('.t1-th-sec')).toHaveLength(4);
    expect(d.querySelector('.t1-theory-src')).toBeNull();
  });
});

describe('course data (Task 1, Task 2, Speaking) has the book theory', () => {
  const courses = {
    writingTask1: /^T1-L\d\d[A-Z]?$/,
    writingTask2: /^T2-L(0[1-9]|1[0-8])$/,
    speakingCourse: /^SPK-P\d-L\d\d$/,
  };
  for (const [dir, re] of Object.entries(courses)) {
    test(`${dir}: every taught lesson has theory cards that render`, () => {
      const lessons = lessonsOf(dir).filter((l) => re.test(l.code) && !(dir !== 'speakingCourse' && l.isTest));
      expect(lessons.length).toBeGreaterThan(10);
      for (const l of lessons) {
        const cards = l.theory || [];
        expect([l.code, cards.length > 0]).toEqual([l.code, true]);
        const d = dom(renderTheory(cards));
        expect(d.querySelectorAll('.t1-th')).toHaveLength(cards.length);
        for (const c of cards.filter((x) => x.src === 'book')) {
          expect(c.blocks.length).toBeGreaterThan(0);
          for (const b of c.blocks) {
            expect(['h', 'p', 'box', 'table', 'img']).toContain(b.k);
            if (b.k === 'img') expect(b.url).toMatch(/^https:\/\//);
            // no unbalanced bold markers left in the text
            for (const line of [b.t || '', ...(b.lines || []), ...(b.rows || []).flat()]) {
              expect([l.code, (String(line).match(/\*\*/g) || []).length % 2]).toEqual([l.code, 0]);
            }
          }
        }
      }
    });
  }
});
