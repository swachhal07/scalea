import { motion } from 'framer-motion';
import { EASE, titleReveal } from '../lib.js';
import Bars from '../components/Bars.jsx';
import Closing, { COPY as CLOSING } from '../components/Closing.jsx';
import { CASES } from '../components/Work.jsx';
import { TOOLS } from '../components/Tools.jsx';
import { WebCard, MobileCard, UXCard, AuditCard, SeoCard, AdsCard, GeoCard, ChartCard } from '../heroes/EdgeCards.jsx';
import { STEPS } from '../howwework/steps.js';
import { SERVICES, servicePath } from '../services.js';
import { whatsappHref } from '../site.jsx';
import { goBack } from '../router.jsx';

// One service: a hero with a stage of the home page's glass cards, what's included, the
// process, who it's for beside related clients (or the tools), common questions and the
// other services, then the site's closing call to action and footer. Copy lives in
// src/services.js, shared with the markdown version.

const reveal = {
  hidden: { opacity: 0, transform: 'translateY(20px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.9, delay: i * 0.08, ease: EASE } }),
};
// Below the hero, boxes only fade in: on a phone, a slide up reads as the layout jumping.
const fade = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({ opacity: 1, transition: { duration: 0.8, delay: i * 0.06, ease: EASE } }),
};
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.2 } };

// Three hero cards per service, near to far; widths in em, as on the home hero.
const STAGE = {
  'web-development': [WebCard, AuditCard, ChartCard],
  'mobile-app-development': [MobileCard, UXCard, ChartCard],
  'ux-seo-audit': [AuditCard, UXCard, SeoCard],
  'app-launch-aso': [MobileCard, AuditCard, ChartCard],
  'seo-paid-ads': [SeoCard, AdsCard, ChartCard],
  'ai-geo': [GeoCard, SeoCard, ChartCard],
};
const WIDTH = new Map([[WebCard, 21], [MobileCard, 15], [UXCard, 16], [AuditCard, 21], [SeoCard, 18], [AdsCard, 15], [GeoCard, 19], [ChartCard, 22]]);

// Clients whose case study lists one of this service's tags.
export const workFor = (service) => CASES.filter((c) => c.services.some((t) => service.work.includes(t)));

// Light follows the pointer along a card's edge, as on the home page cards.
function track(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function Head({ k, title, children }) {
  return (
    <motion.header className="sv-head" variants={fade}>
      <span className="sv-eyebrow"><i />{k}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </motion.header>
  );
}

export default function ServicePage({ route }) {
  const s = SERVICES.find((x) => servicePath(x) === route);
  const work = workFor(s);
  const others = SERVICES.filter((x) => x !== s);

  return (
    <>
      <section className="sv">
        <div className="sv-hero">
          <motion.div className="sv-copy" initial="hidden" animate="show">
            <motion.div className="sv-top" variants={reveal}>
              <a href="/#services" className="sv-back" onClick={goBack} aria-label="Back">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
              </a>
              <nav className="sv-crumbs" aria-label="Breadcrumb">
                <a href="/#services">Services</a><span aria-hidden="true">/</span><span>{s.label}</span>
              </nav>
            </motion.div>
            <motion.h1 variants={titleReveal} custom={1}>{s.h1}</motion.h1>
            <motion.p className="sv-lede" variants={reveal} custom={2}>{s.lede}</motion.p>
            <motion.div className="sv-actions" variants={reveal} custom={3}>
              <a href="/start" className="p-cta"><Bars /><span className="p-cta-label">Start a Project</span></a>
              <a href={whatsappHref()} className="cta-ghost" target="_blank" rel="noopener noreferrer">Chat on WhatsApp <span aria-hidden="true">→</span></a>
            </motion.div>
            <motion.ul className="sv-points" variants={reveal} custom={4}>
              {CLOSING.points.map((p) => <li key={p}>{p}</li>)}
            </motion.ul>
          </motion.div>

          <motion.div className="sv-stage" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.3, ease: EASE }}>
            {STAGE[s.slug].map((Card, i) => (
              <div key={i} className={`sv-slot sv-slot-${i}`} style={{ width: `${WIDTH.get(Card)}em` }}>
                <div className="p-float"><Card /></div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.section className="sv-section" {...inView} aria-labelledby="sv-included">
          <Head k="What’s included" title={<span id="sv-included">Everything in {s.name.toLowerCase()}.</span>} />
          <ol className="sv-grid">
            {s.includes.map(([t, d], i) => (
              <motion.li key={t} className="sv-card" variants={fade} custom={i % 3} onMouseMove={track}>
                <span className="sv-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </motion.li>
            ))}
          </ol>
        </motion.section>


        <motion.section className="sv-section" {...inView} aria-labelledby="sv-how">
          <Head k="How we work" title={<span id="sv-how">From first call to launch.</span>}>
            One team from kickoff to growth, with a live preview so you see progress as it happens.
          </Head>
          <ol className="sv-steps">
            {STEPS.map((st, i) => (
              <motion.li key={st.k} variants={fade} custom={i}>
                <span className="sv-step-n">{String(i + 1).padStart(2, '0')}</span>
                <i className="sv-step-node" aria-hidden="true" />
                <h3>{st.k}</h3>
                <p>{st.copy}</p>
              </motion.li>
            ))}
          </ol>
        </motion.section>

        <motion.section className="sv-section sv-pair" {...inView}>
          <motion.div className="sv-card sv-fit" variants={fade} onMouseMove={track}>
            <span className="sv-eyebrow"><i />Who it’s for</span>
            <ul>{s.fit.map((f) => <li key={f}>{f}</li>)}</ul>
          </motion.div>
          {work.length > 0 ? (
            <motion.div className="sv-card sv-clients" variants={fade} custom={1} onMouseMove={track}>
              <span className="sv-eyebrow"><i />Related work</span>
              <ul>
                {work.map((c) => (
                  <li key={c.id}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" aria-label={`${c.client}, ${c.industry} (opens their website)`}>
                      <img src={c.logo.replace(/\.png$/, '.webp')} alt="" width="140" height="44" loading="lazy" decoding="async" />
                      <span>{c.industry}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div className="sv-card sv-clients" variants={fade} custom={1} onMouseMove={track}>
              <span className="sv-eyebrow"><i />Tools we use</span>
              <ul>
                {TOOLS.map((t) => (
                  <li key={t.name}>
                    <div className="sv-tool">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={t.icon.path} /></svg>
                      <b>{t.name}</b>
                      <span>{t.role}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.section>

        <motion.section className="sv-section sv-faq" {...inView} aria-labelledby="sv-faq">
          <motion.div className="sv-faq-side" variants={fade}>
            <span className="sv-eyebrow"><i />Questions</span>
            <h2 id="sv-faq">Common questions.</h2>
            <p>Something else? <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a> and a real person replies the same working day.</p>
          </motion.div>
          <div className="sv-faq-list">
            {s.faq.map(([q, a], i) => (
              <motion.article key={q} variants={fade} custom={i}>
                <h3>{q}</h3>
                <p>{a}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.nav className="sv-section" {...inView} aria-labelledby="sv-more">
          <Head k="More services" title={<span id="sv-more">One team for the whole journey.</span>} />
          <ul className="sv-more">
            {others.map((x, i) => (
              <motion.li key={x.slug} variants={fade} custom={i % 3}>
                <a href={servicePath(x)} className="sv-card" onMouseMove={track}>
                  <b>{x.label}</b>
                  <span>{x.h1}</span>
                  <i aria-hidden="true">→</i>
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.nav>
      </section>
      <Closing />
    </>
  );
}
