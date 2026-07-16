/**
 * shared/score-message.js — score-tiered emoji + reaction message for
 * quiz/test result screens (percentage 0-100).
 *
 * Extracted from writing-practice.html's original 4-tier scheme (the only
 * result screen that had text reacting to the score, not just a tiered
 * image) so Task 1 Grammar, Task 2 Writing quiz, and Vocab practice show
 * the same tone instead of a bare "Đúng X/Y câu" with no reaction.
 */
(function () {
  'use strict';

  function getScoreMessage(score) {
    if (score >= 80) return { emoji: '😎', message: 'Ôi học giỏi vậy? Đi dạy lại đi chứ 🔥' };
    if (score >= 60) return { emoji: '🤔', message: 'Tạm ổn đó... nhưng mà Daniel biết bạn làm được hơn 👀' };
    if (score >= 40) return { emoji: '🥲', message: 'Được hơn 40% rồi nhưng sai nhiều vậy là chưa ổn nha — cày thêm đi!' };
    return { emoji: '😤', message: 'Học cho đàng hoàng zô coiii!' };
  }

  window.getScoreMessage = getScoreMessage;
})();
