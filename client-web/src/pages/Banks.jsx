import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const PURPOSES = ['Salary', 'Daily', 'Savings', 'SIP', 'EMI', 'Investment']
const PURPOSE_COLORS = { Salary: '#059669', Savings: '#7c6bef', Daily: '#f7971e', SIP: '#2563eb', EMI: '#ff6b8a', Investment: '#06b6d4' }
const PURPOSE_ICONS = { Salary: '💼', Savings: '🏦', Daily: '🛒', SIP: '📈', EMI: '📋', Investment: '💹' }

const S = { bg: '#0f0f13', card: '#15151f', border: '#252535', text: '#e0e0f0', sub: '#8080a0', muted: '#555570', accent: '#2563eb', danger: '#ff6b8a' }
const inputStyle = { width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const labelStyle = { display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }

export default function Banks() {
  const { currentUser } = useAuth()
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', purpose: 'Salary', balance: '' })
  const [error, setError] = useState('')

  const fmt = (n = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n)
  const totalBalance = banks.reduce((s, b) => s + parseFloat(b.balance || 0), 0)

  const load = () => api.get('/api/banks').then(r => setBanks(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', purpose: 'Salary', balance: '' }); setError(''); setShowModal(true) }
  const openEdit = (b) => { setEditing(b._id); setForm({ name: b.name, purpose: b.purpose, balance: b.balance }); setError(''); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      if (editing) await api.put(`/api/banks/${editing}`, form)
      else await api.post('/api/banks', form)
      setShowModal(false); load()
    } catch (err) { setError(err.response?.data?.message || 'Error saving bank') }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/api/banks/${id}`); load() }
    catch (err) {
      const c = err.response?.data?.counts
      alert(c ? `Cannot delete — linked records:\nExpenses: ${c.expenses}, Transfers: ${c.transfers}, EMIs: ${c.emis}, SIPs: ${c.sips}` : err.response?.data?.message)
    }
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: S.text }}>Banks</div>
          <div style={{ color: S.muted, fontSize: '0.82rem', marginTop: '2px' }}>{banks.length} account{banks.length !== 1 ? 's' : ''} • {fmt(totalBalance)} total</div>
        </div>
        <button onClick={openAdd} style={{ background: S.accent, color: 'white', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>+ Add Bank</button>
      </div>

      {banks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: S.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏦</div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: S.sub, marginBottom: '4px' }}>No banks added</div>
          <div style={{ fontSize: '0.82rem' }}>Add your first bank account</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {banks.map(bank => {
            const color = PURPOSE_COLORS[bank.purpose] || S.accent
            return (
              <div key={bank._id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                {/* Accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '18px 18px 0 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      {PURPOSE_ICONS[bank.purpose] || '🏦'}
                    </div>
                    <div>
                      <div style={{ color: S.text, fontWeight: 700, fontSize: '1rem' }}>{bank.name}</div>
                      <div style={{ color, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{bank.purpose}</div>
                    </div>
                  </div>
                </div>
                <div style={{ color: S.text, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '16px' }}>{fmt(bank.balance)}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(bank)} style={{ flex: 1, padding: '8px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '10px', color: S.sub, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>✏️ Edit</button>
                  <button onClick={() => handleDelete(bank._id)} style={{ padding: '8px 14px', background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', borderRadius: '10px', color: S.danger, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">{editing ? 'Edit Bank' : 'Add Bank'}</span></div>
            {error && <div style={{ background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.3)', color: S.danger, padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Bank Name</label>
                <input style={inputStyle} placeholder="e.g. HDFC Savings" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Purpose</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PURPOSES.map(p => (
                    <button type="button" key={p} onClick={() => setForm({ ...form, purpose: p })}
                      style={{ padding: '7px 14px', borderRadius: '20px', border: `1px solid ${form.purpose === p ? (PURPOSE_COLORS[p] || S.accent) : '#252535'}`, background: form.purpose === p ? `${PURPOSE_COLORS[p]}22` : '#15151f', color: form.purpose === p ? (PURPOSE_COLORS[p] || S.accent) : S.sub, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                      {PURPOSE_ICONS[p]} {p}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Current Balance (₹)</label>
                <input style={inputStyle} type="number" placeholder="0" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} required />
              </div>
              <button type="submit" style={{ width: '100%', background: S.accent, color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>{editing ? 'Update Bank' : 'Add Bank'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
