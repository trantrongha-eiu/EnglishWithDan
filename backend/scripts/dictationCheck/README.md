# Dictation accuracy check (sentence by sentence)

Checks every Luyện Dictation sentence by cutting its exact clip `[start, end]`
out of the section audio and re-transcribing it with faster-whisper — the only
check that matches what a student hears. (A cheap check against the section's
whole-file ASR caught only about half the real errors.) First run 2026-11-20:
19,124 sentences, ~2% bad → 265 re-timed, 92 dropped, 15 texts cleaned,
one section's stale dictation rebuilt.

Work dir: `D:/tmp-dictcheck` (anything outside the repo). Run from this folder.

1. Export `jobs.json` — one row per section `{ id, title, audioUrl, sents: [{ i, text, start, end }] }`
   of every active, non-course section with `dictationSentences` (see `listDictationSections`).
2. Re-transcribe each clip (resumable; ~41 clips/min with 3 workers × 4 threads on a 12-thread laptop;
   `BEAM=1` for the full pass, `BEAM=5` for re-checks):
   `ASR_THREADS=4 BEAM=1 py check_clips.py D:/tmp-dictcheck <worker 0..2> 3`
3. `node classify.js D:/tmp-dictcheck` → `classified.json`: ok / weak (only words heard differently —
   names, UK/US spelling: kept) / start-cut / end-cut / leak (a neighbour's words or
   "That is the end of part 3" inside the clip) / wrong.
   Merge the passes into `D:/tmp-dictcheck/all_classified.json`.
4. `node retime.js` → re-times the bad ones from `../data/transcriptAsr/s_<id>.json` (local ASR words,
   see alignTranscriptTiming.js) into `D:/tmp-dictcheck/pass2/jobs.json`; run step 2 (+3) on `pass2`
   with `BEAM=5`. Still cut? Widen the cut side by 0.3–0.35 s and check again — accept only with no
   extra words heard.
5. Build `{ retime: { id: [{ i, start, end }] }, drop: { id: [i] } }` and run
   `node ../fixDictationAccuracy.js --plan plan.json` (dry run), then `--apply` (backs up first).
   It also strips "Q14/15 -----", "Student 1 (Female):", "...:" from sentence text, and takes a
   section with < 5 sentences off the list.

A section whose sentences are ALL wrong usually has dictation built from an older transcript:
re-build it with `node ../bulkAlignListeningDictation.js --local-asr --ids <id>` instead of dropping.
