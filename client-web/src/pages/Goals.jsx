import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const EMOJIS = ['🎯', '🏠', '🚗', '✈️', '💍', '📱', '💻', '🎓', '💰', '🏖️']
const EMPTY = { name: '', targetAmount: '', targetDate: '', emoji: '🎯' }

export default function Goals() {
  const { currentUser } = useAuth()
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showFunds, setShowFunds] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [addAmount, setAddAmount] = useState('')

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)

  const load = () => api.get('/api/goals').then(r => setGoals(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/api/goals', form)
    setShowModal(false)
    setForm(EMPTY)
    load()
  }

  const handleAddFunds = async (e) => {
    e.preventDefault()
    await api.put(`/api/goals/${showFunds}`, { contribution: parseFloat(addAmount) })
    setShowFunds(null)
    setAddAmount('')
    load()
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">Goals</div>
          <div className="page-subtitle">{goals.length} goal{goals.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setShowModal(true) }}>+ Add Goal</button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎯</div><div className="empty-title">No goals yet</div><div className="empty-desc">Set a savings goal and track your progress</div></div>
      ) : goals.map(goal => {
        const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
        return (
          <div key={goal._id} className="card" style={{ marginBottom: '12px' }}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>{goal.emoji || '🎯'}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{goal.name}</div>
                  <div className="text-sm text-muted">Target: {fmt(goal.targetAmount)}</div>
                  {goal.targetDate && <div className="text-sm text-muted">By: {new Date(goal.targetDate).toLocaleDateString('en-IN')}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {goal.isCompleted
                  ? <span className="badge" style={{ background: 'rgba(67,233,123,0.15)', color: '#43e97b' }}>✅ Done</span>
                  : <div style={{ fontWeight: 700, color: '#43e97b' }}>{pct}%</div>}
                <div className="text-sm text-muted">{fmt(goal.savedAmount)} saved</div>
              </div>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {!goal.isCompleted && <button className="btn btn-ghost btn-sm" onClick={() => { setShowFunds(goal._id); setAddAmount('') }}>+ Add Funds</button>}
              <button className="btn btn-danger btn-sm" onClick={async () => { await api.delete(`/api/goals/${goal._id}`); load() }}>🗑️</button>
            </div>
          </div>
        )
      })}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Goal</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input className="form-input" placeholder="e.g. New Laptop" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount</label>
                <input className="form-input" type="number" placeholder="50000" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Target Date (optional)</label>
                <input className="form-input" type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setForm({ ...form, emoji: em })}
                      style={{ width: '40px', height: '40px', borderRadius: '10px', border: `2px solid ${form.emoji === em ? 'var(--accent)' : 'var(--border)'}`, background: 'var(--bg-card)', cursor: 'pointer', fontSize: '1.2rem' }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Add Goal</button>
            </form>
          </div>
        </div>
      )}

      {showFunds && (
        <div className="modal-overlay" onClick={() => setShowFunds(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Funds</span>
              <button className="modal-close" onClick={() => setShowFunds(null)}>✕</button>
            </div>
            <form onSubmit={handleAddFunds}>
              <div className="form-group">
                <label className="form-label">Amount to Add</label>
                <input className="form-input" type="number" placeholder="0.00" value={addAmount} onChange={e => setAddAmount(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Add Funds</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
