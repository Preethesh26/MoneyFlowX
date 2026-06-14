import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { fmt } from '../components/UI'
import api from '../services/api'

const BG='#080810';const CARD='#13131e';const BORDER='#1a1a28';const MUTED='#50507a';const SUB='#9090b0';const TEXT='#f2f2fa';const CYAN='#06b6d4'

export default function SIPScreen() {
  const { currentUser } = useAuth()
  const [sips, setSips] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fundName: '', monthlyAmount: '', sipDay: '', startDate: '', bankId: '' })
  const [error, setError] = useState('')
  const currency = currentUser?.currency || 'INR'
  const totalMonthly = sips.reduce((s, sip) => s + sip.monthlyAmount, 0)

  const load = () => api.get('/api/sip').then(r => setSips(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={s.header}>
        <View><Text style={s.title}>SIP Tracker</Text><Text style={s.sub}>{sips.length} SIP{sips.length !== 1 ? 's' : ''}</Text></View>
        <TouchableOpacity onPress={() => { setForm({ fundName: '', monthlyAmount: '', sipDay: '', startDate: '', bankId: '' }); setError(''); setShowModal(true) }} style={[s.addBtn, { backgroundColor: CYAN }]}>
          <Text style={s.addBtnText}>+ Add SIP</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {sips.length > 0 && (
          <View style={[s.summaryCard, { marginBottom: 20 }]}>
            <Text style={s.summaryLabel}>Monthly Investment</Text>
            <Text style={[s.summaryValue, { color: CYAN }]}>{fmt(totalMonthly, currency)}</Text>
            <Text style={s.summarySub}>across {sips.length} SIP{sips.length !== 1 ? 's' : ''}</Text>
          </View>
        )}
        {sips.length === 0 ? (
          <View style={s.empty}><Text style={s.emptyIcon}>📈</Text><Text style={s.emptyTitle}>No SIPs added</Text><Text style={s.emptySub}>Track your SIP investments</Text></View>
        ) : sips.map(sip => {
          const totalInvested = sip.contributions?.reduce((s, c) => s + c.amount, 0) || 0
          return (
            <View key={sip._id} style={[s.card, { marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{sip.fundName}</Text>
                  <Text style={s.cardSub}>SIP Day: {sip.sipDay}th · {sip.bank?.name}</Text>
                  <Text style={s.cardSub}>Since: {new Date(sip.startDate).toLocaleDateString('en-IN')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: CYAN, fontWeight: '700', fontSize: 16 }}>{fmt(sip.monthlyAmount, currency)}/mo</Text>
                  <Text style={s.cardSub}>Invested: {fmt(totalInvested, currency)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => api.post(`/api/sip/${sip._id}/contribution`).then(load)} style={s.ghostBtn}>
                  <Text style={s.ghostBtnText}>💰 Record</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => api.delete(`/api/sip/${sip._id}`).then(load)} style={s.dangerBtn}>
                  <Text style={s.dangerBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={s.overlay}><View style={s.sheet}>
          <Text style={s.modalTitle}>Add SIP</Text>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Text style={s.fieldLabel}>Fund Name</Text>
          <TextInput style={s.field} placeholder="e.g. Mirae Asset Large Cap" placeholderTextColor={MUTED} value={form.fundName} onChangeText={v => setForm({ ...form, fundName: v })} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Monthly Amount (₹)</Text>
              <TextInput style={s.field} placeholder="1000" placeholderTextColor={MUTED} keyboardType="numeric" value={form.monthlyAmount} onChangeText={v => setForm({ ...form, monthlyAmount: v })} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>SIP Day</Text>
              <TextInput style={s.field} placeholder="5" placeholderTextColor={MUTED} keyboardType="numeric" value={form.sipDay} onChangeText={v => setForm({ ...form, sipDay: v })} />
            </View>
          </View>
          <Text style={s.fieldLabel}>Start Date (YYYY-MM-DD)</Text>
          <TextInput style={s.field} placeholder="2024-01-01" placeholderTextColor={MUTED} value={form.startDate} onChangeText={v => setForm({ ...form, startDate: v })} />
          <Text style={s.fieldLabel}>Bank</Text>
          <View style={s.chips}>{banks.map(b => (<TouchableOpacity key={b._id} onPress={() => setForm({ ...form, bankId: b._id })} style={[s.chip, form.bankId === b._id && s.chipActive]}><Text style={[s.chipText, form.bankId === b._id && s.chipTextActive]}>{b.name}</Text></TouchableOpacity>))}</View>
          <TouchableOpacity onPress={async () => { setError(''); try { await api.post('/api/sip', form); setShowModal(false); load() } catch (err) { setError(err.response?.data?.message || 'Error') }}} style={[s.submitBtn, { backgroundColor: CYAN }]}>
            <Text style={s.submitBtnText}>Add SIP</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModal(false)} style={s.cancelBtn}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  title: { color: TEXT, fontSize: 22, fontWeight: '800' }, sub: { color: MUTED, fontSize: 12, marginTop: 2 },
  addBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 }, addBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  summaryCard: { borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', backgroundColor: 'rgba(6,182,212,0.06)' },
  summaryLabel: { color: CYAN, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  summaryValue: { fontSize: 28, fontWeight: '800' }, summarySub: { color: MUTED, fontSize: 12, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 }, emptyIcon: { fontSize: 38, marginBottom: 10 },
  emptyTitle: { color: SUB, fontWeight: '600', fontSize: 16 }, emptySub: { color: MUTED, fontSize: 13, marginTop: 4 },
  card: { backgroundColor: CARD, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: BORDER },
  cardTitle: { color: TEXT, fontWeight: '700', fontSize: 15 }, cardSub: { color: MUTED, fontSize: 12, marginTop: 2 },
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
  cancelBtn: { alignItems: 'center', marginTop: 12, paddingBottom: 4 }, cancelBtnText: { color: MUTED, fontSize: 14 },
})
