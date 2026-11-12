'use strict';

// Passages / Listening sections that belong to a course (Mindset) carry a
// `courseRef` (see models/Passage.js, models/ListeningSection.js). They are
// opened only from that course's lesson links — spread NOT_COURSE into every
// query that LISTS or randomly PICKS practice content so they never show up
// among the IELTS tests. Fetching one by _id needs no filter.
// `$in: [null, '']` also matches documents without the field (every
// pre-existing passage/section).
const NOT_COURSE = Object.freeze({ courseRef: { $in: [null, ''] } });

module.exports = { NOT_COURSE };
