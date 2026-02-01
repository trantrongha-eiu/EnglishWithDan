const router = require('express').Router();
const Reading = require('../models/ReadingTest');

// Lấy danh sách bài test
router.get('/', async (req, res) => {
    try {
        const tests = await Reading.find();
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: "Lỗi Server khi lấy dữ liệu" });
    }
});

// Lấy chi tiết 1 bài test theo ID
router.get('/:id', async (req, res) => {
    try {
        const test = await Reading.findById(req.params.id);
        if (!test) return res.status(404).json({ error: "Không tìm thấy bài test" });
        res.json(test);
    } catch (err) {
        res.status(500).json({ error: "ID không hợp lệ" });
    }
});

module.exports = router;