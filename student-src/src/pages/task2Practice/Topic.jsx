import { useEffect, useRef, useState } from 'react';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { hasPremiumAccess } from '../../utils/plan';
import { openUpgrade, setActivePractice, siteToast } from '../../utils/shell';
import {
  assignDrillModes, ESSAY_TYPE_ID, hubUrl, isLoggedIn, isStaff, isStepUnlocked, isVocabLearned, isVocabStepDone, LESSON_MIN_WORDS,
  LESSON_SECTIONS, markVocabTermsSaved, savedTermsFor, pushVocabProgress, qid, saveTopicScore, setQuizBest, setVocabTotal, shuffle, speakTerm,
  translateGateMessage, translateProgress, buildVocabQuiz, VQUIZ_PASS, WBW_TYPES, wc,
} from '../../utils/task2Practice';
import { Hub } from './Hub';
import { Compose } from './Compose';
import { PracticeRun } from './Practice';
import { ExamRun } from './Exam';
import { PreviewDialog, TeacherGuide } from './Dialogs';
import { QuitDialog, Spinner } from './Parts';
import { useLesson } from './useLesson';
import { cachedGuides, cachedTemplates, fetchTopicData, loadGuides, loadTemplates, newSession, prefetched, scrollToHubStep } from './lib';

// One topic = one lesson ("Buổi N"): the hub, the split-screen writer
// (?write=1) and the practice / exam runs started from it. A run lives on its
// own history entry (same address, router state { run }), so Back from a run
// returns to the hub — asking first when answers would be cut short.

// Unique across reloads: a stale history entry must never match a new run
let runSeq = Date.now();

