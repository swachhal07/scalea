export const EASE = [0.16, 1, 0.3, 1];

// Page headlines start faint rather than invisible, so the prerendered heading counts as
// painted on the first frame (largest contentful paint), then rise in with the rest.
export const titleReveal = {
  hidden: { opacity: 0.15, transform: 'translateY(16px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.9, delay: i * 0.08, ease: EASE } }),
};

// Weak hardware (4 or fewer cores, 4 GB of memory or less) or the data saver: the site then
// drops its optional extras (smooth-scroll smoothing, live 3D, pointer parallax, idle drifting)
// and draws its canvases at 1x, so scrolling stays smooth. Browsers that hide these numbers
// (Safari, Firefox) count as capable unless they report fewer cores.
// ?lite=1 forces the light version on any machine (to preview it) and ?lite=0 turns it off;
// the choice sticks for the tab.
function pickLite() {
  try {
    const pick = new URLSearchParams(window.location.search).get('lite');
    if (pick === '1' || pick === '0') sessionStorage.setItem('lite', pick);
    const kept = sessionStorage.getItem('lite');
    if (kept) return kept === '1';
  } catch { /* storage blocked: fall through to the hardware check */ }
  return null;
}
export const LOW_END = !import.meta.env.SSR && (pickLite() ?? (
  (navigator.hardwareConcurrency || 8) <= 4
  || (navigator.deviceMemory || 8) <= 4
  || Boolean(navigator.connection?.saveData)
));

// Canvas pixel ratio: never more than 1.5x (dots and lines stay crisp), and 1x on weak hardware.
export const canvasDpr = () => Math.min(window.devicePixelRatio || 1, LOW_END ? 1 : 1.5);
