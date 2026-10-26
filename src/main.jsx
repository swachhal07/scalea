import React, { startTransition } from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App.jsx';
import './styles.css';
import './heroes/prime.css';
import './components/whatwedo.css';
import './whatwedo/bento.css';
import './whatwedo/anim.css';
import './components/howwework.css';
import './components/work.css';
import './components/about.css';
import './components/closing.css';
import './pages/start.css';
import './pages/legal.css';
import './pages/services.css';

// Where a page opens is the app's call (useScrollOnRoute in App.jsx), so the browser
// doesn't restore an old scroll position on reload or back and forward.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

// The site renders at once, underneath the intro in index.html, as an interruptible
// transition: the work is sliced into short tasks, so the intro's timers stay on time and
// none of it is left for the hand-over. Entrance animations wait for the intro to finish
// (useIntroDone in intro.js); the intro then fades over a page that is already built.
const intro = window.__intro;
const root = ReactDOM.createRoot(document.getElementById('root'));

startTransition(() => {
  root.render(
    <React.StrictMode>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </React.StrictMode>
  );
});

// Fade the intro once it has played and the site has painted under it (two frames), or
// after 150ms if frames are paused, as in a background tab. leave() only runs once.
if (intro) {
  intro.ready.then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => intro.leave()));
    setTimeout(() => intro.leave(), 150);
  });
}
