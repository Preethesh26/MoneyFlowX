import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Topbar() {
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const avatar = currentUser?.profilePicture
    ? `http://localhost:5000/${currentUser.profilePicture}`
    : null

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <div className="logo-icon">💸</div>
        MoneyFlowX
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {currentUser && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '24px', padding: '6px 12px 6px 6px',
                cursor: 'pointer', color: 'var(--text-primary)',
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--gradient-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'white', fontSize: '0.9rem', overflow: 'hidden',
              }}>
                {avatar
                  ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.name?.split(' ')[0]}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▾</span>
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '48px', right: 0,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '8px', minWidth: '160px',
                boxShadow: 'var(--shadow)', zIndex: 300,
              }}>
                <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                  {currentUser.email}
                </div>
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '10px 12px', background: 'none',
                  border: 'none', color: '#ff6584', cursor: 'pointer',
                  textAlign: 'left', fontSize: '0.9rem', fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
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
