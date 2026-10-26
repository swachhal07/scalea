import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, titleReveal } from '../lib.js';
import Bars from '../components/Bars.jsx';
import CycleWord from '../components/CycleWord.jsx';
import { SITE } from '../site.jsx';
import { Field, isEmail } from './Field.jsx';

// "… what's next with us": the same word cycle as the hero button.
const VERBS = [
  { w: 'Design', ms: 3000 },
  { w: 'Build', ms: 3000 },
  { w: 'Grow', ms: 4500 },
];

export const COPY = {
  title: 'Build what’s next with us.',
  lede: 'We’re a small studio in Kathmandu building, launching and growing products for brands in Nepal and around the world. If you care about craft and like shipping, we’d love to hear from you.',
  status: 'No open roles right now',
  apply: 'Send us your CV anyway.',
  applyCopy: 'We’re always glad to meet good designers, developers and marketers. Send your CV and we’ll reach out as soon as something fits.',
};

export const PERKS = [
  ['01', 'Real client work', 'Ship for brands people know, from day one.'],
  ['02', 'Small, senior team', 'Learn fast from people who do the work.'],
  ['03', 'Kathmandu and remote', 'Work from the studio or from home.'],
];

const MAX_MB = 5;
const CV_TYPES = '.pdf,.doc,.docx';

const reveal = {
  hidden: { opacity: 0, transform: 'translateY(24px)' },
  show: (i = 0) => ({ opacity: 1, transform: 'translateY(0px)', transition: { duration: 1, delay: i * 0.08, ease: EASE } }),
};

const EMPTY = { name: '', email: '', phone: '', role: '', link: '', note: '' };

const readBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1]);
  r.onerror = reject;
  r.readAsDataURL(file);
});

