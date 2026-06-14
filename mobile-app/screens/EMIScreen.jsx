import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { fmt } from '../components/UI'
import api from '../services/api'

const BG='#080810';const CARD='#13131e';const BORDER='#1a1a28';const MUTED='#50507a';const SUB='#9090b0';const TEXT='#f2f2fa';const RED='#f43f5e'

export default function EMIScreen() {
  const { currentUser } = useAuth()
  const [emis, setEmis] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ loanName: '', totalAmount: '', emiAmount: '', dueDay: '', startDate: '', endDate: '', bankId: '' })
  const [error, setError] = useState('')
  const currency = currentUser?.currency || 'INR'
  const totalMonthly = emis.filter(e => !e.isFullyPaid).reduce((s, e) => s + e.emiAmount, 0)

  const load = () => api.get('/api/emi').then(r => setEmis(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={s.header}>
        <View><Text style={s.title}>EMI Tracker</Text><Text style={s.sub}>{emis.length} EMI{emis.length !== 1 ? 's' : ''}</Text></View>
        <TouchableOpacity onPress={() => { setForm({ loanName: '', totalAmount: '', emiAmount: '', dueDay: '', startDate: '', endDate: '', bankId: '' }); setError(''); setShowModal(true) }} style={[s.addBtn, { backgroundColor: RED }]}>
          <Text style={s.addBtnText}>+ Add EMI</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {emis.length > 0 && (
          <View style={[s.summaryCard, { marginBottom: 20 }]}>
            <Text style={s.summaryLabel}>Total Monthly EMI</Text>
            <Text style={[s.summaryValue, { color: RED }]}>{fmt(totalMonthly, currency)}</Text>
            <Text style={s.summarySub}>{emis.filter(e => !e.isFullyPaid).length} active loan{emis.filter(e => !e.isFullyPaid).length !== 1 ? 's' : ''}</Text>
          </View>
        )}
        {emis.length === 0 ? (
          <View style={s.empty}><Text style={s.emptyIcon}>📋</Text><Text style={s.emptyTitle}>No EMIs added</Text><Text style={s.emptySub}>Track your loan EMIs</Text></View>
        ) : emis.map(emi => {
          const totalPaid = emi.payments?.reduce((s, p) => s + p.amount, 0) || 0
          const remaining = emi.totalAmount - totalPaid
          const pct = Math.min(100, Math.round((totalPaid / emi.totalAmount) * 100))
          return (
            <View key={emi._id} style={[s.card, { marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View>
                  <Text style={s.cardTitle}>{emi.loanName}</Text>
                  <Text style={s.cardSub}>Due: {emi.dueDay}th · {emi.bank?.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {emi.isFullyPaid
                    ? <View style={[s.badge, { backgroundColor: 'rgba(16,185,129,0.12)' }]}><Text style={[s.badgeText, { color: '#10b981' }]}>✅ Paid</Text></View>
                    : <Text style={{ color: RED, fontWeight: '700', fontSize: 15 }}>{fmt(emi.emiAmount, currency)}/mo</Text>}
                  <Text style={s.cardSub}>Left: {fmt(remaining, currency)}</Text>
                </View>
              </View>
              <View style={s.progressBg}><View style={[s.progressFill, { width: `${pct}%`, backgroundColor: RED }]} /></View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {!emi.isFullyPaid && (
                  <TouchableOpacity onPress={() => api.post(`/api/emi/${emi._id}/payment`).then(load)} style={s.ghostBtn}>
                    <Text style={s.ghostBtnText}>💳 Pay EMI</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => api.delete(`/api/emi/${emi._id}`).then(load)} style={s.dangerBtn}>
                  <Text style={s.dangerBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={s.overlay}><ScrollView><View style={s.sheet}>
          <Text style={s.modalTitle}>Add EMI</Text>
          {error ? <Text style={s.error}>{error}</Text> : null}
          {[['Loan Name', 'loanName', 'default', 'e.g. Home Loan'], ['Total Amount (₹)', 'totalAmount', 'numeric', '500000'], ['Monthly EMI (₹)', 'emiAmount', 'numeric', '5000'], ['Due Day (1-31)', 'dueDay', 'numeric', '5'], ['Start Date (YYYY-MM-DD)', 'startDate', 'default', '2024-01-01'], ['End Date (YYYY-MM-DD)', 'endDate', 'default', '2026-12-01']].map(([lbl, key, kb, ph]) => (
            <View key={key}><Text style={s.fieldLabel}>{lbl}</Text><TextInput style={s.field} placeholder={ph} placeholderTextColor={MUTED} keyboardType={kb} value={form[key]} onChangeText={v => setForm({ ...form, [key]: v })} /></View>
          ))}
          <Text style={s.fieldLabel}>Bank</Text>
          <View style={s.chips}>{banks.map(b => (<TouchableOpacity key={b._id} onPress={() => setForm({ ...form, bankId: b._id })} style={[s.chip, form.bankId === b._id && s.chipActive]}><Text style={[s.chipText, form.bankId === b._id && s.chipTextActive]}>{b.name}</Text></TouchableOpacity>))}</View>
          <TouchableOpacity onPress={async () => { setError(''); try { await api.post('/api/emi', form); setShowModal(false); load() } catch (err) { setError(err.response?.data?.message || 'Error') }}} style={[s.submitBtn, { backgroundColor: RED }]}>
            <Text style={s.submitBtnText}>Add EMI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModal(false)} style={s.cancelBtn}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
        </View></ScrollView></View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  title: { color: TEXT, fontSize: 22, fontWeight: '800' }, sub: { color: MUTED, fontSize: 12, marginTop: 2 },
  addBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 }, addBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  summaryCard: { backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(244,63,94,0.15)' },
  summaryLabel: { color: RED, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  summaryValue: { fontSize: 28, fontWeight: '800' }, summarySub: { color: MUTED, fontSize: 12, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 }, emptyIcon: { fontSize: 38, marginBottom: 10 },
  emptyTitle: { color: SUB, fontWeight: '600', fontSize: 16 }, emptySub: { color: MUTED, fontSize: 13, marginTop: 4 },
  card: { backgroundColor: CARD, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: BORDER },
  cardTitle: { color: TEXT, fontWeight: '700', fontSize: 15 }, cardSub: { color: MUTED, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }, badgeText: { fontSize: 11, fontWeight: '700' },
  progressBg: { height: 7, backgroundColor: BORDER, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  ghostBtn: { flex: 1, backgroundColor: '#13131e', borderWidth: 1, borderColor: '#222232', borderRadius: 10, padding: 9, alignItems: 'center' },
  ghostBtnText: { color: SUB, fontWeight: '600', fontSize: 13 },
  dangerBtn: { backgroundColor: 'rgba(244,63,94,0.08)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.15)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  dangerBtnText: { fontSize: 16 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { backgroundColor: '#0e0e18', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: '#222232' },
  modalTitle: { color: TEXT, fontWeight: '700', fontSize: 18, marginBottom: 16 },
  error: { color: '#f87171', fontSize: 13, marginBottom: 12, backgroundColor: 'rgba(244,63,94,0.1)', padding: 10, borderRadius: 10 },
  fieldLabel: { color: MUTED, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  field: { backgroundColor: '#13131e', borderWidth: 1, borderColor: '#222232', borderRadius: 12, padding: 13, color: TEXT, fontSize: 15, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#222232', backgroundColor: '#13131e' },
  chipActive: { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)' },
  chipText: { color: SUB, fontWeight: '600', fontSize: 13 }, chipTextActive: { color: '#3b82f6' },
  submitBtn: { borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4 }, submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', marginTop: 12, paddingBottom: 16 }, cancelBtnText: { color: MUTED, fontSize: 14 },
})
