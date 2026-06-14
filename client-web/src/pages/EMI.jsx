import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const S = { card: '#15151f', border: '#252535', text: '#e0e0f0', sub: '#8080a0', muted: '#555570', danger: '#ff6b8a' }
const inputStyle = { width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const labelStyle = { display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }

export default function EMI() {
  const { currentUser } = useAuth()
  const [emis, setEmis] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ loanName: '', totalAmount: '', emiAmount: '', dueDay: '', startDate: '', endDate: '', bankId: '' })
  const [error, setError] = useState('')

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n || 0)
  const totalMonthly = emis.filter(e => !e.isFullyPaid).reduce((s, e) => s + e.emiAmount, 0)
  const load = () => api.get('/api/emi').then(r => setEmis(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: S.text }}>EMI Tracker</div>
          <div style={{ color: S.muted, fontSize: '0.82rem', marginTop: '2px' }}>{emis.length} EMI{emis.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => { setForm({ loanName: '', totalAmount: '', emiAmount: '', dueDay: '', startDate: '', endDate: '', bankId: '' }); setError(''); setShowModal(true) }}
          style={{ background: '#ff6b8a', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          + Add EMI
        </button>
      </div>

      {emis.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg,#ff6b8a22,#ff475711)', border: '1px solid rgba(255,107,138,0.2)', borderRadius: '18px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ color: '#ff6b8a', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Total Monthly EMI</div>
          <div style={{ color: S.text, fontSize: '2rem', fontWeight: 800 }}>{fmt(totalMonthly)}</div>
          <div style={{ color: S.muted, fontSize: '0.78rem', marginTop: '4px' }}>across {emis.filter(e => !e.isFullyPaid).length} active loan{emis.filter(e => !e.isFullyPaid).length !== 1 ? 's' : ''}</div>
        </div>
      )}

      {emis.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: S.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
          <div style={{ fontWeight: 600, color: S.sub, marginBottom: '4px' }}>No EMIs added</div>
          <div style={{ fontSize: '0.82rem' }}>Track your loan EMIs and due dates</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {emis.map(emi => {
            const totalPaid = emi.payments?.reduce((s, p) => s + p.amount, 0) || 0
            const remaining = emi.totalAmount - totalPaid
            const pct = Math.min(100, Math.round((totalPaid / emi.totalAmount) * 100))
            return (
              <div key={emi._id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: S.text, fontWeight: 700 }}>{emi.loanName}</div>
                    <div style={{ color: S.muted, fontSize: '0.75rem', marginTop: '3px' }}>Due: {emi.dueDay}th • Bank: {emi.bank?.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {emi.isFullyPaid
                      ? <span style={{ background: '#05966922', color: '#059669', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>✅ Paid</span>
                      : <div style={{ color: '#ff6b8a', fontWeight: 700 }}>{fmt(emi.emiAmount)}/mo</div>}
                    <div style={{ color: S.muted, fontSize: '0.72rem', marginTop: '2px' }}>Left: {fmt(remaining)}</div>
                  </div>
                </div>
                <div style={{ height: '8px', background: '#1e1e2a', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#ff6b8a,#ff4757)', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!emi.isFullyPaid && (
                    <button onClick={() => api.post(`/api/emi/${emi._id}/payment`).then(load)}
                      style={{ flex: 1, padding: '8px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '10px', color: S.sub, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                      💳 Pay EMI
                    </button>
                  )}
                  <button onClick={() => api.delete(`/api/emi/${emi._id}`).then(load)}
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
            <div className="modal-header"><span className="modal-title">Add EMI</span></div>
            {error && <div style={{ background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.3)', color: S.danger, padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>{error}</div>}
            <form onSubmit={async e => { e.preventDefault(); setError(''); try { await api.post('/api/emi', form); setShowModal(false); load() } catch (err) { setError(err.response?.data?.message || 'Error') }}}>
              {[['Loan Name', 'loanName', 'text', 'e.g. Home Loan'], ['Total Amount (₹)', 'totalAmount', 'number', '500000'], ['Monthly EMI (₹)', 'emiAmount', 'number', '5000'], ['Due Day (1-31)', 'dueDay', 'number', '5']].map(([lbl, key, type, ph]) => (
                <div key={key} style={{ marginBottom: '14px' }}><label style={labelStyle}>{lbl}</label><input style={inputStyle} type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required /></div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div><label style={labelStyle}>Start Date</label><input style={inputStyle} type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required /></div>
                <div><label style={labelStyle}>End Date</label><input style={inputStyle} type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required /></div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Bank</label>
                <select style={inputStyle} value={form.bankId} onChange={e => setForm({ ...form, bankId: e.target.value })} required>
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <button type="submit" style={{ width: '100%', background: '#ff6b8a', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Add EMI</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
