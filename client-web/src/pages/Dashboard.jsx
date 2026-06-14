import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const CAT_ICONS = { Food: '🍔', Fuel: '⛽', Shopping: '🛍️', Bills: '📄', Travel: '✈️', Medical: '💊', Rent: '🏠', Tea: '☕', Snacks: '🍿', Transport: '🚌', Other: '📦' }

export default function Dashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/analytics/summary').then(r => setSummary(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = currentUser?.name?.split(' ')[0] || ''
  const initial = currentUser?.name?.charAt(0).toUpperCase() || '?'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontSize: '2rem' }}>
      <span style={{ animation: 'pulse 1s infinite' }}>💸</span>
    </div>
  )

  const stats = [
    { label: 'SAVINGS', value: fmt(summary?.totalSavings), color: '#2dd883', icon: '💰' },
    { label: 'TODAY', value: fmt(summary?.todayDailyExpenses), color: '#f7971e', icon: '📅' },
    { label: 'MONTHLY', value: fmt(summary?.monthlyTotal), color: '#ff6b8a', icon: '📊' },
    { label: 'OTHER EXP.', value: fmt(summary?.monthlyOtherExpenses), color: '#4facfe', icon: '💳' },
  ]

  const quickActions = [
    { icon: '➕', label: 'Add Expense', path: '/expenses', bg: 'linear-gradient(135deg,#ff6b8a,#ff4757)' },
    { icon: '🏦', label: 'Add Bank', path: '/banks', bg: 'linear-gradient(135deg,#7c6bef,#a855f7)' },
    { icon: '🔄', label: 'Bank Transfer', path: '/transfers', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
    { icon: '🎯', label: 'Goals', path: '/goals', bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  ]

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>{greeting}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Hi, <span style={{ color: '#9f8dff' }}>{firstName}</span> 👋
          </div>
        </div>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c6bef,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, color: 'white', fontSize: '1.1rem',
          border: '2px solid #7c6bef',
        }}>{initial}</div>
      </div>

      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg,#1a1a2e,#2e2e4a)',
        border: '1px solid #3e3e5a',
        borderRadius: '20px', padding: '24px', marginBottom: '20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ color: '#555570', fontSize: '0.75rem', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>TOTAL BALANCE</div>
        <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>{fmt(summary?.totalBalance)}</div>
        <div style={{ color: '#555570', fontSize: '0.8rem', marginTop: '4px' }}>Across all accounts</div>
        <div style={{ marginTop: '12px', display: 'inline-flex', background: '#0d2d1f', borderRadius: '20px', padding: '4px 12px' }}>
          <span style={{ color: '#2dd883', fontSize: '0.75rem', fontWeight: 600 }}>↑ This month</span>
        </div>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(124,107,239,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(79,172,254,0.08)', pointerEvents: 'none' }} />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#15151f', border: '1px solid #252535', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ color: '#555570', fontSize: '0.7rem', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '6px' }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: '1.1rem', fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-header"><span className="section-title">Quick Actions</span></div>
      <div className="quick-actions" style={{ marginBottom: '24px' }}>
        {quickActions.map(qa => (
          <div key={qa.label} className="quick-action" onClick={() => navigate(qa.path)}>
            <div className="qa-icon" style={{ background: qa.bg }}>{qa.icon}</div>
            <span className="qa-label">{qa.label}</span>
          </div>
        ))}
      </div>

      {/* Summary Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Active EMIs', count: summary?.counts?.emis || 0, path: '/emi' },
          { label: 'SIPs', count: summary?.counts?.sips || 0, path: '/sip' },
          { label: 'Goals', count: summary?.counts?.goals || 0, path: '/goals' },
        ].map(p => (
          <div key={p.label} onClick={() => navigate(p.path)} style={{ background: '#15151f', border: '1px solid #252535', borderRadius: '14px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800 }}>{p.count}</div>
            <div style={{ color: '#555570', fontSize: '0.72rem', marginTop: '4px' }}>{p.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="section-header">
        <span className="section-title">Recent Transactions</span>
        <span className="section-link" onClick={() => navigate('/expenses')}>See all</span>
      </div>
      <div style={{ background: '#15151f', border: '1px solid #252535', borderRadius: '18px', overflow: 'hidden' }}>
        {!summary?.recentTransactions?.length ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-desc">Add your first expense to get started</div>
          </div>
        ) : (
          summary.recentTransactions.map((txn, i) => (
            <div key={txn._id} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px',
              borderBottom: i < summary.recentTransactions.length - 1 ? '1px solid #1e1e2a' : 'none',
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: txn.txnType === 'transfer' ? '#1a1e2a' : '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                {txn.txnType === 'transfer' ? '🔄' : (CAT_ICONS[txn.category] || '📦')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#d0d0e0', fontWeight: 600, fontSize: '0.88rem' }}>
                  {txn.txnType === 'transfer' ? `${txn.fromBank?.name} → ${txn.toBank?.name}` : (txn.notes || txn.category)}
                </div>
                <div style={{ color: '#555570', fontSize: '0.72rem', marginTop: '2px' }}>
                  {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div style={{ color: txn.txnType === 'transfer' ? '#4facfe' : '#ff6b8a', fontWeight: 700, fontSize: '0.88rem' }}>
                {txn.txnType === 'transfer' ? '' : '-'}{fmt(txn.amount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
