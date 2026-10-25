import { motion } from 'framer-motion';
import { EASE } from '../lib.js';
import DotField from '../howwework/DotField.jsx';
import FlickeringGrid from './FlickeringGrid.jsx';

const COLS = [
  { k: 'Services', links: ['Web Development', 'Mobile Apps', 'UX & SEO Audits', 'Launch & ASO', 'SEO & Paid Ads', 'AI & GEO'] },
  { k: 'Company', links: ['About', 'Work', 'Process', 'Careers'] },
  { k: 'Contact', links: ['hello@scalevia.com', 'Kathmandu, Nepal', 'Book a call'] },
];

const SOCIAL = [
  ['LinkedIn', 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4z'],
  ['Instagram', 'M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-7.9a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2ZM12 3.6c2.7 0 3 0 4.1.06 2.7.12 4 1.42 4.12 4.12.06 1.06.06 1.38.06 4.08s0 3.02-.06 4.08c-.12 2.7-1.42 4-4.12 4.12-1.06.06-1.38.06-4.1.06s-3.02 0-4.08-.06c-2.72-.12-4-1.43-4.12-4.12C3.74 15.02 3.73 14.7 3.73 12s0-3.02.06-4.08C3.9 5.2 5.2 3.9 7.9 3.78 8.98 3.62 9.3 3.6 12 3.6Z'],
  ['X', 'M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.16h1.7L7.4 4.74H5.57z'],
];

// Footer links resolve to the one page we have, the sections on it, or email.
// Anything with no destination (the studio address) stays plain text.
const HREFS = {
  Work: '/#work', Process: '/#process', About: '/#about',
  'Book a call': '/start', 'Kathmandu, Nepal': null,
  Careers: 'mailto:hello@scalevia.com?subject=Careers',
};

function hrefFor(label) {
  if (label.includes('@')) return `mailto:${label}`;
  return label in HREFS ? HREFS[label] : '/start';
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

export default function Closing() {
  return (
    <>
      <section className="cta" id="start">
        <DotField />
        <motion.div
          className="cta-inner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <span className="cta-mark"><Logo /></span>
          <h2>Let’s build what’s next.</h2>
          <p>Tell us what you’re building. We’ll reply within one working day with ideas, a plan and an honest estimate.</p>
          <div className="cta-actions">
            <a href="/start" className="p-cta">Start a Project</a>
            <a href="/start" className="cta-ghost">Book a 20-min call <span aria-hidden="true">→</span></a>
          </div>
          <ul className="cta-points">
            <li>Free discovery call</li>
            <li>Fixed-scope proposals</li>
            <li>Reply within 24 hours</li>
          </ul>
        </motion.div>
      </section>

      <footer className="ft">
        <div className="ft-top">
          <div className="ft-brand">
            <a href="#top" className="logo"><span className="logo-tile"><Logo /></span><span>SCALEVIA</span></a>
            <p>We build digital products and help businesses grow through technology, marketing and AI.</p>
            <ul className="ft-social">
              {SOCIAL.map(([k, d]) => (
                <li key={k}><a href="#" aria-label={k}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg></a></li>
              ))}
            </ul>
          </div>
          {COLS.map((c) => (
            <nav key={c.k} className="ft-col" aria-label={c.k}>
              <b>{c.k}</b>
              <ul>
            {c.links.map((l) => {
              const href = hrefFor(l);
              return <li key={l}>{href ? <a href={href}>{l}</a> : <span>{l}</span>}</li>;
            })}
          </ul>
            </nav>
          ))}
        </div>
        <FlickeringGrid
          className="ft-word"
          text="SCALEVIA"
          fontSize={280}
          fontWeight={800}
          fitWidth={0.94}
          squareSize={2}
          gridGap={3}
          flickerChance={0.12}
          maxOpacity={0.2}
          textFloor={0.4}
          textGain={2.6}
          textOnly
        />
        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} Scalevia. All rights reserved.</span>
          <span><a href="#">Privacy</a><a href="#">Terms</a></span>
        </div>
      </footer>
    </>
  );
}
