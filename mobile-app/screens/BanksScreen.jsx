import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert, ScrollView, TextInput, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { fmt } from '../components/UI'
import api from '../services/api'

const PURPOSES = ['Salary', 'Daily', 'Savings', 'SIP', 'EMI', 'Investment']
const PURPOSE_COLORS = { Salary: '#059669', Savings: '#7c6bef', Daily: '#f7971e', SIP: '#2563eb', EMI: '#ff6b8a', Investment: '#06b6d4' }
const PURPOSE_ICONS = { Salary: '💼', Savings: '🏦', Daily: '🛒', SIP: '📈', EMI: '📋', Investment: '💹' }

export default function BanksScreen() {
  const { currentUser } = useAuth()
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', purpose: 'Salary', balance: '' })
  const currency = currentUser?.currency || 'INR'
  const totalBalance = banks.reduce((s, b) => s + parseFloat(b.balance || 0), 0)

  const load = () => api.get('/api/banks').then(r => setBanks(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.name || !form.balance) return Alert.alert('Error', 'Name and balance required')
    try {
      if (editing) await api.put(`/api/banks/${editing}`, form)
      else await api.post('/api/banks', form)
      setShowModal(false); setEditing(null); setForm({ name: '', purpose: 'Salary', balance: '' }); load()
    } catch (err) { Alert.alert('Error', err.response?.data?.message || 'Failed') }
  }

  const handleDelete = id => {
    Alert.alert('Delete Bank', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/api/banks/${id}`); load() }
        catch (err) { Alert.alert('Cannot Delete', err.response?.data?.message || 'Has associated records') }
      }},
    ])
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Banks</Text>
          <Text style={styles.sub}>{banks.length} account{banks.length !== 1 ? 's' : ''} · {fmt(totalBalance, currency)}</Text>
        </View>
        <TouchableOpacity onPress={() => { setEditing(null); setForm({ name: '', purpose: 'Salary', balance: '' }); setShowModal(true) }} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Bank</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {banks.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🏦</Text>
            <Text style={{ color: '#8080a0', fontWeight: '600', fontSize: 16 }}>No banks added</Text>
            <Text style={{ color: '#555570', fontSize: 13, marginTop: 4 }}>Add your first bank account</Text>
          </View>
        ) : (
          banks.map(bank => {
            const color = PURPOSE_COLORS[bank.purpose] || '#2563eb'
            return (
              <View key={bank._id} style={[styles.card, { marginBottom: 14 }]}>
                <View style={{ height: 3, backgroundColor: color, borderRadius: 4, marginBottom: 14, marginHorizontal: -1 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${color}22`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18 }}>{PURPOSE_ICONS[bank.purpose] || '🏦'}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardTitle}>{bank.name}</Text>
                      <Text style={[styles.cardSub, { color }]}>{bank.purpose}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.balanceText}>{fmt(bank.balance, currency)}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                  <TouchableOpacity onPress={() => { setEditing(bank._id); setForm({ name: bank.name, purpose: bank.purpose, balance: String(bank.balance) }); setShowModal(true) }} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(bank._id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Bank' : 'Add Bank'}</Text>
            <Text style={styles.fieldLabel}>Bank Name</Text>
            <TextInput style={styles.field} placeholder="e.g. HDFC Savings" placeholderTextColor="#555570" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
            <Text style={styles.fieldLabel}>Purpose</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
              {PURPOSES.map(p => {
                const c = PURPOSE_COLORS[p] || '#2563eb'
                return (
                  <TouchableOpacity key={p} onPress={() => setForm({ ...form, purpose: p })}
                    style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: form.purpose === p ? c : '#252535', backgroundColor: form.purpose === p ? `${c}22` : '#15151f' }}>
                    <Text style={{ color: form.purpose === p ? c : '#6b6b8a', fontWeight: '600', fontSize: 13 }}>{PURPOSE_ICONS[p]} {p}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <Text style={styles.fieldLabel}>Current Balance (₹)</Text>
            <TextInput style={styles.field} placeholder="0" placeholderTextColor="#555570" keyboardType="numeric" value={form.balance} onChangeText={v => setForm({ ...form, balance: v })} />
            <TouchableOpacity onPress={handleSave} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>{editing ? 'Update Bank' : 'Add Bank'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: '#555570', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f13' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  title: { color: '#e0e0f0', fontSize: 22, fontWeight: '800' },
  sub: { color: '#555570', fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  card: { backgroundColor: '#15151f', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#252535' },
  cardTitle: { color: '#e0e0f0', fontWeight: '700', fontSize: 15 },
  cardSub: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  balanceText: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  editBtn: { flex: 1, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#252535', borderRadius: 10, padding: 9, alignItems: 'center' },
  editBtnText: { color: '#8080a0', fontWeight: '600', fontSize: 13 },
  deleteBtn: { backgroundColor: 'rgba(255,107,138,0.1)', borderWidth: 1, borderColor: 'rgba(255,107,138,0.2)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  deleteBtnText: { fontSize: 16 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { backgroundColor: '#111118', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { color: '#e0e0f0', fontWeight: '700', fontSize: 18, marginBottom: 16 },
  fieldLabel: { color: '#6b6b8a', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  field: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#252535', borderRadius: 12, padding: 13, color: '#e0e0f0', fontSize: 15, marginBottom: 14 },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 14, padding: 15, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
