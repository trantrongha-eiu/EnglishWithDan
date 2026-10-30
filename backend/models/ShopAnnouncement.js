const mongoose = require('mongoose');

// Site-wide "huyền thoại" announcements for the legendary linh thú
// (constants/shop.js LEGEND_PETS, e.g. Thập Vĩ): one row when a student buys
// one, and one when an owner logs in. Every student's shop-feed.js poll
// (GET /api/shop/feed → `announce`) plays them as a banner plus a 3s
// fire-and-tails sweep around the screen. Only fresh rows are ever shown
// (shopService.getFeed), so they expire after a day.
const ShopAnnouncementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:   { type: String, required: true },          // display name at the time
  type:   { type: String, enum: ['buy', 'login'], required: true },
  petId:  { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

ShopAnnouncementSchema.index({ createdAt: -1 });
ShopAnnouncementSchema.index({ userId: 1, type: 1, createdAt: -1 });
ShopAnnouncementSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

module.exports = mongoose.model('ShopAnnouncement', ShopAnnouncementSchema);
