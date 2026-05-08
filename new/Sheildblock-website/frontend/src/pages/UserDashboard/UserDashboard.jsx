import { useNavigate } from 'react-router-dom'
import './UserDashboard.css'

export default function UserDashboard() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || 'User'
  const deployment = localStorage.getItem('deployment') || 'self'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="udash">
      <div className="udash__inner">
        <div className="udash__logo" onClick={() => navigate('/')}>
          <div className="udash__logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" fill="var(--green)"/>
              <path d="M9 12l2 2 4-4" stroke="#080c0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="udash__logo-text"><span>Shield</span>Block</span>
        </div>
        <h1 className="udash__heading">Welcome, <span className="green">{userName}</span> 👋</h1>
        <p className="udash__sub">
          Deployment: <strong style={{ color: 'var(--green)' }}>{deployment === 'self' ? 'Self-Hosted' : 'Cloud DNS'}</strong>
        </p>
        <p className="udash__placeholder">Dashboard features coming soon...</p>
        <button className="udash__logout" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  )
}