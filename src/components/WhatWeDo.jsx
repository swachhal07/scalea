import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { EASE } from '../lib.js';
import { useScrollProgress } from '../scroll.js';
import Bars from './Bars.jsx';
import { reveal } from '../whatwedo/data.jsx';
import Bento from '../whatwedo/Bento.jsx';

// From the section's top entering at the bottom of the viewport to it reaching 25% down.
const HORIZON_RANGE = (top, height, vh) => [top - vh, top - vh * 0.25];

export const COPY = {
  heading: 'Everything you need to grow digitally.',
  intro: 'One team from first build to steady growth. Pick a single service or bring us in for the whole journey.',
  cta: 'Not sure where to start? We’ll map the right mix for your business.',
};
const HEADING = COPY.heading.split(' ');

const word = {
  hidden: { opacity: 0 },
  show: (i) => ({ opacity: 1, transition: { duration: 0.9, delay: 0.15 + i * 0.07, ease: EASE } }),
};

export default function WhatWeDo() {
  const ref = useRef(null);
  // As the section rises into view, the horizon brightens and flattens out.
  const scrollYProgress = useScrollProgress(ref, HORIZON_RANGE);
  const glow = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const arcScale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const arcY = useTransform(scrollYProgress, [0, 1], [60, 0]);

  return (
    <section className="wwd" id="services" ref={ref}>
      <motion.div className="wwd-horizon" aria-hidden="true" style={{ opacity: glow, scaleX: arcScale, y: arcY }}>
        <i className="wwd-arc" />
      </motion.div>

      <motion.header className="wwd-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
        <motion.span className="wwd-eyebrow" variants={reveal}><i />What we do</motion.span>
        <h2 aria-label={HEADING.join(' ')}>
          {HEADING.map((w, i) => (
            <motion.span className="wwd-word" key={i} variants={word} custom={i} aria-hidden="true">{w}</motion.span>
          ))}
        </h2>
        <motion.p variants={reveal} custom={4}>
          {COPY.intro}
        </motion.p>
      </motion.header>

      <Bento />

      <motion.div className="wwd-cta" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.8 }}>
        <p>{COPY.cta}</p>
        <a href="/start" className="p-cta"><Bars /><span className="p-cta-label">Start a Project</span></a>
      </motion.div>

    </section>
  );
}
