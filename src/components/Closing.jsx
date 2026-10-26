import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '../lib.js';
import { getLenis } from '../scroll.js';
import Bars from './Bars.jsx';
import DotField from '../howwework/DotField.jsx';
import FlickeringGrid from './FlickeringGrid.jsx';
import { SITE, SocialLinks, whatsappHref } from '../site.jsx';

export const COPY = {
  heading: 'Let’s build what’s next.',
  intro: 'Tell us what you’re building. We’ll reply within one working day with ideas, a plan and an honest estimate.',
  points: ['Free discovery call', 'Fixed-scope proposals', 'Reply within 24 hours'],
};

const COLS = [
  { k: 'Services', links: ['Web Development', 'Mobile Apps', 'UX & SEO Audits', 'Launch & ASO', 'SEO & Paid Ads', 'AI & GEO'] },
  { k: 'Company', links: ['About', 'Work', 'Process', 'Careers'] },
  { k: 'Contact', links: [SITE.email, SITE.phone, 'Kathmandu, Nepal', 'WhatsApp us'] },
];


// Footer links resolve to a page, a section of the home page, email or WhatsApp.
// Anything with no destination (the studio address) stays plain text.
const HREFS = {
  Work: '/#work', Process: '/#process', About: '/#about',
  'Kathmandu, Nepal': null,
  Careers: '/careers',
};

function hrefFor(label) {
  if (label.includes('@')) return `mailto:${label}`;
  if (label === SITE.phone) return `tel:+${SITE.whatsapp}`;
  if (label === 'WhatsApp us') return whatsappHref();
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

// Phones get a finer dot grid so the wordmark stays legible at small sizes.
function useNarrow() {
  const query = '(max-width: 639px)';
  const [narrow, setNarrow] = useState(() => !import.meta.env.SSR && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setNarrow(mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return narrow;
}

function toTop() {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function Closing() {
  const narrow = useNarrow();
  return (
    <>
      <section className="cta" id="start">
        <DotField />
        <motion.div
          className="cta-inner"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <span className="cta-mark"><Logo /></span>
          <h2>{COPY.heading}</h2>
          <p>{COPY.intro}</p>
          <div className="cta-actions">
            <a href="/start" className="p-cta"><Bars /><span className="p-cta-label">Start a Project</span></a>
            <a href={whatsappHref()} className="cta-ghost" {...(SITE.whatsapp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>Chat on WhatsApp <span aria-hidden="true">→</span></a>
          </div>
          <ul className="cta-points">
            {COPY.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </motion.div>
      </section>

      <footer className="ft">
        <div className="ft-top">
          <div className="ft-brand">
            <a href="#top" className="logo"><span className="logo-tile"><Logo /></span><span>SCALEA</span></a>
            <p>We build digital products and help businesses grow through technology, marketing and AI.</p>
            <ul className="ft-social">
              <SocialLinks />
            </ul>
          </div>
          {COLS.map((c) => (
            <nav key={c.k} className="ft-col" aria-label={c.k}>
              <b>{c.k}</b>
              <ul>
            {c.links.map((l) => {
              const href = hrefFor(l);
              const external = href?.startsWith('https://');
              return <li key={l}>{href ? <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l}</a> : <span>{l}</span>}</li>;
            })}
          </ul>
            </nav>
          ))}
        </div>
        <FlickeringGrid
          className="ft-word"
          text="SCALEA"
          fontSize={280}
          fontWeight={800}
          fitWidth={0.94}
          squareSize={2}
          gridGap={narrow ? 1 : 3}
          flickerChance={0.12}
          maxOpacity={0.2}
          textFloor={narrow ? 0.6 : 0.4}
          textGain={2.6}
          textOnly
        />
        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} Scalea. All rights reserved.</span>
          <span><a href="/privacy">Privacy</a><a href="/terms">Terms</a></span>
          <button type="button" className="ft-top-btn" onClick={toTop}>Back to top <i aria-hidden="true">↑</i></button>
        </div>
      </footer>
    </>
  );
}
