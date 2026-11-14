'use strict';
// Speaking Part 2 · 7 câu chuyện gốc — admin view (speaking-part2.html).
// The stories themselves are code-owned (backend/data/speakingPart2.js,
// versioned keys — see speakingPart2Service), so this is a read-only
// overview: the 7 stories with how many students started / mastered /
// finished each, plus every student's per-story progress.

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const { teacherOnly } = require('./_shared');
const SpeakingPart2Progress = require('../../models/SpeakingPart2Progress');
const User = require('../../models/User');
const svc = require('../../services/speakingPart2Service');

const router = express.Router();

// GET /api/admin/speaking-part2/overview?storyId=&userId=
router.get('/speaking-part2/overview', auth, teacherOnly, async (req, res) => {
  try {
    const q = {};
    if (req.query.storyId) q.storyId = String(req.query.storyId);
    if (req.query.userId && mongoose.isValidObjectId(req.query.userId)) q.userId = req.query.userId;
    const docs = await SpeakingPart2Progress.find(q).sort({ updatedAt: -1 }).limit(2000).lean();
    const users = await User.find({ _id: { $in: [...new Set(docs.map(d => String(d.userId)))] } })
      .select('firstName lastName username email role').lean();
    const uMap = new Map(users.map(u => [String(u._id), u]));

    const rows = [];
    for (const d of docs) {
      const u = uMap.get(String(d.userId));
      if (!u || u.role !== 'student') continue;
      const s = svc.adminSummary(d);
      if (!s) continue;
      rows.push({ ...s, userId: d.userId, name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username, email: u.email });
    }

    const stories = svc.STORIES.map((st) => {
      const mine = rows.filter(r => r.storyId === st.id);
      return {
        id: st.id, no: st.no, group: st.group, emoji: st.emoji, title: st.title,
        students: mine.length,
        mastered: mine.filter(r => r.masteredAt).length,
        completed: mine.filter(r => r.completedAt).length,
        avgPct: mine.length ? Math.round(mine.reduce((a, r) => a + r.pct, 0) / mine.length) : null,
      };
    });
    res.json({ success: true, version: svc.VERSION, passPercent: svc.PASS_PERCENT, stories, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
