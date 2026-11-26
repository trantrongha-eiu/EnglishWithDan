import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { emptySections, isLoggedIn, LESSON_SECTIONS, qid } from '../../utils/task2Practice';

// One lesson ("Buổi") of the open topic: the student's translated sentences,
// the four essay sections and the brainstorm notes. Saved per student on the
// server (/api/task2/lesson/:topicId) since the two halves are usually written
// on different devices, with a local mirror (t2_lesson:<id>) for edits that
// never reached the server (offline, tab closed mid-save).

const LOCAL = 't2_lesson:';
function readLocal(id) {
  try { return JSON.parse(localStorage.getItem(LOCAL + id) || 'null'); } catch { return null; }
}

export function useLesson(topicId, onProgress) {
  const [lesson, setLessonState] = useState({ status: 'idle', sentences: [], sections: emptySections(), submittedAt: null, legacyPassed: false });
  const [notes, setNotesState] = useState([]);
  const [saveState, setSaveState] = useState('');
  const L = useRef(lesson);
  const N = useRef(notes);
  const progressCb = useRef(onProgress);
  useEffect(() => { progressCb.current = onProgress; });

  const api = useMemo(() => {
    const dirty = { sections: false, brainstorm: false };
    // counters and timers live on one object (the functions below outlive the render)
    const m = { editSeq: 0, loadSeq: 0, timer: 0, inflight: null };
    const setLesson = (next) => { L.current = next; setLessonState(next); };
    const setNotes = (next) => { N.current = next; setNotesState(next); };
    const bumpProgress = () => {
      const s = L.current.sections;
      progressCb.current?.(topicId, { topicId, written: LESSON_SECTIONS.filter((x) => (s[x.key] || '').trim()).length, submitted: !!L.current.submittedAt });
    };

    // Builds the request synchronously, then sends it. extra: { submitted: true } on hand-in.
    async function flush(opts = {}) {
      clearTimeout(m.timer);
      if (!dirty.sections && !dirty.brainstorm && !opts.extra) return;
      if (!isLoggedIn()) return;
      const body = { ...(opts.extra || {}) };
      if (dirty.sections && L.current.status === 'ready') body.sections = { ...L.current.sections };
      if (dirty.brainstorm) body.brainstorm = N.current.map((n) => n || '');
      dirty.sections = false; dirty.brainstorm = false;
      const seq = m.editSeq;
      setSaveState('saving');
      try {
        await apiFetch(`/task2/lesson/${topicId}`, { method: 'PUT', keepalive: !!opts.keepalive, body: JSON.stringify(body) });
        if (seq === m.editSeq) {
          try { localStorage.removeItem(LOCAL + topicId); } catch { /* private mode */ }
          setSaveState('saved');
        }
        bumpProgress();
      } catch {
        // Flags back so the next edit / leave retries; the local mirror keeps the text
        if (body.sections) dirty.sections = true;
        if (body.brainstorm) dirty.brainstorm = true;
        setSaveState('error');
      }
    }

    // part: 'sections' | 'brainstorm' — only edited parts are sent, so notes
    // typed before the lesson loaded can never blank the saved essay
    function markDirty(part) {
      dirty[part] = true;
      m.editSeq++;
      try {
        const prev = readLocal(topicId) || {};
        if (part === 'sections' && L.current.status === 'ready') prev.sections = L.current.sections;
        if (part === 'brainstorm') prev.brainstorm = N.current;
        prev.savedAt = Date.now();
        localStorage.setItem(LOCAL + topicId, JSON.stringify(prev));
      } catch { /* full / private */ }
      setSaveState('dirty');
      clearTimeout(m.timer);
      m.timer = setTimeout(() => flush(), 1500);
    }

    function load(force) {
      if (!topicId || !isLoggedIn()) return Promise.resolve();
      const cur = L.current;
      if (cur.status === 'loading' && m.inflight) return m.inflight;
      if (!force && cur.status === 'ready') return Promise.resolve();
      const seq = ++m.loadSeq;
      setLesson({ ...cur, status: 'loading' });
      m.inflight = (async () => {
        try {
          const d = await apiFetch(`/task2/lesson/${topicId}`);
          if (seq !== m.loadSeq) return;
          const w = d.work || {};
          const sections = { ...emptySections(), ...(w.sections || {}) };
          let brainstorm = Array.isArray(w.brainstorm) ? w.brainstorm.slice() : null;
          // A local copy newer than the server's = edits that never reached it
          const local = readLocal(topicId);
          const serverAt = w.updatedAt ? new Date(w.updatedAt).getTime() : 0;
          let restored = false;
          if (local && local.savedAt > serverAt) {
            if (local.sections) { Object.assign(sections, local.sections); restored = true; }
            if (Array.isArray(local.brainstorm)) { brainstorm = local.brainstorm.slice(); restored = true; }
          }
          // Keep edits this device can still vouch for if a save is pending
          if (dirty.sections) Object.assign(sections, L.current.sections);
          setLesson({ status: 'ready', sentences: d.sentences || [], sections, submittedAt: w.submittedAt || null, legacyPassed: !!d.legacyPassed });
          if (brainstorm && !N.current.some((n) => (n || '').trim())) setNotes(brainstorm);
          if (restored) { markDirty('sections'); markDirty('brainstorm'); }
        } catch {
          if (seq === m.loadSeq) setLesson({ ...L.current, status: 'error' });
        } finally {
          if (seq === m.loadSeq) m.inflight = null;
        }
      })();
      return m.inflight;
    }

    return {
      load, flush, markDirty, current: () => L.current,
      setSection(key, value) {
        if (L.current.status !== 'ready') return;
        setLesson({ ...L.current, sections: { ...L.current.sections, [key]: value } });
        markDirty('sections');
      },
      setNote(i, value) {
        const next = N.current.slice();
        next[i] = value;
        setNotes(next);
        markDirty('brainstorm');
      },
      // An answer from the practice screen → the writer's sentence list at once
      noteSentence(q, answer, isOk) {
        const cur = L.current;
        if (cur.status !== 'ready' || !String(answer || '').trim()) return;
        const id = qid(q);
        const i = cur.sentences.findIndex((x) => x.questionId === id || x.questionId === q._id);
        if (i < 0) return;
        const s = cur.sentences[i];
        if (s.en && s.isCorrect && !isOk) return;
        const sentences = cur.sentences.slice();
        sentences[i] = { ...s, en: String(answer).trim(), isCorrect: !!isOk };
        setLesson({ ...cur, sentences });
      },
      async submit() {
        dirty.sections = true;
        await flush({ extra: { submitted: true } });
        setLesson({ ...L.current, submittedAt: new Date().toISOString() });
        bumpProgress();
      },
    };
  }, [topicId]);

  // Unsaved notes / essay edits go out when the tab hides or the topic closes
  useEffect(() => {
    const hide = () => api.flush({ keepalive: true });
    const vis = () => { if (document.visibilityState === 'hidden') api.flush({ keepalive: true }); };
    window.addEventListener('pagehide', hide);
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.removeEventListener('pagehide', hide);
      document.removeEventListener('visibilitychange', vis);
      api.flush();
    };
  }, [api]);

  return { lesson, notes, saveState, ...api };
}
