// Shared UI primitives for MoneyFlowX mobile
import React from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'

export const Card = ({ children, style, colors }) => (
  <View style={[{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }, style]}>
    {children}
  </View>
)

export const Btn = ({ title, onPress, variant = 'primary', style, disabled, colors }) => {
  const bg = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : 'transparent'
  const border = variant === 'ghost' ? colors.border : 'transparent'
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ backgroundColor: bg, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: border, opacity: disabled ? 0.6 : 1 }, style]}
    >
      <Text style={{ color: variant === 'ghost' ? colors.text : 'white', fontWeight: '700', fontSize: 15 }}>{title}</Text>
    </TouchableOpacity>
  )
}

export const Input = ({ label, colors, style, ...props }) => (
  <View style={{ marginBottom: 14 }}>
    {label && <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>}
    <TextInput
      style={[{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 13, color: colors.text, fontSize: 15 }, style]}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
  </View>
)

export const EmptyState = ({ icon, title, desc, colors }) => (
  <View style={{ alignItems: 'center', padding: 40 }}>
    <Text style={{ fontSize: 40, marginBottom: 10 }}>{icon}</Text>
    <Text style={{ color: colors.textSub, fontWeight: '600', fontSize: 16, marginBottom: 4 }}>{title}</Text>
    {desc && <Text style={{ color: colors.textMuted, fontSize: 13 }}>{desc}</Text>}
  </View>
)

export const BalanceCard = ({ label, amount, sub, gradient = '#6c63ff' }) => (
  <View style={{ backgroundColor: gradient, borderRadius: 20, padding: 24, marginBottom: 16 }}>
    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 6 }}>{label}</Text>
    <Text style={{ color: 'white', fontSize: 28, fontWeight: '800' }}>{amount}</Text>
    {sub && <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>{sub}</Text>}
  </View>
)

export const ProgressBar = ({ pct, color = '#6c63ff' }) => (
  <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
    <View style={{ height: '100%', width: `${Math.min(100, pct)}%`, backgroundColor: color, borderRadius: 4 }} />
  </View>
)

export const ScreenWrapper = ({ children, colors, style }) => (
  <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[{ padding: 16, paddingBottom: 32 }, style]}>
    {children}
  </ScrollView>
)

export const PageHeader = ({ title, subtitle, colors, action }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
    <View>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{title}</Text>
      {subtitle && <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{subtitle}</Text>}
    </View>
    {action}
  </View>
)

export const fmt = (n = 0, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
