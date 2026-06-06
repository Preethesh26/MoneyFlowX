import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Topbar() {
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const initial = currentUser?.name?.charAt(0).toUpperCase() || '?'

  return (
    <header className="topbar" style={{ background: '#0f0f13', borderBottom: '1px solid #1e1e2a' }}>
      <div className="topbar-logo">
        <img src="/logo.png" alt="MoneyFlowX" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'contain' }} />
        MoneyFlowX
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme"
          style={{ background: '#1a1a2e', border: '1px solid #2e2e4a', color: 'var(--text-primary)' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {currentUser && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#1a1a2e', border: '1px solid #2e2e4a',
                borderRadius: '24px', padding: '5px 12px 5px 5px',
                cursor: 'pointer',
              }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c6bef,#a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'white', fontSize: '0.85rem',
              }}>{initial}</div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#d0d0e0' }}>
                {currentUser.name?.split(' ')[0]}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#555570' }}>▾</span>
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '46px', right: 0,
                background: '#1a1a2e', border: '1px solid #2e2e4a',
                borderRadius: '14px', padding: '8px', minWidth: '168px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 300,
              }}>
                <div style={{ padding: '8px 12px', fontSize: '0.78rem', color: '#555570', borderBottom: '1px solid #2e2e4a', marginBottom: '4px' }}>
                  {currentUser.email}
                </div>
                <button onClick={() => { logout(); navigate('/login') }} style={{
                  width: '100%', padding: '10px 12px', background: 'none',
                  border: 'none', color: '#ff6b8a', cursor: 'pointer',
                  textAlign: 'left', fontSize: '0.88rem', fontWeight: 600,
                  borderRadius: '8px',
                }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
