import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const DAILY_CATS = ['Food', 'Fuel', 'Tea', 'Snacks', 'Transport']
const OTHER_CATS = ['Rent', 'Bills', 'Insurance', 'Hospital', 'Shopping', 'Travel', 'Education', 'Entertainment', 'Others']
const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Net Banking']
const CAT_ICONS = { Food: '🍔', Fuel: '⛽', Tea: '☕', Snacks: '🍿', Transport: '🚌', Rent: '🏠', Bills: '📄', Insurance: '🛡️', Hospital: '🏥', Shopping: '🛍️', Travel: '✈️', Education: '🎓', Entertainment: '🎬', Others: '📦' }

const EMPTY = { type: 'Daily', category: 'Food', bankId: '', amount: '', paymentMethod: 'UPI', notes: '', date: new Date().toISOString().split('T')[0] }

export default function Expenses() {
  const { currentUser } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [filter, setFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)

  const load = () => {
    const params = {}
    if (typeFilter !== 'All') params.type = typeFilter
    api.get('/api/expenses', { params }).then(r => setExpenses(r.data)).catch(console.error)
  }
  useEffect(() => { load() }, [typeFilter])
  useEffect(() => { api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const cats = form.type === 'Daily' ? DAILY_CATS : OTHER_CATS

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (receipt) fd.append('image', receipt)
      await api.post('/api/expenses', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowModal(false)
      setForm(EMPTY)
      setReceipt(null)
      load()
    } catch (err) { setError(err.response?.data?.message || 'Error adding expense') }
  }

  const handleDelete = async (id) => {
    await api.delete(`/api/expenses/${id}`)
    load()
  }

  const filtered = filter === 'All' ? expenses : expenses.filter(e => e.category === filter)
  const daily = filtered.filter(e => e.type === 'Daily')
  const other = filtered.filter(e => e.type === 'Other')

  const ExpenseList = ({ items }) => items.length === 0 ? null : items.map(exp => (
    <div key={exp._id} className="transaction-item">
      <div className="txn-icon" style={{ background: 'rgba(108,99,255,0.15)' }}>{CAT_ICONS[exp.category] || '📦'}</div>
      <div className="txn-info">
        <div className="txn-name">{exp.notes || exp.category}</div>
        <div className="txn-meta">{exp.category} • {exp.paymentMethod} • {exp.bank?.name} • {new Date(exp.date).toLocaleDateString('en-IN')}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <div className="txn-amount debit">-{fmt(exp.amount)}</div>
        <button onClick={() => handleDelete(exp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}>🗑️</button>
      </div>
    </div>
  ))

  return (
    <div>
      <div className="flex-between mb-16">
        <div className="page-header" style={{ margin: 0 }}>
          <div className="page-title">Expenses</div>
          <div className="page-subtitle">{expenses.length} transactions</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setError(''); setShowModal(true) }}>+ Add</button>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['All', 'Daily', 'Other'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border)',
            background: typeFilter === t ? 'var(--accent)' : 'var(--bg-card)',
            color: typeFilter === t ? 'white' : 'var(--text-secondary)',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {/* Daily Expenses */}
      {(typeFilter === 'All' || typeFilter === 'Daily') && (
        <>
          <div className="section-header"><span className="section-title">Daily Expenses</span></div>
          <div className="card" style={{ marginBottom: '16px' }}>
            {daily.length === 0
              ? <div className="empty-state" style={{ padding: '24px' }}><div className="empty-desc">No daily expenses</div></div>
              : <ExpenseList items={daily} />}
          </div>
        </>
      )}

      {/* Other Expenses */}
      {(typeFilter === 'All' || typeFilter === 'Other') && (
        <>
          <div className="section-header"><span className="section-title">Other Expenses</span></div>
          <div className="card">
            {other.length === 0
              ? <div className="empty-state" style={{ padding: '24px' }}><div className="empty-desc">No other expenses</div></div>
              : <ExpenseList items={other} />}
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Expense</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, category: e.target.value === 'Daily' ? 'Food' : 'Rent' })}>
                  <option value="Daily">Daily</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {cats.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bank</label>
                <select className="form-select" value={form.bankId} onChange={e => setForm({ ...form, bankId: e.target.value })} required>
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" placeholder="What was this for?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Receipt (optional)</label>
                <input className="form-input" type="file" accept="image/*" onChange={e => setReceipt(e.target.files[0])} style={{ padding: '10px' }} />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Add Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
