import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../UserDashboard/UserDashboard.css'
import './Allowlist.css'

const initialEntries = [
  { id: 1, domain: 's.youtube.com',       reason: 'YouTube history sync',     added: '2 days ago' },
  { id: 2, domain: 'cdn.onesignal.com',   reason: 'Push notifications',      added: '5 days ago' },
  { id: 3, domain: 'graph.facebook.com',  reason: 'Facebook login',          added: '1 week ago' },
  { id: 4, domain: 'api.amplitude.com',   reason: 'Analytics dashboard',     added: '1 week ago' },
  { id: 5, domain: 'slack-imgs.com',      reason: 'Slack image previews',    added: '2 weeks ago' },
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

export default function Allowlist() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState(initialEntries)
  const [newDomain, setNewDomain] = useState('')
  const [newReason, setNewReason] = useState('')
  const [search, setSearch] = useState('')

  const filteredEntries = entries.filter(e =>
    e.domain.toLowerCase().includes(search.toLowerCase()) ||
    e.reason.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = () => {
    if (!newDomain.trim()) return
    const entry = {
      id: Date.now(),
      domain: newDomain.trim(),
      reason: newReason.trim() || '',
      added: 'just now',
    }
    setEntries(prev => [entry, ...prev])
    setNewDomain('')
    setNewReason('')
  }

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleNav = (id) => {
    if (id === 'overview') navigate('/dashboard')
    else if (id === 'querylog') navigate('/dashboard/queries')
    else if (id === 'blocklists') navigate('/dashboard/blocklists')
    else if (id === 'allowlist') { /* already here */ }
    else if (id === 'domains') navigate('/dashboard/domains')
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
              className={`udash__nav-item ${item.id === 'allowlist' ? 'udash__nav-item--active' : ''}`}
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
          <div className="al__page-header">
            <h1 className="al__title">Allowlist</h1>
            <p className="al__subtitle">
              Domains on this list will never be blocked, even if they appear in a blocklist. {entries.length} entries.
            </p>
          </div>

          {/* Add domain form */}
          <div className="al__add-form">
            <h3 className="al__add-form-title">Add domain to allowlist</h3>
            <div className="al__add-form-row">
              <input
                type="text"
                className="al__add-form-input al__add-form-input--domain"
                placeholder="domain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <input
                type="text"
                className="al__add-form-input al__add-form-input--reason"
                placeholder="Reason (optional)"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button className="al__add-form-submit" onClick={handleAdd}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Add
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="al__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="al__search-input"
              placeholder="Search allowlist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Domain list */}
          <div className="al__list">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="al__item">
                <div className="al__item-info">
                  <span className="al__item-domain">{entry.domain}</span>
                  <span className="al__item-meta">
                    {entry.reason && <>{entry.reason} &nbsp;&middot;&nbsp; </>}Added {entry.added}
                  </span>
                </div>
                <button className="al__item-delete" onClick={() => handleDelete(entry.id)} aria-label={`Remove ${entry.domain}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="al__empty">No entries found.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
