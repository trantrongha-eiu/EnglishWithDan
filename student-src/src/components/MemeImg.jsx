import { useMemo } from 'react';

// Result-screen meme: `src` is the classic tier meme (resultImage(),
// testResultImage(), …); window.memeSrc (js/shared/utils.js) swaps it for a
// random meme of the same tier. Picked once per src so re-renders keep it.
export default function MemeImg({ src, ...rest }) {
  const pick = useMemo(() => (window.memeSrc ? window.memeSrc(src) : src), [src]);
  return <img src={pick} alt="" {...rest} />;
}
