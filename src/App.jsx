import { Suspense, lazy, startTransition, useEffect, useState } from 'react';
import Lenis from 'lenis';
import Nav from './components/Nav.jsx';
import WhatWeDo from './components/WhatWeDo.jsx';
import HowWeWork from './components/HowWeWork.jsx';
import Work from './components/Work.jsx';
import Tools from './components/Tools.jsx';
import Closing from './components/Closing.jsx';
import HeroPrime from './heroes/HeroPrime.jsx';
import { useRoute } from './router.jsx';

// The start page is a separate route, so it stays out of the home page bundle.
const StartProject = lazy(() => import('./pages/StartProject.jsx'));

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}

const BELOW_FOLD = [WhatWeDo, HowWeWork, Work, Tools, Closing];

// The hero paints first; the sections below it then mount one per task, each in
// a transition, so no single render or commit blocks the main thread for long.
// A deep link (/#work) needs its target on the first render, so it skips the wait.
function useBelowFold() {
  const [count, setCount] = useState(() => (window.location.hash ? BELOW_FOLD.length : 0));
  // The browser's own anchor scroll can run before React has rendered the target.
  useEffect(() => {
    const { hash } = window.location;
    if (hash) document.querySelector(hash)?.scrollIntoView();
  }, []);
  useEffect(() => {
    if (count >= BELOW_FOLD.length) return undefined;
    const id = setTimeout(() => startTransition(() => setCount((c) => c + 1)), 0);
    return () => clearTimeout(id);
  }, [count]);
  return BELOW_FOLD.slice(0, count);
}

export default function App() {
  useSmoothScroll();
  const route = useRoute();
  const belowFold = useBelowFold();

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        {route === '/start' ? (
          <Suspense fallback={null}><StartProject /></Suspense>
        ) : (
          <>
            <HeroPrime />
            {belowFold.map((Section) => <Section key={Section.name} />)}
          </>
        )}
      </main>
    </>
  );
}
