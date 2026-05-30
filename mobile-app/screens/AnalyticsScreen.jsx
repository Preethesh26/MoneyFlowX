import React, { useState, useEffect } from 'react'
import { View, Text, Dimensions, ActivityIndicator } from 'react-native'
import { BarChart, PieChart } from 'react-native-chart-kit'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ScreenWrapper, Card, EmptyState, fmt } from '../components/UI'
import api from '../services/api'

const SCREEN_WIDTH = Dimensions.get('window').width - 32
const CHART_COLORS = ['#6c63ff', '#f7971e', '#43e97b', '#ff6584', '#4facfe', '#a855f7', '#ffd200', '#38f9d7']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AnalyticsScreen() {
  const { currentUser } = useAuth()
  const { colors } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const currency = currentUser?.currency || 'INR'

  useEffect(() => {
    api.get('/api/analytics/expenses')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  )

  if (!data || (!data.byCategory?.length && !data.byMonth?.length)) {
    return (
      <ScreenWrapper colors={colors}>
        <EmptyState icon="📊" title="No analytics data yet" desc="Add expenses to see insights" colors={colors} />
      </ScreenWrapper>
    )
  }

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    labelColor: () => colors.textMuted,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.accent },
  }

  const dailyTotal = data.byType?.find(t => t._id === 'Daily')?.total || 0
  const otherTotal = data.byType?.find(t => t._id === 'Other')?.total || 0

  const pieData = (data.byCategory || []).slice(0, 6).map((c, i) => ({
    name: c._id,
    population: c.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
    legendFontColor: colors.textSub,
    legendFontSize: 12,
  }))

  const barLabels = (data.byMonth || []).map(m => MONTHS[m._id.month - 1])
  const barValues = (data.byMonth || []).map(m => m.total)

  return (
    <ScreenWrapper colors={colors}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Analytics</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>Your spending insights</Text>

      {/* Daily vs Other */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>Daily Expenses</Text>
          <Text style={{ color: '#f7971e', fontSize: 16, fontWeight: '700' }}>{fmt(dailyTotal, currency)}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>Other Expenses</Text>
          <Text style={{ color: '#4facfe', fontSize: 16, fontWeight: '700' }}>{fmt(otherTotal, currency)}</Text>
        </View>
      </View>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <Card colors={colors} style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Expense by Category</Text>
          <PieChart
            data={pieData}
            width={SCREEN_WIDTH - 32}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute={false}
          />
        </Card>
      )}

      {/* Bar Chart */}
      {barValues.length > 0 && (
        <Card colors={colors}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Monthly Expenses</Text>
          <BarChart
            data={{ labels: barLabels, datasets: [{ data: barValues }] }}
            width={SCREEN_WIDTH - 32}
            height={180}
            chartConfig={chartConfig}
            style={{ borderRadius: 12 }}
            showValuesOnTopOfBars={false}
            fromZero
          />
        </Card>
      )}
    </ScreenWrapper>
  )
}
