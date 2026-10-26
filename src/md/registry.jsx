// The markdown version of every page, written from the same data the components render.
// To give a new page a markdown version, add it to PAGES in src/seo.js and add a renderer
// here; llms.txt, llms-full.txt, the catalog and the route check pick it up from there.

import { ABOUT, PAGES } from '../seo.js';
import { SITE, SOCIAL, whatsappHref } from '../site.jsx';
import { HERO, BRANDS } from '../heroes/HeroPrime.jsx';
import { COPY as SERVICES_COPY } from '../components/WhatWeDo.jsx';
import { SERVICES } from '../whatwedo/data.jsx';
import { COPY as PROCESS_COPY } from '../components/HowWeWork.jsx';
import { STEPS as PROCESS } from '../howwework/steps.js';
import { COPY as WORK_COPY, CASES } from '../components/Work.jsx';
import { STATEMENT, NUMBERS, CARDS, VALUES } from '../components/About.jsx';
import { COPY as TOOLS_COPY, TOOLS, OUTCOMES } from '../components/Tools.jsx';
import { COPY as CLOSING_COPY } from '../components/Closing.jsx';
import { COPY as START_COPY, STEPS as START_STEPS, SERVICES as START_SERVICES, BUDGETS, TIMELINES } from '../pages/StartProject.jsx';
import { COPY as CAREERS_COPY, PERKS } from '../pages/Careers.jsx';
import { UPDATED, PRIVACY, PRIVACY_HEAD, TERMS, TERMS_HEAD } from '../pages/Legal.jsx';
import { esc, h, link, list, ordered, table, inline, page } from './format.js';

// Pages are static, so their content changes only when the site is rebuilt.
const BUILT = new Date();

const contact = () =>
  list([
    `Email: ${link(SITE.email, `mailto:${SITE.email}`)}`,
    `Phone / WhatsApp: ${link(SITE.phone, whatsappHref())}`,
    `Studio: ${esc(ABOUT.location)}`,
    ...SOCIAL.filter((s) => s.href()).map((s) => `${s.k}: ${link(s.href(), s.href())}`),
  ]);

const home = () => [
  `**${esc(HERO.title.join(' '))}**\n\n${esc(HERO.lede)}`,
  `${h(2, 'Clients')}\n\n${esc(HERO.trust)}\n\n${list(BRANDS.map((b) => esc(b.main)))}`,
  [
    h(2, 'What we do'),
    `${esc(SERVICES_COPY.heading)} ${esc(SERVICES_COPY.intro)}`,
    ...SERVICES.map((s, i) => `${h(3, `${i + 1}. ${s.k}: ${s.title}`)}\n\n${esc(s.copy)}`),
    `${esc(SERVICES_COPY.cta)} ${link('Start a project', '/start')}.`,
  ].join('\n\n'),
  [
    h(2, 'How we work'),
    `${esc(PROCESS_COPY.heading)} ${esc(PROCESS_COPY.intro)}`,
    ...PROCESS.map((s, i) => `${h(3, `${i + 1}. ${s.k} (${s.time})`)}\n\n${esc(s.copy)}`),
  ].join('\n\n'),
  [
    h(2, 'Selected work'),
    `${esc(WORK_COPY.heading)} ${esc(WORK_COPY.intro)}`,
    table(
      ['Client', 'Industry', 'Services', 'Website'],
      CASES.map((c) => [esc(c.client), esc(c.industry), esc(c.services.join(', ')), link(new URL(c.url).hostname, c.url)])
    ),
  ].join('\n\n'),
  [
    h(2, 'About Scalea'),
    `${esc(STATEMENT)} ${esc(CARDS.studio.join(' '))}`,
    `${h(3, 'In numbers')}\n\n${list(NUMBERS.map((n) => `**${n.n}${n.suffix} ${esc(n.k.toLowerCase())}**: ${esc(n.d)}`))}`,
    `${h(3, CARDS.team)}\n\n${esc(CARDS.teamCopy)}`,
    `${h(3, 'What we stand for')}\n\n${list(VALUES.map(([t, d]) => `**${esc(t)}**: ${esc(d)}`))}`,
  ].join('\n\n'),
  [
    h(2, 'Tools we use'),
    `${esc(TOOLS_COPY.heading)} ${esc(TOOLS_COPY.intro)}`,
    table(['Tool', 'Used for'], TOOLS.map((t) => [esc(t.name), esc(t.role)])),
    list(OUTCOMES.map((o) => `**${esc(o.k)}**: ${esc(o.d)}`)),
  ].join('\n\n'),
  [h(2, 'Contact'), `${esc(CLOSING_COPY.heading)} ${esc(CLOSING_COPY.intro)} ${CLOSING_COPY.points.map(esc).join('. ')}.`, contact()].join('\n\n'),
];

