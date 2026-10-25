import { motion } from 'framer-motion';
import { EASE } from '../lib.js';
import Object3D from '../whatwedo/Object3D.jsx';
import { STEPS } from './steps.js';

// Light follows the pointer across each glass card.
function track(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

// Five steps side by side on one glowing line, each a glass card with its 3D object.
export default function Row() {
  return (
    <div className="hw-row">
      <motion.span
        className="hw-row-line"
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.8, ease: EASE }}
      />
      {STEPS.map((s, i) => (
        <motion.article
          key={s.k}
          className="hw-glass"
          onMouseMove={track}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: EASE }}
        >
          <span className="hw-row-node" aria-hidden="true" />
          <div className="hw-row-obj"><Object3D kind={s.obj} /></div>
          <div className="hw-row-meta"><b>0{i + 1}</b><span>{s.time}</span></div>
          <h3>{s.k}</h3>
          <p>{s.copy}</p>
        </motion.article>
      ))}
    </div>
  );
}
