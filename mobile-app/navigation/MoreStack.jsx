import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../context/ThemeContext'
import MoreScreen from '../screens/MoreScreen'
import GoalsScreen from '../screens/GoalsScreen'
import EMIScreen from '../screens/EMIScreen'
import SIPScreen from '../screens/SIPScreen'
import NotesScreen from '../screens/NotesScreen'
import AnalyticsScreen from '../screens/AnalyticsScreen'

const Stack = createNativeStackNavigator()

export default function MoreStack() {
  const { colors } = useTheme()
  const headerStyle = {
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
  }
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="MoreHome" component={MoreScreen} options={{ title: 'More', headerShown: false }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'Goals' }} />
      <Stack.Screen name="EMI" component={EMIScreen} options={{ title: 'EMI Tracker' }} />
      <Stack.Screen name="SIP" component={SIPScreen} options={{ title: 'SIP Tracker' }} />
      <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Notes' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
    </Stack.Navigator>
  )
}
