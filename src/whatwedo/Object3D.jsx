import { useEffect, useRef } from 'react';

// One glossy, monochrome 3D object per service. Three.js loads lazily, each
// canvas renders only while on screen, and the object leans toward the pointer.

function build(T, RoundedBox, kind) {
  // Palette matches the site: near-black surfaces, smoked chrome edges, one white glow per object.
  const black = new T.MeshPhysicalMaterial({ color: 0x0a0a0b, metalness: 0.5, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
  const chrome = new T.MeshPhysicalMaterial({ color: 0x4a4a4e, metalness: 1, roughness: 0.22 });
  const white = new T.MeshPhysicalMaterial({ color: 0x1b1b1d, metalness: 0.35, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const glow = new T.MeshBasicMaterial({ color: 0xffffff });
  const dim = new T.MeshBasicMaterial({ color: 0x6c6c70 });
  const glass = new T.MeshPhysicalMaterial({ color: 0xbfc0c4, metalness: 0, roughness: 0.08, transmission: 0.9, thickness: 1.2, ior: 1.45, transparent: true, opacity: 0.6 });
  const g = new T.Group();

  if (kind === 'build') {
    // A browser window with a page taking shape, and a glowing </> in front: web & app development.
    const win = new T.Mesh(new RoundedBox(3.4, 2.3, 0.12, 4, 0.12), white);
    const view = new T.Mesh(new T.PlaneGeometry(3.2, 1.8), black);
    view.position.set(0, -0.14, 0.065);
    const bar = new T.Mesh(new RoundedBox(1.6, 0.14, 0.02, 2, 0.06), dim);
    bar.position.set(0.15, 0.93, 0.07);
    win.add(view, bar);
    [-1.48, -1.34, -1.2].forEach((x) => {
      const dot = new T.Mesh(new T.SphereGeometry(0.035, 16, 16), dim);
      dot.position.set(x, 0.93, 0.08);
      win.add(dot);
    });
    // Page wireframe: nav, hero block, three cards.
    [[-0.95, 0.62, 0.7, 0.06], [0.5, 0.62, 1.4, 0.06], [-0.55, 0.22, 1.6, 0.12], [-0.75, -0.02, 1.2, 0.06], [-1.0, -0.22, 0.7, 0.18]].forEach(([x, y, w, h]) => {
      const b = new T.Mesh(new T.BoxGeometry(w, h, 0.01), dim);
      b.position.set(x, y, 0.075);
      win.add(b);
    });
    [-1.0, 0, 1.0].forEach((x) => {
      const c = new T.Mesh(new RoundedBox(0.85, 0.5, 0.02, 2, 0.04), chrome);
      c.position.set(x, -0.72, 0.08);
      win.add(c);
    });
    // The </> symbol, built from glowing bars.
    const code = new T.Group();
    const seg = (x, y, len, rot) => {
      const m = new T.Mesh(new RoundedBox(len, 0.16, 0.16, 3, 0.07), glow);
      m.position.set(x, y, 0);
      m.rotation.z = rot;
      code.add(m);
    };
    seg(-0.92, 0.2, 0.62, 0.6); seg(-0.92, -0.2, 0.62, -0.6);
    seg(0, 0, 1.2, 1.2);
    seg(0.92, 0.2, 0.62, -0.6); seg(0.92, -0.2, 0.62, 0.6);
    code.position.set(0.55, -0.15, 0.9);
    code.scale.setScalar(0.85);
    g.add(win, code);
    g.userData.code = code;
    g.rotation.set(0.08, -0.38, 0);
  }
  if (kind === 'review') {
    // A magnifier: chrome ring, glass lens, black handle.
    const ring = new T.Mesh(new T.TorusGeometry(1, 0.16, 32, 96), chrome);
    const lens = new T.Mesh(new T.CylinderGeometry(0.95, 0.95, 0.08, 64), glass);
    lens.rotation.x = Math.PI / 2;
    const handle = new T.Mesh(new T.CapsuleGeometry(0.17, 1.1, 8, 24), black);
    handle.position.set(1.15, -1.15, 0);
    handle.rotation.z = Math.PI / 4;
    const spark = new T.Mesh(new T.SphereGeometry(0.09, 24, 24), glow);
    spark.position.set(0.35, 0.35, 0.1);
    g.add(ring, lens, handle, spark);
    g.rotation.set(0.2, -0.35, 0.1);
    g.position.set(-0.2, 0.2, 0);
  }

  if (kind === 'launch') {
    // A rocket lifting off out of a phone, trailing light: launching your app.
    const phone = new T.Mesh(new RoundedBox(1.5, 2.9, 0.14, 6, 0.22), white);
    const screen = new T.Mesh(new T.PlaneGeometry(1.32, 2.68), black);
    screen.position.z = 0.075;
    phone.add(screen);
    phone.rotation.x = -1.0;
    phone.position.set(0, -1.25, 0);

    const rocket = new T.Group();
    const profile = [[0, -0.75], [0.3, -0.72], [0.38, -0.4], [0.4, 0.1], [0.34, 0.5], [0.2, 0.85], [0, 1.05]].map(([x, y]) => new T.Vector2(x, y));
    const body = new T.Mesh(new T.LatheGeometry(profile, 48), chrome);
    const window1 = new T.Mesh(new T.TorusGeometry(0.13, 0.035, 16, 48), black);
    window1.position.set(0, 0.32, 0.36);
    window1.rotation.x = -0.12;
    const pane = new T.Mesh(new T.CircleGeometry(0.12, 32), glow);
    pane.position.set(0, 0.32, 0.37);
    pane.rotation.x = -0.12;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const fin = new T.Mesh(new RoundedBox(0.42, 0.5, 0.06, 2, 0.03), black);
      fin.position.set(Math.sin(a) * 0.42, -0.5, Math.cos(a) * 0.42);
      fin.rotation.y = a;
      rocket.add(fin);
    }
    const nozzle = new T.Mesh(new T.CylinderGeometry(0.2, 0.26, 0.16, 32), black);
    nozzle.position.y = -0.82;
    const flame = new T.Mesh(new T.ConeGeometry(0.2, 0.7, 32), glow);
    flame.position.y = -1.22;
    flame.rotation.x = Math.PI;
    rocket.add(body, window1, pane, nozzle, flame);
    rocket.position.set(0, 0.55, 0.2);
    rocket.scale.setScalar(1.2);
    rocket.rotation.z = -0.12;

    // Exhaust trail: soft rings from the screen up to the rocket.
    const trail = new T.Group();
    [0, 1, 2, 3].forEach((n) => {
      const ring = new T.Mesh(new T.TorusGeometry(0.22 + n * 0.08, 0.02, 12, 48), glow);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, -0.65 - n * 0.14, 0.2);
      ring.material = glow.clone();
      ring.material.transparent = true;
      ring.material.opacity = 0.75 - n * 0.17;
      trail.add(ring);
    });
    g.add(phone, trail, rocket);
    g.userData.rocket = rocket;
    g.userData.flame = flame;
    g.rotation.set(0.12, -0.5, 0.1);
    g.position.y = -0.2;
    g.scale.setScalar(0.92);
  }
  if (kind === 'plan') {
    // A roadmap board with ticked-off tasks: planning and design.
    const board = new T.Mesh(new RoundedBox(2.4, 2.9, 0.12, 4, 0.14), white);
    const clip = new T.Mesh(new RoundedBox(0.9, 0.28, 0.16, 3, 0.08), chrome);
    clip.position.set(0, 1.45, 0.04);
    board.add(clip);
    [0, 1, 2, 3].forEach((n) => {
      const y = 0.8 - n * 0.55;
      const box = new T.Mesh(new RoundedBox(0.28, 0.28, 0.04, 2, 0.06), n < 2 ? glow : dim);
      box.position.set(-0.75, y, 0.08);
      const line = new T.Mesh(new T.BoxGeometry(n % 2 ? 0.9 : 1.2, 0.09, 0.02), n < 2 ? dim : chrome);
      line.position.set(-0.4 + (n % 2 ? 0.45 : 0.6), y, 0.08);
      board.add(box, line);
    });
    const pen = new T.Mesh(new T.CapsuleGeometry(0.07, 1.6, 8, 24), chrome);
    pen.position.set(1.35, -0.2, 0.35);
    pen.rotation.z = 0.5;
    const tip = new T.Mesh(new T.ConeGeometry(0.07, 0.2, 24), glow);
    tip.position.set(1.0, -0.95, 0.35);
    tip.rotation.z = 0.5 + Math.PI;
    g.add(board, pen, tip);
    g.rotation.set(0.15, -0.45, 0.08);
  }
  if (kind === 'market') {
    // Rising pillars, the tallest in chrome.
    [0.7, 1.15, 1.7, 2.4].forEach((h, i) => {
      const pillar = new T.Mesh(new RoundedBox(0.5, h, 0.5, 4, 0.12), i === 3 ? chrome : i % 2 ? black : white);
      pillar.position.set(-1.05 + i * 0.7, h / 2 - 1.1, 0);
      pillar.userData.h = h;
      g.add(pillar);
    });
    const cap = new T.Mesh(new RoundedBox(0.52, 0.05, 0.52, 2, 0.02), glow);
    cap.position.set(1.05, 1.32, 0);
    g.add(cap);
    g.userData.cap = cap;
    g.rotation.set(0.25, -0.55, 0);
  }

  if (kind === 'ai') {
    // A chat answer with an AI sparkle: showing up in AI answers.
    const bubble = new T.Mesh(new RoundedBox(2.8, 1.75, 0.22, 6, 0.3), black);
    const tail = new T.Mesh(new RoundedBox(0.42, 0.42, 0.22, 3, 0.06), black);
    tail.position.set(-0.95, -0.82, 0);
    tail.rotation.z = Math.PI / 4;
    const star = new T.Shape();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? 0.11 : 0.36;
      const a = (i / 8) * Math.PI * 2 + Math.PI / 2;
      if (i) star.lineTo(Math.cos(a) * r, Math.sin(a) * r); else star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const spark = new T.Mesh(new T.ExtrudeGeometry(star, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), glow);
    spark.position.set(-0.95, 0.38, 0.12);
    const lines = new T.Group();
    [[1.4, glow], [1.9, dim], [1.2, dim]].forEach(([w, m], i) => {
      const line = new T.Mesh(new T.BoxGeometry(w, 0.1, 0.02), m);
      line.position.set(-0.5 + w / 2 - (i ? 0.5 : 0), 0.38 - i * 0.36 - (i ? 0.02 : 0), 0.12);
      lines.add(line);
    });
    lines.children[0].position.x = -0.45 + 0.7;
    const ask = new T.Mesh(new RoundedBox(1.5, 0.6, 0.16, 4, 0.22), chrome);
    ask.position.set(1.05, 1.25, -0.35);
    const askLine = new T.Mesh(new T.BoxGeometry(0.9, 0.08, 0.02), dim);
    askLine.position.set(1.05, 1.25, -0.26);
    g.add(ask, askLine, bubble, tail, spark, lines);
    g.userData.spark = spark;
    g.rotation.set(0.12, -0.38, 0);
    g.position.y = -0.2;
  }
  return g;
}

export default function Object3D({ kind }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    let disposed = false;
    let cleanup = () => {};

    // Shader compiles and the environment map are expensive, so nothing loads
    // until the canvas nears the viewport, and then only once the main thread is idle.
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1));
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      idle(init, { timeout: 600 });
    }, { rootMargin: '400px' });
    near.observe(el);

    async function init() {
      if (disposed) return;
      const T = await import('three');
      const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;

      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      el.appendChild(renderer.domElement);

      const scene = new T.Scene();
      const pmrem = new T.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.55;
      // Top light and a back rim, like the lit top edges on the site's cards.
      const key = new T.DirectionalLight(0xffffff, 1.1);
      key.position.set(1, 6, 3);
      const rim = new T.DirectionalLight(0xffffff, 2.2);
      rim.position.set(-2, 3, -5);
      scene.add(key, rim);

      const camera = new T.PerspectiveCamera(32, 1, 0.1, 50);
      camera.position.set(0, 0, kind === 'build' ? 7.2 : kind === 'launch' ? 8.8 : 8.4);
      camera.lookAt(0, 0.15, 0);

      const obj = build(T, RoundedBoxGeometry, kind);
      const holder = new T.Group();
      holder.add(obj);
      scene.add(holder);

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // Pointer lean + hover energy, read from the card this canvas sits in.
      const card = el.closest('.wwd-card, .hw-glass') || el;
      const target = { x: 0, y: 0, hover: 0 };
      const cur = { x: 0, y: 0, hover: 0 };
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        wake();
      };
      const onEnter = () => { target.hover = 1; wake(); };
      const onLeave = () => { target.hover = 0; target.x = 0; target.y = 0; wake(); };
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);

      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let visible = false;
      let raf = 0;
      let running = false;
      function wake() {
        if (running || !visible) return;
        running = true;
        raf = requestAnimationFrame(tick);
      }
      const clock = new T.Clock();
      const tick = () => {
        const t = clock.getElapsedTime();
        cur.x += (target.x - cur.x) * 0.06;
        cur.y += (target.y - cur.y) * 0.06;
        cur.hover += (target.hover - cur.hover) * 0.08;

        holder.rotation.y = cur.x * 0.45;
        holder.rotation.x = cur.y * 0.3;

        // Build: the </> lifts toward the viewer on hover.
        if (kind === 'build') {
          obj.userData.code.position.z = 0.9 + cur.hover * 0.5;
          obj.userData.code.rotation.y = cur.hover * 0.25;
        }
        if (kind === 'market') {
          obj.children.forEach((p, i) => { if (!p.userData.h) return; p.scale.y = 1 + 0.18 * cur.hover * (i / 3); p.position.y = (p.userData.h * p.scale.y) / 2 - 1.1; });
          obj.userData.cap.position.y = 2.4 * (1 + 0.18 * cur.hover) - 1.1 + 0.03;
        }
        // Launch: the rocket climbs on hover; the flame flickers.
        if (kind === 'launch') {
          obj.userData.rocket.position.y = 0.55 + cur.hover * 0.35;
          obj.userData.flame.scale.y = 1 + cur.hover * 0.5 + (still ? 0 : Math.sin(t * 18) * 0.08);
        }
        // AI: the sparkle turns slowly, faster on hover.
        if (kind === 'ai' && !still) obj.userData.spark.rotation.z = t * (0.4 + cur.hover * 1.4);
        if (kind === 'review') obj.rotation.z = 0.1 + cur.hover * 0.25;

        renderer.render(scene, camera);
        // Render on demand: keep going only while hovered or still easing back.
        const settling = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) + Math.abs(target.hover - cur.hover) > 0.002;
        if (visible && (target.hover > 0 || settling)) raf = requestAnimationFrame(tick);
        else running = false;
      };

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) wake();
      }, { rootMargin: '100px' });
      io.observe(el);
      renderer.render(scene, camera);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
        scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
        scene.environment?.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
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
