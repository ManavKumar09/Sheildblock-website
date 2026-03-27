import { useState, useEffect } from 'react'
import './Dashboard.css'

const initialLogs = [
  { action: 'DENY',  domain: 'tracker.moatads.com',   type: 'CNAME' },
  { action: 'DENY',  domain: 'ads.yahoo.com',          type: 'A' },
  { action: 'ALLOW', domain: 'cdn.example.com',        type: 'AAAA' },
  { action: 'DENY',  domain: 'facebook-tracker.com',   type: 'A' },
  { action: 'ALLOW', domain: 'github.com',             type: 'A' },
  { action: 'DENY',  domain: 'google-analytics.com',   type: 'CNAME' },
]

const extraLogs = [
  { action: 'DENY',  domain: 'doubleclick.net',        type: 'A' },
  { action: 'ALLOW', domain: 'cloudflare.com',         type: 'A' },
  { action: 'DENY',  domain: 'adservice.google.com',   type: 'CNAME' },
  { action: 'DENY',  domain: 'pixel.facebook.com',     type: 'A' },
  { action: 'ALLOW', domain: 'api.github.com',         type: 'A' },
]

export default function Dashboard() {
  const [logs, setLogs] = useState(initialLogs)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      const next = extraLogs[i % extraLogs.length]
      setLogs(prev => [next, ...prev.slice(0, 5)])
      i++
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="dashboard" id="dashboard">
      <div className="dashboard__inner">

        {/* Header */}
        <div className="dashboard__header">
          <div className="section-tag">Dashboard Preview</div>
          <h2 className="section-heading">See the difference in real time</h2>
          <p className="section-sub">
            Average stats from a single ShieldBlock node over 30 days of filtering network traffic.
          </p>
        </div>

        {/* Content */}
        <div className="dashboard__content">

          {/* Left — stat cards */}
          <div className="dashboard__stats">
            <div className="stat-card">
              <div className="stat-card__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="stat-card__num">14,832</span>
              <span className="stat-card__label">Ads Blocked</span>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="stat-card__num">3,247</span>
              <span className="stat-card__label">Trackers Stopped</span>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="stat-card__num">49%</span>
              <span className="stat-card__label">Faster Browsing</span>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <span className="stat-card__num">2,847</span>
              <span className="stat-card__label">MB Data Saved</span>
            </div>
          </div>

          {/* Right — live query log */}
          <div className="query-log">
            <div className="query-log__header">
              <div className="query-log__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Live Query Log
              </div>
              <span className="query-log__dot" />
            </div>
            <div className="query-log__rows">
              {logs.map((log, i) => (
                <div className="query-row" key={i}>
                  <span className={`query-badge query-badge--${log.action.toLowerCase()}`}>
                    {log.action}
                  </span>
                  <span className="query-domain">{log.domain}</span>
                  <span className="query-type">{log.type}</span>
                  <span className="query-time">just now</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}