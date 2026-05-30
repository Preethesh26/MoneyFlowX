import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: '🏠', label: 'Home', end: true },
  { to: '/expenses', icon: '💳', label: 'Expenses' },
  { to: '/banks', icon: '🏦', label: 'Banks' },
  { to: '/transfers', icon: '🔄', label: 'Transfer' },
  { to: '/more', icon: '⋯', label: 'More' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" style={{ display: 'none' }} id="bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
