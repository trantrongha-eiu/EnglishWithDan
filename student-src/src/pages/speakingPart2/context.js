// Shared by the Speaking Part 2 screens (not components)
import { createContext } from 'react';

// { speaking: text being read aloud | null, say(text) }
export const SpeakCtx = createContext({ speaking: null, say: () => {} });

export function luluSvg(mood) {
  try { return window.Mascot ? window.Mascot.svg(mood, { label: 'Lulu' }) : '🍊'; } catch { return '🍊'; }
}
