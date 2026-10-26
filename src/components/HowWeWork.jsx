import { motion } from 'framer-motion';
import { EASE } from '../lib.js';
import Row from '../howwework/Row.jsx';
import DotField from '../howwework/DotField.jsx';

const reveal = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({ opacity: 1, transition: { duration: 1, delay: i * 0.08, ease: EASE } }),
};

export default function HowWeWork() {
  return (
    <section className="hww" id="process">
      <DotField />
      <motion.header className="hww-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
        <motion.span className="hww-eyebrow" variants={reveal}><i />How we work</motion.span>
        <motion.h2 variants={reveal} custom={1}>From first call to steady growth.</motion.h2>
        <motion.p variants={reveal} custom={2}>
          A simple, transparent process. You always know what’s happening, what’s next and what it costs.
        </motion.p>
      </motion.header>
      <Row />
    </section>
  );
}
