import { motion } from 'framer-motion';
import { EASE } from '../lib.js';

// Any path that isn't a page. Vercel serves this with a 404 status (dist/404.html).

const reveal = {
  hidden: { opacity: 0, transform: 'translateY(16px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.9, delay: i * 0.08, ease: EASE } }),
};

export default function NotFound() {
  return (
    <section className="lg">
      <motion.div className="lg-wrap" initial="hidden" animate="show">
        <header className="lg-head">
          <motion.span className="sp-eyebrow" variants={reveal}><i />404</motion.span>
          <motion.h1 variants={reveal} custom={1}>Page not found.</motion.h1>
          <motion.p className="lg-lede" variants={reveal} custom={2}>
            This page doesn’t exist or has moved. <a href="/">Back to the home page</a> or <a href="/start">start a project</a>.
          </motion.p>
        </header>
      </motion.div>
    </section>
  );
}
