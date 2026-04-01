import './HowItWorks.css'

const steps = [
  {
    num: '01',
    title: 'Deploy ShieldBlock',
    desc: 'Flash ShieldBlock onto a Raspberry Pi or configure your router to use our cloud DNS servers. One-time setup that takes under 5 minutes.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Connect Your Network',
    desc: 'Point your router\'s DNS to ShieldBlock. Every device on the network is now protected automatically, with no per-device configuration.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Customize Filters',
    desc: 'Choose from curated blocklists, add custom deny/allow rules, enable parental controls, or configure threat intelligence feeds.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="8" cy="6" r="2" fill="var(--bg-card)" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="16" cy="12" r="2" fill="var(--bg-card)" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="10" cy="18" r="2" fill="var(--bg-card)" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Browse Protected',
    desc: 'DNS queries to ad and tracking domains are silently blocked. Enjoy faster browsing, lower data usage, and complete privacy across all devices.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section className="howitworks" id="how-it-works">
      <div className="howitworks__inner">

        {/* Header */}
        <div className="howitworks__header">
          <div className="section-tag">How It Works</div>
          <h2 className="section-heading">Up and running in minutes</h2>
          <p className="section-sub">
            Whether you self-host on a Raspberry Pi or use our cloud DNS, setup is straightforward and fast.
          </p>
        </div>

        {/* Steps grid */}
        <div className="howitworks__grid">
          {steps.map((step) => (
            <div className="hiw-card" key={step.num}>
              <span className="hiw-card__num">{step.num}</span>
              <div className="hiw-card__icon">{step.icon}</div>
              <h3 className="hiw-card__title">{step.title}</h3>
              <p className="hiw-card__desc">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}