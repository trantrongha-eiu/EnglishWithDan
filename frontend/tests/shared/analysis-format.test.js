'use strict';

const { loadScript } = require('../helpers/loadScript');

beforeAll(() => {
  loadScript('analysis-format.js');
});

function render(text) {
  const div = document.createElement('div');
  div.innerHTML = window.AnalysisFormat.html(text);
  return div;
}

describe('AnalysisFormat.html', () => {
  test('heading + English line → heading and labelled model sentence', () => {
    const div = render('Topic sentence:\nLondon recorded by far the highest number of sales.');
    expect(div.querySelector('.an-head--topic').textContent).toBe('Topic sentence');
    const model = div.querySelector('.an-model--topic');
    expect(model.textContent).toBe('London recorded by far the highest number of sales.');
    expect(model.dataset.label).toBe('Topic');
  });

  test('overview / thesis headings pick their own role', () => {
    expect(render('Cấu trúc Overview:\nOverall, sales rose in most cities.').querySelector('.an-model--overview')).not.toBeNull();
    expect(render('Thesis statement (mở bài):\nI believe this trend is harmful.').querySelector('.an-model--thesis')).not.toBeNull();
  });

  test('Vietnamese bullets keep CAPS emphasis, figures and a bold key', () => {
    const div = render('- London: CAO NHẤT cả 2 năm (550→1650, gấp 3 lần)');
    const li = div.querySelector('.an-list--bullet li');
    expect(li.querySelector('.an-key').textContent).toBe('London');
    expect(li.querySelector('.an-em').textContent).toBe('CAO NHẤT');
    expect(li.querySelector('.an-num').textContent).toBe('550→1650');
  });

  test('lowercase Vietnamese and acronyms are not treated as emphasis', () => {
    const div = render('Đề bài: số nhà bán > 5 triệu USD ở LA.');
    expect(div.querySelector('.an-em')).toBeNull();
  });

  test('English phrase bullet + indented example → chip, example, matched words bolded', () => {
    const div = render('Cấu trúc hay:\n- rise dramatically, from X to Y\n  Sales in London rose dramatically, from 550 to 1,650.\n- be replaced by\n  The farm was replaced by a golf course.');
    const phrases = div.querySelectorAll('.an-phrase');
    expect(phrases).toHaveLength(2);
    expect(phrases[0].querySelector('.an-phrase-chip').textContent).toBe('rise dramatically, from X to Y');
    expect(phrases[0].querySelector('.an-hit').textContent).toBe('rose dramatically');
    expect(phrases[1].querySelector('.an-hit').textContent).toBe('was replaced by');
  });

  test('plan steps and checklist', () => {
    const div = render('Mỗi đề dạng này chỉ cần làm:\nOVERVIEW: tìm hạng mục CAO NHẤT.\nBODY 2: các hạng mục còn lại.\n\nChecklist để đạt 6.5+:\n① Có nêu ngoại lệ không?');
    expect(div.querySelector('.an-step--overview .an-step-tag').textContent).toBe('OVERVIEW');
    expect(div.querySelector('.an-step--compare .an-step-tag').textContent).toBe('BODY 2');
    const check = div.querySelector('.an-check');
    expect(check.querySelector('.an-check-num').textContent).toBe('1');
    check.click();
    expect(check.classList.contains('is-done')).toBe(true);
  });

  test('escapes HTML and falls back to plain paragraphs', () => {
    const div = render('Một dòng <img src=x onerror=alert(1)> bình thường.');
    expect(div.querySelector('img')).toBeNull();
    expect(div.querySelector('.an-p').textContent).toBe('Một dòng <img src=x onerror=alert(1)> bình thường.');
  });
});

describe('AnalysisFormat.title', () => {
  test('number badge + tone by section kind', () => {
    const b1 = window.AnalysisFormat.title('2. Body 1 – London và New York');
    expect(b1.tone).toBe('b1');
    expect(b1.html).toContain('<span class="an-badge">2</span>');
    expect(window.AnalysisFormat.title('3. Body 2 – Còn lại').tone).toBe('b2');
    expect(window.AnalysisFormat.title('4. Công thức áp dụng').tone).toBe('plan');
    expect(window.AnalysisFormat.title('1. Phân tích nhanh đề này').tone).toBe('intro');
  });
});
