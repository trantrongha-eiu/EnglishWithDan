'use strict';

// Finding people by what teachers/students type: full name in any order,
// with or without accents ("nguyen van an", "An Nguyễn"), username or email.
// firstName / lastName are separate fields, so the old "whole text must be
// inside ONE field" regex never found a full name.
const SearchMatch = require('./searchMatch');

const USER_FIELDS = ['username', 'email', 'firstName', 'lastName'];

// Mongo filter for User, or null when the query is empty.
function userSearchFilter(query, fields = USER_FIELDS) {
  return SearchMatch.mongoFilter(query, fields);
}

// _ids of users matching `query` (null = no query → don't filter).
async function userIdsMatching(query, { extra = {}, limit = 1000, fields } = {}) {
  const f = userSearchFilter(query, fields);
  if (!f) return null;
  const User = require('../models/User');
  const users = await User.find({ ...extra, ...f }).select('_id').limit(limit).lean();
  return users.map((u) => u._id);
}

module.exports = { USER_FIELDS, userSearchFilter, userIdsMatching };
