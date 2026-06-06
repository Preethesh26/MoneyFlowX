import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
      {show ? '🙈' : '👁️'}
    </button>
  )

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <div className="auth-logo-icon">💸</div>
        <div className="auth-logo-name">MoneyFlowX</div>
        <div className="auth-logo-tagline">Smart Finance, Simplified</div>
      </div>
      <div className="auth-card slide-up">
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Start managing your finances</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="John Doe"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: '44px' }} required />
              <EyeBtn show={showPass} toggle={() => setShowPass(p => !p)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                style={{ paddingRight: '44px' }} required />
              <EyeBtn show={showConfirm} toggle={() => setShowConfirm(p => !p)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
