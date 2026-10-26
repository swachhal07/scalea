// One page per service at /services/<slug>. Plain data, so src/seo.js (and through it the
// Vercel middleware) can read it: the page component, its markdown version, llms.txt, the
// sitemap and the Service JSON-LD all come from here. `label` is the footer link text,
// `card` the "What we do" card that links here, and `work` the case-study service tags
// whose clients are listed on the page.

export const SERVICES = [
  {
    slug: 'web-development',
    label: 'Web Development',
    card: 'build',
    name: 'Web development',
    title: 'Web Development Company in Nepal — Scalea',
    description:
      'Fast, search-ready websites, web apps and e-commerce built in Kathmandu by Scalea, with a clickable prototype on day two and a live site by day seven.',
    summary:
      'Scalea’s web development service: what is included (websites, web apps, e-commerce, custom software), how the seven-day build works, related client work and common questions.',
    h1: 'Websites and web apps that load fast and get found.',
    lede: 'We design and build marketing sites, web apps and online stores that are quick on any phone, easy for your team to update, and set up for search and AI answers from the first deploy.',
    includes: [
      ['Marketing websites', 'Company sites and landing pages with clear structure, fast loading and lead capture that goes straight to you.'],
      ['Web apps', 'Dashboards, portals and booking or enquiry flows built around how your customers actually work.'],
      ['E-commerce', 'Product catalogues and online stores that are simple to browse, compare and buy from.'],
      ['Custom software', 'Internal tools and integrations that connect the systems your team already uses.'],
      ['SEO and AI readiness built in', 'Clean page structure, metadata, sitemaps and structured data, so search engines and AI assistants can read every page.'],
    ],
    fit: [
      'Businesses replacing a slow or outdated website',
      'Brands launching a new product, model or location',
      'Teams that need a portal, catalogue or enquiry flow, not just a brochure site',
    ],
    work: ['Web Development'],
    faq: [
      ['How long does a website take?', 'Most builds follow our seven-day process: kickoff on day one, a clickable prototype on day two, building with daily previews on days three to five, testing on day six and launch by day seven. Larger web apps are planned in the same daily cycles.'],
      ['How much does a website cost?', 'Every project gets a fixed-scope proposal with scope, timeline and price in writing within three working days of a 20-minute call. Budgets on our project form range from under $5k to $50k+.'],
      ['Do you work with clients outside Nepal?', 'Yes. The studio is in Kathmandu and works with brands in Nepal and around the world, with a live preview link so you can follow progress from anywhere.'],
    ],
  },
  {
    slug: 'mobile-app-development',
    label: 'Mobile Apps',
    card: null,
    name: 'Mobile app development',
    title: 'Mobile App Development in Nepal — iOS & Android — Scalea',
    description:
      'Scalea designs and builds iOS and Android apps in Kathmandu: from a clickable prototype to store launch, testing and app-store optimisation.',
    summary:
      'Scalea’s mobile app service: design, build, testing and app-store launch for iOS and Android, the process, and common questions.',
    h1: 'Mobile apps people keep on their phones.',
    lede: 'We design and build iOS and Android apps around one clear job for your customers, then take them through testing and store launch so day one goes right.',
    includes: [
      ['Product design', 'User flows and a clickable prototype you can try on your phone before anything is built.'],
      ['iOS and Android builds', 'Apps built to ship fast and hold up as your users and features grow.'],
      ['Testing across devices', 'QA on the phones your customers actually use, before anything reaches the stores.'],
      ['Store launch and ASO', 'Store listings, screenshots and keywords so the app gets found and downloaded.'],
      ['Analytics', 'Tracking set up from launch, so you can see what people use and where they drop off.'],
    ],
    fit: [
      'Businesses whose customers book, order or pay on their phones',
      'Brands that want a loyalty, service or companion app',
      'Teams with an existing app that needs a redesign or a relaunch',
    ],
    work: [],
    faq: [
      ['Do you build for both iOS and Android?', 'Yes. We design and build for both, and handle testing and the store launch for each.'],
      ['How do you price an app?', 'After a 20-minute call you get a fixed-scope proposal with scope, timeline and price in writing within three working days.'],
      ['Can you help after launch?', 'Yes. We run app-store optimisation, read the analytics monthly and keep improving what moves your numbers.'],
    ],
  },
  {
    slug: 'ux-seo-audit',
    label: 'UX & SEO Audits',
    card: 'review',
    name: 'UX and SEO audits',
    title: 'UX, SEO & Website Performance Audit — Scalea',
    description:
      'Find what is holding your website back. Scalea audits UX, SEO, Core Web Vitals and AI-search readiness and gives you a clear, prioritised plan to fix it.',
    summary:
      'Scalea’s audit service: UX testing, technical SEO, Core Web Vitals and AI-search readiness reviews, delivered as a prioritised fix plan, plus common questions.',
    h1: 'Find what’s holding growth back.',
    lede: 'A focused review of your website or app: where visitors get stuck, why search engines and AI assistants miss you, and what slows your pages down. You get a clear, prioritised plan to fix it, most important first.',
    includes: [
      ['UX testing', 'Where people hesitate, get lost or leave, and the changes that make the next step obvious.'],
      ['Technical SEO audit', 'Crawlability, indexing, titles, structured data, sitemaps and internal links.'],
      ['Core Web Vitals', 'Loading, responsiveness and layout stability, measured and explained in plain words.'],
      ['AI-search readiness', 'Whether ChatGPT, Gemini, Claude and Perplexity can read and cite your pages.'],
      ['A prioritised fix plan', 'Every finding ranked by impact, with the fix, so your team or ours can act on it.'],
    ],
    fit: [
      'Websites that get traffic but few enquiries',
      'Sites that dropped in search or never ranked',
      'Teams about to redesign who want to know what to keep',
    ],
    work: ['UX'],
    faq: [
      ['What do I get at the end of an audit?', 'A prioritised plan: each issue, why it matters and how to fix it, ordered from the biggest impact to the smallest.'],
      ['Can you fix what the audit finds?', 'Yes. You can take the plan to your own team, or we fix it for you as a fixed-scope project.'],
      ['Do you check AI search as well as Google?', 'Yes. We check whether AI assistants can crawl, read and cite your pages, alongside classic search.'],
    ],
  },
  {
    slug: 'app-launch-aso',
    label: 'Launch & ASO',
    card: 'launch',
    name: 'Launch, QA and app-store optimisation',
    title: 'Product Launch, QA Testing & App Store Optimisation — Scalea',
    description:
      'Testing, QA and app-store optimisation so launch day goes right: Scalea checks every device, sets up analytics and gets your app or site found.',
    summary:
      'Scalea’s launch service: QA and device testing, app-store optimisation, analytics setup and launch campaigns, with related client work and common questions.',
    h1: 'A launch that lands.',
    lede: 'Testing, QA and app-store optimisation so day one goes right: every device checked, analytics in place, and your product easy to find the moment it goes live.',
    includes: [
      ['QA and device testing', 'Checks across phones, browsers and screen sizes, plus speed and SEO checks before go-live.'],
      ['App-store optimisation', 'Titles, keywords, screenshots and descriptions that help your app get found and installed.'],
      ['Analytics setup', 'Events and goals tracked from the first visit, so launch results are measurable.'],
      ['Launch campaigns', 'Landing pages and campaigns that turn launch interest into sign-ups, bookings or sales.'],
    ],
    fit: [
      'Teams about to ship a new app or website',
      'Brands launching a product into a new market',
      'Apps with installs below what the product deserves',
    ],
    work: ['Launch'],
    faq: [
      ['When should we bring you in for a launch?', 'Ideally a week or two before go-live, so there is time to test, set up analytics and prepare store listings.'],
      ['Do you only launch products you built?', 'No. We test and launch products built by other teams too.'],
      ['What happens after launch?', 'We read the data monthly and keep improving search, ads and store rankings, if you want us to stay on.'],
    ],
  },
  {
    slug: 'seo-paid-ads',
    label: 'SEO & Paid Ads',
    card: 'market',
    name: 'SEO and paid ads',
    title: 'SEO Agency & Google / Meta Ads in Nepal — Scalea',
    description:
      'Get found and get chosen. Scalea runs SEO, Google and Meta ads and content for businesses in Nepal and abroad, with monthly reports on what moves your numbers.',
    summary:
      'Scalea’s marketing service: search engine optimisation, Google and Meta ads, and content, run monthly with reporting, plus related client work and common questions.',
    h1: 'Get found. Get chosen.',
    lede: 'Search, paid campaigns and content that compound over time. We bring the right people to your site from Google, social and AI answers, then report every month on what is working.',
    includes: [
      ['Search engine optimisation', 'Technical fixes, page optimisation and content that help you rank for what your customers search.'],
      ['Local SEO', 'Search visibility for buyers near your showrooms, dealers or branches.'],
      ['Google and Meta ads', 'Campaigns built around enquiries and sales, not clicks, with budgets you control.'],
      ['Content', 'Pages and posts that answer real customer questions and keep earning traffic.'],
      ['Monthly reporting', 'Plain-language reports on traffic, enquiries and spend, with what we will change next.'],
    ],
    fit: [
      'Businesses that rely on enquiries from Google',
      'Dealers and brands with showrooms or branches across Nepal',
      'Teams spending on ads without clear results',
    ],
    work: ['SEO', 'Paid Ads', 'Content'],
    faq: [
      ['How long does SEO take to work?', 'Technical fixes can show within weeks; rankings for competitive searches usually build over several months. We report progress every month.'],
      ['Do you manage the ad budget?', 'We plan and run the campaigns; the ad spend stays in your own Google and Meta accounts and under your control.'],
      ['Do you work with businesses outside Nepal?', 'Yes. We run search and ads for brands in Nepal and around the world.'],
    ],
  },
  {
    slug: 'ai-geo',
    label: 'AI & GEO',
    card: 'ai',
    name: 'AI search optimisation (GEO) and automation',
    title: 'Generative Engine Optimisation (GEO) & AI Automation — Scalea',
    description:
      'Show up in AI answers. Scalea helps brands get cited by ChatGPT, Gemini, Claude and Perplexity, and automates the busywork that slows teams down.',
    summary:
      'Scalea’s AI service: generative engine optimisation so AI assistants can find and cite you, plus AI automation and chatbots, with common questions.',
    h1: 'Show up in AI answers.',
    lede: 'More of your customers now ask ChatGPT, Gemini, Claude and Perplexity before they search. We make your brand easy for those assistants to read, trust and cite, and we automate the work that slows your team.',
    includes: [
      ['Generative engine optimisation (GEO)', 'Content and structure that AI assistants can read, quote and link back to.'],
      ['AI-readable site setup', 'Markdown versions of your pages, llms.txt, AI crawler rules and structured data, done properly.'],
      ['AI visibility tracking', 'Regular checks of how your brand appears in AI answers for the questions that matter to you.'],
      ['AI automation', 'Connected workflows, with tools like n8n and Claude, that take repetitive work off your team.'],
      ['Chatbots', 'Assistants that answer customer questions from your own content.'],
    ],
    fit: [
      'Brands that want to be recommended by AI assistants',
      'Businesses with a lot of repetitive admin or support work',
      'Teams already doing SEO who want to cover AI search too',
    ],
    work: [],
    faq: [
      ['What is GEO?', 'Generative engine optimisation: making your site and content easy for AI assistants such as ChatGPT, Gemini, Claude and Perplexity to read, trust and cite in their answers.'],
      ['Is GEO different from SEO?', 'It builds on SEO. Search engines rank pages; AI assistants quote passages, so GEO adds clear, factual, well-structured content and machine-readable versions of your pages.'],
      ['Which tools do you use for automation?', 'We wire together tools such as n8n and Claude with the software your team already uses.'],
    ],
  },
];

export const servicePath = (s) => `/services/${s.slug}`;
