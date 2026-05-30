import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Btn } from '../components/UI'

const menuItems = [
  { icon: '🎯', label: 'Goals', desc: 'Track savings goals', screen: 'Goals', color: '#43e97b' },
  { icon: '📋', label: 'EMI', desc: 'Manage loan EMIs', screen: 'EMI', color: '#ff6584' },
  { icon: '📈', label: 'SIP', desc: 'Track SIP investments', screen: 'SIP', color: '#4facfe' },
  { icon: '📝', label: 'Notes', desc: 'Reminders & notes', screen: 'Notes', color: '#f7971e' },
  { icon: '📊', label: 'Analytics', desc: 'Spending insights', screen: 'Analytics', color: '#a855f7' },
]

export default function MoreScreen({ navigation }) {
  const { currentUser, logout } = useAuth()
  const { colors, theme, toggleTheme: themeToggle } = useTheme()
  const insets = useSafeAreaInsets()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}>
      {/* Profile card */}
      <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>{currentUser?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{currentUser?.name}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{currentUser?.email}</Text>
        </View>
      </View>

      {/* Theme toggle */}
      <TouchableOpacity onPress={themeToggle}
        style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 22 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</Text>
        </View>
        <Text style={{ color: colors.textMuted }}>›</Text>
      </TouchableOpacity>

      {/* Menu items */}
      <View style={{ marginBottom: 20 }}>
        {menuItems.map(item => (
          <TouchableOpacity key={item.screen} onPress={() => navigation.navigate(item.screen)}
            style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${item.color}22`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <View>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{item.label}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.desc}</Text>
              </View>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Btn title="🚪 Logout" variant="danger" onPress={handleLogout} colors={colors} />
    </ScrollView>
  )
}
