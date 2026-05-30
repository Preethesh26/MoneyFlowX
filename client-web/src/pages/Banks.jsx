import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const PURPOSES = ['Salary', 'Daily', 'Savings', 'SIP', 'EMI', 'Investment']
const PURPOSE_CLASS = { Salary: 'purpose-salary', Savings: 'purpose-savings', Daily: 'purpose-daily', SIP: 'purpose-sip', EMI: 'purpose-emi', Investment: 'purpose-savings' }
const EMPTY = { name: '', purpose: 'Salary', balance: '' }

export default function Banks() {
  const { currentUser } = useAuth()
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)

  const load = () => api.get('/api/banks').then(r => setBanks(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true) }
  const openEdit = (b) => { setEditing(b._id); setForm({ name: b.name, purpose: b.purpose, balance: b.balance }); setError(''); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) await api.put(`/api/banks/${editing}`, form)
      else await api.post('/api/banks', form)
      setShowModal(false)
      load()
    } catch (err) { setError(err.response?.data?.message || 'Error saving bank') }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/banks/${id}`)
      load()
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete bank'
      const counts = err.response?.data?.counts
      alert(counts ? `${msg}\nExpenses: ${counts.expenses}, Transfers: ${counts.transfers}, EMIs: ${counts.emis}, SIPs: ${counts.sips}` : msg)
    }
  }

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">Banks</div>
          <div className="page-subtitle">{banks.length} account{banks.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Bank</button>
      </div>

      {banks.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🏦</div><div className="empty-title">No banks added</div><div className="empty-desc">Add your first bank account</div></div>
      ) : banks.map(bank => (
        <div key={bank._id} className="bank-card">
          <div className="bank-header">
            <div className="bank-name">{bank.name}</div>
            <span className={`bank-purpose ${PURPOSE_CLASS[bank.purpose] || 'purpose-daily'}`}>{bank.purpose}</span>
          </div>
          <div className="bank-balance">{fmt(bank.balance)}</div>
          <div className="bank-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(bank)}>✏️ Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(bank._id)}>🗑️ Delete</button>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Bank' : 'Add Bank'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input className="form-input" placeholder="e.g. HDFC Savings" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <select className="form-select" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}>
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Current Balance</label>
                <input className="form-input" type="number" placeholder="0" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full">{editing ? 'Update' : 'Add Bank'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
