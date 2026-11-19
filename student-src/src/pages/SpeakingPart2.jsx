import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { openUpgrade, setActivePractice, siteToast } from '../utils/shell';
import {
  DONE_TIPS, LULU, PASS, coachState, conclusionItems, createProgress, fixedItems, frameItems, framesOf, loadPrefs,
  mastery, reduceMotion, savePrefs, shuffle, vocabItems, whyItems,
} from '../utils/speakingPart2';
import Home from './speakingPart2/Home';
import Story from './speakingPart2/Story';
import Drill from './speakingPart2/Drill';
import Shadow from './speakingPart2/Shadow';
import FullDialog from './speakingPart2/FullDialog';
import { SpeakCtx } from './speakingPart2/context';
import { setSpeakingListener, speak, stopTts } from './speakingPart2/tts';

// 🎤 Speaking Part 2 · 7 câu chuyện gốc — /app/speaking-part2?story=<id>&variant=<k>
// (was speaking-part2.html). 7 master stories, content from
// GET /api/speaking-part2/content (Premium; others get the story list and the
// upgrade button). Each story: ① Đọc bài mẫu ② Từ vựng ③ Học thuộc 7 khung
// (🎙️ Nhại + ⌨️ Dịch, frame by frame, each opens at ≥70% of the one before)
// ④ Nói thử 2 phút. Progress: localStorage for speed, synced to the server
// (PUT /api/speaking-part2/progress/:story), which ticks the homework.

const BASE = '/speaking-part2';
const HOME_TITLE = 'Speaking Part 2 · 7 câu chuyện gốc – EnglishWithDan';

function scrollToStep(key) {
  const el = document.getElementById('sp2-step-' + key);
  if (el) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
}

function copyLink(storyId) {
  const url = window.location.origin + '/app' + BASE + (storyId ? '?story=' + storyId : '');
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(() => siteToast('Đã sao chép link', 'success'), () => siteToast(url));
  else siteToast(url);
}

function upgrade() {
  if (window.openUpgradeModal) openUpgrade();
  else siteToast('Nâng cấp Premium để học 7 câu chuyện gốc', 'warn');
}