export function TopicScreen({ t, page, write, focus, autoResume }) {
  const navigate = useNavigate();
  const location = useLocation();
  const id = t._id;
  const week = page.week;
  const [data, setData] = useState(() => prefetched.get(id) || null);
  const [vocab, setVocab] = useState(() => {
    const p = prefetched.get(id);
    return p && p.vocab != null ? { for: id, list: p.vocab, error: false } : { for: null, list: [], error: !!(p && p.vocab == null && isLoggedIn()) };
  });
  const [, bump] = useState(0); // the browser-side stores changed
  const [vocabOpen, setVocabOpen] = useState(null);
  const [vocabQuiz, setVocabQuiz] = useState(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [guides, setGuides] = useState(cachedGuides());
  const [tplData, setTplData] = useState(cachedTemplates());
  const [compose, setComposeState] = useState(() => ({
    phase: 'class', tab: 'sentences', lastFocus: 'intro', refOpen: false, revealed: {},
    tplOpen: false, tplLevel: 'band7', tplVi: false, tplType: ESSAY_TYPE_ID[t.essayType] || window.Task2GenericTpl?.guessType?.(t.prompt || '') || null,
  }));
  const [run, setRun] = useState(null);
  const [dialog, setDialog] = useState(null); // 'guide' | 'preview' | { short }
  const L = useLesson(id, page.setLessonProgress);
  const taRefs = useRef({});
  const quitRef = useRef(null);
  const leaving = useRef(false);
  const vocabLoading = useRef(false);
  useEffect(() => { prefetched.delete(id); }, [id]);

  // Topic data (deep link, reload, Back / Forward)
  useEffect(() => {
    if (data) return undefined;
    let alive = true;
    fetchTopicData(id).then((d) => {
      if (!alive) return;
      setData(d);
      if (d.vocab != null) { setVocabTotal(id, d.vocab); window.WordAudio?.prefetch?.(d.vocab.map((v) => v && v.term)); setVocab({ for: id, list: d.vocab, error: false }); }
      else setVocab({ for: null, list: [], error: isLoggedIn() });
    });
    return () => { alive = false; };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const p = vocab.for === id ? vocab.list : null;
    if (p) { setVocabTotal(id, p); window.WordAudio?.prefetch?.(p.map((v) => v && v.term)); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The lesson, the type guides and the book templates
  useEffect(() => {
    if (!isLoggedIn()) return;
    L.load();
    if (!cachedGuides()) loadGuides().then((g) => setGuides(g));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!cachedTemplates()) loadTemplates().then((d) => setTplData(d)); }, []);

  const lesson = L.lesson;
  const vocabCtx = vocab;
  const writingUnlocked = isStaff() || (isStepUnlocked(id, vocabCtx) && (!isLoggedIn() || !!(translateProgress(lesson) || {}).passed));
  const runShown = run && location.state?.run === run.seq ? run : null;
  const composeShown = !runShown && write && lesson.status === 'ready' && isLoggedIn() && writingUnlocked;
  const view = runShown ? (runShown.kind === 'exam' ? (runShown.view || 'exam') : (runShown.view || 'practice')) : composeShown ? 'compose' : 'select';

  // ── leaving a run: Back / a link asks first ──
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !leaving.current && !!quitRef.current && currentLocation.key !== nextLocation.key);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (quitRef.current) quitRef.current(); else blocker.proceed();
  }, [blocker.state]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setActivePractice(!!runShown); return () => setActivePractice(false); }, [runShown]);

  function go(to, opts) {
    leaving.current = true;
    navigate(to, opts);
    setTimeout(() => { leaving.current = false; }, 0);
  }
  function backToHub() {
    go(hubUrl(week, id), { replace: true });
    window.scrollTo(0, 0);
  }
  function startRun(r) {
    const seq = ++runSeq;
    setRun({ seq, ...r });
    go(hubUrl(week, id), { state: { run: seq }, replace: !!runShown });
    window.scrollTo(0, 0);
  }

  // ?write=1 opened directly (reload / shared link / Back-Forward): the gates decide
  const writeChecked = useRef(false);
  useEffect(() => {
    if (!write || runShown || writeChecked.current || !isLoggedIn()) return;
    if (lesson.status !== 'ready' && lesson.status !== 'error') return;
    if (!data) return;
    writeChecked.current = true;
    const fail = (msg, step) => setTimeout(() => {
      siteToast(msg, 'warn', step === 'translate' ? 6000 : 4000);
      go(hubUrl(week, id), { replace: true });
      setTimeout(() => scrollToHubStep(step), 60);
    }, 0);
    if (lesson.status !== 'ready') { setTimeout(() => { siteToast('Không tải được bài viết — thử lại nhé', 'error'); go(hubUrl(week, id), { replace: true }); }, 0); return; }
    if (!isStepUnlocked(id, vocabCtx)) { fail(`Hoàn thành bước Từ vựng (lưu từ + quiz ≥ ${VQUIZ_PASS}%) để mở màn hình viết`, 'vocab'); return; }
    if (!writingUnlocked) { fail('🔒 ' + translateGateMessage(lesson), 'translate'); return; }
    const s = lesson.sections;
    setTimeout(() => setComposeState((c) => ({ ...c, phase: (s.intro.trim() && s.body1.trim()) ? 'home' : 'class', lastFocus: (s.intro.trim() && s.body1.trim()) ? 'body2' : 'intro', tab: 'sentences', refOpen: false })), 0);
  });
  useEffect(() => { if (!write) writeChecked.current = false; }, [write]);

  // Old share / homework links with ?mode=vocab|exam scroll to that step; a
  // "Tiếp tục" from the weeks screen reopens the saved draft
  const focused = useRef(false);
  useEffect(() => {
    if (!data || focused.current || view !== 'select') return;
    focused.current = true;
    if (focus) setTimeout(() => scrollToHubStep(focus), 60);
    if (autoResume && data.draft) resumeSession();
  });

  useEffect(() => { page.reportView(view); }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // 1–4 / Enter on the vocab quiz (not while typing somewhere)
  useEffect(() => {
    const qz = vocabQuiz;
    if (!qz || view !== 'select' || qz.idx >= qz.items.length) return undefined;
    const key = (e) => {
      const tg = e.target;
      if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
      if (/^[1-4]$/.test(e.key) && qz.picked == null) { e.preventDefault(); pickQuiz(Number(e.key) - 1); }
      else if (e.key === 'Enter' && qz.picked != null) { e.preventDefault(); nextQuiz(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });
  const quizTimer = useRef(0);
  useEffect(() => () => clearTimeout(quizTimer.current), []);

  // ── vocab ──
  function retryVocab() {
    if (vocabLoading.current) return;
    vocabLoading.current = true;
    setVocab({ for: null, list: [], error: false });
    apiFetch(`/task2/vocabulary/${id}`).then((d) => d.vocabularyList || []).catch(() => null).then((list) => {
      vocabLoading.current = false;
      if (list == null) { setVocab({ for: null, list: [], error: true }); return; }
      setVocabTotal(id, list);
      setVocab({ for: id, list, error: false });
    });
  }
  const item = (v) => ({ word: v.term, meaning: v.definitionVi || '', example: v.example || '' });
  function onVocabSaved(terms) {
    const was = isVocabLearned(id);
    markVocabTermsSaved(id, terms);
    pushVocabProgress({ topicId: id, savedTerms: terms }, () => bump((n) => n + 1));
    bump((n) => n + 1);
    if (!was && isVocabLearned(id)) {
      setVocabOpen(null);
      if (isVocabStepDone(id, vocabCtx)) {
        siteToast('🎉 Đã mở khoá các bước tiếp theo! Tiếp theo: brainstorm ý tưởng.', 'success', 3500);
        setTimeout(() => scrollToHubStep('ideas'), 150);
      } else siteToast(`Đã lưu đủ từ! Giờ làm quiz từ vựng đạt ≥ ${VQUIZ_PASS}% để mở khoá bước tiếp theo.`, 'success', 4000);
    }
  }
  function saveOneVocab(i) {
    const v = vocab.list[i];
    if (!v || !window.openVocabBookPickerBulk) return;
    window.openVocabBookPickerBulk([item(v)], onVocabSaved);
  }
  function saveAllVocab() {
    if (!vocab.list.length || !window.openVocabBookPickerBulk) return;
    const saved = savedTermsFor(id);
    const pending = vocab.list.filter((v) => !saved.has(v.term));
    window.openVocabBookPickerBulk((pending.length ? pending : vocab.list).map(item), onVocabSaved);
  }
  function startQuiz() {
    const items = buildVocabQuiz(vocab.list || [], id);
    if (!items.length) return;
    clearTimeout(quizTimer.current);
    setVocabQuiz({ items, idx: 0, correct: 0, picked: null, missed: [] });
    setTimeout(() => scrollToHubStep('vocab'), 0);
  }
  function closeQuiz() { clearTimeout(quizTimer.current); setVocabQuiz(null); }
  function nextQuiz(qz = vocabQuiz) {
    if (!qz || qz.picked == null) return;
    clearTimeout(quizTimer.current);
    const n = { ...qz, idx: qz.idx + 1, picked: null };
    if (n.idx >= n.items.length) {
      const was = isVocabStepDone(id, vocabCtx);
      const pct = Math.round((n.correct / n.items.length) * 100);
      setQuizBest(id, pct);
      pushVocabProgress({ topicId: id, quizBest: pct }, () => bump((x) => x + 1));
      bump((x) => x + 1);
      if (!was && isVocabStepDone(id, vocabCtx)) siteToast('🎉 Đạt quiz từ vựng! Đã mở khoá các bước tiếp theo.', 'success', 3500);
    }
    setVocabQuiz(n);
  }
  function pickQuiz(i) {
    const qz = vocabQuiz;
    if (!qz || qz.picked != null) return;
    const it = qz.items[qz.idx];
    if (!it || i >= it.options.length) return;
    const ok = it.options[i] === it.answer;
    const n = { ...qz, picked: i, correct: qz.correct + (ok ? 1 : 0), missed: ok ? qz.missed : [...qz.missed, it] };
    window[ok ? 'playOk' : 'playWrong']?.();
    setVocabQuiz(n);
    // Right answers move on by themselves; wrong ones wait so the right option can be read
    if (ok) quizTimer.current = setTimeout(() => nextQuiz(n), 700);
  }

  // ── runs ──
  async function fetchQuestions() {
    const d = await apiFetch(`/task2/questions/topic/${id}?${new URLSearchParams({ level: 'all' })}`);
    const list = d.questions || [];
    const pool = assignDrillModes(list, vocab.for === id ? vocab.list : []);
    return { list, pool };
  }
  const [pool, setPool] = useState([]);
  async function startPractice(opts = {}) {
    if (!isStepUnlocked(id, vocabCtx)) {
      siteToast(`Bạn cần lưu hết từ vựng và đạt quiz từ vựng ≥ ${VQUIZ_PASS}% trước khi luyện câu`, 'warn', 4000);
      if (view === 'select') scrollToHubStep('vocab');
      return;
    }
    try {
      if (!cachedTemplates()) loadTemplates().then((x) => setTplData(x)); // the "Tự viết kết bài" card shows the Band 7 frames
      const { list, pool } = await fetchQuestions();
      if (!list.length) { siteToast('Chưa có câu hỏi ở level này', 'warn'); return; }
      let questions = list;
      if (opts.translateOnly) {
        questions = questions.filter((q) => WBW_TYPES.has(q.type));
        const Ls = lesson.status === 'ready' ? lesson : null;
        // The lesson's own list drops sentences asked twice (same model answer)
        if (Ls && Ls.sentences.length) {
          const ids = new Set(Ls.sentences.map((s) => s.questionId));
          const kept = questions.filter((q) => ids.has(qid(q)) || ids.has(q._id));
          if (kept.length) questions = kept;
        }
        // Translated right already → skip; untranslated and wrong ones come up
        const doneIds = new Set((Ls ? Ls.sentences : []).filter((s) => s.en && s.isCorrect).map((s) => s.questionId));
        const missing = questions.filter((q) => !doneIds.has(qid(q)) && !doneIds.has(q._id));
        if (missing.length && missing.length < questions.length) questions = missing;
        if (!questions.length) { siteToast('Buổi này chưa có câu dịch', 'warn'); return; }
      }
      if (page.prefs.shuffleMode) shuffle(questions);
      setPool(pool);
      startRun({ kind: 'practice', session: newSession({ questions, mode: 'practice', translateOnly: !!opts.translateOnly }) });
    } catch { siteToast('Lỗi tải câu hỏi', 'error'); }
  }
  async function startRetryWrong() {
    try {
      const { list, pool } = await fetchQuestions();
      if (!list.length) { siteToast('Chưa có câu hỏi', 'warn'); return; }
      const wrongSet = new Set(data?.wrongIds || []);
      const wrong = list.filter((q) => wrongSet.has(q._id) || wrongSet.has(q.questionId));
      if (!wrong.length) { siteToast('Không có câu sai nào', 'info'); return; }
      if (page.prefs.shuffleMode) shuffle(wrong);
      setPool(pool);
      startRun({ kind: 'practice', session: newSession({ questions: wrong, mode: 'retry' }) });
    } catch { siteToast('Lỗi tải câu hỏi', 'error'); }
  }
  async function resumeSession() {
    const draft = data?.draft;
    if (!draft) return;
    try {
      const { list, pool } = await fetchQuestions();
      if (!list.length) { siteToast('Không thể tải câu hỏi', 'error'); return; }
      // Both the stable questionId and the MongoDB _id, so old and new drafts work
      const map = {};
      list.forEach((q) => { if (q._id) map[String(q._id)] = q; if (q.questionId) map[q.questionId] = q; });
      const restored = (draft.questionIds || []).map((x) => map[x]).filter(Boolean);
      if (!restored.length) { siteToast('Câu hỏi đã được cập nhật, không thể khôi phục phiên cũ. Hãy bắt đầu mới.', 'warn', 4000); return; }
      const sessionDone = draft.sessionDone || 0;
      const session = newSession({
        questions: restored, mode: draft.mode || 'practice', attempts: draft.sessionAttempts || [],
        status: draft.questionStatus || new Array(restored.length).fill('pending'), done: sessionDone, correct: draft.sessionCorrect || 0,
        idx: Math.min(draft.currentIdx || sessionDone || 0, restored.length),
      });
      setPool(pool);
      // Measured against the draft's own total, not the (maybe smaller) restored list
      const allAnswered = draft.sessionDone >= (draft.questionIds?.length || restored.length);
      if (allAnswered && sessionDone > 0) {
        const pct = Math.round((session.correct / session.done) * 100);
        saveTopicScore(id, pct);
        startRun({ kind: 'practice', session, view: 'done' });
        saveAttempt(session);
      } else startRun({ kind: 'practice', session });
    } catch { siteToast('Lỗi khôi phục tiến độ', 'error'); }
  }
  function dismissDraft() {
    setData((d) => ({ ...d, draft: null }));
    page.removeDraft(id);
    apiFetch(`/task2/draft/${id}`, { method: 'DELETE' }).catch(() => {});
  }
  async function startExam() {
    if (!hasPremiumAccess()) { openUpgrade(); return; }
    try {
      const d = await apiFetch(`/task2/exam?${new URLSearchParams({ level: 'all', count: page.examCount, week })}`);
      if (!d.questions?.length) { siteToast('Chưa có đủ câu hỏi', 'warn'); return; }
      startRun({ kind: 'exam', questions: d.questions });
    } catch { siteToast('Lỗi tải đề thi', 'error'); }
  }
  // A finished run → the attempt (history + homework), the wrong list, no draft
  async function saveAttempt(s) {
    if (!isLoggedIn() || !s.done) return;
    try {
      await apiFetch('/task2/save-attempt', {
        method: 'POST',
        body: JSON.stringify({
          sessionType: 'practice', week, topicId: id, topicName: t.topicName, level: 'all',
          questionsAttempted: s.attempts.map((a) => ({ questionId: a.questionId, userAnswer: a.userAnswer, isCorrect: a.isCorrect, score: a.score })),
          totalQuestions: s.done, correctCount: s.correct,
        }),
      });
      try { const w = await apiFetch(`/task2/wrong-questions/${id}`); setData((d) => ({ ...d, wrongIds: w.wrongIds || [] })); } catch { /* keep the old list */ }
      try { await apiFetch(`/task2/draft/${id}`, { method: 'DELETE' }); } catch { /* the next run overwrites it */ }
      setData((d) => ({ ...d, draft: null }));
      page.removeDraft(id);
    } catch { /* not saved */ }
  }
  // "Thoát và lưu tiến độ": the hub + weeks screen show the draft at once
  function keepDraft(s) {
    const draft = {
      topicId: id, topicName: t.topicName, week, level: 'all', mode: s.mode, currentIdx: s.done,
      questionIds: s.questions.map(qid), savedAt: new Date().toISOString(),
      sessionDone: s.done, sessionAttempts: s.attempts, questionStatus: s.status, sessionCorrect: s.correct,
    };
    setData((d) => ({ ...d, draft }));
    page.upsertDraft(draft);
  }

  // ── writer ──
  async function openCompose(phase) {
    if (!isLoggedIn()) { siteToast('Đăng nhập để viết và lưu bài', 'warn'); return; }
    if (!isStepUnlocked(id, vocabCtx)) {
      siteToast(`Hoàn thành bước Từ vựng (lưu từ + quiz ≥ ${VQUIZ_PASS}%) để mở màn hình viết`, 'warn', 4000);
      if (view === 'select') scrollToHubStep('vocab');
      return;
    }
    await L.load();
    const cur = L.current();
    if (cur.status !== 'ready') { siteToast('Không tải được bài viết — thử lại nhé', 'error'); return; }
    const tp = translateProgress(cur);
    if (!isStaff() && !(tp && tp.passed)) {
      siteToast('🔒 ' + translateGateMessage(cur), 'warn', 6000);
      if (view === 'select') scrollToHubStep('translate');
      return;
    }
    const s = cur.sections;
    const ph = phase || ((s.intro.trim() && s.body1.trim()) ? 'home' : 'class');
    setComposeState((c) => ({ ...c, phase: ph, lastFocus: ph === 'home' ? 'body2' : 'intro', tab: 'sentences', refOpen: false }));
    writeChecked.current = true;
    go(hubUrl(week, id, { write: 1 }));
    window.scrollTo(0, 0);
    if (!cachedTemplates()) loadTemplates().then((x) => setTplData(x));
  }
  function closeCompose() {
    L.flush();
    const back = compose.phase === 'home' ? 'home' : 'class';
    go(hubUrl(week, id));
    setTimeout(() => scrollToHubStep(back), 60);
  }
  function setPhase(p) {
    setComposeState((c) => {
      if (c.phase === p) return c;
      const tab = p === 'home' && c.tab === 'sentences' && !lesson.sentences.some((s) => s.en) ? 'template' : c.tab;
      return { ...c, phase: p, lastFocus: p === 'home' ? 'body2' : 'intro', tab };
    });
  }
  function insertRef(text) {
    const key = compose.lastFocus;
    const ta = taRefs.current[key];
    if (!ta || !text) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? start;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    const pre = before && !/\s$/.test(before) ? ' ' : '';
    const post = after && !/^\s/.test(after) ? ' ' : '';
    const caret = (before + pre + text).length;
    L.setSection(key, before + pre + text + post + after);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caret, caret);
      if (window.innerWidth <= 900) ta.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }
  // Hand the finished essay to writing.html's Task 2 flow for AI grading
  function submitEssay() {
    if (lesson.status !== 'ready') return undefined;
    const missing = LESSON_SECTIONS.filter((s) => !(lesson.sections[s.key] || '').trim());
    if (missing.length) { siteToast('Còn thiếu: ' + missing.map((s) => s.label).join(', '), 'warn', 5000); return undefined; }
    if (!t.writingTask2Id) { siteToast('Đề này chưa có bản chấm AI — hãy nộp bài cho giáo viên.', 'info', 5000); return undefined; }
    const essay = LESSON_SECTIONS.map((s) => lesson.sections[s.key].trim()).join('\n\n');
    const words = wc(essay);
    if (words < LESSON_MIN_WORDS) { setDialog({ short: words, essay }); return undefined; }
    return handIn(essay);
  }
  async function handIn(essay) {
    await L.submit();
    try {
      localStorage.setItem(`ews_practice_autosave:2:${t.writingTask2Id}`, JSON.stringify({
        taskType: 2, task: { _id: t.writingTask2Id, prompt: t.prompt }, answer: essay, wordCount: wc(essay), seconds: 0, savedAt: Date.now(),
      }));
    } catch { /* full */ }
    window.location.href = `/writing.html?taskType=2&taskId=${encodeURIComponent(t.writingTask2Id)}`;
  }

  const copyShare = () => {
    const url = `${window.location.origin}/app${hubUrl(week, id)}`;
    const ok = () => siteToast('Đã sao chép link chia sẻ!', 'info', 2500);
    const fallback = () => {
      const el = document.createElement('textarea');
      el.value = url; el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(el); el.select();
      try { document.execCommand('copy'); ok(); } catch { siteToast('Không sao chép được – hãy copy thủ công.', 'warn'); }
      el.remove();
    };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok).catch(fallback); else fallback();
  };

  const guide = (guides || []).find((g) => g.typeId === ESSAY_TYPE_ID[t.essayType]) || null;
  const c = {
    t, week, sessionNumber: page.sessionNumber(id), sessionLabel: page.sessionLabel(id),
    lesson, notes: L.notes, saveState: L.saveState, setNote: L.setNote, setSection: L.setSection, noteSentence: L.noteSentence,
    vocab: vocabCtx, vocabOpen, setVocabOpen, vocabQuiz, startQuiz, closeQuiz, nextQuiz: () => nextQuiz(), pickQuiz,
    continueAfterQuiz: () => { closeQuiz(); setTimeout(() => scrollToHubStep('ideas'), 60); },
    retryVocab, saveAllVocab, saveOneVocab, speakVocab: (i) => { const v = vocab.list[i]; if (v) speakTerm(v.term); },
    hintOpen, setHintOpen, moreOpen, setMoreOpen, info: page.info, prefs: page.prefs, togglePref: page.togglePref,
    examCount: page.examCount, setExamCount: page.setExamCount, promptOpen: page.promptOpen, setPromptOpen: page.setPromptOpen,
    wrongIds: data?.wrongIds || [], draft: data?.draft || null, topicStats: data?.stats || null,
    guides, guide, tplData, writingUnlocked, pool,
    goWeeks: page.goWeeks, openHistory: page.openHistory, copyShare,
    openTeacherGuide: () => setDialog('guide'), openPreview: () => setDialog('preview'),
    startTranslate: () => startPractice({ translateOnly: true }), startPractice: () => startPractice(), startRetryWrong, startExam,
    resumeSession, dismissDraft, openCompose, submitEssay, backToHub,
    compose, setCompose: (patch) => setComposeState((x) => ({ ...x, ...patch })), setPhase, closeCompose, insertRef,
    registerTa: (key, el) => { taRefs.current[key] = el; },
    translateFromCompose: () => { L.flush(); return startPractice({ translateOnly: true }); },
    // runs
    addXP: page.addXP, saveTopicScore: (pct) => saveTopicScore(id, pct), saveAttempt, keepDraft,
    onRunState: (st) => {
      if (run && st.view && st.view !== run.view) setRun((r) => (r ? { ...r, view: st.view } : r));
      page.reportStats(st);
    },
    regQuit: (fn) => { quitRef.current = fn; },
    navStay: () => { if (blocker.state === 'blocked') blocker.reset(); },
    navGo: () => { if (blocker.state === 'blocked') blocker.proceed(); },
  };

  let body;
  if (isLoggedIn() && !data) body = <Spinner text="Đang tải..." pad={40} />;
  else if (runShown && runShown.kind === 'exam') body = <ExamRun key={runShown.seq} run={runShown} ctx={c} />;
  else if (runShown) body = <PracticeRun key={runShown.seq} run={runShown} ctx={c} />;
  else if (composeShown) body = <Compose c={c} />;
  else if (write && isLoggedIn() && (lesson.status === 'idle' || lesson.status === 'loading')) body = <Spinner text="Đang tải..." pad={40} />;
  else body = <Hub c={c} />;
  return (
    <>
      {body}
      {dialog === 'guide' && <TeacherGuide t={t} n={c.sessionNumber} vocabN={vocab.for === id ? vocab.list.length : 0} guide={guide} week={week} onClose={() => setDialog(null)} />}
      {dialog === 'preview' && <PreviewDialog topicId={id} level="all" onClose={() => setDialog(null)} />}
      {dialog && dialog.short != null && (
        <QuitDialog opts={{ mascot: '📝', title: 'Bài hơi ngắn', sub: `Bài mới có ${dialog.short} từ — đề yêu cầu ít nhất ${LESSON_MIN_WORDS} từ. Vẫn nộp để chấm?`, confirmText: 'Vẫn nộp', continueText: 'Viết thêm' }}
          onStay={() => setDialog(null)} onLeave={() => { const e = dialog.essay; setDialog(null); handIn(e); }} />
      )}
    </>
  );
}
