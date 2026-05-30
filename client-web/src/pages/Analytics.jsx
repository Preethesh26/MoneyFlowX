import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const COLORS = ['#6c63ff', '#f7971e', '#43e97b', '#ff6584', '#4facfe', '#a855f7', '#ffd200', '#38f9d7']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Analytics() {
  const { currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)

  useEffect(() => {
    api.get('/api/analytics/expenses')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="empty-state"><div className="empty-icon" style={{ animation: 'pulse 1s infinite' }}>📊</div></div>
  if (!data) return <div className="empty-state"><div className="empty-title">No analytics data yet</div></div>

  const pieData = data.byCategory?.map(c => ({ name: c._id, value: c.total })) || []
  const barData = data.byMonth?.map(m => ({ name: `${MONTHS[m._id.month - 1]} ${m._id.year}`, total: m.total })) || []
  const dailyTotal = data.byType?.find(t => t._id === 'Daily')?.total || 0
  const otherTotal = data.byType?.find(t => t._id === 'Other')?.total || 0

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px' }}>
          <div style={{ fontWeight: 700 }}>{payload[0].name || payload[0].payload?.name}</div>
          <div style={{ color: 'var(--accent)' }}>{fmt(payload[0].value)}</div>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Analytics</div>
        <div className="page-subtitle">Your spending insights</div>
      </div>

      {/* Daily vs Other */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">Daily Expenses</div>
          <div className="stat-value orange">{fmt(dailyTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Other Expenses</div>
          <div className="stat-value blue">{fmt(otherTotal)}</div>
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="section-title" style={{ marginBottom: '16px' }}>Expense by Category</div>
        {pieData.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}><div className="empty-desc">No expense data yet</div></div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Bar Chart */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: '16px' }}>Monthly Expenses (Last 6 Months)</div>
        {barData.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}><div className="empty-desc">No monthly data yet</div></div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6c63ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
