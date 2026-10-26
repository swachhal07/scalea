import { useEffect } from 'react';
import { useMotionValue } from 'framer-motion';

// Scroll subscribers. With smooth scrolling on, they run from the page's Lenis
// instance (App hands it over), whose scroll value comes for free each frame;
// reading window.scrollY instead can make the browser flush pending style and
// layout first. Without Lenis (reduced motion) they run from native scroll events.
let lenis = null;
const subscribers = new Set();
const notify = () => subscribers.forEach((fn) => fn());
window.addEventListener('scroll', () => { if (!lenis) notify(); }, { passive: true });

export function setLenis(instance) {
  lenis = instance;
  instance?.on('scroll', notify);
}

export const getLenis = () => lenis;

// Pause or resume page scrolling (the mobile menu holds the page still while open).
export function lockScroll(locked) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

const scrollTop = () => (lenis ? lenis.animatedScroll : window.scrollY);

// Scroll progress (0–1) through an element, as a motion value. The element's page
// position is measured only on mount and when the layout resizes, so scrolling
// never forces a style or layout pass mid-frame (framer's useScroll with a target
// re-measures on every scroll frame).
// `range(top, height, vh)` returns the [start, end] scroll offsets the progress maps across.
export function useScrollProgress(ref, range) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    let start = 0;
    let end = 1;
    const update = () => {
      const p = (scrollTop() - start) / (end - start || 1);
      progress.set(Math.min(1, Math.max(0, p)));
    };
    const measure = () => {
      const r = el.getBoundingClientRect();
      [start, end] = range(r.top + window.scrollY, r.height, window.innerHeight);
      update();
    };
    measure();
    // Sections mounting, fonts and images arriving all move things: re-measure then.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    subscribers.add(update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      subscribers.delete(update);
    };
    // `range` is a stable module-level function at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, progress]);

  return progress;
}
