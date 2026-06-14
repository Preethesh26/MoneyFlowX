import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import HomeScreen from '../screens/HomeScreen'
import ExpensesScreen from '../screens/ExpensesScreen'
import BanksScreen from '../screens/BanksScreen'
import TransfersScreen from '../screens/TransfersScreen'
import MoreStack from './MoreStack'

const Tab = createBottomTabNavigator()

const TabIcon = ({ emoji, focused, color }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
)

export default function BottomTabNavigator() {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="🏠" {...p} /> }} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="💳" {...p} /> }} />
      <Tab.Screen name="Banks" component={BanksScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="🏦" {...p} /> }} />
      <Tab.Screen name="Bank Transfers" component={TransfersScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="🔄" {...p} /> }} />
      <Tab.Screen name="More" component={MoreStack} options={{ tabBarIcon: (p) => <TabIcon emoji="⋯" {...p} /> }} />
    </Tab.Navigator>
  )
}
