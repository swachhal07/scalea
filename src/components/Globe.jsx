import { useEffect, useRef } from 'react';

// A dotted globe centred near Kathmandu, turning slowly, with arcs reaching out to a few
// cities and the current Kathmandu time beside the studio. Drawn on a 2D canvas: land dots are
// projected each frame (orthographic), arcs are great circles lifted off the surface, and
// a short highlight runs along each arc to its arrowhead. Pauses off screen; reduced
// motion gets a single still frame.

const HOME = { city: 'Kathmandu', lat: 27.7, lon: 85.3, tz: 'Asia/Kathmandu' };
export const CITIES = [
  { city: 'London', lat: 51.5, lon: -0.1, tz: 'Europe/London' },
  { city: 'Dubai', lat: 25.2, lon: 55.3, tz: 'Asia/Dubai' },
  { city: 'Singapore', lat: 1.35, lon: 103.8, tz: 'Asia/Singapore' },
  { city: 'Sydney', lat: -33.9, lon: 151.2, tz: 'Australia/Sydney' },
];

const RAD = Math.PI / 180;
const TILT = 16; // view latitude
const unit = (lat, lon) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];

function decode(b64) {
  const bin = atob(b64);
  const v = new Int16Array(bin.length / 2);
  for (let i = 0; i < v.length; i++) v[i] = (bin.charCodeAt(i * 2) | (bin.charCodeAt(i * 2 + 1) << 8)) << 16 >> 16;
  const pts = new Float32Array((v.length / 2) * 3);
  for (let i = 0; i < v.length / 2; i++) pts.set(unit(v[i * 2] / 10, v[i * 2 + 1] / 10), i * 3);
  return pts;
}

// Points along the great circle from a to b, lifted into an arc that peaks mid-way.
function arc(a, b, steps = 48) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const w = Math.acos(dot);
  const lift = 0.05 + w * 0.09;
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s1 = Math.sin((1 - t) * w) / Math.sin(w);
    const s2 = Math.sin(t * w) / Math.sin(w);
    const r = 1 + lift * Math.sin(Math.PI * t);
    out.push([(a[0] * s1 + b[0] * s2) * r, (a[1] * s1 + b[1] * s2) * r, (a[2] * s1 + b[2] * s2) * r]);
  }
  return out;
}

