import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './signup.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setMsg('')

    if (!token) {
      setErrorMsg("Invalid or missing reset token.")
      return
    }

    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match.")
      return
    }

    const pwd = form.password;
    if (pwd.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(pwd)) {
      setErrorMsg("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(pwd)) {
      setErrorMsg("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(pwd)) {
      setErrorMsg("Password must contain at least one digit.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: form.password })
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = "Reset failed";
        if (data.detail) {
          errorMessage = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        }
        throw new Error(errorMessage);
      }
      setMsg(data.message);
      setTimeout(() => navigate('/signup'), 3000)
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
          <h1 className="signup__heading">Reset Password</h1>
          <p className="signup__subheading">Enter your new password below.</p>
        </div>

        <form className="signup__form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="signup__field">
              <label className="signup__label">New Password</label>
              <div className="signup__input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input type={showPassword ? 'text' : 'password'} name="password"
                  placeholder="Min. 8 chars" value={form.password} onChange={handleChange}
                  className="signup__input" required minLength={8} />
              </div>
            </div>

            <div className="signup__field">
              <label className="signup__label">Confirm Password</label>
              <div className="signup__input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword"
                  placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange}
                  className="signup__input" required />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button type="button" className="signup__eye" onClick={() => setShowPassword(!showPassword)} style={{ position: 'relative', right: 0, top: 0, transform: 'none' }}>
                {showPassword ? 'Hide passwords' : 'Show passwords'}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
            Must be at least 8 characters with uppercase, lowercase, and a digit.
          </p>

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
            Reset Password
          </button>
        </form>
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
