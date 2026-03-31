import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../UserDashboard/UserDashboard.css'
import './Blocklists.css'

const blocklistData = [
  { id: 1, name: 'EasyList',           category: 'Ads',      domains: 78453,  updated: '2 hours ago',  enabled: true },
  { id: 2, name: 'EasyPrivacy',        category: 'Trackers', domains: 45231,  updated: '2 hours ago',  enabled: true },
  { id: 3, name: 'AdGuard DNS filter', category: 'Ads',      domains: 62890,  updated: '4 hours ago',  enabled: true },
  { id: 4, name: 'URLhaus Malware',    category: 'Malware',  domains: 12340,  updated: '1 hour ago',   enabled: true },
  { id: 5, name: 'PhishTank',          category: 'Phishing', domains: 8920,   updated: '3 hours ago',  enabled: true },
  { id: 6, name: 'Fanboy Tracking',    category: 'Trackers', domains: 34560,  updated: '6 hours ago',  enabled: false },
  { id: 7, name: 'Fanboy Social',      category: 'Social',   domains: 21340,  updated: '6 hours ago',  enabled: false },
  { id: 8, name: 'OISD Full',          category: 'Multi',    domains: 189000, updated: '1 hour ago',   enabled: false },
  { id: 9, name: 'Steven Black Hosts', category: 'Ads',      domains: 95230,  updated: '12 hours ago', enabled: false },
]

const categories = ['All', 'Ads', 'Trackers', 'Malware', 'Phishing', 'Social', 'Multi']

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

export default function Blocklists() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const [lists, setLists] = useState(blocklistData)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListUrl, setNewListUrl] = useState('')

  const filteredLists = activeCategory === 'All'
    ? lists
    : lists.filter(l => l.category === activeCategory)

  const activeCount = lists.filter(l => l.enabled).length
  const totalDomains = lists.filter(l => l.enabled).reduce((sum, l) => sum + l.domains, 0)

  const toggleList = (id) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l))
  }

  const handleAddList = () => {
    if (!newListName.trim() || !newListUrl.trim()) return
    const newList = {
      id: Date.now(),
      name: newListName.trim(),
      category: 'Multi',
      domains: 0,
      updated: 'just now',
      enabled: true,
      url: newListUrl.trim(),
    }
    setLists(prev => [newList, ...prev])
    setNewListName('')
    setNewListUrl('')
    setShowAddForm(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleNav = (id) => {
    if (id === 'overview') navigate('/dashboard')
    else if (id === 'querylog') navigate('/dashboard/queries')
    else if (id === 'blocklists') { /* already here */ }
    else if (id === 'allowlist') navigate('/dashboard/allowlist')
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
              className={`udash__nav-item ${item.id === 'blocklists' ? 'udash__nav-item--active' : ''}`}
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
          <div className="bl__header">
            <div>
              <h1 className="bl__title">Blocklists</h1>
              <p className="bl__subtitle">
                Manage your DNS blocklist subscriptions. {activeCount} active, {totalDomains.toLocaleString()} domains.
              </p>
            </div>
            <div className="bl__header-actions">
              <button className="bl__action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Update All
              </button>
              <button className="bl__action-btn bl__action-btn--primary" onClick={() => setShowAddForm(!showAddForm)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add List
              </button>
            </div>
          </div>

          {/* Add Custom Blocklist Form */}
          {showAddForm && (
            <div className="bl__add-form">
              <h3 className="bl__add-form-title">Add custom blocklist</h3>
              <div className="bl__add-form-row">
                <input
                  type="text"
                  className="bl__add-form-input bl__add-form-input--name"
                  placeholder="List name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
                <input
                  type="text"
                  className="bl__add-form-input bl__add-form-input--url"
                  placeholder="https://raw.githubusercontent.com/..."
                  value={newListUrl}
                  onChange={(e) => setNewListUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                />
                <button className="bl__add-form-submit" onClick={handleAddList}>Add</button>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="bl__tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`bl__tab ${activeCategory === cat ? 'bl__tab--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blocklist Items */}
          <div className="bl__list">
            {filteredLists.map(list => (
              <div key={list.id} className={`bl__item ${list.enabled ? 'bl__item--enabled' : ''}`}>
                <button
                  className={`bl__toggle ${list.enabled ? 'bl__toggle--on' : ''}`}
                  onClick={() => toggleList(list.id)}
                  aria-label={`Toggle ${list.name}`}
                >
                  <span className="bl__toggle-knob" />
                </button>

                <div className="bl__item-info">
                  <div className="bl__item-name-row">
                    <span className="bl__item-name">{list.name}</span>
                    <span className={`bl__item-cat bl__item-cat--${list.category.toLowerCase()}`}>
                      {list.category}
                    </span>
                  </div>
                  <span className="bl__item-meta">
                    {list.domains.toLocaleString()} domains &nbsp;&middot;&nbsp; Updated {list.updated}
                  </span>
                </div>

                <button className="bl__item-link" aria-label="Open external link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
