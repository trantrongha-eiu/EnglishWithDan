/* ═══════════════════════════════════════════════════════
   speaking-audio-store.js – Local (IndexedDB) audio recording storage

   Keeps recorded audio entirely on-device: zero server storage cost,
   instant playback, no upload delay, no MongoDB storage growth. Recordings
   are keyed by the SpeakingAttempt's MongoDB _id (once /analyze returns
   one — see speaking.js's analyzeTranscript()), so History can look one up
   again later — but only on the exact browser/device that made it;
   IndexedDB never syncs across devices.

   Now only a fallback: /api/speaking/analyze and /mock-submit save the
   recording to R2 (SpeakingAttempt.audioUrl, kept 3 months) and History
   plays that on any device. This local copy is written only when the
   server returned no audioUrl (upload failed / no R2 in dev), and is still
   read for older attempts made before cloud saving.
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const DB_NAME    = 'ewd-speaking-audio';
  const DB_VERSION = 1;
  const STORE      = 'recordings';

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) { reject(new Error('IndexedDB not supported')); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Best-effort by design: a failed save/read must never break the actual
  // practice flow, which works fine (score + feedback) without audio at all.
  async function saveAudioRecording(id, blob) {
    if (!id || !blob) return;
    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id: String(id), blob, savedAt: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (e) {
      console.warn('[SpeakingAudioStore] save failed:', e.message);
    }
  }

  async function getAudioRecording(id) {
    if (!id) return null;
    try {
      const db = await openDb();
      const row = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(String(id));
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      db.close();
      return row ? row.blob : null;
    } catch (e) {
      console.warn('[SpeakingAudioStore] read failed:', e.message);
      return null;
    }
  }

  // Opportunistic cleanup so this doesn't grow unbounded forever — called
  // once at page init (see speaking.js), not guaranteed to run every visit.
  async function pruneOldRecordings(maxAgeMs) {
    maxAgeMs = maxAgeMs || 30 * 24 * 3600 * 1000; // 30 days
    try {
      const db = await openDb();
      const cutoff = Date.now() - maxAgeMs;
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const req = tx.objectStore(STORE).openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) return;
          if (cursor.value.savedAt < cutoff) cursor.delete();
          cursor.continue();
        };
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (e) { /* non-critical */ }
  }

  window.SpeakingAudioStore = { saveAudioRecording, getAudioRecording, pruneOldRecordings };
})();