// One address of the page (?story=… or the home): a new address starts a new
// Screen, so Back / Forward / links always land on a fresh story view.
function Screen({ data, store, bump, prefs, togglePref, shared, setShared, navState, coachSeen, onSeen, onFull }) {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const storyParam = search.get('story');
  const stories = data.stories;
  const locked = !!data.locked;
  const found = stories.find((s) => s.id === storyParam) || null;
  const st = found && !locked ? found : null;

  // A finder pick brings its WHY variant (and goes to step ③); so does ?variant= in a link
  const [start] = useState(() => {
    if (!st) return { variant: 0, focus: null };
    if (navState?.variant != null && navState.variant < st.why.length) return { variant: navState.variant, focus: 'learn' };
    const k = parseInt(search.get('variant'), 10);
    if (k >= 0 && k < st.why.length) return { variant: k, focus: 'learn' };
    return { variant: 0, focus: null };
  });
  const [view, setView] = useState(st ? 'story' : 'home'); // home · story · practice · shadow
  const [variant, setVariant] = useState(start.variant);
  const [run, setRun] = useState(null);
  const [sh, setSh] = useState(null);
  const [coachSay, setCoachSay] = useState(null);
  const [enter, setEnter] = useState(() => !!st && coachSeen !== st.id);
  const [scrollReq, setScrollReq] = useState({ to: start.focus || 'top' });
  const seq = useRef(0);
  const pokes = useRef(0);

  useEffect(() => { if (st) onSeen(st.id); }, [st, onSeen]);
  useEffect(() => () => stopTts(), []);

  // After a change of screen: back to the top, or to the step asked for
  useEffect(() => {
    if (scrollReq.to === 'top') { window.scrollTo(0, 0); return undefined; }
    const t = setTimeout(() => scrollToStep(scrollReq.to), 80);
    return () => clearTimeout(t);
  }, [scrollReq]);

  useEffect(() => {
    const t = setTimeout(() => {
      document.title = st ? st.no + ' · ' + st.title + ' – Speaking Part 2 – EnglishWithDan' : HOME_TITLE;
    }, 0);
    return () => clearTimeout(t);
  }, [st]);

  const practising = view === 'practice' || view === 'shadow';
  useEffect(() => { setActivePractice(practising); return () => setActivePractice(false); }, [practising]);

  if (!st) {
    return (
      <Home data={data} stories={stories} locked={locked} spOf={store.sp} finder={shared.finder} onFinder={(v) => setShared({ finder: v })}
        onOpen={(id, k) => {
          if (locked) { upgrade(); return; }
          navigate(BASE + '?story=' + encodeURIComponent(id), k != null ? { state: { variant: k } } : undefined);
        }}
        onFull={onFull} onUpgrade={upgrade} />
    );
  }

  const sp = () => store.sp(st.id);
  const celebrate = (text) => {
    setCoachSay((c) => ({ text, n: (c?.n || 0) + 1 }));
    siteToast(text, 'success');
  };
  function noteUnlocks(before) {
    const after = mastery(st, sp()); const fr = framesOf(st);
    for (let i = 1; i < after.frames.length; i++) {
      if (after.frames[i].open && !before.frames[i].open) { siteToast('🔓 Đã mở khoá Khung ' + (i + 1) + ' · ' + fr[i].h, 'success'); break; }
    }
    if (after.pct >= PASS && before.pct < PASS) {
      siteToast('🎉 Đã thuộc ' + after.pct + '% câu chuyện — đạt yêu cầu bài tập!', 'success');
      try { window.Mascot?.cheer?.(); } catch { /* none */ }
    }
  }
  function backToStory(focusStep) {
    stopTts();
    setRun(null); setSh(null);
    setView('story');
    setScrollReq({ to: focusStep || 'top' });
  }
  function leaveStory() { setEnter(false); setCoachSay(null); stopTts(); }

  function startRun(mode, opts = {}) {
    const p = sp();
    let items; let label; let runKey = null; let { k } = opts;
    if (mode === 'vocab') { items = vocabItems(st); label = '② Từ vựng'; runKey = 'vocab'; } else if (mode === 'frame') {
      const fm = mastery(st, p).frames[opts.f];
      if (!fm || !fm.open) { siteToast('Thuộc khung trước ≥' + PASS + '% để mở khung này nha', 'warn'); return; }
      const fr = framesOf(st)[opts.f];
      if (fr.kind === 'why') { if (k != null) setVariant(k); else k = variant; }
      items = frameItems(st, opts.f, k);
      label = '⌨️ Khung ' + (opts.f + 1) + (fr.kind === 'why' ? ' · WHY · ' + st.why[k].q : ' · ' + fr.h);
    } else if (mode === 'retry') { items = opts.items; label = '🔁 Ôn câu sai'; }
    if (!items || !items.length) return;
    // Vocab already partly known: only the rest, unless all of it is known
    // (then a full review). A frame is short: always the whole frame.
    if (!opts.all && mode === 'vocab') {
      const todo = items.filter((x) => !p.ok[x.key]);
      if (todo.length && todo.length < items.length) items = todo;
    }
    items = items.map((x) => ({ ...x }));
    if (prefs.shuffle) shuffle(items);
    leaveStory();
    setSh(null);
    seq.current += 1;
    setRun({ id: seq.current, mode, label, runKey, f: opts.f, k, items });
    setView('practice');
    window.scrollTo(0, 0);
  }

  function startShadow(fi, k, qsOnly) {
    const m = mastery(st, sp());
    if (!m.frames[fi] || !m.frames[fi].open) { siteToast('Thuộc khung trước ≥' + PASS + '% để mở khung này nha', 'warn'); return; }
    const f = framesOf(st)[fi];
    let kk = null;
    if (f.kind === 'why') { kk = k != null ? k : variant; setVariant(kk); }
    const qs = (qsOnly || frameItems(st, fi, kk)).map((x) => ({ ...x }));
    if (!qs.length) return;
    leaveStory();
    setRun(null);
    seq.current += 1;
    setSh({ id: seq.current, f: fi, k: kk, label: '🎙️ Khung ' + (fi + 1) + (f.kind === 'why' ? ' · WHY · ' + st.why[kk].q : ' · ' + f.h), qs });
    setView('shadow');
    window.scrollTo(0, 0);
  }

  const p = sp();
  if (view === 'practice' && run) {
    const stepOfRun = run.mode === 'vocab' ? 'vocab' : 'learn';
    return (
      <Drill key={run.id} st={st} run={run} prefs={prefs}
        onRight={(q) => { const x = sp(); const before = mastery(st, x); x.ok[q.key] = 1; store.save(st.id); bump(); if (!q.vocab) noteUnlocks(before); }}
        onFinish={(score) => { if (run.runKey) { sp().best[run.runKey] = score; store.save(st.id); } }}
        onQuit={() => backToStory(stepOfRun)}
        onRetry={(items) => startRun('retry', { items })}
        onAgain={() => (run.mode === 'retry' ? backToStory('learn') : startRun(run.mode, { f: run.f, k: run.k, all: true }))}
        onBack={() => backToStory(stepOfRun)} />
    );
  }
  if (view === 'shadow' && sh) {
    return (
      <Shadow key={sh.id} st={st} sh={sh} prefs={prefs} onPref={togglePref} p={p}
        frameMastery={(f) => { const m = mastery(st, sp()); return { fm: m.frames[f], nextF: m.frames[f + 1] }; }}
        onScore={(q, pct) => {
          const x = sp();
          const before = mastery(st, x);
          if (pct > (x.shadow[q.key] || 0)) { x.shadow[q.key] = pct; store.save(st.id); bump(); }
          noteUnlocks(before);
        }}
        onQuit={() => backToStory('learn')}
        onDich={(f, k) => startRun('frame', { f, k })}
        onNextFrame={(f) => startShadow(f, null)}
        onBack={() => backToStory('learn')}
        onWeak={(qs) => startShadow(sh.f, sh.k, qs)} />
    );
  }

  const act = {
    home: () => navigate(BASE),
    open: (id) => navigate(BASE + '?story=' + encodeURIComponent(id)),
    full: onFull,
    copyLink: () => copyLink(st.id),
    poke: () => {
      const c = coachState(st, sp());
      pokes.current += 1;
      const n = pokes.current;
      const tips = c.all ? DONE_TIPS : LULU[c.cur].tips;
      const text = n % 9 === 0 ? 'Ui da, cù lét tớ hoài! 🤭' : tips[n % tips.length];
      setCoachSay((x) => ({ text, mood: ['wink', 'excited', 'think', 'happy'][n % 4], jump: true, n: (x?.n || 0) + 1 }));
    },
    scrollStep: scrollToStep,
    scrollFrame: (i) => document.getElementById('sp2-frame-' + i)?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' }),
    toggleVi: () => { togglePref('vi'); setShared({ readOpen: true }); },
    listenAll: () => {
      setShared({ readOpen: true });
      speak(fixedItems(st).concat(whyItems(st, variant), conclusionItems(st)).map((x) => x.en), { mark: true });
    },
    variant: (k) => { setVariant(k); setShared({ readOpen: true }); stopTts(); },
    readOpen: (open) => setShared({ readOpen: open }),
    markRead: () => {
      sp().read = 1; store.save(st.id); bump();
      celebrate('Bước 1 xong! Giờ học từ vựng ăn điểm nha 📚');
      setTimeout(() => scrollToStep('vocab'), 400);
    },
    run: (mode, f, k) => startRun(mode, { f, k }),
    shadow: (f, k) => startShadow(f, k),
    pref: togglePref,
    mem: (mode) => setShared({ memMode: mode }),
    spoken: (quiet) => {
      const x = sp();
      const first = !(x.speak > 0);
      x.speak = (x.speak || 0) + 1; store.save(st.id); bump();
      if (first && !quiet) celebrate('Bước 4 xong! Cậu đã nói thử trọn bài rồi đó 🎤');
    },
  };
  return (
    <Story key={st.id} st={st} stories={stories} p={p} data={data} coachSay={coachSay} enter={enter}
      ui={{ prefs, variant, memMode: shared.memMode, readOpen: shared.readOpen }} act={act} />
  );
}

