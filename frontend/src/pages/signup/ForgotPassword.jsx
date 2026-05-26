import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './signup.css'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setMsg('')

    try {
      const response = await fetch("http://localhost:8000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }
      setMsg(data.message);
    } catch (err) {
      setErrorMsg(err.message);
    }
  }

  return (
    <div className="signup">
      <div className="signup__left">
        <div className="signup__logo" onClick={() => navigate('/')}>
          <div className="signup__logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" fill="var(--green)" />
              <path d="M9 12l2 2 4-4" stroke="#080c0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="signup__logo-text"><span>Shield</span>Block</span>
        </div>

        <div className="signup__heading-block" style={{ marginTop: '40px' }}>
          <h1 className="signup__heading">Forgot Password</h1>
          <p className="signup__subheading">Enter your email to receive a password reset link.</p>
        </div>

        <form className="signup__form" onSubmit={handleSubmit}>
          <div className="signup__field">
            <label className="signup__label">Email address</label>
            <div className="signup__input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input type="email" name="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} className="signup__input" required />
            </div>
          </div>

          {msg && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'rgba(52, 168, 83, 0.08)', border: '1px solid rgba(52, 168, 83, 0.2)', color: 'var(--green)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.4' }}>
              <span>{msg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'rgba(255, 77, 79, 0.08)', border: '1px solid rgba(255, 77, 79, 0.2)', color: '#ff4d4f', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.4' }}>
              <span>{errorMsg}</span>
            </div>
          )}

          <button type="submit" className="signup__submit">
            Send Reset Link
          </button>
        </form>

        <p className="signup__signin" style={{ marginTop: '20px' }}>
          Remember your password?{' '}
          <span className="signup__signin-link" onClick={() => navigate('/signup')}>Sign in</span>
        </p>
      </div>

      <div className="signup__right">
        <div className="signup__right-inner">
          <div className="signup__right-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 5.5V11c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V5.5L12 2z" stroke="var(--green)" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <blockquote className="signup__quote">
            "Securely recover your account and get back to protecting your network."
          </blockquote>
          <p className="signup__right-footer">ShieldBlock · Secure Account Recovery</p>
        </div>
      </div>
    </div>
  )
}
