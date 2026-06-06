import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, Card, PageHeader, Input, Btn, EmptyState, fmt } from '../components/UI'
import api from '../services/api'

const DAILY_CATS = ['Food', 'Fuel', 'Tea', 'Snacks', 'Transport']
const OTHER_CATS = ['Rent', 'Bills', 'Insurance', 'Hospital', 'Shopping', 'Travel', 'Education', 'Entertainment', 'Other']
const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Net Banking']
const CAT_ICONS = { Food: '🍔', Fuel: '⛽', Tea: '☕', Snacks: '🍿', Transport: '🚌', Rent: '🏠', Bills: '📄', Insurance: '🛡️', Hospital: '🏥', Shopping: '🛍️', Travel: '✈️', Education: '🎓', Entertainment: '🎬', Other: '📦' }

export default function ExpensesScreen() {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [expenses, setExpenses] = useState([])
  const [banks, setBanks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')
  const [form, setForm] = useState({ type: 'Daily', category: 'Food', customCategory: '', bankId: '', amount: '', paymentMethod: 'UPI', notes: '', date: new Date().toISOString().split('T')[0] })

  const currency = currentUser?.currency || 'INR'
  const load = () => {
    const params = typeFilter !== 'All' ? { type: typeFilter } : {}
    api.get('/api/expenses', { params }).then(r => setExpenses(r.data)).catch(console.error)
  }
  useEffect(() => { load() }, [typeFilter])
  useEffect(() => { api.get('/api/banks').then(r => setBanks(r.data)) }, [])

  const handleAdd = async () => {
    if (!form.bankId || !form.amount) return Alert.alert('Error', 'Bank and amount are required')
    const finalCategory = (form.type === 'Other' && form.category === 'Other' && form.customCategory?.trim())
      ? form.customCategory.trim() : form.category
    try {
      await api.post('/api/expenses', { ...form, category: finalCategory })
      setShowModal(false)
      setForm({ type: 'Daily', category: 'Food', customCategory: '', bankId: '', amount: '', paymentMethod: 'UPI', notes: '', date: new Date().toISOString().split('T')[0] })
      load()
    } catch (err) { Alert.alert('Error', err.response?.data?.message || 'Failed') }
  }

  const cats = form.type === 'Daily' ? DAILY_CATS : OTHER_CATS
  const daily = expenses.filter(e => e.type === 'Daily')
  const other = expenses.filter(e => e.type === 'Other')

  const ExpenseRow = ({ exp }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${colors.accent}22`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Text style={{ fontSize: 18 }}>{CAT_ICONS[exp.category] || '📦'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{exp.notes || exp.category}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{exp.category} • {exp.paymentMethod} • {new Date(exp.date).toLocaleDateString('en-IN')}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: colors.danger, fontWeight: '700' }}>-{fmt(exp.amount, currency)}</Text>
        <TouchableOpacity onPress={async () => { await api.delete(`/api/expenses/${exp._id}`); load() }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <ScreenWrapper colors={colors}>
      <PageHeader title="Expenses" subtitle={`${expenses.length} transactions`} colors={colors}
        action={<Btn title="+ Add" onPress={() => setShowModal(true)} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />} />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {['All', 'Daily', 'Other'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTypeFilter(t)}
            style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: typeFilter === t ? colors.accent : colors.card, borderWidth: 1, borderColor: typeFilter === t ? colors.accent : colors.border }}>
            <Text style={{ color: typeFilter === t ? 'white' : colors.textSub, fontWeight: '600', fontSize: 13 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {(typeFilter === 'All' || typeFilter === 'Daily') && (
        <>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 8 }}>Daily Expenses</Text>
          <Card colors={colors}>
            {daily.length === 0 ? <Text style={{ color: colors.textMuted, textAlign: 'center', padding: 12 }}>No daily expenses</Text> : daily.map(e => <ExpenseRow key={e._id} exp={e} />)}
          </Card>
        </>
      )}
      {(typeFilter === 'All' || typeFilter === 'Other') && (
        <>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 8, marginTop: 4 }}>Other Expenses</Text>
          <Card colors={colors}>
            {other.length === 0 ? <Text style={{ color: colors.textMuted, textAlign: 'center', padding: 12 }}>No other expenses</Text> : other.map(e => <ExpenseRow key={e._id} exp={e} />)}
          </Card>
        </>
      )}

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Add Expense</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {['Daily', 'Other'].map(t => (
                <TouchableOpacity key={t} onPress={() => setForm({ ...form, type: t, category: t === 'Daily' ? 'Food' : 'Rent' })}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: form.type === t ? colors.accent : colors.bg, alignItems: 'center', borderWidth: 1, borderColor: form.type === t ? colors.accent : colors.border }}>
                  <Text style={{ color: form.type === t ? 'white' : colors.textSub, fontWeight: '600' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {cats.map(c => (
                <TouchableOpacity key={c} onPress={() => setForm({ ...form, category: c })}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.category === c ? colors.accent : colors.bg, borderWidth: 1, borderColor: form.category === c ? colors.accent : colors.border }}>
                  <Text style={{ color: form.category === c ? 'white' : colors.textSub, fontSize: 12, fontWeight: '600' }}>{CAT_ICONS[c]} {c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Free-text for "Other" category */}
            {form.type === 'Other' && form.category === 'Other' && (
              <Input label="Specify (e.g. Salon, Medicine...)" colors={colors} value={form.customCategory || ''} onChangeText={v => setForm({ ...form, customCategory: v })} placeholder="Type category..." />
            )}
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>Bank</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {banks.map(b => (
                <TouchableOpacity key={b._id} onPress={() => setForm({ ...form, bankId: b._id })}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: form.bankId === b._id ? colors.accent : colors.bg, borderWidth: 1, borderColor: form.bankId === b._id ? colors.accent : colors.border }}>
                  <Text style={{ color: form.bankId === b._id ? 'white' : colors.textSub, fontSize: 12, fontWeight: '600' }}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Amount" colors={colors} value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} keyboardType="numeric" placeholder="0.00" />
            <Input label="Note (optional)" colors={colors} value={form.notes} onChangeText={v => setForm({ ...form, notes: v })} placeholder="What was this for?" />
            <Btn title="Add Expense" onPress={handleAdd} colors={colors} />
            <Btn title="Cancel" variant="ghost" onPress={() => setShowModal(false)} colors={colors} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}
