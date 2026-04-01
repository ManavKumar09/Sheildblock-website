import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../UserDashboard/UserDashboard.css'
import './Settings.css'

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

export default function Settings() {
  const navigate = useNavigate()

  const [dnsFiltering, setDnsFiltering] = useState(true)
  const [dnssec, setDnssec] = useState(true)
  const [rateLimiting, setRateLimiting] = useState(true)
  const [blockingMode, setBlockingMode] = useState('null')
  const [queryLogging, setQueryLogging] = useState(true)
  const [anonymizeLogs, setAnonymizeLogs] = useState(false)
  const [logRetention, setLogRetention] = useState('7')
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedIp, setCopiedIp] = useState(false)

  const apiToken = 'sb_live_a4b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
  const dnsIp = '192.168.1.100'

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'token') {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    } else {
      setCopiedIp(true)
      setTimeout(() => setCopiedIp(false), 2000)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleNav = (id) => {
    if (id === 'overview') navigate('/dashboard')
    else if (id === 'querylog') navigate('/dashboard/queries')
    else if (id === 'blocklists') navigate('/dashboard/blocklists')
    else if (id === 'allowlist') navigate('/dashboard/allowlist')
    else if (id === 'domains') navigate('/dashboard/domains')
    else if (id === 'settings') { /* already here */ }
  }

  const Toggle = ({ value, onChange }) => (
    <button className={`st__toggle ${value ? 'st__toggle--on' : ''}`} onClick={() => onChange(!value)}>
      <span className="st__toggle-knob" />
    </button>
  )

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
              className={`udash__nav-item ${item.id === 'settings' ? 'udash__nav-item--active' : ''}`}
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

        <div className="udash__content">

          <div className="st__page-header">
            <h1 className="st__title">Settings</h1>
            <p className="st__subtitle">Configure your ShieldBlock instance and manage preferences.</p>
          </div>

          {/* ── General ── */}
          <div className="st__section">
            <div className="st__section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              General
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">DNS Filtering</span>
                <span className="st__row-desc">Enable or disable all DNS filtering. When off, all queries pass through.</span>
              </div>
              <Toggle value={dnsFiltering} onChange={setDnsFiltering} />
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">DNSSEC Validation</span>
                <span className="st__row-desc">Validate DNS responses using DNSSEC signatures.</span>
              </div>
              <Toggle value={dnssec} onChange={setDnssec} />
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Rate Limiting</span>
                <span className="st__row-desc">Prevent DNS query flooding from misbehaving clients.</span>
              </div>
              <Toggle value={rateLimiting} onChange={setRateLimiting} />
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Blocking Mode</span>
                <span className="st__row-desc">How ShieldBlock responds to blocked queries.</span>
              </div>
              <select className="st__select" value={blockingMode} onChange={(e) => setBlockingMode(e.target.value)}>
                <option value="null">Null response (0.0.0.0)</option>
                <option value="nxdomain">NXDOMAIN</option>
                <option value="refused">REFUSED</option>
                <option value="custom">Custom IP</option>
              </select>
            </div>
          </div>

          {/* ── Logging ── */}
          <div className="st__section">
            <div className="st__section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Logging
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Query Logging</span>
                <span className="st__row-desc">Log all DNS queries for analytics and debugging.</span>
              </div>
              <Toggle value={queryLogging} onChange={setQueryLogging} />
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Anonymize Logs</span>
                <span className="st__row-desc">Mask client IP addresses in logs for additional privacy.</span>
              </div>
              <Toggle value={anonymizeLogs} onChange={setAnonymizeLogs} />
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Log Retention</span>
                <span className="st__row-desc">How long to keep query logs before automatic deletion.</span>
              </div>
              <select className="st__select" value={logRetention} onChange={(e) => setLogRetention(e.target.value)}>
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          {/* ── API & DNS ── */}
          <div className="st__section">
            <div className="st__section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              API &amp; DNS
            </div>

            <div className="st__row st__row--col">
              <span className="st__row-label">API Token</span>
              <div className="st__copyable">
                <code className="st__copyable-value">{apiToken}</code>
                <button className="st__copy-btn" onClick={() => copyToClipboard(apiToken, 'token')}>
                  {copiedToken ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="st__row st__row--col">
              <span className="st__row-label">ShieldBlock DNS IP</span>
              <div className="st__copyable">
                <code className="st__copyable-value">{dnsIp}</code>
                <button className="st__copy-btn" onClick={() => copyToClipboard(dnsIp, 'ip')}>
                  {copiedIp ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Notifications ── */}
          <div className="st__section">
            <div className="st__section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Notifications
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Push Notifications</span>
                <span className="st__row-desc">Get notified about blocking events and system alerts.</span>
              </div>
              <Toggle value={pushNotifications} onChange={setPushNotifications} />
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Weekly Report</span>
                <span className="st__row-desc">Receive a weekly summary of your blocking activity via email.</span>
              </div>
              <Toggle value={weeklyReport} onChange={setWeeklyReport} />
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="st__section st__section--danger">
            <div className="st__section-header st__section-header--danger">
              Danger Zone
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Export Configuration</span>
                <span className="st__row-desc">Download your settings and blocklists as a backup file.</span>
              </div>
              <button className="st__action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Export
              </button>
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label">Flush DNS Cache</span>
                <span className="st__row-desc">Clear all cached DNS responses.</span>
              </div>
              <button className="st__action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Flush
              </button>
            </div>

            <div className="st__row">
              <div className="st__row-info">
                <span className="st__row-label st__row-label--danger">Delete All Data</span>
                <span className="st__row-desc">Permanently delete all logs, settings, and blocklists.</span>
              </div>
              <button className="st__action-btn st__action-btn--danger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
