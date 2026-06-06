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

  return (
    <aside style={{
      position: 'fixed', top: 'var(--topbar-height)', left: 0, bottom: 0,
      width: '220px', background: '#0f0f13',
      borderRight: '1px solid #1e1e2a',
      display: 'flex', flexDirection: 'column',
      padding: '16px 12px', zIndex: 90, overflowY: 'auto',
    }}>
      <nav style={{ flex: 1 }}>
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} end={link.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px', borderRadius: '12px',
              marginBottom: '4px', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.88rem',
              color: isActive ? 'white' : '#8080a0',
              background: isActive ? 'linear-gradient(135deg,#7c6bef,#a855f7)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
          >
            <span style={{ fontSize: '1rem' }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <button onClick={() => { logout(); navigate('/login') }}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '11px 14px', borderRadius: '12px',
          background: 'rgba(255,107,138,0.1)', border: 'none',
          color: '#ff6b8a', fontWeight: 600, fontSize: '0.88rem',
          cursor: 'pointer', width: '100%',
        }}>
        🚪 Logout
      </button>
    </aside>
  )
}
