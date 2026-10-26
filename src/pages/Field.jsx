// Form building blocks shared by the start-a-project and careers forms (styled in start.css).

export function Field({ label, hint, error, children }) {
  return (
    <label className={`sp-field ${error ? 'is-bad' : ''}`}>
      <span className="sp-label">
        {label}
        {hint && <span className="sp-hint">{hint}</span>}
      </span>
      {children}
      {error && <span className="sp-error">{error}</span>}
    </label>
  );
}

/** Chip rows are a group rather than a label, which wraps no one field. */
export function Group({ label, hint, error, children }) {
  return (
    <div className={`sp-field ${error ? 'is-bad' : ''}`} role="group" aria-label={label}>
      <span className="sp-label">
        {label}
        {hint && <span className="sp-hint">{hint}</span>}
      </span>
      <div className="sp-chips">{children}</div>
      {error && <span className="sp-error">{error}</span>}
    </div>
  );
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
