import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, Card, PageHeader, Input, Btn, EmptyState, fmt } from '../components/UI'
import api from '../services/api'

export default function TransfersScreen() {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [transfers, setTransfers] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fromBankId: '', toBankId: '', amount: '', notes: '' })

  const currency = currentUser?.currency || 'INR'
  const load = () => api.get('/api/transfers').then(r => setTransfers(r.data)).catch(console.error)
  useEffect(() => { load(); api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const handleTransfer = async () => {
    if (!form.fromBankId || !form.toBankId || !form.amount) return Alert.alert('Error', 'All fields required')
    try {
      await api.post('/api/transfers', form)
      setShowModal(false)
      setForm({ fromBankId: '', toBankId: '', amount: '', notes: '' })
      load()
    } catch (err) { Alert.alert('Error', err.response?.data?.message || 'Transfer failed') }
  }

  return (
    <ScreenWrapper colors={colors}>
      <PageHeader title="Transfers" subtitle={`${transfers.length} transfer${transfers.length !== 1 ? 's' : ''}`} colors={colors}
        action={<Btn title="+ Transfer" onPress={() => setShowModal(true)} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />} />

      <Card colors={colors}>
        {transfers.length === 0 ? <EmptyState icon="🔄" title="No transfers yet" colors={colors} /> :
          transfers.map(t => (
            <View key={t._id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(79,172,254,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 18 }}>🔄</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t.fromBank?.name} → {t.toBank?.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t.notes || 'Transfer'} • {new Date(t.date).toLocaleDateString('en-IN')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#4facfe', fontWeight: '700' }}>{fmt(t.amount, currency)}</Text>
                <TouchableOpacity onPress={async () => { await api.delete(`/api/transfers/${t._id}`); load() }}>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </Card>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Transfer Money</Text>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>From Bank</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {banks.map(b => (
                <TouchableOpacity key={b._id} onPress={() => setForm({ ...form, fromBankId: b._id })}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.fromBankId === b._id ? colors.accent : colors.bg, borderWidth: 1, borderColor: form.fromBankId === b._id ? colors.accent : colors.border }}>
                  <Text style={{ color: form.fromBankId === b._id ? 'white' : colors.textSub, fontSize: 12, fontWeight: '600' }}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>To Bank</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {banks.map(b => (
                <TouchableOpacity key={b._id} onPress={() => setForm({ ...form, toBankId: b._id })}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.toBankId === b._id ? colors.accent : colors.bg, borderWidth: 1, borderColor: form.toBankId === b._id ? colors.accent : colors.border }}>
                  <Text style={{ color: form.toBankId === b._id ? 'white' : colors.textSub, fontSize: 12, fontWeight: '600' }}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Amount" colors={colors} value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} keyboardType="numeric" placeholder="0.00" />
            <Input label="Note (optional)" colors={colors} value={form.notes} onChangeText={v => setForm({ ...form, notes: v })} placeholder="Reason" />
            <Btn title="Transfer" onPress={handleTransfer} colors={colors} />
            <Btn title="Cancel" variant="ghost" onPress={() => setShowModal(false)} colors={colors} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}
