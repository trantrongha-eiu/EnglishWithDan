'use strict';

// Passages / Listening sections that belong to a course (Mindset) carry a
// `courseRef` (see models/Passage.js, models/ListeningSection.js). They are
// opened only from that course's lesson links — spread NOT_COURSE into every
// query that LISTS or randomly PICKS practice content so they never show up
// among the IELTS tests. Fetching one by _id needs no filter.
// `$in: [null, '']` also matches documents without the field (every
// pre-existing passage/section).
// Dictation-only sections (ListeningSection.dictationOnly — a full-test part
// cut out just for Luyện Dictation) stay out of the same lists.
const NOT_COURSE = Object.freeze({ courseRef: { $in: [null, ''] }, dictationOnly: { $ne: true } });

module.exports = { NOT_COURSE };
