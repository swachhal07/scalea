import { useEffect, useRef } from 'react';

// A grid of square "pixels" behind the section. Near the cursor they push away
// and brighten, then spring back. Draws only while something is moving, and then
// only the patch of grid around the cursor: the rest of the field is left as painted.
const GAP = 22;
const SIZE = 2;
const RADIUS = 140;
const PUSH = 26;
// How far a drawn dot can reach from its home cell (displacement plus its glow size).
const REACH = PUSH + SIZE + 2;

export default function DotField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dots = [];
    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const mouse = { x: -9999, y: -9999, on: false };
    let raf = 0;
    let running = false;
    // Dots that are displaced or glowing, and the area they were last drawn in.
    let active = new Set();
    let dirty = null;

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      cols = Math.ceil((w - GAP / 2) / GAP);
      rows = Math.ceil((h - GAP / 2) / GAP);
      dots = [];
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const x = GAP / 2 + c * GAP;
          const y = GAP / 2 + r * GAP;
          // Fade the field out toward the top and bottom of the section.
          const edge = Math.max(Math.min(y / 260, (h - y) / 260, 1), 0);
          dots.push({ hx: x, hy: y, x, y, g: 0, edge });
        }
      }
      active = new Set();
      dirty = null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawRange(0, cols - 1, 0, rows - 1);
    };

    const paint = (d) => {
      const a = (0.16 + d.g * 0.75) * d.edge;
      if (a < 0.01) return;
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      const s = SIZE + d.g * 1.5;
      ctx.fillRect(d.x - s / 2, d.y - s / 2, s, s);
    };

    const drawRange = (c0, c1, r0, r1) => {
      for (let r = Math.max(r0, 0); r <= Math.min(r1, rows - 1); r += 1) {
        for (let c = Math.max(c0, 0); c <= Math.min(c1, cols - 1); c += 1) paint(dots[r * cols + c]);
      }
    };

    // Grid cells whose home lies within `pad` of the box.
    const cellsAround = (x0, y0, x1, y1, pad) => [
      Math.floor((x0 - pad - GAP / 2) / GAP), Math.ceil((x1 + pad - GAP / 2) / GAP),
      Math.floor((y0 - pad - GAP / 2) / GAP), Math.ceil((y1 + pad - GAP / 2) / GAP),
    ];

    const tick = () => {
      // Dots under the cursor join the active set; dots that have settled leave it.
      if (mouse.on) {
        const [c0, c1, r0, r1] = cellsAround(mouse.x, mouse.y, mouse.x, mouse.y, RADIUS);
        for (let r = Math.max(r0, 0); r <= Math.min(r1, rows - 1); r += 1) {
          for (let c = Math.max(c0, 0); c <= Math.min(c1, cols - 1); c += 1) active.add(r * cols + c);
        }
      }

      let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
      for (const i of active) {
        const d = dots[i];
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
        if (Math.abs(tx - d.x) > 0.05 || Math.abs(ty - d.y) > 0.05 || Math.abs(tg - d.g) > 0.005) {
          x0 = Math.min(x0, d.hx); y0 = Math.min(y0, d.hy); x1 = Math.max(x1, d.hx); y1 = Math.max(y1, d.hy);
        } else {
          // Settled: snap home so it repaints exactly as the resting field.
          d.x = tx; d.y = ty; d.g = tg;
          if (tg === 0) active.delete(i);
        }
      }

      // Repaint where dots are now plus where they were last frame, nothing else.
      const now = x0 <= x1 ? [x0 - REACH, y0 - REACH, x1 + REACH, y1 + REACH] : null;
      const area = [dirty, now].filter(Boolean);
      if (area.length) {
        const bx0 = Math.max(0, Math.min(...area.map((a) => a[0])));
        const by0 = Math.max(0, Math.min(...area.map((a) => a[1])));
        const bx1 = Math.min(w, Math.max(...area.map((a) => a[2])));
        const by1 = Math.min(h, Math.max(...area.map((a) => a[3])));
        ctx.save();
        ctx.beginPath();
        ctx.rect(bx0, by0, bx1 - bx0, by1 - by0);
        ctx.clip();
        ctx.clearRect(bx0, by0, bx1 - bx0, by1 - by0);
        const [c0, c1, r0, r1] = cellsAround(bx0, by0, bx1, by1, REACH);
        drawRange(c0, c1, r0, r1);
        ctx.restore();
      }
      dirty = now;

      if (now || mouse.on) raf = requestAnimationFrame(tick);
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
