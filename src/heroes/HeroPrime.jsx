import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { EASE } from '../lib.js';
import Bars from '../components/Bars.jsx';
import CycleWord from '../components/CycleWord.jsx';
import { useHero } from './shared.jsx';
import { useIntroDone } from '../intro.js';
import {
  WebCard, MobileCard, UXCard, AuditCard, SeoCard, AdsCard, GeoCard, ChartCard,
} from './EdgeCards.jsx';

// One card per service around the copy. Positions and depth live in prime.css; depth here drives scroll drift.
const CARDS = [
  { C: WebCard, cls: 'p-web', w: 21, depth: 0.4 },
  { C: MobileCard, cls: 'p-mobile', w: 13.5, depth: 0.25 },
  { C: UXCard, cls: 'p-ux', w: 15, depth: 0.6 },
  { C: AuditCard, cls: 'p-audit', w: 22, depth: 0.9 },
  { C: GeoCard, cls: 'p-geo', w: 18, depth: 0.4 },
  { C: AdsCard, cls: 'p-ads', w: 13.5, depth: 0.25 },
  { C: SeoCard, cls: 'p-seo', w: 17, depth: 0.6 },
  { C: ChartCard, cls: 'p-chart', w: 23, depth: 0.9 },
];

// Client logos (white versions made by scripts/mono-logos.ps1), each fitted into the same box.
// No logo file → typeset wordmark in that box.
export const BRANDS = [
  { id: 'mahindra', main: 'Mahindra', logo: '/brands/mahindra.webp' },
  { id: 'revolt', main: 'Revolt', logo: '/brands/revolt.webp' },
  { id: 'deere', main: 'John Deere', logo: '/brands/john-deere.webp' },
  { id: 'kaifeng', main: 'Kaifeng', logo: '/brands/kaifeng.webp' },
  { id: 'tata', main: 'Tata Hitachi' },
  { id: 'bkt', main: 'BKT Tyres', logo: '/brands/bkt.webp' },
  { id: 'dugar', main: 'MV Dugar Group', logo: '/brands/mv-dugar.webp' },
  { id: 'manokamana', main: 'Manokamana Hire Purchase', logo: '/brands/manokamana.webp' },
];

// Hero copy, shared with the markdown version of the page (src/md/registry.jsx).
export const HERO = {
  badge: 'Build, launch and scale end-to-end',
  title: ['Build. Launch. Scale.', 'From idea to growth.'],
  lede: 'We build digital products, improve digital experiences, and help businesses grow through technology, marketing and AI.',
  trust: 'Trusted by leading Nepali brands across automotive, agriculture and finance.',
};

// Hero CTA: "Start …" walks through the journey, holding longest on Scaling, then repeats.
const CYCLE = [
  { w: 'Developing', ms: 3000 },
  { w: 'Growing', ms: 3000 },
  { w: 'Scaling', ms: 4500 },
];

// Entrance: held at the start until the intro is done (go), then rises in.
const rise = (delay, go) => ({
  initial: { opacity: 0, transform: 'translateY(16px)' },
  animate: go ? { opacity: 1, transform: 'translateY(0px)' } : undefined,
  transition: { duration: 1.1, delay, ease: EASE },
});

function Edge({ c, i, progress, go }) {
  const y = useTransform(progress, [0, 1], [0, -c.depth * 160]);
  return (
    <motion.div className={`p-card ${c.cls}`} style={{ y, width: `${c.w}em` }}>
      <motion.div
        initial={{ opacity: 0, transform: 'translateY(30px)' }}
        animate={go ? { opacity: 1, transform: 'translateY(0px)' } : undefined}
        transition={{ duration: 1.6, delay: 0.5 + i * 0.08, ease: EASE }}
      >
        <div className="p-float"><c.C /></div>
      </motion.div>
    </motion.div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="14" width="5" height="8" rx="1.2" opacity="0.4" />
      <rect x="9.5" y="8" width="5" height="14" rx="1.2" opacity="0.7" />
      <rect x="17" y="2" width="5" height="20" rx="1.2" />
    </svg>
  );
}

export default function HeroPrime() {
  const go = useIntroDone();
  const ref = useRef(null);
  const { progress, idle } = useHero(ref);
  // Pointer parallax: the whole card field turns a few degrees toward the cursor.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-1, 1], [-5, 5]), { stiffness: 60, damping: 20 });
  const rotX = useSpring(useTransform(py, [-1, 1], [4, -4]), { stiffness: 60, damping: 20 });
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const copyY = useTransform(progress, [0, 0.6], [0, -50]);
  const copyOpacity = useTransform(progress, [0, 0.45], [1, 0]);

  return (
    <section className={`hx hx-prime ${idle ? 'is-idle' : ''}`} id="top" ref={ref} onPointerMove={onMove}>
      <div className="p-corner p-corner-l" aria-hidden="true" />
      <div className="p-corner p-corner-r" aria-hidden="true" />
      <div className="p-dust" aria-hidden="true" />
      <div className="p-grid" aria-hidden="true" />

      <div className="p-scene" aria-hidden="true">
        <motion.div className="p-cards" style={{ rotateX: rotX, rotateY: rotY }}>
          {CARDS.map((c, i) => <Edge key={c.cls} c={c} i={i} progress={progress} go={go} />)}
        </motion.div>
      </div>
      <div className="p-vignette" aria-hidden="true" />
      {/* Edge blur: one masked backdrop layer per side keeps it cheap. */}
      <div className="p-blur p-blur-top" aria-hidden="true" />
      <div className="p-blur p-blur-bottom" aria-hidden="true" />

      <motion.div className="p-copy" style={{ y: copyY, opacity: copyOpacity }}>
        <motion.a href="#services" className="p-badge" {...rise(0.1, go)}>
          <span className="p-badge-logo"><Logo /></span>
          {HERO.badge}
          <span className="p-badge-arrow" aria-hidden="true">→</span>
        </motion.a>
        {/* The headline is the LCP element: it starts faint rather than invisible
            so it counts as painted on the first frame, then rises in with the rest. */}
        <motion.h1 className="p-title" {...rise(0.2, go)} initial={{ opacity: 0.15, transform: 'translateY(16px)' }}>
          {HERO.title[0]}<br />{HERO.title[1]}
        </motion.h1>
        <motion.p className="p-lede" {...rise(0.32, go)}>
          {HERO.lede}
        </motion.p>
        <motion.a href="/start" className="p-cta" {...rise(0.44, go)}>
          <Bars /><span className="sr-only">Start a project</span><span className="p-cta-label" aria-hidden="true">Start <CycleWord words={CYCLE} /></span>
        </motion.a>
        <motion.a href="#services" className="p-note" {...rise(0.54, go)}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" /><path d="M8 7.2v3.6M8 5.2v.1" /></svg>
          Or explore our services
        </motion.a>
      </motion.div>

      <motion.div className="p-trust" {...rise(0.8, go)}>
        <p>{HERO.trust}</p>
        <div className="p-marquee">
          {[0, 1].map((dup) => (
            <ul key={dup} aria-hidden={dup === 1} aria-label={dup === 0 ? 'Clients' : undefined}>
              {BRANDS.map((b) => (
                <li key={b.id} className={`bw bw-${b.id}`}>
                  {b.logo
                    ? <img src={b.logo} alt={dup === 0 ? b.main : ''} width="140" height="44" loading="lazy" decoding="async" />
                    : <span>{b.main}</span>}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
