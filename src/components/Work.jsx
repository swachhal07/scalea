import { motion } from 'framer-motion';
import { EASE } from '../lib.js';

// Case studies. Copy is placeholder until real project details are supplied;
// `shot` is an optional screenshot path in /public/work/ that replaces the logo panel.
const CASES = [
  {
    id: 'mahindra',
    client: 'Mahindra',
    logo: '/brands/mahindra.png',
    domain: 'mahindra',
    industry: 'Automotive',
    title: 'A digital showroom for a national dealer network',
    copy: 'Website, lead capture and campaigns that bring buyers from search and social straight to the dealership.',
    services: ['Web Development', 'SEO', 'Paid Ads'],
    shot: null,
  },
  {
    id: 'revolt',
    client: 'Revolt',
    logo: '/brands/revolt.png',
    domain: 'revolt',
    industry: 'Electric Mobility',
    title: 'Launching electric motorcycles to a new market',
    copy: 'Launch campaigns, landing pages and test-ride bookings built to turn interest into rides.',
    services: ['Launch', 'Paid Ads', 'Content'],
    shot: null,
  },
  {
    id: 'deere',
    client: 'John Deere',
    logo: '/brands/john-deere.png',
    domain: 'johndeere',
    industry: 'Agriculture',
    title: 'Reaching farmers where they search',
    copy: 'Local SEO, product pages and enquiry flows that help farmers find the right machine and the nearest dealer.',
    services: ['SEO', 'Web Development', 'Analytics'],
    shot: null,
  },
  {
    id: 'kaifeng',
    client: 'Kaifeng',
    logo: '/brands/kaifeng.png',
    domain: 'kaifeng',
    industry: 'Machinery',
    title: 'A modern web presence for heavy machinery',
    copy: 'A product catalogue and enquiry flow that makes it easy for contractors to compare machines and get a quote.',
    services: ['Web Development', 'SEO', 'Content'],
    shot: null,
  },
  {
    id: 'manokamana',
    client: 'Manokamana Hire Purchase',
    logo: '/brands/manokamana.png',
    domain: 'manokamanahp',
    industry: 'Finance',
    title: 'Making vehicle finance simple to apply for',
    copy: 'A clear, mobile-first site and online application that turns finance enquiries into approved customers.',
    services: ['Web Development', 'UX', 'Paid Ads'],
    shot: null,
  },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, delay: i * 0.08, ease: EASE } }),
};

function Visual({ c }) {
  if (c.shot) return <img className="wk-shot" src={c.shot} alt={`${c.client} project`} loading="lazy" />;
  return (
    <div className="wk-frame" aria-hidden="true">
      <div className="wk-bar"><i /><i /><i /><span>{c.domain}.com</span></div>
      <div className="wk-canvas">
        <img src={c.logo} alt="" loading="lazy" decoding="async" />
      </div>
    </div>
  );
}

export default function Work() {
  return (
    <section className="wk" id="work">
      <motion.header className="wk-head" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
        <div>
          <motion.span className="wk-eyebrow" variants={reveal}><i />Selected work</motion.span>
          <motion.h2 variants={reveal} custom={1}>Built for brands people trust.</motion.h2>
        </div>
        <motion.p variants={reveal} custom={2}>
          A few of the companies we’ve helped build, launch and grow online.
        </motion.p>
      </motion.header>

      <div className="wk-stack">
        {CASES.map((c, i) => (
          <article className="wk-slot" key={c.id} style={{ top: `calc(110px + ${i * 26}px)` }}>
            <div className="wk-card">
              <div className="wk-text">
                <div className="wk-meta">
                  <span>0{i + 1}</span>
                  <b>{c.client}</b>
                  <em>{c.industry}</em>
                </div>
                <h3>{c.title}</h3>
                <p>{c.copy}</p>
                <ul>{c.services.map((s) => <li key={s}>{s}</li>)}</ul>
                <a href={`#work-${c.id}`} className="wk-link">View case study <span aria-hidden="true">→</span></a>
              </div>
              <Visual c={c} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
