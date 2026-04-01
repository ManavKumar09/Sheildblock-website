import './Hero.css'

export default function Hero() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="hero" id="hero">
      <div className="hero__glow" />
      <div className="hero__inner">

        {/* Badge */}
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Network-level DNS filtering for every device
        </div>

        {/* Heading */}
        <h1 className="hero__heading">
          Block ads at the
          <br />
          <span className="hero__heading-accent">DNS level.</span>
        </h1>

        {/* Subtext */}
        <p className="hero__sub">
          ShieldBlock is a self-hosted and cloud-based DNS filtering system that
          blocks ads, trackers, and malware before they ever reach your
          devices. Protect your entire network with a single deployment.
        </p>

        {/* CTA Buttons */}
        <div className="hero__actions">
          <button className="hero__btn hero__btn--primary" onClick={() => scrollTo('#deployment')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Self-Host Setup
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="hero__btn hero__btn--secondary" onClick={() => scrollTo('#deployment')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Try Cloud DNS
          </button>
        </div>

        {/* Tags row */}
        <div className="hero__tags">
          <span className="hero__tag"><span className="hero__tag-dot" />DNS-over-HTTPS</span>
          <span className="hero__tag"><span className="hero__tag-dot" />DNS-over-TLS</span>
          <span className="hero__tag"><span className="hero__tag-dot" />Raspberry Pi Ready</span>
          <span className="hero__tag"><span className="hero__tag-dot" />DPDP Act Compliant</span>
        </div>

      </div>

      {/* Full-width stats bar */}
      <div className="hero__statsbar">
        <div className="hero__statsbar-inner">
          <div className="hero__statsbar-item">
            <span className="hero__statsbar-num">~30%</span>
            <span className="hero__statsbar-label">Less Data Usage</span>
          </div>
          <div className="hero__statsbar-divider" />
          <div className="hero__statsbar-item">
            <span className="hero__statsbar-num">49%</span>
            <span className="hero__statsbar-label">Faster Browsing</span>
          </div>
          <div className="hero__statsbar-divider" />
          <div className="hero__statsbar-item">
            <span className="hero__statsbar-num">10B+</span>
            <span className="hero__statsbar-label">Queries Processed</span>
          </div>
          <div className="hero__statsbar-divider" />
          <div className="hero__statsbar-item">
            <span className="hero__statsbar-num">100%</span>
            <span className="hero__statsbar-label">Open Source</span>
          </div>
        </div>
      </div>

    </section>
  )
}