const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const vocabBookController = require('../controllers/vocabBook.controller');

// GET /api/vocabbook/  – lấy tất cả sổ của user (kèm số từ)
router.get('/', auth, vocabBookController.listBooks);

// PUT /api/vocabbook/reorder  – lưu thứ tự sổ sau khi kéo thả
router.put('/reorder', auth, vocabBookController.reorderBooks);

// POST /api/vocabbook/practice-complete
router.post('/practice-complete', auth, vocabBookController.completePractice);

// GET /api/vocabbook/:id  – lấy chi tiết 1 sổ (có words)
router.get('/:id', auth, vocabBookController.getBook);

// POST /api/vocabbook/  – tạo sổ mới
router.post('/', auth, vocabBookController.createBook);

// PUT /api/vocabbook/:id  – đổi tên / emoji / màu sổ
router.put('/:id', auth, vocabBookController.updateBook);

// POST /api/vocabbook/:id/merge  – gộp nhiều sổ vào sổ này
router.post('/:id/merge', auth, vocabBookController.mergeBooks);

// DELETE /api/vocabbook/:id  – xoá sổ (không xoá sổ default)
router.delete('/:id', auth, vocabBookController.deleteBook);

// POST /api/vocabbook/:id/words  – thêm từ vào sổ
router.post('/:id/words', auth, vocabBookController.addWord);

// PATCH /api/vocabbook/:id/words/:wordId  – cập nhật trạng thái / ghi chú / nội dung từ
router.patch('/:id/words/:wordId', auth, vocabBookController.updateWord);

// DELETE /api/vocabbook/:id/words/:wordId  – xoá 1 từ
router.delete('/:id/words/:wordId', auth, vocabBookController.deleteWord);

// POST /api/vocabbook/:id/words/bulk  – thêm nhiều từ cùng lúc
router.post('/:id/words/bulk', auth, vocabBookController.bulkAddWords);

// DELETE /api/vocabbook/:id/words  – xoá nhiều từ cùng lúc
router.delete('/:id/words', auth, vocabBookController.deleteWords);

module.exports = router;
