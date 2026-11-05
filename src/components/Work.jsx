import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { EASE, LOW_END } from '../lib.js';
import { lockScroll } from '../scroll.js';
import AntiMetalButton from './ui/AntiMetalButton.jsx';

// Case studies. Copy is placeholder until real project details are supplied;
// `shot` is the homepage screenshot in /public/work/ (1440x700) shown in the marquee.
export const COPY = {
  heading: 'Built for brands people trust.',
  intro: 'A few of the companies we’ve helped build, launch and grow online.',
};

export const CASES = [
  {
    id: 'mahindra',
    url: 'https://www.mahindra.info.np/',
    client: 'Mahindra',
    logo: '/brands/mahindra.webp',
    industry: 'Automotive',
    title: 'A digital showroom for a national dealer network',
    copy: 'Website, lead capture and campaigns that bring buyers from search and social straight to the dealership.',
    services: ['Web Development', 'SEO', 'Paid Ads'],
    shot: '/work/mahindra.webp',
  },
  {
    id: 'revolt',
    url: 'https://www.revolt.com.np/',
    client: 'Revolt',
    logo: '/brands/revolt.webp',
    industry: 'Electric Mobility',
    title: 'Launching electric motorcycles to a new market',
    copy: 'Launch campaigns, landing pages and test-ride bookings built to turn interest into rides.',
    services: ['Launch', 'Paid Ads', 'Content'],
    shot: '/work/revolt.webp',
  },
  {
    id: 'deere',
    url: 'https://john-deere.vercel.app/',
    client: 'John Deere',
    logo: '/brands/john-deere.webp',
    industry: 'Agriculture',
    title: 'Reaching farmers where they search',
    copy: 'Local SEO, product pages and enquiry flows that help farmers find the right machine and the nearest dealer.',
    services: ['SEO', 'Web Development', 'Analytics'],
    shot: '/work/deere.webp',
  },
  {
    id: 'kaifeng',
    url: 'https://kaifeng.com.np/',
    client: 'Kaifeng',
    logo: '/brands/kaifeng.webp',
    industry: 'Machinery',
    title: 'A modern web presence for heavy machinery',
    copy: 'A product catalogue and enquiry flow that makes it easy for contractors to compare machines and get a quote.',
    services: ['Web Development', 'SEO', 'Content'],
    shot: '/work/kaifeng.webp',
  },
  {
    id: 'manokamana',
    url: 'https://manokamanahirepurchase.com.np/',
    client: 'Manokamana Hire Purchase',
    logo: '/brands/manokamana.webp',
    industry: 'Finance',
    title: 'Making vehicle finance simple to apply for',
    copy: 'A clear, mobile-first site and online application that turns finance enquiries into approved customers.',
    services: ['Web Development', 'UX', 'Paid Ads'],
    shot: '/work/manokamana.webp',
  },
];

