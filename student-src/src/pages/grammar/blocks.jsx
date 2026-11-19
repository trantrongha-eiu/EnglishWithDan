import { useState } from 'react';

// The teaching blocks of an Essential Grammar lesson: nothing to grade here.

const YT_ID = /^[\w-]{11}$/;

export function Block({ icon, title, id, children }) {
  return (
    <div className="eg-block" id={id}>
      <div className="eg-block-label"><i className={`fas ${icon}`} /> {title}</div>
      {children}
    </div>
  );
}

const Overview = ({ data }) => <Block icon="fa-book-open" title="Tổng quan"><div className="eg-overview-text">{data.text}</div></Block>;
const Summary = ({ data }) => <Block icon="fa-flag-checkered" title="Tóm tắt"><div className="eg-summary-box">{data.text}</div></Block>;

const Formula = ({ data }) => (
  <Block icon="fa-calculator" title="Công thức">
    {(data.forms || []).map((f, i) => (
      <div className="eg-formula-card" key={i}>
        <div className="eg-formula-label">{f.label}</div>
        <div className="eg-formula-structure">{f.structure}</div>
        <div className="eg-formula-example">{f.example}</div>
      </div>
    ))}
  </Block>
);

const Usage = ({ data }) => (
  <Block icon="fa-lightbulb" title="Cách dùng">
    {(data.points || []).map((p, i) => (
      <div className="eg-usage-item" key={i}>
        <span className="eg-usage-bullet"><i className="fas fa-check" /></span>
        <div><div className="eg-usage-title">{p.title}</div><div className="eg-usage-desc">{p.description}</div></div>
      </div>
    ))}
  </Block>
);

const SignalWords = ({ data }) => (
  <Block icon="fa-tags" title="Dấu hiệu nhận biết">
    <div className="eg-chip-wrap">{(data.words || []).map((w, i) => <span className="eg-chip" key={i}>{w}</span>)}</div>
  </Block>
);

const Picture = ({ data }) => (
  <Block icon="fa-image" title="Hình minh họa">
    <div className="eg-image-wrap">
      <img className="eg-image" src={data.src} alt={data.caption || ''} loading="lazy" />
      {data.caption && <div className="eg-image-caption">{data.caption}</div>}
    </div>
  </Block>
);

const Examples = ({ data }) => (
  <Block icon="fa-quote-left" title="Ví dụ">
    {(data.items || []).map((ex, i) => (
      <div className="eg-example-item" key={i}><div className="eg-example-en">{ex.en}</div><div className="eg-example-vi">{ex.vi}</div></div>
    ))}
  </Block>
);

const Mistakes = ({ data }) => (
  <Block icon="fa-exclamation-triangle" title="Lỗi thường gặp">
    {(data.items || []).map((m, i) => (
      <div className="eg-mistake-item" key={i}>
        <div className="eg-mistake-wrong"><i className="fas fa-times" /> {m.wrong}</div>
        <div className="eg-mistake-right"><i className="fas fa-check" /> {m.right}</div>
        <div className="eg-mistake-note">{m.note}</div>
      </div>
    ))}
  </Block>
);

const Tips = ({ data }) => (
  <Block icon="fa-graduation-cap" title="Mẹo cho IELTS">
    {(data.tips || []).map((t, i) => (
      <div className="eg-tip-item" key={i}><i className="fas fa-star" style={{ color: '#f59e0b', marginTop: 2 }} /><span>{t}</span></div>
    ))}
  </Block>
);

const Comparison = ({ data }) => (
  <Block icon="fa-not-equal" title={data.title || 'So sánh'}>
    <div className="eg-cmp-wrap">
      <table className="eg-cmp-table">
        <thead><tr>{(data.headers || []).map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>{(data.rows || []).map((row, i) => <tr key={i}>{row.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </Block>
);

// Click-to-play: only the thumbnail loads until the student presses play
function VideoItem({ v }) {
  const [playing, setPlaying] = useState(false);
  const id = v.youtubeId;
  return (
    <div className="eg-video-item">
      {v.label && <div className="eg-video-label">{v.label}</div>}
      <div className="eg-video-frame">
        {playing
          ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          : (
            <button type="button" className="eg-video-poster" aria-label={`Phát video: ${v.title || ''}`} onClick={() => setPlaying(true)}>
              <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
              <span className="eg-video-play"><i className="fas fa-play" /></span>
              {v.duration && <span className="eg-video-dur">{v.duration}</span>}
            </button>
          )}
      </div>
      <div className="eg-video-meta">
        <div className="eg-video-title">{v.title || ''}</div>
        <a className="eg-video-src" href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube" /> {v.channel || 'YouTube'}</a>
      </div>
    </div>
  );
}

function Videos({ data }) {
  const videos = (data.videos || []).filter((v) => YT_ID.test(v.youtubeId || ''));
  if (!videos.length) return null;
  return <Block icon="fa-play-circle" title="Video bài giảng">{videos.map((v, i) => <VideoItem key={i} v={v} />)}</Block>;
}

export const TEACHING_BLOCKS = {
  overview: Overview, formula: Formula, usage: Usage, signal_words: SignalWords, image: Picture, examples: Examples,
  common_mistakes: Mistakes, ielts_tips: Tips, comparison: Comparison, summary: Summary, video: Videos,
};
