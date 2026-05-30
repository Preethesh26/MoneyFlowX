import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Input, Btn } from '../components/UI'

export default function LoginScreen({ navigation }) {
  const { login } = useAuth()
  const { colors } = useTheme()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!form.email || !form.password) return Alert.alert('Error', 'Please fill all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 24, justifyContent: 'center', minHeight: '100%' }}>
      <View style={{ alignItems: 'center', marginBottom: 36 }}>
        <View style={{ width: 72, height: 72, backgroundColor: colors.accent, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 32 }}>💸</Text>
        </View>
        <Text style={{ color: colors.accent, fontSize: 26, fontWeight: '800' }}>MoneyFlowX</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>Smart Finance, Simplified</Text>
      </View>

      <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4 }}>Welcome back</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 20 }}>Sign in to your account</Text>

        <Input label="Email" colors={colors} value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        <Input label="Password" colors={colors} value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry placeholder="••••••••" />

        <Btn title={loading ? 'Signing in...' : 'Sign In'} onPress={handleLogin} disabled={loading} colors={colors} style={{ marginTop: 4 }} />

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Don't have an account? <Text style={{ color: colors.accent, fontWeight: '600' }}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
