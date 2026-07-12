'use strict';

const UpgradeRequest = require('../models/UpgradeRequest');

const PRICES = { 1: 90000, 3: 250000, 6: 500000, 12: 900000, 36: 2500000 };
const VALID_MONTHS = [1, 3, 6, 12, 36];

async function createRequest(userId, months, note) {
  const amount = PRICES[months];

  // Không cho tạo thêm nếu đang có request pending
  const existing = await UpgradeRequest.findOne({ userId, status: 'pending' });
  if (existing) return { conflict: true, requestId: existing._id };

  const request = new UpgradeRequest({ userId, months, amount, note: note || '' });
  await request.save();
  return { conflict: false, request };
}

async function getStatus(userId) {
  return UpgradeRequest.findOne({ userId }).sort({ createdAt: -1 });
}

module.exports = { PRICES, VALID_MONTHS, createRequest, getStatus };
