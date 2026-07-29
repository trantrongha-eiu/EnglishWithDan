import { API, authHeaders } from './api';

// CSV export isn't JSON, so it can't go through apiFetch() — fetch it as a
// blob directly and trigger a browser download via a throwaway <a>. Shared
// by any admin page with a per-lesson/per-content "export students" button
// (VocabularyLessons.jsx, EssentialGrammarLessons.jsx).
export async function downloadCsv(path, filenameFallback) {
  const res = await fetch(`${API}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Export thất bại');
  const blob = await res.blob();
  const match = (res.headers.get('Content-Disposition') || '').match(/filename="([^"]+)"/);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = match?.[1] || filenameFallback;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
