import { useState } from 'react'
import ReactDOM from 'react-dom'
import './ReportModal.css'

export default function ReportModal({ isOpen, onClose }) {
  const [selectedTime, setSelectedTime] = useState('5min')
  const [customTime, setCustomTime] = useState('')

  if (!isOpen) return null

  const timeOptions = [
    { id: '5min', label: '5 min' },
    { id: '10min', label: '10 min' },
    { id: '30min', label: '30 min' },
    { id: '1hour', label: '1 hour' },
  ]

  const modalContent = (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <div className="report-modal__header">
          <div className="report-modal__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="#ff4757" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 8v4M12 16h.01" stroke="#ff4757" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="report-modal__title">Report Missed Ad</h2>
          <button className="report-modal__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="report-modal__body">
          <p className="report-modal__text">
            Have you seen an ad while ShieldBlock was active? Let us know when it appeared so we can improve our filters.
          </p>

          <div className="report-modal__time-section">
            <span className="report-modal__label">When did you see it?</span>
            <div className="report-modal__time-grid">
              {timeOptions.map(opt => (
                <button
                  key={opt.id}
                  className={`report-modal__time-btn ${selectedTime === opt.id ? 'report-modal__time-btn--active' : ''}`}
                  onClick={() => {
                    setSelectedTime(opt.id)
                    setCustomTime('')
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="report-modal__custom-time">
              <input
                type="text"
                className={`report-modal__input ${selectedTime === 'custom' ? 'report-modal__input--active' : ''}`}
                placeholder="Or specify custom time (e.g. 2 hours)"
                value={customTime}
                onChange={(e) => {
                  setCustomTime(e.target.value)
                  if (e.target.value) setSelectedTime('custom')
                  else setSelectedTime('5min')
                }}
                onFocus={() => setSelectedTime('custom')}
              />
            </div>
          </div>

          <div className="report-modal__info-card">
            <p>
              By clicking <strong>Allow</strong>, you grant ShieldBlock temporary access to analyze your recent network logs ({selectedTime === 'custom' && customTime ? customTime : selectedTime}) to identify and block the missing ad domain.
            </p>
          </div>
        </div>

        <div className="report-modal__footer">
          <button className="report-modal__btn-cancel" onClick={onClose}>Cancel</button>
          <button className="report-modal__btn-allow" onClick={() => {
            const finalTime = selectedTime === 'custom' && customTime ? customTime : selectedTime
            alert(`Access granted for the last ${finalTime}. We are analyzing the logs to block the ad.`);
            onClose();
          }}>
            Allow & Block
          </button>
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}
