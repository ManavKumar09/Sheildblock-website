import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis as BXAxis, YAxis as BYAxis, Tooltip as BTooltip, ResponsiveContainer as BResponsiveContainer
} from 'recharts'
import './UserDashboard.css'

const timeData = [
  { time: '00:00', blocked: 420, allowed: 890 },
  { time: '02:00', blocked: 380, allowed: 750 },
  { time: '04:00', blocked: 650, allowed: 1200 },
  { time: '06:00', blocked: 980, allowed: 1800 },
  { time: '08:00', blocked: 1450, allowed: 2400 },
  { time: '10:00', blocked: 1200, allowed: 2100 },
  { time: '12:00', blocked: 1650, allowed: 2600 },
  { time: '14:00', blocked: 1380, allowed: 2200 },
  { time: '16:00', blocked: 1100, allowed: 1950 },
  { time: '18:00', blocked: 890, allowed: 1600 },
  { time: '20:00', blocked: 1050, allowed: 1800 },
  { time: '22:00', blocked: 780, allowed: 1400 },
]

const queryTypes = [
  { name: 'A (IPv4)', value: 58, color: '#00e676' },
  { name: 'AAAA (IPv6)', value: 24, color: '#26c6da' },
  { name: 'CNAME', value: 12, color: '#f5c542' },
  { name: 'Other', value: 6, color: '#4a5e50' },
]

const topDomains = [
  { domain: 'ads.google.com', count: 3000 },
  { domain: 'tracking.facebook.com', count: 2400 },
  { domain: 'analytics.tiktok.com', count: 1900 },
  { domain: 'pixel.adsafeprotected.com', count: 1500 },
  { domain: 'cdn.doubleclick.net', count: 1400 },
  { domain: 'telemetry.microsoft.com', count: 1200 },
  { domain: 'ads.yahoo.com', count: 1050 },
  { domain: 'track.hubspot.com', count: 850 },
]

const initialQueries = [
  { time: '14:23:05', domain: 'api.github.com',           ip: '192.168.1.42',  status: 'allowed' },
  { time: '14:23:04', domain: 'ads.google.com',           ip: '192.168.1.15',  status: 'blocked' },
  { time: '14:23:03', domain: 'cdn.jsdelivr.net',         ip: '192.168.1.42',  status: 'allowed' },
  { time: '14:23:02', domain: 'tracking.facebook.com',    ip: '192.168.1.8',   status: 'blocked' },
  { time: '14:23:01', domain: 'fonts.googleapis.com',     ip: '192.168.1.15',  status: 'allowed' },
  { time: '14:23:00', domain: 'pixel.adsafeprotected.com',ip: '192.168.1.22',  status: 'blocked' },
  { time: '14:22:59', domain: 'vercel.com',               ip: '192.168.1.42',  status: 'allowed' },
  { time: '14:22:58', domain: 'analytics.tiktok.com',     ip: '192.168.1.8',   status: 'blocked' },
]

