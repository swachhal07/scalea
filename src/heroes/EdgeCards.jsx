// Service cards for the hero's edges (Suprema-style). Each one names a service and shows it working.

function I({ d }) {
  return <svg viewBox="0 0 16 16" className="ec-i" aria-hidden="true"><path d={d} /></svg>;
}

const ICONS = {
  web: 'M2 3.5h12v9H2zM2 6.5h12M4 5h.1M5.6 5h.1',
  mobile: 'M5 1.5h6v13H5zM7.3 12.5h1.4',
  ux: 'M4 2.5l8 5-3.6 1-1.6 3.6z',
  audit: 'M8 2.5a5.5 5.5 0 1 0 5.5 5.5M8 8l3.5-3.5',
  seo: 'M7 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm3.3 7.8 3.2 3.2',
  ads: 'M2.5 6v4h2.5l5 3V3L5 6zM12 6.5a2 2 0 0 1 0 3',
  geo: 'M8 1.5 9.5 6.5 14.5 8 9.5 9.5 8 14.5 6.5 9.5 1.5 8 6.5 6.5Z',
  growth: 'M2.5 12.5 6.5 8.5l2.5 2.5 4.5-6m0 0v3m0-3h-3',
};

function Tag({ icon, children }) {
  return <span className="ec-tag"><I d={ICONS[icon]} />{children}</span>;
}

export function WebCard() {
  return (
    <div className="ec ec-web">
      <Tag icon="web">Web Development</Tag>
      <div className="ec-browser">
        <div className="ec-bbar"><i /><i /><i /><span>northwind.app</span></div>
        <div className="ec-bbody">
          <b>Plan, ship and scale from one workspace.</b>
          <span className="ec-line-s" /><span className="ec-line-s short" />
          <div className="ec-bbtns"><span /><span /></div>
        </div>
      </div>
      <div className="ec-foot"><span><i className="ec-dot" />Deployed</span><small>0.8s load</small></div>
    </div>
  );
}

export function MobileCard() {
  return (
    <div className="ec ec-mobile">
      <Tag icon="mobile">Mobile Apps</Tag>
      <div className="ec-app">
        <div className="ec-appicon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="14" width="5" height="8" rx="1.2" opacity="0.4" /><rect x="9.5" y="8" width="5" height="14" rx="1.2" opacity="0.7" /><rect x="17" y="2" width="5" height="20" rx="1.2" /></svg></div>
        <div><b>Northwind</b><small>iOS · Android</small></div>
      </div>
      <div className="ec-stars">★★★★★ <span>4.8 · 1,240 reviews</span></div>
      <div className="ec-foot"><span><i className="ec-dot" />v2.4 approved</span></div>
    </div>
  );
}

export function UXCard() {
  return (
    <div className="ec ec-ux">
      <Tag icon="ux">UX Testing</Tag>
      <div className="ec-heat"><i className="h a" /><i className="h b" /><i className="h c" /><span className="ec-cursor" /></div>
      <div className="ec-stat"><small>Task success</small><div className="ec-bar"><i style={{ width: '92%' }} /></div><b>92%</b></div>
    </div>
  );
}

function Gauge({ value, label }) {
  return (
    <div className="ec-gauge" style={{ '--p': `${value * 0.75}%` }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" pathLength="100" className="g-bg" />
        <circle cx="50" cy="50" r="40" pathLength="100" className="g-fg" />
      </svg>
      <b>{value}%</b>
      <small>{label}</small>
    </div>
  );
}

export function AuditCard() {
  return (
    <div className="ec ec-audit">
      <Tag icon="audit">Performance & SEO Audit</Tag>
      <div className="ec-gauges">
        <Gauge value={98} label="Performance" />
        <Gauge value={100} label="SEO" />
      </div>
    </div>
  );
}

export function SeoCard() {
  return (
    <div className="ec ec-seo">
      <Tag icon="seo">SEO</Tag>
      <div className="ec-search"><I d={ICONS.seo} />project planning software</div>
      <div className="ec-result">
        <span className="ec-rank">#1</span>
        <div><small>northwind.app</small><b>Plan, ship and scale</b></div>
        <em>↑4</em>
      </div>
    </div>
  );
}

export function AdsCard() {
  const bars = [30, 42, 38, 55, 62, 74, 90];
  return (
    <div className="ec ec-ads">
      <Tag icon="ads">Paid Ads</Tag>
      <div className="ec-kv"><div><small>ROAS</small><b>4.8×</b></div><div><small>CPA</small><b>$18</b></div></div>
      <div className="ec-bars">{bars.map((h, i) => <i key={i} style={{ height: `${h}%` }} className={i === bars.length - 1 ? 'on' : ''} />)}</div>
    </div>
  );
}

export function GeoCard() {
  return (
    <div className="ec ec-geo">
      <Tag icon="geo">AI & GEO</Tag>
      <p className="ec-q">“Best tool for fast-growing product teams?”</p>
      <div className="ec-cites"><span className="on">northwind.app</span><span /><span /></div>
      <small>Cited in 4 of 5 AI engines</small>
    </div>
  );
}

export function ChartCard() {
  const data = [22, 26, 24, 34, 31, 42, 48, 45, 58, 66, 72, 88, 94];
  const W = 300;
  const H = 110;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - (v / 100) * H]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <div className="ec ec-chart">
      <header><Tag icon="growth">Growth Analytics</Tag><span className="ec-chip">+312%</span></header>
      <div className="ec-kv"><div><small>Revenue</small><b>$4.82M</b></div><div><small>Users</small><b>186k</b></div><div><small>Conversion</small><b>6.4%</b></div></div>
      <div className="ec-plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {[0, 0.5, 1].map((f) => <line key={f} x1="0" x2={W} y1={f * H} y2={f * H} />)}
          <path d={`${line} L${W},${H} L0,${H} Z`} className="ec-area" />
          <path d={line} className="ec-line" />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.2" />
        </svg>
      </div>
    </div>
  );
}
