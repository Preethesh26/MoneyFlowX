import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuItems = [
  { icon: '🎯', label: 'Goals', desc: 'Track savings goals', path: '/goals', color: '#43e97b' },
  { icon: '📋', label: 'EMI', desc: 'Manage loan EMIs', path: '/emi', color: '#ff6584' },
  { icon: '📈', label: 'SIP', desc: 'Track SIP investments', path: '/sip', color: '#4facfe' },
  { icon: '📝', label: 'Notes', desc: 'Reminders & notes', path: '/notes', color: '#f7971e' },
  { icon: '📊', label: 'Analytics', desc: 'Spending insights', path: '/analytics', color: '#a855f7' },
]

export default function More() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '1.4rem', flexShrink: 0 }}>
          {currentUser?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{currentUser?.name}</div>
          <div className="text-sm text-muted">{currentUser?.email}</div>
        </div>
      </div>
      {menuItems.map(item => (
        <div key={item.path} className="list-item" style={{ cursor: 'pointer' }} onClick={() => navigate(item.path)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{item.icon}</div>
            <div><div style={{ fontWeight: 600 }}>{item.label}</div><div className="text-sm text-muted">{item.desc}</div></div>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
        </div>
      ))}
      <button className="btn btn-danger btn-full" style={{ marginTop: '20px' }} onClick={() => { logout(); navigate('/login') }}>🚪 Logout</button>
    </div>
  )
}
