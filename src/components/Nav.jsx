import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE } from '../lib.js';
import { lockScroll } from '../scroll.js';
import Bars from './Bars.jsx';
import { SITE, SocialLinks } from '../site.jsx';
import { useIntroDone } from '../intro.js';

// Mobile menu: the panel fades in, then its rows rise in one after another.
const sheet = {
  hidden: { opacity: 0, transform: 'translateY(-8px)' },
  show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.45, ease: EASE, staggerChildren: 0.05, delayChildren: 0.08 } },
  exit: { opacity: 0, transform: 'translateY(-8px)', transition: { duration: 0.25, ease: EASE } },
};
const row = {
  hidden: { opacity: 0, transform: 'translateY(14px)' },
  show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.5, ease: EASE } },
};

// Label → section id. "Solutions" is how we talk about the process section.
const LINKS = [
  ['Home', '/#top'],
  ['Services', '/#services'],
  ['Solutions', '/#process'],
  ['Work', '/#work'],
  ['About', '/#about'],
];

export function Logo() {
  return (
    <a href="/#top" className="logo" aria-label="Scalea home">
      <span className="logo-tile">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <rect x="2" y="14" width="5" height="8" rx="1.2" fill="currentColor" opacity="0.35" />
          <rect x="9.5" y="8" width="5" height="14" rx="1.2" fill="currentColor" opacity="0.65" />
          <rect x="17" y="2" width="5" height="20" rx="1.2" fill="currentColor" />
        </svg>
      </span>
      <span>SCALEA</span>
    </a>
  );
}

export default function Nav() {
  const go = useIntroDone();
  const [open, setOpen] = useState(false);

  // While the menu is open the page holds still; Escape or widening past phone size closes it.
  useEffect(() => {
    if (!open) return undefined;
    lockScroll(true);
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const wide = window.matchMedia('(min-width: 640px)');
    const onWide = () => { if (wide.matches) setOpen(false); };
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, [open]);

  return (
    <motion.header
      className="nav"
      initial={{ opacity: 0, y: -12 }}
      animate={go ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
    >
      <Logo />
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map(([label, href]) => (
          <a key={label} href={href}>
            <span className="roll" data-text={label}><span>{label}</span></span>
          </a>
        ))}
      </nav>
      <a href="/start" className="nav-cta">
        <span className="nav-cta-label">Start a Project</span>
        <span className="nav-cta-arrow" aria-hidden="true"><span>→</span><span>→</span></span>
      </a>
      <button
        className={`nav-toggle ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="nav-sheet"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-sheet"
            className="nav-sheet"
            variants={sheet}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <motion.div className="nav-sheet-k" variants={row}>
              <span>Menu</span>
              <span className="nav-sheet-live"><i />Taking new projects</span>
            </motion.div>
            <nav className="nav-sheet-links" aria-label="Mobile">
              {LINKS.map(([label, href], i) => (
                <motion.a key={label} href={href} variants={row} onClick={() => setOpen(false)}>
                  <small>0{i + 1}</small>
                  <span>{label}</span>
                  <i aria-hidden="true">→</i>
                </motion.a>
              ))}
            </nav>
            <motion.div className="nav-sheet-foot" variants={row}>
              <a href="/start" className="p-cta" onClick={() => setOpen(false)}>
                <Bars /><span className="p-cta-label">Start a Project</span>
              </a>
              <div className="nav-sheet-contact">
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                <ul><SocialLinks /></ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
