// Content for the "What we do" cards.
import { EASE } from '../lib.js';
import { BuildAnim, ReviewAnim, LaunchAnim, MarketAnim, AIAnim } from './Anim.jsx';

export const SERVICES = [
  {
    id: 'build',
    k: 'Build',
    title: 'Digital products, engineered to scale',
    copy: 'Websites, web apps and mobile apps, designed and built to ship fast and hold up as you grow.',
    tags: ['Web Development', 'Mobile Apps', 'E-commerce', 'Custom Software'],
    visual: <BuildAnim />,
  },
  {
    id: 'review',
    k: 'Review',
    title: 'Find what’s holding growth back',
    copy: 'UX, SEO and performance audits with a clear, prioritised plan to fix them.',
    tags: ['UX Testing', 'SEO Audit', 'Core Web Vitals'],
    visual: <ReviewAnim />,
  },
  {
    id: 'launch',
    k: 'Launch',
    title: 'A launch that lands',
    copy: 'Testing, QA and app-store optimisation so day one goes right.',
    tags: ['QA & Testing', 'ASO', 'Analytics Setup'],
    visual: <LaunchAnim />,
  },
  {
    id: 'market',
    k: 'Market',
    title: 'Get found, get chosen',
    copy: 'Search, paid campaigns and content that compound over time.',
    tags: ['SEO', 'Google & Meta Ads', 'Content'],
    visual: <MarketAnim />,
  },
  {
    id: 'ai',
    k: 'AI & GEO',
    title: 'Show up in AI answers',
    copy: 'Get cited by ChatGPT, Gemini and Perplexity, and automate the work that slows your team.',
    tags: ['GEO', 'AI Automation', 'Chatbots'],
    visual: <AIAnim />,
  },
];

export const reveal = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({ opacity: 1, transition: { duration: 1.1, delay: i * 0.08, ease: EASE } }),
};
