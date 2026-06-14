import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert, ScrollView, TextInput, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { fmt } from '../components/UI'
import api from '../services/api'

const DAILY_CATS = ['Food', 'Fuel', 'Tea', 'Snacks', 'Transport']
const OTHER_CATS = ['Rent', 'Bills', 'Insurance', 'Hospital', 'Shopping', 'Travel', 'Education', 'Entertainment', 'Other']
const CAT_ICONS = { Food: '🍔', Fuel: '⛽', Tea: '☕', Snacks: '🍿', Transport: '🚌', Rent: '🏠', Bills: '📄', Insurance: '🛡️', Hospital: '🏥', Shopping: '🛍️', Travel: '✈️', Education: '🎓', Entertainment: '🎬', Other: '📦' }
const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Net Banking']

const EMPTY = { txnType: 'Expense', title: '', type: 'Daily', category: 'Food', customCategory: '', bankId: '', amount: '', paymentMethod: 'UPI', date: new Date().toISOString().split('T')[0] }

export default function ExpensesScreen() {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [expenses, setExpenses] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')
  const [form, setForm] = useState(EMPTY)
  const currency = currentUser?.currency || 'INR'

  const load = () => {
    const params = typeFilter !== 'All' ? { type: typeFilter } : {}
    api.get('/api/expenses', { params }).then(r => setExpenses(r.data)).catch(console.error)
  }
  useEffect(() => { load() }, [typeFilter])
  useEffect(() => { api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const cats = form.type === 'Daily' ? DAILY_CATS : OTHER_CATS
  const isOtherCustom = form.txnType === 'Expense' && form.type === 'Other' && form.category === 'Other'

  const handleAdd = async () => {
    if (!form.bankId || !form.amount) return Alert.alert('Error', 'Bank and amount required')
    const finalCategory = isOtherCustom && form.customCategory?.trim()
      ? form.customCategory.trim()
      : (form.txnType !== 'Expense' ? form.txnType : form.category)
    try {
      await api.post('/api/expenses', {
        type: form.txnType === 'Expense' ? form.type : 'Other',
        category: finalCategory,
        bankId: form.bankId,
        amount: form.amount,
        paymentMethod: form.paymentMethod,
        notes: form.title,
        date: form.date,
      })
      setShowModal(false)
      setForm(EMPTY)
      load()
    } catch (err) { Alert.alert('Error', err.response?.data?.message || 'Failed') }
  }

  // Group by date
  const grouped = expenses.reduce((acc, exp) => {
    const d = new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    if (!acc[d]) acc[d] = []
    acc[d].push(exp)
    return acc
  }, {})

  const totalAmt = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f13' }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Expenses</Text>
          <Text style={styles.pageSub}>{expenses.length} transactions · {fmt(totalAmt, currency)}</Text>
        </View>
        <TouchableOpacity onPress={() => { setForm(EMPTY); setShowModal(true) }} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {['All', 'Daily', 'Other'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTypeFilter(t)}
            style={[styles.filterTab, typeFilter === t && styles.filterTabActive]}>
            <Text style={[styles.filterTabText, typeFilter === t && styles.filterTabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {Object.keys(grouped).length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>💳</Text>
            <Text style={{ color: '#8080a0', fontWeight: '600', fontSize: 16 }}>No transactions yet</Text>
            <Text style={{ color: '#555570', fontSize: 13, marginTop: 4 }}>Tap + Add to record your first</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([date, txns]) => (
            <View key={date} style={{ marginBottom: 20 }}>
              <Text style={styles.dateLabel}>{date}</Text>
              <View style={styles.txnCard}>
                {txns.map((exp, i) => (
                  <View key={exp._id} style={[styles.txnRow, i < txns.length - 1 && styles.txnBorder]}>
                    <View style={styles.txnIcon}>
                      <Text style={{ fontSize: 18 }}>{CAT_ICONS[exp.category] || '📦'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txnTitle} numberOfLines={1}>{exp.notes || exp.category}</Text>
                      <Text style={styles.txnSub}>{exp.category} · {exp.paymentMethod}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.txnAmount}>-{fmt(exp.amount, currency)}</Text>
                      <TouchableOpacity onPress={() => api.delete(`/api/expenses/${exp._id}`).then(load)}>
                        <Text style={{ color: '#333350', fontSize: 12, marginTop: 2 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Type tabs */}
            <View style={styles.typeTabs}>
              {['Expense', 'Income', 'Transfer'].map(t => (
                <TouchableOpacity key={t} onPress={() => setForm({ ...form, txnType: t })}
                  style={[styles.typeTab, form.txnType === t && { backgroundColor: t === 'Expense' ? '#2563eb' : t === 'Income' ? '#059669' : '#7c6bef' }]}>
                  <Text style={[styles.typeTabText, form.txnType === t && { color: 'white' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add {form.txnType}</Text>

              {/* Title */}
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput style={styles.field} placeholder="E.g. Drinks, Salary..." placeholderTextColor="#555570" value={form.title} onChangeText={v => setForm({ ...form, title: v })} />

              {/* Amount */}
              <Text style={styles.fieldLabel}>Amount</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                <View style={[styles.field, { width: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 0 }]}>
                  <Text style={{ color: '#9f8dff', fontWeight: '700' }}>₹</Text>
                </View>
                <TextInput style={[styles.field, { flex: 1, marginBottom: 0 }]} placeholder="0.00" placeholderTextColor="#555570" keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />
              </View>

              {/* Category (Expense only) */}
              {form.txnType === 'Expense' && (
                <>
                  <Text style={styles.fieldLabel}>Type</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                    {['Daily', 'Other'].map(t => (
                      <TouchableOpacity key={t} onPress={() => setForm({ ...form, type: t, category: t === 'Daily' ? 'Food' : 'Rent', customCategory: '' })}
                        style={{ flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: form.type === t ? '#2563eb' : '#252535', backgroundColor: form.type === t ? '#1e3a8a22' : '#15151f', alignItems: 'center' }}>
                        <Text style={{ color: form.type === t ? '#60a5fa' : '#6b6b8a', fontWeight: '600', fontSize: 14 }}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.fieldLabel}>Category</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                    {cats.map(c => (
                      <TouchableOpacity key={c} onPress={() => setForm({ ...form, category: c, customCategory: '' })}
                        style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: form.category === c ? '#2563eb' : '#252535', backgroundColor: form.category === c ? '#2563eb' : '#15151f' }}>
                        <Text style={{ color: form.category === c ? 'white' : '#8080a0', fontSize: 12, fontWeight: '600' }}>{CAT_ICONS[c]} {c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {isOtherCustom && (
                    <>
                      <Text style={styles.fieldLabel}>Specify Category</Text>
                      <TextInput style={styles.field} placeholder="e.g. Salon, Medicine..." placeholderTextColor="#555570" value={form.customCategory || ''} onChangeText={v => setForm({ ...form, customCategory: v })} />
                    </>
                  )}
                </>
              )}

              {/* Bank */}
              <Text style={styles.fieldLabel}>{form.txnType === 'Income' ? 'Received By' : form.txnType === 'Transfer' ? 'From Bank' : 'Paid By'}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                {banks.map(b => (
                  <TouchableOpacity key={b._id} onPress={() => setForm({ ...form, bankId: b._id })}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: form.bankId === b._id ? '#2563eb' : '#252535', backgroundColor: form.bankId === b._id ? '#2563eb' : '#15151f' }}>
                    <Text style={{ color: form.bankId === b._id ? 'white' : '#8080a0', fontWeight: '600', fontSize: 13 }}>{b.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Payment method */}
              {form.txnType !== 'Transfer' && (
                <>
                  <Text style={styles.fieldLabel}>Payment Method</Text>
                  <View style={{ flexDirection: 'row', gap: 7, marginBottom: 14 }}>
                    {PAYMENT_METHODS.map(m => (
                      <TouchableOpacity key={m} onPress={() => setForm({ ...form, paymentMethod: m })}
                        style={{ flex: 1, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: form.paymentMethod === m ? '#2563eb' : '#252535', backgroundColor: form.paymentMethod === m ? '#1e3a8a22' : '#15151f', alignItems: 'center' }}>
                        <Text style={{ color: form.paymentMethod === m ? '#60a5fa' : '#6b6b8a', fontSize: 11, fontWeight: '600' }}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity onPress={handleAdd} style={styles.addBtnModal}>
                <Text style={styles.addBtnModalText}>Add {form.txnType}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowModal(false)} style={{ alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
                <Text style={{ color: '#555570', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  pageTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  pageSub: { color: '#555570', fontSize: 12, marginTop: 2 },
  addBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9 },
  addBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  filterRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#15151f', borderRadius: 12, padding: 4 },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  filterTabActive: { backgroundColor: '#2563eb' },
  filterTabText: { color: '#8080a0', fontWeight: '600', fontSize: 13 },
  filterTabTextActive: { color: 'white' },
  dateLabel: { color: '#555570', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  txnCard: { backgroundColor: '#15151f', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#252535' },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  txnBorder: { borderBottomWidth: 1, borderBottomColor: '#1e1e2a' },
  txnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1e1e2a', alignItems: 'center', justifyContent: 'center' },
  txnTitle: { color: '#d0d0e0', fontWeight: '600', fontSize: 14 },
  txnSub: { color: '#555570', fontSize: 11, marginTop: 2 },
  txnAmount: { color: '#ff6b8a', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet: { backgroundColor: '#111118', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '92%' },
  typeTabs: { flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 12, padding: 4, marginBottom: 16 },
  typeTab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  typeTabText: { color: '#6b6b8a', fontWeight: '700', fontSize: 14 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  fieldLabel: { color: '#6b6b8a', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  field: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#252535', borderRadius: 12, padding: 13, color: '#e0e0f0', fontSize: 15, marginBottom: 14 },
  addBtnModal: { backgroundColor: '#2563eb', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 8 },
  addBtnModalText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
