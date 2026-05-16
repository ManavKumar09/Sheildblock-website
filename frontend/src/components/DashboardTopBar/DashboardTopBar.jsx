import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportModal from '../ReportModal/ReportModal'
import './DashboardTopBar.css'

export default function DashboardTopBar({ status }) {
  const navigate = useNavigate()
  const [isReportOpen, setIsReportOpen] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <header className="udash__topbar">
      <div className="udash__status">
        <span className="udash__status-dot" />
        {status || 'Filtering active'}
      </div>
      <div className="udash__topbar-right">
        <button 
          className="udash__icon-btn udash__icon-btn--report" 
          title="Report missed ad"
          onClick={() => setIsReportOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="udash__icon-btn-label">Report</span>
        </button>

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

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </header>
  )
}
