import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#06b6d4', '#f97316', '#fbbf24', '#a78bfa']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Analytics() {
  const { currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n || 0)

  useEffect(() => {
    api.get('/api/analytics/expenses').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#50507a', fontSize: '2rem', animation: 'pulse 1s infinite' }}>◻</div>

  if (!data || (!data.byCategory?.length && !data.byMonth?.length)) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#50507a' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</div>
        <div style={{ fontWeight: 600, color: '#9090b0', marginBottom: '6px' }}>No analytics data yet</div>
        <div style={{ fontSize: '0.82rem' }}>Add expenses to see insights</div>
      </div>
    )
  }

  const pieData = data.byCategory?.map(c => ({ name: c._id, value: c.total })) || []
  const barData = data.byMonth?.map(m => ({ name: MONTHS[m._id.month - 1], total: m.total })) || []
  const dailyTotal = data.byType?.find(t => t._id === 'Daily')?.total || 0
  const otherTotal = data.byType?.find(t => t._id === 'Other')?.total || 0

  const Tip = ({ active, payload }) => active && payload?.length ? (
    <div style={{ background: '#0e0e18', border: '1px solid #222232', borderRadius: '10px', padding: '10px 14px' }}>
      <div style={{ color: '#f2f2fa', fontWeight: 700, fontSize: '0.85rem' }}>{payload[0].payload?.name || payload[0].name}</div>
      <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.82rem', marginTop: '2px' }}>{fmt(payload[0].value)}</div>
    </div>
  ) : null

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f2f2fa' }}>Analytics</div>
        <div style={{ color: '#50507a', fontSize: '0.82rem', marginTop: '2px' }}>Your spending insights</div>
      </div>

      {/* Daily vs Other */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Daily Expenses', value: fmt(dailyTotal), color: '#f97316', icon: '📅', bg: 'rgba(249,115,22,0.08)' },
          { label: 'Other Expenses', value: fmt(otherTotal), color: '#3b82f6', icon: '💳', bg: 'rgba(59,130,246,0.08)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
              <span style={{ color: '#9090b0', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</span>
            </div>
            <div style={{ color: s.color, fontSize: '1.6rem', fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div style={{ background: '#13131e', border: '1px solid #1a1a28', borderRadius: '18px', padding: '22px' }}>
            <div style={{ color: '#f2f2fa', fontWeight: 700, fontSize: '0.95rem', marginBottom: '18px' }}>By Category</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
              {pieData.slice(0, 5).map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: '#9090b0', fontSize: '0.78rem' }}>{d.name}</span>
                  </div>
                  <span style={{ color: '#f2f2fa', fontWeight: 600, fontSize: '0.78rem' }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar Chart */}
        {barData.length > 0 && (
          <div style={{ background: '#13131e', border: '1px solid #1a1a28', borderRadius: '18px', padding: '22px' }}>
            <div style={{ color: '#f2f2fa', fontWeight: 700, fontSize: '0.95rem', marginBottom: '18px' }}>Monthly Trend</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#50507a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#50507a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<Tip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={i === barData.length - 1 ? '#3b82f6' : '#222232'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
