// speaking-course.html — IELTS Speaking (Khóa học)
// ══════════════════════════════════════════════════════════════════════
//  IELTS Speaking (Khóa học) — reuses the WT1 course stack, courseCode
//  IELTS-SPEAKING. The runner itself lives in js/shared/course-engine.js;
//  this file adds the speaking_response type (record → AI bands).
// ══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var E; // course-engine API — set by setup() before anything renders
  function esc(s) { return E.esc(s); }

  // target answer length per IELTS part — drives the live length-guide bar
  function speakGuide(part) {
    if (part === 2) return { lo: 90, hi: 120, txt: '1 phút 30 – 2 phút' };
    if (part === 3) return { lo: 45, hi: 90, txt: '45–90 giây / câu' };
    return { lo: 15, hi: 25, txt: '15–25 giây / câu' };
  }

  // ── speech recorder for speaking_response ──────────────────────────
  //   Prep countdown → mic toggle → live elapsed + length-guide bar →
  //   SpeechRecognition transcript (into #sc-transcript) + MediaRecorder
  //   playback blob. Best-effort: if an API is missing the student types
  //   the transcript by hand (the <details> opens automatically).
  var SpeakingRec = {
    rec: null, mr: null, stream: null, chunks: [], t0: 0, tick: null,
    prepT: null, finalText: '', recording: false, guide: null,
    supported: function () { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
    mount: function () {
      var self = this, ex = E.curEx();
      var mic = document.getElementById('sc-mic');
      if (!mic) return;
      this.finalText = '';
      this.guide = speakGuide((ex && ex.speakingPart) || 1);

      // Anti-cheat: the transcript is speech-to-text output the student may
      // hand-correct, never a pre-written answer pasted in — same rule (and
      // meme) as Speaking's standalone flow (js/speaking.js) and Writing's
      // essay boxes, via js/shared/paste-guard.js.
      if (window.PasteGuard) {
        var scTa = document.getElementById('sc-transcript');
        if (scTa) window.PasteGuard.attach(scTa, { hint: 'hãy nói hoặc gõ trực tiếp câu trả lời của bạn' });
      }

      if (!this.supported()) this.showNote('Trình duyệt này không tự nhận diện giọng nói (Chrome trên máy tính thường có). Bạn vẫn ghi âm được để nghe lại — hãy mở mục "Bản ghi lời nói" bên dưới và tự gõ nội dung trước khi nộp.', true);

      mic.addEventListener('click', function () { self.recording ? self.stop() : self.start(); });
      var skip = document.getElementById('sc-prep-skip');
      if (skip) skip.addEventListener('click', function () { self.endPrep(); });
      var redo = document.getElementById('sc-redo');
      if (redo) redo.addEventListener('click', function () { self.reset(); });

      // prep countdown
      var prepEl = document.getElementById('sc-prep');
      if (prepEl) {
        var left = parseInt(document.getElementById('sc-prep-n').textContent, 10) || 0;
        this.prepT = setInterval(function () {
          left--;
          var n = document.getElementById('sc-prep-n');
          if (n) n.textContent = left;
          if (left <= 0) self.endPrep();
        }, 1000);
      }
    },
    endPrep: function () {
      if (this.prepT) { clearInterval(this.prepT); this.prepT = null; }
      var p = document.getElementById('sc-prep'); if (p) p.remove();
      var mic = document.getElementById('sc-mic'); if (mic) mic.disabled = false;
      var lab = document.getElementById('sc-mic-label'); if (lab) lab.textContent = 'Bấm để bắt đầu ghi âm';
    },
    showNote: function (msg) {
      var n = document.getElementById('sc-note');
      if (n) { n.textContent = msg; n.classList.remove('hidden'); }
      var ts = document.getElementById('sc-ts'); if (ts) ts.open = true;
    },
    reset: function () {
      this.stop();
      this.finalText = ''; this.t0 = 0;
      var ta = document.getElementById('sc-transcript'); if (ta) ta.value = '';
      var au = document.getElementById('sc-audio'); if (au) { au.hidden = true; au.removeAttribute('src'); }
      var t = document.getElementById('sc-time'); if (t) t.hidden = true;
      var lw = document.getElementById('sc-lenwrap'); if (lw) lw.hidden = true;
      var redo = document.getElementById('sc-redo'); if (redo) redo.hidden = true;
      var mic = document.getElementById('sc-mic'); if (mic) { mic.classList.remove('rec'); mic.innerHTML = '<i class="fas fa-microphone"></i>'; }
      var lab = document.getElementById('sc-mic-label'); if (lab) lab.textContent = 'Bấm để bắt đầu ghi âm';
    },
    start: function () {
      var self = this;
      var mic = document.getElementById('sc-mic');
      var lab = document.getElementById('sc-mic-label');
      var timeEl = document.getElementById('sc-time');
      var lenWrap = document.getElementById('sc-lenwrap');
      var lenBar = document.getElementById('sc-lenbar');
      var interim = document.getElementById('sc-interim');
      var ta = document.getElementById('sc-transcript');
      var au = document.getElementById('sc-audio');
      this.finalText = (ta && ta.value.trim()) ? ta.value.trim() + ' ' : '';
      this.recording = true;
      if (au) { au.hidden = true; au.removeAttribute('src'); }
      if (mic) { mic.classList.add('rec'); mic.innerHTML = '<i class="fas fa-stop"></i>'; }
      if (lab) lab.textContent = 'Đang ghi âm — bấm để dừng';
      if (timeEl) { timeEl.hidden = false; timeEl.firstChild.textContent = '0:00'; }
      if (lenWrap) lenWrap.hidden = false;
      this.t0 = Date.now();
      this.tick = setInterval(function () {
        var s = Math.floor((Date.now() - self.t0) / 1000);
        if (timeEl) timeEl.firstChild.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
        if (lenBar) {
          var g = self.guide, pc = Math.min(100, Math.round(s / g.hi * 100));
          lenBar.firstElementChild.style.width = pc + '%';
          lenBar.classList.toggle('ok', s >= g.lo);
        }
      }, 250);

      // audio capture (optional)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
          self.stream = s; self.chunks = [];
          try {
            self.mr = new MediaRecorder(s);
            self.mr.ondataavailable = function (e) { if (e.data && e.data.size) self.chunks.push(e.data); };
            self.mr.onstop = function () {
              if (au && self.chunks.length) {
                au.src = URL.createObjectURL(new Blob(self.chunks, { type: self.chunks[0].type || 'audio/webm' }));
                au.hidden = false;
              }
            };
            self.mr.start();
          } catch (e) { /* ignore — transcription still works */ }
        }).catch(function () { self.showNote('Không truy cập được micro — hãy cho phép quyền micro, hoặc tự gõ lại nội dung bài nói vào ô "Bản ghi lời nói".'); });
      }

      // speech-to-text
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        var r = new SR();
        r.lang = 'en-US'; r.continuous = true; r.interimResults = true;
        r.onresult = function (e) {
          var live = '';
          for (var i = e.resultIndex; i < e.results.length; i++) {
            var res = e.results[i];
            if (res.isFinal) self.finalText += res[0].transcript + ' ';
            else live += res[0].transcript;
          }
          if (interim) interim.textContent = live;
          if (ta) ta.value = (self.finalText + live).replace(/\s+/g, ' ').trim();
        };
        r.onerror = function (ev) {
          if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
            self.showNote('Không dùng được dịch vụ nhận diện giọng nói. Hãy tự gõ lại nội dung bài nói vào ô "Bản ghi lời nói".');
          }
        };
        r.onend = function () { if (self.recording) { try { r.start(); } catch (e) { /* noop */ } } };
        try { r.start(); this.rec = r; } catch (e) { /* noop */ }
      }
    },
    // Returns a Promise that resolves once the recorded audio is actually
    // ready in this.chunks. MediaRecorder.stop() is asynchronous — its
    // buffered audio only lands via 'dataavailable' right before the 'stop'
    // event fires, both AFTER stop() returns. blob() used to be called
    // synchronously on the very next line in submit(), so this.chunks was
    // always still empty at that point — the real recording was silently
    // dropped every single time (never a timing coincidence), submit()
    // fell back to the transcript-only path, and if speech-to-text hadn't
    // caught anything either the AI graded an effectively empty answer.
    // Callers that don't care about the blob (mic click, reset, teardown)
    // can still call this without awaiting — every synchronous UI update
    // below still happens immediately, only the returned Promise is async.
    stop: function () {
      if (!this.recording && !this.rec && !this.mr) return Promise.resolve();
      this.recording = false;
      var mic = document.getElementById('sc-mic');
      var lab = document.getElementById('sc-mic-label');
      var interim = document.getElementById('sc-interim');
      var redo = document.getElementById('sc-redo');
      if (mic) { mic.classList.remove('rec'); mic.innerHTML = '<i class="fas fa-microphone"></i>'; }
      if (lab) lab.textContent = 'Đã ghi ' + this.elapsed() + ' giây — nghe lại, hoặc nộp cho AI chấm';
      if (interim) interim.textContent = '';
      if (redo) redo.hidden = false;
      if (this.tick) { clearInterval(this.tick); this.tick = null; }
      if (this.rec) { try { this.rec.stop(); } catch (e) { /* noop */ } this.rec = null; }
      var mr = this.mr, donePromise = Promise.resolve();
      if (mr && mr.state !== 'inactive') {
        donePromise = new Promise(function (resolve) {
          var settled = false;
          var finish = function () { if (settled) return; settled = true; clearTimeout(to); resolve(); };
          // Safety net — if 'stop' never fires (rare browser bug), don't
          // hang submit() forever; blob() just returns whatever was queued.
          var to = setTimeout(finish, 1500);
          mr.addEventListener('stop', finish, { once: true });
          try { mr.stop(); } catch (e) { finish(); }
        });
      }
      if (this.stream) { this.stream.getTracks().forEach(function (t) { t.stop(); }); this.stream = null; }
      return donePromise;
    },
    elapsed: function () { return this.t0 ? Math.round((Date.now() - this.t0) / 1000) : 0; },
    // The recorded audio Blob, or null. Sent to the server so Gemini grades
    // Pronunciation from the real recording. Only reliable after the Promise
    // from stop() has resolved — see its comment.
    blob: function () {
      if (!this.chunks || !this.chunks.length) return null;
      try { return new Blob(this.chunks, { type: this.chunks[0].type || 'audio/webm' }); }
      catch (e) { return null; }
    },
    teardown: function () {
      if (this.prepT) { clearInterval(this.prepT); this.prepT = null; }
      if (this.recording || this.rec || this.mr || this.stream) this.stop();
      this.finalText = ''; this.t0 = 0; this.chunks = [];
    }
  };

  // ── speaking_response: render / submit ────────────────────────────
  function renderSpeakingBody(ex) {
    var part = ex.speakingPart || 1;
    var G = speakGuide(part);
    var items = ex.items || [];
    var multi = items.length > 1;
    // Multi-item sets record + AI-grade ONE question at a time — mic shows
    // directly under the current question, "Nộp câu này" grades just it,
    // then the next question opens. E.state.itemIdx tracks which one;
    // clamped defensively in case a previous exercise left it pointing past
    // this one's (possibly shorter) item list.
    var curIdx = multi ? Math.min(E.state.itemIdx || 0, items.length - 1) : 0;
    var qs = items.map(function (it, i) {
      var cls = i === curIdx ? ' cur' : (i < curIdx ? ' said' : '');
      var num = i < curIdx ? '<i class="fas fa-check"></i>' : (i + 1);
      return '<div class="sc-q' + cls + '" data-qi="' + i + '"><span class="sc-qn">' + num + '</span><span>' + esc(it.prompt) + '</span></div>';
    }).join('');
    var prep = ex.speakingPrepSeconds || 0;
    return '<div class="sc-partbadge"><i class="fas fa-microphone"></i> IELTS Speaking · Part ' + part + '</div>' +
      (multi ? '<div style="font-size:12px;color:var(--text3,#9ca3af);margin-bottom:6px">Câu ' + (curIdx + 1) + '/' + items.length + ' — ghi âm và nộp riêng câu này để AI chấm ngay, rồi mới qua câu tiếp theo.</div>' : '') +
      '<div class="sc-qs">' + qs + '</div>' +
      '<div class="sc-panel" id="sc-panel">' +
        (prep ? '<div class="sc-prep" id="sc-prep"><div class="sc-prep-n" id="sc-prep-n">' + prep + '</div>' +
          '<div class="sc-prep-t">giây chuẩn bị (ghi từ khoá ra giấy) — hết giờ sẽ tự bật ghi âm</div>' +
          '<button type="button" class="sc-prep-skip" id="sc-prep-skip">Bỏ qua, ghi âm ngay</button></div>' : '') +
        '<button type="button" class="sc-mic" id="sc-mic"' + (prep ? ' disabled' : '') + '><i class="fas fa-microphone"></i></button>' +
        '<div class="sc-mic-label" id="sc-mic-label">' + (prep ? 'Đang chuẩn bị…' : 'Bấm để bắt đầu ghi âm') + '</div>' +
        '<div class="sc-time" id="sc-time" hidden>0:00<span class="u"> giây</span></div>' +
        '<div class="sc-lenwrap" id="sc-lenwrap" hidden><div class="sc-lenbar" id="sc-lenbar"><span></span></div>' +
          '<div class="sc-lentext">Mục tiêu độ dài: <b>' + G.txt + '</b></div></div>' +
        '<div class="sc-interim" id="sc-interim"></div>' +
        '<audio id="sc-audio" class="sc-audio" controls hidden></audio>' +
        '<button type="button" class="sc-redo" id="sc-redo" hidden><i class="fas fa-rotate-left"></i> Ghi âm lại</button>' +
      '</div>' +
      '<details class="sc-ts" id="sc-ts"><summary>Bản ghi lời nói — AI dùng ô này để chấm (có thể sửa lỗi chính tả)</summary>' +
        '<textarea class="t1-ta" id="sc-transcript" rows="5" style="margin-top:6px" placeholder="Lời nói của bạn sẽ tự hiện ở đây khi ghi âm. Nếu trình duyệt không tạo phụ đề, cứ nói bình thường — AI sẽ nghe bản ghi âm và chép lại lời thoại khi bạn nộp bài."></textarea>' +
      '</details>' +
      '<div class="sc-note hidden" id="sc-note"></div>' +
      E.rubricHint(ex) +
      ((ex.rubric && ex.rubric.commonErrors && ex.rubric.commonErrors.length)
        ? '<details class="t1-key" style="margin:6px 0 0"><summary>⚠️ Lỗi thường gặp cần tránh</summary><ul>' +
          ex.rubric.commonErrors.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></details>'
        : '');
  }

  async function submitSpeaking(ex) {
    var state = E.state;
    var btn = document.getElementById('t1-submit');
    var fb = document.getElementById('t1-fb');
    // Must await — see SpeakingRec.stop()'s comment: reading blob() before
    // the MediaRecorder's 'stop' event fires always returns null.
    if (SpeakingRec.recording) await SpeakingRec.stop();
    var ta = document.getElementById('sc-transcript');
    var transcript = ta ? ta.value.trim() : '';
    var _scBlob = SpeakingRec.blob();
    var _scHasAudio = _scBlob && _scBlob.size > 0;
    // No local speech-to-text is OK as long as we recorded audio — the
    // server transcribes it (mobile Safari/iOS, in-app webviews).
    if (!_scHasAudio && transcript.split(/\s+/).filter(Boolean).length < 5) {
      E.toast(transcript ? 'Bài nói quá ngắn — hãy nói (hoặc gõ) ít nhất một câu hoàn chỉnh.' : 'Chưa có nội dung — hãy ghi âm hoặc gõ lời thoại.', 'info');
      return;
    }
    var items = ex.items || [];
    var multi = items.length > 1;
    var curIdx = multi ? Math.min(state.itemIdx || 0, items.length - 1) : 0;
    state._submitting = true; btn.disabled = true;
    fb.className = 't1-fb';
    fb.innerHTML = '<div style="text-align:center;padding:20px"><div class="t1-spinner"></div><p style="color:#9ca3af;margin-top:8px;font-size:13px">AI đang chấm phần nói của bạn...</p></div>';
    fb.classList.remove('hidden'); fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    try {
      // Send the recording (if we captured one) as multipart so the AI can
      // grade pronunciation from real audio; fall back to JSON otherwise.
      var _blob = _scBlob;
      var _opts;
      if (_blob && _blob.size > 0) {
        var _fd = new FormData();
        _fd.append('exerciseCode', ex.code);
        _fd.append('transcript', transcript);
        _fd.append('duration', SpeakingRec.elapsed());
        if (multi) _fd.append('itemIndex', curIdx);
        var _ext = (_blob.type || '').indexOf('ogg') >= 0 ? 'ogg' : (_blob.type || '').indexOf('mp4') >= 0 ? 'm4a' : 'webm';
        _fd.append('audio', _blob, 'answer.' + _ext);
        _opts = { method: 'POST', body: _fd };
      } else {
        var _body = { exerciseCode: ex.code, transcript: transcript, duration: SpeakingRec.elapsed() };
        if (multi) _body.itemIndex = curIdx;
        _opts = { method: 'POST', body: JSON.stringify(_body) };
      }
      var sd = await E.api('/wt1/submit-speaking', _opts);
      // No genuine answer detected (silent recording, mic issue, nothing
      // actually said) — the server deliberately did NOT persist this as a
      // graded attempt (would have baked a phantom Band 0.0 into this
      // item/exercise that a student could never fix without redoing the
      // whole thing from item 1). Reset the recorder for the SAME
      // question instead of advancing or finishing — confirmed real
      // incident: a student's Band 0.0 on this exact exercise type.
      if (sd.noGenuineAnswer) {
        state._submitting = false; btn.disabled = false;
        fb.classList.add('hidden');
        E.toast(sd.message || 'Không phát hiện được nội dung trả lời — hãy ghi âm lại.', 'error');
        SpeakingRec.reset();
        return;
      }
      if (window.playOk) window.playOk();
      // Audio-only submit: show the transcript the AI produced from the recording.
      if (!transcript && sd.transcript && ta) {
        ta.value = sd.transcript;
        var _scDetails = ta.closest('details'); if (_scDetails) _scDetails.open = true;
        E.toast('AI đã nghe bản ghi âm và chép lại lời thoại của bạn.', 'info');
      }
      // Multi-item, not the last question yet — show THIS item's feedback
      // and wire "Câu tiếp theo" to advance within the SAME exercise,
      // instead of finishing it. isLast (or a single-item exercise, which
      // never sends itemIndex at all) falls through to the normal
      // whole-exercise result screen below. Deliberately leave
      // _submitting/btn.disabled alone here — the OLD recording panel
      // (and its "Nộp bài nói" button) for THIS item must stay disabled
      // until "Câu tiếp theo" re-renders a fresh one for the next item;
      // re-enabling it would let a stray extra click re-submit the same
      // (already-consumed) recording and start a second, orphaned draft.
      if (multi && sd.graded === 'speaking-item' && !sd.isLast) {
        showSpeakingItemFeedback(sd.feedback || {}, curIdx, items.length);
        return;
      }
      state._submitting = false; btn.disabled = false;
      state.answered = true; E.stopTimer();
      showSpeakingFeedback((multi ? sd.aggregate : sd.feedback) || {}, ex);
    } catch (e) {
      state._submitting = false; btn.disabled = false;
      fb.classList.add('hidden');
      E.toast((e && e.message) || 'Lỗi chấm bài nói', 'error');
    }
  }

  // speaking_response feedback — speakingService.gradeSpeaking shape:
  // { overallBand, fluency, vocabulary, grammar, pronunciation,
  //   overallFeedback, strengths[], mistakes[{original,corrected,reason}],
  //   improvements[], todaysFocus }.  strengths/improvements may hold
  // strings OR objects, mirror coerceToStringItems on the server.
  function scStr(x) {
    if (typeof x === 'string') return x;
    if (x && typeof x === 'object') return x.text || x.point || x.strength || x.suggestion || x.content || Object.values(x).find(function (v) { return typeof v === 'string'; }) || '';
    return x == null ? '' : String(x);
  }
  function scfBar(label, n) {
    var v = (n == null || isNaN(n)) ? 0 : Math.max(0, Math.min(9, n));
    var col = v >= 7 ? '#22c55e' : v >= 5 ? '#f59e0b' : '#ef4444';
    return '<div class="scf-bar"><span class="lb">' + label + '</span>' +
      '<span class="tk"><span style="width:' + Math.round(v / 9 * 100) + '%;background:' + col + '"></span></span>' +
      '<span class="v" style="color:' + col + '">' + (n != null && !isNaN(n) ? n : '–') + '</span></div>';
  }
  function scfSec(title, arr, icon) {
    var items = (arr || []).map(scStr).filter(Boolean);
    if (!items.length) return '';
    return '<div class="scf-sec"><div class="h">' + title + '</div><ul>' +
      items.map(function (i) { return '<li>' + (icon || '') + ' ' + esc(i) + '</li>'; }).join('') + '</ul></div>';
  }
  // Band ring + 4 criterion bars + strengths / fixes / suggestions — shared
  // by the whole-exercise summary and the per-question feedback.
  function speakingBody(f, scope, feedbackTitle) {
    var mistakes = f.mistakes || f.corrections || [];
    var b = f.overallBand;
    var ringCls = (b >= 7) ? 'hi' : (b >= 5) ? 'mid' : 'lo';
    return (b != null ? '<div class="scf-ring ' + ringCls + '"><span class="n">' + b + '</span><span class="l">Band</span></div>' +
        '<div style="text-align:center;font-size:12px;color:var(--text3,#9ca3af);margin-top:2px">Điểm ước lượng cho ' + scope + '</div>' : '') +
      '<div class="scf-bars">' +
        scfBar('Fluency', f.fluency) + scfBar('Vocabulary', f.vocabulary) + scfBar('Grammar', f.grammar) + scfBar('Pronunciation', f.pronunciation) +
      '</div>' +
      '<div style="font-size:11.5px;color:var(--text3,#9ca3af);margin:4px 0 2px">' +
        (f.pronunciationFromAudio ? '🔊 Pronunciation chấm trực tiếp từ bản ghi âm của bạn.' : 'ℹ️ Pronunciation ước lượng từ transcript (không có bản ghi âm để nghe).') +
      '</div>' +
      (f.overallFeedback ? '<div class="scf-sec"><div class="h">' + feedbackTitle + '</div>' + esc(f.overallFeedback) + '</div>' : '') +
      (scfSec('Điểm mạnh', f.strengths, '✅')) +
      (mistakes.length ? '<div class="scf-sec"><div class="h">Sửa lỗi</div>' + mistakes.map(function (c) {
        return '<div class="scf-fix">✎ <s style="color:#dc2626">' + esc(c.original) + '</s> → <span class="t1-model">' + esc(c.corrected) + '</span>' + (c.reason || c.note || c.explanation ? ' <span style="color:#6b7280">(' + esc(c.reason || c.note || c.explanation) + ')</span>' : '') + '</div>';
      }).join('') + '</div>' : '') +
      (scfSec('Gợi ý cải thiện', f.improvements || f.suggestions, '💡'));
  }
  function showSpeakingFeedback(f, ex) {
    if (ex) E.recordResult({ code: ex.code, label: ex.title || ('Bài ' + (E.state.exIdx + 1)), kind: 'speaking', band: f.overallBand });
    E.showFeedback(speakingBody(f, 'phần nói này', 'Nhận xét chung') +
      (f.todaysFocus ? '<div class="scf-sec"><div class="h">Trọng tâm luyện tiếp</div>' + esc(f.todaysFocus) + '</div>' : '') +
      ((ex && ex.rubric && ex.rubric.sampleAnswer)
        ? '<details class="scf-model"><summary>Xem bài mẫu Band 7/8</summary><div class="body">' + esc(ex.rubric.sampleAnswer) + '</div></details>'
        : ''));
  }

  // One question of a multi-item speaking_response exercise has just been
  // AI-graded on its own (see submitSpeaking()'s itemIndex path) — same rich
  // feedback layout as showSpeakingFeedback, but "next" advances to the
  // NEXT QUESTION within this same exercise (E.state.itemIdx++) instead of
  // the next exercise, and "Làm lại" only re-records this one question.
  // The whole-exercise summary (showSpeakingFeedback) only appears once the
  // server reports the last item's aggregate — see submitSpeaking()'s isLast check.
  function showSpeakingItemFeedback(f, idx, total) {
    var fb = document.getElementById('t1-fb');
    fb.className = 't1-fb';
    fb.innerHTML = '<div style="text-align:center;font-size:11px;font-weight:800;letter-spacing:.04em;color:var(--text3,#9ca3af);margin-bottom:6px">CÂU ' + (idx + 1) + ' / ' + total + '</div>' +
      speakingBody(f, 'câu này', 'Nhận xét') +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
        '<button class="t1-btn" id="t1-retry-item" style="flex:none"><i class="fas fa-rotate-left"></i> Ghi âm lại câu này</button>' +
        '<button class="t1-next" id="t1-next-item" style="flex:1;margin-top:0">Câu tiếp theo <i class="fas fa-arrow-right"></i></button>' +
      '</div>';
    fb.classList.remove('hidden'); fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Both buttons just re-render the current exercise — render() calls
    // SpeakingRec.teardown() (onBeforeRender) + rebuilds #t1-body fresh,
    // which is exactly "reset the mic panel for whichever item
    // E.state.itemIdx now points at". "Làm lại" leaves the index alone
    // (same question); "tiếp theo" advances it first.
    document.getElementById('t1-next-item').addEventListener('click', function () {
      E.state.itemIdx = idx + 1;
      E.render();
    });
    document.getElementById('t1-retry-item').addEventListener('click', function () {
      E.render();
    });
  }

  // The Speaking page's stylesheet predates the newer writing feedback
  // (wf-ring / wf-bars), so an AI-graded writing exercise here keeps the
  // compact band tiles.
  function band(l, n) { return '<div class="t1-band"><div class="n">' + (n != null ? n : '–') + '</div><div class="l">' + l + '</div></div>'; }
  function aiWritingBody(d) {
    var s = d.scores || {};
    return (d.bandEstimate != null ? '<div class="t1-fb-score">Band ' + d.bandEstimate + '</div>' : '') +
      '<div class="t1-bands">' +
        band('Task', s.taskAchievement) + band('Coherence', s.coherence) + band('Lexical', s.lexical) + band('Grammar', s.grammar) +
      '</div>' +
      (d.feedbackVi ? '<div style="font-size:13.5px;line-height:1.7">' + esc(d.feedbackVi) + '</div>' : '') +
      ((d.corrections || []).length ? '<div style="margin-top:8px;font-size:12.5px"><b>Sửa lỗi:</b>' + d.corrections.map(function (c) {
        return '<div style="margin-top:4px">✎ <s style="color:#dc2626">' + esc(c.original) + '</s> → <span class="t1-model">' + esc(c.corrected) + '</span>' + (c.note ? ' <span style="color:#6b7280">(' + esc(c.note) + ')</span>' : '') + '</div>';
      }).join('') + '</div>' : '');
  }

  window.CourseEngine.start({
    courseCode: 'IELTS-SPEAKING',
    overviewPath: '/wt1/overview?course=IELTS-SPEAKING',
    pagePath: '/speaking-course.html',
    cleanPath: /^\/speaking\/course\/([^/?#]+)$/,
    dictionaryKey: 'speaking-course',
    title: '🎤 IELTS Speaking — Khóa học',
    paywallTitle: 'Khoá học Speaking chỉ dành cho Premium',
    paywallBlurb: 'Trọn bộ 3 phần · 45 buổi: PHẦN I Part 1 Foundation (14 buổi), PHẦN II Part 2 Long Turn (15 buổi), PHẦN III Part 3 Discussion (16 buổi). Mỗi buổi có bài tập chấm tự động và một bài NÓI được AI chấm theo 4 tiêu chí.',
    premiumBlurb: 'Trọn bộ 45 buổi Part 1 · Part 2 · Part 3, mỗi buổi có bài NÓI được AI chấm',
    heroFallback: 'Khoá học Speaking theo sách Daniel Ha — trọn bộ 3 phần, 45 buổi.',
    heroClass: 'sc-hero',
    heroStatsExtra: '<span>Part 1 · 2 · 3</span>',
    // Part colour (p1/p2/p3) from the module code, e.g. SPK-P2-M1.
    moduleClass: function (m) { return 'p' + ((String(m.code).match(/SPK-P(\d)/) || [])[1] || '1'); },
    moduleProgress: false,
    ui: {
      cueColor: '#f43f5e',
      imageAlt: 'hình minh hoạ',
      zoom: false,
      essayMeter: false,
      plainTimer: true,
      plainScore: true,
      progressHtml: function (pct) {
        return '<div style="margin:0 20px;height:4px;border-radius:4px;background:var(--surface2,#eef2f7);overflow:hidden">' +
          '<span style="display:block;height:100%;width:' + pct + '%;background:linear-gradient(90deg,#f43f5e,#22c55e);border-radius:4px"></span></div>';
      },
      aiWritingBody: aiWritingBody,
    },
    // speaking_response is neither objective nor a writing type — it has its
    // own submit path (/wt1/submit-speaking) and feedback renderer.
    types: {
      speaking_response: {
        label: 'Nói',
        submitLabel: '<i class="fas fa-paper-plane"></i> Nộp bài nói để AI chấm',
        card: function (ex) {
          return {
            cls: ' spk',
            icon: '<i class="fas fa-microphone"></i> ',
            meta: ex.speakingPart ? ' <span style="font-weight:600;color:var(--text3,#9ca3af)">· Part ' + ex.speakingPart + ' · AI chấm</span>' : '',
          };
        },
        renderBody: renderSpeakingBody,
        bind: function () { SpeakingRec.mount(); },
        submit: submitSpeaking,
      },
    },
    setup: function (engine) { E = engine; },
    onBeforeRender: function () { SpeakingRec.teardown(); },
  });
})();
