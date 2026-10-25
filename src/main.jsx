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
import './components/closing.css';
import './pages/start.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>
);