const reveal = {
  hidden: { opacity: 0, transform: 'translateY(24px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 1, delay: i * 0.08, ease: EASE } }),
};

// Address-bar text for the browser frame: the site's host without 'www.'.
const host = (url) => new URL(url).host.replace(/^www\./, '');
const pad = (n) => String(n).padStart(2, '0');

// The live site is drawn at desktop width and scaled down to fit its frame, so it
// looks like the real thing on any screen. The screenshot covers it until the page has
// loaded and had a moment to paint, so there is no blank white flash.
const SITE_W = 1440;
function LiveSite({ c }) {
  const box = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = box.current;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / SITE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="wkp-site">
      <div className="wkp-bar"><i /><i /><i /><span>{host(c.url)}</span><em>{LOW_END ? 'Preview' : loaded ? 'Live' : 'Loading'}</em></div>
      <div className="wkp-view" ref={box}>
        <img src={c.shot} alt="" className={loaded ? 'is-gone' : ''} />
        {/* Weak hardware keeps the screenshot: a whole live site, video and all, is too heavy there. */}
        {!LOW_END && (
          <iframe
            title={`${c.client} website, live`}
            src={c.url}
            onLoad={() => setTimeout(() => setLoaded(true), 1200)}
            style={{ width: SITE_W, height: `${100 / scale}%`, transform: `scale(${scale})` }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </div>
  );
}

// The project panel: the live site on one side, what we did on the other.
function Panel({ index, onClose, onStep }) {
  const c = CASES[index];
  const close = useRef(null);
  useEffect(() => {
    lockScroll(true);
    close.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onStep]);

  return (
    <motion.div
      className="wkp"
      role="dialog"
      aria-modal="true"
      aria-label={`${c.client} project`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="wkp-shell"
        initial={{ opacity: 0, transform: 'translateY(40px) scale(0.97)' }}
        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)', transition: { duration: 0.6, ease: EASE } }}
        exit={{ opacity: 0, transform: 'translateY(24px) scale(0.98)', transition: { duration: 0.25 } }}
      >
        <LiveSite key={c.id} c={c} />

        <aside className="wkp-info">
          <div className="wkp-top">
            <span className="wkp-count">{pad(index + 1)} <i>/ {pad(CASES.length)}</i></span>
            <button type="button" className="wkp-close" onClick={onClose} ref={close} aria-label="Close project">✕</button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={c.id}
              className="wkp-body"
              initial={{ opacity: 0, transform: 'translateY(10px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.45, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <div className="wkp-meta"><b>{c.client}</b><em>{c.industry}</em></div>
              <h3>{c.title}</h3>
              <p>{c.copy}</p>
              <h4>What we did</h4>
              <ul>{c.services.map((s) => <li key={s}>{s}</li>)}</ul>
            </motion.div>
          </AnimatePresence>
          <div className="wkp-actions">
            <AntiMetalButton as="a" href={c.url} target="_blank" rel="noopener noreferrer">Visit website</AntiMetalButton>
            <div className="wkp-nav">
              <button type="button" onClick={() => onStep(-1)} aria-label="Previous project">←</button>
              <button type="button" onClick={() => onStep(1)} aria-label="Next project">→</button>
            </div>
          </div>
        </aside>
      </motion.div>
    </motion.div>
  );
}

export default function Work() {
  const [open, setOpen] = useState(null);
  const step = useCallback((dir) => setOpen((i) => (i + dir + CASES.length) % CASES.length), []);
  const close = useCallback(() => setOpen(null), []);
  // The row only slides while it is near the screen.
  const row = useRef(null);
  const near = useInView(row, { margin: '200px' });

  return (
    <section className="wk" id="work">
      <motion.header className="wk-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
        <div>
          <motion.span className="wk-eyebrow" variants={reveal}><i />Selected work</motion.span>
          <motion.h2 variants={reveal} custom={1}>{COPY.heading}</motion.h2>
        </div>
        <motion.p variants={reveal} custom={2}>
          {COPY.intro}
        </motion.p>
      </motion.header>

      {/* One endless row: the list twice over, slid by one list's width per loop. It pauses
          on hover, while a project is open and while off screen. The second copy only completes the loop. */}
      <div className={`wk-row${open !== null || !near ? ' is-paused' : ''}`} ref={row}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="wk-list" aria-hidden={copy > 0 || undefined}>
            {CASES.map((c, i) => (
              <li key={c.id} className="wk-item">
                <button type="button" className="wk-card" onClick={() => setOpen(i)} tabIndex={copy > 0 ? -1 : undefined}>
                  {/* At rest the brand mark; on hover the homepage sweeps up over it. */}
                  <span className="wk-logo" aria-hidden="true"><img src={c.logo} alt="" loading="lazy" decoding="async" /></span>
                  <img className="wk-shot" src={c.shot} alt="" width="720" height="350" loading="lazy" decoding="async" />
                  <span className="wk-shade" aria-hidden="true" />
                  <span className="wk-cap">
                    <span className="wk-num">{pad(i + 1)}</span>
                    <b>{c.client}</b>
                    <small>{c.industry}</small>
                  </span>
                  <span className="wk-view">Look inside <i aria-hidden="true">+</i></span>
                  <span className="sr-only">: open the {c.client} project</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <p className="wk-hint">Hover to pause. Click or tap a project to explore the live site and what we did.</p>

      <AnimatePresence>
        {open !== null && <Panel key="panel" index={open} onClose={close} onStep={step} />}
      </AnimatePresence>
    </section>
  );
}
