// Words of a "gõ từng chữ" sentence answer (components/SentenceWbw.jsx):
// what the student types (letters/digits) and the masked hint ("b*****,").
export function tokenize(answer) {
  return String(answer).trim().split(/\s+/).filter(Boolean).map((raw) => {
    const target = raw.replace(/[^A-Za-z0-9]/g, '');
    let seen = false;
    const mask = [...raw].map((ch) => {
      if (/[A-Za-z0-9]/.test(ch)) { if (!seen) { seen = true; return ch; } return '*'; }
      return ch;
    }).join('');
    return { raw, target, mask };
  }).filter((t) => t.target.length > 0);
}

export const wbwUsable = (answer) => !!answer && tokenize(answer).length > 0;
