const PageVisit = require('../models/PageVisit');
const { getVNDay } = require('../utils/streak');

// Best-effort analytics beacon — must never fail the caller's page load,
// so any DB error here is swallowed rather than surfaced as a 500.
exports.recordVisit = async (req, res) => {
  try {
    await PageVisit.findOneAndUpdate(
      { date: getVNDay(new Date()) },
      { $inc: { count: 1 } },
      { upsert: true }
    );
  } catch (e) {
    // ignore — analytics only
  }
  res.status(204).end();
};
