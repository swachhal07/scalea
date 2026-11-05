import { forwardRef } from 'react';

/*
 * Anti-Metal Button — a polished white key with a dark tab that sweeps in on hover.
 * The tab holds five double chevrons drawn in dots that pulse in a wave; on
 * hover it slides across the whole button. Styles live in anti-metal-button.css.
 *
 * Renders a <button> by default; pass `as="a"` (or a component such as
 * framer's `motion.a`) for links. `size="sm"` is the compact nav version.
 */

const DOTS = [
  { cx: 2, cy: 2, d: 0 },
  { cx: 5, cy: 5, d: 0.05 },
  { cx: 8, cy: 8, d: 0.1 },
  { cx: 5, cy: 11, d: 0.15 },
  { cx: 2, cy: 14, d: 0.2 },
  { cx: 6, cy: 2, d: 0.05 },
  { cx: 9, cy: 5, d: 0.1 },
  { cx: 12, cy: 8, d: 0.15 },
  { cx: 9, cy: 11, d: 0.2 },
  { cx: 6, cy: 14, d: 0.25 },
];

function DoubleChevron({ index, dotColor }) {
  const base = index * 0.12;
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true" focusable="false">
      <g fill={dotColor}>
        {DOTS.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="1" className="am-dot" style={{ animationDelay: `${base + p.d}s` }} />
        ))}
      </g>
    </svg>
  );
}

export const AntiMetalButton = forwardRef(function AntiMetalButton(
  {
    as: Tag = 'button',
    size = 'md',
    className,
    children,
    label,
    accentFrom,
    accentTo,
    dotColor = '#ffffff',
    style,
    ...props
  },
  ref,
) {
  const content = label ?? children ?? 'Book a demo';
  const extra = Tag === 'button' && !props.type ? { type: 'button' } : {};

  return (
    <Tag
      ref={ref}
      className={['am-btn', size === 'sm' && 'am-btn--sm', className].filter(Boolean).join(' ')}
      style={{
        ...(accentFrom && { '--am-from': accentFrom }),
        ...(accentTo && { '--am-to': accentTo }),
        ...style,
      }}
      {...extra}
      {...props}
    >
      <span className="am-label">{content}</span>
      <span className="am-tab" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <DoubleChevron key={i} index={i} dotColor={dotColor} />)}
      </span>
    </Tag>
  );
});

export default AntiMetalButton;
