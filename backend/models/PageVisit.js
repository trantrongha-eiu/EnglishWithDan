const mongoose = require('mongoose');

// One document per Vietnam-local calendar day — count is the number of
// distinct browsers that pinged POST /api/track/visit that day (the
// frontend beacon dedupes itself to once/day via localStorage, so this is
// daily unique visits, not raw page-load hits). Powers the admin traffic
// chart (GET /api/admin/stats/visits).
const PageVisitSchema = new mongoose.Schema({
  date:  { type: Date, required: true, unique: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model('PageVisit', PageVisitSchema);
