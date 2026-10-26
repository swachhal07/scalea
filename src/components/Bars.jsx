// Six columns that rise in sequence behind a .p-cta label on hover (styled in prime.css).
export default function Bars() {
  return (
    <span className="p-cta-bars" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => <i key={i} style={{ '--i': i }} />)}
    </span>
  );
}
