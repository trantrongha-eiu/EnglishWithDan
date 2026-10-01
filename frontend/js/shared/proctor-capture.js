/**
 * shared/proctor-capture.js — mandatory screen share for every proctored
 * flow (Test Simulation, Full Mock Test, Entrance Test), used to take a
 * screenshot of what the student switched to each time they get a strike.
 *
 * A web page cannot see other tabs or apps on its own. The student shares
 * their ENTIRE screen once (getDisplayMedia, desktop browsers only); nothing
 * is recorded continuously — a single frame is grabbed ~1s after a strike
 * and uploaded to POST /api/proctor/shot for the teacher.
 *
 * Phones/tablets have no getDisplayMedia: ensureShare() resolves straight away
 * and strikes are reported with capture:'unsupported' so the teacher knows
 * why there's no screenshot.
 *
 * The three proctor engines (exam-proctor.js, mock-test.js,
 * entrance-test-proctor.js) call:
 *   ProctorCapture.ensureShare({ cancelable }) → Promise<boolean>  (gate overlay)
 *   ProctorCapture.isPicking()   — ignore blur while the browser's picker is open
 *   ProctorCapture.mode()        — 'screen' | 'unsupported' | 'none', sent with each strike
 *   ProctorCapture.shoot(ctx)    — screenshot + upload, after a strike
 *   ProctorCapture.onStopped(fn) — the student ended the share mid-test
 *   ProctorCapture.release()     — test over: stop sharing
 */
