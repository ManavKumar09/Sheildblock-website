import './Footer.css'

const links = {
  Product: ['Self-Hosted', 'Cloud DNS', 'Pricing', 'Changelog', 'Raspberry Pi Guide'],
  Resources: ['Documentation', 'Blocklists', 'API Reference', 'Research Paper', 'Community'],
  Legal: ['Privacy Policy', 'Terms of Service', 'DPDP Compliance', 'IT Act Compliance', 'Contact'],
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Top row */}
        <div className="footer__top">

          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" fill="var(--green)"/>
                  <path d="M9 12l2 2 4-4" stroke="#080c0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="footer__logo-text"><span>Shield</span>Block</span>
            </div>
            <p className="footer__brand-desc">
              Self-hosted and cloud-based DNS filtering for privacy, performance, and security
              across every device on your network.
            </p>
          </div>

          {/* Link columns */}
          <div className="footer__links">
            {Object.entries(links).map(([category, items]) => (
              <div className="footer__col" key={category}>
                <h4 className="footer__col-title">{category}</h4>
                <ul className="footer__col-list">
                  {items.map((item) => (
                    <li key={item}>
                      <a href="#" className="footer__link">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Divider */}
        <div className="footer__divider" />

        {/* Bottom row */}
        <div className="footer__bottom">
          <p className="footer__copy">2026 ShieldBlock. Open source and privacy-first.</p>
          <p className="footer__credit">
            A project by Manthan Deshpande, Kaustubh Awasthi, and Aditi Agrawal
          </p>
        </div>

      </div>
    </footer>
  )
}