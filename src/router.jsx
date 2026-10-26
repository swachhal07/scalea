import { useEffect, useState } from 'react';
import { glideTo } from './scroll.js';

// The site is small enough not to need a router package. We keep the current
// pathname in state and intercept same-origin link clicks. Where the page lands after a
// change of page is App's job (useScrollOnRoute); hash links on the current page glide
// to their section here.

export function navigate(to) {
  const url = new URL(to, window.location.origin);
  if (url.pathname === window.location.pathname && url.hash) {
    window.location.hash = url.hash;
    return;
  }
  window.history.pushState({ inApp: true }, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Click handler for a "Back" link: returns to the previous page when it was on this site
// (every in-app navigation marks its history entry); otherwise the link's own href is
// followed, so arriving from search still lands somewhere sensible.
export function goBack(e) {
  if (!window.history.state?.inApp) return;
  e.preventDefault();
  window.history.back();
}

// The build-time render (src/entry-server.jsx) has no window, so it says which page it's on.
let serverPath = '/';
export function setServerPath(path) {
  serverPath = path;
}

export function useRoute() {
  const [path, setPath] = useState(() => (import.meta.env.SSR ? serverPath : window.location.pathname));

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const url = new URL(link.getAttribute('href'), window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) {
        const target = url.hash && document.querySelector(url.hash);
        if (!target) return;
        e.preventDefault();
        window.history.replaceState(window.history.state, '', url);
        glideTo(target);
        return;
      }

      e.preventDefault();
      window.history.pushState({ inApp: true }, '', url);
      sync();
    };

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', sync);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  return path;
}
