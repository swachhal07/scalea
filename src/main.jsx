import React from 'react';
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

// The intro in index.html plays first. The site renders once the particles have formed
// the logo, so its entrance animations play in view; the intro fades out after that paint.
const intro = window.__intro;

function mount() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </React.StrictMode>
  );
  // Fade the intro once the site has painted (two frames), or after 150ms if frames are
  // paused, as in a background tab. leave() only runs once.
  if (intro) {
    requestAnimationFrame(() => requestAnimationFrame(() => intro.leave()));
    setTimeout(() => intro.leave(), 150);
  }
}

if (intro) intro.ready.then(mount);
else mount();
