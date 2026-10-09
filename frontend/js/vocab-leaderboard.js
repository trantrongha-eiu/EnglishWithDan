/**
 * vocab-leaderboard.js — "BXH vocab" page (vocab-leaderboard.html): the
 * Top 10 streak and Top 10 Vocabulary-Lesson quiz leaderboards, moved off
 * the dashboard home screen onto their own page (2026-10-01), plus the
 * student's own standing ("Vị trí của bạn") from each board's `me` field —
 * shown in a tile above the boards and, when they rank below the top 10,
 * as a pinned row under the list.
 *
 * Needs: AuthService, ApiClient, escHtml (shared/utils.js), getFireTier
 * (shared/fire-tier.js), openPeerProfile (shared/peer-profile.js).
 */
(function () {
    'use strict';

    var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
    var RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

    function authH() {
        return Object.assign({ 'Content-Type': 'application/json' },
            window.AuthService ? window.AuthService.authHeader() : {});
    }

    function me() {
        return (window.AuthService && window.AuthService.getUser && window.AuthService.getUser()) || {};
    }
    function myId() { var u = me(); return u._id || u.id || null; }
    function myName() {
        var u = me();
        return ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || u.username || 'Bạn';
    }

    function mmss(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }

    // Shared row shell: rank/medal, avatar-or-initial, name, right-hand value.
    // Clicking someone else's row opens their peer profile.
    function rowHtml(rank, userId, name, avatarUrl, valueHtml) {
        var medal = RANK_MEDAL[rank];
        var avatar = avatarUrl
            ? '<img class="dan-lb-avatar" src="' + escHtml(avatarUrl) + '" alt="">'
            : '<span class="dan-lb-avatar-placeholder">' + escHtml((name || '?')[0].toUpperCase()) + '</span>';
        var isMe = String(userId) === String(myId());
        return '<div class="dan-lb-row' + (isMe ? ' is-me' : ' dan-lb-clickable') + '"'
            + (isMe ? '' : ' onclick="window.openPeerProfile(\'' + escHtml(String(userId)) + '\')"') + '>'
            + '<span class="dan-lb-rank' + (medal ? ' top' + rank : '') + '">' + (medal || rank) + '</span>'
            + avatar
            + '<span class="dan-lb-name">' + escHtml(name) + (isMe ? ' (Bạn)' : '') + '</span>'
            + (rank === 1 && window.Mascot ? '<span class="vlb-top-lulu" title="Lulu cổ vũ người dẫn đầu">' + window.Mascot.svg('cheer', { label: 'Lulu' }) + '</span>' : '')
            + valueHtml
            + '</div>';
    }

    // The caller's own row under the top N, when they rank lower.
    function pinnedMeRow(standing, shown, valueHtml) {
        if (!standing || !standing.rank || standing.rank <= shown) return '';
        return '<div class="vlb-gap" aria-hidden="true">⋯</div>'
            + rowHtml(standing.rank, myId(), myName(), me().avatar || '', valueHtml);
    }

    function streakValue(streak) {
        var tier = getFireTier(streak);
        var style = tier.cls ? '' : (tier.color ? ' style="color:' + tier.color + '"' : '');
        return '<span class="dan-lb-streak' + (tier.cls ? ' ' + tier.cls : '') + '"' + style + '><i class="fas fa-fire"></i> ' + streak + '</span>';
    }
    function quizValue(score, timeSpent) {
        return '<span class="dan-lb-quiz-score">' + score + '% <span class="dan-lb-quiz-time">· ' + mmss(timeSpent) + '</span></span>';
    }

    function fetchBoard(url) {
        return fetch(API + url, { headers: authH() })
            .then(function (res) { return window.ApiClient.handleResponse(res); });
    }

    function renderList(listEl, rows, emptyMsg, renderRow, pinnedHtml) {
        listEl.removeAttribute('aria-busy');
        listEl.innerHTML = rows.length
            ? rows.map(function (r, i) { return renderRow(r, i + 1); }).join('') + (pinnedHtml || '')
            : '<div class="dan-lb-empty">' + emptyMsg + '</div>';
    }
    function renderError(listEl) {
        listEl.removeAttribute('aria-busy');
        listEl.innerHTML = '<div class="dan-lb-empty">Không tải được bảng xếp hạng. '
            + '<button type="button" class="btn btn-ghost btn-sm" onclick="location.reload()">Thử lại</button></div>';
    }

    function rankValue(standing) {
        return standing.rank
            ? 'Hạng #' + standing.rank + '<small>/ ' + standing.total + ' học viên</small>'
            : 'Chưa xếp hạng';
    }

    function showMeTile(kind, valueHtml, subText) {
        var wrap = document.getElementById('vlb-me');
        document.getElementById('vlb-me-' + kind + '-value').innerHTML = valueHtml;
        document.getElementById('vlb-me-' + kind + '-sub').textContent = subText;
        if (wrap) wrap.hidden = false;
    }

    // Lulu's comment on the caller's best rank across both boards — updated
    // as each board arrives. Staff (never ranked) get a neutral line.
    var standings = { streak: undefined, quiz: undefined };
    function updateLulu() {
        var host = document.getElementById('vlb-lulu');
        if (!host || !window.Mascot || !window.Mascot.react) return;
        if (standings.streak === undefined || standings.quiz === undefined) return;
        var ranks = [standings.streak, standings.quiz]
            .map(function (s) { return s && s.rank; }).filter(Boolean);
        var best = ranks.length ? Math.min.apply(null, ranks) : null;
        var ranked = standings.streak || standings.quiz;
        var o;
        if (!ranked) o = { pct: 60, mood: 'happy', text: 'Cùng xem ai đang chăm học nhất nào! 👀' };
        else if (best === 1) o = { pct: 100, text: 'Cậu đang đứng TOP 1 đó! Lulu tự hào quá trời 👑' };
        else if (best && best <= 3) o = { pct: 80, text: 'Top 3 rồi nè! Thêm chút nữa là lên đỉnh luôn 🚀' };
        else if (best && best <= 10) o = { pct: 60, text: 'Cậu đang trong Top 10 — giữ phong độ nha 💪' };
        else if (best) o = { pct: 40, text: 'Hạng #' + best + ' — mỗi ngày học một chút là leo hạng liền!' };
        else o = { pct: 40, text: 'Chưa thấy tên cậu trên bảng… học 1 bài hôm nay để Lulu thấy tên cậu nha 🍊' };
        window.Mascot.react(host, o);
    }

    function loadStreakBoard() {
        var listEl = document.getElementById('dan-lb-list');
        if (!listEl) return;
        fetchBoard('/user/streak-leaderboard').then(function (data) {
            var rows = data.leaderboard || [];
            var s = data.me;
            standings.streak = s || null; updateLulu();
            renderList(listEl, rows, 'Chưa có ai đang giữ streak — hãy là người đầu tiên! 🔥',
                function (r, rank) { return rowHtml(rank, r._id, r.name, r.avatar, streakValue(r.streak)); },
                s ? pinnedMeRow(s, rows.length, streakValue(s.streak)) : '');
            if (!s) return;
            var sub;
            if (!s.rank) sub = 'Học ít nhất 1 bài hôm nay để bắt đầu chuỗi và có tên trên bảng.';
            else if (s.rank === 1) sub = s.streak + ' ngày liên tiếp — bạn đang dẫn đầu, giữ vững nhé! 👑';
            else if (s.nextStreak) sub = s.streak + ' ngày liên tiếp — kém người xếp trên ' + (s.nextStreak - s.streak) + ' ngày. Đừng bỏ ngày nào!';
            else sub = s.streak + ' ngày liên tiếp — học đều mỗi ngày để giữ hạng.';
            showMeTile('streak', rankValue(s), sub);
        }).catch(function () { renderError(listEl); standings.streak = null; updateLulu(); });
    }

    function loadQuizBoard() {
        var listEl = document.getElementById('quiz-lb-list');
        if (!listEl) return;
        fetchBoard('/vocabulary-lessons/leaderboard').then(function (data) {
            var rows = data.leaderboard || [];
            var q = data.me;
            standings.quiz = q || null; updateLulu();
            renderList(listEl, rows, 'Chưa có ai làm Quiz đủ điều kiện xếp hạng — hãy là người đầu tiên! ⏱',
                function (r, rank) { return rowHtml(rank, r.userId, r.name, r.avatar, quizValue(r.score, r.timeSpent)); },
                q ? pinnedMeRow(q, rows.length, q.rank ? quizValue(q.score, q.timeSpent) : '') : '');
            if (!q) return;
            var sub;
            if (!q.rank) sub = 'Làm một bài Quiz từ vựng (từ 5 câu trở lên) để có tên trên bảng.';
            else {
                sub = 'Điểm TB ' + q.score + '% · ' + q.attempts + ' lượt Quiz';
                if (q.rank === 1) sub += ' — bạn đang dẫn đầu! 👑';
                else if (q.nextScore != null && q.nextScore > q.score) sub += ' — kém hạng trên ' + (q.nextScore - q.score) + '%.';
                else sub += ' — bằng điểm hạng trên, làm nhanh hơn để vượt lên.';
            }
            showMeTile('quiz', rankValue(q), sub);
        }).catch(function () { renderError(listEl); standings.quiz = null; updateLulu(); });
    }

    function boot() {
        if (!window.AuthService || !window.AuthService.isLoggedIn()) {
            var next = 'vocab-leaderboard.html';
            location.href = (window.AuthService && window.AuthService.buildLoginUrl) ? window.AuthService.buildLoginUrl(next) : 'login.html?next=' + encodeURIComponent(next);
            return;
        }
        loadStreakBoard();
        loadQuizBoard();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
