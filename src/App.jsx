import { Suspense, lazy, startTransition, useEffect, useState } from 'react';
import Lenis from 'lenis';
import Nav from './components/Nav.jsx';
import WhatWeDo from './components/WhatWeDo.jsx';
import HowWeWork from './components/HowWeWork.jsx';
import Work from './components/Work.jsx';
import About from './components/About.jsx';
import Tools from './components/Tools.jsx';
import Closing from './components/Closing.jsx';
import HeroPrime from './heroes/HeroPrime.jsx';
import { useRoute } from './router.jsx';
import { setLenis } from './scroll.js';
import { NOT_FOUND, ORIGIN, PAGES as SEO } from './seo.js';

// Every page but the home page is its own route, so it stays out of the home page bundle.
const StartProject = lazy(() => import('./pages/StartProject.jsx'));
const Careers = lazy(() => import('./pages/Careers.jsx'));
const Privacy = lazy(() => import('./pages/Legal.jsx').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Legal.jsx').then((m) => ({ default: m.Terms })));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export const PAGES = { '/start': StartProject, '/careers': Careers, '/privacy': Privacy, '/terms': Terms };

// Keeps the tab title and description in step with the page; the build bakes the same
// values into each page's HTML for crawlers (src/seo.js).
function useHead(route) {
  useEffect(() => {
    const meta = SEO[route] || NOT_FOUND;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', ORIGIN + route);
  }, [route]);
}

// Comparison switch: ?scroll=native turns Lenis off (plain browser scrolling) and
// ?scroll=smooth turns it back on. The choice sticks for the tab, across pages.
function wantsNativeScroll() {
  const pick = new URLSearchParams(window.location.search).get('scroll');
  try {
    if (pick) sessionStorage.setItem('scroll', pick);
    return (pick || sessionStorage.getItem('scroll')) === 'native';
  } catch {
    return pick === 'native';
  }
}

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (wantsNativeScroll()) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    setLenis(lenis);
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      setLenis(null);
      lenis.destroy();
    };
  }, []);
}

const BELOW_FOLD = [WhatWeDo, HowWeWork, Work, About, Tools, Closing];

// The hero paints first; the sections below it then mount one per task, each in
// a transition, so no single render or commit blocks the main thread for long.
// A deep link (/#work) needs its target on the first render, so it skips the wait, and so
// does the build-time render, which needs the whole page.
function useBelowFold() {
  const [count, setCount] = useState(() => (import.meta.env.SSR || window.location.hash ? BELOW_FOLD.length : 0));
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
  const Page = route === '/' ? null : PAGES[route] || NotFound;
  const belowFold = useBelowFold();
  useHead(route);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        {Page ? (
          <Suspense fallback={null}><Page /></Suspense>
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
