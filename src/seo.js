// Search, sharing and AI details for every page. The build writes these into each page's
// own HTML file, its markdown version, llms.txt, ai.txt and robots.txt (see
// scripts/prerender.mjs and src/md/), and the app keeps the tab title in step as you move
// between pages. Change ORIGIN here once the custom domain is live. Plain data only: the
// Vercel middleware imports this file too.

export const ORIGIN = 'https://scalea.vercel.app';

// Who we are, for llms.txt, ai.txt and the Organization JSON-LD.
export const ABOUT = {
  name: 'Scalea',
  description:
    'Scalea is a digital studio in Kathmandu, Nepal that builds websites, web apps and mobile apps, then grows them with SEO, paid ads and AI search visibility. One team takes a product from first design to launch and ongoing growth, for brands in Nepal and worldwide.',
  locality: 'Kathmandu',
  country: 'NP',
  location: 'Kathmandu, Nepal',
  areaServed: 'Worldwide',
};

// Every public page. `summary` feeds <meta name="ai-summary">: what the page is, for a
// model that has already fetched it. `group` orders llms.txt and llms-full.txt.
export const PAGES = {
  '/': {
    title: 'Scalea — Web Development, SEO & Digital Growth Agency in Nepal',
    description:
      'Scalea builds websites and apps, then grows them with SEO, paid ads and AI search. A Kathmandu digital studio trusted by Mahindra, John Deere and Revolt.',
    summary:
      'Home page of Scalea, a Kathmandu digital studio: its five services (build, review, launch, market, AI & GEO), its seven-day process, client list, tools and contact details.',
    group: 'core',
  },
  '/start': {
    title: 'Start a Project — Scalea',
    description:
      'Tell us what you’re building. Share your goals, budget and timeline and get a clear plan and estimate from Scalea, usually within one working day.',
    summary:
      'Project enquiry page: what happens after you send a brief, the services, budget ranges and timelines you can pick, and how to contact Scalea directly.',
    group: 'core',
  },
  '/careers': {
    title: 'Careers — Scalea',
    description:
      'Join a small, senior team in Kathmandu shipping websites, apps and growth campaigns for brands people know. Send us your CV.',
    summary: 'Careers page: what working at Scalea is like, current openings (none right now) and how to send a CV.',
    group: 'core',
  },
  '/privacy': {
    title: 'Privacy Policy — Scalea',
    description: 'What Scalea collects when you contact us or use this site, how we use it, and the choices you have.',
    group: 'legal',
  },
  '/terms': {
    title: 'Terms of Use — Scalea',
    description: 'The terms that apply when you use the Scalea website and work with us.',
    group: 'legal',
  },
};

export const NOT_FOUND = {
  title: 'Page not found — Scalea',
  description: 'This page doesn’t exist. Head back to the Scalea home page.',
};

// Paths no crawler or agent should fetch. robots.txt and ai.txt both read this.
export const PRIVATE_PATHS = ['/api/', '/_md/'];
