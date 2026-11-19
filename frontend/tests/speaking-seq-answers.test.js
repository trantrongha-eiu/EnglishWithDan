/**
 * js/speaking.js — multi-question runs: an answer the student really gave must
 * not be saved as "không trả lời" when live speech-to-text gives no final text.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const read = (f) => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
let state;
let recognition;

class FakeRecognition {
  constructor() { recognition = this; this.start = jest.fn(); this.stop = jest.fn(); }
}

function speechEvent(results, resultIndex = 0) {
  return {
    resultIndex,
    results: results.map(([transcript, isFinal]) => Object.assign([{ transcript }], { isFinal })),
  };
}

function clip({ size = 400000, voicedMs = 20000, silent = false } = {}) {
  return { size, type: 'audio/webm', _voicedMs: voicedMs, _silent: silent };
}

async function upload(answer, blob) {
  state.seqAnswers = [{ questionId: 'q1', question: 'Q?', part: 3, ...answer }];
  window._stopAudioCapture = jest.fn().mockResolvedValue(blob);
  await window._seqUploadClip(0);
  const body = window.apiFetch.mock.calls[0][1].body;
  return { sentTranscribe: body.get('transcribe') === '1', answer: state.seqAnswers[0] };
}

beforeAll(() => {
  window.SpeechRecognition = FakeRecognition;
  window.AuthService = { requirePageAuth: () => false }; // keeps the page's init() from running
  window.showToast = jest.fn();
  window.toast = jest.fn();
  window.FormData = class { constructor() { this.m = new Map(); } append(k, v) { this.m.set(k, v); } get(k) { return this.m.get(k); } };
  window.eval(`${read('speaking-timer.js')}\n${read('speaking.js')}\nwindow.__speakingState = state;`);
  state = window.__speakingState;
  window.setupSeqRecognition();
});

beforeEach(() => {
  jest.clearAllMocks();
  window.apiFetch = jest.fn().mockResolvedValue({ url: 'https://media.test/a.webm', transcript: 'whisper heard the whole answer' });
  window.loadSeqQuestion = jest.fn();
  Object.assign(state, {
    seqActive: true, seqQueue: [{ _id: 'q1', question: 'Q?', part: 3 }, { _id: 'q2', question: 'Q2?', part: 3 }],
    seqIndex: 0, seqAnswers: [], seqClipJobs: [], seqIsRecording: true, seqFinalTranscript: '', seqInterimTranscript: '',
    _seqUserStoppedRecording: false, _seqAudioOnly: false, _seqConfirming: false, _seqRestartAttempts: 0,
  });
});

describe('words still being recognised', () => {
  beforeEach(() => { window._stopAudioCapture = jest.fn().mockResolvedValue(null); });

  test('count when the student moves on before they are finalised', () => {
    recognition.onresult(speechEvent([['more celebrities are in the news', false]]));
    window.confirmSeqAnswer();
    expect(state.seqAnswers[0].transcript).toBe('more celebrities are in the news');
  });

  test('are appended to the finalised text once', () => {
    recognition.onresult(speechEvent([['first part', true], ['second part', false]]));
    window.confirmSeqAnswer();
    expect(state.seqAnswers[0].transcript).toBe('first part second part');
  });

  test('survive recognition restarting by itself mid-answer', () => {
    jest.useFakeTimers();
    recognition.onresult(speechEvent([['said before the restart', false]]));
    recognition.onend();
    recognition.onresult(speechEvent([['said after it', false]]));
    window.confirmSeqAnswer();
    jest.useRealTimers();
    expect(state.seqAnswers[0].transcript).toBe('said before the restart said after it');
  });

  test('from the previous answer do not leak into the next one', () => {
    window.confirmSeqAnswer();
    recognition.onresult(speechEvent([['late words', true], ['more late words', false]]));
    expect(state.seqFinalTranscript).toBe('');
    expect(state.seqInterimTranscript).toBe('');
  });
});

describe('transcribing an answer from its recording', () => {
  test('an empty transcript with a spoken recording is transcribed', async () => {
    const { sentTranscribe, answer } = await upload({ transcript: '' }, clip());
    expect(sentTranscribe).toBe(true);
    expect(answer.transcript).toBe('whisper heard the whole answer');
  });

  test('a good live transcript is kept and not sent to Whisper', async () => {
    const { sentTranscribe, answer } = await upload({ transcript: 'a real live answer here' }, clip());
    expect(sentTranscribe).toBe(false);
    expect(answer.transcript).toBe('a real live answer here');
  });

  test.each([
    ['the silence timer skipped it', { transcript: '', autoSkipped: true }, clip()],
    ['the recording is silent', { transcript: '' }, clip({ silent: true })],
    ['almost no voice was heard', { transcript: '' }, clip({ voicedMs: 1000 })],
    ['the level meter did not run and the clip is tiny', { transcript: '' }, clip({ voicedMs: null, size: 9000 })],
  ])('not transcribed when %s', async (_name, answer, blob) => {
    const r = await upload(answer, blob);
    expect(r.sentTranscribe).toBe(false);
    expect(r.answer.transcript).toBe('');
  });

  test('no level reading: a clip of real length is still transcribed', async () => {
    expect((await upload({ transcript: '' }, clip({ voicedMs: null }))).sentTranscribe).toBe(true);
  });

  test('audio-only answers are always transcribed', async () => {
    expect((await upload({ transcript: '', audioOnly: true, autoSkipped: true }, clip({ voicedMs: 0 }))).sentTranscribe).toBe(true);
  });
});

test('the silence timer marks the answer as skipped', () => {
  jest.useFakeTimers();
  window._stopAudioCapture = jest.fn().mockResolvedValue(null);
  window.startSeqSilenceTimer();
  jest.advanceTimersByTime(6000);
  jest.useRealTimers();
  expect(state.seqAnswers[0].autoSkipped).toBe(true);
});
