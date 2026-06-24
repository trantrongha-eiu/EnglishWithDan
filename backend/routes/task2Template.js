const router = require('express').Router();
const auth   = require('../middleware/auth');
const Task2TemplateAttempt = require('../models/Task2TemplateAttempt');

// POST /api/task2template/save
router.post('/save', auth, async (req, res) => {
  try {
    const { templateType, templateName, totalItems, correctItems } = req.body;
    if (!templateType || totalItems == null || correctItems == null)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    await Task2TemplateAttempt.create({
      userId: req.user._id,
      templateType, templateName,
      totalItems: Number(totalItems),
      correctItems: Number(correctItems)
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/task2template/history
router.get('/history', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const attempts = await Task2TemplateAttempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('templateType templateName totalItems correctItems createdAt')
      .lean();
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
