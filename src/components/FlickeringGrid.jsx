import { useCallback, useEffect, useRef } from 'react';

// A grid of flickering squares. Cells that fall inside the rasterised word are
// lifted above the noise floor, so the text reads as a dot-matrix sign.
export default function FlickeringGrid({
  squareSize = 2,
  gridGap = 3,
  flickerChance = 0.1,
  color = '#ffffff',
  maxOpacity = 0.3,
  text = '',
  fontSize = 90,
  fontWeight = 700,
  textFromBottom = null,
  fitWidth = 0.92,
  textFloor = 0.42,
  textGain = 2.6,
  textOnly = false,
  className = '',
  ...props
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const [r, g, b] = toRgb(color);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const cell = squareSize + gridGap;
    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);

    const squares = new Float32Array(cols * rows);
    for (let i = 0; i < squares.length; i += 1) squares[i] = Math.random() * maxOpacity;

    gridRef.current = {
      dpr,
      cols,
      rows,
      cell,
      squares,
      mask: text
        ? buildMask({
            text, width, height, cols, rows, cell, dpr,
            fontSize, fontWeight, fitWidth,
            textY: textFromBottom == null ? height / 2 : height - textFromBottom,
          })
        : null,
    };
  }, [squareSize, gridGap, maxOpacity, text, fontSize, fontWeight, fitWidth, textFromBottom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Rasterising the word is costly, so the grid is built the first time it comes into view.
    let built = false;

    // Without a mask every cell glows; with textOnly, only the letters do.
    const opacityAt = (grid, index) => {
      if (!grid.mask) return grid.squares[index];
      if (grid.mask[index]) return Math.min(1, grid.squares[index] * textGain + textFloor);
      return textOnly ? 0 : grid.squares[index];
    };

    const paint = (grid, index) => {
      const { dpr, rows, cell } = grid;
      const x = Math.floor(index / rows) * cell * dpr;
      const y = (index % rows) * cell * dpr;
      const size = squareSize * dpr;

      const alpha = opacityAt(grid, index);

      ctx.clearRect(x, y, size, size);
      if (alpha <= 0) return;
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fillRect(x, y, size, size);
    };

    const draw = () => {
      const grid = gridRef.current;
      if (!grid) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < grid.squares.length; index += 1) paint(grid, index);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let frame = 0;
    let last = 0;
    let visible = false;

    const tick = (time) => {
      const grid = gridRef.current;
      if (grid) {
        const delta = last ? (time - last) / 1000 : 0;
        last = time;

        const { squares } = grid;
        const flips = Math.min(squares.length, Math.round(squares.length * flickerChance * delta));

        for (let n = 0; n < flips; n += 1) {
          const index = (Math.random() * squares.length) | 0;
          squares[index] = Math.random() * maxOpacity;
          paint(grid, index);
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const sync = () => {
      if (visible && !reduced.matches && !document.hidden) {
        start();
      } else {
        stop();
        draw();
      }
    };

    const rebuild = () => {
      if (!built) return;
      setup();
      draw();
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !built) {
          built = true;
          setup();
        }
        sync();
      },
      { threshold: 0, rootMargin: '200px' },
    );
    intersection.observe(canvas);

    const resize = new ResizeObserver(rebuild);
    resize.observe(container);

    // The word is rasterised once, so redraw it when the web font lands.
    document.fonts?.ready.then(rebuild).catch(() => {});

    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);

    return () => {
      stop();
      intersection.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
    };
  }, [setup, squareSize, flickerChance, maxOpacity, r, g, b, textFloor, textGain, textOnly]);

  return (
    <div ref={containerRef} className={className} aria-hidden="true" {...props}>
      <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }} />
    </div>
  );
}

/** Hex or rgb() in, three channels out. */
function toRgb(color) {
  const hex = color.trim().replace('#', '');

  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [hex[0] + hex[0], hex[1] + hex[1], hex[2] + hex[2]].map((pair) => parseInt(pair, 16));
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((pair) => parseInt(pair, 16));
  }
  const channels = color.match(/\d+(\.\d+)?/g);
  if (channels && channels.length >= 3) return channels.slice(0, 3).map(Number);

  return [180, 180, 180];
}

/** Rasterise the word once and reduce it to one byte per grid cell. */
function buildMask({
  text, width, height, cols, rows, cell, dpr,
  fontSize, fontWeight, fitWidth, textY,
}) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  const face = 'Archivo, ui-sans-serif, system-ui, sans-serif';

  ctx.scale(dpr, dpr);
  ctx.font = `${fontWeight} ${fontSize}px ${face}`;

  const limit = width * fitWidth;
  const measured = ctx.measureText(text).width;
  const size = measured > limit ? Math.floor(fontSize * (limit / measured)) : fontSize;

  ctx.font = `${fontWeight} ${size}px ${face}`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, textY);

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const mask = new Uint8Array(cols * rows);
  const step = Math.max(1, Math.floor(dpr));

  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const x0 = Math.floor(i * cell * dpr);
      const y0 = Math.floor(j * cell * dpr);
      const x1 = Math.min(canvas.width, x0 + Math.ceil(cell * dpr));
      const y1 = Math.min(canvas.height, y0 + Math.ceil(cell * dpr));

      let hit = 0;
      for (let y = y0; y < y1 && !hit; y += step) {
        for (let x = x0; x < x1; x += step) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 0) {
            hit = 1;
            break;
          }
        }
      }
      mask[i * rows + j] = hit;
    }
  }

  return mask;
}
