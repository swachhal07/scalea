export const EASE = [0.16, 1, 0.3, 1];

// Page headlines start faint rather than invisible, so the prerendered heading counts as
// painted on the first frame (largest contentful paint), then rise in with the rest.
export const titleReveal = {
  hidden: { opacity: 0.15, transform: 'translateY(16px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.9, delay: i * 0.08, ease: EASE } }),
};
