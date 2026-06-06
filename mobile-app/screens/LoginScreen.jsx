import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Input, Btn } from '../components/UI'
import api from '../services/api'

export default function LoginScreen({ navigation }) {
  const { login } = useAuth()
  const { colors } = useTheme()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleLogin = async () => {
    if (!form.email || !form.password) return Alert.alert('Error', 'Please fill all fields')
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  const handleForgot = async () => {
    if (!forgotEmail) return Alert.alert('Error', 'Enter your email')
    setForgotLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email: forgotEmail })
      setForgotSent(true)
    } catch {
      Alert.alert('Error', 'Something went wrong. Try again.')
    } finally { setForgotLoading(false) }
  }

  if (showForgot) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#0f0f13' }} contentContainerStyle={styles.container}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}><Text style={{ fontSize: 40 }}>💸</Text></View>
          <Text style={styles.appName}>MoneyFlowX</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#1a1a2e', borderColor: '#2e2e4a' }]}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
          {forgotSent ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Reset link sent! Check your email.</Text>
            </View>
          ) : (
            <>
              <Input label="Email" colors={{ ...colors, card: '#0f0f1a', border: '#2e2e4a', text: '#fff', textMuted: '#555570', textSub: '#8080a0' }}
                value={forgotEmail} onChangeText={setForgotEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
              <Btn title={forgotLoading ? 'Sending...' : 'Send Reset Link'} onPress={handleForgot} disabled={forgotLoading}
                colors={{ accent: '#7c6bef', text: '#fff' }} />
            </>
          )}
          <TouchableOpacity onPress={() => { setShowForgot(false); setForgotSent(false) }} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: '#7c6bef', fontWeight: '600' }}>← Back to login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f0f13' }} contentContainerStyle={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}><Text style={{ fontSize: 40 }}>💸</Text></View>
        <Text style={styles.appName}>MoneyFlowX</Text>
        <Text style={styles.tagline}>Smart Finance, Simplified</Text>
      </View>
      <View style={[styles.card, { backgroundColor: '#1a1a2e', borderColor: '#2e2e4a' }]}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        <Input label="Email" colors={{ ...colors, card: '#0f0f1a', border: '#2e2e4a', text: '#fff', textMuted: '#555570', textSub: '#8080a0' }}
          value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        {/* Password with eye */}
        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: '#8080a0', fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</Text>
          <View style={{ position: 'relative' }}>
            <Input label="" colors={{ ...colors, card: '#0f0f1a', border: '#2e2e4a', text: '#fff', textMuted: '#555570', textSub: '#8080a0' }}
              value={form.password} onChangeText={v => setForm({ ...form, password: v })}
              secureTextEntry={!showPass} placeholder="••••••••" style={{ paddingRight: 48 }} />
            <TouchableOpacity onPress={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 14, top: 14 }}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowForgot(true)} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
          <Text style={{ color: '#7c6bef', fontSize: 12, fontWeight: '600' }}>Forgot password?</Text>
        </TouchableOpacity>
        <Btn title={loading ? 'Signing in...' : 'Sign In'} onPress={handleLogin} disabled={loading} colors={{ accent: '#7c6bef', text: '#fff' }} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: '#555570', fontSize: 13 }}>
            Don't have an account? <Text style={{ color: '#7c6bef', fontWeight: '600' }}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 22, backgroundColor: '#1a1a2e', borderWidth: 2, borderColor: '#7c6bef', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  appName: { color: '#fff', fontSize: 24, fontWeight: '800' },
  tagline: { color: '#555570', fontSize: 13, marginTop: 4 },
  card: { width: '100%', borderRadius: 20, padding: 24, borderWidth: 1 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#555570', fontSize: 13, marginBottom: 20 },
  successBox: { backgroundColor: '#0d2d1f', borderRadius: 10, padding: 14, marginBottom: 16 },
  successText: { color: '#2dd883', fontSize: 14, fontWeight: '500' },
})
