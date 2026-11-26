// Bridge to the static site shell loaded by index.html (js/bundles/app-shell.js
// and friends): upgrade modal, badge popup, learning popups, nav.js hooks.
import { useEffect, useState } from 'react';

export const openUpgrade = (reason) => window.openUpgradeModal?.(reason);

// The site's own toast and confirm popup (js/shared/toast.js, confirm-dialog.js)
export const siteToast = (msg, type = 'info', ms) => window.showToast?.(msg, type, ms);
export const siteToastTitled = (type, title, msg, ms) => window.showToastWithTitle?.(type, title, msg, ms);
export function siteConfirm(title, msg, confirmLabel, onOk) {
  if (window.confirmDialog) window.confirmDialog(title, msg, onOk, { confirmLabel, confirmClass: 'btn-primary' });
  else if (window.confirm(msg)) onOk();
}

// Linh thú art (js/shared/pets.js): nav.js adds that script after the app starts
export function usePets() {
  const [pets, setPets] = useState(() => window.Pets || null);
  useEffect(() => {
    if (pets) return undefined;
    const started = Date.now();
    const timer = setInterval(() => {
      if (window.Pets) setPets(window.Pets);
      if (window.Pets || Date.now() - started > 15000) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [pets]);
  return pets;
}

// Any API answer may carry newly unlocked badges
export function showBadges(data) {
  if (data?.newlyUnlocked?.length) window.showBadgeUnlocked?.(data.newlyUnlocked);
  return data;
}

// nav.js keeps its full-screen notices away from a running practice
let activePractice = false;
export function setActivePractice(on) { activePractice = !!on; }
export const isActivePractice = () => activePractice;

// Lulu's speech bubble next to a "Hỏi Lulu" button
export const luluSay = (btn, text) => window.AskLulu?.say?.(btn, text);

// Closing the tab or following a site-menu link mid-quiz: the browser asks first
export function useLeaveWarning(active) {
  useEffect(() => {
    if (!active) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [active]);
}

// Today's plan popup → practice finished (dashboard.js showResults)
export function reportLearningResult({ correct, answered, wrong }) {
  const L = window.EWSLearning;
  if (!L?.consumeStart?.('vocabulary')) return;
  const pct = answered ? Math.round((correct / answered) * 100) : 0;
  L.showReviewPopup('vocabulary', {
    emoji: pct >= 80 ? '🎉' : '📚',
    scoreLabel: `${correct}/${answered} đúng`,
    subLabel: wrong > 0 ? `${wrong} từ cần ôn lại` : '',
    nextAction: wrong > 0 ? 'Luyện lại các từ sai, rồi tiếp tục kế hoạch.' : 'Kết quả tốt — giữ vững nhé!',
  });
}

// Goal-setup / today's plan popup: once the first-visit tour is done, and
// after nav.js's one-time overlays are gone (dashboard.js fireAutoShowWhenClear)
export function autoShowLearningPopup(attempt = 0) {
  const L = window.EWSLearning;
  if (!L) return;
  if (attempt === 0) {
    let seen = true;
    try { seen = localStorage.getItem('ews_onboarding_tour_v1_dashboard.html') === '1'; } catch { /* private mode */ }
    if (!seen) return;
  }
  const blocked = ['nav-streak35-notice-overlay', 'nav-vocab-inactivity-overlay'].some(id => document.getElementById(id));
  if (blocked && attempt < 40) { setTimeout(() => autoShowLearningPopup(attempt + 1), 300); return; }
  L.autoShow();
}

// Double-click / drag-select lookup (js/shared/dictionary-lookup.js). The
// optional gate returns false while the text must not be looked up (a quiz).
export function bindDict(id, source, gate) {
  window.setupDictionaryDouble?.(id, source, gate);
}

export function scoreMessage(pct) {
  return window.getScoreMessage?.(pct) || { emoji: '', message: '' };
}

// Lulu's reaction as HTML (fixed copy from the shared mascot); null if absent
export const mascotHtml = (opts) => window.Mascot?.reactHtml?.(opts) || null;

export function resultImage(pct) {
  if (pct >= 90) return '/img/vocab_writingabove90%25.jpg';
  if (pct >= 70) return '/img/above7.5.jpg';
  if (pct >= 50) return '/img/vocab50_70%25.jpg';
  if (pct >= 20) return '/img/vocabbelow50%25.jpg';
  return '/img/listening_readingbelow20%25.jpg';
}

export function spawnConfetti(count = 60) {
  const colors = ['#e53935', '#3d8bff', '#22c55e', '#f59e0b', '#a78bfa', '#fb7185', '#34d399'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-particle';
    const size = 5 + Math.random() * 8;
    el.style.cssText = `left:${8 + Math.random() * 84}%;background:${colors[Math.floor(Math.random() * colors.length)]};`
      + `animation:confettiFall ${0.9 + Math.random() * 1.3}s ${Math.random() * 0.35}s linear forwards;`
      + `width:${size}px;height:${size}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

// Fullscreen shows only #view-unit's subtree, so the dictionary popups must
// move inside it while it lasts (dashboard.js fullscreenchange handler).
if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', () => {
    const fs = document.fullscreenElement;
    for (const id of ['dict-popup', 'dict-vocab-modal']) {
      const m = document.getElementById(id);
      if (!m) continue;
      if (fs && !fs.contains(m)) { m._fsPrev = m.parentNode; fs.appendChild(m); }
      else if (!fs && m._fsPrev) { m._fsPrev.appendChild(m); m._fsPrev = null; }
    }
  });
}