// With a Google Apps Script endpoint set, the CV lands in the team's Google Drive and the
// details in a Google Sheet. Without one, the details open as an email to attach the CV to.
async function submit(form, cv) {
  if (SITE.careersEndpoint) {
    const body = new URLSearchParams({
      ...form,
      submittedAt: new Date().toISOString(),
      cvName: cv.name,
      cvType: cv.type,
      cvData: await readBase64(cv),
    });
    // Apps Script answers cross-origin without CORS headers, so the request is sent
    // opaque: a resolved fetch means it reached Google.
    await fetch(SITE.careersEndpoint, { method: 'POST', mode: 'no-cors', body });
    return 'saved';
  }
  const lines = [
    `Name: ${form.name}`, `Email: ${form.email}`,
    form.phone && `Phone: ${form.phone}`, `What I do: ${form.role}`,
    form.link && `Portfolio / LinkedIn: ${form.link}`,
    form.note && `\n${form.note}`,
    '\n(CV attached)',
  ].filter(Boolean);
  window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`CV — ${form.name}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
  return 'mailed';
}

export default function Careers() {
  const [form, setForm] = useState(EMPTY);
  const [cv, setCv] = useState(null);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState(null); // null | 'sending' | 'saved' | 'mailed' | 'failed'

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: null } : e));
  };

  const pickFile = (file) => {
    setErrors((e) => ({ ...e, cv: null }));
    if (!file) return setCv(null);
    if (!/\.(pdf|docx?)$/i.test(file.name)) return setErrors((e) => ({ ...e, cv: 'Please upload a PDF or Word file.' }));
    if (file.size > MAX_MB * 1024 * 1024) return setErrors((e) => ({ ...e, cv: `Please keep it under ${MAX_MB} MB.` }));
    return setCv(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'We need a name to reply to.';
    if (!isEmail(form.email)) next.email = 'Please check this email address.';
    if (!form.role.trim()) next.role = 'Tell us what you do, in a few words.';
    if (!cv && !errors.cv) next.cv = 'Attach your CV.';
    setErrors((prev) => ({ ...next, cv: next.cv || prev.cv }));
    if (Object.keys(next).length || errors.cv) return;

    setState('sending');
    try {
      setState(await submit(form, cv));
    } catch {
      setState('failed');
    }
  };

  const reset = () => { setState(null); setForm(EMPTY); setCv(null); };

  return (
    <section className="lg cr">
      <motion.div className="lg-wrap" initial="hidden" animate="show">
        <header className="lg-head cr-head">
          <motion.span className="sp-eyebrow" variants={reveal}><i />Careers</motion.span>
          <motion.h1 variants={titleReveal} custom={1} aria-label={COPY.title}>
            <span aria-hidden="true"><CycleWord words={VERBS} /> what’s next with us.</span>
          </motion.h1>
          <motion.p className="lg-lede" variants={reveal} custom={2}>
            {COPY.lede}
          </motion.p>
        </header>

        <motion.ul className="cr-perks" variants={reveal} custom={3}>
          {PERKS.map(([n, t, d]) => (
            <li key={n}><span className="sp-step-n">{n}</span><div><b>{t}</b><p>{d}</p></div></li>
          ))}
        </motion.ul>

        <motion.div className="cr-apply" variants={reveal} custom={4}>
          <div className="cr-note">
            <span className="cr-status"><i />{COPY.status}</span>
            <h2>{COPY.apply}</h2>
            <p>{COPY.applyCopy}</p>
          </div>

          <div className="sp-card cr-card" id="apply">
            {state === 'saved' || state === 'mailed' ? (
              <div className="sp-done" role="status">
                <span className="sp-done-mark" aria-hidden="true">✓</span>
                <h2>{state === 'saved' ? 'CV received.' : 'Almost there.'}</h2>
                <p>
                  {state === 'saved'
                    ? 'Thanks for sending it. We keep every CV on file and get in touch when a role fits.'
                    : <>We opened an email with your details. Attach your CV (<b>{cv?.name}</b>) and press send. If nothing opened, email it to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</>}
                </p>
                <button type="button" className="sp-ghost" onClick={reset}>Send another</button>
              </div>
            ) : (
              <form className="sp-form" onSubmit={onSubmit} noValidate>
                <div className="sp-row">
                  <Field label="Your name" error={errors.name}>
                    <input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" placeholder="Your full name" />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" placeholder="you@example.com" />
                  </Field>
                </div>
                <div className="sp-row">
                  <Field label="What do you do?" error={errors.role}>
                    <input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Frontend developer, designer…" />
                  </Field>
                  <Field label="Phone" hint="Optional">
                    <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="98XXXXXXXX" />
                  </Field>
                </div>
                <Field label="Portfolio or LinkedIn" hint="Optional">
                  <input type="url" value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://" />
                </Field>

                <div className={`sp-field ${errors.cv ? 'is-bad' : ''}`}>
                  <span className="sp-label">Your CV <span className="sp-hint">PDF or Word · up to {MAX_MB} MB</span></span>
                  <label className={`cr-drop ${cv ? 'has-file' : ''}`}>
                    <input type="file" accept={CV_TYPES} onChange={(e) => pickFile(e.target.files?.[0])} />
                    <span className="cr-drop-ico" aria-hidden="true">{cv ? '✓' : '↑'}</span>
                    <span className="cr-drop-text">
                      <b>{cv ? cv.name : 'Choose a file'}</b>
                      <small>{cv ? `${(cv.size / 1024 / 1024).toFixed(1)} MB · click to change` : 'or drop it here'}</small>
                    </span>
                  </label>
                  {errors.cv && <span className="sp-error">{errors.cv}</span>}
                </div>

                <Field label="Anything else?" hint="Optional">
                  <textarea rows={4} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="What you’re great at, or what you’d love to work on." />
                </Field>

                <div className="sp-submit">
                  <button type="submit" className="p-cta" disabled={state === 'sending'}>
                    <Bars /><span className="p-cta-label">{state === 'sending' ? 'Sending…' : 'Send CV'}</span>
                  </button>
                  <p>{state === 'failed' ? `That didn’t go through. Try again, or email ${SITE.email}.` : 'Your CV stays with our team only.'}</p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
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
