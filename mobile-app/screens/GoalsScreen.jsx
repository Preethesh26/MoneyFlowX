import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, Card, PageHeader, Input, Btn, EmptyState, ProgressBar, fmt } from '../components/UI'
import api from '../services/api'

export default function GoalsScreen() {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [goals, setGoals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showFunds, setShowFunds] = useState(null)
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '' })
  const [addAmount, setAddAmount] = useState('')

  const currency = currentUser?.currency || 'INR'
  const load = () => api.get('/api/goals').then(r => setGoals(r.data)).catch(console.error)
  useEffect(() => { load() }, [])

  return (
    <ScreenWrapper colors={colors}>
      <PageHeader title="Goals" subtitle={`${goals.length} goal${goals.length !== 1 ? 's' : ''}`} colors={colors}
        action={<Btn title="+ Add" onPress={() => { setForm({ name: '', targetAmount: '', targetDate: '' }); setShowModal(true) }} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />} />

      {goals.length === 0 ? <EmptyState icon="🎯" title="No goals yet" desc="Set a savings goal" colors={colors} /> :
        goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
          return (
            <Card key={goal._id} colors={colors}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{goal.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Target: {fmt(goal.targetAmount, currency)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {goal.isCompleted
                    ? <Text style={{ color: colors.success, fontWeight: '700' }}>✅ Done</Text>
                    : <Text style={{ color: colors.success, fontWeight: '700' }}>{pct}%</Text>}
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{fmt(goal.savedAmount, currency)} saved</Text>
                </View>
              </View>
              <ProgressBar pct={pct} color={colors.accent} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {!goal.isCompleted && <Btn title="+ Funds" variant="ghost" onPress={() => { setShowFunds(goal._id); setAddAmount('') }} colors={colors} style={{ flex: 1, paddingVertical: 8 }} />}
                <Btn title="🗑️" variant="danger" onPress={async () => { await api.delete(`/api/goals/${goal._id}`); load() }} colors={colors} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
              </View>
            </Card>
          )
        })}

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Add Goal</Text>
            <Input label="Goal Name" colors={colors} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="e.g. New Laptop" />
            <Input label="Target Amount" colors={colors} value={form.targetAmount} onChangeText={v => setForm({ ...form, targetAmount: v })} keyboardType="numeric" placeholder="50000" />
            <Btn title="Add Goal" onPress={async () => { await api.post('/api/goals', form); setShowModal(false); load() }} colors={colors} />
            <Btn title="Cancel" variant="ghost" onPress={() => setShowModal(false)} colors={colors} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      <Modal visible={!!showFunds} animationType="slide" transparent onRequestClose={() => setShowFunds(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Add Funds</Text>
            <Input label="Amount" colors={colors} value={addAmount} onChangeText={setAddAmount} keyboardType="numeric" placeholder="0.00" />
            <Btn title="Add Funds" onPress={async () => { await api.put(`/api/goals/${showFunds}`, { contribution: parseFloat(addAmount) }); setShowFunds(null); load() }} colors={colors} />
            <Btn title="Cancel" variant="ghost" onPress={() => setShowFunds(null)} colors={colors} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}
