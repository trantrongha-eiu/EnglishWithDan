'use strict';

// Was declared identically (byte-for-byte, verified) in routes/writingPractice.js,
// routes/task1Practice.js, and routes/task2Practice.js. Each file's `normalize()`
// differs (task2's does no contraction-expansion or number-word conversion,
// unlike writingPractice's/task1's), so only this piece was safe to unify —
// merging normalize() would silently change grading results for real answers.
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// Byte-identical between task1PracticeService.js and writingPracticeService.js
// (both use it inside their own, genuinely-different normalize() functions).
const NUM_WORDS = { '1':'one','2':'two','3':'three','4':'four','5':'five',
  '6':'six','7':'seven','8':'eight','9':'nine','10':'ten' };

module.exports = { levenshtein, NUM_WORDS };
