import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { token, password: form.password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-icon">💸</div>
        <div className="auth-logo-name">MoneyFlowX</div>
      </div>
      <div className="auth-card slide-up">
        <h2 className="auth-title">Set new password</h2>
        <p className="auth-subtitle">Enter your new password below</p>
        {success ? (
          <div style={{ background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)', color: '#43e97b', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            Password reset! Redirecting to login...
          </div>
        ) : (
          <>
            {error && <div className="error-msg">{error}</div>}
            {!token ? (
              <div className="error-msg">Invalid reset link. <Link to="/login">Go back to login</Link></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      style={{ paddingRight: '44px' }} required />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="Repeat password"
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
