import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const S = { card: '#15151f', border: '#252535', text: '#e0e0f0', sub: '#8080a0', muted: '#555570', accent: '#2563eb', success: '#059669', danger: '#ff6b8a' }
const inputStyle = { width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const labelStyle = { display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const EMOJIS = ['🎯', '🏠', '🚗', '✈️', '💍', '📱', '💻', '🎓', '💰', '🏖️']

export default function Goals() {
  const { currentUser } = useAuth()
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showFunds, setShowFunds] = useState(null)
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', emoji: '🎯' })
  const [addAmount, setAddAmount] = useState('')

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n || 0)
  const load = () => api.get('/api/goals').then(r => setGoals(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: S.text }}>Goals</div>
          <div style={{ color: S.muted, fontSize: '0.82rem', marginTop: '2px' }}>{goals.length} goal{goals.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => { setForm({ name: '', targetAmount: '', targetDate: '', emoji: '🎯' }); setShowModal(true) }}
          style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          + Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: S.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎯</div>
          <div style={{ fontWeight: 600, color: S.sub, marginBottom: '4px' }}>No goals yet</div>
          <div style={{ fontSize: '0.82rem' }}>Set a savings goal and track your progress</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
            return (
              <div key={goal._id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem' }}>{goal.emoji || '🎯'}</span>
                    <div>
                      <div style={{ color: S.text, fontWeight: 700, fontSize: '1rem' }}>{goal.name}</div>
                      <div style={{ color: S.muted, fontSize: '0.75rem', marginTop: '2px' }}>Target: {fmt(goal.targetAmount)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {goal.isCompleted
                      ? <span style={{ background: '#05966922', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>✅ Completed</span>
                      : <div style={{ color: '#059669', fontWeight: 700, fontSize: '1rem' }}>{pct}%</div>}
                    <div style={{ color: S.muted, fontSize: '0.72rem', marginTop: '2px' }}>{fmt(goal.savedAmount)} saved</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: '8px', background: '#1e1e2a', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: goal.isCompleted ? '#059669' : 'linear-gradient(90deg,#2563eb,#7c6bef)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!goal.isCompleted && (
                    <button onClick={() => { setShowFunds(goal._id); setAddAmount('') }}
                      style={{ flex: 1, padding: '8px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '10px', color: S.sub, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                      + Add Funds
                    </button>
                  )}
                  <button onClick={() => api.delete(`/api/goals/${goal._id}`).then(load)}
                    style={{ padding: '8px 14px', background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', borderRadius: '10px', color: S.danger, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Add Goal</span></div>
            <form onSubmit={async e => { e.preventDefault(); await api.post('/api/goals', form); setShowModal(false); load() }}>
              <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Goal Name</label><input style={inputStyle} placeholder="e.g. New Laptop" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Target Amount (₹)</label><input style={inputStyle} type="number" placeholder="50000" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} required /></div>
              <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Target Date (optional)</label><input style={inputStyle} type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} /></div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Icon</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {EMOJIS.map(em => (
                    <button type="button" key={em} onClick={() => setForm({ ...form, emoji: em })}
                      style={{ width: '40px', height: '40px', borderRadius: '10px', border: `2px solid ${form.emoji === em ? '#2563eb' : '#252535'}`, background: form.emoji === em ? '#1e3a8a22' : '#15151f', cursor: 'pointer', fontSize: '1.2rem' }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" style={{ width: '100%', background: '#059669', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Add Goal</button>
            </form>
          </div>
        </div>
      )}

      {showFunds && (
        <div className="modal-overlay" onClick={() => setShowFunds(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Add Funds</span></div>
            <form onSubmit={async e => { e.preventDefault(); await api.put(`/api/goals/${showFunds}`, { contribution: parseFloat(addAmount) }); setShowFunds(null); load() }}>
              <div style={{ marginBottom: '20px' }}><label style={labelStyle}>Amount (₹)</label><input style={inputStyle} type="number" placeholder="0.00" value={addAmount} onChange={e => setAddAmount(e.target.value)} required /></div>
              <button type="submit" style={{ width: '100%', background: '#059669', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Add Funds</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