const extraQueries = [
  { domain: 'doubleclick.net',      ip: '192.168.1.15', status: 'blocked' },
  { domain: 'cloudflare.com',       ip: '192.168.1.42', status: 'allowed' },
  { domain: 'adservice.google.com', ip: '192.168.1.8',  status: 'blocked' },
  { domain: 'github.com',           ip: '192.168.1.22', status: 'allowed' },
  { domain: 'pixel.facebook.com',   ip: '192.168.1.15', status: 'blocked' },
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

export default function UserDashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
  const [queries, setQueries] = useState(initialQueries)
  let qIndex = 0

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
      const next = { ...extraQueries[qIndex % extraQueries.length], time: timeStr }
      setQueries(prev => [next, ...prev.slice(0, 7)])
      qIndex++
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip__label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: {p.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
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
              className={`udash__nav-item ${activeNav === item.id ? 'udash__nav-item--active' : ''}`}
              onClick={() => {
                if (item.id === 'querylog') {
                  navigate('/dashboard/queries')
                } else if (item.id === 'blocklists') {
                  navigate('/dashboard/blocklists')
                } else if (item.id === 'allowlist') {
                  navigate('/dashboard/allowlist')
                } else if (item.id === 'domains') {
                  navigate('/dashboard/domains')
                } else if (item.id === 'settings') {
                  navigate('/dashboard/settings')
                } else {
                  setActiveNav(item.id)
                }
              }}
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
          <div className="udash__page-header">
            <h1 className="udash__page-title">Dashboard</h1>
            <p className="udash__page-sub">Real-time overview of your network filtering activity.</p>
          </div>

          {/* Stat cards */}
          <div className="udash__stats">
            <div className="udash__stat-card">
              <div className="udash__stat-top">
                <span className="udash__stat-label">Total Queries</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="udash__stat-val">34,896</div>
              <div className="udash__stat-change udash__stat-change--up">↗ +12.5%</div>
            </div>

            <div className="udash__stat-card udash__stat-card--highlighted">
              <div className="udash__stat-top">
                <span className="udash__stat-label">Blocked</span>
                <div className="udash__stat-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="var(--green)" strokeWidth="1.8"/>
                  </svg>
                </div>
              </div>
              <div className="udash__stat-val">12,468</div>
              <div className="udash__stat-change udash__stat-change--up">↗ +35.7%</div>
            </div>

            <div className="udash__stat-card">
              <div className="udash__stat-top">
                <span className="udash__stat-label">Allowed</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="var(--text-muted)" strokeWidth="1.8"/>
                  <line x1="4" y1="4" x2="20" y2="20" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="udash__stat-val">22,428</div>
              <div className="udash__stat-change udash__stat-change--down">↘ -3.2%</div>
            </div>

            <div className="udash__stat-card">
              <div className="udash__stat-top">
                <span className="udash__stat-label">Avg Response</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="udash__stat-val">4.2ms</div>
              <div className="udash__stat-change udash__stat-change--down">↘ -18%</div>
            </div>
          </div>

          {/* Charts row */}
          <div className="udash__charts-row">

            {/* Area chart */}
            <div className="udash__chart-card udash__chart-card--wide">
              <div className="udash__chart-header">
                <div>
                  <h3 className="udash__chart-title">Queries over time</h3>
                  <p className="udash__chart-sub">Last 24 hours</p>
                </div>
                <div className="udash__chart-legend">
                  <span className="udash__legend-item">
                    <span className="udash__legend-dot" style={{ background: '#00e676' }} />
                    Blocked
                  </span>
                  <span className="udash__legend-item">
                    <span className="udash__legend-dot" style={{ background: '#26c6da' }} />
                    Allowed
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e676" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00e676" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="allowedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#26c6da" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#26c6da" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: '#4a5e50', fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: '#4a5e50', fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Area type="monotone" dataKey="allowed" stroke="#26c6da" strokeWidth={2} fill="url(#allowedGrad)" name="Allowed"/>
                  <Area type="monotone" dataKey="blocked" stroke="#00e676" strokeWidth={2} fill="url(#blockedGrad)" name="Blocked"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart */}
            <div className="udash__chart-card">
              <div className="udash__chart-header">
                <div>
                  <h3 className="udash__chart-title">Query Types</h3>
                  <p className="udash__chart-sub">Distribution by record type</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={queryTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {queryTypes.map((entry, index) => (
                      <Cell key={index} fill={entry.color}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="udash__donut-legend">
                {queryTypes.map((q) => (
                  <div key={q.name} className="udash__donut-legend-item">
                    <span className="udash__legend-dot" style={{ background: q.color }} />
                    <span className="udash__donut-legend-label">{q.name}</span>
                    <span className="udash__donut-legend-val">{q.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="udash__bottom-row">

            {/* Top blocked domains */}
            <div className="udash__chart-card udash__chart-card--medium">
              <div className="udash__chart-header">
                <div>
                  <h3 className="udash__chart-title">Top Blocked Domains</h3>
                  <p className="udash__chart-sub">Most frequently blocked today</p>
                </div>
              </div>
              <BResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topDomains}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <BXAxis type="number" tick={{ fill: '#4a5e50', fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <BYAxis type="category" dataKey="domain" tick={{ fill: '#8a9e8f', fontSize: 11 }} axisLine={false} tickLine={false} width={180}/>
                  <BTooltip
                    cursor={{ fill: 'rgba(0,230,118,0.05)' }}
                    contentStyle={{ background: '#0e1410', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#f0f4f1' }}
                  />
                  <Bar dataKey="count" fill="#00e676" radius={[0, 4, 4, 0]} name="Blocked"/>
                </BarChart>
              </BResponsiveContainer>
            </div>

            {/* Recent queries */}
            <div className="udash__chart-card udash__chart-card--medium">
              <div className="udash__chart-header">
                <div>
                  <h3 className="udash__chart-title">Recent Queries</h3>
                  <p className="udash__chart-sub">Live DNS query log</p>
                </div>
                <div className="udash__live-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Live
                </div>
              </div>
              <div className="udash__query-list">
                {queries.map((q, i) => (
                  <div key={i} className="udash__query-row">
                    <span className={`udash__query-dot ${q.status === 'blocked' ? 'udash__query-dot--blocked' : 'udash__query-dot--allowed'}`} />
                    <span className="udash__query-time">{q.time}</span>
                    <span className="udash__query-domain">{q.domain}</span>
                    <span className="udash__query-ip">{q.ip}</span>
                    <span className={`udash__query-badge ${q.status === 'blocked' ? 'udash__query-badge--blocked' : 'udash__query-badge--allowed'}`}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}