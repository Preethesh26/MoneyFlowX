import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const FUND_TYPES = ['Equity', 'Debt', 'Hybrid', 'Index', 'ELSS', 'Liquid']
const EMPTY = { fundName: '', monthlyAmount: '', sipDay: '', startDate: '', bankId: '' }

export default function SIP() {
  const { currentUser } = useAuth()
  const [sips, setSips] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)

  const load = () => api.get('/api/sip').then(r => setSips(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/sip', form)
      setShowModal(false)
      setForm(EMPTY)
      load()
    } catch (err) { setError(err.response?.data?.message || 'Error adding SIP') }
  }

  const handleContribution = async (id) => {
    await api.post(`/api/sip/${id}/contribution`)
    load()
  }

  const totalMonthly = sips.reduce((s, sip) => s + sip.monthlyAmount, 0)

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">SIP Tracker</div>
          <div className="page-subtitle">{sips.length} SIP{sips.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setError(''); setShowModal(true) }}>+ Add SIP</button>
      </div>

      {sips.length > 0 && (
        <div className="balance-card" style={{ background: 'var(--gradient-5)', marginBottom: '16px' }}>
          <div className="balance-label">Total Monthly Investment</div>
          <div className="balance-amount">{fmt(totalMonthly)}</div>
        </div>
      )}

      {sips.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📈</div><div className="empty-title">No SIPs added</div></div>
      ) : sips.map(sip => {
        const totalInvested = sip.contributions?.reduce((s, c) => s + c.amount, 0) || 0
        return (
          <div key={sip._id} className="card" style={{ marginBottom: '12px' }}>
            <div className="flex-between">
              <div>
                <div style={{ fontWeight: 700 }}>{sip.fundName}</div>
                <div className="text-sm text-muted">Bank: {sip.bank?.name} • SIP Day: {sip.sipDay}th</div>
                <div className="text-sm text-muted">Started: {new Date(sip.startDate).toLocaleDateString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#4facfe', fontSize: '1.1rem' }}>{fmt(sip.monthlyAmount)}/mo</div>
                <div className="text-sm text-muted">Invested: {fmt(totalInvested)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleContribution(sip._id)}>💰 Record</button>
              <button className="btn btn-danger btn-sm" onClick={async () => { await api.delete(`/api/sip/${sip._id}`); load() }}>🗑️</button>
            </div>
          </div>
        )
      })}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add SIP</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Fund Name</label><input className="form-input" placeholder="e.g. Mirae Asset Large Cap" value={form.fundName} onChange={e => setForm({ ...form, fundName: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Monthly Amount</label><input className="form-input" type="number" placeholder="1000" value={form.monthlyAmount} onChange={e => setForm({ ...form, monthlyAmount: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">SIP Day (1-31)</label><input className="form-input" type="number" min="1" max="31" placeholder="5" value={form.sipDay} onChange={e => setForm({ ...form, sipDay: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required /></div>
              <div className="form-group">
                <label className="form-label">Bank</label>
                <select className="form-select" value={form.bankId} onChange={e => setForm({ ...form, bankId: e.target.value })} required>
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Add SIP</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
