import { motion } from 'framer-motion';
import { EASE } from '../lib.js';
import { SITE } from '../site.jsx';

// Privacy policy and terms of use, sharing one long-form reading layout.

export const UPDATED = '26 October 2026';

const reveal = {
  hidden: { opacity: 0, transform: 'translateY(16px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.9, delay: i * 0.08, ease: EASE } }),
};

const Mail = () => <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;

export const PRIVACY = [
  {
    h: 'Who we are',
    p: [
      <>Scalea is a digital studio based in Kathmandu, Nepal. This policy explains what we collect when you use this website or get in touch with us, and what we do with it. If anything here is unclear, write to <Mail />.</>,
    ],
  },
  {
    h: 'What we collect',
    p: [
      'Only what you choose to send us. When you fill in the project form, message us on WhatsApp, email us or apply for a role, we receive what you write: usually your name, email address, phone number, company and the details of your project or application.',
      'Our hosting provider keeps standard server logs (such as IP address, browser type and the pages requested) for security and to keep the site running. We do not use advertising trackers or sell data to anyone.',
    ],
  },
  {
    h: 'How we use it',
    p: [
      'To reply to you, prepare proposals and estimates, deliver work you hire us for, review job applications, and keep records our accounts and the law require. We will not add you to a marketing list unless you ask to be on one.',
    ],
  },
  {
    h: 'Who we share it with',
    p: [
      'A small number of services we rely on to run the studio, such as our email provider, WhatsApp, and Google Workspace (where career applications are stored). They only process your information on our behalf. We share information with authorities only when the law requires it.',
    ],
  },
  {
    h: 'How long we keep it',
    p: [
      'Enquiries that do not become projects are deleted within 12 months. Client records are kept for as long as the work and our legal obligations require. Job applications are kept for up to 12 months so we can contact you about future roles, unless you ask us to delete them sooner.',
    ],
  },
  {
    h: 'Your choices',
    p: [
      <>You can ask to see, correct or delete the information we hold about you at any time by emailing <Mail />. We will respond within 30 days.</>,
    ],
  },
  {
    h: 'Changes to this policy',
    p: ['If we change how we handle your information, we will update this page and the date at the top.'],
  },
];

export const TERMS = [
  {
    h: 'Using this site',
    p: [
      'By using this website you agree to these terms. The site is here to tell you about our work and services and to help you get in touch. Please do not misuse it, try to break it, or use it for anything unlawful.',
    ],
  },
  {
    h: 'Our content',
    p: [
      'The text, design, graphics and code on this site belong to Scalea unless stated otherwise. Client names and logos belong to their owners and are shown to describe work we have done for them. You may share links to our pages, but please do not copy or reuse our content without permission.',
    ],
  },
  {
    h: 'Project work',
    p: [
      'Anything on this site about timelines, prices or results is a general description, not an offer. Every project we take on is covered by its own written proposal or agreement, which sets out the scope, price, timeline, ownership and payment terms. If that agreement and these terms disagree, the agreement wins.',
    ],
  },
  {
    h: 'Links to other sites',
    p: [
      'We link to client websites and other services we think are useful. We are not responsible for their content or how they handle your information.',
    ],
  },
  {
    h: 'No guarantees',
    p: [
      'We work hard to keep this site accurate and available, but it is provided as it is. We cannot promise it will always be error-free or online, and we are not liable for losses that come from using it, as far as the law allows.',
    ],
  },
  {
    h: 'Governing law',
    p: ['These terms are governed by the laws of Nepal, and any disputes will be handled by the courts of Kathmandu.'],
  },
  {
    h: 'Changes and contact',
    p: [
      <>We may update these terms from time to time; the date at the top shows the latest version. Questions? Write to <Mail />.</>,
    ],
  },
];

function LegalPage({ eyebrow, title, lede, sections }) {
  return (
    <section className="lg">
      <motion.div className="lg-wrap" initial="hidden" animate="show">
        <header className="lg-head">
          <motion.span className="sp-eyebrow" variants={reveal}><i />{eyebrow}</motion.span>
          <motion.h1 variants={reveal} custom={1}>{title}</motion.h1>
          <motion.p className="lg-lede" variants={reveal} custom={2}>{lede}</motion.p>
          <motion.span className="lg-date" variants={reveal} custom={3}>Last updated {UPDATED}</motion.span>
        </header>

        <div className="lg-body">
          <motion.nav className="lg-toc" aria-label="On this page" variants={reveal} custom={3}>
            <b>On this page</b>
            <ol>
              {sections.map((s, i) => <li key={s.h}><a href={`#s${i + 1}`}>{s.h}</a></li>)}
            </ol>
          </motion.nav>
          <motion.div className="lg-sections" variants={reveal} custom={4}>
            {sections.map((s, i) => (
              <article key={s.h} id={`s${i + 1}`}>
                <h2><span>0{i + 1}</span>{s.h}</h2>
                {s.p.map((para, j) => <p key={j}>{para}</p>)}
              </article>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div className="sp-foot">
        <span>© {new Date().getFullYear()} Scalea. All rights reserved.</span>
        <span>
          <a href="/">Back to site</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </span>
      </div>
    </section>
  );
}

// Page headers, shared with the markdown version of each page.
export const PRIVACY_HEAD = {
  eyebrow: 'Privacy',
  title: 'Privacy policy',
  lede: 'Plain and short: we collect only what you send us, use it to work with you, and never sell it.',
};
export const TERMS_HEAD = {
  eyebrow: 'Terms',
  title: 'Terms of use',
  lede: 'The ground rules for using this site. Project work is always covered by its own written agreement.',
};

export function Privacy() {
  return <LegalPage {...PRIVACY_HEAD} sections={PRIVACY} />;
}

export function Terms() {
  return <LegalPage {...TERMS_HEAD} sections={TERMS} />;
}
