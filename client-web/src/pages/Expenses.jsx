import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const DAILY_CATS = ['Food', 'Fuel', 'Tea', 'Snacks', 'Transport']
const OTHER_CATS = ['Rent', 'Bills', 'Insurance', 'Hospital', 'Shopping', 'Travel', 'Education', 'Entertainment', 'Other']
const CAT_ICONS = { Food: '🍔', Fuel: '⛽', Tea: '☕', Snacks: '🍿', Transport: '🚌', Rent: '🏠', Bills: '📄', Insurance: '🛡️', Hospital: '🏥', Shopping: '🛍️', Travel: '✈️', Education: '🎓', Entertainment: '🎬', Other: '📦', Income: '💵', Transfer: '🔄' }
const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Net Banking']

const EMPTY = { txnType: 'Expense', title: '', type: 'Daily', category: 'Food', customCategory: '', bankId: '', amount: '', paymentMethod: 'UPI', notes: '', date: new Date().toISOString().split('T')[0], personName: '' }

export default function Expenses() {
  const { currentUser } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [typeFilter, setTypeFilter] = useState('All')
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)
  const cats = form.type === 'Daily' ? DAILY_CATS : OTHER_CATS
  const isOtherCustom = form.txnType === 'Expense' && form.type === 'Other' && form.category === 'Other'

  const load = () => {
    const params = {}
    if (typeFilter !== 'All') params.type = typeFilter
    api.get('/api/expenses', { params }).then(r => setExpenses(r.data)).catch(console.error)
  }
  useEffect(() => { load() }, [typeFilter])
  useEffect(() => { api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const finalCategory = isOtherCustom && form.customCategory.trim() ? form.customCategory.trim() : (form.txnType !== 'Expense' ? form.txnType : form.category)
    try {
      const fd = new FormData()
      fd.append('type', form.txnType === 'Expense' ? form.type : 'Other')
      fd.append('category', finalCategory)
      fd.append('bankId', form.bankId)
      fd.append('amount', form.amount)
      fd.append('paymentMethod', form.paymentMethod)
      fd.append('notes', form.personName ? `${form.title} | ${form.txnType === 'Income' ? 'From: ' : 'To: '}${form.personName}` : (form.title || form.notes))
      fd.append('date', form.date)
      if (receipt) fd.append('image', receipt)
      await api.post('/api/expenses', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowModal(false); setForm(EMPTY); setReceipt(null); load()
    } catch (err) { setError(err.response?.data?.message || 'Error adding') }
  }

  const grouped = expenses.reduce((acc, exp) => {
    const d = new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!acc[d]) acc[d] = []
    acc[d].push(exp)
    return acc
  }, {})

  const totalExpenses = expenses.filter(e => e.type === 'Daily' || e.type === 'Other').reduce((s, e) => s + e.amount, 0)

  return (
    <div style={{ maxWidth: '700px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Expenses</div>
          <div style={{ color: '#555570', fontSize: '0.82rem', marginTop: '2px' }}>{expenses.length} transactions • {fmt(totalExpenses)} total</div>
        </div>
        <button onClick={() => { setForm(EMPTY); setError(''); setShowModal(true) }}
          style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          + Add
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#15151f', borderRadius: '12px', padding: '4px' }}>
        {['All', 'Daily', 'Other'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
            background: typeFilter === t ? '#2563eb' : 'transparent',
            color: typeFilter === t ? 'white' : '#8080a0',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}>{t}</button>
        ))}
      </div>

      {/* Transaction list grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#555570' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💳</div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#8080a0', marginBottom: '4px' }}>No transactions yet</div>
          <div style={{ fontSize: '0.82rem' }}>Tap + Add to record your first transaction</div>
        </div>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, txns]) => (
          <div key={date} style={{ marginBottom: '20px' }}>
            <div style={{ color: '#8080a0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{date}</div>
            <div style={{ background: '#15151f', borderRadius: '16px', overflow: 'hidden', border: '1px solid #252535' }}>
              {txns.map((exp, i) => (
                <div key={exp._id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                  borderBottom: i < txns.length - 1 ? '1px solid #1e1e2a' : 'none',
                }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#1e1e2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    {CAT_ICONS[exp.category] || '📦'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#e0e0f0', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {exp.notes || exp.category}
                    </div>
                    <div style={{ color: '#555570', fontSize: '0.72rem', marginTop: '3px' }}>
                      {exp.category} • {exp.paymentMethod} • {exp.bank?.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ color: '#ff6b8a', fontWeight: 700, fontSize: '0.9rem' }}>-{fmt(exp.amount)}</div>
                    <button onClick={() => api.delete(`/api/expenses/${exp._id}`).then(load)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333350', fontSize: '0.75rem', padding: 0 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {/* Type tabs */}
            <div style={{ display: 'flex', background: '#1a1a2e', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
              {['Expense', 'Income', 'Transfer'].map(t => (
                <button key={t} onClick={() => setForm({ ...form, txnType: t })}
                  style={{ flex: 1, padding: '10px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s',
                    background: form.txnType === t ? (t === 'Expense' ? '#2563eb' : t === 'Income' ? '#059669' : '#7c6bef') : 'transparent',
                    color: form.txnType === t ? 'white' : '#6b6b8a',
                  }}>{t}</button>
              ))}
            </div>

            <div className="modal-header"><span className="modal-title">
              {form.txnType === 'Expense' ? 'Add Expense' : form.txnType === 'Income' ? 'Add Income' : 'Add Transfer'}
            </span></div>

            {error && <div style={{ background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.3)', color: '#ff6b8a', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Title</label>
                <input style={inputStyle} placeholder="E.g. Drinks, Salary, Rent..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Amount</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ ...inputStyle, width: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#9f8dff', flexShrink: 0 }}>₹</div>
                  <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
              </div>

              {/* Category — only for Expense */}
              {form.txnType === 'Expense' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Daily', 'Other'].map(t => (
                        <button type="button" key={t} onClick={() => setForm({ ...form, type: t, category: t === 'Daily' ? 'Food' : 'Rent', customCategory: '' })}
                          style={{ flex: 1, padding: '9px', borderRadius: '10px', border: `1px solid ${form.type === t ? '#2563eb' : '#252535'}`, background: form.type === t ? '#1e3a8a22' : '#15151f', color: form.type === t ? '#60a5fa' : '#6b6b8a', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Category</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {cats.map(c => (
                        <button type="button" key={c} onClick={() => setForm({ ...form, category: c, customCategory: '' })}
                          style={{ padding: '7px 14px', borderRadius: '20px', border: `1px solid ${form.category === c ? '#2563eb' : '#252535'}`, background: form.category === c ? '#2563eb' : '#15151f', color: form.category === c ? 'white' : '#8080a0', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                          {CAT_ICONS[c]} {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {isOtherCustom && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={labelStyle}>Specify Category</label>
                      <input style={inputStyle} placeholder="e.g. Salon, Medicine..." value={form.customCategory} onChange={e => setForm({ ...form, customCategory: e.target.value })} />
                    </div>
                  )}
                </>
              )}

              {/* Bank */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>{form.txnType === 'Income' ? 'Received By' : form.txnType === 'Transfer' ? 'From' : 'Paid By'}</label>
                  <select style={inputStyle} value={form.bankId} onChange={e => setForm({ ...form, bankId: e.target.value })} required>
                    <option value="">Select bank</option>
                    {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>When</label>
                  <input style={inputStyle} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
              </div>

              {/* Person name — Income: Received From, Transfer: Transferred To */}
              {(form.txnType === 'Income' || form.txnType === 'Transfer') && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>{form.txnType === 'Income' ? '👤 Received From' : '👤 Transferred To'}</label>
                  <input style={{ ...inputStyle, borderColor: form.txnType === 'Income' ? '#05966955' : '#7c6bef55' }}
                    placeholder={form.txnType === 'Income' ? 'E.g. Company,...' : 'E.g. Abc, friend...'}
                    value={form.personName}
                    onChange={e => setForm({ ...form, personName: e.target.value })} />
                </div>
              )}
              {form.txnType !== 'Transfer' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Payment Method</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {PAYMENT_METHODS.map(m => (
                      <button type="button" key={m} onClick={() => setForm({ ...form, paymentMethod: m })}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: '10px', border: `1px solid ${form.paymentMethod === m ? '#2563eb' : '#252535'}`, background: form.paymentMethod === m ? '#1e3a8a22' : '#15151f', color: form.paymentMethod === m ? '#60a5fa' : '#6b6b8a', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: '8px' }}>
                Add {form.txnType}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { display: 'block', color: '#6b6b8a', fontSize: '0.75rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inputStyle = { width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
