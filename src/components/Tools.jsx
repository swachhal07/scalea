import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { siNextdotjs, siFigma, siAnthropic, siN8n } from 'simple-icons';
import { EASE } from '../lib.js';

// Tools flow into the Scalea engine, which turns them into outcomes.
// Positions are % of the stage so the SVG wiring lines up at every width.
export const TOOLS = [
  { icon: siFigma, name: 'Figma', role: 'Design', y: 17 },
  { icon: siNextdotjs, name: 'Next.js', role: 'Build', y: 39 },
  { icon: siAnthropic, name: 'Claude', role: 'AI', y: 61 },
  { icon: siN8n, name: 'n8n', role: 'Automation', y: 83 },
];
export const OUTCOMES = [
  { k: 'Build', d: 'Fast websites and apps that turn visitors into customers.', y: 22 },
  { k: 'Grow', d: 'SEO, ads and AI visibility that bring the right people in.', y: 50 },
  { k: 'Automate', d: 'Connected AI workflows that take the busywork off your team.', y: 78 },
];
export const COPY = {
  heading: 'The stack behind the results.',
  intro: 'Best-in-class tools, wired together by one team, so your business gets outcomes, not just software.',
};
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

// Narrow-screen wiring, in a 100×100 box stretched across the stage: two tool
// columns merge into the engine, then the engine splits into three outcome tiles.
const FAN_IN = [
  'M25,0 C25,60 50,40 50,100',
  'M75,0 C75,60 50,40 50,100',
];
const FAN_OUT = [
  'M50,0 C50,60 16.7,40 16.7,100',
  'M50,0 L50,100',
  'M50,0 C50,60 83.3,40 83.3,100',
];

function Fan({ className, paths }) {
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {paths.map((d) => <path key={d} d={d} className="tl-wire" />)}
      {paths.map((d, i) => <path key={`p${d}`} d={d} className="tl-pulse" style={{ animationDelay: `${i * 0.5}s` }} />)}
    </svg>
  );
}

// Narrow screens: three outcome tiles share one description below them. It moves
// on by itself while the section is on screen; a tap picks one and stops that.
function MobileOutcomes({ active }) {
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState(false);
  const still = useReducedMotion();
  useEffect(() => {
    if (!active || picked || still) return undefined;
    const id = setTimeout(() => setN((v) => (v + 1) % OUTCOMES.length), 3200);
    return () => clearTimeout(id);
  }, [n, active, picked, still]);
  return (
    <motion.div className="tl-mob" variants={reveal} custom={3}>
      <div className="tl-mob-tiles">
        {OUTCOMES.map((o, i) => (
          <button
            key={o.k}
            type="button"
            className={i === n ? 'is-on' : ''}
            aria-pressed={i === n}
            onClick={() => { setN(i); setPicked(true); }}
          >
            {o.k}
          </button>
        ))}
      </div>
      <p className="tl-mob-detail" aria-live="polite">
        <span key={n}>{OUTCOMES[n].d}</span>
      </p>
    </motion.div>
  );
}

const reveal = {
  hidden: { opacity: 0, transform: 'translateY(24px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.9, delay: i * 0.08, ease: EASE } }),
};

export default function Tools() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '100px' });
  return (
    <section className={`tl ${inView ? '' : 'is-idle'}`} id="tools" ref={ref}>
      <motion.header className="tl-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
        <motion.span className="tl-eyebrow" variants={reveal}><i />Tools we use</motion.span>
        <motion.h2 variants={reveal} custom={1}>{COPY.heading}</motion.h2>
        <motion.p variants={reveal} custom={2}>
          {COPY.intro}
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
        {/* Narrow screens: the tools funnel into the engine, which fans out to the outcomes. */}
        <Fan className="tl-fan tl-fan-in" paths={FAN_IN} />
        <Fan className="tl-fan tl-fan-out" paths={FAN_OUT} />
        <MobileOutcomes active={inView} />

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
          <span className="tl-label"><i />Scalea engine</span>
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
