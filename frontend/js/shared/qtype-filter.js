/* "Dạng câu hỏi" checkbox filter for the Reading / Listening Bài lẻ lists.
   Each passage/section carries `qtypes` (keys from the server, see
   backend/utils/questionTypes.js). A passage can have several types; with
   boxes ticked, a card shows when it has ANY of the ticked types. */
(function () {
  const LABELS = {
    'matching': 'Matching',
    'matching-features': 'Matching Features',
    'matching-headings': 'Matching Headings',
    'matching-information': 'Matching Information',
    'sentence-endings': 'Matching Sentence Endings',
    'multiple-choice': 'Multiple Choice',
    'diagram-labelling': 'Plan, map, diagram labelling',
    'sentence-completion': 'Sentence Completion',
    'short-answer': 'Short-answer Questions',
    'summary-completion': 'Summary, form completion',
    'tfng': 'TRUE-FALSE-NOT GIVEN',
    'ynng': 'YES-NO-NOT GIVEN',
  };
  const ORDER = {
    reading: ['matching-features', 'matching-headings', 'matching-information', 'sentence-endings',
      'multiple-choice', 'diagram-labelling', 'sentence-completion', 'short-answer',
      'summary-completion', 'tfng', 'ynng'],
    listening: ['matching', 'multiple-choice', 'diagram-labelling', 'sentence-completion',
      'short-answer', 'summary-completion'],
  };

  function create({ mount, module, onChange }) {
    const el = typeof mount === 'string' ? document.getElementById(mount) : mount;
    const keys = ORDER[module] || [];
    const selected = new Set();
    if (!el) return { matches: () => true, setCounts() {}, hasSelection: () => false, clear() {} };

    el.classList.add('qtf');
    el.innerHTML = `
      <div class="qtf-head">
        <span class="qtf-title">Dạng câu hỏi</span>
        <button type="button" class="qtf-clear" hidden>Bỏ chọn</button>
      </div>
      <div class="qtf-list">${keys.map(k => `
        <label class="qtf-item" data-k="${k}">
          <input type="checkbox" value="${k}">
          <span class="qtf-name">${LABELS[k]}</span>
          <span class="qtf-count"></span>
        </label>`).join('')}
      </div>`;
    const clearBtn = el.querySelector('.qtf-clear');

    function sync() {
      clearBtn.hidden = !selected.size;
      el.querySelectorAll('.qtf-item').forEach(l => l.classList.toggle('qtf-on', selected.has(l.dataset.k)));
    }
    el.addEventListener('change', e => {
      const box = e.target;
      if (!box.matches('input[type=checkbox]')) return;
      box.checked ? selected.add(box.value) : selected.delete(box.value);
      sync();
      onChange && onChange();
    });
    clearBtn.addEventListener('click', () => { api.clear(); onChange && onChange(); });

    const api = {
      matches(item) {
        if (!selected.size) return true;
        return (item.qtypes || []).some(k => selected.has(k));
      },
      // Counts reflect the list before the type filter (tab + search + status)
      setCounts(items) {
        const n = {};
        (items || []).forEach(it => (it.qtypes || []).forEach(k => { n[k] = (n[k] || 0) + 1; }));
        el.querySelectorAll('.qtf-item').forEach(l => {
          const c = n[l.dataset.k] || 0;
          l.querySelector('.qtf-count').textContent = c;
          l.classList.toggle('qtf-zero', !c);
        });
      },
      hasSelection: () => selected.size > 0,
      clear() {
        selected.clear();
        el.querySelectorAll('input[type=checkbox]').forEach(b => { b.checked = false; });
        sync();
      },
    };
    return api;
  }

  // Card labels: the item's types in the order they appear in the test
  function labelsOf(item) {
    return (item.qtypes || []).map(k => LABELS[k]).filter(Boolean);
  }

  window.QTypeFilter = { LABELS, ORDER, create, labelsOf };
})();
