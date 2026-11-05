import { useEffect, useRef } from 'react';
import { LOW_END } from '../lib.js';

// One glossy, monochrome 3D object per step, leaning toward the pointer.
//
// Every device first gets a still picture of the object (pre-rendered into /public/process/),
// so the card is complete the moment it scrolls in and costs nothing to show. Only desktops
// with a mouse and enough cores and memory then load the live scene: it renders in a worker
// (scene3d.js) so shader compiles never block scrolling, and it replaces the picture once its
// first frame arrives. Browsers that cannot render WebGL off the main thread keep the picture.

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Live 3D is a hover effect: only worth it with a mouse, and only on hardware that keeps it smooth.
function canRunLive() {
  if (still() || LOW_END) return false;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;
  return typeof OffscreenCanvas !== 'undefined' && 'transferToImageBitmap' in OffscreenCanvas.prototype;
}

let client = null;
function getClient() {
  client ||= new Promise((resolve) => {
    const views = new Map();
    const worker = new Worker(new URL('./object3d.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data.type === 'frame') views.get(data.id)?.(data.bitmap);
      else if (data.type === 'ready') resolve({ views, call: (type, ...args) => worker.postMessage({ type, args }) });
      else { worker.terminate(); resolve(null); }
    };
    worker.onerror = () => { worker.terminate(); resolve(null); };
    worker.postMessage({ type: 'init', still: false });
  });
  return client;
}

let nextId = 0;

export default function Object3D({ kind }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!canRunLive()) return undefined;
    let disposed = false;
    let cleanup = () => {};

    // The live scene loads once the card nears the viewport and the main thread is idle.
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      idle(init, { timeout: 2000 });
    }, { rootMargin: '600px' });
    near.observe(el);

    async function init() {
      if (disposed) return;
      const c = await getClient();
      if (disposed || !c) return;

      const id = ++nextId;
      const canvas = document.createElement('canvas');
      el.appendChild(canvas);
      // Worker frames arrive as ImageBitmaps and are handed over without a copy.
      // The first one swaps the picture for the live object.
      const ctx = canvas.getContext('bitmaprenderer');
      c.views.set(id, (bitmap) => {
        ctx.transferFromImageBitmap(bitmap);
        el.classList.add('is-live');
      });

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
        el.classList.remove('is-live');
      };
    }

    return () => {
      disposed = true;
      near.disconnect();
      cleanup();
    };
  }, [kind]);

  return (
    <div className="obj3d" ref={host} aria-hidden="true">
      <img className="obj3d-still" src={`/process/${kind}.webp`} alt="" width="720" height="552" loading="lazy" decoding="async" />
    </div>
  );
}
