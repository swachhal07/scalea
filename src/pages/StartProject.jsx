import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, titleReveal } from '../lib.js';
import Bars from '../components/Bars.jsx';
import { Field, Group, isEmail } from './Field.jsx';
import { SITE, whatsappHref } from '../site.jsx';

export const SERVICES = [
  'Website', 'Web app', 'Mobile app', 'UX & SEO audit', 'SEO & paid ads', 'AI & automation',
];
export const BUDGETS = ['Under $5k', '$5k – $15k', '$15k – $50k', '$50k+', 'Not sure yet'];
export const TIMELINES = ['As soon as possible', 'In the next 1–3 months', 'In 3–6 months', 'Just exploring'];

export const COPY = {
  title: 'Tell us what you’re building.',
  lede: 'Fill this in and you’ll hear back within one working day with first thoughts, a plan and an honest estimate. No sales sequence, no obligation.',
  studio: 'Kathmandu, Nepal',
  reply: 'Within 24 hours',
};

export const STEPS = [
  ['01', 'We read your brief', 'A real person, same working day. No ticket queue.'],
  ['02', 'A 20-minute call', 'We ask what we still need to know and tell you what we would do.'],
  ['03', 'A fixed-scope proposal', 'Scope, timeline and price in writing within three working days.'],
];

const INBOX = SITE.email;

const reveal = {
  hidden: { opacity: 0, transform: 'translateY(24px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 1, delay: i * 0.08, ease: EASE } }),
};

const EMPTY = {
  name: '', email: '', company: '', services: [], budget: '', timeline: '', details: '',
};

/** Fold the answers into a readable brief for the inbox. */
function composeBrief(form) {
  const lines = [
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    form.company && `Company: ${form.company}`,
    form.services.length && `Needs: ${form.services.join(', ')}`,
    form.budget && `Budget: ${form.budget}`,
    form.timeline && `Timeline: ${form.timeline}`,
    '',
    form.details,
  ].filter(Boolean);

  return `mailto:${INBOX}?subject=${encodeURIComponent(`Project enquiry — ${form.name}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export default function StartProject() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: null } : e));
  };

  const toggleService = (s) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));

  const onSubmit = (e) => {
    e.preventDefault();

    const next = {};
    if (!form.name.trim()) next.name = 'We need a name to reply to.';
    if (!isEmail(form.email)) next.email = 'Please check this email address.';
    if (form.details.trim().length < 20) next.details = 'A couple of sentences is plenty — tell us a bit more.';

    setErrors(next);
    if (Object.keys(next).length) {
      document.querySelector('.sp-field.is-bad input, .sp-field.is-bad textarea')?.focus();
      return;
    }

    const href = composeBrief(form);
    setSent(href);
    window.location.href = href;
  };

  return (
    <section className="sp">
      <motion.div className="sp-grid" initial="hidden" animate="show">
        <aside className="sp-aside">
          <motion.span className="sp-eyebrow" variants={reveal}><i />Start a project</motion.span>
          <motion.h1 variants={titleReveal} custom={1}>{COPY.title}</motion.h1>
          <motion.p className="sp-lede" variants={reveal} custom={2}>
            {COPY.lede}
          </motion.p>

          <motion.ol className="sp-steps" variants={reveal} custom={3}>
            {STEPS.map(([n, title, body]) => (
              <li key={n}>
                <span className="sp-step-n">{n}</span>
                <div>
                  <b>{title}</b>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </motion.ol>

          <motion.dl className="sp-meta" variants={reveal} custom={4}>
            <div><dt>Email</dt><dd><a href={`mailto:${INBOX}`}>{INBOX}</a></dd></div>
            <div><dt>Phone / WhatsApp</dt><dd><a href={whatsappHref()} target="_blank" rel="noopener noreferrer">{SITE.phone}</a></dd></div>
            <div><dt>Studio</dt><dd>{COPY.studio}</dd></div>
            <div><dt>Reply time</dt><dd>{COPY.reply}</dd></div>
          </motion.dl>
        </aside>

        <motion.div className="sp-card" variants={reveal} custom={2}>
          {sent ? (
            <div className="sp-done" role="status">
              <span className="sp-done-mark" aria-hidden="true">✓</span>
              <h2>Your brief is ready to send.</h2>
              <p>
                We opened it in your email app so you can see exactly what goes to us. If nothing
                opened, <a href={sent}>use this link</a> or write to <a href={`mailto:${INBOX}`}>{INBOX}</a>.
              </p>
              <button type="button" className="sp-ghost" onClick={() => { setSent(null); setForm(EMPTY); }}>
                Edit the brief
              </button>
            </div>
          ) : (
            <form className="sp-form" onSubmit={onSubmit} noValidate>
              <div className="sp-row">
                <Field label="Your name" error={errors.name}>
                  <input
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    autoComplete="email"
                    placeholder="you@company.com"
                  />
                </Field>
              </div>

              <Field label="Company" hint="Optional">
                <input
                  value={form.company}
                  onChange={(e) => set('company', e.target.value)}
                  autoComplete="organization"
                  placeholder="Where you work"
                />
              </Field>

              <Group label="What do you need?" hint="Pick any">
                {SERVICES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`sp-chip ${form.services.includes(s) ? 'is-on' : ''}`}
                    aria-pressed={form.services.includes(s)}
                    onClick={() => toggleService(s)}
                  >
                    {s}
                  </button>
                ))}
              </Group>

              <Group label="Budget" hint="Optional">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`sp-chip ${form.budget === b ? 'is-on' : ''}`}
                    aria-pressed={form.budget === b}
                    onClick={() => set('budget', form.budget === b ? '' : b)}
                  >
                    {b}
                  </button>
                ))}
              </Group>

              <Field label="Timeline" hint="Optional">
                <select value={form.timeline} onChange={(e) => set('timeline', e.target.value)}>
                  <option value="">Choose one</option>
                  {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="What are you building?" error={errors.details}>
                <textarea
                  rows={6}
                  value={form.details}
                  onChange={(e) => set('details', e.target.value)}
                  placeholder="The product, who it’s for, what’s already built, and what success looks like."
                />
              </Field>

              <div className="sp-submit">
                <button type="submit" className="p-cta"><Bars /><span className="p-cta-label">Send project brief</span></button>
                <p>We reply within one working day. Your details stay with us.</p>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>

      <div className="sp-foot">
        <span>© {new Date().getFullYear()} Scalea. All rights reserved.</span>
        <span>
          <a href="/">Back to site</a>
          <a href={`mailto:${INBOX}`}>{INBOX}</a>
        </span>
      </div>
    </section>
  );
}
