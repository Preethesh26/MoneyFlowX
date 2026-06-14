import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { fmt } from '../components/UI'
import api from '../services/api'

const BG = '#080810'; const CARD = '#13131e'; const BORDER = '#1a1a28'; const MUTED = '#50507a'; const SUB = '#9090b0'; const TEXT = '#f2f2fa'

export default function TransfersScreen() {
  const { currentUser } = useAuth()
  const [transfers, setTransfers] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fromBankId: '', toBankId: '', amount: '', notes: '' })
  const [error, setError] = useState('')
  const currency = currentUser?.currency || 'INR'

  const load = () => api.get('/api/transfers').then(r => setTransfers(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const grouped = transfers.reduce((acc, t) => {
    const d = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    if (!acc[d]) acc[d] = []; acc[d].push(t); return acc
  }, {})

  const handleTransfer = async () => {
    if (!form.fromBankId || !form.toBankId || !form.amount) return Alert.alert('Error', 'All fields required')
    setError('')
    try {
      await api.post('/api/transfers', form)
      setShowModal(false); setForm({ fromBankId: '', toBankId: '', amount: '', notes: '' }); load()
    } catch (err) { setError(err.response?.data?.message || 'Transfer failed') }
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={s.header}>
        <View><Text style={s.title}>Transfers</Text><Text style={s.sub}>{transfers.length} transfer{transfers.length !== 1 ? 's' : ''}</Text></View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={[s.addBtn, { backgroundColor: '#8b5cf6' }]}><Text style={s.addBtnText}>+ Transfer</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {Object.keys(grouped).length === 0 ? (
          <View style={s.empty}><Text style={s.emptyIcon}>🔄</Text><Text style={s.emptyTitle}>No transfers yet</Text><Text style={s.emptySub}>Move money between accounts</Text></View>
        ) : (
          Object.entries(grouped).map(([date, txns]) => (
            <View key={date} style={{ marginBottom: 20 }}>
              <Text style={s.dateLabel}>{date}</Text>
              <View style={s.listCard}>
                {txns.map((t, i) => (
                  <View key={t._id} style={[s.txnRow, i < txns.length - 1 && s.txnBorder]}>
                    <View style={[s.txnIcon, { backgroundColor: 'rgba(139,92,246,0.12)' }]}><Text style={{ fontSize: 18 }}>🔄</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.txnTitle}>{t.fromBank?.name} → {t.toBank?.name}</Text>
                      <Text style={s.txnSub}>{t.notes || 'Transfer'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#8b5cf6', fontWeight: '700', fontSize: 14 }}>{fmt(t.amount, currency)}</Text>
                      <TouchableOpacity onPress={() => api.delete(`/api/transfers/${t._id}`).then(load)}><Text style={{ color: BORDER, fontSize: 12, marginTop: 2 }}>✕</Text></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={s.overlay}><View style={s.sheet}>
          <Text style={s.modalTitle}>Transfer Money</Text>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <Text style={s.fieldLabel}>From Bank</Text>
          <View style={s.chips}>{banks.map(b => (<TouchableOpacity key={b._id} onPress={() => setForm({ ...form, fromBankId: b._id })} style={[s.chip, form.fromBankId === b._id && s.chipActive]}><Text style={[s.chipText, form.fromBankId === b._id && s.chipTextActive]}>{b.name}</Text></TouchableOpacity>))}</View>
          <Text style={s.fieldLabel}>To Bank</Text>
          <View style={s.chips}>{banks.map(b => (<TouchableOpacity key={b._id} onPress={() => setForm({ ...form, toBankId: b._id })} style={[s.chip, form.toBankId === b._id && s.chipActive]}><Text style={[s.chipText, form.toBankId === b._id && s.chipTextActive]}>{b.name}</Text></TouchableOpacity>))}</View>
          <Text style={s.fieldLabel}>Amount (₹)</Text>
          <TextInput style={s.field} placeholder="0.00" placeholderTextColor={MUTED} keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />
          <Text style={s.fieldLabel}>Note (optional)</Text>
          <TextInput style={s.field} placeholder="Reason..." placeholderTextColor={MUTED} value={form.notes} onChangeText={v => setForm({ ...form, notes: v })} />
          <TouchableOpacity onPress={handleTransfer} style={[s.submitBtn, { backgroundColor: '#8b5cf6' }]}><Text style={s.submitBtnText}>Transfer</Text></TouchableOpacity>
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
  empty: { alignItems: 'center', paddingTop: 60 }, emptyIcon: { fontSize: 38, marginBottom: 10 },
  emptyTitle: { color: SUB, fontWeight: '600', fontSize: 16 }, emptySub: { color: MUTED, fontSize: 13, marginTop: 4 },
  dateLabel: { color: MUTED, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  listCard: { backgroundColor: CARD, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  txnBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  txnIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txnTitle: { color: TEXT, fontWeight: '600', fontSize: 14 }, txnSub: { color: MUTED, fontSize: 11, marginTop: 2 },
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
