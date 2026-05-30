import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, Card, BalanceCard, EmptyState, fmt } from '../components/UI'
import api from '../services/api'

const CAT_ICONS = { Food: '🍔', Fuel: '⛽', Shopping: '🛍️', Bills: '📄', Travel: '✈️', Medical: '💊', Rent: '🏠', Tea: '☕', Snacks: '🍿', Transport: '🚌' }

export default function HomeScreen({ navigation }) {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/analytics/summary')
      .then(r => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const currency = currentUser?.currency || 'INR'

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  )

  const stats = [
    { label: 'Savings', value: fmt(summary?.totalSavings, currency), color: colors.success },
    { label: 'Today', value: fmt(summary?.todayDailyExpenses, currency), color: '#f7971e' },
    { label: 'Monthly', value: fmt(summary?.monthlyTotal, currency), color: colors.danger },
    { label: 'Other Exp.', value: fmt(summary?.monthlyOtherExpenses, currency), color: '#4facfe' },
  ]

  return (
    <ScreenWrapper colors={colors}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>👋 Hi, {currentUser?.name?.split(' ')[0]}</Text>
        <Text style={{ fontSize: 22 }}>💸</Text>
      </View>

      <BalanceCard label="Total Balance" amount={fmt(summary?.totalBalance, currency)} sub="Across all accounts" gradient={colors.accent} />

      {/* Stats grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        {stats.map(s => (
          <View key={s.label} style={{ flex: 1, minWidth: '45%', backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</Text>
            <Text style={{ color: s.color, fontSize: 16, fontWeight: '700' }}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Summary counts */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'EMIs', count: summary?.counts?.emis || 0, screen: 'More' },
          { label: 'SIPs', count: summary?.counts?.sips || 0, screen: 'More' },
          { label: 'Goals', count: summary?.counts?.goals || 0, screen: 'More' },
        ].map(item => (
          <TouchableOpacity key={item.label} onPress={() => navigation.navigate(item.screen)}
            style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{item.count}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent transactions */}
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>Recent Transactions</Text>
      <Card colors={colors} style={{ marginBottom: 0 }}>
        {!summary?.recentTransactions?.length ? (
          <EmptyState icon="💳" title="No transactions yet" colors={colors} />
        ) : summary.recentTransactions.map(txn => (
          <View key={txn._id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${colors.accent}22`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 18 }}>{txn.txnType === 'transfer' ? '🔄' : (CAT_ICONS[txn.category] || '📦')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>
                {txn.txnType === 'transfer' ? `${txn.fromBank?.name} → ${txn.toBank?.name}` : (txn.notes || txn.category)}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{new Date(txn.date).toLocaleDateString('en-IN')}</Text>
            </View>
            <Text style={{ color: txn.txnType === 'transfer' ? '#4facfe' : colors.danger, fontWeight: '700' }}>
              {txn.txnType === 'transfer' ? '' : '-'}{fmt(txn.amount, currency)}
            </Text>
          </View>
        ))}
      </Card>
    </ScreenWrapper>
  )
}
