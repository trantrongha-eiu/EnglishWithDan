const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const DifficultWord = require('../models/DifficultWord');

// GET / — words with wrongCount >= 3 for current user, sorted hardest first
router.get('/', auth, async (req, res) => {
    try {
        const words = await DifficultWord.find({ userId: req.user._id, wrongCount: { $gte: 3 } })
            .sort({ wrongCount: -1, lastWrongAt: -1 })
            .lean();
        res.json({ success: true, words });
    } catch (e) {
        console.error('[DifficultWords] GET / error:', e);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// POST /report — upsert wrong words from any practice session
router.post('/report', auth, async (req, res) => {
    try {
        const { words = [], source = '' } = req.body;
        if (!words.length) return res.json({ success: true });

        const ops = words.map(w => ({
            updateOne: {
                filter: { userId: req.user._id, word: w.word },
                update: {
                    $inc: { wrongCount: 1 },
                    $setOnInsert: {
                        userId:       req.user._id,
                        word:         w.word,
                        meaning:      w.meaning      || '',
                        phonetic:     w.phonetic     || '',
                        partOfSpeech: w.partOfSpeech || '',
                        example:      w.example      || '',
                        source:       w.source || source,
                        addedAt:      new Date()
                    },
                    $set: { lastWrongAt: new Date() }
                },
                upsert: true
            }
        }));

        await DifficultWord.bulkWrite(ops);
        res.json({ success: true });
    } catch (e) {
        console.error('[DifficultWords] POST /report error:', e);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// PATCH /:id — edit meaning
router.patch('/:id', auth, async (req, res) => {
    try {
        const updates = {};
        if (req.body.meaning  !== undefined) updates.meaning  = req.body.meaning;
        if (req.body.phonetic !== undefined) updates.phonetic = req.body.phonetic;
        const doc = await DifficultWord.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: updates },
            { new: true }
        );
        if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
        res.json({ success: true, word: doc });
    } catch (e) {
        console.error('[DifficultWords] PATCH /:id error:', e);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// DELETE /:id — remove word from list
router.delete('/:id', auth, async (req, res) => {
    try {
        await DifficultWord.deleteOne({ _id: req.params.id, userId: req.user._id });
        res.json({ success: true });
    } catch (e) {
        console.error('[DifficultWords] DELETE /:id error:', e);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
