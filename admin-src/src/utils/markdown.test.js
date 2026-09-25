import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('escapes HTML before formatting (no injection)', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)> **bold**');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('renders headings, lists, quotes and paragraphs', () => {
    const html = renderMarkdown('### Quy trình\n\n1. **Bước 1** — đọc\n2. Bước 2\n\n- a\n- b\n\n> **Mẹo**\n> Gạch chân\n\nĐoạn *nghiêng*.');
    expect(html).toContain('<h3>Quy trình</h3>');
    expect(html).toContain('<ol><li><strong>Bước 1</strong> — đọc</li><li>Bước 2</li></ol>');
    expect(html).toContain('<ul><li>a</li><li>b</li></ul>');
    expect(html).toContain('<blockquote><strong>Mẹo</strong><br>Gạch chân</blockquote>');
    expect(html).toContain('<p>Đoạn <em>nghiêng</em>.</p>');
  });

  it('renders pipe tables, keeping escaped pipes inside cells', () => {
    const html = renderMarkdown('| Dấu hiệu | Ý nghĩa |\n| --- | --- |\n| all \\| every | tuyệt đối |');
    expect(html).toContain('<th>Dấu hiệu</th>');
    expect(html).toContain('<td>all | every</td>');
  });
});
