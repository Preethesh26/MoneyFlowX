import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const S = { bg: '#0f0f13', card: '#15151f', border: '#252535', text: '#e0e0f0', sub: '#8080a0', muted: '#555570', accent: '#2563eb', danger: '#ff6b8a' }
const inputStyle = { width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const labelStyle = { display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }

export default function Transfers() {
  const { currentUser } = useAuth()
  const [transfers, setTransfers] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fromBankId: '', toBankId: '', amount: '', notes: '' })
  const [error, setError] = useState('')

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n || 0)

  const load = () => api.get('/api/transfers').then(r => setTransfers(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      await api.post('/api/transfers', form)
      setShowModal(false); setForm({ fromBankId: '', toBankId: '', amount: '', notes: '' }); load()
    } catch (err) { setError(err.response?.data?.message || 'Transfer failed') }
  }

  const grouped = transfers.reduce((acc, t) => {
    const d = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!acc[d]) acc[d] = []
    acc[d].push(t)
    return acc
  }, {})

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: S.text }}>Transfers</div>
          <div style={{ color: S.muted, fontSize: '0.82rem', marginTop: '2px' }}>{transfers.length} transfer{transfers.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => { setForm({ fromBankId: '', toBankId: '', amount: '', notes: '' }); setError(''); setShowModal(true) }}
          style={{ background: '#7c6bef', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          + Transfer
        </button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: S.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔄</div>
          <div style={{ fontWeight: 600, color: S.sub, marginBottom: '4px' }}>No transfers yet</div>
          <div style={{ fontSize: '0.82rem' }}>Move money between your bank accounts</div>
        </div>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, txns]) => (
          <div key={date} style={{ marginBottom: '20px' }}>
            <div style={{ color: S.muted, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{date}</div>
            <div style={{ background: S.card, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${S.border}` }}>
              {txns.map((t, i) => (
                <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: i < txns.length - 1 ? `1px solid #1e1e2a` : 'none' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(124,107,239,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🔄</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: S.text, fontWeight: 600, fontSize: '0.9rem' }}>{t.fromBank?.name} → {t.toBank?.name}</div>
                    <div style={{ color: S.muted, fontSize: '0.72rem', marginTop: '3px' }}>{t.notes || 'Transfer'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ color: '#7c6bef', fontWeight: 700, fontSize: '0.9rem' }}>{fmt(t.amount)}</div>
                    <button onClick={() => api.delete(`/api/transfers/${t._id}`).then(load)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.border, fontSize: '0.75rem', padding: 0 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Transfer Money</span></div>
            {error && <div style={{ background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.3)', color: S.danger, padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>From Bank</label>
                <select style={inputStyle} value={form.fromBankId} onChange={e => setForm({ ...form, fromBankId: e.target.value })} required>
                  <option value="">Select source bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name} ({fmt(b.balance)})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>To Bank</label>
                <select style={inputStyle} value={form.toBankId} onChange={e => setForm({ ...form, toBankId: e.target.value })} required>
                  <option value="">Select destination bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Amount (₹)</label>
                <input style={inputStyle} type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Note (optional)</label>
                <input style={inputStyle} placeholder="Reason for transfer" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" style={{ width: '100%', background: '#7c6bef', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Transfer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
