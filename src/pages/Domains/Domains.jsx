import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../UserDashboard/UserDashboard.css'
import './Domains.css'

const domainsData = [
  { id: 1,  domain: 'amazon.com',              lastSeen: '25m ago', queries: 4996, blocked: 0,    status: 'allowed' },
  { id: 2,  domain: 'hubspot.com',             lastSeen: '8m ago',  queries: 4853, blocked: 0,    status: 'allowed' },
  { id: 3,  domain: 'firebase.googleapis.com', lastSeen: '39m ago', queries: 4477, blocked: 0,    status: 'allowed' },
  { id: 4,  domain: 'facebook.com',            lastSeen: '15m ago', queries: 4451, blocked: 0,    status: 'allowed' },
  { id: 5,  domain: 'intercom.io',             lastSeen: '38m ago', queries: 4371, blocked: 0,    status: 'allowed' },
  { id: 6,  domain: 'ads.google.com',          lastSeen: '2m ago',  queries: 4102, blocked: 4102, status: 'blocked' },
  { id: 7,  domain: 'google-analytics.com',    lastSeen: '5m ago',  queries: 3890, blocked: 3890, status: 'blocked' },
  { id: 8,  domain: 'cloudflare.com',          lastSeen: '12m ago', queries: 3654, blocked: 0,    status: 'allowed' },
  { id: 9,  domain: 'doubleclick.net',         lastSeen: '3m ago',  queries: 3420, blocked: 3420, status: 'blocked' },
  { id: 10, domain: 'github.com',              lastSeen: '1m ago',  queries: 3215, blocked: 0,    status: 'allowed' },
  { id: 11, domain: 'tracking.facebook.com',   lastSeen: '7m ago',  queries: 2980, blocked: 2980, status: 'blocked' },
  { id: 12, domain: 'cdn.jsdelivr.net',        lastSeen: '22m ago', queries: 2750, blocked: 0,    status: 'allowed' },
  { id: 13, domain: 'pixel.adsafeprotected.com',lastSeen: '11m ago',queries: 2540, blocked: 2540, status: 'blocked' },
  { id: 14, domain: 'fonts.googleapis.com',    lastSeen: '4m ago',  queries: 2320, blocked: 0,    status: 'allowed' },
  { id: 15, domain: 'analytics.tiktok.com',    lastSeen: '18m ago', queries: 2100, blocked: 2100, status: 'blocked' },
]

const navItems = [
  { id: 'overview',   label: 'Overview',   icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )},
  { id: 'querylog',   label: 'Query Log',  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'blocklists', label: 'Blocklists', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'allowlist',  label: 'Allowlist',  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'domains',    label: 'Domains',    icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 3a9 9 0 0 1 0 18M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
  { id: 'settings',   label: 'Settings',   icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
]

export default function Domains() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('queries')

  const filtered = domainsData
    .filter(d => {
      const matchSearch = d.domain.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || d.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => sortBy === 'queries' ? b.queries - a.queries : b.blocked - a.blocked)

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleNav = (id) => {
    if (id === 'overview') navigate('/dashboard')
    else if (id === 'querylog') navigate('/dashboard/queries')
    else if (id === 'blocklists') navigate('/dashboard/blocklists')
    else if (id === 'allowlist') navigate('/dashboard/allowlist')
    else if (id === 'domains') { /* already here */ }
    else if (id === 'settings') navigate('/dashboard/settings')
  }

  return (
    <div className="udash">

      {/* ── Sidebar ── */}
      <aside className="udash__sidebar">
        <div className="udash__sidebar-logo" onClick={() => navigate('/')}>
          <div className="udash__sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" fill="var(--green)"/>
              <path d="M9 12l2 2 4-4" stroke="#080c0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="udash__sidebar-logo-text"><span>Shield</span>Block</span>
        </div>

        <nav className="udash__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`udash__nav-item ${item.id === 'domains' ? 'udash__nav-item--active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="udash__main">

        {/* Top bar */}
        <header className="udash__topbar">
          <div className="udash__status">
            <span className="udash__status-dot" />
            Filtering active
          </div>
          <div className="udash__topbar-right">
            <button className="udash__icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="udash__icon-btn" onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="udash__content">

          {/* Page header */}
          <div className="dm__page-header">
            <h1 className="dm__title">Domains</h1>
            <p className="dm__subtitle">All domains queried through your ShieldBlock instance, sorted by activity.</p>
          </div>

          {/* Search + Filters + Sort */}
          <div className="dm__toolbar">
            <div className="dm__search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="dm__search-input"
                placeholder="Search domains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="dm__filters">
              {['all', 'blocked', 'allowed'].map(f => (
                <button
                  key={f}
                  className={`dm__filter-btn ${statusFilter === f ? 'dm__filter-btn--active' : ''}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}

              <span className="dm__sort-divider" />

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="dm__sort-icon">
                <path d="M11 5h10M11 9h7M11 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M3 4v16M3 20l3-3M3 20l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              {['queries', 'blocked'].map(s => (
                <button
                  key={s}
                  className={`dm__sort-btn ${sortBy === s ? 'dm__sort-btn--active' : ''}`}
                  onClick={() => setSortBy(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Domain list */}
          <div className="dm__list">
            {filtered.map(d => (
              <div key={d.id} className="dm__item">
                <div className="dm__item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>

                <div className="dm__item-info">
                  <span className="dm__item-domain">{d.domain}</span>
                  <span className="dm__item-meta">Last seen {d.lastSeen}</span>
                </div>

                <div className="dm__item-right">
                  <div className="dm__item-count">
                    <span className="dm__item-count-val">{d.queries.toLocaleString()}</span>
                    <span className="dm__item-count-label">queries</span>
                  </div>
                  <span className={`dm__item-status ${d.status === 'blocked' ? 'dm__item-status--blocked' : 'dm__item-status--allowed'}`}>
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="dm__empty">No domains found.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
