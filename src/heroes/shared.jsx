import { useInView, useScroll } from 'framer-motion';

// Scroll progress across the hero plus an idle flag that pauses CSS loops off screen.
export function useHero(ref) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' });
  return { progress: scrollYProgress, idle: !inView };
}
