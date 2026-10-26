import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { EASE } from '../lib.js';
import { useScrollProgress } from '../scroll.js';
import Globe from './Globe.jsx';

// About: a statement whose words light up as it scrolls past, then a bento of the studio
// in motion: live Kathmandu time, numbers that count up, and one team carrying a project
// from design to growth. Values sit underneath with the same pointer-lit edges as the
// service cards.

export const STATEMENT =
  'We’re Scalea, a studio in Kathmandu that designs, builds, launches and grows digital products for brands in Nepal and around the world.';
const WORDS = STATEMENT.split(' ');
// Words that stay a touch brighter once lit.
const KEY = new Set(['Scalea,', 'Kathmandu', 'designs,', 'builds,', 'launches', 'grows']);

// From the statement entering the lower part of the screen to it passing a third of the way up.
const LIGHT_RANGE = (top, height, vh) => [top - vh * 0.85, top + height - vh * 0.35];

export const NUMBERS = [
  { n: 20, suffix: '+', k: 'Brands served', d: 'Across automotive, agriculture, machinery and finance.' },
  { n: 7, suffix: '', k: 'Days to launch', d: 'From kickoff call to a live product.' },
  { n: 24, suffix: 'h', k: 'Reply time', d: 'A real person, the same working day.' },
];

const STAGES = ['Design', 'Build', 'Launch', 'Grow'];

// Card copy, shared with the markdown version of the page.
export const CARDS = {
  studio: ['Based in Kathmandu.', 'Building worldwide.'],
  team: 'Start to finish, under one roof.',
  teamCopy: 'The people who design your product build it, launch it and grow it, so nothing gets lost between agencies.',
};

export const VALUES = [
  ['Speed without shortcuts', 'We move fast because we plan well, not because we skip testing.'],
  ['Honest numbers', 'Clear prices up front and real results every month. No vanity metrics.'],
  ['Built to grow', 'Clean code and solid foundations, so your product scales with your business.'],
];

const fade = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({ opacity: 1, transition: { duration: 1, delay: i * 0.1, ease: EASE } }),
};

function track(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

/* The statement: one CSS variable carries scroll progress; each word works out its own brightness. */
function Statement() {
  const ref = useRef(null);
  const progress = useScrollProgress(ref, LIGHT_RANGE);
  const still = useReducedMotion();
  useMotionValueEvent(progress, 'change', (p) => ref.current?.style.setProperty('--p', p.toFixed(3)));
  return (
    <p className="ab-say" ref={ref} style={{ '--n': WORDS.length, '--p': still ? 1 : 0 }}>
      <span className="sr-only">{STATEMENT}</span>
      {WORDS.map((w, i) => (
        <span key={i} className={KEY.has(w) ? 'is-key' : ''} style={{ '--i': i }} aria-hidden="true">{w} </span>
      ))}
    </p>
  );
}

/* Kathmandu time, ticking once a minute. Open Sunday to Friday, 9:00 to 19:00 NPT. */
function useKathmandu() {
  const read = () => {
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kathmandu', hour: 'numeric', minute: '2-digit' }).format(now);
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kathmandu', hour: 'numeric', hourCycle: 'h23', weekday: 'short' }).formatToParts(now);
    const hour = Number(parts.find((p) => p.type === 'hour').value);
    const day = parts.find((p) => p.type === 'weekday').value;
    return { time, open: day !== 'Sat' && hour >= 9 && hour < 19 };
  };
  const [state, setState] = useState(read);
  useEffect(() => {
    const id = setInterval(() => setState(read()), 20000);
    return () => clearInterval(id);
  }, []);
  return state;
}

function KathmanduCard() {
  const { time, open } = useKathmandu();
  return (
    <motion.article className="ab-card ab-ktm" variants={fade} custom={0} onMouseMove={track}>
      <div className="ab-ktm-text">
        <span className="ab-k">Studio</span>
        <h3>{CARDS.studio[0]}<br />{CARDS.studio[1]}</h3>
        <div className="ab-clock">
          <b>{time}</b>
          <span>Kathmandu time · NPT</span>
        </div>
        <span className={`ab-live ${open ? 'is-open' : ''}`}><i />{open ? 'Online now. We reply today.' : 'Offline. We reply first thing tomorrow.'}</span>
      </div>
      <Globe />
    </motion.article>
  );
}

/* Counts from zero when the card first comes into view. */
function Count({ to, suffix, run }) {
  const ref = useRef(null);
  const still = useReducedMotion();
  useEffect(() => {
    if (!run) return undefined;
    if (still) { ref.current.textContent = `${to}${suffix}`; return undefined; }
    const start = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - start) / 1400);
      ref.current.textContent = `${Math.round(to * (1 - (1 - k) ** 3))}${suffix}`;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, still, to, suffix]);
  return <b ref={ref}>0{suffix}</b>;
}

function NumbersCard() {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  return (
    <motion.article className="ab-card ab-nums" ref={ref} variants={fade} custom={1} onMouseMove={track}>
      <span className="ab-k">In numbers</span>
      <ul>
        {NUMBERS.map((x) => (
          <li key={x.k}>
            <Count to={x.n} suffix={x.suffix} run={seen} />
            <div><span>{x.k}</span><p>{x.d}</p></div>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

function JourneyCard() {
  return (
    <motion.article className="ab-card ab-path" variants={fade} custom={2} onMouseMove={track}>
      <div className="ab-path-text">
        <span className="ab-k">One team</span>
        <h3>{CARDS.team}</h3>
        <p>{CARDS.teamCopy}</p>
      </div>
      <div className="ab-line" aria-hidden="true">
        <span className="ab-line-track"><i /></span>
        {STAGES.map((s, i) => (
          <span key={s} className="ab-stage" style={{ '--i': i }}>
            <i />
            <b>{s}</b>
          </span>
        ))}
      </div>
    </motion.article>
  );
}

export default function About() {
  const ref = useRef(null);
  const near = useInView(ref, { margin: '120px' });
  return (
    <section className={`ab ${near ? '' : 'is-idle'}`} id="about" ref={ref}>
      <motion.div className="ab-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <motion.span className="wk-eyebrow" variants={fade}><i />About Scalea</motion.span>
        <Statement />
      </motion.div>

      <motion.div className="ab-bento" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
        <KathmanduCard />
        <NumbersCard />
        <JourneyCard />
      </motion.div>

      <motion.ul className="ab-values" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
        {VALUES.map(([t, d], i) => (
          <motion.li key={t} className="ab-card" variants={fade} custom={i} onMouseMove={track}>
            <span className="ab-k">0{i + 1} · What we stand for</span>
            <b>{t}</b>
            <p>{d}</p>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
