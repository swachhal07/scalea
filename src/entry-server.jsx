import { renderToPipeableStream } from 'react-dom/server';
import { Writable } from 'node:stream';
import { MotionConfig } from 'framer-motion';
import App, { PAGES as APP_ROUTES } from './App.jsx';
import { setServerPath } from './router.jsx';

export { listMarkdownRoutes, renderMarkdown, hasRenderer } from './md/registry.jsx';
export { robotsTxt, llmsTxt, llmsFullTxt, aiTxt, catalog, organizationJsonLd, serviceJsonLd } from './md/site-files.js';

// Every route the app serves, for the build's markdown coverage check.
export const appRoutes = ['/', ...Object.keys(APP_ROUTES)];

// Build-time render of one page to HTML (scripts/prerender.mjs), so crawlers that don't
// run JavaScript still get the content. Waits for lazy pages before resolving.
export function render(path) {
  setServerPath(path);
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _enc, next) { html += chunk; next(); },
      final(done) { resolve(html); done(); },
    });
    const stream = renderToPipeableStream(
      <MotionConfig reducedMotion="user"><App /></MotionConfig>,
      { onAllReady: () => stream.pipe(sink), onShellError: reject, onError: reject }
    );
  });
}
