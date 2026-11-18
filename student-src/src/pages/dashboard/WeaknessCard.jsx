import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { hasPremiumAccess } from '../../utils/plan';
import { openUpgrade } from '../../utils/shell';

// "Điểm cần cải thiện" — per skill the single weakest question type /
// criterion (GET /weakness) + a Vocabulary chip for weak notebook words
// (GET /vocabbook/weak). Port of dashboard.js loadWeaknessProfile; states:
// chips / empty (not enough data) / error (+ Thử lại) / locked (Premium).

const READING = {
  'true-false-ng': 'True/False/Not Given', 'yes-no-ng': 'Yes/No/Not Given', 'multiple-choice': 'Trắc nghiệm',
  'multi-answer-group': 'Chọn nhiều đáp án', 'fill-blank': 'Điền từ', 'sentence-completion': 'Hoàn thành câu',
  'matching-headings': 'Nối tiêu đề', 'matching-info': 'Nối thông tin', checkbox: 'Chọn nhiều đáp án', 'map-labelling': 'Gắn nhãn bản đồ',
};
const LISTENING = {
  'multiple-choice': 'Trắc nghiệm', 'fill-blank': 'Điền từ', 'sentence-completion': 'Hoàn thành câu', matching: 'Nối thông tin',
  'map-labelling': 'Gắn nhãn bản đồ', checkbox: 'Chọn nhiều đáp án', 'multi-answer-group': 'Chọn nhiều đáp án', 'matching-info': 'Nối thông tin',
};
const WRITING = { ta: 'Task Achievement/Response', cc: 'Mạch lạc & Liên kết', lr: 'Từ vựng', gra: 'Ngữ pháp' };
const SPEAKING = { fluency: 'Độ trôi chảy', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', pronunciation: 'Phát âm' };

// a malformed row degrades to "0%" / "Band 0.0", never crashes the card
const pct = (w) => `${Math.round((Number(w.accuracy) || 0) * 100)}% đúng`;
const band = (w) => `Band ${(Number(w.avgScore) || 0).toFixed(1)}`;

function buildChips(data, weakWords) {
  const chips = [];
  const r = data.reading?.[0], l = data.listening?.[0], wr = data.writing?.[0], sp = data.speaking?.[0];
  if (r) chips.push({ icon: 'fa-book-open', color: 'blue', skill: 'Reading', label: READING[r.type] || r.type, detail: pct(r), href: '/reading.html' });
  if (l) chips.push({ icon: 'fa-headphones', color: 'purple', skill: 'Listening', label: LISTENING[l.type] || l.type, detail: pct(l), href: '/listening.html' });
  if (wr) chips.push({ icon: 'fa-pen-nib', color: 'pink', skill: 'Writing', label: WRITING[wr.criterion] || wr.criterion, detail: band(wr), href: '/writing.html' });
  if (sp) chips.push({ icon: 'fa-microphone', color: 'orange', skill: 'Speaking', label: SPEAKING[sp.criterion] || sp.criterion, detail: band(sp), href: '/speaking.html' });
  if (weakWords.length) {
    chips.push({
      icon: 'fa-bookmark', color: 'green', skill: 'Vocabulary',
      label: weakWords.length >= 20 ? '20+ từ yếu' : `${weakWords.length} từ yếu`, detail: 'Luyện từ vựng yếu', to: '/dashboard/practice?src=weak',
    });
  }
  return chips;
}

function ChipBody({ c }) {
  return (
    <>
      <div className="weakness-chip-icon"><i className={`fas ${c.icon}`} /></div>
      <div className="weakness-chip-body">
        <div className="weakness-chip-skill">{c.skill}</div>
        <div className="weakness-chip-label">{c.label}</div>
        <div className="weakness-chip-detail">{c.detail}</div>
      </div>
    </>
  );
}

const fetchWeakness = () => Promise.all([apiFetch('/weakness'), apiFetch('/vocabbook/weak?limit=20')])
  .then(([data, weak]) => ({ chips: buildChips(data || {}, weak?.words || []) }))
  .catch(err => (err?.body?.requiresPremium ? { locked: true } : { error: true }));

export default function WeaknessCard() {
  const navigate = useNavigate();
  const [locked] = useState(() => !hasPremiumAccess());
  const [st, setSt] = useState(null); // null = loading | { chips } | { error } | { locked }

  const load = useCallback(() => fetchWeakness().then(setSt), []);
  useEffect(() => { if (!locked) load(); }, [locked, load]);

  const view = locked ? { locked: true } : st;
  return (
    <div className="weakness-card" style={{ marginBottom: 24 }}>
      <div className="weakness-card-title"><i className="fas fa-bullseye" /> Điểm cần cải thiện</div>
      {!view && <div className="weakness-state"><div className="weakness-state-sub">Đang tải…</div></div>}
      {view?.locked && (
        <div className="weakness-state">
          <div className="weakness-state-icon"><i className="fas fa-crown" /></div>
          <div className="weakness-state-title">Phân tích điểm yếu là tính năng Premium</div>
          <button className="btn btn-primary btn-sm" onClick={() => openUpgrade()}>Nâng cấp Premium</button>
        </div>
      )}
      {view?.error && (
        <div className="weakness-state">
          <div className="weakness-state-icon weakness-state-icon--error"><i className="fas fa-triangle-exclamation" /></div>
          <div className="weakness-state-title">Unable to load your insights.</div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSt(null); load(); }}>Thử lại</button>
        </div>
      )}
      {view?.chips && !view.chips.length && (
        <div className="weakness-state">
          <div className="weakness-state-icon"><i className="fas fa-seedling" /></div>
          <div className="weakness-state-title">Personalized insights are not ready yet.</div>
          <div className="weakness-state-sub">Complete a few practice sessions to discover your weak areas.</div>
          <a className="btn btn-primary btn-sm" href="/reading.html">Luyện ngay</a>
        </div>
      )}
      {view?.chips?.length > 0 && (
        <div className="weakness-chips">
          {view.chips.map(c => (c.href
            ? <a key={c.skill} className={`weakness-chip weakness-chip--${c.color}`} href={c.href}><ChipBody c={c} /></a>
            : (
              <div key={c.skill} className={`weakness-chip weakness-chip--${c.color}`} role="button" tabIndex={0}
                onClick={() => navigate(c.to)} onKeyDown={(e) => { if (e.key === 'Enter') navigate(c.to); }}>
                <ChipBody c={c} />
              </div>
            )))}
        </div>
      )}
    </div>
  );
}