const start = () => [
  esc(START_COPY.lede),
  `${h(2, 'What happens next')}\n\n${ordered(START_STEPS.map(([, t, d]) => `**${esc(t)}**: ${esc(d)}`))}`,
  [
    h(2, 'What the brief asks for'),
    `${h(3, 'Services')}\n\n${list(START_SERVICES.map(esc))}`,
    `${h(3, 'Budget')}\n\n${list(BUDGETS.map(esc))}`,
    `${h(3, 'Timeline')}\n\n${list(TIMELINES.map(esc))}`,
  ].join('\n\n'),
  `${h(2, 'Contact')}\n\n${contact()}\n- Reply time: ${esc(START_COPY.reply)}`,
];

const careers = () => [
  esc(CAREERS_COPY.lede),
  `${h(2, 'Why join')}\n\n${list(PERKS.map(([, t, d]) => `**${esc(t)}**: ${esc(d)}`))}`,
  `${h(2, 'Open roles')}\n\n${esc(CAREERS_COPY.status)}.`,
  `${h(2, CAREERS_COPY.apply)}\n\n${esc(CAREERS_COPY.applyCopy)} Apply with the ${link('form on this page', '/careers#apply')} or email ${link(SITE.email, `mailto:${SITE.email}`)}.`,
];

const legal = (head, sections) => () => [
  esc(head.lede),
  ...sections.map((s, i) => `${h(2, `${i + 1}. ${s.h}`)}\n\n${s.p.map(inline).join('\n\n')}`),
];

// Route → how to write it. `updated` is when the content last changed, where we know it.
const RENDERERS = {
  '/': { body: home, related: [['Start a project', '/start'], ['Careers', '/careers'], ['Privacy policy', '/privacy'], ['Terms of use', '/terms']] },
  '/start': { body: start, related: [['Home', '/'], ['Selected work', '/#work'], ['Privacy policy', '/privacy']] },
  '/careers': { body: careers, related: [['Home', '/'], ['About Scalea', '/#about'], ['Privacy policy', '/privacy']] },
  '/privacy': { body: legal(PRIVACY_HEAD, PRIVACY), updated: UPDATED, related: [['Terms of use', '/terms'], ['Home', '/']] },
  '/terms': { body: legal(TERMS_HEAD, TERMS), updated: UPDATED, related: [['Privacy policy', '/privacy'], ['Home', '/']] },
};

// Every addressable markdown route, in llms.txt order: core pages first, then legal.
export function listMarkdownRoutes() {
  const order = ['core', 'legal'];
  return Object.entries(PAGES)
    .filter(([path]) => RENDERERS[path])
    .sort(([, a], [, b]) => order.indexOf(a.group) - order.indexOf(b.group))
    .map(([path, meta]) => ({
      path,
      md: path === '/' ? '/index.md' : `${path}.md`,
      title: meta.title,
      description: meta.description,
      group: meta.group,
      updated: new Date(RENDERERS[path].updated || BUILT),
    }));
}

export function renderMarkdown(path) {
  const r = RENDERERS[path];
  const meta = PAGES[path];
  if (!r || !meta) return null;
  return page({ path, title: meta.title, summary: meta.description, updated: r.updated || BUILT, body: r.body(), related: r.related });
}

export const hasRenderer = (path) => path in RENDERERS;
