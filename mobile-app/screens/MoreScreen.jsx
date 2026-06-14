import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const BG='#080810';const CARD='#13131e';const BORDER='#1a1a28';const MUTED='#50507a';const TEXT='#f2f2fa'

const menuItems = [
  { icon: '🎯', label: 'Goals', desc: 'Track savings goals', screen: 'Goals', color: '#10b981' },
  { icon: '📋', label: 'EMI', desc: 'Manage loan EMIs', screen: 'EMI', color: '#f43f5e' },
  { icon: '📈', label: 'SIP', desc: 'Track investments', screen: 'SIP', color: '#06b6d4' },
  { icon: '📝', label: 'Notes', desc: 'Reminders & notes', screen: 'Notes', color: '#f97316' },
  { icon: '◻', label: 'Analytics', desc: 'Spending insights', screen: 'Analytics', color: '#8b5cf6' },
]

export default function MoreScreen({ navigation }) {
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const initial = currentUser?.name?.charAt(0).toUpperCase() || '?'

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={s.headerBar}>
        <Text style={s.headerTitle}>More</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatar}><Text style={s.avatarText}>{initial}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{currentUser?.name}</Text>
            <Text style={s.profileEmail}>{currentUser?.email}</Text>
          </View>
        </View>

        {/* Theme toggle */}
        <TouchableOpacity onPress={toggleTheme} style={[s.menuItem, { marginBottom: 8 }]}>
          <View style={[s.menuIcon, { backgroundColor: 'rgba(251,191,36,0.1)' }]}>
            <Text style={{ fontSize: 18 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.menuLabel}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</Text>
            <Text style={s.menuDesc}>Switch theme</Text>
          </View>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={s.sectionLabel}>Features</Text>

        {menuItems.map(item => (
          <TouchableOpacity key={item.screen} onPress={() => navigation.navigate(item.screen)} style={s.menuItem}>
            <View style={[s.menuIcon, { backgroundColor: `${item.color}15` }]}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => logout()} style={s.signOutBtn}>
          <Text style={s.signOutText}>↩  Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  headerBar: { padding: 16, paddingBottom: 8 },
  headerTitle: { color: TEXT, fontSize: 22, fontWeight: '800' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: CARD, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: BORDER, marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 18 },
  profileName: { color: TEXT, fontWeight: '700', fontSize: 15 },
  profileEmail: { color: MUTED, fontSize: 12, marginTop: 2 },
  sectionLabel: { color: MUTED, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  menuLabel: { color: TEXT, fontWeight: '600', fontSize: 15 },
  menuDesc: { color: MUTED, fontSize: 12, marginTop: 1 },
  arrow: { color: MUTED, fontSize: 20 },
  signOutBtn: { backgroundColor: 'rgba(244,63,94,0.08)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.15)', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 12 },
  signOutText: { color: '#f87171', fontWeight: '700', fontSize: 15 },
})
