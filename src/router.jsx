import { useEffect, useState } from 'react';

// The site is small enough not to need a router package. We keep the current
// pathname in state and intercept same-origin link clicks that change it;
// plain hash links on the current page are left to the browser and Lenis.

export function navigate(to) {
  const url = new URL(to, window.location.origin);
  if (url.pathname === window.location.pathname && url.hash) {
    window.location.hash = url.hash;
    return;
  }
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
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
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      window.history.pushState({}, '', url);
      sync();

      // A hash on another page only resolves once that page has rendered.
      if (url.hash) {
        requestAnimationFrame(() => {
          document.querySelector(url.hash)?.scrollIntoView();
        });
      } else {
        window.scrollTo(0, 0);
      }
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
