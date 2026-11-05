import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import './tumble-deck.css';

/*
 * Tumble Deck Showcase — a stack of website screenshots standing on edge, one
 * behind the other. The front card tips forward on its bottom edge and lands
 * flat on the floor, the deck slides up to the line, the next one falls.
 *
 * Pure CSS 3D (one perspective, every card hinged on the same floor line) with
 * a single number driving it — the deck position. A small pool of card
 * elements is recycled along it: slot j always holds the virtual card
 * k ≡ j (mod pool), showing image k mod n, and a slot is only re-pointed while
 * it is invisible (under the floor pile or past the back).
 *
 * Two ways to drive it:
 *  - `progress` (a framer-motion MotionValue, 0–1): the page scroll drives the
 *    deck from the first card to the last. No wheel capture, so the page never
 *    gets stuck on it; touch scrolling stays native.
 *  - no `progress`: the deck owns its input. Wheel, trackpad and drag scrub it,
 *    and it loops endlessly both ways.
 * Click and the arrow keys step one card either way (`onStep` overrides that,
 * e.g. to scroll the page to the next card in `progress` mode).
 */

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Euclidean modulo: card k of an endless deck shows image wrap(k, n). */
export const wrap = (k, n) => (n ? ((k % n) + n) % n : 0);

/** Hinge angle (deg, rotateX) `t` of the way through a card's fall: 0 upright, -90 flat. */
export function fallAngle(t) {
  const u = clamp01(t);
  const land = 0.78;
  if (u <= land) {
    const k = u / land;
    return -90 * k * k * k;
  }
  const k = (u - land) / (1 - land);
  return -90 + 6 * Math.sin(Math.PI * k) * (1 - k);
}

/** How far the deck has slid forward, in card gaps, at deck position `pos`. */
export function deckAdvance(pos) {
  const i = Math.floor(pos);
  const f = pos - i;
  const k = clamp01((f - 0.28) / 0.6);
  return i + k * k * (3 - 2 * k);
}

/** Pose of virtual card `k` when the deck is at `pos` (card k is at the front when pos = k). */
export function cardPose(k, pos, depth, n = Infinity) {
  // A finite deck (n given) has nothing before its first card or after its last.
  if (k < 0 || k >= n) return { angle: 0, z: 0, lift: 0, opacity: 0, flat: false };
  const t = pos - k;
  const lift = (k - Math.floor(pos) + 3) * 0.6;
  if (t >= 1) return { angle: -90, z: 0, lift, opacity: t < 3 ? 1 : 0, flat: true };
  if (t > 0) return { angle: fallAngle(t), z: 0, lift, opacity: 1, flat: false };
  const rel = k - deckAdvance(pos);
  const opacity = clamp01(depth + 1 - rel);
  return { angle: 0, z: -Math.max(rel, 0), lift: 0, opacity, flat: false };
}

const useIsoLayoutEffect = import.meta.env.SSR ? useEffect : useLayoutEffect;

