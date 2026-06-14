import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', icon: '⬡', label: 'Dashboard', end: true },
  { to: '/banks', icon: '🏦', label: 'Banks' },
  { to: '/expenses', icon: '💳', label: 'Expenses' },
  { to: '/transfers', icon: '⇄', label: 'Transfers' },
  { to: '/goals', icon: '◎', label: 'Goals' },
  { to: '/emi', icon: '📋', label: 'EMI' },
  { to: '/sip', icon: '📈', label: 'SIP' },
  { to: '/notes', icon: '📝', label: 'Notes' },
  { to: '/analytics', icon: '◻', label: 'Analytics' },
]

export default function Sidebar() {
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()
  const initial = currentUser?.name?.charAt(0).toUpperCase() || '?'

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: '240px', background: '#080810',
      borderRight: '1px solid #1a1a28',
      display: 'flex', flexDirection: 'column',
      zIndex: 90,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1a1a28' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', overflow: 'hidden', background: '#13131e', border: '1px solid #222232', flexShrink: 0 }}>
            <img src="/logo.png" alt="M" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ color: '#f2f2fa', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.2px' }}>MoneyFlowX</div>
            <div style={{ color: '#50507a', fontSize: '0.68rem', marginTop: '1px' }}>Finance Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <div style={{ color: '#50507a', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 10px 6px' }}>Menu</div>
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} end={link.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px',
              marginBottom: '2px', textDecoration: 'none',
              fontWeight: isActive ? 700 : 500, fontSize: '0.86rem',
              color: isActive ? '#f2f2fa' : '#9090b0',
              background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
              borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <span style={{ fontSize: '0.9rem', width: '18px', textAlign: 'center', flexShrink: 0 }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid #1a1a28' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#13131e', border: '1px solid #1a1a28', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem', flexShrink: 0 }}>{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#f2f2fa', fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.name}</div>
            <div style={{ color: '#50507a', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '10px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', color: '#f87171', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
          <span>↩</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
