import { useInView } from 'framer-motion';
import { useScrollProgress } from '../scroll.js';

// From the hero's top reaching the viewport top to its bottom doing the same.
const HERO_RANGE = (top, height) => [top, top + height];

// Scroll progress across the hero plus an idle flag that pauses CSS loops off screen.
export function useHero(ref) {
  const progress = useScrollProgress(ref, HERO_RANGE);
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' });
  return { progress, idle: !inView };
}
