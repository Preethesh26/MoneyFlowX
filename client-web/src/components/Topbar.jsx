import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Topbar() {
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const initial = currentUser?.name?.charAt(0).toUpperCase() || '?'

  return (
    <header className="topbar">
      {/* Left — logo (visible on mobile only since sidebar handles desktop) */}
      <div className="topbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="logo-icon">
          <img src="/logo.png" alt="MoneyFlowX" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.2px' }}>MoneyFlowX</span>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {currentUser && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#13131e', border: '1px solid #222232',
              borderRadius: '22px', padding: '5px 12px 5px 5px',
              cursor: 'pointer',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'white', fontSize: '0.8rem', flexShrink: 0,
              }}>{initial}</div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f2f2fa' }}>
                {currentUser.name?.split(' ')[0]}
              </span>
              <span style={{ fontSize: '0.6rem', color: '#50507a' }}>▾</span>
            </button>

            {open && (
              <div onClick={() => setOpen(false)} style={{
                position: 'fixed', inset: 0, zIndex: 199,
              }} />
            )}
            {open && (
              <div style={{
                position: 'absolute', top: '44px', right: 0,
                background: '#0e0e18', border: '1px solid #222232',
                borderRadius: '14px', padding: '8px', minWidth: '180px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 200,
              }}>
                <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #1a1a28', marginBottom: '4px' }}>
                  <div style={{ color: '#f2f2fa', fontWeight: 600, fontSize: '0.85rem' }}>{currentUser.name}</div>
                  <div style={{ color: '#50507a', fontSize: '0.72rem', marginTop: '2px' }}>{currentUser.email}</div>
                </div>
                <button onClick={() => { logout(); navigate('/login') }} style={{
                  width: '100%', padding: '9px 12px', background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.15)', borderRadius: '9px',
                  color: '#f87171', fontWeight: 600, fontSize: '0.82rem',
                  cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  ↩ Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
