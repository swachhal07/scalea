import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '../lib.js';

// Label → section id. "Solutions" is how we talk about the process section.
const LINKS = [
  ['Services', '/#services'],
  ['Solutions', '/#process'],
  ['Work', '/#work'],
  ['About', '/#about'],
];

export function Logo() {
  return (
    <a href="#" className="logo" aria-label="Scalevia home">
      <span className="logo-tile">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <rect x="2" y="14" width="5" height="8" rx="1.2" fill="currentColor" opacity="0.35" />
          <rect x="9.5" y="8" width="5" height="14" rx="1.2" fill="currentColor" opacity="0.65" />
          <rect x="17" y="2" width="5" height="20" rx="1.2" fill="currentColor" />
        </svg>
      </span>
      <span>SCALEVIA</span>
    </a>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      className="nav"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
    >
      <Logo />
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map(([label, href]) => (
          <a key={label} href={href}>{label}</a>
        ))}
      </nav>
      <a href="/start" className="nav-cta">
        Start a Project <span className="arrow" aria-hidden="true">→</span>
      </a>
      <button
        className={`nav-toggle ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>

      <motion.div
        className="nav-sheet"
        initial={false}
        animate={open ? { opacity: 1, y: 0, pointerEvents: 'auto' } : { opacity: 0, y: -8, pointerEvents: 'none' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {LINKS.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
        <a href="/start" className="nav-sheet-cta" onClick={() => setOpen(false)}>
          Start a Project <span aria-hidden="true">→</span>
        </a>
      </motion.div>
    </motion.header>
  );
}
