import { motion } from 'framer-motion';
import { SERVICES, reveal } from './data.jsx';
import { SERVICES as PAGES, servicePath } from '../services.js';

// Each card's title links to its service page.
const pageFor = (id) => PAGES.find((p) => p.card === id);

// Light follows the pointer along each card's border.
function track(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

// Bento grid: Build is the wide lead card; the rest fill a 3-column grid.
export default function Bento() {
  return (
    <div className="wwd-grid">
      {SERVICES.map((s, i) => (
        <motion.article
          key={s.id}
          className={`wwd-card wwd-${s.id}`}
          onMouseMove={track}
          variants={reveal}
          custom={i % 3}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="wwd-visual" aria-hidden="true">{s.visual}</div>
          <div className="wwd-body">
            <span className="wwd-k"><b>0{i + 1}</b>{s.k}</span>
            <h3>{pageFor(s.id) ? <a href={servicePath(pageFor(s.id))}>{s.title}</a> : s.title}</h3>
            <p>{s.copy}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
