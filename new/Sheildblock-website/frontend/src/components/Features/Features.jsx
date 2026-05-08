import './Features.css'

const features = [
  {
    id: 1,
    tag: 'CORE',
    title: 'DNS Filtering',
    desc: 'Intercept domain resolution requests at the network level. Known advertising and tracking domains resolve to null, preventing connections before they start.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    size: 'large',
  },
  {
    id: 2,
    tag: 'PROTECTION',
    title: 'Script Blocking',
    desc: 'Block injected JavaScript ad scripts, analytics libraries, and tracking beacons before they execute in the browser.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    size: 'large',
  },
  {
    id: 3,
    tag: 'PRIVACY',
    title: 'Anti-Tracking',
    desc: 'Stop cross-site tracking mechanisms including cookie matching, pixel tracking, and fingerprinting scripts that profile your behavior across the web.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    size: 'medium',
  },
  {
    id: 4,
    tag: 'SECURITY',
    title: 'Malware Protection',
    desc: 'Use real-time threat intelligence feeds to block malicious domains, phishing attempts, and cryptojacking scripts before they reach your network.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
      </svg>
    ),
    size: 'medium',
  },
  {
    id: 5,
    tag: 'NETWORK',
    title: 'Network-Wide Coverage',
    desc: 'Protect every device on your network with a single deployment. No per-device installs needed for phones, tablets, IoT devices, and smart TVs.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 3a9 9 0 0 1 0 18M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9M12 3C9.5 5.5 8 9 8 12s1.5 6.5 4 9" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    size: 'small',
  },
  {
    id: 6,
    tag: 'LEGAL',
    title: 'Privacy Compliance',
    desc: "Designed with India's DPDP Act 2023 and IT Act 2000 in mind. User-controlled filtering is legally defensible under current privacy regulations.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 13s1 2 5 2 5-2 5-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    size: 'small',
  },
  {
    id: 7,
    tag: 'HARDWARE',
    title: 'Self-Hosted Control',
    desc: 'Deploy on your own Raspberry Pi for complete data sovereignty. Your DNS queries never leave your network.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    ),
    size: 'small',
  },
  {
    id: 8,
    tag: 'INSIGHTS',
    title: 'Real-Time Analytics',
    desc: 'Monitor blocked queries, top domains, and network performance with an in-depth analytics dashboard. See what is tracked and blocked in real time.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    size: 'solo',
  },
]

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features__inner">

        {/* Header */}
        <div className="features__header">
          <div className="section-tag">Features</div>
          <h2 className="section-heading">Complete network protection</h2>
          <p className="section-sub">
            ShieldBlock combines DNS-level filtering, script blocking, and real-time threat
            intelligence to protect your entire network from a single node.
          </p>
        </div>

        {/* Row 1 — 2 large cards */}
        <div className="features__row features__row--2col">
          {features.filter(f => f.size === 'large').map(f => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>

        {/* Row 2 — 2 medium cards */}
        <div className="features__row features__row--2col">
          {features.filter(f => f.size === 'medium').map(f => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>

        {/* Row 3 — 3 small cards */}
        <div className="features__row features__row--3col">
          {features.filter(f => f.size === 'small').map(f => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>

        {/* Row 4 — 1 solo card */}
        <div className="features__row features__row--solo">
          {features.filter(f => f.size === 'solo').map(f => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>

      </div>
    </section>
  )
}

function FeatureCard({ feature }) {
  return (
    <div className="feature-card">
      <div className="feature-card__top">
        <div className="feature-card__icon">{feature.icon}</div>
        <span className="feature-card__tag">{feature.tag}</span>
      </div>
      <h3 className="feature-card__title">{feature.title}</h3>
      <p className="feature-card__desc">{feature.desc}</p>
    </div>
  )
}