export default function TumbleDeckShowcase({
  cards,
  progress,
  onIndex,
  onStep,
  height = '100svh',
  aspect = 2.06,
  scrollPerCard = 240,
  depth = 5,
  /** Largest card width as a share of the root width, and height as a share of its height. */
  widthFraction = 0.655,
  heightFraction = 0.42,
  className,
  style,
  ariaLabel = 'Website showcase',
}) {
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const cardRefs = useRef([]);
  const imgRefs = useRef([]);
  const slotK = useRef([]);
  const state = useRef({ pos: 0 });
  const geo = useRef({ h: 200, gap: 44 });
  const lastIndex = useRef(-1);
  const onIndexRef = useRef(onIndex);
  onIndexRef.current = onIndex;
  const n = cards.length;
  // Self-driven decks loop forever; a page-scroll deck runs once, first card to last.
  const loop = !progress;
  // Two on the floor, the falling one, the front one, `depth` behind, one fading in.
  const pool = n ? depth + 5 : 0;

  const paint = useCallback(() => {
    const { pos } = state.current;
    const { gap } = geo.current;
    const base = Math.floor(pos) - 2;
    cardRefs.current.forEach((el, j) => {
      const img = imgRefs.current[j];
      if (!el || !img || j >= pool) return;
      const k = base + wrap(j - base, pool);
      if (slotK.current[j] !== k) {
        slotK.current[j] = k;
        const c = cards[wrap(k, n)];
        img.src = c.src;
        img.alt = c.alt ?? '';
      }
      const p = cardPose(k, pos, depth, loop ? Infinity : n);
      el.style.transform = `translate3d(0, ${-p.lift}px, ${p.z * gap}px) rotateX(${p.angle}deg)`;
      el.style.opacity = String(p.opacity);
      el.style.visibility = p.opacity > 0 ? 'visible' : 'hidden';
      // Light falls from above: a card darkens a touch as it tips away from it.
      el.style.setProperty('--td-shade', String(p.flat ? 0.06 : (-p.angle / 90) * 0.06));
    });
    // The card at the front (or more than halfway up from the floor).
    const index = wrap(Math.round(pos), n);
    if (index !== lastIndex.current) {
      lastIndex.current = index;
      onIndexRef.current?.(index);
    }
  }, [depth, pool, cards, n, loop]);

  // New images: re-point every slot on the next paint.
  useIsoLayoutEffect(() => {
    slotK.current = [];
  }, [cards]);

  // Fit the card, the deck above it and the floor card below inside the root.
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return undefined;
    const fit = () => {
      const W0 = root.clientWidth;
      const H0 = root.clientHeight;
      const wFrac = W0 < 420 ? Math.max(0.76, widthFraction) : widthFraction;
      const h = Math.max(60, Math.min((W0 * wFrac) / aspect, H0 * heightFraction, 620));
      const w = h * aspect;
      const top = H0 / 2 - 0.62 * h;
      geo.current = { h, gap: 0.24 * h };
      scene.style.perspective = `${6 * h}px`;
      scene.style.perspectiveOrigin = `50% ${top - 1.66 * h}px`;
      root.style.setProperty('--td-w', `${w}px`);
      root.style.setProperty('--td-h', `${h}px`);
      root.style.setProperty('--td-top', `${top}px`);
      paint();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    return () => ro.disconnect();
  }, [aspect, paint, widthFraction, heightFraction]);

  // The deck eases after a target position every frame and stops once it arrives.
  const api = useRef({ step: () => {} });
  const dragged = useRef(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || n === 0) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = state.current;
    let target = s.pos;
    let raf = 0;
    let last = 0;
    let idle;
    let acc = 0;

    const follow = (now) => {
      const dt = Math.min(0.1, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      s.pos += (target - s.pos) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - s.pos) < 2e-3) {
        s.pos = target;
        raf = 0;
        last = 0;
      } else {
        raf = requestAnimationFrame(follow);
      }
      paint();
    };
    const go = (to) => {
      target = to;
      if (reduce) {
        s.pos = target;
        paint();
      } else if (!raf) {
        raf = requestAnimationFrame(follow);
      }
    };

    // Page-scroll mode: scroll progress sets the target; nothing is captured.
    if (progress) {
      const toPos = (p) => p * (n - 1);
      s.pos = target = toPos(progress.get());
      paint();
      const unsub = progress.on('change', (p) => go(toPos(p)));
      api.current.step = (dir) => onStep?.(dir);
      return () => {
        unsub();
        cancelAnimationFrame(raf);
      };
    }

    // Self-driven mode. A hard fling still travels card by card.
    const push = (to) => go(Math.max(Math.round(s.pos) - 3, Math.min(Math.round(s.pos) + 3, to)));
    const settle = (bias = 0) =>
      push(bias > 0 ? Math.floor(target + 0.7) : bias < 0 ? Math.ceil(target - 0.7) : Math.round(target));
    api.current.step = (dir) => (onStep ? onStep(dir) : push(Math.round(target) + dir));

    const onWheel = (e) => {
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? root.clientHeight : 1;
      const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * scale;
      if (reduce) {
        acc += d;
        while (Math.abs(acc) >= scrollPerCard) {
          const dir = Math.sign(acc);
          acc -= dir * scrollPerCard;
          push(target + dir);
        }
        return;
      }
      push(target + d / scrollPerCard);
      clearTimeout(idle);
      idle = setTimeout(() => settle(Math.sign(d)), 140);
    };

    let drag = null;
    const onDown = (e) => {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, y: e.clientY, travel: 0, last: 0 };
      dragged.current = false;
      clearTimeout(idle);
    };
    const onMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dy = drag.y - e.clientY;
      drag.y = e.clientY;
      drag.travel += Math.abs(dy);
      if (dy) drag.last = Math.sign(dy);
      if (drag.travel > 6 && !dragged.current) {
        dragged.current = true;
        root.setPointerCapture(e.pointerId);
      }
      if (dragged.current && !reduce) push(target + dy / (geo.current.h * 1.1));
    };
    const onUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (dragged.current) {
        if (reduce) push(Math.round(target) + (drag.last || 0));
        else settle(drag.last);
      }
      drag = null;
    };

    root.addEventListener('wheel', onWheel, { passive: false });
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    paint();
    return () => {
      clearTimeout(idle);
      cancelAnimationFrame(raf);
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
    };
  }, [n, scrollPerCard, paint, progress, onStep]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      api.current.step(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      api.current.step(-1);
    }
  };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
      onClick={() => {
        if (!dragged.current) api.current.step(1);
      }}
      className={['td-root', progress ? 'td-page' : '', className].filter(Boolean).join(' ')}
      style={{ height, ...style }}
    >
      <div ref={sceneRef} className="td-scene">
        {Array.from({ length: pool }, (_, j) => (
          <div key={j} ref={(el) => { cardRefs.current[j] = el; }} className="td-card">
            {/* src/alt are set in paint() as the slot moves along the deck. */}
            <img
              ref={(el) => { imgRefs.current[j] = el; }}
              alt=""
              width={720}
              height={Math.round(720 / aspect)}
              draggable={false}
              decoding="async"
            />
          </div>
        ))}
      </div>
      <span className="sr-only">
        {n} pages. {progress ? 'Scroll' : 'Scroll, drag'}, click or press the arrow keys to flip through them.
      </span>
    </div>
  );
}
