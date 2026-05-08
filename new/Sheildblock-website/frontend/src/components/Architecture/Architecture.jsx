import './Architecture.css'

const withoutItems = [
  'High third-party domain connections',
  '18-79% of mobile data consumed by ads',
  'Visual clutter and slow page rendering',
  'Continuous behavioral profiling',
  'Cross-site tracking via cookie matching',
]

const withItems = [
  'Reduced HTTP requests by 30-40%',
  'Significant bandwidth savings',
  'Clean interface, faster page loads',
  'Tracking exposure eliminated',
  'Complete DNS-level privacy control',
]

export default function Architecture() {
  return (
    <section className="architecture" id="architecture">
      <div className="architecture__inner">

        {/* Header */}
        <div className="architecture__header">
          <div className="section-tag">Architecture</div>
          <h2 className="section-heading">How DNS filtering works</h2>
          <p className="section-sub">
            ShieldBlock sits between your devices and the internet, filtering DNS
            queries at the network level before any connection is established.
          </p>
        </div>

        {/* Flow */}
        <div className="arch-flow">

          {/* Box 1 — Your Devices */}
          <div className="arch-box arch-box--neutral">
            <h3 className="arch-box__title">Your Devices</h3>
            <p className="arch-box__sub">All connected devices on your network</p>
            <div className="arch-box__icons">
              <div className="arch-icon">
                <div className="arch-icon__wrap arch-icon__wrap--neutral">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="7" y="2" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="12" cy="17" r="0.8" fill="currentColor"/>
                  </svg>
                </div>
                <span>Phones</span>
              </div>
              <div className="arch-icon">
                <div className="arch-icon__wrap arch-icon__wrap--neutral">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Laptops</span>
              </div>
              <div className="arch-icon">
                <div className="arch-icon__wrap arch-icon__wrap--neutral">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </div>
                <span>Smart TVs</span>
              </div>
              <div className="arch-icon">
                <div className="arch-icon__wrap arch-icon__wrap--neutral">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="12" cy="20" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <span>IoT</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="arch-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M6 13l6 6 6-6" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Box 2 — ShieldBlock DNS */}
          <div className="arch-box arch-box--green">
            <h3 className="arch-box__title arch-box__title--green">ShieldBlock DNS</h3>
            <p className="arch-box__sub">Intercepts and filters DNS queries</p>
            <div className="arch-box__icons">
              <div className="arch-icon">
                <div className="arch-icon__wrap arch-icon__wrap--green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>DNS Filter</span>
              </div>
              <div className="arch-icon">
                <div className="arch-icon__wrap arch-icon__wrap--green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="12" y1="12" x2="15" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M9 3.5a9 9 0 0 0 0 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Blocklists</span>
              </div>
              <div className="arch-icon">
                <div className="arch-icon__wrap arch-icon__wrap--green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <span>Rule Engine</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="arch-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M6 13l6 6 6-6" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Box 3 — Internet */}
          <div className="arch-box arch-box--neutral">
            <h3 className="arch-box__title">Internet</h3>
            <p className="arch-box__sub">Only clean traffic reaches the web</p>
            <div className="arch-box__icons">
              <div className="arch-icon">
                <div className="arch-icon__wrap arch-icon__wrap--neutral">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 3a9 9 0 0 1 0 18M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9M12 3C9.5 5.5 8 9 8 12s1.5 6.5 4 9" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </div>
                <span>Clean DNS</span>
              </div>
            </div>
          </div>

        </div>

        {/* With vs Without */}
        <div className="arch-compare">
          <h3 className="arch-compare__heading">With vs Without ShieldBlock</h3>
          <div className="arch-compare__grid">

            {/* Without */}
            <div className="compare-card compare-card--bad">
              <h4 className="compare-card__title compare-card__title--bad">Without ShieldBlock</h4>
              <ul className="compare-card__list">
                {withoutItems.map((item, i) => (
                  <li key={i} className="compare-item compare-item--bad">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* With */}
            <div className="compare-card compare-card--good">
              <h4 className="compare-card__title compare-card__title--good">With ShieldBlock</h4>
              <ul className="compare-card__list">
                {withItems.map((item, i) => (
                  <li key={i} className="compare-item compare-item--good">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}