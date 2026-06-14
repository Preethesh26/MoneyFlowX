import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const S = { card: '#15151f', border: '#252535', text: '#e0e0f0', sub: '#8080a0', muted: '#555570', accent: '#06b6d4' }
const inputStyle = { width: '100%', padding: '12px 14px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '12px', color: '#e0e0f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const labelStyle = { display: 'block', color: '#6b6b8a', fontSize: '0.72rem', fontWeight: 600, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }

export default function SIP() {
  const { currentUser } = useAuth()
  const [sips, setSips] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fundName: '', monthlyAmount: '', sipDay: '', startDate: '', bankId: '' })
  const [error, setError] = useState('')

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currentUser?.currency || 'INR', maximumFractionDigits: 0 }).format(n || 0)
  const totalMonthly = sips.reduce((s, sip) => s + sip.monthlyAmount, 0)
  const load = () => api.get('/api/sip').then(r => setSips(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: S.text }}>SIP Tracker</div>
          <div style={{ color: S.muted, fontSize: '0.82rem', marginTop: '2px' }}>{sips.length} SIP{sips.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => { setForm({ fundName: '', monthlyAmount: '', sipDay: '', startDate: '', bankId: '' }); setError(''); setShowModal(true) }}
          style={{ background: '#06b6d4', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
          + Add SIP
        </button>
      </div>

      {sips.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg,#06b6d422,#0284c711)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '18px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ color: '#06b6d4', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Total Monthly Investment</div>
          <div style={{ color: S.text, fontSize: '2rem', fontWeight: 800 }}>{fmt(totalMonthly)}</div>
          <div style={{ color: S.muted, fontSize: '0.78rem', marginTop: '4px' }}>across {sips.length} SIP{sips.length !== 1 ? 's' : ''}</div>
        </div>
      )}

      {sips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: S.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📈</div>
          <div style={{ fontWeight: 600, color: S.sub, marginBottom: '4px' }}>No SIPs added</div>
          <div style={{ fontSize: '0.82rem' }}>Track your SIP investments</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sips.map(sip => {
            const totalInvested = sip.contributions?.reduce((s, c) => s + c.amount, 0) || 0
            return (
              <div key={sip._id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '18px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: S.text, fontWeight: 700 }}>{sip.fundName}</div>
                    <div style={{ color: S.muted, fontSize: '0.75rem', marginTop: '3px' }}>SIP Day: {sip.sipDay}th • Bank: {sip.bank?.name}</div>
                    <div style={{ color: S.muted, fontSize: '0.72rem', marginTop: '2px' }}>Started: {new Date(sip.startDate).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '1.1rem' }}>{fmt(sip.monthlyAmount)}/mo</div>
                    <div style={{ color: S.muted, fontSize: '0.72rem', marginTop: '2px' }}>Invested: {fmt(totalInvested)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => api.post(`/api/sip/${sip._id}/contribution`).then(load)}
                    style={{ flex: 1, padding: '8px', background: '#1a1a2e', border: '1px solid #252535', borderRadius: '10px', color: S.sub, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                    💰 Record Contribution
                  </button>
                  <button onClick={() => api.delete(`/api/sip/${sip._id}`).then(load)}
                    style={{ padding: '8px 14px', background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', borderRadius: '10px', color: '#ff6b8a', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Add SIP</span></div>
            {error && <div style={{ background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.3)', color: '#ff6b8a', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '14px' }}>{error}</div>}
            <form onSubmit={async e => { e.preventDefault(); setError(''); try { await api.post('/api/sip', form); setShowModal(false); load() } catch (err) { setError(err.response?.data?.message || 'Error') }}}>
              <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Fund Name</label><input style={inputStyle} placeholder="e.g. Mirae Asset Large Cap" value={form.fundName} onChange={e => setForm({ ...form, fundName: e.target.value })} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div><label style={labelStyle}>Monthly Amount (₹)</label><input style={inputStyle} type="number" placeholder="1000" value={form.monthlyAmount} onChange={e => setForm({ ...form, monthlyAmount: e.target.value })} required /></div>
                <div><label style={labelStyle}>SIP Day (1-31)</label><input style={inputStyle} type="number" min="1" max="31" placeholder="5" value={form.sipDay} onChange={e => setForm({ ...form, sipDay: e.target.value })} required /></div>
              </div>
              <div style={{ marginBottom: '14px' }}><label style={labelStyle}>Start Date</label><input style={inputStyle} type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required /></div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Bank</label>
                <select style={inputStyle} value={form.bankId} onChange={e => setForm({ ...form, bankId: e.target.value })} required>
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <button type="submit" style={{ width: '100%', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Add SIP</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
