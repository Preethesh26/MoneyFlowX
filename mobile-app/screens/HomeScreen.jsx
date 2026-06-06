import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  ScrollView, StyleSheet, StatusBar, Dimensions
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { fmt } from '../components/UI'
import api from '../services/api'

const { width } = Dimensions.get('window')

const CAT_ICONS = {
  Food: '🍔', Fuel: '⛽', Shopping: '🛍️', Bills: '📄',
  Travel: '✈️', Medical: '💊', Rent: '🏠', Tea: '☕',
  Snacks: '🍿', Transport: '🚌'
}
const CAT_COLORS = {
  Food: '#1e2a1e', Fuel: '#1e1e2e', Shopping: '#2a1e1a',
  Bills: '#1a2228', Travel: '#1a1e2a', Medical: '#2a1a22',
  Rent: '#1a2a1e', Tea: '#2a2218', Snacks: '#2a1e1e', Transport: '#1e1e2a'
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  )
}

function PillCard({ count, label, onPress }) {
  return (
    <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.pillCount}>{count}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

function TxnRow({ txn, currency }) {
  const isTransfer = txn.txnType === 'transfer'
  const icon = isTransfer ? '🔄' : (CAT_ICONS[txn.category] || '📦')
  const iconBg = isTransfer ? '#1a1e2a' : (CAT_COLORS[txn.category] || '#1e1e2e')
  const amountColor = isTransfer ? '#4facfe' : '#ff6b8a'
  const prefix = isTransfer ? '' : '-'
  const label = isTransfer
    ? `${txn.fromBank?.name} → ${txn.toBank?.name}`
    : (txn.notes || txn.category)
  return (
    <View style={styles.txnItem}>
      <View style={[styles.txnIconWrap, { backgroundColor: iconBg }]}>
        <Text style={styles.txnIcon}>{icon}</Text>
      </View>
      <View style={styles.txnInfo}>
        <Text style={styles.txnName} numberOfLines={1}>{label}</Text>
        <Text style={styles.txnDate}>
          {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </Text>
      </View>
      <Text style={[styles.txnAmount, { color: amountColor }]}>
        {prefix}{fmt(txn.amount, currency)}
      </Text>
    </View>
  )
}

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
  const firstName = currentUser?.name?.split(' ')[0] || 'there'
  const initials = currentUser?.name?.charAt(0).toUpperCase() || '?'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7c6bef" />
      </View>
    )
  }

  const stats = [
    { icon: '💰', label: 'SAVINGS', value: fmt(summary?.totalSavings, currency), color: '#2dd883' },
    { icon: '📅', label: 'TODAY', value: fmt(summary?.todayDailyExpenses, currency), color: '#f7971e' },
    { icon: '📊', label: 'MONTHLY', value: fmt(summary?.monthlyTotal, currency), color: '#ff6b8a' },
    { icon: '💳', label: 'OTHER EXP.', value: fmt(summary?.monthlyOtherExpenses, currency), color: '#4facfe' },
  ]

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f13" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingSmall}>{greeting}</Text>
            <Text style={styles.greetingLarge}>
              Hi, <Text style={styles.greetingAccent}>{firstName}</Text> 👋
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balLabel}>TOTAL BALANCE</Text>
          <Text style={styles.balAmount}>{fmt(summary?.totalBalance, currency)}</Text>
          <Text style={styles.balSub}>Across all accounts</Text>
          <View style={styles.balTrend}>
            <Text style={styles.balTrendText}>↑ This month</Text>
          </View>
          <View style={styles.decCircle1} pointerEvents="none" />
          <View style={styles.decCircle2} pointerEvents="none" />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </View>

        {/* Pills Row */}
        <View style={styles.pillsRow}>
          <PillCard count={summary?.counts?.emis || 0} label="EMIs" onPress={() => navigation.navigate('More')} />
          <PillCard count={summary?.counts?.sips || 0} label="SIPs" onPress={() => navigation.navigate('More')} />
          <PillCard count={summary?.counts?.goals || 0} label="Goals" onPress={() => navigation.navigate('More')} />
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.txnList}>
          {!summary?.recentTransactions?.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>Your recent activity will appear here</Text>
            </View>
          ) : (
            summary.recentTransactions.map((txn, i) => (
              <View key={txn._id}>
                <TxnRow txn={txn} currency={currency} />
                {i < summary.recentTransactions.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f13' },
  loader: { flex: 1, backgroundColor: '#0f0f13', justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingSmall: { color: '#555570', fontSize: 12, marginBottom: 3 },
  greetingLarge: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  greetingAccent: { color: '#9f8dff' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2e2a5e', borderWidth: 1.5, borderColor: '#7c6bef', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#9f8dff', fontSize: 15, fontWeight: '700' },
  balanceCard: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#2e2e4a', borderRadius: 20, padding: 20, marginBottom: 16, overflow: 'hidden' },
  balLabel: { color: '#555570', fontSize: 10, letterSpacing: 1, marginBottom: 8, fontWeight: '600' },
  balAmount: { color: '#ffffff', fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  balSub: { color: '#555570', fontSize: 12, marginTop: 4 },
  balTrend: { alignSelf: 'flex-start', backgroundColor: '#0d2d1f', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 12 },
  balTrendText: { color: '#2dd883', fontSize: 11, fontWeight: '600' },
  decCircle1: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: '#7c6bef18' },
  decCircle2: { position: 'absolute', bottom: -30, left: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: '#4facfe10' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: { width: (width - 42) / 2, backgroundColor: '#15151f', borderWidth: 1, borderColor: '#252535', borderRadius: 16, padding: 14 },
  statIcon: { fontSize: 18, marginBottom: 8 },
  statLabel: { color: '#555570', fontSize: 10, letterSpacing: 0.5, marginBottom: 5, fontWeight: '600' },
  statValue: { fontSize: 16, fontWeight: '700' },
  pillsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pill: { flex: 1, backgroundColor: '#15151f', borderWidth: 1, borderColor: '#252535', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  pillCount: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  pillLabel: { color: '#555570', fontSize: 10, marginTop: 4, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  seeAll: { color: '#7c6bef', fontSize: 12, fontWeight: '500' },
  txnList: { backgroundColor: '#15151f', borderWidth: 1, borderColor: '#252535', borderRadius: 18, overflow: 'hidden' },
  txnItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  txnIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txnIcon: { fontSize: 18 },
  txnInfo: { flex: 1 },
  txnName: { color: '#d0d0e0', fontSize: 13, fontWeight: '500' },
  txnDate: { color: '#555570', fontSize: 11, marginTop: 3 },
  txnAmount: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#1e1e2a', marginHorizontal: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { color: '#8080a0', fontSize: 14, fontWeight: '500' },
  emptySub: { color: '#555570', fontSize: 12, marginTop: 4 },
})
