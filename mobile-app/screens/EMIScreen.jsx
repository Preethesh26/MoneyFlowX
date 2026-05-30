import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, Card, PageHeader, Input, Btn, EmptyState, ProgressBar, BalanceCard, fmt } from '../components/UI'
import api from '../services/api'

export default function EMIScreen() {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [emis, setEmis] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ loanName: '', totalAmount: '', emiAmount: '', dueDay: '', startDate: '', endDate: '', bankId: '' })

  const currency = currentUser?.currency || 'INR'
  const load = () => api.get('/api/emi').then(r => setEmis(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const totalMonthly = emis.filter(e => !e.isFullyPaid).reduce((s, e) => s + e.emiAmount, 0)

  const handleAdd = async () => {
    if (!form.loanName || !form.totalAmount || !form.emiAmount || !form.dueDay || !form.startDate || !form.endDate || !form.bankId) {
      return Alert.alert('Error', 'All fields are required')
    }
    try {
      await api.post('/api/emi', form)
      setShowModal(false)
      setForm({ loanName: '', totalAmount: '', emiAmount: '', dueDay: '', startDate: '', endDate: '', bankId: '' })
      load()
    } catch (err) { Alert.alert('Error', err.response?.data?.message || 'Failed') }
  }

  return (
    <ScreenWrapper colors={colors}>
      <PageHeader title="EMI Tracker" subtitle={`${emis.length} EMI${emis.length !== 1 ? 's' : ''}`} colors={colors}
        action={<Btn title="+ Add" onPress={() => setShowModal(true)} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />} />

      {emis.length > 0 && (
        <BalanceCard label="Total Monthly EMI" amount={fmt(totalMonthly, currency)} gradient="#ff6584" />
      )}

      {emis.length === 0 ? <EmptyState icon="📋" title="No EMIs added" desc="Track your loan EMIs" colors={colors} /> :
        emis.map(emi => {
          const totalPaid = emi.payments?.reduce((s, p) => s + p.amount, 0) || 0
          const remaining = emi.totalAmount - totalPaid
          const pct = Math.min(100, Math.round((totalPaid / emi.totalAmount) * 100))
          return (
            <Card key={emi._id} colors={colors}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{emi.loanName}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Bank: {emi.bank?.name} • Due: {emi.dueDay}th</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {emi.isFullyPaid
                    ? <Text style={{ color: colors.success, fontWeight: '700' }}>✅ Paid</Text>
                    : <Text style={{ color: colors.danger, fontWeight: '700' }}>{fmt(emi.emiAmount, currency)}/mo</Text>}
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Left: {fmt(remaining, currency)}</Text>
                </View>
              </View>
              <ProgressBar pct={pct} color="#ff6584" />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {!emi.isFullyPaid && (
                  <Btn title="💳 Pay" variant="ghost" onPress={async () => { await api.post(`/api/emi/${emi._id}/payment`); load() }} colors={colors} style={{ flex: 1, paddingVertical: 8 }} />
                )}
                <Btn title="🗑️" variant="danger" onPress={async () => { await api.delete(`/api/emi/${emi._id}`); load() }} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
              </View>
            </Card>
          )
        })}

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Add EMI</Text>
            <Input label="Loan Name" colors={colors} value={form.loanName} onChangeText={v => setForm({ ...form, loanName: v })} placeholder="e.g. Home Loan" />
            <Input label="Total Amount" colors={colors} value={form.totalAmount} onChangeText={v => setForm({ ...form, totalAmount: v })} keyboardType="numeric" placeholder="500000" />
            <Input label="Monthly EMI" colors={colors} value={form.emiAmount} onChangeText={v => setForm({ ...form, emiAmount: v })} keyboardType="numeric" placeholder="5000" />
            <Input label="Due Day (1-31)" colors={colors} value={form.dueDay} onChangeText={v => setForm({ ...form, dueDay: v })} keyboardType="numeric" placeholder="5" />
            <Input label="Start Date (YYYY-MM-DD)" colors={colors} value={form.startDate} onChangeText={v => setForm({ ...form, startDate: v })} placeholder="2024-01-01" />
            <Input label="End Date (YYYY-MM-DD)" colors={colors} value={form.endDate} onChangeText={v => setForm({ ...form, endDate: v })} placeholder="2026-12-01" />
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>Bank</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {banks.map(b => (
                <TouchableOpacity key={b._id} onPress={() => setForm({ ...form, bankId: b._id })}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.bankId === b._id ? colors.accent : colors.bg, borderWidth: 1, borderColor: form.bankId === b._id ? colors.accent : colors.border }}>
                  <Text style={{ color: form.bankId === b._id ? 'white' : colors.textSub, fontSize: 12, fontWeight: '600' }}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Btn title="Add EMI" onPress={handleAdd} colors={colors} />
            <Btn title="Cancel" variant="ghost" onPress={() => setShowModal(false)} colors={colors} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}
