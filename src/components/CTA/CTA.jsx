import './CTA.css'

export default function CTA() {
  const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="cta">
      <div className="cta__inner">

        {/* Icon */}
        <div className="cta__icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" fill="white" fillOpacity="0.9"/>
            <path d="M9 12l2 2 4-4" stroke="#00c853" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Heading */}
        <h2 className="cta__heading">Take back control of your network</h2>

        {/* Sub */}
        <p className="cta__sub">
          Privacy and performance can coexist. Deploy ShieldBlock on your
          Raspberry Pi or use our cloud DNS to protect every device on your network.
        </p>

        {/* Buttons */}
        <div className="cta__actions">
          <button className="cta__btn cta__btn--primary" onClick={() => scrollTo('#deployment')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            Deploy Self-Hosted
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="cta__btn cta__btn--secondary" onClick={() => scrollTo('#deployment')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 10a6 6 0 1 0-11.8 1.5A5 5 0 1 0 7 21h11a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            Try Cloud DNS Free
          </button>
        </div>

      </div>
    </section>
  )
}