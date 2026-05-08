import { useState, useEffect } from 'react'
import './Navbar.css'
import { useNavigate } from 'react-router-dom'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Deployment', href: '#deployment' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">

        {/* Logo */}
        <a href="#" className="navbar__logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <div className="navbar__logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" fill="var(--green)" />
              <path d="M9 12l2 2 4-4" stroke="#080c0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="navbar__logo-text"><span>Shield</span>Block</span>
        </a>

        {/* Center nav links */}
        <nav className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`}>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="navbar__link"
              onClick={(e) => handleNavClick(e, link.href)}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="navbar__actions">
          <a href="#" className="navbar__docs">Documentation</a>
          <button className="navbar__cta" onClick={() => navigate('/signup')}>Get Started</button>
        </div>

        {/* Mobile hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>

      </div>
    </header>
  )
}