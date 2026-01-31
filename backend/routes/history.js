const router = require("express").Router();
const PracticeResult = require("../models/PracticeResult");
const jwt = require("jsonwebtoken");

// =======================
// Middleware: Verify Token
// =======================
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // lấy userId từ token
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// =======================
// Lưu kết quả luyện tập
// POST /api/history/submit
// =======================
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { unitNumber, total, correct, wrong, percentage } = req.body;

    const result = new PracticeResult({
      userId: req.userId,
      unitNumber,
      total,
      correct,
      wrong,
      percentage
    });

    await result.save();
    res.json({ success: true, message: "Result saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Cannot save result" });
  }
});

// =======================
// Lấy lịch sử luyện tập
// GET /api/history
// =======================
router.get("/", verifyToken, async (req, res) => {
  try {
    const history = await PracticeResult.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Cannot load history" });
  }
});

module.exports = router;
