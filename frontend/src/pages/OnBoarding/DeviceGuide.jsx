import { useParams, useNavigate } from 'react-router-dom'
import './DeviceGuide.css'
import android1 from '../../assets/android_1.jpeg'
import android2 from '../../assets/android_2.jpeg'
import android3 from '../../assets/android_3.jpeg'
import android4 from '../../assets/android_4.jpeg'

export default function DeviceGuide() {
  const { deviceName } = useParams()
  const navigate = useNavigate()

  return (
    <div className="dguide">
      <div className="dguide__container">
        
        <header className="dguide__header">
          <button className="dguide__back" onClick={() => navigate('/onboarding?mode=cloud&step=4')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Onboarding
          </button>
        </header>

        <main className="dguide__content">
          <div className="dguide__hero">
            <h1 className="dguide__title">How to set up ShieldBlock on {deviceName}</h1>
            <p className="dguide__subtitle">
              Follow these simple steps to enable ad-blocking and privacy protection on your {deviceName} device.
            </p>
          </div>

          {deviceName.toLowerCase() === 'android' ? (
            <div className="dguide__steps-images" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
              <div className="dguide__step-img">
                <img src={android1} alt="Android Step 1" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-subtle)', display: 'block', margin: '0 auto' }} />
              </div>
              <div className="dguide__step-img">
                <img src={android2} alt="Android Step 2" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-subtle)', display: 'block', margin: '0 auto' }} />
              </div>
              <div className="dguide__step-img">
                <img src={android3} alt="Android Step 3" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-subtle)', display: 'block', margin: '0 auto' }} />
              </div>
              <div className="dguide__step-img">
                <img src={android4} alt="Android Step 4" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border-subtle)', display: 'block', margin: '0 auto' }} />
              </div>
            </div>
          ) : (
            <div className="dguide__placeholder">
              <div className="dguide__placeholder-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="var(--green)" strokeWidth="1.5"/>
                  <path d="M12 16v-4M12 8h.01" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="dguide__placeholder-title">Guide Content Coming Soon</h2>
              <p className="dguide__placeholder-text">
                We are currently preparing detailed, step-by-step instructions for <strong>{deviceName}</strong>. 
                Please check back shortly or use the global DNS settings provided in the previous step.
              </p>
            </div>
          )}

          <section className="dguide__section">
            <h3 className="dguide__section-title">General Information</h3>
            <div className="dguide__card">
              <p>
                ShieldBlock uses encrypted DNS (DoH/DoT) to filter out ads and trackers before they even reach your device. 
                For {deviceName}, this usually involves adding a Private DNS hostname or installing a configuration profile.
              </p>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
