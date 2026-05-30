import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const EMPTY = { loanName: '', totalAmount: '', emiAmount: '', dueDay: '', startDate: '', endDate: '', bankId: '' }

export default function EMI() {
  const { currentUser } = useAuth()
  const [emis, setEmis] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)

  const load = () => api.get('/api/emi').then(r => setEmis(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/emi', form)
      setShowModal(false)
      setForm(EMPTY)
      load()
    } catch (err) { setError(err.response?.data?.message || 'Error adding EMI') }
  }

  const handlePayment = async (id) => {
    await api.post(`/api/emi/${id}/payment`)
    load()
  }

  const totalMonthly = emis.filter(e => !e.isFullyPaid).reduce((s, e) => s + e.emiAmount, 0)

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">EMI Tracker</div>
          <div className="page-subtitle">{emis.length} EMI{emis.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setError(''); setShowModal(true) }}>+ Add EMI</button>
      </div>

      {emis.length > 0 && (
        <div className="balance-card" style={{ background: 'var(--gradient-4)', marginBottom: '16px' }}>
          <div className="balance-label">Total Monthly EMI</div>
          <div className="balance-amount">{fmt(totalMonthly)}</div>
        </div>
      )}

      {emis.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No EMIs added</div></div>
      ) : emis.map(emi => {
        const totalPaid = emi.payments?.reduce((s, p) => s + p.amount, 0) || 0
        const remaining = emi.totalAmount - totalPaid
        const pct = Math.min(100, Math.round((totalPaid / emi.totalAmount) * 100))
        return (
          <div key={emi._id} className="card" style={{ marginBottom: '12px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{emi.loanName}</div>
                <div className="text-sm text-muted">Bank: {emi.bank?.name} • Due: {emi.dueDay}th</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {emi.isFullyPaid
                  ? <span className="badge" style={{ background: 'rgba(67,233,123,0.15)', color: '#43e97b' }}>✅ Paid</span>
                  : <div style={{ fontWeight: 700, color: '#ff6584' }}>{fmt(emi.emiAmount)}/mo</div>}
                <div className="text-sm text-muted">Remaining: {fmt(remaining)}</div>
              </div>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--gradient-4)' }} /></div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {!emi.isFullyPaid && <button className="btn btn-ghost btn-sm" onClick={() => handlePayment(emi._id)}>💳 Pay EMI</button>}
              <button className="btn btn-danger btn-sm" onClick={async () => { await api.delete(`/api/emi/${emi._id}`); load() }}>🗑️</button>
            </div>
          </div>
        )
      })}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add EMI</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Loan Name</label><input className="form-input" placeholder="e.g. Home Loan" value={form.loanName} onChange={e => setForm({ ...form, loanName: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Total Amount</label><input className="form-input" type="number" placeholder="500000" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Monthly EMI</label><input className="form-input" type="number" placeholder="5000" value={form.emiAmount} onChange={e => setForm({ ...form, emiAmount: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Due Day (1-31)</label><input className="form-input" type="number" min="1" max="31" placeholder="5" value={form.dueDay} onChange={e => setForm({ ...form, dueDay: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required /></div>
              <div className="form-group">
                <label className="form-label">Bank</label>
                <select className="form-select" value={form.bankId} onChange={e => setForm({ ...form, bankId: e.target.value })} required>
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Add EMI</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
