import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { fmt } from '../components/UI'
import api from '../services/api'

const BG='#080810';const CARD='#13131e';const BORDER='#1a1a28';const MUTED='#50507a';const SUB='#9090b0';const TEXT='#f2f2fa'
const EMOJIS=['🎯','🏠','🚗','✈️','💍','📱','💻','🎓','💰','🏖️']

export default function GoalsScreen() {
  const { currentUser } = useAuth()
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showFunds, setShowFunds] = useState(null)
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', emoji: '🎯' })
  const [addAmount, setAddAmount] = useState('')
  const currency = currentUser?.currency || 'INR'

  const load = () => api.get('/api/goals').then(r => setGoals(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={s.header}>
        <View><Text style={s.title}>Goals</Text><Text style={s.sub}>{goals.length} goal{goals.length !== 1 ? 's' : ''}</Text></View>
        <TouchableOpacity onPress={() => { setForm({ name: '', targetAmount: '', targetDate: '', emoji: '🎯' }); setShowModal(true) }} style={[s.addBtn, { backgroundColor: '#10b981' }]}>
          <Text style={s.addBtnText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {goals.length === 0 ? (
          <View style={s.empty}><Text style={s.emptyIcon}>🎯</Text><Text style={s.emptyTitle}>No goals yet</Text><Text style={s.emptySub}>Set a target and track progress</Text></View>
        ) : goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
          return (
            <View key={goal._id} style={[s.card, { marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <Text style={{ fontSize: 28 }}>{goal.emoji || '🎯'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{goal.name}</Text>
                    <Text style={s.cardSub}>Target: {fmt(goal.targetAmount, currency)}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {goal.isCompleted
                    ? <View style={s.badge}><Text style={s.badgeText}>✅ Done</Text></View>
                    : <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 16 }}>{pct}%</Text>}
                  <Text style={s.cardSub}>{fmt(goal.savedAmount, currency)} saved</Text>
                </View>
              </View>
              <View style={s.progressBg}><View style={[s.progressFill, { width: `${pct}%`, backgroundColor: goal.isCompleted ? '#10b981' : '#3b82f6' }]} /></View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                {!goal.isCompleted && (
                  <TouchableOpacity onPress={() => { setShowFunds(goal._id); setAddAmount('') }} style={s.ghostBtn}>
                    <Text style={s.ghostBtnText}>+ Add Funds</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => api.delete(`/api/goals/${goal._id}`).then(load)} style={s.dangerBtn}>
                  <Text style={s.dangerBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={s.overlay}><View style={s.sheet}>
          <Text style={s.modalTitle}>Add Goal</Text>
          <Text style={s.fieldLabel}>Goal Name</Text>
          <TextInput style={s.field} placeholder="e.g. New Laptop" placeholderTextColor={MUTED} value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
          <Text style={s.fieldLabel}>Target Amount (₹)</Text>
          <TextInput style={s.field} placeholder="50000" placeholderTextColor={MUTED} keyboardType="numeric" value={form.targetAmount} onChangeText={v => setForm({ ...form, targetAmount: v })} />
          <Text style={s.fieldLabel}>Icon</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {EMOJIS.map(em => (
              <TouchableOpacity key={em} onPress={() => setForm({ ...form, emoji: em })}
                style={{ width: 42, height: 42, borderRadius: 12, borderWidth: 2, borderColor: form.emoji === em ? '#3b82f6' : BORDER, backgroundColor: form.emoji === em ? 'rgba(59,130,246,0.12)' : CARD, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>{em}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={async () => { await api.post('/api/goals', form); setShowModal(false); load() }} style={[s.submitBtn, { backgroundColor: '#10b981' }]}>
            <Text style={s.submitBtnText}>Add Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModal(false)} style={s.cancelBtn}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={!!showFunds} animationType="slide" transparent onRequestClose={() => setShowFunds(null)}>
        <View style={s.overlay}><View style={s.sheet}>
          <Text style={s.modalTitle}>Add Funds</Text>
          <Text style={s.fieldLabel}>Amount (₹)</Text>
          <TextInput style={s.field} placeholder="0.00" placeholderTextColor={MUTED} keyboardType="numeric" value={addAmount} onChangeText={setAddAmount} />
          <TouchableOpacity onPress={async () => { await api.put(`/api/goals/${showFunds}`, { contribution: parseFloat(addAmount) }); setShowFunds(null); load() }} style={[s.submitBtn, { backgroundColor: '#10b981' }]}>
            <Text style={s.submitBtnText}>Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFunds(null)} style={s.cancelBtn}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
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
  card: { backgroundColor: CARD, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: BORDER },
  cardTitle: { color: TEXT, fontWeight: '700', fontSize: 15 }, cardSub: { color: MUTED, fontSize: 12, marginTop: 2 },
  badge: { backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  progressBg: { height: 7, backgroundColor: BORDER, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  ghostBtn: { flex: 1, backgroundColor: '#13131e', borderWidth: 1, borderColor: '#222232', borderRadius: 10, padding: 9, alignItems: 'center' },
  ghostBtnText: { color: SUB, fontWeight: '600', fontSize: 13 },
  dangerBtn: { backgroundColor: 'rgba(244,63,94,0.08)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.15)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  dangerBtnText: { fontSize: 16 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { backgroundColor: '#0e0e18', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: '#222232' },
  modalTitle: { color: TEXT, fontWeight: '700', fontSize: 18, marginBottom: 16 },
  fieldLabel: { color: MUTED, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  field: { backgroundColor: '#13131e', borderWidth: 1, borderColor: '#222232', borderRadius: 12, padding: 13, color: TEXT, fontSize: 15, marginBottom: 14 },
  submitBtn: { borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4 }, submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', marginTop: 12, paddingBottom: 4 }, cancelBtnText: { color: MUTED, fontSize: 14 },
})
