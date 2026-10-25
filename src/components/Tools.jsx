import { motion } from 'framer-motion';
import { siNextdotjs, siFigma, siAnthropic, siN8n } from 'simple-icons';
import { EASE } from '../lib.js';

// Tools flow into the Scalevia engine, which turns them into outcomes.
// Positions are % of the stage so the SVG wiring lines up at every width.
const TOOLS = [
  { icon: siFigma, name: 'Figma', role: 'Design', y: 17 },
  { icon: siNextdotjs, name: 'Next.js', role: 'Build', y: 39 },
  { icon: siAnthropic, name: 'Claude', role: 'AI', y: 61 },
  { icon: siN8n, name: 'n8n', role: 'Automation', y: 83 },
];
const OUTCOMES = [
  { k: 'Build', d: 'Fast websites and apps that turn visitors into customers.', y: 22 },
  { k: 'Grow', d: 'SEO, ads and AI visibility that bring the right people in.', y: 50 },
  { k: 'Automate', d: 'Connected AI workflows that take the busywork off your team.', y: 78 },
];
const IN_X = 27;
const OUT_X = 73;
const HUB = { l: 43, r: 57, y: 50 };

const curve = (x1, y1, x2, y2) => `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`;

function Icon({ icon }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} /></svg>;
}

function Mark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="14" width="5" height="8" rx="1.2" opacity="0.4" />
      <rect x="9.5" y="8" width="5" height="14" rx="1.2" opacity="0.7" />
      <rect x="17" y="2" width="5" height="20" rx="1.2" />
    </svg>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: i * 0.08, ease: EASE } }),
};

export default function Tools() {
  return (
    <section className="tl" id="tools">
      <motion.header className="tl-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
        <motion.span className="tl-eyebrow" variants={reveal}><i />Tools we use</motion.span>
        <motion.h2 variants={reveal} custom={1}>The stack behind the results.</motion.h2>
        <motion.p variants={reveal} custom={2}>
          Best-in-class tools, wired together by one team, so your business gets outcomes, not just software.
        </motion.p>
      </motion.header>

      <motion.div className="tl-stage" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
        <svg className="tl-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {TOOLS.map((t, i) => {
            const d = curve(IN_X, t.y, HUB.l, HUB.y);
            return (
              <g key={t.name}>
                <path d={d} className="tl-wire" />
                <path d={d} className="tl-pulse" style={{ animationDelay: `${i * 0.6}s` }} />
              </g>
            );
          })}
          {OUTCOMES.map((o, i) => {
            const d = curve(HUB.r, HUB.y, OUT_X, o.y);
            return (
              <g key={o.k}>
                <path d={d} className="tl-wire" />
                <path d={d} className="tl-pulse is-out" style={{ animationDelay: `${1.2 + i * 0.6}s` }} />
              </g>
            );
          })}
        </svg>

        {TOOLS.map((t, i) => (
          <motion.div key={t.name} className="tl-tool" style={{ top: `${t.y}%` }} variants={reveal} custom={i}>
            <span className="tl-ico"><Icon icon={t.icon} /></span>
            <div><b>{t.name}</b><small>{t.role}</small></div>
          </motion.div>
        ))}

        <motion.div className="tl-hub" variants={reveal} custom={2}>
          <span className="tl-ring r1" aria-hidden="true" />
          <span className="tl-ring r2" aria-hidden="true" />
          <span className="tl-core"><Mark /></span>
          <span className="tl-label"><i />Scalevia engine</span>
        </motion.div>

        {OUTCOMES.map((o, i) => (
          <motion.article key={o.k} className="tl-out" style={{ top: `${o.y}%` }} variants={reveal} custom={i + 3}>
            <h3>{o.k}</h3>
            <p>{o.d}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
