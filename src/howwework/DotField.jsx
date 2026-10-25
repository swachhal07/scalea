import { useEffect, useRef } from 'react';

// A grid of square "pixels" behind the section. Near the cursor they push away
// and brighten, then spring back. Draws only while something is moving.
const GAP = 22;
const SIZE = 2;
const RADIUS = 140;
const PUSH = 26;

export default function DotField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dots = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    const mouse = { x: -9999, y: -9999, on: false };
    let raf = 0;
    let running = false;

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      dots = [];
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) dots.push({ hx: x, hy: y, x, y, g: 0 });
      }
      draw();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        // Fade the field out toward the top and bottom of the section.
        const edge = Math.min(d.hy / 260, (h - d.hy) / 260, 1);
        const a = (0.16 + d.g * 0.75) * Math.max(edge, 0);
        if (a < 0.01) continue;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        const s = SIZE + d.g * 1.5;
        ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
      }
    };

    const tick = () => {
      let moving = false;
      for (const d of dots) {
        let tx = d.hx;
        let ty = d.hy;
        let tg = 0;
        if (mouse.on) {
          const dx = d.hx - mouse.x;
          const dy = d.hy - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const f = 1 - dist / RADIUS;
            const k = (f * f * PUSH) / (dist || 1);
            tx += dx * k;
            ty += dy * k;
            tg = f;
          }
        }
        d.x += (tx - d.x) * 0.14;
        d.y += (ty - d.y) * 0.14;
        d.g += (tg - d.g) * 0.12;
        if (Math.abs(tx - d.x) > 0.05 || Math.abs(ty - d.y) > 0.05 || Math.abs(tg - d.g) > 0.005) moving = true;
      }
      draw();
      if (moving || mouse.on) raf = requestAnimationFrame(tick);
      else running = false;
    };

    const wake = () => {
      if (still || running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.on = true;
      wake();
    };
    const onLeave = () => { mouse.on = false; wake(); };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(host);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas className="hw-dots" ref={ref} aria-hidden="true" />;
}
