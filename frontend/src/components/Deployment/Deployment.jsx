import { useState } from 'react'
import './Deployment.css'

const selfHostedFeatures = [
  {
    label: 'Runs on Raspberry Pi 3/4/5',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="17" cy="12" r="1.5" fill="currentColor"/></svg>,
  },
  {
    label: 'Complete data sovereignty',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>,
  },
  {
    label: 'Sub-millisecond DNS resolution',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  },
  {
    label: 'Covers all LAN devices',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3 21v-2a6 6 0 0 1 6-6h.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="17" cy="15" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M21 21v-1a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
]

const cloudFeatures = [
  {
    label: 'Global Anycast DNS network',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 3a9 9 0 0 1 0 18M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Works on cellular networks',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="7" y="2" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>,
  },
  {
    label: 'DNS-over-HTTPS and TLS',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  },
  {
    label: 'Per-device profiles',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3 21v-2a6 6 0 0 1 6-6h.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="17" cy="15" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M21 21v-1a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
]

export default function Deployment() {
  const [active, setActive] = useState('self')

  return (
    <section className="deployment" id="deployment">
      <div className="deployment__inner">

        {/* Header */}
        <div className="deployment__header">
          <div className="section-tag">Deployment</div>
          <h2 className="section-heading">Choose your deployment</h2>
          <p className="section-sub">
            Self-host on a Raspberry Pi for maximum privacy, or use our cloud DNS for convenience.
            Both use the same powerful filtering engine.
          </p>
        </div>

        {/* Toggle tabs */}
        <div className="deployment__tabs">
          <button
            className={`dep-tab ${active === 'self' ? 'dep-tab--active' : ''}`}
            onClick={() => setActive('self')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            Self-Hosted
          </button>
          <button
            className={`dep-tab ${active === 'cloud' ? 'dep-tab--active' : ''}`}
            onClick={() => setActive('cloud')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 10a6 6 0 1 0-11.8 1.5A5 5 0 1 0 7 21h11a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            Cloud DNS
          </button>
        </div>

        {/* Cards */}
        <div className="deployment__cards">

          {/* Self-Hosted Card */}
          <div className={`dep-card ${active === 'self' ? 'dep-card--active' : 'dep-card--dim'}`}>
            <div className="dep-card__header">
              <div className="dep-card__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h3 className="dep-card__title">Self-Hosted</h3>
                <p className="dep-card__subtitle">Raspberry Pi Deployment</p>
              </div>
            </div>
            <p className="dep-card__desc">
              Deploy on your own hardware for complete data sovereignty. Your DNS queries
              never leave your local network. Ideal for privacy enthusiasts and home labs.
            </p>
            <div className="dep-card__tags">
              <span className="dep-tag">Open Source</span>
              <span className="dep-tag">Self-Hosted</span>
              <span className="dep-tag">Zero Cloud</span>
            </div>
            <ul className="dep-card__features">
              {selfHostedFeatures.map((f, i) => (
                <li key={i} className="dep-feature">
                  <span className="dep-feature__icon">{f.icon}</span>
                  {f.label}
                </li>
              ))}
            </ul>
            <button className="dep-card__btn dep-card__btn--primary">
              Download Image
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Cloud DNS Card */}
          <div className={`dep-card ${active === 'cloud' ? 'dep-card--active' : 'dep-card--dim'}`}>
            <div className="dep-card__header">
              <div className="dep-card__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M18 10a6 6 0 1 0-11.8 1.5A5 5 0 1 0 7 21h11a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="dep-card__title">Cloud DNS</h3>
                <p className="dep-card__subtitle">Managed Filtering Service</p>
              </div>
            </div>
            <p className="dep-card__desc">
              For users who cannot deploy hardware. Use our global DNS infrastructure with
              the same filtering rules. Works on mobile networks and while traveling.
            </p>
            <div className="dep-card__tags">
              <span className="dep-tag">Managed</span>
              <span className="dep-tag">Global</span>
              <span className="dep-tag">Mobile Ready</span>
            </div>
            <ul className="dep-card__features">
              {cloudFeatures.map((f, i) => (
                <li key={i} className="dep-feature">
                  <span className="dep-feature__icon">{f.icon}</span>
                  {f.label}
                </li>
              ))}
            </ul>
            <button className="dep-card__btn dep-card__btn--ghost">
              Try Cloud Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}