import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// A word that cycles through `words` ({ w, ms }: text and how long it holds), its letters
// rising in one after another (styles: .p-cycle in heroes/prime.css). Reduced motion shows
// the last word only. The box eases to each word's own width, so surrounding text stays put
// around it; widths are measured once the font has loaded and again on resize.
export default function CycleWord({ words }) {
  const still = useReducedMotion();
  const [n, setN] = useState(still ? words.length - 1 : 0);
  const box = useRef(null);
  const [widths, setWidths] = useState(null);

  useEffect(() => {
    if (still) return undefined;
    const id = setTimeout(() => setN((v) => (v + 1) % words.length), words[n].ms);
    return () => clearTimeout(id);
  }, [n, still, words]);

  useEffect(() => {
    const measure = () => {
      if (box.current) setWidths([...box.current.children].map((w) => w.getBoundingClientRect().width));
    };
    document.fonts?.ready.then(measure);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <span className="p-cycle" ref={box} style={widths ? { width: widths[n] } : undefined}>
      {words.map((c, i) => (
        <span key={c.w} className={i === n ? 'is-on' : i === (n + words.length - 1) % words.length ? 'is-out' : ''}>
          {[...c.w].map((ch, j) => <i key={j} style={{ '--i': j }}>{ch}</i>)}
        </span>
      ))}
    </span>
  );
}