(function () {
  'use strict';

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function h() {
    return Object.assign({ 'Content-Type': 'application/json' },
      window.AuthService ? window.AuthService.authHeader() : {});
  }

  var SHOT_DELAY_MS = 1200;   // let the other tab/app actually paint first
  var SHOT_MAX_WIDTH = 1280;
  var PICKER_SETTLE_MS = 1500; // focus bounces around for a moment after the picker closes

  var _stream = null;
  var _video = null;
  var _picking = false;
  var _pickingTimer = null;
  var _stoppedHandler = null;
  var _gate = null;           // { el, promise } while the gate overlay is up

  function supported() {
    return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function');
  }
  function _track() { return _stream ? _stream.getVideoTracks()[0] : null; }
  function isLive() { var t = _track(); return !!(t && t.readyState === 'live'); }
  function mode() { return !supported() ? 'unsupported' : (isLive() ? 'screen' : 'none'); }
  function isPicking() { return _picking; }

  function _fsRoot() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.body;
  }

  function _attach(stream) {
    _stream = stream;
    if (!_video) {
      _video = document.createElement('video');
      _video.muted = true;
      _video.playsInline = true;
      _video.setAttribute('aria-hidden', 'true');
      // Kept in the DOM (not display:none) so browsers keep decoding frames.
      _video.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1';
      document.body.appendChild(_video);
    }
    _video.srcObject = stream;
    var p = _video.play(); if (p && p.catch) p.catch(function () {});
    var t = _track();
    if (t) {
      t.onended = function () {
        // Fires when the student clicks the browser's "Stop sharing" bar —
        // not on our own release() (track.stop() never fires 'ended').
        _stream = null;
        if (typeof _stoppedHandler === 'function') {
          try { _stoppedHandler(); } catch (_) {}
          ensureShare({ cancelable: false, reshare: true });
        }
      };
    }
  }

  function _pick() {
    _picking = true;
    clearTimeout(_pickingTimer);
    var opts = {
      video: { displaySurface: 'monitor', frameRate: { ideal: 2, max: 5 } },
      audio: false,
      selfBrowserSurface: 'exclude',
      surfaceSwitching: 'exclude',
      monitorTypeSurfaces: 'include'
    };
    return navigator.mediaDevices.getDisplayMedia(opts).then(function (stream) {
      var t = stream.getVideoTracks()[0];
      var surface = t && t.getSettings ? t.getSettings().displaySurface : null;
      // A single tab or window would only show that tab/window — useless as
      // evidence of what the student switched to. Browsers that don't report
      // displaySurface (older Safari/Firefox) are accepted as-is.
      if (surface && surface !== 'monitor') {
        stream.getTracks().forEach(function (x) { try { x.stop(); } catch (_) {} });
        var err = new Error('not-monitor'); err.code = 'not-monitor'; throw err;
      }
      _attach(stream);
    }).finally(function () {
      _pickingTimer = setTimeout(function () { _picking = false; }, PICKER_SETTLE_MS);
    });
  }

  function _ensureStyle() {
    if (document.getElementById('ews-pc-style')) return;
    var s = document.createElement('style');
    s.id = 'ews-pc-style';
    s.textContent = [
      '#ews-pc-gate{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.82);font-family:inherit}',
      '#ews-pc-gate .pc-box{background:var(--surface,#fff);color:var(--text,#111827);max-width:480px;width:100%;border-radius:16px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.35);text-align:center}',
      '#ews-pc-gate .pc-icon{font-size:40px;line-height:1;margin-bottom:10px}',
      '#ews-pc-gate h3{margin:0 0 8px;font-size:18px;font-weight:800}',
      '#ews-pc-gate p{margin:0 0 10px;font-size:13.5px;line-height:1.6;color:var(--text2,#4b5563)}',
      '#ews-pc-gate ol{margin:0 0 14px;padding-left:20px;text-align:left;font-size:13px;line-height:1.7;color:var(--text2,#4b5563)}',
      '#ews-pc-gate .pc-err{min-height:18px;margin:0 0 10px;font-size:13px;font-weight:700;color:#b91c1c}',
      '#ews-pc-gate .pc-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}',
      '#ews-pc-gate button{border:none;border-radius:10px;padding:11px 16px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}',
      '#ews-pc-gate .pc-go{background:#dc2626;color:#fff}',
      '#ews-pc-gate .pc-go:disabled{opacity:.6;cursor:wait}',
      '#ews-pc-gate .pc-cancel{background:transparent;color:var(--text2,#6b7280);text-decoration:underline}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // Shows the gate overlay until the student shares their entire screen.
  // Resolves true once sharing (or straight away on a device that can't),
  // false if they pressed "Huỷ" (only offered when opts.cancelable).
  function ensureShare(opts) {
    opts = opts || {};
    if (!supported() || isLive()) return Promise.resolve(true);
    if (_gate) return _gate.promise;
    _ensureStyle();

    var el = document.createElement('div');
    el.id = 'ews-pc-gate';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML =
      '<div class="pc-box">' +
        '<div class="pc-icon">🖥️</div>' +
        '<h3>' + (opts.reshare ? 'Bạn đã dừng chia sẻ màn hình' : 'Chia sẻ màn hình để làm bài có giám sát') + '</h3>' +
        (opts.reshare
          ? '<p>Dừng chia sẻ màn hình được tính là <b>1 lần vi phạm</b>. Hãy chia sẻ lại để tiếp tục làm bài.</p>'
          : '<p>Bài thi có giám sát. Mỗi lần bạn rời khỏi bài thi, hệ thống chụp <b>1 ảnh màn hình</b> gửi cho giáo viên. '
            + 'Không quay video, không chụp khi bạn đang làm bài bình thường.</p>') +
        '<ol><li>Bấm <b>Chia sẻ toàn bộ màn hình</b> bên dưới.</li>' +
        '<li>Trong hộp thoại của trình duyệt, chọn thẻ <b>Toàn bộ màn hình / Entire screen</b>.</li>' +
        '<li>Chọn màn hình rồi bấm <b>Chia sẻ / Share</b>.</li></ol>' +
        '<div class="pc-err" id="ews-pc-err"></div>' +
        '<div class="pc-actions">' +
          '<button type="button" class="pc-go" id="ews-pc-go">Chia sẻ toàn bộ màn hình</button>' +
          (opts.cancelable ? '<button type="button" class="pc-cancel" id="ews-pc-cancel">Huỷ</button>' : '') +
        '</div>' +
      '</div>';
    _fsRoot().appendChild(el);

    var resolveFn;
    var promise = new Promise(function (r) { resolveFn = r; });
    _gate = { el: el, promise: promise };

    function done(ok) {
      if (el.parentNode) el.parentNode.removeChild(el);
      _gate = null;
      resolveFn(ok);
    }
    var go = el.querySelector('#ews-pc-go');
    var err = el.querySelector('#ews-pc-err');
    go.onclick = function () {
      go.disabled = true;
      err.textContent = '';
      _pick().then(function () { done(true); }).catch(function (e) {
        go.disabled = false;
        err.textContent = e && e.code === 'not-monitor'
          ? 'Bạn cần chọn "Toàn bộ màn hình" (Entire screen), không chọn một thẻ hay một cửa sổ.'
          : 'Bạn chưa chia sẻ màn hình. Hãy bấm lại và chọn "Toàn bộ màn hình".';
      });
    };
    var cancel = el.querySelector('#ews-pc-cancel');
    if (cancel) cancel.onclick = function () { done(false); };
    go.focus();
    return promise;
  }

  // One JPEG frame of the shared screen as a data URL, or null.
  function capture() {
    var t = _track();
    if (!t || t.readyState !== 'live') return Promise.resolve(null);
    var grab = (typeof window.ImageCapture === 'function')
      ? new window.ImageCapture(t).grabFrame().catch(function () { return null; })
      : Promise.resolve(null);
    return grab.then(function (bitmap) {
      var src = bitmap || _video;
      var w = bitmap ? bitmap.width : (_video && _video.videoWidth);
      var hgt = bitmap ? bitmap.height : (_video && _video.videoHeight);
      if (!src || !w || !hgt) return null;
      var scale = Math.min(1, SHOT_MAX_WIDTH / w);
      var c = document.createElement('canvas');
      c.width = Math.round(w * scale);
      c.height = Math.round(hgt * scale);
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
      if (bitmap && bitmap.close) bitmap.close();
      return c.toDataURL('image/jpeg', 0.6);
    }).catch(function () { return null; });
  }

  // ctx: { context: 'simulation'|'mock'|'entrance', attemptId, type,
  //        skill?, attemptType? } — see backend/services/proctorShotService.js
  function shoot(ctx) {
    if (!ctx || !ctx.attemptId || ctx.type === 'unload-attempt' || !isLive()) return;
    setTimeout(function () {
      capture().then(function (image) {
        if (!image) return;
        fetch(API + '/proctor/shot', {
          method: 'POST', headers: h(),
          body: JSON.stringify(Object.assign({}, ctx, { image: image }))
        }).catch(function () {});
      });
    }, SHOT_DELAY_MS);
  }

  function onStopped(fn) { _stoppedHandler = fn || null; }

  function release() {
    _stoppedHandler = null;
    clearTimeout(_pickingTimer);
    _picking = false;
    if (_gate) { if (_gate.el.parentNode) _gate.el.parentNode.removeChild(_gate.el); _gate = null; }
    if (_stream) {
      _stream.getTracks().forEach(function (x) { try { x.onended = null; x.stop(); } catch (_) {} });
      _stream = null;
    }
    if (_video) _video.srcObject = null;
  }

  window.ProctorCapture = {
    supported: supported, isLive: isLive, mode: mode, isPicking: isPicking,
    ensureShare: ensureShare, capture: capture, shoot: shoot,
    onStopped: onStopped, release: release
  };
})();