const timeIn = (tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(new Date());

export default function Globe() {
  const wrap = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const home = unit(HOME.lat, HOME.lon);
    const routes = CITIES.map((c) => ({ ...c, v: unit(c.lat, c.lon), path: arc(home, unit(c.lat, c.lon)) }));
    let land = null;
    let w = 0, h = 0, dpr = 1, raf = 0, last = 0, visible = false, homeTime = '';
    const start = performance.now();

    const readTimes = () => { homeTime = timeIn(HOME.tz); };
    readTimes();
    const clock = setInterval(readTimes, 20000);

    function size() {
      const r = wrap.current.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      draw(performance.now());
    }

    function draw(now) {
      if (!w) return;
      const t = (now - start) / 1000;
      const lon0 = (still ? 76 : 76 + 16 * Math.sin(t * 0.09)) * RAD;
      const lat0 = TILT * RAD;
      // Screen basis for the view centre: east, north and towards the viewer.
      const e = [-Math.sin(lon0), Math.cos(lon0), 0];
      const n = [-Math.sin(lat0) * Math.cos(lon0), -Math.sin(lat0) * Math.sin(lon0), Math.cos(lat0)];
      const c = [Math.cos(lat0) * Math.cos(lon0), Math.cos(lat0) * Math.sin(lon0), Math.sin(lat0)];
      const R = Math.min(w, h) * 0.4;
      const cx = w / 2, cy = h / 2;
      const project = (p) => [
        cx + R * (p[0] * e[0] + p[1] * e[1] + p[2] * e[2]),
        cy - R * (p[0] * n[0] + p[1] * n[1] + p[2] * n[2]),
        p[0] * c[0] + p[1] * c[1] + p[2] * c[2],
      ];
      // A lifted point is hidden only when it sits behind the disc of the globe.
      const hidden = ([x, y, z]) => z < 0 && Math.hypot(x - cx, y - cy) < R;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // The sphere: a faint lit disc and rim.
      const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      g.addColorStop(0, 'rgba(255,255,255,0.07)');
      g.addColorStop(1, 'rgba(255,255,255,0.01)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Land dots, fading toward the limb.
      if (land) {
        for (let i = 0; i < land.length; i += 3) {
          const z = land[i] * c[0] + land[i + 1] * c[1] + land[i + 2] * c[2];
          if (z <= 0.02) continue;
          const x = cx + R * (land[i] * e[0] + land[i + 1] * e[1] + land[i + 2] * e[2]);
          const y = cy - R * (land[i] * n[0] + land[i + 1] * n[1] + land[i + 2] * n[2]);
          ctx.fillStyle = `rgba(255,255,255,${(0.12 + 0.5 * z).toFixed(3)})`;
          ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
        }
      }

      // Arcs out from Kathmandu, each with a highlight running to its arrowhead.
      const labels = [];
      routes.forEach((r, k) => {
        const pts = r.path.map(project);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        let open = false;
        pts.forEach((p) => {
          if (hidden(p)) { open = false; return; }
          if (open) ctx.lineTo(p[0], p[1]); else { ctx.moveTo(p[0], p[1]); open = true; }
        });
        ctx.stroke();

        if (!still) {
          const phase = ((t * 0.35 + k / routes.length) % 1) * 1.3;
          const head = Math.min(pts.length - 1, Math.floor(phase * (pts.length - 1)));
          const tail = Math.max(0, head - 10);
          for (let i = tail; i < head; i++) {
            if (hidden(pts[i]) || hidden(pts[i + 1])) continue;
            ctx.strokeStyle = `rgba(255,255,255,${(0.9 * (i - tail + 1)) / (head - tail)})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
          }
        }

        const end = pts[pts.length - 1];
        const prev = pts[pts.length - 4];
        if (hidden(end) || end[2] < 0.05) return;
        // Arrowhead along the arc's final direction, then the city dot just past it.
        const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.moveTo(end[0], end[1]);
        ctx.lineTo(end[0] - 7 * Math.cos(ang - 0.45), end[1] - 7 * Math.sin(ang - 0.45));
        ctx.lineTo(end[0] - 7 * Math.cos(ang + 0.45), end[1] - 7 * Math.sin(ang + 0.45));
        ctx.closePath(); ctx.fill();
        const dot = project(r.v);
        ctx.beginPath(); ctx.arc(dot[0], dot[1], 2.2, 0, Math.PI * 2); ctx.fill();
      });

      // Kathmandu: the origin, a bright point with a slow ring.
      const kp = project(home);
      if (kp[2] > 0) {
        const ring = still ? 0.5 : (t * 0.5) % 1;
        ctx.strokeStyle = `rgba(255,255,255,${(0.5 * (1 - ring)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(kp[0], kp[1], 4 + ring * 14, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(kp[0], kp[1], 3.4, 0, Math.PI * 2); ctx.fill();
        labels.push({ x: kp[0], y: kp[1], text: `KATHMANDU  ${homeTime}`, home: true, right: false });
      }

      // The Kathmandu label: a small chip in the mono face, kept inside the canvas.
      ctx.font = `500 10px ${getComputedStyle(cv).getPropertyValue('--mono') || 'monospace'}`;
      ctx.textBaseline = 'middle';
      labels.forEach((l) => {
        const tw = ctx.measureText(l.text).width;
        const pw = tw + 14, ph = 18;
        let x = l.right ? l.x + 9 : l.x - 9 - pw;
        x = Math.min(w - pw - 4, Math.max(4, x));
        const y = Math.min(h - ph - 4, Math.max(4, l.y - ph / 2 + (l.home ? 16 : 0)));
        ctx.fillStyle = l.home ? 'rgba(255,255,255,0.95)' : 'rgba(10,10,11,0.82)';
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 9); ctx.fill(); if (!l.home) ctx.stroke();
        ctx.fillStyle = l.home ? '#000' : 'rgba(255,255,255,0.82)';
        ctx.fillText(l.text, x + 7, y + ph / 2 + 0.5);
      });
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // about 30 fps is plenty for a slow turn
      last = now;
      draw(now);
    }
    const play = () => { if (!still && visible && !raf) raf = requestAnimationFrame(loop); };
    const pause = () => { cancelAnimationFrame(raf); raf = 0; };

    const ro = new ResizeObserver(size);
    ro.observe(wrap.current);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) play(); else pause(); });
    io.observe(wrap.current);
    import('./globe-land.js').then((m) => { land = decode(m.LAND); draw(performance.now()); });

    return () => { pause(); ro.disconnect(); io.disconnect(); clearInterval(clock); };
  }, []);

  return (
    <div className="ab-globe" ref={wrap}>
      <canvas ref={canvas} aria-hidden="true" />
      <p className="sr-only">
        A globe centred on Kathmandu, with arcs to {CITIES.map((c) => c.city).join(', ')}, and the current time in Kathmandu.
      </p>
    </div>
  );
}
