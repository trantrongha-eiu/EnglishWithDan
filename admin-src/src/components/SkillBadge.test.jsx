import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { skillBadge, SKILL_META } from './SkillBadge';

// Regression coverage for BUG-014 (2026-08-27 audit): Dashboard.jsx's own
// copy of this map was missing 5 real, common skill types
// (reading-practice, listening-practice, writing-practice, task1-practice,
// task2-practice), so it fell back to showing the raw API slug to a
// teacher instead of a real label. All three consumers (Dashboard,
// StudentDetail, StudentHistory) now share this one map/renderer.
describe('skillBadge', () => {
  it('renders a friendly label for every skill type this map declares — no raw slug leaks for a known skill', () => {
    for (const skill of Object.keys(SKILL_META)) {
      const { container } = render(skillBadge(skill));
      expect(container.textContent).toBe(SKILL_META[skill].label);
      expect(container.textContent).not.toBe(skill);
    }
  });

  it('the 5 skill types missing from Dashboard.jsx before the fix now resolve to real labels', () => {
    const previouslyMissing = {
      'reading-practice': '📄 Reading lẻ',
      'listening-practice': '🎵 Listening lẻ',
      'writing-practice': '✍ Writing lẻ',
      'task1-practice': '📊 Task 1',
      'task2-practice': '📝 Task 2',
    };
    for (const [skill, label] of Object.entries(previouslyMissing)) {
      render(skillBadge(skill));
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('falls back to the raw slug (not a crash) for a genuinely unknown skill type', () => {
    render(skillBadge('some-future-skill-type'));
    expect(screen.getByText('some-future-skill-type')).toBeInTheDocument();
  });
});
