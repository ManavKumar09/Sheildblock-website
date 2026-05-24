import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardTopBar from '../../components/DashboardTopBar/DashboardTopBar'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis as BXAxis, YAxis as BYAxis, Tooltip as BTooltip, ResponsiveContainer as BResponsiveContainer
} from 'recharts'
import './UserDashboard.css'


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
  const logRetention = localStorage.getItem('logRetention') || '7'
  const [chartDays, setChartDays] = useState(logRetention)
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.detail) {
          console.error("API Error:", data.detail);
          return;
        }

        setDashboardData({
          summary: data.summary,
          chartData: data.chart_data?.map(d => ({
              time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              blocked: Number(d.blocked),
              allowed: Number(d.total) - Number(d.blocked)
          })) || [],
          queryTypes: data.query_types?.map((q, i) => ({
              name: q.type,
              value: Number(q.count),
              color: ['#00e676', '#26c6da', '#f5c542', '#4a5e50', '#8a9e8f'][i % 5]
          })) || [],
          topBlocked: data.top_blocked?.map(d => ({ domain: d.domain, count: Number(d.count) })) || [],
          recentLogs: data.recent_logs || []
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [chartDays]);

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

  const renderChange = (value, invertColors = false) => {
    if (value === undefined || value === null) return <div className="udash__stat-change">0.00%</div>;
    const isUp = value > 0;
    const isZero = value === 0;
    
    let colorClass = isZero ? '' : (isUp ? (invertColors ? 'udash__stat-change--down' : 'udash__stat-change--up') : (invertColors ? 'udash__stat-change--up' : 'udash__stat-change--down'));
    let arrow = isZero ? '' : (isUp ? '↗' : '↘');
    let sign = isUp ? '+' : '';
    
    return <div className={`udash__stat-change ${colorClass}`}>{arrow} {sign}{value.toFixed(1)}%</div>
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
        <DashboardTopBar />

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
              <div className="udash__stat-val">{dashboardData?.summary?.total_queries?.toLocaleString() || 0}</div>
              {renderChange(dashboardData?.summary?.total_change)}
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
              <div className="udash__stat-val">{dashboardData?.summary?.blocked_queries?.toLocaleString() || 0}</div>
              {renderChange(dashboardData?.summary?.blocked_change)}
            </div>

            <div className="udash__stat-card">
              <div className="udash__stat-top">
                <span className="udash__stat-label">Allowed</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="var(--text-muted)" strokeWidth="1.8"/>
                  <line x1="4" y1="4" x2="20" y2="20" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="udash__stat-val">{((dashboardData?.summary?.total_queries || 0) - (dashboardData?.summary?.blocked_queries || 0)).toLocaleString()}</div>
              {renderChange(dashboardData?.summary?.allowed_change)}
            </div>

            <div className="udash__stat-card">
              <div className="udash__stat-top">
                <span className="udash__stat-label">Avg Response</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="udash__stat-val">{dashboardData?.summary?.avg_response_ms || 0}ms</div>
              {renderChange(dashboardData?.summary?.response_change, true)}
            </div>
          </div>

          {/* Charts row */}
          <div className="udash__charts-row">

            {/* Area chart */}
            <div className="udash__chart-card udash__chart-card--wide">
              <div className="udash__chart-header">
                <div>
                  <h3 className="udash__chart-title">Queries over time</h3>
                  <div className="udash__chart-sub">
                    Last <select className="udash__inline-select" value={chartDays} onChange={(e) => setChartDays(e.target.value)}>
                      <option value="1">1 day</option>
                      <option value="2">2 days</option>
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
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
                <AreaChart data={dashboardData?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    data={dashboardData?.queryTypes || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dashboardData?.queryTypes?.map((entry, index) => (
                      <Cell key={index} fill={entry.color}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="udash__donut-legend">
                {dashboardData?.queryTypes?.map((q) => (
                  <div key={q.name} className="udash__donut-legend-item">
                    <span className="udash__legend-dot" style={{ background: q.color }} />
                    <span className="udash__donut-legend-label">{q.name}</span>
                    <span className="udash__donut-legend-val">{q.value}</span>
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
                  data={dashboardData?.topBlocked || []}
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
                {dashboardData?.recentLogs?.map((q, i) => {
                  const statusStr = q.is_blocked ? 'blocked' : 'allowed';
                  const timeOnly = new Date(q.timestamp).toLocaleTimeString();
                  return (
                  <div key={i} className="udash__query-row">
                    <span className={`udash__query-dot udash__query-dot--${statusStr}`} />
                    <span className="udash__query-time">{timeOnly}</span>
                    <span className="udash__query-domain">{q.domain}</span>
                    <span className="udash__query-ip">{q.record_type}</span>
                    <span className={`udash__query-badge udash__query-badge--${statusStr}`}>
                      {statusStr}
                    </span>
                  </div>
                )})}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}