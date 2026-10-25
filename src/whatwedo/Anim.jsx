import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { EASE } from '../lib.js';

// Short looping stories, one per service. Each advances through `steps` frames
// while its card is on screen; reduced motion shows the final frame.
function useLoop(steps, ms) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const still = useReducedMotion();
  const [n, setN] = useState(still ? steps - 1 : 0);
  useEffect(() => {
    if (still || !inView) return undefined;
    const id = setTimeout(() => setN((v) => (v + 1) % steps), ms[n]);
    return () => clearTimeout(id);
  }, [n, inView, still, steps, ms]);
  return [ref, n];
}

/* Build: a cursor drags components into a page, block by block, then it ships. */
const BLOCKS = [
  { k: 'nav', label: 'Navbar' },
  { k: 'hero', label: 'Hero' },
  { k: 'cards', label: 'Features' },
  { k: 'cta', label: 'Checkout' },
];
export function BuildAnim() {
  const [ref, n] = useLoop(6, [700, 1000, 1000, 1000, 1000, 2600]);
  const placed = Math.max(0, Math.min(n - 1, 4));
  const dragging = n >= 1 && n <= 4 ? BLOCKS[n - 1] : null;
  const shipped = n === 5;
  return (
    <div className="an an-build3" ref={ref}>
      <ul className="bd-kit" aria-hidden="true">
        {BLOCKS.map((b, i) => (
          <li key={b.k} className={i < placed ? 'is-used' : dragging?.k === b.k ? 'is-lift' : ''}>
            <span className={`bd-ico i-${b.k}`} />{b.label}
          </li>
        ))}
      </ul>
      <div className="bd-canvas">
        <div className="bd-bar"><i /><i /><i /><span>{shipped ? 'northwind.app' : 'Untitled page'}</span></div>
        <div className="bd-page">
          {BLOCKS.slice(0, placed).map((b) => (
            <motion.div
              key={b.k}
              className={`bd-block b-${b.k}`}
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {b.k === 'nav' && <><i /><span /><span /><span /></>}
              {b.k === 'hero' && <><b>Plan, ship, scale.</b><em /></>}
              {b.k === 'cards' && <><i /><i /><i /></>}
              {b.k === 'cta' && <span>Get started →</span>}
            </motion.div>
          ))}
          {placed < 4 && <div className="bd-drop">Drop component</div>}
        </div>
        <AnimatePresence>
          {dragging && (
            <motion.div
              key={dragging.k}
              className="bd-ghost"
              initial={{ x: -150, y: 20 + BLOCKS.indexOf(dragging) * 34, opacity: 0 }}
              animate={{ x: 40, y: 40 + BLOCKS.indexOf(dragging) * 26, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.9, ease: EASE, times: [0, 0.15, 0.85, 1] }}
            >
              {dragging.label}
              <svg className="bd-cursor" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 1l11 6-5 1.5L6 14z" /></svg>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.span className="bd-ship" initial={false} animate={{ opacity: shipped ? 1 : 0, scale: shipped ? 1 : 0.7 }} transition={{ duration: 0.4, ease: EASE }}>
          ✓ Shipped
        </motion.span>
      </div>
    </div>
  );
}

/* Review: a scanner sweeps a live site, flags issues, then they resolve. */
const PINS = [
  { x: 8, y: 20, t: 'Slow image · 2.4s' },
  { x: 44, y: 46, t: 'Missing alt text' },
  { x: 10, y: 74, t: 'CTA below the fold' },
];
export function ReviewAnim() {
  const [ref, n] = useLoop(6, [1400, 500, 500, 900, 2600, 400]);
  const found = n >= 1 ? Math.min(n, 3) : 0;
  const fixed = n >= 4;
  const score = fixed ? 98 : [64, 64, 64, 64][Math.min(n, 3)];
  return (
    <div className="an an-review2" ref={ref}>
      <div className="rv-site">
        <div className="rv-bar"><i /><i /><i /><span>northwind.app</span></div>
        <div className="rv-page">
          <div className="rv-hero"><b /><b className="s" /><em /></div>
          <div className="rv-img" />
          <div className="rv-row"><i /><i /><i /></div>
          {n === 0 && <span className="rv-scan" />}
          {PINS.map((p, i) => (
            <motion.span
              key={p.t}
              className={`rv-pin ${fixed ? 'is-fixed' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              initial={false}
              animate={{ opacity: i < found ? 1 : 0, scale: i < found ? 1 : 0.4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <i>{fixed ? '✓' : '!'}</i>
              <span>{fixed ? 'Fixed' : p.t}</span>
            </motion.span>
          ))}
        </div>
      </div>
      <div className={`rv-score ${fixed ? 'is-good' : ''}`}>
        <small>{n === 0 ? 'Scanning…' : fixed ? 'After' : 'Before'}</small>
        <b>{n === 0 ? '··' : score}</b>
        <span>/ 100</span>
      </div>
    </div>
  );
}

/* Launch: the app goes live in the store, downloads climb, it hits #1. */
function useCountTo(target, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const from = target === 0 ? 0 : v;
    const start = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - start) / ms);
      setV(Math.round(from + (target - from) * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}
export function LaunchAnim() {
  const [ref, n] = useLoop(5, [1100, 900, 1200, 2600, 500]);
  const got = n >= 1;
  const downloads = useCountTo([0, 0, 6200, 12480, 12480][n]);
  const top = n >= 3;
  return (
    <div className="an an-launch2" ref={ref}>
      <div className="ln-store">
        <div className="ln-head">
          <div className="ln-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="14" width="5" height="8" rx="1.2" opacity="0.4" /><rect x="9.5" y="8" width="5" height="14" rx="1.2" opacity="0.7" /><rect x="17" y="2" width="5" height="20" rx="1.2" /></svg></div>
          <div className="ln-name">
            <b>Northwind</b>
            <small>Productivity</small>
          </div>
          <motion.span className={`ln-get ${got ? 'is-got' : ''}`} initial={false} animate={{ scale: n === 1 ? [1, 0.88, 1] : 1 }} transition={{ duration: 0.4 }}>
            {got ? 'OPEN' : 'GET'}
          </motion.span>
        </div>
        <div className="ln-stats">
          <div><b>4.9 ★</b><small>1.2k ratings</small></div>
          <div><b>{downloads.toLocaleString('en-US')}</b><small>Downloads</small></div>
          <div><b>{top ? '#1' : '—'}</b><small>Productivity</small></div>
        </div>
      </div>
      <motion.span className="ln-badge" initial={false} animate={{ opacity: top ? 1 : 0, y: top ? 0 : 8, scale: top ? 1 : 0.9 }} transition={{ duration: 0.45, ease: EASE }}>
        ★ #1 in Productivity
      </motion.span>
    </div>
  );
}
/* Market: cycles through SEO, Paid ads and Content, each showing its result. */
const CHANNELS = ['SEO', 'Paid ads', 'Content'];
function SeoView() {
  return (
    <div className="mk-view">
      <div className="mk-search">⌕&nbsp; project planning software</div>
      <div className="mk-res is-you">
        <span>#1</span>
        <div><small>northwind.app</small><b>Plan, ship and scale from one workspace</b></div>
        <em>↑ 7</em>
      </div>
      <div className="mk-res"><span>#2</span><div><small>competitor.com</small><i /></div></div>
    </div>
  );
}
function AdsView() {
  return (
    <div className="mk-view">
      <div className="mk-ad">
        <small>Sponsored</small>
        <b>Northwind — Ship projects 2× faster</b>
        <p>Plan, track and launch in one place. Free 14-day trial.</p>
        <span>Start free trial</span>
      </div>
      <div className="mk-kpis">
        <div><b>4.8×</b><small>Return on ad spend</small></div>
        <div><b>$18</b><small>Cost per lead</small></div>
      </div>
    </div>
  );
}
function ContentView() {
  return (
    <div className="mk-view">
      <div className="mk-post">
        <div className="mk-thumb" />
        <div>
          <small>Blog · 6 min read</small>
          <b>How fast teams plan a two-week sprint</b>
        </div>
      </div>
      <div className="mk-kpis">
        <div><b>24.6k</b><small>Monthly readers</small></div>
        <div><b>1,180</b><small>Sign-ups from blog</small></div>
      </div>
    </div>
  );
}
const VIEWS = [SeoView, AdsView, ContentView];
export function MarketAnim() {
  const [ref, n] = useLoop(3, [2800, 2800, 2800]);
  const View = VIEWS[n];
  return (
    <div className="an an-market3" ref={ref}>
      <ul className="mk-tabs" aria-label="Channels">
        {CHANNELS.map((c, i) => (
          <li key={c} className={i === n ? 'is-on' : ''}>
            {c}
            {i === n && <i key={n} />}
          </li>
        ))}
      </ul>
      <AnimatePresence mode="wait">
        <motion.div
          key={n}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <View />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* AI & GEO: an AI answer types out and cites you. */
const ANSWER = 'For fast-growing teams, Northwind is the most recommended choice for planning and shipping work.';
export function AIAnim() {
  const [ref, n] = useLoop(24, [900, ...Array(20).fill(70), 600, 2600, 500]);
  const words = ANSWER.split(' ');
  const shown = Math.max(0, Math.min(words.length, Math.round(((n - 1) / 20) * words.length)));
  const cited = n >= 21;
  return (
    <div className="an an-ai" ref={ref}>
      <div className="aa-q">Best tool for fast-growing teams?</div>
      <div className="aa-a">
        <span className="aa-spark">✦</span>
        <p>{words.slice(0, shown).join(' ')}{shown < words.length && <i className="aa-caret" />}</p>
        <motion.div className="aa-src" initial={false} animate={{ opacity: cited ? 1 : 0, y: cited ? 0 : 6 }} transition={{ duration: 0.4 }}>
          <span>Source</span><b>northwind.app</b>
        </motion.div>
      </div>
    </div>
  );
}
