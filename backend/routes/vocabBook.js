const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const requirePremium = require('../middleware/requirePremium');
const vocabBookController = require('../controllers/vocabBook.controller');

// Vocab used to be entirely free/ungated (the intentional free-tier hook).
// Per the free-plan model change, it's now gated the same as every other
// skill: full access for a free account's first 24h, then locked (see
// backend/utils/plan.js's hasFullAccess). GET / (listBooks) is the one
// exception — kept open so a locked-out student's dashboard still shows
// their book list instead of an error page, mirroring how Reading/
// Listening still show their test list for free.
const fullAccess = requirePremium();

// GET /api/vocabbook/  – lấy tất cả sổ của user (kèm số từ)
router.get('/', auth, vocabBookController.listBooks);

// PUT /api/vocabbook/reorder  – lưu thứ tự sổ sau khi kéo thả
router.put('/reorder', auth, fullAccess, vocabBookController.reorderBooks);

// POST /api/vocabbook/practice-complete
router.post('/practice-complete', auth, fullAccess, vocabBookController.completePractice);

// GET /api/vocabbook/review/due  – từ cần ôn tập hôm nay (spaced repetition)
// — must stay above /:id, same reason as /reorder and /practice-complete.
router.get('/review/due', auth, fullAccess, vocabBookController.getDueWords);

// GET /api/vocabbook/stats  – tổng số từ/đã thuộc/cần ôn/yếu trên TẤT CẢ sổ
// — must stay above /:id, same reason as /reorder and /review/due.
router.get('/stats', auth, fullAccess, vocabBookController.getVocabStats);

// GET /api/vocabbook/weak  – top N từ yếu (wrongCount>=3) trên TẤT CẢ sổ,
// dùng cho Weakness card + tile "Từ yếu" trên dashboard — must stay above /:id.
router.get('/weak', auth, fullAccess, vocabBookController.getWeakWords);

// GET /api/vocabbook/:id  – lấy chi tiết 1 sổ (có words)
router.get('/:id', auth, fullAccess, vocabBookController.getBook);

// POST /api/vocabbook/  – tạo sổ mới
router.post('/', auth, fullAccess, vocabBookController.createBook);

// PUT /api/vocabbook/:id  – đổi tên / emoji / màu sổ
router.put('/:id', auth, fullAccess, vocabBookController.updateBook);

// POST /api/vocabbook/:id/merge  – gộp nhiều sổ vào sổ này
router.post('/:id/merge', auth, fullAccess, vocabBookController.mergeBooks);

// DELETE /api/vocabbook/:id  – xoá sổ (không xoá sổ default)
router.delete('/:id', auth, fullAccess, vocabBookController.deleteBook);

// POST /api/vocabbook/:id/words  – thêm từ vào sổ
router.post('/:id/words', auth, fullAccess, vocabBookController.addWord);

// PATCH /api/vocabbook/:id/words/:wordId  – cập nhật trạng thái / ghi chú / nội dung từ
router.patch('/:id/words/:wordId', auth, fullAccess, vocabBookController.updateWord);

// POST /api/vocabbook/:id/words/:wordId/practice-result  – ghi nhận 1 câu trả
// lời đúng/sai từ bất kỳ chế độ luyện tập nào (Flashcard/Quiz/Listen/
// Translate/Mixed/Review-due) — SRS box + status được server tính lại từ
// bằng chứng thật, không phải client tự báo "đã thuộc".
router.post('/:id/words/:wordId/practice-result', auth, fullAccess, vocabBookController.recordPracticeResult);

// DELETE /api/vocabbook/:id/words/:wordId  – xoá 1 từ
router.delete('/:id/words/:wordId', auth, fullAccess, vocabBookController.deleteWord);

// POST /api/vocabbook/:id/words/bulk  – thêm nhiều từ cùng lúc
router.post('/:id/words/bulk', auth, fullAccess, vocabBookController.bulkAddWords);

// DELETE /api/vocabbook/:id/words  – xoá nhiều từ cùng lúc
router.delete('/:id/words', auth, fullAccess, vocabBookController.deleteWords);

module.exports = router;
