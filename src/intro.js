import { useEffect, useState } from 'react';

// The particle intro in index.html covers the first seconds of a visit. The site renders
// underneath it straight away (so that work never lands on the hand-over), and holds its
// entrance animations until the intro is done; useIntroDone() says when.

const intro = import.meta.env.SSR ? null : window.__intro;
let done = !intro || intro.skipped;
const waiting = new Set();

if (!done) {
  intro.ready.then(() => {
    done = true;
    waiting.forEach((fn) => fn());
  });
}

export function useIntroDone() {
  const [ready, setReady] = useState(done);
  useEffect(() => {
    if (ready) return undefined;
    const go = () => setReady(true);
    if (done) go();
    else waiting.add(go);
    return () => waiting.delete(go);
  }, [ready]);
  return ready;
}
