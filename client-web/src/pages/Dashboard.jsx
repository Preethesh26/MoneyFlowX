import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const CAT_ICONS = { Food: '🍔', Fuel: '⛽', Shopping: '🛍️', Bills: '📄', Travel: '✈️', Medical: '💊', Rent: '🏠', Insurance: '🛡️', Others: '📦', Tea: '☕', Snacks: '🍿', Transport: '🚌', Hospital: '🏥' }

export default function Dashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/analytics/summary')
      .then(r => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)

  const quickActions = [
    { icon: '➕', label: 'Add Expense', path: '/expenses', bg: 'var(--gradient-4)' },
    { icon: '🏦', label: 'Add Bank', path: '/banks', bg: 'var(--gradient-1)' },
    { icon: '🔄', label: 'Transfer', path: '/transfers', bg: 'var(--gradient-5)' },
    { icon: '🎯', label: 'Goals', path: '/goals', bg: 'var(--gradient-3)' },
  ]

  if (loading) return <div className="empty-state"><div className="empty-icon" style={{ animation: 'pulse 1s infinite' }}>💸</div></div>

  return (
    <div>
      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-label">👋 Hello, {currentUser?.name?.split(' ')[0]}</div>
        <div className="balance-amount">{fmt(summary?.totalBalance)}</div>
        <div className="balance-sub">Total Balance</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Savings</div>
          <div className="stat-value green">{fmt(summary?.totalSavings)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today</div>
          <div className="stat-value orange">{fmt(summary?.todayDailyExpenses)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly</div>
          <div className="stat-value red">{fmt(summary?.monthlyTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Other Exp.</div>
          <div className="stat-value blue">{fmt(summary?.monthlyOtherExpenses)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header"><span className="section-title">Quick Actions</span></div>
      <div className="quick-actions">
        {quickActions.map(qa => (
          <div key={qa.label} className="quick-action" onClick={() => navigate(qa.path)}>
            <div className="qa-icon" style={{ background: qa.bg }}>{qa.icon}</div>
            <span className="qa-label">{qa.label}</span>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/emi')}>
          <div className="stat-label">Active EMIs</div>
          <div className="stat-value">{summary?.counts?.emis || 0}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/sip')}>
          <div className="stat-label">SIPs</div>
          <div className="stat-value">{summary?.counts?.sips || 0}</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/goals')}>
          <div className="stat-label">Goals</div>
          <div className="stat-value">{summary?.counts?.goals || 0}</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="section-header">
        <span className="section-title">Recent Transactions</span>
        <span className="section-link" onClick={() => navigate('/expenses')}>See all</span>
      </div>
      <div className="card">
        {!summary?.recentTransactions?.length ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-desc">Add your first expense to get started</div>
          </div>
        ) : (
          summary.recentTransactions.map(txn => (
            <div key={txn._id} className="transaction-item">
              <div className="txn-icon" style={{ background: 'rgba(108,99,255,0.15)' }}>
                {txn.txnType === 'transfer' ? '🔄' : (CAT_ICONS[txn.category] || '📦')}
              </div>
              <div className="txn-info">
                <div className="txn-name">
                  {txn.txnType === 'transfer'
                    ? `${txn.fromBank?.name} → ${txn.toBank?.name}`
                    : (txn.notes || txn.category)}
                </div>
                <div className="txn-meta">
                  {txn.txnType === 'transfer' ? 'Transfer' : `${txn.category} • ${txn.paymentMethod}`}
                  {' • '}{new Date(txn.date).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div className={`txn-amount ${txn.txnType === 'transfer' ? '' : 'debit'}`}>
                {txn.txnType === 'transfer' ? '' : '-'}{fmt(txn.amount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