export default function SpeakingPart2() {
  const { user } = useAuth() || {};
  const location = useLocation();
  const [store] = useState(() => createProgress(user?._id || user?.id));
  const [, setRev] = useState(0);
  const bump = useCallback(() => setRev((x) => x + 1), []);
  const [boot, setBoot] = useState({ state: 'loading' });
  const [data, setData] = useState(null);
  const [prefs, setPrefs] = useState(loadPrefs);
  // Kept from one story to the next: the finder text, how ④ shows the talk, step ① open
  const [shared, setSharedState] = useState({ finder: '', memMode: 'full', readOpen: true });
  const setShared = useCallback((x) => setSharedState((s) => ({ ...s, ...x })), []);
  const [speaking, setSpeaking] = useState(null);
  const [coachSeen, setCoachSeen] = useState(null);
  const [fullId, setFullId] = useState(null);

  const load = useCallback(() => apiFetch('/speaking-part2/content').then(async (content) => {
    store.setContent(content.version, content.locked);
    if (!content.locked) {
      store.upgradeLocal();
      try { const pr = await apiFetch('/speaking-part2/progress'); store.merge(pr.progress || {}, content.stories || []); } catch { /* offline: local progress still works */ }
    }
    setData(content);
    setBoot({ state: 'ready' });
    // A story link without Premium: the list, and the upgrade popup
    if (content.locked && new URLSearchParams(window.location.search).get('story')) upgrade();
  }, (e) => setBoot({ state: 'error', cold: !!e?.coldStart })), [store]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setSpeakingListener(setSpeaking);
    return () => { setSpeakingListener(null); stopTts(); };
  }, []);

  // Unsent progress goes when the tab is hidden / closed, or the page is left
  useEffect(() => {
    const flush = () => { if (store.pending()) store.flush(true); };
    const onVis = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVis);
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onVis); flush(); };
  }, [store]);

  const togglePref = useCallback((k) => setPrefs((x) => { const n = { ...x, [k]: !x[k] }; savePrefs(n); return n; }), []);
  const say = useCallback((text) => speak([text], { mark: true }), []);
  const onFull = useCallback((id) => (data?.locked ? upgrade() : setFullId(id)), [data]);
  const closeFull = useCallback(() => setFullId(null), []);

  let body;
  if (boot.state === 'loading') {
    body = <div className="sp2-boot"><div className="wp-spinner" /><p>Đang tải 7 câu chuyện gốc…</p></div>;
  } else if (boot.state === 'error') {
    body = (
      <div className="sp2-boot"><p>Không tải được nội dung{boot.cold ? ' — máy chủ đang khởi động, thử lại sau vài giây' : ''}.</p>
        <button type="button" className="t2-primary" id="sp2-retry" onClick={() => { setBoot({ state: 'loading' }); load(); }}><i className="fas fa-redo" /> Thử lại</button></div>
    );
  } else {
    body = (
      <Screen key={location.key + location.search} data={data} store={store} bump={bump} prefs={prefs} togglePref={togglePref}
        shared={shared} setShared={setShared} navState={location.state} coachSeen={coachSeen} onSeen={setCoachSeen} onFull={onFull} />
    );
  }
  const fullStory = fullId && data?.stories.find((s) => s.id === fullId);

  return (
    <SpeakCtx.Provider value={{ speaking, say }}>
      <div id="app">{body}</div>
      {fullStory && <FullDialog st={fullStory} onClose={closeFull} />}
    </SpeakCtx.Provider>
  );
}
