import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './OnBoarding.css'

/* ── Self-Hosted Steps ── */
const SELF_STEPS = [
  { id: 1, label: 'Flash SD Card', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v13M6 10l6 7 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
  { id: 2, label: 'Connect Pi', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  )},
  { id: 3, label: 'Configure Filters', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )},
  { id: 4, label: 'Set DNS', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
    </svg>
  )},
  { id: 5, label: 'Complete', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
]

/* ── Cloud Steps ── */
const CLOUD_STEPS = [
  { id: 1, label: 'Name Your Profile', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M7 8h10M7 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
  { id: 2, label: 'Configure Filters', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )},
  { id: 3, label: 'Setup DNS', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )},
  { id: 4, label: 'Connect Devices', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="10" y1="18" x2="14" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )},
  { id: 5, label: 'Complete', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
]

const requirements = [
  'Raspberry Pi 3B+, 4, or 5',
  'MicroSD card (8 GB minimum)',
  'Ethernet connection (recommended) or WiFi',
  'Power supply (5V/3A for Pi 4/5)',
]

const profilePresets = [
  {
    id: 'home',
    label: 'Home Network',
    desc: 'Block ads and trackers for the whole family',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 21v-7h6v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'work',
    label: 'Work Profile',
    desc: 'Focus mode with social media blocking',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'mobile',
    label: 'Mobile',
    desc: 'Protect your phone on any network',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="10" y1="18" x2="14" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'self-hosted'
  const isCloud = mode === 'cloud'

  const STEPS = isCloud ? CLOUD_STEPS : SELF_STEPS

  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [dnsCopied, setDnsCopied] = useState(false)
  const [dohCopied, setDohCopied] = useState(false)
  const [dotCopied, setDotCopied] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState('windows')
  const [filters, setFilters] = useState({
    ads: true,
    trackers: true,
    malware: true,
    adult: false,
    social: false,
  })

  const progress = (step / STEPS.length) * 100

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  const toggleFilter = (id) => {
    setFilters(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const goNext = () => {
    if (step < STEPS.length) setStep(step + 1)
    else navigate('/dashboard')
  }

  const goBack = () => {
    if (step > 1) setStep(step - 1)
    else navigate('/signup')
  }

  const activeBlocklistCount = Object.values(filters).filter(Boolean).length

  /* ── Device instructions for cloud Connect Devices step ── */
  const deviceInstructions = {
    windows: {
      title: 'Windows',
      steps: [
        'Open Settings → Network & Internet → Change adapter options',
        'Right-click your connection → Properties → Internet Protocol Version 4',
        'Select "Use the following DNS server addresses"',
        'Enter the ShieldBlock DNS addresses shown above',
      ],
    },
    macos: {
      title: 'macOS',
      steps: [
        'Open System Settings → Network',
        'Select your connection → Details → DNS',
        'Click + and add the ShieldBlock DNS addresses',
        'Remove any existing DNS entries and click OK',
      ],
    },
    android: {
      title: 'Android',
      steps: [
        'Open Settings → Network & Internet → Private DNS',
        'Select "Private DNS provider hostname"',
        'Enter: dns.shieldblock.io',
        'Tap Save — all DNS queries will now be filtered',
      ],
    },
    ios: {
      title: 'iOS / iPadOS',
      steps: [
        'Download the ShieldBlock DNS profile from the link below',
        'Open Settings → General → VPN & Device Management',
        'Install the ShieldBlock DNS Profile',
        'All DNS queries will now use encrypted DoH',
      ],
    },
    linux: {
      title: 'Linux',
      steps: [
        'Edit /etc/systemd/resolved.conf',
        'Set DNS=45.90.28.100 and DNS=45.90.30.100',
        'Set DNSOverTLS=yes',
        'Run: sudo systemctl restart systemd-resolved',
      ],
    },
  }

  return (
    <div className="onboard">

      {/* ── Header ── */}
      <header className="onboard__header">
        <div className="onboard__logo" onClick={() => navigate('/')}>
          <div className="onboard__logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" fill="var(--green)"/>
              <path d="M9 12l2 2 4-4" stroke="#080c0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="onboard__logo-text"><span>Shield</span>Block</span>
        </div>
        <div className="onboard__header-right">
          <span className="onboard__mode-label">
            {isCloud ? 'Cloud DNS Setup' : 'Self-Hosted Setup'}
          </span>
          <span className="onboard__mode-badge">
            {isCloud ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 10a6 6 0 1 0-11.8 1.5A5 5 0 1 0 7 21h11a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            )}
            {isCloud ? 'Cloud' : 'Self-Hosted'}
          </span>
        </div>
      </header>

      {/* ── Progress ── */}
      <div className="onboard__progress-wrap">
        <div className="onboard__progress-label">
          <span>Step {step} of {STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="onboard__progress-bar">
          <div className="onboard__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── Step icons row ── */}
      <div className="onboard__steps">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`onboard__step
              ${step === s.id ? 'onboard__step--active' : ''}
              ${step > s.id ? 'onboard__step--done' : ''}
            `}
          >
            <div className="onboard__step-icon">
              {step > s.id ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : s.icon}
            </div>
            <span className="onboard__step-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="onboard__content">

        {/* ╔════════════════════════════════════════╗
           ║        CLOUD FLOW                      ║
           ╚════════════════════════════════════════╝ */}
        {isCloud && (
          <>
            {/* CLOUD STEP 1 — Name Your Profile */}
            {step === 1 && (
              <div className="onboard__body">
                <h2 className="onboard__title">Name your profile</h2>
                <p className="onboard__desc">
                  Create a filtering profile. You can create multiple profiles for different devices or use cases.
                </p>

                <div className="onboard__profile-card">
                  <label className="onboard__field-label">Profile name</label>
                  <input
                    type="text"
                    className="onboard__profile-input"
                    placeholder="e.g., Home Network, Office, Mobile"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                  <span className="onboard__field-hint">
                    This helps you identify this profile in your dashboard.
                  </span>
                </div>

                <div className="onboard__presets-grid">
                  {profilePresets.map((p) => (
                    <div
                      key={p.id}
                      className={`onboard__preset-card ${selectedPreset === p.id ? 'onboard__preset-card--active' : ''}`}
                      onClick={() => {
                        setSelectedPreset(p.id)
                        if (!profileName) setProfileName(p.label)
                      }}
                    >
                      <div className="onboard__preset-icon">{p.icon}</div>
                      <h4 className="onboard__preset-title">{p.label}</h4>
                      <p className="onboard__preset-desc">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLOUD STEP 2 — Configure Filters (same as self-hosted step 3) */}
            {step === 2 && (
              <div className="onboard__body">
                <h2 className="onboard__title">Configure filters</h2>
                <p className="onboard__desc">
                  Choose which categories to block. You can fine-tune these later from your dashboard.
                </p>

                <div className="onboard__filters">
                  {[
                    { id: 'ads',      label: 'Ads & Banners',         recommended: true,  desc: 'Block display ads, video ads, and pop-ups across all websites' },
                    { id: 'trackers', label: 'Trackers & Analytics',  recommended: true,  desc: 'Prevent cross-site tracking, fingerprinting, and data collection scripts' },
                    { id: 'malware',  label: 'Malware & Phishing',    recommended: true,  desc: 'Block known malicious domains and phishing attempts' },
                    { id: 'adult',    label: 'Adult Content',         recommended: false, desc: 'Filter adult and explicit content domains (parental controls)' },
                    { id: 'social',   label: 'Social Media Trackers', recommended: false, desc: 'Block tracking pixels from Facebook, Twitter, LinkedIn, etc.' },
                  ].map((f) => (
                    <div
                      key={f.id}
                      className={`onboard__filter-item ${filters[f.id] ? 'onboard__filter-item--on' : ''}`}
                      onClick={() => toggleFilter(f.id)}
                    >
                      <div className="onboard__filter-left">
                        <div className="onboard__filter-title-row">
                          <span className="onboard__filter-label">{f.label}</span>
                          {f.recommended && <span className="onboard__filter-badge">Recommended</span>}
                        </div>
                        <p className="onboard__filter-desc">{f.desc}</p>
                      </div>
                      <div className={`onboard__toggle ${filters[f.id] ? 'onboard__toggle--on' : ''}`}>
                        <div className="onboard__toggle-thumb" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="onboard__blocklists">
                  <h4 className="onboard__blocklists-title">Active blocklists</h4>
                  <p className="onboard__blocklists-sub">
                    Based on your selection, ShieldBlock will use the following community-maintained blocklists:
                  </p>
                  <div className="onboard__blocklists-tags">
                    {filters.ads      && <><span className="onboard__bl-tag">EasyList</span><span className="onboard__bl-tag">AdGuard DNS</span></>}
                    {filters.trackers && <><span className="onboard__bl-tag">EasyPrivacy</span><span className="onboard__bl-tag">Fanboy Tracking</span></>}
                    {filters.malware  && <><span className="onboard__bl-tag">URLhaus</span><span className="onboard__bl-tag">PhishTank</span></>}
                    {filters.social   && <span className="onboard__bl-tag">Fanboy Social</span>}
                    {filters.adult    && <span className="onboard__bl-tag">Adult DNS</span>}
                  </div>
                </div>
              </div>
            )}

            {/* CLOUD STEP 3 — Setup DNS */}
            {step === 3 && (
              <div className="onboard__body">
                <h2 className="onboard__title">Setup DNS</h2>
                <p className="onboard__desc">
                  Point your devices to ShieldBlock Cloud DNS using one of the methods below.
                </p>

                <div className="onboard__dns-methods">
                  {/* DoH — Recommended */}
                  <div className="onboard__dns-method-card onboard__dns-method-card--highlighted">
                    <div className="onboard__dns-method-header">
                      <div>
                        <h3 className="onboard__dns-method-title">DNS-over-HTTPS (Recommended)</h3>
                      </div>
                    </div>
                    <p className="onboard__dns-method-desc">Most secure. Works in browsers and OS settings.</p>
                    <div className="onboard__code-block">
                      <code>https://dns.shieldblock.io/dns-query/a1b2c3</code>
                      <button className="onboard__copy-btn" onClick={() => handleCopy('https://dns.shieldblock.io/dns-query/a1b2c3', setDohCopied)}>
                        {dohCopied ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* DoT */}
                  <div className="onboard__dns-method-card">
                    <div className="onboard__dns-method-header">
                      <div>
                        <h3 className="onboard__dns-method-title">DNS-over-TLS</h3>
                      </div>
                    </div>
                    <p className="onboard__dns-method-desc">For Android Private DNS and advanced configurations.</p>
                    <div className="onboard__code-block">
                      <code>a1b2c3.dns.shieldblock.io</code>
                      <button className="onboard__copy-btn" onClick={() => handleCopy('a1b2c3.dns.shieldblock.io', setDotCopied)}>
                        {dotCopied ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* IPv4 / IPv6 */}
                  <div className="onboard__dns-encrypted-row">
                    <div className="onboard__dns-method-card">
                      <h3 className="onboard__dns-method-title">IPv4 Addresses</h3>
                      <p className="onboard__dns-ip">45.90.28.1</p>
                      <p className="onboard__dns-ip">45.90.30.1</p>
                    </div>
                    <div className="onboard__dns-method-card">
                      <h3 className="onboard__dns-method-title">IPv6 Addresses</h3>
                      <p className="onboard__dns-ip onboard__dns-ip--green">2a07:a8c0::a1:b2c3</p>
                      <p className="onboard__dns-ip">2a07:a8c1::a1:b2c3</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CLOUD STEP 4 — Connect Devices */}
            {step === 4 && (
              <div className="onboard__body">
                <h2 className="onboard__title">Connect your devices</h2>
                <p className="onboard__desc">
                  Follow the guide for each device or platform you want to protect.
                </p>

                <div className="onboard__connect-grid">
                  {[
                    { name: 'Android', desc: 'Settings > Network > Private DNS' },
                    { name: 'iOS / iPadOS', desc: 'Install DNS profile via Safari' },
                    { name: 'Windows', desc: 'Settings > Network > DNS server' },
                    { name: 'macOS', desc: 'System Settings > Network > DNS' },
                    { name: 'Linux', desc: 'Use systemd-resolved or NetworkManager' },
                    { name: 'Router', desc: 'Set as upstream DNS in router admin' },
                  ].map((d) => (
                    <div key={d.name} className="onboard__connect-card">
                      <div>
                        <h4 className="onboard__connect-card-title">{d.name}</h4>
                        <p className="onboard__connect-card-desc">{d.desc}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="onboard__connect-card-link">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLOUD STEP 5 — Complete */}
            {step === 5 && (
              <div className="onboard__body onboard__body--center">
                <div className="onboard__complete-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="var(--green)" strokeWidth="1.8"/>
                    <path d="M8 12l3 3 5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h2 className="onboard__title">You're all set!</h2>
                <p className="onboard__desc" style={{ textAlign: 'center' }}>
                  Your ShieldBlock Cloud profile {profileName ? <strong>"{profileName}"</strong> : ''} is configured and ready.
                  DNS queries from your connected devices will now be filtered through our global cloud infrastructure.
                </p>

                <div className="onboard__complete-stats">
                  <div className="onboard__complete-stat">
                    <span className="onboard__complete-num onboard__complete-num--green">0</span>
                    <span className="onboard__complete-label">Queries blocked</span>
                  </div>
                  <div className="onboard__complete-stat">
                    <span className="onboard__complete-num">{activeBlocklistCount}</span>
                    <span className="onboard__complete-label">Blocklists active</span>
                  </div>
                  <div className="onboard__complete-stat">
                    <span className="onboard__complete-num">~150K</span>
                    <span className="onboard__complete-label">Domains filtered</span>
                  </div>
                </div>

                <p className="onboard__complete-hint">
                  Head to your dashboard to see real-time analytics and manage your filters.
                </p>
              </div>
            )}
          </>
        )}

        {/* ╔════════════════════════════════════════╗
           ║        SELF-HOSTED FLOW                ║
           ╚════════════════════════════════════════╝ */}
        {!isCloud && (
          <>
            {/* STEP 1 — Flash SD Card */}
            {step === 1 && (
              <div className="onboard__body">
                <h2 className="onboard__title">Flash the ShieldBlock image</h2>
                <p className="onboard__desc">
                  Download the ShieldBlock image and flash it to your Raspberry Pi SD card using Raspberry Pi Imager or Balena Etcher.
                </p>

                <div className="onboard__options-grid">
                  <div className="onboard__option-card">
                    <div className="onboard__option-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2v13M6 10l6 7 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h3 className="onboard__option-title">Option A: Download Image</h3>
                    <p className="onboard__option-desc">Download the pre-built .img file and flash with your preferred tool.</p>
                    <button className="onboard__download-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2v13M6 10l6 7 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      Download .img (2.1 GB)
                    </button>
                  </div>

                  <div className="onboard__option-card">
                    <div className="onboard__option-icon onboard__option-icon--terminal">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h3 className="onboard__option-title">Option B: Install Script</h3>
                    <p className="onboard__option-desc">Run a single command on an existing Raspberry Pi OS installation.</p>
                    <div className="onboard__code-block">
                      <code>curl -sSL https://get.shieldblock.io | bash</code>
                      <button className="onboard__copy-btn" onClick={() => handleCopy('curl -sSL https://get.shieldblock.io | bash', setCopied)}>
                        {copied ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="onboard__requirements">
                  <h4 className="onboard__req-title">Requirements</h4>
                  <ul className="onboard__req-list">
                    {requirements.map((r, i) => (
                      <li key={i} className="onboard__req-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* STEP 2 — Connect Pi */}
            {step === 2 && (
              <div className="onboard__body">
                <h2 className="onboard__title">Connect your Raspberry Pi</h2>
                <p className="onboard__desc">
                  Insert the flashed SD card, connect Ethernet and power. ShieldBlock will boot and configure automatically.
                </p>

                <div className="onboard__connect-steps">
                  {[
                    { num: 1, title: 'Insert the SD card', desc: 'Insert the flashed MicroSD card into your Raspberry Pi.' },
                    { num: 2, title: 'Connect Ethernet', desc: "Plug an Ethernet cable from your router to the Raspberry Pi. WiFi setup is also available after boot." },
                    { num: 3, title: 'Power on', desc: 'Connect the power supply. The green LED will blink during boot. Wait about 2 minutes for first-time setup.' },
                    { num: 4, title: 'Find your Pi', desc: "ShieldBlock will be accessible at http://shieldblock.local or check your router's DHCP client list for the assigned IP." },
                  ].map((s) => (
                    <div className="onboard__connect-item" key={s.num}>
                      <span className="onboard__connect-num-badge">{s.num}</span>
                      <div>
                        <h4 className="onboard__connect-title">{s.title}</h4>
                        <p className="onboard__connect-desc">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="onboard__waiting">
                  <div className="onboard__waiting-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="20" r="1.5" fill="var(--green)"/>
                    </svg>
                    Waiting for connection...
                  </div>
                  <p className="onboard__waiting-desc">
                    Once your Pi is connected, ShieldBlock will detect it automatically. You can proceed while it boots.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3 — Configure Filters */}
            {step === 3 && (
              <div className="onboard__body">
                <h2 className="onboard__title">Configure filters</h2>
                <p className="onboard__desc">
                  Choose which categories to block. You can fine-tune these later from your dashboard.
                </p>

                <div className="onboard__filters">
                  {[
                    { id: 'ads',      label: 'Ads & Banners',         recommended: true,  desc: 'Block display ads, video ads, and pop-ups across all websites' },
                    { id: 'trackers', label: 'Trackers & Analytics',  recommended: true,  desc: 'Prevent cross-site tracking, fingerprinting, and data collection scripts' },
                    { id: 'malware',  label: 'Malware & Phishing',    recommended: true,  desc: 'Block known malicious domains and phishing attempts' },
                    { id: 'adult',    label: 'Adult Content',         recommended: false, desc: 'Filter adult and explicit content domains (parental controls)' },
                    { id: 'social',   label: 'Social Media Trackers', recommended: false, desc: 'Block tracking pixels from Facebook, Twitter, LinkedIn, etc.' },
                  ].map((f) => (
                    <div
                      key={f.id}
                      className={`onboard__filter-item ${filters[f.id] ? 'onboard__filter-item--on' : ''}`}
                      onClick={() => toggleFilter(f.id)}
                    >
                      <div className="onboard__filter-left">
                        <div className="onboard__filter-title-row">
                          <span className="onboard__filter-label">{f.label}</span>
                          {f.recommended && <span className="onboard__filter-badge">Recommended</span>}
                        </div>
                        <p className="onboard__filter-desc">{f.desc}</p>
                      </div>
                      <div className={`onboard__toggle ${filters[f.id] ? 'onboard__toggle--on' : ''}`}>
                        <div className="onboard__toggle-thumb" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="onboard__blocklists">
                  <h4 className="onboard__blocklists-title">Active blocklists</h4>
                  <p className="onboard__blocklists-sub">
                    Based on your selection, ShieldBlock will use the following community-maintained blocklists:
                  </p>
                  <div className="onboard__blocklists-tags">
                    {filters.ads      && <><span className="onboard__bl-tag">EasyList</span><span className="onboard__bl-tag">AdGuard DNS</span></>}
                    {filters.trackers && <><span className="onboard__bl-tag">EasyPrivacy</span><span className="onboard__bl-tag">Fanboy Tracking</span></>}
                    {filters.malware  && <><span className="onboard__bl-tag">URLhaus</span><span className="onboard__bl-tag">PhishTank</span></>}
                    {filters.social   && <span className="onboard__bl-tag">Fanboy Social</span>}
                    {filters.adult    && <span className="onboard__bl-tag">Adult DNS</span>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — Set DNS */}
            {step === 4 && (
              <div className="onboard__body">
                <h2 className="onboard__title">Set your DNS</h2>
                <p className="onboard__desc">
                  Point your router or individual devices to ShieldBlock as the DNS server.
                </p>

                <div className="onboard__dns-grid">
                  <div className="onboard__dns-card onboard__dns-card--highlighted">
                    <div className="onboard__dns-card-header">
                      <div className="onboard__dns-card-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                          <path d="M6 11h4M6 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
                        </svg>
                      </div>
                      <h3 className="onboard__dns-card-title">Router (Recommended)</h3>
                    </div>
                    <p className="onboard__dns-card-desc">
                      Set the Pi IP as your DNS server in your router settings. This protects all devices automatically.
                    </p>
                    <div className="onboard__dns-field">
                      <label className="onboard__dns-field-label">Primary DNS</label>
                      <div className="onboard__code-block">
                        <code>192.168.1.100</code>
                        <button className="onboard__copy-btn" onClick={() => handleCopy('192.168.1.100', setDnsCopied)}>
                          {dnsCopied ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                              <path d="M20 6L9 17l-5-5" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="onboard__dns-card">
                    <div className="onboard__dns-card-header">
                      <div className="onboard__dns-card-icon onboard__dns-card-icon--neutral">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                          <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <h3 className="onboard__dns-card-title">Per Device</h3>
                    </div>
                    <p className="onboard__dns-card-desc">
                      Configure DNS on individual devices if you cannot change router settings.
                    </p>
                    <div className="onboard__device-list">
                      {['Windows', 'macOS', 'Linux', 'Android', 'iOS'].map((device) => (
                        <div key={device} className="onboard__device-item">
                          <span>{device}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 — Complete */}
            {step === 5 && (
              <div className="onboard__body onboard__body--center">
                <div className="onboard__complete-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="var(--green)" strokeWidth="1.8"/>
                    <path d="M8 12l3 3 5-5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h2 className="onboard__title">You are all set</h2>
                <p className="onboard__desc">
                  Your ShieldBlock instance is configured and ready. DNS queries on your
                  network will now be filtered through your Raspberry Pi.
                </p>

                <div className="onboard__complete-stats">
                  <div className="onboard__complete-stat">
                    <span className="onboard__complete-num onboard__complete-num--green">0</span>
                    <span className="onboard__complete-label">Queries blocked</span>
                  </div>
                  <div className="onboard__complete-stat">
                    <span className="onboard__complete-num">{activeBlocklistCount}</span>
                    <span className="onboard__complete-label">Blocklists active</span>
                  </div>
                  <div className="onboard__complete-stat">
                    <span className="onboard__complete-num">~150K</span>
                    <span className="onboard__complete-label">Domains filtered</span>
                  </div>
                </div>

                <p className="onboard__complete-hint">
                  Head to your dashboard to see real-time analytics and manage your filters.
                </p>
              </div>
            )}
          </>
        )}

      </div>

      {/* ── Bottom Nav ── */}
      <div className="onboard__nav">
        <button className="onboard__back-btn" onClick={goBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button className="onboard__next-btn" onClick={goNext}>
          {step === 5 ? 'Go to Dashboard' : 'Continue'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </div>
  )
}