import { useEffect, useRef } from 'react';

// One glossy, monochrome 3D object per step, leaning toward the pointer. The scenes
// live in scene3d.js and render in a worker where the browser allows it, so shader
// compiles never block scrolling; this component only shows the frames and forwards
// pointer and visibility changes.

let client = null;
function getClient() {
  client ||= (async () => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const views = new Map();

    if (typeof OffscreenCanvas !== 'undefined' && 'transferToImageBitmap' in OffscreenCanvas.prototype) {
      const worker = new Worker(new URL('./object3d.worker.js', import.meta.url), { type: 'module' });
      const ok = await new Promise((resolve) => {
        worker.onmessage = ({ data }) => {
          if (data.type === 'frame') views.get(data.id)?.(data.bitmap);
          else resolve(data.type === 'ready');
        };
        worker.onerror = () => resolve(false);
        worker.postMessage({ type: 'init', still });
      });
      if (ok) return { worker: true, views, call: (type, ...args) => worker.postMessage({ type, args }) };
      worker.terminate();
    }

    // No WebGL in workers: the same shared stage runs on the main thread instead.
    const { createStage } = await import('./scene3d.js');
    const stage = createStage({ still, present: (id, canvas) => views.get(id)?.(canvas) });
    return { worker: false, views, call: (type, ...args) => stage[type](...args) };
  })();
  return client;
}

let nextId = 0;

export default function Object3D({ kind }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    let disposed = false;
    let cleanup = () => {};

    // Nothing loads until the object nears the viewport, and then only once the main thread is idle.
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      idle(init, { timeout: 600 });
    }, { rootMargin: '400px' });
    near.observe(el);

    async function init() {
      if (disposed) return;
      const c = await getClient();
      if (disposed) return;

      const id = ++nextId;
      const canvas = document.createElement('canvas');
      el.appendChild(canvas);
      // Worker frames arrive as ImageBitmaps and are handed over without a copy.
      if (c.worker) {
        const ctx = canvas.getContext('bitmaprenderer');
        c.views.set(id, (bitmap) => ctx.transferFromImageBitmap(bitmap));
      } else {
        const ctx = canvas.getContext('2d');
        c.views.set(id, (source) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(source, 0, 0);
        });
      }

      const dpr = Math.min(window.devicePixelRatio, 1.25);
      const size = () => [Math.round(el.clientWidth * dpr), Math.round(el.clientHeight * dpr)];
      const [w, h] = size();
      canvas.width = w;
      canvas.height = h;
      c.call('add', id, kind, w, h);
      const ro = new ResizeObserver(() => {
        const [nw, nh] = size();
        if (nw === canvas.width && nh === canvas.height) return;
        canvas.width = nw;
        canvas.height = nh;
        c.call('resize', id, nw, nh);
      });
      ro.observe(el);

      // Pointer lean + hover energy, read from the card this canvas sits in.
      const card = el.closest('.wwd-card, .hw-glass') || el;
      const target = { x: 0, y: 0, hover: 0 };
      const send = () => c.call('pointer', id, target.x, target.y, target.hover);
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        send();
      };
      const onEnter = () => { target.hover = 1; send(); };
      const onLeave = () => { target.hover = 0; target.x = 0; target.y = 0; send(); };
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);

      const io = new IntersectionObserver(([entry]) => {
        c.call('visible', id, entry.isIntersecting);
      }, { rootMargin: '100px' });
      io.observe(el);

      cleanup = () => {
        io.disconnect();
        ro.disconnect();
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
        c.call('remove', id);
        c.views.delete(id);
        canvas.remove();
      };
    }

    return () => {
      disposed = true;
      near.disconnect();
      cleanup();
    };
  }, [kind]);

  return <div className="obj3d" ref={host} aria-hidden="true" />;
}
