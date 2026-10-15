const mongoose = require('mongoose');

// One row per Cửa hàng lửa purchase (services/shopService.js recordPurchase).
// Feeds the "X vừa mua Y" ticker every student sees at the top of the page
// (GET /api/shop/feed → frontend/js/shared/shop-feed.js). Only the recent
// past matters for that, so rows expire after 30 days.
const ShopPurchaseSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },   // buyer's display name at purchase time
  kind:     { type: String, enum: ['item', 'pet'], required: true },
  key:      { type: String, required: true },   // item key / pet id
  itemName: { type: String, required: true },
  emoji:    { type: String, default: '' },
  price:    { type: Number, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

ShopPurchaseSchema.index({ createdAt: -1 });
ShopPurchaseSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('ShopPurchase', ShopPurchaseSchema);
