import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, Card, PageHeader, Input, Btn, EmptyState, BalanceCard, fmt } from '../components/UI'
import api from '../services/api'

export default function SIPScreen() {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [sips, setSips] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fundName: '', monthlyAmount: '', sipDay: '', startDate: '', bankId: '' })

  const currency = currentUser?.currency || 'INR'
  const load = () => api.get('/api/sip').then(r => setSips(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const totalMonthly = sips.reduce((s, sip) => s + sip.monthlyAmount, 0)

  const handleAdd = async () => {
    if (!form.fundName || !form.monthlyAmount || !form.sipDay || !form.startDate || !form.bankId) {
      return Alert.alert('Error', 'All fields are required')
    }
    try {
      await api.post('/api/sip', form)
      setShowModal(false)
      setForm({ fundName: '', monthlyAmount: '', sipDay: '', startDate: '', bankId: '' })
      load()
    } catch (err) { Alert.alert('Error', err.response?.data?.message || 'Failed') }
  }

  return (
    <ScreenWrapper colors={colors}>
      <PageHeader title="SIP Tracker" subtitle={`${sips.length} SIP${sips.length !== 1 ? 's' : ''}`} colors={colors}
        action={<Btn title="+ Add" onPress={() => setShowModal(true)} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />} />

      {sips.length > 0 && (
        <BalanceCard label="Total Monthly Investment" amount={fmt(totalMonthly, currency)} gradient="#4facfe" />
      )}

      {sips.length === 0 ? <EmptyState icon="📈" title="No SIPs added" desc="Track your SIP investments" colors={colors} /> :
        sips.map(sip => {
          const totalInvested = sip.contributions?.reduce((s, c) => s + c.amount, 0) || 0
          return (
            <Card key={sip._id} colors={colors}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{sip.fundName}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Bank: {sip.bank?.name} • SIP Day: {sip.sipDay}th</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Started: {new Date(sip.startDate).toLocaleDateString('en-IN')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#4facfe', fontWeight: '700', fontSize: 16 }}>{fmt(sip.monthlyAmount, currency)}/mo</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Invested: {fmt(totalInvested, currency)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Btn title="💰 Record" variant="ghost" onPress={async () => { await api.post(`/api/sip/${sip._id}/contribution`); load() }} colors={colors} style={{ flex: 1, paddingVertical: 8 }} />
                <Btn title="🗑️" variant="danger" onPress={async () => { await api.delete(`/api/sip/${sip._id}`); load() }} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
              </View>
            </Card>
          )
        })}

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Add SIP</Text>
            <Input label="Fund Name" colors={colors} value={form.fundName} onChangeText={v => setForm({ ...form, fundName: v })} placeholder="e.g. Mirae Asset Large Cap" />
            <Input label="Monthly Amount" colors={colors} value={form.monthlyAmount} onChangeText={v => setForm({ ...form, monthlyAmount: v })} keyboardType="numeric" placeholder="1000" />
            <Input label="SIP Day (1-31)" colors={colors} value={form.sipDay} onChangeText={v => setForm({ ...form, sipDay: v })} keyboardType="numeric" placeholder="5" />
            <Input label="Start Date (YYYY-MM-DD)" colors={colors} value={form.startDate} onChangeText={v => setForm({ ...form, startDate: v })} placeholder="2024-01-01" />
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>Bank</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {banks.map(b => (
                <TouchableOpacity key={b._id} onPress={() => setForm({ ...form, bankId: b._id })}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.bankId === b._id ? colors.accent : colors.bg, borderWidth: 1, borderColor: form.bankId === b._id ? colors.accent : colors.border }}>
                  <Text style={{ color: form.bankId === b._id ? 'white' : colors.textSub, fontSize: 12, fontWeight: '600' }}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Btn title="Add SIP" onPress={handleAdd} colors={colors} />
            <Btn title="Cancel" variant="ghost" onPress={() => setShowModal(false)} colors={colors} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}
