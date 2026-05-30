import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const EMPTY = { fromBankId: '', toBankId: '', amount: '', notes: '' }

export default function Transfers() {
  const { currentUser } = useAuth()
  const [transfers, setTransfers] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)

  const load = () => api.get('/api/transfers').then(r => setTransfers(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/transfers', form)
      setShowModal(false)
      setForm(EMPTY)
      load()
    } catch (err) { setError(err.response?.data?.message || 'Transfer failed') }
  }

  const handleDelete = async (id) => {
    await api.delete(`/api/transfers/${id}`)
    load()
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">Transfers</div>
          <div className="page-subtitle">{transfers.length} transfer{transfers.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setError(''); setShowModal(true) }}>+ Transfer</button>
      </div>

      <div className="card">
        {transfers.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔄</div><div className="empty-title">No transfers yet</div></div>
        ) : transfers.map(t => (
          <div key={t._id} className="transaction-item">
            <div className="txn-icon" style={{ background: 'rgba(79,172,254,0.15)' }}>🔄</div>
            <div className="txn-info">
              <div className="txn-name">{t.fromBank?.name} → {t.toBank?.name}</div>
              <div className="txn-meta">{t.notes || 'Transfer'} • {new Date(t.date).toLocaleDateString('en-IN')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <div className="txn-amount" style={{ color: '#4facfe' }}>{fmt(t.amount)}</div>
              <button onClick={() => handleDelete(t._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Transfer Money</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">From Bank</label>
                <select className="form-select" value={form.fromBankId} onChange={e => setForm({ ...form, fromBankId: e.target.value })} required>
                  <option value="">Select source bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name} ({fmt(b.balance)})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">To Bank</label>
                <select className="form-select" value={form.toBankId} onChange={e => setForm({ ...form, toBankId: e.target.value })} required>
                  <option value="">Select destination bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" placeholder="Reason for transfer" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Transfer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
