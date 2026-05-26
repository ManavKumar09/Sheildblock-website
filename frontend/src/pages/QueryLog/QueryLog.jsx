import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardTopBar from '../../components/DashboardTopBar/DashboardTopBar'
import '../UserDashboard/UserDashboard.css'
import './QueryLog.css'



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

export default function QueryLog() {
  const navigate = useNavigate()
  const [logFilter, setLogFilter] = useState('all')
  const [logSearch, setLogSearch] = useState('')
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      // Fetch 7 days of historical logs
      const res = await fetch('http://localhost:8000/api/dashboard/stats?days=7', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data && data.recent_logs) {
        setLogs(data.recent_logs)
      }
    } catch (err) {
      console.error("Error fetching logs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredEntries = logs.filter(entry => {
    const statusStr = entry.is_blocked ? 'blocked' : 'allowed'
    const matchesFilter = logFilter === 'all' || statusStr === logFilter
    
    const searchLower = logSearch.toLowerCase()
    const matchesSearch = logSearch === '' || entry.domain?.toLowerCase().includes(searchLower)
    
    return matchesFilter && matchesSearch
  })

  const totalQueries = logs.length
  const blockedCount = logs.filter(e => e.is_blocked).length
  const allowedCount = logs.filter(e => !e.is_blocked).length


  const handleNav = (id) => {
    if (id === 'overview') navigate('/dashboard')
    else if (id === 'querylog') { /* already here */ }
    else if (id === 'blocklists') navigate('/dashboard/blocklists')
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
              className={`udash__nav-item ${item.id === 'querylog' ? 'udash__nav-item--active' : ''}`}
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
        <DashboardTopBar />

        {/* Content */}
        <div className="udash__content">

          {/* Page header */}
          <div className="ql__header">
            <div>
              <h1 className="ql__title">Query Log</h1>
              <p className="ql__subtitle">Complete DNS query history with filtering and search.</p>
            </div>
            <div className="ql__header-actions">
              <button className="ql__action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Export
              </button>
              <button className="ql__action-btn" onClick={fetchLogs}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="ql__toolbar">
            <div className="ql__search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="ql__search-input"
                placeholder="Search domains or IPs..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>
            <div className="ql__filters">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ql__filter-icon">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {['all', 'blocked', 'allowed'].map(f => (
                <button
                  key={f}
                  className={`ql__filter-btn ${logFilter === f ? 'ql__filter-btn--active' : ''}`}
                  onClick={() => setLogFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="ql__stats">
            <div className="ql__stat">
              <span className="ql__stat-label">Total Queries</span>
              <span className="ql__stat-val">{totalQueries}</span>
            </div>
            <div className="ql__stat">
              <span className="ql__stat-label">Blocked</span>
              <span className="ql__stat-val">{blockedCount}</span>
            </div>
            <div className="ql__stat">
              <span className="ql__stat-label">Allowed</span>
              <span className="ql__stat-val">{allowedCount}</span>
            </div>
          </div>

          {/* Table */}
          <div className="ql__table-wrap">
            <table className="ql__table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Domain</th>
                  <th>Type</th>
                  <th>Client</th>
                  <th>Response</th>
                  <th>Status</th>
                  <th>Blocklist</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Loading historical logs...
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No queries found matching the criteria.
                    </td>
                  </tr>
                ) : filteredEntries.map((entry, i) => (
                  <tr key={i} className="ql__row">
                    <td>
                      <span className="ql__time">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                          <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                        {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </td>
                    <td><span className="ql__domain">{entry.domain}</span></td>
                    <td><span className="ql__type">{entry.record_type}</span></td>
                    <td><span className="ql__client">N/A</span></td>
                    <td><span className="ql__response">{Number(entry.response_time_ms).toFixed(1)}ms</span></td>
                    <td>
                      <span className={`ql__status ${entry.is_blocked ? 'ql__status--blocked' : 'ql__status--allowed'}`}>
                        {entry.is_blocked ? 'blocked' : 'allowed'}
                      </span>
                    </td>
                    <td><span className="ql__blocklist">{entry.blocklist_name || '-'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
