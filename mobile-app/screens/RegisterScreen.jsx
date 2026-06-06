import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Input, Btn } from '../components/UI'

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const { colors } = useTheme()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputColors = { ...colors, card: '#0f0f1a', border: '#2e2e4a', text: '#fff', textMuted: '#555570', textSub: '#8080a0' }

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
    } finally { setLoading(false) }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f0f13' }} contentContainerStyle={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}><Text style={{ fontSize: 40 }}>💸</Text></View>
        <Text style={styles.appName}>MoneyFlowX</Text>
      </View>
      <View style={[styles.card, { backgroundColor: '#1a1a2e', borderColor: '#2e2e4a' }]}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start managing your finances</Text>
        <Input label="Full Name" colors={inputColors} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="John Doe" />
        <Input label="Email" colors={inputColors} value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        {/* Password */}
        <View style={{ marginBottom: 14 }}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View>
            <Input label="" colors={inputColors} value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry={!showPass} placeholder="Min 8 characters" style={{ paddingRight: 48 }} />
            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Confirm */}
        <View style={{ marginBottom: 14 }}>
          <Text style={styles.fieldLabel}>Confirm Password</Text>
          <View>
            <Input label="" colors={inputColors} value={form.confirm} onChangeText={v => setForm({ ...form, confirm: v })} secureTextEntry={!showConfirm} placeholder="Repeat password" style={{ paddingRight: 48 }} />
            <TouchableOpacity onPress={() => setShowConfirm(p => !p)} style={styles.eyeBtn}>
              <Text style={{ fontSize: 18 }}>{showConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Btn title={loading ? 'Creating...' : 'Create Account'} onPress={handleRegister} disabled={loading} colors={{ accent: '#7c6bef', text: '#fff' }} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: '#555570', fontSize: 13 }}>
            Already have an account? <Text style={{ color: '#7c6bef', fontWeight: '600' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center', minHeight: '100%' },
  logoWrap: { alignItems: 'center', marginBottom: 28, marginTop: 40 },
  logoCircle: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#1a1a2e', borderWidth: 2, borderColor: '#7c6bef', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  appName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  card: { width: '100%', borderRadius: 20, padding: 24, borderWidth: 1 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#555570', fontSize: 13, marginBottom: 20 },
  fieldLabel: { color: '#8080a0', fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
})
