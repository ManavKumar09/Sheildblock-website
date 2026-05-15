import './Pricing.css'

const plans = [
  {
    name: 'Self-Hosted',
    price: 'Free',
    period: '/forever',
    desc: 'Deploy on your own Raspberry Pi. Full DNS filtering with complete data sovereignty.',
    features: [
      'Unlimited DNS queries',
      'All blocklist subscriptions',
      'Real-time query logging',
      'Custom deny/allow lists',
      'Covers all LAN devices',
      'Community support',
    ],
    btn: 'Download Image',
    btnStyle: 'ghost',
    recommended: false,
  },
  {
    name: 'Cloud Pro',
    price: '$3',
    period: '/per month',
    desc: 'Managed cloud DNS for users who cannot self-host. Same powerful filtering engine.',
    features: [
      'Everything in Self-Hosted',
      'Global Anycast DNS network',
      'DNS-over-HTTPS / TLS',
      'Up to 10 device profiles',
      'Mobile network protection',
      'Analytics dashboard',
      'Priority support',
    ],
    btn: 'Start Free Trial',
    btnStyle: 'primary',
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '/per org',
    desc: 'Network-wide deployment for offices and institutions with centralized management.',
    features: [
      'Everything in Cloud Pro',
      'Unlimited device profiles',
      'Centralized admin panel',
      'SIEM log streaming',
      'Custom threat feeds',
      'SSO integration',
      'Dedicated support',
      'SLA guarantee',
    ],
    btn: 'Contact Sales',
    btnStyle: 'ghost',
    recommended: false,
  },
]

export default function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="pricing__inner">

        {/* Header */}
        <div className="pricing__header">
          <div className="section-tag">Pricing</div>
          <h2 className="section-heading">
            Self-host free.<br />Cloud from $3/mo.
          </h2>
          <p className="section-sub">
            The self-hosted version is completely free and open source. Cloud DNS adds managed
            infrastructure with global reach.
          </p>
        </div>

        {/* Cards */}
        <div className="pricing__grid">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`price-card ${plan.recommended ? 'price-card--recommended' : ''}`}
            >
              {plan.recommended && (
                <div className="price-card__badge">Recommended</div>
              )}

              <div className="price-card__top">
                <p className="price-card__name">{plan.name}</p>
                <div className="price-card__price">
                  <span className="price-card__amount">{plan.price}</span>
                  <span className="price-card__period">{plan.period}</span>
                </div>
                <p className="price-card__desc">{plan.desc}</p>
              </div>

              <ul className="price-card__features">
                {plan.features.map((f, j) => (
                  <li key={j} className="price-feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`price-card__btn price-card__btn--${plan.btnStyle}`}>
                {plan.btn}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}