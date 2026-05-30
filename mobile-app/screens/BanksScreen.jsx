import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, Card, PageHeader, Input, Btn, EmptyState, fmt } from '../components/UI'
import api from '../services/api'

const PURPOSES = ['Salary', 'Daily', 'Savings', 'SIP', 'EMI', 'Investment']
const PURPOSE_COLORS = { Salary: '#43e97b', Savings: '#6c63ff', Daily: '#f7971e', SIP: '#4facfe', EMI: '#ff6584', Investment: '#a855f7' }

export default function BanksScreen() {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', purpose: 'Salary', balance: '' })

  const currency = currentUser?.currency || 'INR'
  const load = () => api.get('/api/banks').then(r => setBanks(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/api/banks/${editing}`, form)
      else await api.post('/api/banks', form)
      setShowModal(false)
      setEditing(null)
      setForm({ name: '', purpose: 'Salary', balance: '' })
      load()
    } catch (err) { Alert.alert('Error', err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    Alert.alert('Delete Bank', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/banks/${id}`); load() }
        catch (err) { Alert.alert('Cannot Delete', err.response?.data?.message || 'Has associated records') }
      }},
    ])
  }

  return (
    <ScreenWrapper colors={colors}>
      <PageHeader title="Banks" subtitle={`${banks.length} account${banks.length !== 1 ? 's' : ''}`} colors={colors}
        action={<Btn title="+ Add" onPress={() => { setEditing(null); setForm({ name: '', purpose: 'Salary', balance: '' }); setShowModal(true) }} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />} />

      {banks.length === 0 ? <EmptyState icon="🏦" title="No banks added" desc="Add your first bank account" colors={colors} /> :
        banks.map(bank => (
          <Card key={bank._id} colors={colors}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{bank.name}</Text>
              <View style={{ backgroundColor: `${PURPOSE_COLORS[bank.purpose] || colors.accent}22`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ color: PURPOSE_COLORS[bank.purpose] || colors.accent, fontSize: 11, fontWeight: '700' }}>{bank.purpose}</Text>
              </View>
            </View>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 12 }}>{fmt(bank.balance, currency)}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn title="✏️ Edit" variant="ghost" onPress={() => { setEditing(bank._id); setForm({ name: bank.name, purpose: bank.purpose, balance: String(bank.balance) }); setShowModal(true) }} colors={colors} style={{ flex: 1, paddingVertical: 8 }} />
              <Btn title="🗑️" variant="danger" onPress={() => handleDelete(bank._id)} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
            </View>
          </Card>
        ))}

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>{editing ? 'Edit Bank' : 'Add Bank'}</Text>
            <Input label="Bank Name" colors={colors} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="e.g. HDFC Savings" />
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>Purpose</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {PURPOSES.map(p => (
                <TouchableOpacity key={p} onPress={() => setForm({ ...form, purpose: p })}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: form.purpose === p ? colors.accent : colors.bg, borderWidth: 1, borderColor: form.purpose === p ? colors.accent : colors.border }}>
                  <Text style={{ color: form.purpose === p ? 'white' : colors.textSub, fontWeight: '600', fontSize: 13 }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Balance" colors={colors} value={form.balance} onChangeText={v => setForm({ ...form, balance: v })} keyboardType="numeric" placeholder="0" />
            <Btn title={editing ? 'Update' : 'Add Bank'} onPress={handleSave} colors={colors} />
            <Btn title="Cancel" variant="ghost" onPress={() => setShowModal(false)} colors={colors} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}
