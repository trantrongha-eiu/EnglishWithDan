// The student's saved recording(s) of one SpeakingAttempt (R2, kept 3
// months). A single question has `audioUrl`; a multi-question run (Part 1
// topic, Part 2 + 3, full mock, course exercise) has one clip per question
// in `audioClips`. Renders nothing when there is neither — callers show
// their own "no recording" note.
import { hasRecordings } from '../utils/speakingRecordings';

const player = { width: '100%', height: 34 };

export default function SpeakingRecordings({ attempt }) {
  if (!hasRecordings(attempt)) return null;
  const clips = attempt.audioClips || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {attempt.audioUrl && <audio controls preload="metadata" src={attempt.audioUrl} style={player} />}
      {clips.map((c, i) => (
        <div key={c.url}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 3 }}>
            <b>Câu {(Number.isFinite(c.index) ? c.index : i) + 1}</b>{c.question ? ` · ${c.question}` : ''}
          </div>
          <audio controls preload="none" src={c.url} style={player} />
        </div>
      ))}
    </div>
  );
}
