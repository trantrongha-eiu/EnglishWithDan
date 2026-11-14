// True when a SpeakingAttempt has a saved recording to play: `audioUrl`
// (one question) or `audioClips` (one per question of a multi-question run).
export function hasRecordings(a) {
  return !!(a && (a.audioUrl || (a.audioClips || []).length));
}
