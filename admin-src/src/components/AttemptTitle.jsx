import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Wt1ReviewModal from './Wt1ReviewModal';
import AttemptDetailModal from './AttemptDetailModal';
import { isWt1Skill } from './SkillBadge';

// "Bài" cell of every student-history table (StudentHistory, StudentDetail's
// history tab): the test name becomes the way in to what the student did.
//  - Reading / Listening (full test + bài lẻ): the student's own review page
//    on the main site, new tab — staff may open any student's attempt there
//    (reading.html / listening.html ?review= / ?practiceReview=).
//  - Writing / Speaking: the admin grading pages' ?viewAttempt= viewers.
//  - WT1 courses: Wt1ReviewModal.
//  - Everything else with saved answers: AttemptDetailModal.

const SITE_REVIEW = {
  'reading':            id => `/reading.html?review=${id}`,
  'listening':          id => `/listening.html?review=${id}`,
  'reading-practice':   id => `/reading.html?practiceReview=${id}`,
  'listening-practice': id => `/listening.html?practiceReview=${id}`,
};
const ADMIN_ROUTE = {
  'writing':  id => `/writing-grades?viewAttempt=${id}`,
  'speaking': id => `/speaking?viewAttempt=${id}`,
};
// Keys served by GET /admin/attempt-detail/:skill/:id (backend/routes/admin/attemptDetail.js).
const DETAIL_SKILLS = new Set([
  'dictation', 'listening-gapfill', 'adv-sentence', 'task2-practice', 'task1-practice',
  'essential-grammar', 'vocabulary-lesson', 'task2-template', 'writing-practice',
]);

export default function AttemptTitle({ h, studentName }) {
  const [open, setOpen] = useState(false);
  const label = h.testName || '–';
  const title = 'Xem bài học sinh đã làm';

  if (SITE_REVIEW[h.skill]) {
    return (
      <a href={SITE_REVIEW[h.skill](h._id)} target="_blank" rel="noopener noreferrer" title={`${title} (mở trang học sinh, tab mới)`}>
        {label} <span style={{ fontSize: 10, color: 'var(--text3)' }}>↗</span>
      </a>
    );
  }
  if (ADMIN_ROUTE[h.skill]) return <Link to={ADMIN_ROUTE[h.skill](h._id)} title={title}>{label}</Link>;
  if (!isWt1Skill(h.skill) && !DETAIL_SKILLS.has(h.skill)) return <>{label}</>;
  return (
    <>
      <button type="button" className="link-btn" onClick={() => setOpen(true)} title={title}>{label}</button>
      {/* Portal: the trigger sits inside a <td> — keep the dialog out of the table's styles. */}
      {open && createPortal(isWt1Skill(h.skill)
        ? <Wt1ReviewModal id={h._id} onClose={() => setOpen(false)} />
        : <AttemptDetailModal skill={h.skill} id={h._id} studentName={studentName} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
