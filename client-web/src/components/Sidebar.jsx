import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/banks', icon: '🏦', label: 'Banks' },
  { to: '/expenses', icon: '💳', label: 'Expenses' },
  { to: '/transfers', icon: '🔄', label: 'Transfers' },
  { to: '/goals', icon: '🎯', label: 'Goals' },
  { to: '/emi', icon: '📋', label: 'EMI' },
  { to: '/sip', icon: '📈', label: 'SIP' },
  { to: '/notes', icon: '📝', label: 'Notes' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{
      position: 'fixed', top: 'var(--topbar-height)', left: 0, bottom: 0,
      width: '220px', background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '16px 12px', zIndex: 90,
      overflowY: 'auto',
    }}>
      <nav style={{ flex: 1 }}>
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px', borderRadius: 'var(--radius-sm)',
              marginBottom: '4px', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.9rem',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-1)' : 'transparent',
              transition: 'var(--transition)',
            })}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '11px 14px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(255,101,132,0.1)', border: 'none',
          color: '#ff6584', fontWeight: 600, fontSize: '0.9rem',
          cursor: 'pointer', width: '100%',
        }}
      >
        🚪 Logout
      </button>
    </aside>
  )
}
