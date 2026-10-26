// Vercel Routing Middleware: serves the markdown version of each page, written at build time
// to /_md/ by scripts/prerender.mjs. Three ways in, one handler:
//   /start.md, /index.md               the .md suffix
//   /start with Accept: text/markdown   content negotiation, only when markdown is preferred
//   /api/md/start, /api/md/_catalog     always markdown (or the catalog JSON)
// Anything else passes straight through to the static site.

import { ORIGIN, PAGES } from './src/seo.js';

export const config = {
  // Assets and the stored markdown itself never need the middleware.
  matcher: '/((?!_md/|assets/|brands/|favicon\\.svg|logo\\.png|og\\.png).*)',
};

// Pages that can answer in markdown. An allowlist, so nothing else is ever negotiated.
const ROUTES = new Set(Object.keys(PAGES));
const stored = (path) => `/_md${path === '/' ? '/index' : path}.md`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept',
};

// The q-value the Accept header gives a media type: its exact entry, else type/*, else */*.
function quality(entries, type) {
  const [main] = type.split('/');
  const match = entries.find((e) => e.type === type) || entries.find((e) => e.type === `${main}/*`) || entries.find((e) => e.type === '*/*');
  return match ? match.q : 0;
}

// Markdown only when the client names text/markdown and rates it above HTML. A missing
// header or */* always gets HTML, so browsers, curl and link previews are unaffected.
export function prefersMarkdown(accept) {
  if (!accept) return false;
  const entries = accept.split(',').map((part) => {
    const [type, ...params] = part.trim().toLowerCase().split(';').map((s) => s.trim());
    const q = params.find((p) => p.startsWith('q='));
    return { type, q: q ? Number(q.slice(2)) || 0 : 1 };
  });
  const md = entries.find((e) => e.type === 'text/markdown');
  return Boolean(md) && md.q > quality(entries, 'text/html');
}

function markdown(request, body, status, { path, lastModified, negotiated }) {
  const headers = {
    ...CORS,
    'Content-Type': 'text/markdown; charset=utf-8',
    'X-Markdown-Tokens': String(Math.ceil(body.length / 4)),
    'X-Robots-Tag': 'noindex, follow',
    'Cache-Control': status === 200 ? 'public, s-maxage=86400, stale-while-revalidate=604800' : 'public, s-maxage=300',
  };
  if (path) {
    headers['Content-Location'] = ORIGIN + path;
    headers.Link = `<${ORIGIN}${path}>; rel="canonical"`;
  }
  if (lastModified) headers['Last-Modified'] = lastModified;
  if (negotiated) headers.Vary = 'Accept';
  return new Response(request.method === 'HEAD' ? null : body, { status, headers });
}

function notFound(request, path) {
  const body = `# Not found\n\nThere is no markdown version of ${path}. Every page that has one is listed in ${ORIGIN}/llms.txt.\n`;
  return markdown(request, body, 404, {});
}

async function serve(request, path, negotiated) {
  if (!ROUTES.has(path)) return notFound(request, path);
  const res = await fetch(new URL(stored(path), request.url));
  if (!res.ok) return notFound(request, path);
  const body = await res.text();
  return markdown(request, body, 200, { path, lastModified: res.headers.get('last-modified'), negotiated });
}

async function catalog(request) {
  const res = await fetch(new URL('/_md/_catalog.json', request.url));
  if (!res.ok) return notFound(request, '/api/md/_catalog');
  return new Response(request.method === 'HEAD' ? null : await res.text(), {
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  });
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url);
  const api = pathname === '/api/md' || pathname.startsWith('/api/md/');
  const suffix = !api && pathname.endsWith('.md');

  if (!api && !suffix) {
    if (ROUTES.has(pathname) && request.method !== 'OPTIONS' && prefersMarkdown(request.headers.get('accept'))) {
      return serve(request, pathname, true);
    }
    return undefined; // the HTML page, as usual
  }

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed\n', { status: 405, headers: { ...CORS, Allow: 'GET, HEAD, OPTIONS' } });
  }

  if (api) {
    const rest = pathname.slice('/api/md'.length).replace(/^\/+|\/+$/g, '').replace(/\.md$/, '');
    if (rest === '_catalog') return catalog(request);
    return serve(request, !rest || rest === 'index' ? '/' : `/${rest}`, false);
  }
  return serve(request, pathname === '/index.md' ? '/' : pathname.slice(0, -3), false);
}
