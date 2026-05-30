import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Input, Btn } from '../components/UI'

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const { colors } = useTheme()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return Alert.alert('Error', 'Please fill all fields')
    if (form.password !== form.confirm) return Alert.alert('Error', 'Passwords do not match')
    if (form.password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      Alert.alert('Success', 'Account created! Please sign in.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }])
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 28, marginTop: 40 }}>
        <View style={{ width: 64, height: 64, backgroundColor: colors.accent, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 28 }}>💸</Text>
        </View>
        <Text style={{ color: colors.accent, fontSize: 22, fontWeight: '800' }}>MoneyFlowX</Text>
      </View>

      <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4 }}>Create account</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 20 }}>Start managing your finances</Text>

        <Input label="Full Name" colors={colors} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="John Doe" />
        <Input label="Email" colors={colors} value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        <Input label="Password" colors={colors} value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry placeholder="Min 8 characters" />
        <Input label="Confirm Password" colors={colors} value={form.confirm} onChangeText={v => setForm({ ...form, confirm: v })} secureTextEntry placeholder="Repeat password" />

        <Btn title={loading ? 'Creating...' : 'Create Account'} onPress={handleRegister} disabled={loading} colors={colors} style={{ marginTop: 4 }} />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Already have an account? <Text style={{ color: colors.accent, fontWeight: '600' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
